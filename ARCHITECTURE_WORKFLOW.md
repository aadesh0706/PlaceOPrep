# 🎯 System Architecture & Data Flow

## Complete Interview Process Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SKILLSPECTRUM AI INTERVIEW SYSTEM                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  USER STARTS APP │
│  localhost:5173  │
└────────┬─────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  1. FORM SUBMISSION            │
    │  ─────────────────────────────  │
    │  Role: "Software Engineer"    │
    │  Company: "Google"            │
    │  Difficulty: "Intermediate"   │
    │  Duration: 30 min             │
    └────────┬──────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  POST /api/session/create              │
    │  Backend (localhost:8000)              │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  Groq AI: Generate Questions           │
    │  ─────────────────────────────────     │
    │  • Based on role                       │
    │  • Based on company                    │
    │  • Based on difficulty level           │
    │  • Generate 5 tailored questions       │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  Response: session_id + questions[]    │
    │  ─────────────────────────────────     │
    │  {                                     │
    │    "session_id": "sess_123",          │
    │    "questions": [                      │
    │      {                                 │
    │        "id": "q1",                     │
    │        "question": "Tell about....",   │
    │        "category": "behavioral",       │
    │        "difficulty": "Intermediate"    │
    │      },                                │
    │      ... (4 more questions)            │
    │    ]                                   │
    │  }                                     │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────┐
    │  2. INTERVIEW INTERFACE                          │
    │  AIInterviewerLiveNew.jsx                        │
    │  ──────────────────────────────────────────────  │
    │  ┌─────────────┐      ┌──────────────────────┐  │
    │  │ AI Avatar   │      │ Question Display     │  │
    │  │ (Left)      │      │ Confidence: 78%      │  │
    │  │             │      │ Sentiment: Positive  │  │
    │  │ 🎤 Speaking │      │                      │  │
    │  │ "Tell me    │      │ [Start Recording]    │  │
    │  │  about..."  │      │ [Next Question]      │  │
    │  └─────────────┘      │ [Repeat]             │  │
    │                       └──────────────────────┘  │
    │                                                  │
    │  AUTO-PLAYS QUESTION:                           │
    │  • Web Speech API speaks question aloud         │
    │  • User sees text caption                       │
    └────────┬───────────────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │  3. USER RECORDS ANSWER            │
    │  ─────────────────────────────────  │
    │  • User clicks "Start Recording"  │
    │  • Browser requests microphone    │
    │  • Captures audio + transcript    │
    │  • Auto-stops at 30 seconds       │
    │  • Shows real-time text           │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  POST /api/session/{id}/submit-answer  │
    │  Backend (localhost:8000)              │
    │  ─────────────────────────────────     │
    │  {                                     │
    │    "question_id": "q1",               │
    │    "question": "Tell me about...",    │
    │    "user_answer": "I have 5 years..." │
    │    "transcript": "...",               │
    │    "duration": 28.5                   │
    │  }                                     │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  SessionService: Add Answer to Storage │
    │  /sessions/sess_123.json               │
    │  ─────────────────────────────────     │
    │  Stored locally on backend             │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  Groq AI: Evaluate Answer              │
    │  ─────────────────────────────────     │
    │  • Analyze quality                     │
    │  • Calculate confidence score          │
    │  • Detect sentiment                    │
    │  • Generate feedback                   │
    │  • Identify strengths                  │
    │  • Identify improvements               │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  Evaluation Result:                    │
    │  ─────────────────────────────────     │
    │  {                                     │
    │    "score": 78,                        │
    │    "confidence": 82,                   │
    │    "sentiment": "Positive",            │
    │    "strengths": [                      │
    │      "Clear communication",            │
    │      "Relevant experience"             │
    │    ],                                  │
    │    "improvements": [                   │
    │      "Add technical details"           │
    │    ],                                  │
    │    "feedback": "Good answer..."        │
    │  }                                     │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────┐
    │  4. UPDATE FRONTEND WITH METRICS                │
    │  ──────────────────────────────────────────────  │
    │  ┌─────────────────────────────────────────────┐│
    │  │  Answer Submitted ✓                         ││
    │  ├─────────────────────────────────────────────┤│
    │  │                                             ││
    │  │  Confidence: ████████░░░░░░░░░░ 78%        ││
    │  │                                             ││
    │  │  Sentiment: 🟢 POSITIVE                     ││
    │  │                                             ││
    │  │  Score: 78/100                              ││
    │  │  Feedback: "Good answer with room..."       ││
    │  │                                             ││
    │  ├─────────────────────────────────────────────┤│
    │  │  [Next Question]  [Repeat]  [End]           ││
    │  └─────────────────────────────────────────────┘│
    └────────┬───────────────────────────────────────┘
             │
             ├─────────────┐
             │             │
             ▼             ▼
    ┌──────────────┐  LOOP
    │ More Qs?     │  Back to
    │ Yes → Next Q1│  Step 3
    │ No → End     │
    └──────┬───────┘
           │
           ▼
    ┌────────────────────────────────────────┐
    │  5. POST /api/session/end-session      │
    │  Backend marks session as complete    │
    └────────┬──────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────┐
    │  6. GET /api/session/{id}/report      │
    │  Backend generates comprehensive     │
    │  report from all answers             │
    │  ─────────────────────────────────    │
    │  • Calculate overall score            │
    │  • Analyze sentiment trends           │
    │  • Generate recommendations           │
    │  • Compile Q&A with evaluations       │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────────────┐
    │  7. INTERVIEW REPORT PAGE                              │
    │  InterviewReport.jsx                                   │
    │  ───────────────────────────────────────────────────── │
    │                                                         │
    │  ┌──────────────────────────────────────────────────┐  │
    │  │ INTERVIEW REPORT                        [Download]│  │
    │  ├──────────────────────────────────────────────────┤  │
    │  │ Candidate: John Doe @ Google (Engineer)          │  │
    │  │                                                  │  │
    │  │ PERFORMANCE                                      │  │
    │  │ ◯ Overall Score: 78/100                         │  │
    │  │ • Questions: 5/5 (100%)                         │  │
    │  │ • Positive: 3  Neutral: 2  Negative: 0         │  │
    │  │                                                  │  │
    │  │ QUESTIONS & ANSWERS                              │  │
    │  │ ▼ Q1: Tell me about yourself                    │  │
    │  │   Answer: I have 5 years of experience...       │  │
    │  │   Score: 82 | Sentiment: Positive               │  │
    │  │   Feedback: "Clear communication..."            │  │
    │  │   Strengths: ✓ Clear, ✓ Relevant               │  │
    │  │   Improve: • Add technical details              │  │
    │  │                                                  │  │
    │  │ ▼ Q2: [Expandable...]                           │  │
    │  │ ▼ Q3: [Expandable...]                           │  │
    │  │ ... (more questions)                            │  │
    │  │                                                  │  │
    │  │ AI RECOMMENDATIONS                               │  │
    │  │ 1. Focus on technical specifics                 │  │
    │  │ 2. Continue improving communication clarity     │  │
    │  │ 3. Challenge with harder difficulty levels      │  │
    │  │                                                  │  │
    │  │ [Take Another Interview]  [Back to Dashboard]   │  │
    │  └──────────────────────────────────────────────────┘  │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
