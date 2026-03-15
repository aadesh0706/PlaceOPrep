from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import tempfile
from dotenv import load_dotenv
from groq import Groq
import requests
from tavus_integration import tavus_bp

try:
    import whisper
    whisper_model = whisper.load_model("base")
    print("✅ Whisper loaded successfully")
except Exception as e:
    whisper_model = None
    print(f"❌ Whisper not available: {e}")

load_dotenv(override=True)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.register_blueprint(tavus_bp)

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')

sessions = {}

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        print('\n🚀 Question generation request received')
        data = request.json
        role = data.get('Role Applied for', '')
        company = data.get('Company Name', '')
        difficulty = data.get('Difficulty Level', '')
        duration = data.get('Duration', '')
        print(f'📝 Role: {role}, Company: {company}, Difficulty: {difficulty}, Duration: {duration}')
        
        # Calculate number of questions based on duration (assume 3 minutes per question)
        num_questions = max(1, int(duration) // 3)
        print(f'🔢 Generating {num_questions} questions...')
        
        prompt = f"""You are an interview question generator. Generate exactly {num_questions} technical interview questions.

Role: {role}
Company: {company}
Difficulty: {difficulty}
Duration: {duration} minutes

IMPORTANT: Return ONLY valid JSON array format. No extra text, no explanations.

Format:
[
  {{"question": "question text here", "ideal_answer": "answer text here"}},
  {{"question": "question text here", "ideal_answer": "answer text here"}}
]

Generate {num_questions} questions now:"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Clean up markdown code blocks
        if content.startswith('```json'):
            content = content[7:]
        elif content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        # Try to parse JSON
        try:
            questions = json.loads(content)
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Content: {content[:500]}...")
            # Try to fix common issues
            content = content.replace("'", '"')  # Replace single quotes
            content = content.replace('\n', ' ')  # Remove newlines
            questions = json.loads(content)
        
        # Ensure all questions have ideal_answer
        for q in questions:
            if "ideal_answer" not in q:
                q["ideal_answer"] = "No ideal answer provided"
        
        session_id = f"session_{len(sessions) + 1}"
        sessions[session_id] = {
            "session_id": session_id,
            "role": role,
            "company": company,
            "questions": questions,
            "qa": [{"question": q["question"], "ideal_answer": q["ideal_answer"], "candidate_answer": ""} for q in questions]
        }
        
        print(f'✅ Generated {len(questions)} questions')
        print(f'📋 Session ID: {session_id}')
        for i, q in enumerate(questions):
            print(f'  Q{i+1}: {q["question"][:60]}...')
        
        return jsonify({"success": True, "questions": questions, "session_id": session_id})
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/speak-question', methods=['POST'])
def speak_question():
    try:
        question = request.json.get('question', '')
        
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
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            audio = result.get('audios', [None])[0]
            if audio:
                return jsonify({"success": True, "audio": audio})
        
        return jsonify({"success": False, "error": "TTS failed"}), 200
    except Exception as e:
        print(f"TTS ERROR: {e}")
        return jsonify({"success": False, "error": str(e)}), 200

@app.route('/generate-report', methods=['POST'])
def generate_report():
    try:
        print('\n📊 Report generation request received')
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        session_id = data.get('session_id')
        print(f'📋 Session ID: {session_id}')
        if not session_id:
            return jsonify({'success': False, 'error': 'No session_id provided'}), 400
        
        if session_id not in sessions:
            print(f'❌ Session not found: {session_id}')
            return jsonify({'success': False, 'error': f'Session {session_id} not found'}), 404
        
        session = sessions[session_id]
        print(f'✅ Session found with {len(session["qa"])} Q&A pairs')
        
        for i, qa in enumerate(session['qa']):
            print(f'  Q{i+1}: {qa["question"][:50]}...')
            print(f'       Answer: {qa["candidate_answer"][:50] if qa["candidate_answer"] else "(empty)"}...')
        
        return jsonify({
            'success': True, 
            'report': {
                'qa': session['qa'],
                'feedback': 'Interview completed successfully'
            }
        })
    except Exception as e:
        print(f"❌ REPORT ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/transcribe-answer', methods=['POST'])
def transcribe_answer():
    try:
        print('\n🎯 Transcription request received')
        audio_file = request.files.get('audio')
        if not audio_file:
            print('❌ No audio file')
            return jsonify({'success': False, 'error': 'No audio file'}), 400
            
        session_id = request.form.get('session_id')
        question_index = int(request.form.get('question_index', 0))
        print(f'📋 Session: {session_id}, Question: {question_index}')
        
        try:
            # Save to temp file first
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
                audio_file.save(tmp.name)
                tmp_path = tmp.name
            
            file_size = os.path.getsize(tmp_path)
            print(f'📦 Audio file size: {file_size} bytes')
            
            if file_size < 100:
                print('❌ Audio file too small')
                os.unlink(tmp_path)
                return jsonify({'success': False, 'transcript': ''})
            
            print('🔄 Calling Groq Whisper API...')
            with open(tmp_path, 'rb') as audio:
                transcription = groq_client.audio.transcriptions.create(
                    file=("audio.webm", audio.read()),
                    model="whisper-large-v3",
                    response_format="verbose_json"
                )
            
            os.unlink(tmp_path)
            
            transcript = transcription.text if hasattr(transcription, 'text') else str(transcription)
            transcript = transcript.strip()
            print(f'✅ Transcript: "{transcript}"')
            
        except Exception as e:
            print(f'❌ Whisper error: {e}')
            import traceback
            traceback.print_exc()
            transcript = ""
        
        if session_id in sessions and transcript:
            sessions[session_id]['qa'][question_index]['candidate_answer'] = transcript
            print(f'💾 Saved to session')
        
        return jsonify({'success': True, 'transcript': transcript})
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
