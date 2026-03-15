from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import os
import uuid
import json
from datetime import datetime
import requests
from tavus_integration import tavus_bp

# Force reload .env
load_dotenv(override=True)

app = Flask(__name__)
CORS(app)

# Register Tavus blueprint
app.register_blueprint(tavus_bp)

# Initialize clients
print(f"Loading API keys...")
print(f"Current directory: {os.getcwd()}")
print(f".env file exists: {os.path.exists('.env')}")

groq_api_key = os.getenv("GROQ_API_KEY")
sarvam_api_key = os.getenv("SARVAM_API_KEY")

print(f"Groq API Key: {groq_api_key[:20]}..." if groq_api_key else "Groq API Key: NOT FOUND")
print(f"Sarvam API Key: {sarvam_api_key[:20]}..." if sarvam_api_key else "Sarvam API Key: NOT FOUND")

groq_client = Groq(api_key=groq_api_key)

# In-memory session storage (use Redis/DB in production)
sessions = {}

# ========================================
# PART 1: QUESTION GENERATION (Groq)
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
        
        # Extract JSON from response
        start = response_text.find('[')
        end = response_text.rfind(']') + 1
        json_text = response_text[start:end]
        questions = json.loads(json_text)
        
        # Print generated questions to console
        print(f"\n{'='*50}")
        print("GENERATED QUESTIONS:")
        print(f"{'='*50}")
        for i, q in enumerate(questions, 1):
            print(f"\nQ{i}: {q['question']}")
            print(f"A{i}: {q['ideal_answer']}")
        print(f"\n{'='*50}\n")
        
        # Create session
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

# ========================================
# PART 2: TEXT-TO-SPEECH (Sarvam AI)
# ========================================

@app.route('/speak-question', methods=['POST'])
def speak_question():
    data = request.json
    question_text = data.get('question', '')
    
    if not question_text:
        return jsonify({'success': False, 'error': 'No question text provided'}), 400
    
    print(f"\n{'='*50}")
    print(f"TTS REQUEST: {question_text}")
    print(f"{'='*50}\n")
    
    try:
        # Direct API call to Sarvam
        url = "https://api.sarvam.ai/text-to-speech"
        
        headers = {
            "api-subscription-key": sarvam_api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "text": question_text,
            "target_language_code": "en-IN"
        }
        
        print(f"Calling Sarvam API...")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            audio_base64 = result.get('audios', [None])[0]
            
            if audio_base64:
                print(f"Audio generated successfully")
                return jsonify({
                    'success': True,
                    'audio': audio_base64
                })
            else:
                return jsonify({'success': False, 'error': 'No audio in response'}), 500
        else:
            print(f"Sarvam API Error: {response.text}")
            return jsonify({
                'success': False,
                'error': f'Sarvam API error: {response.status_code}',
                'details': response.text
            }), 500
            
    except Exception as e:
        print(f"TTS ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

# ========================================
# PART 3: SPEECH-TO-TEXT (Groq Whisper)
# ========================================

@app.route('/transcribe-answer', methods=['POST'])
def transcribe_answer():
    if 'audio' not in request.files:
        return jsonify({'success': False, 'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    session_id = request.form.get('session_id')
    question_index = int(request.form.get('question_index', 0))
    
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'error': 'Invalid session'}), 400
    
    try:
        print(f"\n{'='*50}")
        print(f"🎤 STT REQUEST for session: {session_id}")
        print(f"{'='*50}\n")
        
        # Use Groq Whisper for transcription
        audio_content = audio_file.read()
        audio_file.seek(0)
        
        print(f"📤 Sending audio to Groq Whisper...")
        
        transcription = groq_client.audio.transcriptions.create(
            file=(audio_file.filename, audio_content),
            model="whisper-large-v3",
            response_format="json",
            language="en"
        )
        
        transcript = transcription.text
        print(f"✅ Transcript: {transcript}")
        
        # Store answer
        question = sessions[session_id]['questions'][question_index]
        sessions[session_id]['answers'].append({
            'question': question['question'],
            'ideal_answer': question['ideal_answer'],
            'candidate_answer': transcript,
            'question_index': question_index
        })
        
        print(f"💾 Answer stored for question {question_index + 1}")
        
        return jsonify({
            'success': True,
            'transcript': transcript
        })
            
    except Exception as e:
        print(f"❌ STT ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fallback: store placeholder answer
        try:
            question = sessions[session_id]['questions'][question_index]
            transcript = '[Transcription failed - please try again]'
            sessions[session_id]['answers'].append({
                'question': question['question'],
                'ideal_answer': question['ideal_answer'],
                'candidate_answer': transcript,
                'question_index': question_index
            })
            return jsonify({
                'success': True,
                'transcript': transcript
            })
        except:
            pass
        
        return jsonify({'success': False, 'error': str(e)}), 500

# ========================================
# PART 4: REPORT GENERATION (Groq)
# ========================================

@app.route('/generate-report', methods=['POST'])
def generate_report():
    data = request.json
    session_id = data.get('session_id')
    
    if not session_id or session_id not in sessions:
        return jsonify({'success': False, 'error': 'Invalid session'}), 400
    
    session = sessions[session_id]
    answers = session['answers']
    metadata = session['metadata']
    
    # Return simple report with Q&A format
    report = {
        'qa': answers,
        'feedback': f"Interview completed for {metadata['role']} at {metadata['company']}. Total questions answered: {len(answers)}"
    }
    
    # Store report
    sessions[session_id]['report'] = report
    
    return jsonify({
        'success': True,
        'report': report
    })

# ========================================
# UTILITY ENDPOINTS
# ========================================

@app.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    if session_id not in sessions:
        return jsonify({'success': False, 'error': 'Session not found'}), 404
    
    return jsonify({
        'success': True,
        'session': sessions[session_id]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
