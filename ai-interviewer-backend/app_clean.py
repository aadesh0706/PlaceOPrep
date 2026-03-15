from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import json
import base64
import os
from dotenv import load_dotenv
from groq import Groq
import requests
from sarvamai import AsyncSarvamAI

load_dotenv(override=True)

app = Flask(__name__)
CORS(app)

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')
sarvam_client = AsyncSarvamAI(api_subscription_key=SARVAM_API_KEY)

sessions = {}
active_transcriptions = {}

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        role = data.get('Role Applied for', '')
        company = data.get('Company Name', '')
        difficulty = data.get('Difficulty Level', '')
        duration = data.get('Duration', '')
        format_type = data.get('Format', 'Technical')
        
        prompt = f"""Generate {duration} interview questions for a {role} position at {company}.
Difficulty: {difficulty}
Format: {format_type}

Return ONLY a JSON array with this structure:
[{{"question": "question text", "ideal_answer": "answer text"}}, ...]

No markdown, no explanation, just the JSON array."""

        print(f"Generating questions for {role} at {company}...")
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        print(f"Groq response length: {len(content)}")
        print(f"First 200 chars: {content[:200]}")
        
        # Remove markdown if present
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        if not content:
            return jsonify({"success": False, "error": "Empty response from Groq"}), 500
        
        questions = json.loads(content)
        session_id = f"session_{len(sessions) + 1}"
        sessions[session_id] = {
            "session_id": session_id,
            "role": role,
            "company": company,
            "difficulty": difficulty,
            "questions": questions,
            "qa": [{"question": q["question"], "ideal_answer": q["ideal_answer"], "candidate_answer": ""} for q in questions]
        }
        
        print(f"Generated {len(questions)} questions")
        return jsonify({"success": True, "questions": questions, "session_id": session_id})
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/speak-question', methods=['POST'])
def speak_question():
    try:
        question = request.json.get('question', '')
        print(f"TTS Request for: {question[:50]}...")
        
        response = requests.post(
            'https://api.sarvam.ai/text-to-speech',
            headers={'api-subscription-key': SARVAM_API_KEY},
            json={
                'inputs': [question],
                'target_language_code': 'en-IN',
                'speaker': 'priya',
                'speech_sample_rate': 16000,
                'model': 'bulbul:v3'
            },
            timeout=30
        )
        
        print(f"Sarvam TTS Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            audio = result.get('audios', [None])[0]
            if audio:
                return jsonify({"success": True, "audio": audio})
            else:
                return jsonify({"success": False, "error": "No audio in response"}), 500
        else:
            print(f"Sarvam TTS Error: {response.text}")
            return jsonify({"success": False, "error": f"API error: {response.status_code}"}), 500
            
    except Exception as e:
        print(f"TTS ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/start-streaming', methods=['POST'])
def start_streaming():
    data = request.json
    session_id = data['session_id']
    question_index = data['question_index']
    
    active_transcriptions[session_id] = {
        'question_index': question_index,
        'transcript': '',
        'ws': None
    }
    
    return jsonify({"success": True})

@app.route('/stream-audio', methods=['POST'])
def stream_audio():
    data = request.json
    session_id = data['session_id']
    audio_base64 = data['audio']
    
    # Safe session creation
    if session_id not in active_transcriptions:
        active_transcriptions[session_id] = {
            'question_index': 0,
            'transcript': ''
        }
    
    # Process through Sarvam WebSocket
    transcript = asyncio.run(send_to_sarvam(audio_base64))
    
    if transcript:
        active_transcriptions[session_id]['transcript'] += ' ' + transcript
    
    return jsonify({
        "success": True,
        "transcript": transcript,
        "full_transcript": active_transcriptions[session_id]['transcript'].strip()
    })

@app.route('/stop-streaming', methods=['POST'])
def stop_streaming():
    session_id = request.json['session_id']
    
    if session_id not in active_transcriptions:
        return jsonify({"success": False}), 400
    
    data = active_transcriptions[session_id]
    final_transcript = data['transcript'].strip()
    
    # Save to session
    sessions[session_id]['qa'][data['question_index']]['candidate_answer'] = final_transcript
    
    del active_transcriptions[session_id]
    
    return jsonify({"success": True, "final_transcript": final_transcript})

async def send_to_sarvam(audio_base64):
    """Send audio to Sarvam using SDK"""
    try:
        # audio_base64 is already a base64 string from frontend
        async with sarvam_client.speech_to_text_streaming.connect(
            model="saaras:v3",
            mode="transcribe",
            language_code="en-IN"
        ) as ws:
            result = await ws.transcribe(
                audio=audio_base64,
                encoding="audio/wav",
                sample_rate=16000
            )
            
            # Safe result handling
            if result and isinstance(result, dict):
                return result.get('transcript', '')
            return ''
            
    except Exception as e:
        print(f'Sarvam error: {e}')
        import traceback
        traceback.print_exc()
    
    return ''

@app.route('/generate-report', methods=['POST'])
def generate_report():
    try:
        session_id = request.json['session_id']
        session = sessions[session_id]
        
        prompt = "Analyze interview:\n"
        for qa in session['qa']:
            prompt += f"\nQ: {qa['question']}\nIdeal: {qa['ideal_answer']}\nCandidate: {qa['candidate_answer']}\n"
        prompt += "\nReturn JSON with score, feedback, strategies."
        
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```json'):
            content = content[7:-3]
        
        return jsonify({"success": True, "report": json.loads(content.strip())})
    except Exception as e:
        print(f"REPORT ERROR: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
