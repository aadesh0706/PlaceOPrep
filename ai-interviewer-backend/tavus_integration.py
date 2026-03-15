from flask import Blueprint, jsonify, request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

tavus_bp = Blueprint('tavus', __name__)

TAVUS_API_KEY = os.getenv('TAVUS_API_KEY')
TAVUS_REPLICA_ID = os.getenv('TAVUS_REPLICA_ID')
TAVUS_PERSONA_ID = os.getenv('TAVUS_PERSONA_ID')

conversations = {}

@tavus_bp.route('/api/tavus/start', methods=['POST'])
def start_tavus_conversation():
    try:
        print('\n🎥 Tavus start request received')
        data = request.json
        role = data.get('role', 'Software Engineer')
        company = data.get('company', 'Tech Company')
        difficulty = data.get('difficulty', 'Intermediate')
        session_id = data.get('session_id')
        num_questions = data.get('num_questions', 5)
        
        print(f'📝 Role: {role}, Company: {company}, Questions: {num_questions}')
        print(f'🔑 API Key: {TAVUS_API_KEY[:10]}...' if TAVUS_API_KEY else '❌ No API Key')
        print(f'🎭 Replica ID: {TAVUS_REPLICA_ID}')
        print(f'👤 Persona ID: {TAVUS_PERSONA_ID}')
        
        custom_prompt = f"""You are an AI interviewer for a {role} position at {company}. Difficulty: {difficulty}.

Conduct the interview by asking exactly {num_questions} technical questions.

Rules:
1. Ask ONE question at a time
2. Wait for candidate response
3. After {num_questions} questions, end the interview
4. Keep questions concise and relevant

Start with a brief intro and first question."""
        
        headers = {
            'x-api-key': TAVUS_API_KEY,
            'Content-Type': 'application/json'
        }
        
        payload = {
            'replica_id': TAVUS_REPLICA_ID,
            'persona_id': TAVUS_PERSONA_ID,
            'custom_greeting': custom_prompt
        }
        
        print('🔄 Calling Tavus API...')
        response = requests.post(
            'https://tavusapi.com/v2/conversations',
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f'📊 Tavus API status: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            conv_id = result.get('conversation_id')
            conv_url = result.get('conversation_url')
            print(f'✅ Conversation created: {conv_id}')
            print(f'🔗 URL: {conv_url}')
            conversations[conv_id] = {'role': role, 'company': company, 'session_id': session_id, 'num_questions': num_questions}
            return jsonify({
                'success': True,
                'conversation_id': conv_id,
                'conversation_url': conv_url
            })
        else:
            error_msg = response.text
            print(f'❌ Tavus API error: {response.status_code}')
            print(f'❌ Error details: {error_msg}')
            return jsonify({
                'success': False,
                'error': f'Tavus API error: {response.status_code} - {error_msg}'
            }), 500
            
    except Exception as e:
        print(f'❌ Tavus exception: {e}')
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@tavus_bp.route('/api/tavus/send-message', methods=['POST'])
def send_message():
    try:
        data = request.json
        conv_id = data.get('conversation_id')
        message = data.get('message')
        
        response = requests.post(
            f'https://tavusapi.com/v2/conversations/{conv_id}',
            headers={
                'x-api-key': TAVUS_API_KEY,
                'Content-Type': 'application/json'
            },
            json={'message': message}
        )
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
