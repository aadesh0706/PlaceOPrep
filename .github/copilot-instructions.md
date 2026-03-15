# PlaceOPrep - AI Copilot Instructions

**PlaceOPrep** is a full-stack interview preparation platform combining Node.js/Express backend, React frontend, MongoDB database, and Flask AI engine for intelligent interview evaluation and feedback.

## 🏗️ Architecture Overview

### Tech Stack
- **Backend**: Express.js (Node.js) + MongoDB + Mongoose ODM
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6
- **AI Engine**: Flask (Python) with NLP/emotion analysis
- **Authentication**: JWT + bcryptjs
- **Real-time**: Optional LiveKit integration (not yet implemented)

### System Architecture
```
User Browser (React) 
    ↓↓
Frontend (port 5173) → Backend API (port 4000)
    ↓                         ↓
React Router                Express Routes
Auth/Pages              → MongoDB
    ↓                    Controllers/Models
Components               Auth Middleware
    ↓                    ↓
API Service         ← → AI Engine (port 5000)
  (axios)              Flask + NLP
```

### Data Flow: Interview Session
1. User selects interview type (Technical/HR/Aptitude/General)
2. Backend fetches random question from MongoDB
3. User submits answer (text/audio)
4. Backend sends to AI Engine for evaluation
5. AI Engine returns score, feedback, emotion analysis
6. Results stored in `Session`, `Result`, `Submission` collections
7. Dashboard aggregates for analytics

### Key Data Models
- **User**: Authentication + profile (email, password, name, avatar, stats)
- **Question**: Interview questions with category, difficulty, company tags
- **Session**: Single practice round (tracks user, questions, start/end time)
- **Result**: Answer evaluation (question ID, user response, score, feedback)
- **Submission**: Detailed submissions with audio, text, duration
- **Achievement**: Gamification tracking (12 types: consistency, performance, etc.)
- **Skill**: User's proficiency by category (Technical, HR, Aptitude, Communication)

## 🎯 Critical Developer Workflows

### Local Development Setup
```bash
# 1. Prerequisites: MongoDB running (mongod), Node v16+, Python 3.8+
# 2. Backend setup
cd backend && npm install && cp .env.example .env && node seed.js
npm run dev  # Starts on :4000

# 3. Frontend setup
cd frontend && npm install && npm run dev  # Starts on :5173

# 4. AI Engine setup
cd ai-engine && pip install -r requirements.txt && python app.py  # :5000
```

**Automated Setup** (Windows): Double-click `setup.bat`, then `start.bat`

