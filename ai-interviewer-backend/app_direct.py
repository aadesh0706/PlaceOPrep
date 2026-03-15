from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
from groq import Groq
import requests

load_dotenv(override=True)

app = Flask(__name__)
CORS(app)

groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
SARVAM_API_KEY = os.getenv('SARVAM_API_KEY')

sessions = {}

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.json
        role = data.get('Role Applied for', '')
        company = data.get('Company Name', '')
        difficulty = data.get('Difficulty Level', '')
        duration = data.get('Duration', '')
        
        # Map duration to number of questions
        num_questions = {'15': 5, '30': 10, '45': 15, '60': 20}.get(duration, 5)
        
        prompt = f"""Generate exactly {num_questions} interview questions for a {role} position at {company}.
Difficulty: {difficulty}

IMPORTANT: Return ONLY valid JSON array, no extra text.
Format:
[{{"question":"text","ideal_answer":"text"}},{{"question":"text","ideal_answer":"text"}}]

No markdown, no code blocks, just pure JSON."""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )
        
        content = response.choices[0].message.content.strip()
        print(f"Groq raw response: {content[:500]}")
        
        # Clean up response
        if content.startswith('```json'):
            content = content[7:]
        if content.startswith('```'):
            content = content[3:]
        if content.endswith('```'):
            content = content[:-3]
        content = content.strip()
        
        # Find JSON array
        start = content.find('[')
        end = content.rfind(']') + 1
        if start != -1 and end > start:
            content = content[start:end]
        
        print(f"Cleaned content: {content[:500]}")
        
        questions = json.loads(content)
        session_id = f"session_{len(sessions) + 1}"
        sessions[session_id] = {
            "session_id": session_id,
            "role": role,
            "company": company,
            "questions": questions,
            "qa": [{"question": q["question"], "ideal_answer": q["ideal_answer"], "candidate_answer": ""} for q in questions]
        }
        
        return jsonify({"success": True, "questions": questions, "session_id": session_id})
    except json.JSONDecodeError as e:
        print(f"JSON ERROR: {e}")
        print(f"Content that failed: {content}")
        return jsonify({"success": False, "error": f"Invalid JSON from AI: {str(e)}"}), 500
    except Exception as e:
        print(f"ERROR: {e}")
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
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            audio = result.get('audios', [None])[0]
            if audio:
                return jsonify({"success": True, "audio": audio})
        
        return jsonify({"success": False, "error": "TTS failed"}), 500
    except Exception as e:
        print(f"TTS ERROR: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get-sarvam-key', methods=['POST'])
def get_sarvam_key():
    """Return Sarvam API key for direct WebSocket connection"""
    return jsonify({"api_key": SARVAM_API_KEY})

@app.route('/save-transcript', methods=['POST'])
def save_transcript():
    """Save transcript to session"""
    try:
        data = request.json
        session_id = data['session_id']
        question_index = data['question_index']
        transcript = data['transcript']
        
        if session_id in sessions:
            sessions[session_id]['qa'][question_index]['candidate_answer'] = transcript
            return jsonify({"success": True})
        
        return jsonify({"success": False, "error": "Session not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

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
