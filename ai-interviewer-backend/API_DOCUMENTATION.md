# AI Interview System - Backend API Documentation

## Architecture Overview

```
Frontend → Flask Backend → Groq (Questions/Evaluation)
                        → Sarvam AI (Voice TTS/STT)
```

## Environment Setup

```bash
pip install -r requirements.txt
```

Add to `.env`:
```
GROQ_API_KEY=your_groq_key
SARVAM_API_KEY=your_sarvam_key
```

## API Endpoints

### 1. Generate Questions (Groq)
**POST** `/generate-questions`

**Request:**
```json
{
  "Role Applied for": "Frontend Engineer",
  "Company Name": "Google",
  "Difficulty Level": "Intermediate",
  "Duration": "30"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "uuid-here",
  "questions": [
    {
      "question": "Tell me about...",
      "ideal_answer": "A good answer would..."
    }
  ]
}
```

---

### 2. Text-to-Speech (Sarvam AI)
**POST** `/speak-question`

**Request:**
```json
{
  "question": "Tell me about your experience with React?"
}
```

**Response:**
```json
{
  "success": true,
  "audio": "base64_encoded_audio_string"
}
```

**Frontend Usage:**
```javascript
const audio = new Audio(`data:audio/wav;base64,${response.audio}`)
audio.play()
```

---

### 3. Speech-to-Text (Sarvam AI)
**POST** `/transcribe-answer`

**Request:** (multipart/form-data)
- `audio`: Audio file (wav/mp3)
- `session_id`: Session UUID
- `question_index`: Question number (0-based)

**Response:**
```json
{
  "success": true,
  "transcript": "In my previous role at..."
}
```

**Frontend Usage:**
```javascript
const formData = new FormData()
formData.append('audio', audioBlob, 'answer.wav')
formData.append('session_id', sessionId)
formData.append('question_index', currentIndex)

fetch('/transcribe-answer', {
  method: 'POST',
  body: formData
})
```

---

### 4. Generate Report (Groq)
**POST** `/generate-report`

**Request:**
```json
{
  "session_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "overall_score": "82",
    "confidence_level": "High (91%)",
    "core_strength": "Technical Depth",
    "speaking_pace": "135 WPM",
    "what_went_well": ["Clear structure", "Good examples"],
    "areas_for_improvement": ["Add metrics", "More detail"],
    "next_session_strategy": ["Practice STAR", "Improve pacing"],
    "detailed_feedback": [
      {
        "question": "...",
        "sentiment": "Positive",
        "what_went_well": ["..."],
        "how_to_improve": ["..."]
      }
    ]
  }
}
```

---

### 5. Get Session Data
**GET** `/session/<session_id>`

**Response:**
```json
{
  "success": true,
  "session": {
    "questions": [...],
    "answers": [...],
    "metadata": {...},
    "report": {...}
  }
}
```

---

## Session Storage Structure

```python
sessions[session_id] = {
    'questions': [
        {
            'question': 'Question text',
            'ideal_answer': 'Ideal answer'
        }
    ],
    'answers': [
        {
            'question': 'Question text',
            'ideal_answer': 'Ideal answer',
            'candidate_answer': 'Transcribed answer',
            'question_index': 0
        }
    ],
    'metadata': {
        'role': 'Frontend Engineer',
        'company': 'Google',
        'difficulty': 'Intermediate',
        'duration': '30',
        'created_at': '2024-01-01T00:00:00'
    },
    'report': {...}
}
```

---

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details if available"
}
```

---

## Production Considerations

1. **Session Storage**: Replace in-memory dict with Redis or database
2. **File Storage**: Store audio files in S3/cloud storage
3. **Rate Limiting**: Add rate limiting for API calls
4. **Authentication**: Add user authentication
5. **Logging**: Implement proper logging
6. **HTTPS**: Use HTTPS in production
7. **CORS**: Configure CORS for specific domains

---

## Run Server

```bash
python app.py
```

Server runs on: `http://localhost:5000`
