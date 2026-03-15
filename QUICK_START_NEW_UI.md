# Quick Start - New AI Interviewer Live UI

## 🚀 Quick Setup (5 minutes)

### Step 1: Backend Setup
```bash
cd ai-interviewer-backend

# Install Python dependencies (if not already done)
pip install -r requirements-python.txt

# Make sure .env has GROQ_API_KEY set
# .env should contain:
# GROQ_API_KEY=your_key_here
# PORT=8000

# Start backend
python main.py
```

**Expected Output:**
```
✅ Sessions directory ready: ./sessions
🚀 AI Interviewer Backend started
📍 API: http://localhost:8000/api
🎙️ Voice Service: Operational
```

### Step 2: Frontend Setup
```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

**Expected Output:**
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 3: Access the Application
1. Open browser: `http://localhost:5173`
2. Login with your credentials
3. Go to: **AI Interviewer** → **Setup Interview**
4. Fill in job details and click **Start Interview**

---

## 🧪 Testing the New UI

### Quick Test Flow

#### 1. **Test Session Creation**
```bash
curl -X POST http://localhost:8000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "company": "Google",
    "difficulty": "Intermediate",
    "duration": 30
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "session_id": "abc123xyz...",
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about yourself...",
      "category": "behavioral",
      "difficulty": "Intermediate"
    },
    ...
  ]
}
```

#### 2. **Test Answer Submission**
```bash
curl -X POST http://localhost:8000/api/session/abc123xyz/submit-answer \
  -H "Content-Type: application/json" \
  -d '{
    "questionIndex": 0,
    "answer": "I am a software engineer with 5 years of experience in Python and JavaScript.",
    "timestamp": "2024-02-13T10:30:00Z"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "sentiment": "Positive",
    "confidence": 75,
    "score": 78,
    "feedback": "Good introduction with specific technologies mentioned..."
  }
}
```

#### 3. **Test End Session**
```bash
curl -X POST http://localhost:8000/api/session/abc123xyz/end-session
```

**Expected Response:**
```json
{
  "success": true,
  "status": "completed",
  "message": "Session ended successfully"
}
```

---

## ✅ Testing Checklist

### Frontend Tests
- [ ] Can navigate to `/ai-interviewer/setup`
- [ ] Form submits with all fields filled
- [ ] Redirects to `/ai-interviewer/live` after setup
- [ ] AI avatar displays with animation
- [ ] Question displays correctly
- [ ] Candidate name shows "Sarah Jenkins" (or custom name)
- [ ] Progress shows "QUESTION 01 OF 08"
- [ ] Timer counts down from 30 seconds

### Audio Recording Tests
- [ ] "START RECORDING" button works
- [ ] Microphone permissions prompt appears
- [ ] Button changes to "STOP RECORDING"
- [ ] Waveform animates while recording
- [ ] Speech recognition captures text
- [ ] Transcript displays in response box
- [ ] "STOP RECORDING" stops audio capture

### Analysis Tests
- [ ] Confidence score appears after submission
- [ ] Confidence bar fills (0-100%)
- [ ] Sentiment displays (Positive/Neutral/Negative)
- [ ] Sentiment color matches type
- [ ] Score updates for each answer
- [ ] Feedback is relevant to the answer

### Navigation Tests
- [ ] "REPEAT QUESTION" button works (calls API)
- [ ] "NEXT QUESTION" advances to next question
- [ ] Progress updates to next question number
- [ ] Timer resets to 30 seconds
- [ ] "END INTERVIEW" redirects to report page
- [ ] Can exit interview mid-session

### Backend Tests
- [ ] GET `/health` returns 200 OK
- [ ] GET `/docs` shows API documentation
- [ ] POST `/api/session/create` creates session
- [ ] GET `/api/session/{id}` retrieves session
- [ ] POST `/api/session/{id}/submit-answer` evaluates answer
- [ ] POST `/api/session/{id}/end-session` completes session
- [ ] POST `/api/voice/initialize` initializes voice
- [ ] POST `/api/voice/speak-question` plays question

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to initialize interview session"
**Cause:** Backend not running or API_URL incorrect
**Fix:**
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify frontend .env
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:8000
```

### Issue: Microphone permission denied
**Cause:** Browser permissions not granted
**Fix:**
1. Click lock icon in address bar
2. Find "Microphone" permission
3. Change to "Allow"
4. Refresh page

### Issue: No questions appearing
**Cause:** GROQ_API_KEY not set or invalid
**Fix:**
```bash
# Check backend .env
cat ai-interviewer-backend/.env

# Make sure GROQ_API_KEY is present and valid
echo $GROQ_API_KEY  # Should not be empty

# Restart backend
python main.py
```

### Issue: Sentiment always "Neutral"
**Cause:** Groq API not returning sentiment properly
**Fix:**
1. Check backend logs for Groq errors
2. Verify API key has sufficient quota
3. Try longer/more detailed answers

### Issue: Speech recognition not capturing text
**Cause:** Browser doesn't support Web Speech API
**Fix:**
```javascript
// Check browser support in console
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
console.log(SpeechRecognition ? "Supported" : "Not supported");

// Use Chrome, Edge, or Chromium-based browser
```

---

## 📊 Performance Benchmarks

- **Session Creation**: ~2-3 seconds (includes question generation)
- **Answer Submission**: ~3-5 seconds (includes Groq evaluation)
- **Speech Recognition**: Real-time (milliseconds)
- **API Response Time**: <500ms (excluding Groq processing)

---

## 🔧 Development Commands

### Backend Development
```bash
cd ai-interviewer-backend

# Run with auto-reload
python main.py

# Run with debug logging
DEBUG=true python main.py

# View API docs
# Visit: http://localhost:8000/docs
```

### Frontend Development
```bash
cd frontend

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Logs & Debugging

### Check Backend Logs
```bash
tail -f ai-interviewer-backend.log  # If logging to file
# Or just check console output from python main.py
```

### Frontend Browser Console
```javascript
// Press F12 to open DevTools
// Check Console tab for errors
// Network tab shows API calls
```

### Enable Detailed Logging
```javascript
// In browser console
localStorage.setItem('DEBUG', 'true');
location.reload();
```

---

## 🚦 Status Checks

### Quick Health Check Script
```bash
#!/bin/bash

echo "🔍 Checking AI Interviewer Services..."
echo ""

echo "📍 Backend Health:"
curl -s http://localhost:8000/health | jq '.'

echo ""
echo "📍 Frontend Health:"
curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend running" || echo "❌ Frontend not running"

echo ""
echo "📍 API Docs:"
curl -s http://localhost:8000/docs > /dev/null && echo "✅ Docs available" || echo "❌ Docs not available"
```

---

## 🎯 Next Steps After Setup

1. ✅ **Run all tests from checklist**
2. 📊 **Monitor logs** while using the app
3. 🔐 **Test error scenarios** (disconnect mic, etc.)
4. 🚀 **Deploy to production** when ready
5. 📈 **Monitor performance** metrics

---

## 📞 Quick Reference

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | `python main.py` | `http://localhost:8000` |
| API Docs | Running | `http://localhost:8000/docs` |
| Frontend | `npm run dev` | `http://localhost:5173` |
| Health Check | GET | `http://localhost:8000/health` |
| Sessions | Stored | `./ai-interviewer-backend/sessions/` |

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: ✅ Ready for Testing
