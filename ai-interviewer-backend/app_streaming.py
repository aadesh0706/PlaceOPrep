from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from groq import Groq
from dotenv import load_dotenv
import os
import uuid
import json
from datetime import datetime
import requests
import asyncio
from streaming_stt import StreamingTranscriber

# Force reload .env
load_dotenv(override=True)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Initialize clients
print(f"Loading API keys...")
groq_api_key = os.getenv("GROQ_API_KEY")
sarvam_api_key = os.getenv("SARVAM_API_KEY")

print(f"Groq API Key: {groq_api_key[:20]}..." if groq_api_key else "Groq API Key: NOT FOUND")
print(f"Sarvam API Key: {sarvam_api_key[:20]}..." if sarvam_api_key else "Sarvam API Key: NOT FOUND")

groq_client = Groq(api_key=groq_api_key)
transcriber = StreamingTranscriber(sarvam_api_key)

# In-memory session storage
sessions = {}
active_transcriptions = {}

# ========================================
# STREAMING TRANSCRIPTION (WebSocket)
# ========================================

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {'status': 'ready'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")
    # Clean up any active transcription
    if request.sid in active_transcriptions:
        del active_transcriptions[request.sid]

@socketio.on('start_transcription')
def handle_start_transcription(data):
    """Initialize transcription session"""
    session_id = data.get('session_id')
    question_index = data.get('question_index', 0)
    
    if not session_id or session_id not in sessions:
        emit('error', {'message': 'Invalid session'})
        return
    
    # Initialize transcription buffer for this client
    active_transcriptions[request.sid] = {
        'session_id': session_id,
        'question_index': question_index,
        'audio_chunks': [],
        'transcript': ''
    }
    
    print(f"Started transcription for session {session_id}, question {question_index}")
    emit('transcription_started', {'status': 'recording'})

@socketio.on('audio_chunk')
def handle_audio_chunk(data):
    """Receive audio chunk from frontend"""
    if request.sid not in active_transcriptions:
        emit('error', {'message': 'Transcription not started'})
        return
    
    audio_base64 = data.get('audio')
    if audio_base64:
        active_transcriptions[request.sid]['audio_chunks'].append(audio_base64)

@socketio.on('stop_transcription')
def handle_stop_transcription():
    """Process accumulated audio and get final transcript"""
    if request.sid not in active_transcriptions:
        emit('error', {'message': 'No active transcription'})
        return
    
    transcription_data = active_transcriptions[request.sid]
    audio_chunks = transcription_data['audio_chunks']
    session_id = transcription_data['session_id']
    question_index = transcription_data['question_index']
    
    print(f"Processing {len(audio_chunks)} audio chunks...")
    
    def transcript_callback(message):
        """Send real-time updates to frontend"""
        emit('transcript_update', message)
    
    # Run async transcription
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        final_transcript = loop.run_until_complete(
            transcriber.transcribe_stream(audio_chunks, transcript_callback)
        )
        
        # Store in session
        question = sessions[session_id]['questions'][question_index]
        sessions[session_id]['answers'].append({
            'question': question['question'],
            'ideal_answer': question['ideal_answer'],
            'candidate_answer': final_transcript,
            'question_index': question_index
        })
        
        emit('transcription_complete', {
            'transcript': final_transcript,
            'success': True
        })
        
        # Clean up
        del active_transcriptions[request.sid]
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        emit('error', {'message': str(e)})
    finally:
        loop.close()

# ========================================
# REST ENDPOINTS (Keep existing)
# ========================================

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.json
    
    role = data.get('Role Applied for', '')
    company = data.get('Company Name', '')
    difficulty = data.get('Difficulty Level', '')
    duration = data.get('Duration', '')
    
    question_map = {'15': 5, '30': 10, '45': 15, '60': 20}
    num_questions = question_map.get(duration, 10)
    
    prompt = f"""Generate {num_questions} interview questions with ideal answers for the role of {role} at {company}.
Difficulty: {difficulty}
Duration: {duration} minutes

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "question": "question text here",
    "ideal_answer": "detailed ideal answer here"
  }}
]

No additional text, just the JSON array."""
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        start = response_text.find('[')
        end = response_text.rfind(']') + 1
        json_text = response_text[start:end]
        questions = json.loads(json_text)
        
        print(f"\n{'='*50}")
        print("GENERATED QUESTIONS:")
        print(f"{'='*50}")
        for i, q in enumerate(questions, 1):
            print(f"\nQ{i}: {q['question']}")
            print(f"A{i}: {q['ideal_answer']}")
        print(f"\n{'='*50}\n")
        
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            'questions': questions,
            'answers': [],
            'metadata': {
                'role': role,
                'company': company,
                'difficulty': difficulty,
                'duration': duration,
                'created_at': datetime.now().isoformat()
            }
        }
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'questions': questions
        })
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/speak-question', methods=['POST'])
def speak_question():
    data = request.json
    question_text = data.get('question', '')
    
    if not question_text:
        return jsonify({'success': False, 'error': 'No question text provided'}), 400
    
    try:
        url = "https://api.sarvam.ai/text-to-speech"
        
        headers = {
            "api-subscription-key": sarvam_api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "text": question_text,
            "target_language_code": "en-IN"
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            audio_base64 = result.get('audios', [None])[0]
            
            if audio_base64:
                return jsonify({
                    'success': True,
                    'audio': audio_base64
                })
            else:
                return jsonify({'success': False, 'error': 'No audio in response'}), 500
        else:
            return jsonify({
                'success': False,
                'error': f'Sarvam API error: {response.status_code}',
                'details': response.text
            }), 500
            
    except Exception as e:
        print(f"TTS ERROR: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'error': 'Invalid session'}), 400
    
    session = sessions[session_id]
    answers = session['answers']
    metadata = session['metadata']
    
    qa_text = "\n\n".join([
        f"""Question {i+1}: {ans['question']}
Ideal Answer: {ans['ideal_answer']}
Candidate Answer: {ans['candidate_answer']}"""
        for i, ans in enumerate(answers)
    ])
    
    prompt = f"""You are an expert interview evaluator. Analyze this interview for a {metadata['role']} position at {metadata['company']}.

{qa_text}

Provide a comprehensive evaluation in this EXACT JSON format:
{{
  "overall_score": "percentage as number (0-100)",
  "confidence_level": "High/Medium/Low with percentage",
  "core_strength": "main strength identified",
  "speaking_pace": "words per minute estimate",
  "what_went_well": ["point 1", "point 2", "point 3"],
  "areas_for_improvement": ["point 1", "point 2", "point 3"],
  "next_session_strategy": ["strategy 1", "strategy 2", "strategy 3"],
  "detailed_feedback": [
    {{
      "question": "question text",
      "sentiment": "Positive/Neutral/Negative",
      "what_went_well": ["point 1", "point 2"],
      "how_to_improve": ["point 1", "point 2"]
    }}
  ]
}}

Return ONLY valid JSON, no additional text."""
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        start = response_text.find('{')
        end = response_text.rfind('}') + 1
        json_text = response_text[start:end]
        report = json.loads(json_text)
        
        sessions[session_id]['report'] = report
        
        return jsonify({
            'success': True,
            'report': report
        })
        
    except Exception as e:
        print(f"REPORT ERROR: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    if session_id not in sessions:
        return jsonify({'success': False, 'error': 'Session not found'}), 404
    
    return jsonify({
        'success': True,
        'session': sessions[session_id]
    })

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