```

---

## Data Storage Structure

```
Backend Storage: /sessions

sess_123.json
{
  "id": "sess_123",
  "role": "Software Engineer",
  "company": "Google",
  "difficulty": "Intermediate",
  "duration": 30,
  "format": "voice",
  "candidateName": "John Doe",
  
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about yourself",
      "category": "behavioral",
      "difficulty": "Intermediate"
    },
    ... (4 more questions)
  ],
  
  "answers": [
    {
      "question_id": "q1",
      "question": "Tell me about yourself",
      "user_answer": "I have 5 years of full-stack development experience...",
      "transcript": "I have 5 years of full-stack development experience...",
      "duration": 28.5,
      "timestamp": "2026-02-13T10:30:45Z",
      "evaluation": {
        "score": 78,
        "confidence": 82,
        "sentiment": "Positive",
        "strengths": ["Clear communication", "Relevant experience"],
        "improvements": ["Add more technical details"],
        "feedback": "Good answer with clear experience highlights",
        "keywordsMissed": ["technology stack", "achievements"]
      }
    },
    ... (4 more answers with evaluations)
  ],
  
  "status": "completed",
  "createdAt": "2026-02-13T10:25:00Z",
  "completedAt": "2026-02-13T10:35:00Z"
}
```

---

## API Endpoints

```
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND API ENDPOINTS                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. CREATE SESSION (Generate Questions)                       │
│     POST /api/session/create                                  │
│     Input:  {role, company, difficulty, duration}            │
│     Output: {session_id, questions[], duration, format}       │
│                                                                │
│  2. SUBMIT ANSWER (Get Evaluation)                            │
│     POST /api/session/{session_id}/submit-answer              │
│     Input:  {question_id, question, user_answer, duration}    │
│     Output: {success, analysis{sentiment, confidence, score}} │
│                                                                │
│  3. GENERATE REPORT (Get Full Analysis)                       │
│     GET /api/session/{session_id}/report                      │
│     Output: {                                                  │
│       candidate{name, role, company, difficulty},             │
│       performance{overall_score, sentiment_breakdown, ...},    │
│       q_and_a[{question, answer, evaluation}],                │
│       recommendations[]                                       │
│     }                                                          │
│                                                                │
│  4. END SESSION                                               │
│     POST /api/session/{session_id}/end-session                │
│     Output: {success, status: "completed"}                    │
│                                                                │
│  5. SPEAK QUESTION (Text-to-Speech)                           │
│     POST /api/voice/speak-question                            │
│     Input:  {sessionId, questionIndex, question}              │
│     Output: {success, message: "Question spoken"}             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Frontend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND COMPONENTS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AIInterviewerSetup.jsx                                        │
│  ├─ Form Input (Role, Company, Difficulty)                    │
│  └─ [Submit] → Calls /api/session/create                      │
│                                                                 │
│  AIInterviewerLiveNew.jsx ⭐ MAIN                             │
│  ├─ Question Display (Auto-speaks via Web Speech API)          │
│  ├─ Recording Controls (Mic on/off)                            │
│  ├─ Confidence % Display (Progress bar)                        │
│  ├─ Sentiment Display (Color-coded)                            │
│  ├─ Buttons:                                                    │
│  │  • [Start Recording] → Record answer                        │
│  │  • [Next Question] → Load next Q                            │
│  │  • [Repeat] → Speak Q again                                 │
│  │  • [End Interview] → Go to report                           │
│  └─ Calls /api/session/{id}/submit-answer                     │
│                                                                 │
│  InterviewReport.jsx ⭐ REPORT PAGE                            │
│  ├─ Candidate Info Card                                        │
│  ├─ Performance Summary (Score, completion, sentiment)         │
│  ├─ Expandable Q&A Section                                    │
│  │  ├─ Each Q shows: Category, Difficulty, User Answer        │
│  │  └─ Evaluation: Score, Sentiment, Feedback, Strengths      │
│  ├─ AI Recommendations                                         │
│  ├─ [Download Report] → Export as .txt                        │
│  └─ Calls /api/session/{id}/report                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Services & Integration