### Database Seeding
- **Location**: `backend/seed.js`
- **Current Data**: 20 questions + 12 achievements seeded
- **Re-seed**: `node backend/seed.js` (idempotent, won't duplicate)
- **Problem**: Questions not showing? Run seed.js again

### Route Organization
All API routes require JWT auth middleware. Base endpoint: `/api/`

| Service | Routes | Purpose |
|---------|--------|---------|
| auth | `/auth/register`, `/auth/login` | JWT authentication |
| interview | `/interview/start`, `/interview/submit`, `/interview/questions` | Session management |
| sessions | `/sessions`, `/sessions/:id` | Session history |
| questions | `/questions`, `/questions/:id` | Question bank |
| submissions | `/submissions` | Answer storage |
| achievements | `/achievements` | Gamification |
| analytics | `/analytics` | Performance metrics |
| aptitude | `/aptitude` | Aptitude-specific |
| code | `/code/execute` | Code execution |

### Backend Controllers Pattern
Each controller file in `backend/controllers/` handles:
1. Request validation
2. Database queries via Mongoose models
3. Business logic (scoring, feedback generation)
4. External service calls (AI Engine via axios)
5. Response formatting

Example: `interviewController.start()` → creates Session → fetches random Question → returns to client

### Frontend Page Structure
- **`pages/`**: Top-level routes (Dashboard, Practice, History, Login)
- **`components/`**: Reusable UI components (Sidebar, Cards, Charts)
- **`services/`**: API calls via axios with auth interceptor
- **`utils/`**: Helpers (storage, formatting)

Protected routes use `authMiddleware` React component that redirects to login if no JWT token.

## 🔌 Integration Points

### Backend ↔ AI Engine Communication
- **Endpoint**: `http://localhost:5000/evaluate` (Flask)
- **Protocol**: POST JSON
- **Request**: `{ text: string, mode: 'technical'|'hr'|'aptitude', audioSize?: number }`
- **Response**: `{ score: 0-100, feedback: string, emotion: string, keywords: string[] }`
- **Fallback**: If AI Engine down, backend returns dummy evaluation (80% score)

### Frontend ↔ Backend API
- **Base URL**: `http://localhost:4000/api/`
- **Auth**: JWT token in `Authorization: Bearer <token>` header
- **Interceptor**: `services/api.js` auto-adds auth header, redirects on 401
- **Error Handling**: 401 → logout, others → UI toast/alert

### MongoDB Connection
- **URI**: `MONGO_URI` env var, default: `mongodb://127.0.0.1:27017/placeoprep`
- **Connection Error Handling**: Server continues if MongoDB unavailable, logs warning
- **Models**: Auto-connect via mongoose singleton in `server.js`

## 📋 Project-Specific Conventions

### Error Handling Pattern
```javascript
// Backend controllers:
try {
  const data = await Model.findById(id);
  res.json(data);
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Error message', error: err.message });
}
```
**Key**: Always return JSON with `message` + `error` fields. Log to console for debugging.

### Authentication Flow
1. Frontend calls `/auth/register` with `{ email, password, name }`
2. Backend hashes password with bcryptjs (10 salt rounds)
3. Returns JWT token + user data
4. Frontend stores token in `localStorage` under key `token`
5. All subsequent requests include `Authorization: Bearer <token>`
6. Middleware verifies token, attaches `req.user` to request

### Data Validation
- **Frontend**: Basic form validation (email format, password length)
- **Backend**: Repeat validation in controller before DB operations
- **Database**: Mongoose schema defines types, required fields, enums
- **Pattern**: Fail-fast validation, detailed error messages

### Performance Considerations
- Questions fetched once on startup, cached in frontend state
- Sessions paginated (last 5 shown on dashboard)
- Indexes on MongoDB: `User.email`, `Question.category`, `Session.userId`
- AI Engine responses cached per session (don't re-evaluate same answer)

### File Upload Handling
- **multer**: Configured in routes for audio files
- **Upload Directory**: `backend/uploads/` 
- **Serving**: Accessible via `/uploads/filename` endpoint
- **Limit**: 10MB default, not yet configured for production

## 🚀 Common Tasks & Commands

### Add New Interview Mode
1. Add category to `Question.category` enum (models/Question.js)
2. Add route in `routes/interview.js` 
3. Add controller logic in `controllers/interviewController.js`
4. Frontend: Add to `pages/InterviewSelect.jsx` button list
5. Seed new questions: Add to `backend/seed.js`

### Add New Achievement
1. Define in `Achievement` model with condition (e.g., "score >= 80")
2. Add unlock logic in relevant controller (e.g., after submission)
3. Frontend displays in `pages/Achievements.jsx`

### Debug Interview Not Starting
1. Check: Is JWT token valid? (`localStorage.token` in browser console)
2. Check: Backend running? (`http://localhost:4000/health`)
3. Check: MongoDB question exists? (`backend/seed.js`)
4. Check: AI Engine running? (`http://localhost:5000`)
5. Logs: Watch `server.js` console for route hits

### Add Feature Requiring External API
1. Store credentials in `.env` file
2. Load via `process.env.KEY_NAME` in backend
3. Hide .env from git via `.gitignore` (already configured)
4. Create dedicated service file (e.g., `services/externalService.js`)
5. Import in controller, handle errors gracefully with fallback

## 📦 Frontend-Backend Communication Example

**Add a new stat to dashboard**:

1. **Backend** (new route in `routes/sessions.js`):
   ```javascript
   router.get('/stats', authMiddleware, sessionController.getStats);
   ```

2. **Backend Controller** (in `controllers/sessionController.js`):
   ```javascript
   exports.getStats = async (req, res) => {
     const sessions = await Session.find({ userId: req.user.id });
     res.json({ totalSessions: sessions.length, avgScore: ... });
   };
   ```

3. **Frontend Service** (in `services/api.js`):
   ```javascript
   export const getStats = () => api.get('/sessions/stats');
   ```

4. **Frontend Component** (in `components/DashboardCard.jsx`):
   ```javascript
   useEffect(() => {
     getStats().then(data => setStats(data));
   }, []);
   ```

## ⚙️ Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://127.0.0.1:27017/placeoprep
PORT=4000
JWT_SECRET=your-secret-key
PY_ENGINE_URL=http://localhost:5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000/api
```

### AI Engine (.env)
```
FLASK_ENV=development
FLASK_DEBUG=1
```

## 🔍 Debugging Tips

- **"Cannot find module"**: Run `npm install` in respective directory
- **"Cannot connect to MongoDB"**: Ensure `mongod` running separately
- **"CORS error"**: Check `cors()` middleware in `backend/server.js`
- **"401 Unauthorized"**: Token expired or missing; check localStorage
- **"AI Engine returns dummy data"**: Flask not running or endpoint wrong; check logs
- **Port conflicts**: Kill existing process on port 4000/5000 with `lsof -i :4000`

## 📚 Key Files for Reference

| File | Purpose |
|------|---------|
| [backend/server.js](../backend/server.js) | Express app, route setup, error handlers |
| [backend/models/User.js](../backend/models/User.js) | User schema with bcrypt hashing |
| [backend/controllers/sessionController.js](../backend/controllers/sessionController.js) | Session CRUD logic |
| [backend/middleware/auth.js](../backend/middleware/auth.js) | JWT verification |
| [frontend/src/pages/Dashboard.jsx](../frontend/src/pages/Dashboard.jsx) | Main dashboard with charts |
| [frontend/services/api.js](../frontend/services/api.js) | Axios instance + interceptors |
| [ai-engine/app.py](../ai-engine/app.py) | Flask endpoints for evaluation |

## 🤖 AI Interviewer Sub-Platform (NEW)

**Location**: `ai-interviewer-backend/`, `python-cv-service/`, `frontend/src/pages/AIInterviewer*.jsx`

### Architecture
- **Backend (Port 4001)**: Groq LLM question generation, LiveKit token management, session management
- **Python Service (Port 8001)**: FastAPI for facial expression analysis, confidence scoring
- **Frontend**: React pages for setup form, live interview, and report generation
- **Data**: JSON file storage in `sessions/` (future: MongoDB)

### Key Integration Points

**Groq LLM** (`groqService.js`):
- Generates interview questions: `POST /api/session/create` → 5 tailored questions
- Evaluates answers: Returns score (0-100), strengths, improvements, sentiment
- Prompt: "Generate {n} interview questions for a {difficulty} {role} position at {company}"

**LiveKit** (`livekitService.js`):
- Generates access tokens: `POST /api/livekit/token`
- Enables real-time voice/video: Returns token + WebSocket URL
- Frontend connects with `livekit-client-js` (add to dependencies if needed)

**Python CV Service** (`cvService.js` + `python-cv-service/main.py`):
- Analyzes video frames: `POST /analyze` with base64 frame
- Returns: `{confidence: 0-100, emotion: "confident|neutral|anxious", expressions: {...}}`
- Batch processing: `/analyze-batch` for multiple frames
- Fallback: Returns neutral confidence (50) if service unavailable

### Frontend Flow (New Pages)

1. **AIInterviewer.jsx**: Landing page with features, CTA button
2. **AIInterviewerSetup.jsx**: Form collects role/company/difficulty/format → calls `/api/session/create`
3. **AIInterviewerLive.jsx**: 
   - Web Speech API (browser mic) for transcription
   - Timer countdown per question (30s)
   - Records confidence/emotion from video frames
   - Calls `/api/session/:id/submit-answer` for each answer
4. **AIInterviewerReport.jsx**: Displays aggregated scores, Q&A feedback, strengths/improvements

### Session Data Model
```javascript
{
  id: "uuid",
  role: "Backend Engineer",
  company: "Google",
  difficulty: "intermediate",
  format: "voice|video",
  status: "created|started|completed",
  questions: [...],
  answers: [
    {
      questionId, question, userAnswer, transcript,
      confidence, emotion, duration,
      evaluation: { score, sentiment, strengths, improvements, feedback }
    }
  ],
  createdAt, startedAt, completedAt
}
```

### Developer Workflows

**Add New Question Generator Prompt**:
1. Edit `groqService.js` → `generateQuestions()` method
2. Modify prompt template for custom question generation
3. Test via `POST /api/session/create`

**Integrate MongoDB**:
1. Create Mongoose models in `backend/models/`
2. Update `SessionService` in `services/sessionService.js` to use models instead of files
3. Migrate from file-based to DB queries

**Enable Video Mode with Facial Analysis**:
1. Frontend captures frames: `canvas.toDataURL('image/jpeg')`
2. Base64 encode frame
3. POST to `PYTHON_CV_SERVICE_URL/analyze`
4. Store confidence in session answer

**Add More Interview Categories**:
1. Update question generation prompts in `groqService.js`
2. Extend frontend setup form with category dropdown
3. Pass category to Groq prompt

### Environment Variables (ai-interviewer-backend/.env)
```
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_WS_URL=wss://your-url
GROQ_API_KEY=your_groq_key
PYTHON_CV_SERVICE_URL=http://localhost:8001
SESSIONS_DIR=./sessions
```

### Testing Endpoints
```bash
# Create session
curl -X POST http://localhost:4001/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"role":"Backend Engineer","company":"Google","difficulty":"intermediate"}'

# Get LiveKit token
curl -X POST http://localhost:4001/api/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"interview-001","participantName":"candidate"}'

# Submit answer
curl -X POST http://localhost:4001/api/session/{sessionId}/submit-answer \
  -H "Content-Type: application/json" \
  -d '{"questionId":"q1","question":"...","userAnswer":"..."}'

# Get report
curl http://localhost:4001/api/report/{sessionId}
```

### Common Extensions
- **Real Interview Recording**: Modify `AIInterviewerLive.jsx` to capture video stream, upload to backend
- **Multiple Languages**: Add `language` param to Groq prompt and Web Speech API
- **Peer Benchmarking**: Add `/api/leaderboard` endpoint comparing scores across users
- **Interview History**: Query all sessions in `sessions/` directory (or MongoDB)
- **Difficulty Adaptive**: Track score → adjust next interview difficulty

### Known Limitations
- Session data in files (not persistent across server restarts without database)
- Facial emotion detection is simplified (production: use DeepFace or MediaPipe)
- Speech recognition limited to browser support (Chrome, Edge, Safari)
- Single-user at a time (no concurrent interviews per session)

---

**Last Updated**: February 2026 | **Status**: Production-Ready Core + AI Interviewer Module Complete
