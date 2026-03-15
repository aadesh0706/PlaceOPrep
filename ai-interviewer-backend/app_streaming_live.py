from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import asyncio
import websockets
import json
import base64
import os
from dotenv import load_dotenv
from groq import Groq
import requests

load_dotenv(override=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize clients
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')

# In-memory session storage
sessions = {}

# Active WebSocket connections to Sarvam
active_sarvam_connections = {}

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.json
    role = data.get('role')
    company = data.get('company')
    difficulty = data.get('difficulty')
    duration = data.get('duration')
    format_type = data.get('format')

    prompt = f"""Generate {duration} interview questions for a {role} position at {company}.
Difficulty: {difficulty}
Format: {format_type}

Return ONLY a JSON array with this exact structure:
[
  {{"question": "question text", "ideal_answer": "ideal answer text"}},
  ...
]"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```json'):
            content = content[7:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        questions = json.loads(content)
        session_id = f"session_{len(sessions) + 1}"
        sessions[session_id] = {
            "session_id": session_id,
            "role": role,
            "company": company,
            "difficulty": difficulty,
            "questions": questions,
            "qa": [{
                "question": q["question"],
                "ideal_answer": q["ideal_answer"],
                "candidate_answer": ""
            } for q in questions]
        }
        
        return jsonify({"success": True, "questions": questions, "session_id": session_id})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/speak-question', methods=['POST'])
def speak_question():
    data = request.json
    question = data.get('question')
    
    try:
        response = requests.post(
            'https://api.sarvam.ai/text-to-speech',
            headers={'api-subscription-key': SARVAM_API_KEY},
            json={
                'inputs': [question],
                'target_language_code': 'en-IN',
                'speaker': 'meera',
                'pitch': 0,
                'pace': 1.0,
                'loudness': 1.5,
                'speech_sample_rate': 16000,
                'enable_preprocessing': True,
                'model': 'bulbul:v1'
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            return jsonify({"success": True, "audio": result['audios'][0]})
        else:
            return jsonify({"success": False, "error": response.text}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.json
    session_id = data.get('session_id')
    
    if session_id not in sessions:
        return jsonify({"success": False, "error": "Session not found"}), 404
    
    session = sessions[session_id]
    
    prompt = f"""Analyze this interview performance:
Role: {session['role']}
Company: {session['company']}

Q&A:
"""
    for qa in session['qa']:
        prompt += f"\nQ: {qa['question']}\nIdeal: {qa['ideal_answer']}\nCandidate: {qa['candidate_answer']}\n"
    
    prompt += "\nProvide: 1) Overall score (0-100), 2) Brief feedback for each answer, 3) Top 3 improvement strategies. Return as JSON."
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```json'):
            content = content[7:]
        if content.endswith('```'):
            content = content[:-3]
        
        report = json.loads(content.strip())
        return jsonify({"success": True, "report": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    # Clean up Sarvam connection if exists
    if request.sid in active_sarvam_connections:
        asyncio.run(cleanup_sarvam_connection(request.sid))

@socketio.on('start_transcription')
def handle_start_transcription(data):
    session_id = data.get('session_id')
    question_index = data.get('question_index')
    
    print(f'Starting transcription for session {session_id}, question {question_index}')
    
    # Store metadata for this client
    active_sarvam_connections[request.sid] = {
        'session_id': session_id,
        'question_index': question_index,
        'transcript': ''
    }
    
    emit('transcription_started', {'success': True})

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    client_id = request.sid
    
    if client_id not in active_sarvam_connections:
        emit('transcription_error', {'error': 'Transcription not started'})
        return
    
    audio_base64 = data.get('audio')
    
    # Send to Sarvam and get transcript
    asyncio.run(process_audio_chunk(client_id, audio_base64))

@socketio.on('stop_transcription')
def handle_stop_transcription():
    client_id = request.sid
    
    if client_id not in active_sarvam_connections:
        return
    
    conn_data = active_sarvam_connections[client_id]
    session_id = conn_data['session_id']
    question_index = conn_data['question_index']
    transcript = conn_data['transcript']
    
    # Save transcript to session
    if session_id in sessions:
        sessions[session_id]['qa'][question_index]['candidate_answer'] = transcript
    
    # Clean up
    asyncio.run(cleanup_sarvam_connection(client_id))
    
    emit('transcription_stopped', {'success': True, 'final_transcript': transcript})

async def process_audio_chunk(client_id, audio_base64):
    """Process audio chunk through Sarvam WebSocket"""
    try:
        uri = f"wss://api.sarvam.ai/speech-to-text/ws?language-code=en-IN"
        headers = {"Api-Subscription-Key": SARVAM_API_KEY}
        
        async with websockets.connect(uri, extra_headers=headers) as websocket:
            # Send audio message
            message = {
                "audio": {
                    "data": audio_base64,
                    "sample_rate": "16000",
                    "encoding": "audio/wav"
                }
            }
            await websocket.send(json.dumps(message))
            
            # Receive transcript
            response = await websocket.recv()
            result = json.loads(response)
            
            if result.get('type') == 'data' and 'data' in result:
                transcript = result['data'].get('transcript', '')
                
                if transcript:
                    # Append to stored transcript
                    active_sarvam_connections[client_id]['transcript'] += ' ' + transcript
                    
                    # Emit to frontend
                    socketio.emit('transcript_update', {
                        'transcript': transcript,
                        'full_transcript': active_sarvam_connections[client_id]['transcript'].strip()
                    }, room=client_id)
    
    except Exception as e:
        print(f'Sarvam WebSocket error: {e}')
        socketio.emit('transcription_error', {'error': str(e)}, room=client_id)

async def cleanup_sarvam_connection(client_id):
    """Clean up connection data"""
    if client_id in active_sarvam_connections:
        del active_sarvam_connections[client_id]

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