```
┌──────────────────────────────────────────────────────────────┐
│                    AI SERVICES                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Groq AI Service (groq_service.py)                         │
│  ├─ generate_questions()                                    │
│  │  └─ Input: role, company, difficulty, count             │
│  │  └─ Output: 5 tailored interview questions              │
│  │  └─ API: https://api.groq.com/...                      │
│  │                                                          │
│  └─ evaluate_answer()                                       │
│     ├─ Input: question, answer, role                       │
│     ├─ Output: {                                            │
│     │   score (0-100),                                     │
│     │   confidence (0-100),                                │
│     │   sentiment (Positive/Neutral/Negative),             │
│     │   strengths [],                                      │
│     │   improvements [],                                   │
│     │   feedback "..."                                     │
│     │ }                                                    │
│     └─ API: https://api.groq.com/...                      │
│                                                              │
│  Session Service (session_service.py)                      │
│  ├─ create_session() → Save to /sessions/                  │
│  ├─ add_answer() → Append answer to session                │
│  ├─ update_answer_evaluation() → Add Groq eval            │
│  └─ complete_session() → Mark status=completed             │
│                                                              │
│  Voice Service (voiceStreamService.js)                     │
│  ├─ speak_question() → Queue for TTS                       │
│  └─ Note: Browser Web Speech API handles TTS              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

```
BACKEND (.env file)
├─ GROQ_API_KEY = "..." (required for Groq API)
├─ LIVEKIT_URL = "wss://..." (for voice streaming)
├─ LIVEKIT_API_KEY = "..."
├─ LIVEKIT_API_SECRET = "..."
└─ FASTAPI_ENV = "development"

FRONTEND (.env file)
└─ VITE_API_URL = "http://localhost:8000"
```

---

## Complete User Journey

```
START
  │
  ├─→ Login
  │
  ├─→ Dashboard
  │
  ├─→ Click "AI Interviewer"
  │
  ├─→ Click "Setup Interview" or "Start New Interview"
  │
  ├─→ FORM PAGE (AIInterviewerSetup)
  │   • Enter Role (e.g., "Software Engineer")
  │   • Enter Company (e.g., "Google")
  │   • Select Difficulty (Beginner/Intermediate/Advanced)
  │   • Click "Start Interview"
  │
  ├─→ API CALL: POST /api/session/create
  │   • Backend receives form data
  │   • Calls Groq AI to generate 5 questions
  │   • Returns session_id + questions
  │
  ├─→ INTERVIEW PAGE (AIInterviewerLiveNew)
  │   ┌─────────────────────────────────────┐
  │   │ LOOP: For each of 5 questions       │
  │   │ ────────────────────────────────────│
  │   │ 1. Question displays (auto-speaks)  │
  │   │ 2. User clicks "Start Recording"    │
  │   │ 3. User speaks answer (30 sec)      │
  │   │ 4. Auto-submits answer              │
  │   │ 5. API: POST /api/session/{id}/...  │
  │   │ 6. Groq evaluates → returns score   │
  │   │ 7. Frontend shows Confidence %      │
  │   │ 8. Frontend shows Sentiment         │
  │   │ 9. User clicks "Next Question"      │
  │   │ 10. Loop continues                  │
  │   └─────────────────────────────────────┘
  │
  ├─→ After Question 5
  │   • User clicks "End Interview"
  │   • API: POST /api/session/end-session
  │
  ├─→ REPORT PAGE (InterviewReport)
  │   • API: GET /api/session/{id}/report
  │   • Backend calculates overall stats
  │   • Backend generates recommendations
  │   • Frontend displays:
  │     - Candidate info
  │     - Performance summary
  │     - Expandable Q&A with all evaluations
  │     - AI recommendations
  │
  ├─→ User can:
  │   • View detailed feedback per question
  │   • See strengths and improvements
  │   • Download report as text file
  │   • Take another interview
  │   • Return to dashboard
  │
  └─→ END
```

---

**This system is designed for MAXIMUM INTERACTIVITY with AI-powered evaluation at every step!** 🚀
