# 🚀 Quick Test Guide

## Your Dynamic Interview System is LIVE!

### **Backend Status**: ✅ Running on http://localhost:8000
### **Frontend Status**: ✅ Ready on http://localhost:5173

---

## ⚡ QUICK TEST (5 minutes)

### **1. Start Backend** (if not running)
```bash
cd SkillSpectrum/ai-interviewer-backend
python main.py
```
✅ Wait for: "🚀 AI Interviewer Backend started"

---

### **2. Start Frontend** (in new terminal)
```bash
cd SkillSpectrum/frontend
npm run dev
```
✅ Wait for: "Local: http://localhost:5173"

---

### **3. Test Flow**
1. Go to `http://localhost:5173`
2. Login (use test account)
3. Click **Dashboard**
4. Look for **"AI Interviewer"** section
5. Click **"Start Interview"** or **"Setup"**

---

## 🎯 WHAT HAPPENS NEXT

```
You Fill Form (Role, Company, Difficulty)
           ↓ (Clicked Start)
System Generates 5 Questions via Groq AI
           ↓
Question #1 Auto-Plays (Voice + Text)
           ↓
You Click "Start Recording"
           ↓
You Speak Your Answer (30 seconds)
           ↓
System Shows: Confidence % + Sentiment
           ↓
You Click "Next Question"
           ↓
Question #2 Auto-Plays (Loop continues)
           ↓
After All 5 Questions → Click "End Interview"
           ↓
Full Report Shows with:
  • All Q&A
  • Your Score per question (0-100)
  • Sentiment (Positive/Neutral/Negative)
  • AI Feedback & Suggestions
  • Overall Performance Score
  • AI Recommendations for Improvement
           ↓
Download Report or Take Another Interview
```

---

## 🔍 VERIFY WORKING

### **Check 1: Backend API is responding**
```bash
curl http://localhost:8000/docs
```
✅ Should show Swagger API docs

### **Check 2: Can create session**
```bash
curl -X POST http://localhost:8000/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"role":"Engineer","company":"Google","difficulty":"Intermediate"}'
```
✅ Should return session_id and questions array

### **Check 3: Can get report**
```bash
# After session ID from above:
curl http://localhost:8000/api/session/{SESSION_ID}/report
```
✅ Should return full report structure

---

## 🎤 KEY FEATURES

| Feature | How It Works |
|---------|-------------|
| **Voice Input** | Click "Start Recording", speak, it auto-stops at 30s |
| **Auto Speaking** | Questions automatically play when displayed |
| **Speech Recognition** | Browser converts speech to text |
| **AI Evaluation** | Groq AI scores your answer (0-100) |
| **Sentiment Analysis** | Shows if your tone was Positive/Neutral/Negative |
| **Confidence Score** | % score on how well you answered |
| **Feedback** | AI-generated constructive feedback |
| **Report** | Full Q&A with all scores and recommendations |
| **Download** | Export report as text file |

---

## ⚙️ HOW THE SYSTEM WORKS

### **Form Input** → Backend `/api/session/create`
```javascript
{
  role: "Software Engineer",
  company: "Google",
  difficulty: "Intermediate"
}
```

### **Backend** → Calls Groq AI
Groq generates 5 questions based on role/company/difficulty

### **Frontend** → Displays Questions
Questions auto-speak, user records answer

### **Answer Submission** → Backend `/api/session/{id}/submit-answer`
```javascript
{
  question_id: "q1",
  question: "Tell me about yourself",
  user_answer: "I have 5 years of experience..."
}
```

### **Backend** → Calls Groq AI for Evaluation
```javascript
{
  score: 78,
  confidence: 82,
  sentiment: "Positive",
  strengths: ["Clear communication", "Relevant experience"],
  improvements: ["Add more technical details"],
  feedback: "Good answer with room for technical depth"
}
```

### **Frontend** → Displays Metrics
Shows confidence %, sentiment, and moves to next question

### **After All Questions** → Backend `/api/session/{id}/report`
Generates comprehensive report with:
- Overall performance score
- All Q&A with evaluations
- AI-generated recommendations

### **Frontend** → Shows Report
User sees everything with download option

---

## 🆘 TROUBLESHOOTING QUICK TIPS

| Problem | Solution |
|---------|----------|
| Backend not starting | Check Python path: `C:/Users/HP/Downloads/SkillSpectrum/.venv/Scripts/python.exe` |
| "Cannot find module" error | Run `pip install -r requirements-python.txt` in backend folder |
| Microphone not working | Browser permission - allow when prompted |
| Questions not playing audio | Browser may have audio disabled - check settings |
| Report page blank | Session may have ended - start new interview |
| API 404 errors | Backend on 8000, frontend on 5173 - both must run |

---

## 📁 KEY FILES

```
SkillSpectrum/
├── frontend/pages/
│   ├── AIInterviewerLiveNew.jsx          ← Interview interface
│   └── InterviewReport.jsx               ← Report display (NEW!)
├── ai-interviewer-backend/
│   ├── routes/session.py                 ← Question/evaluation API
│   ├── routes/voice.py                   ← Speech API
│   ├── services/groq_service.py          ← Groq AI integration
│   └── main.py                           ← Backend server
└── DYNAMIC_INTERVIEW_WORKFLOW.md         ← Full documentation (THIS!)
```

---

## ✅ TESTING CHECKLIST

- [ ] Backend running (port 8000)
- [ ] Frontend running (port 5173)
- [ ] Can navigate to AI Interviewer
- [ ] Can fill interview form
- [ ] Can start interview
- [ ] First question displays and plays audio
- [ ] Can record answer
- [ ] Can see confidence % and sentiment
- [ ] Can click next question
- [ ] Can complete all questions
- [ ] Can view report
- [ ] Can see all Q&A with scores
- [ ] Can download report

---

## 🎓 EXAMPLE REPORT OUTPUT

```
CANDIDATE INFORMATION
Name: John Doe
Role: Software Engineer
Company: Google
Difficulty: Intermediate

PERFORMANCE SUMMARY
Overall Score: 78/100
Questions Completed: 5/5
Completion Rate: 100%

SENTIMENT BREAKDOWN
Positive: 3
Neutral: 2
Negative: 0

QUESTIONS AND ANSWERS

Q1: Tell me about yourself
Category: behavioral | Difficulty: Intermediate
Answer: I have 5 years of experience in full-stack development...
Score: 82 | Sentiment: Positive
Feedback: Great introduction with clear experience highlights
Strengths: Clear communication, Relevant experience
Improvements: Could mention specific technologies

[More questions follow...]

RECOMMENDATIONS
1. Focus on technical specifics when discussing projects
2. Continue improving your communication clarity
3. Challenge yourself with harder difficulty levels
```

---

## 🎯 YOU'RE ALL SET!

Your interview system is:
✅ **Dynamic** - Form drives question generation
✅ **Interactive** - Voice input, real-time feedback
✅ **Intelligent** - Groq AI evaluates everything
✅ **Complete** - Comprehensive reporting with recommendations

**START TESTING NOW!** 🚀

```bash
# Terminal 1 - Backend
cd SkillSpectrum/ai-interviewer-backend
python main.py

# Terminal 2 - Frontend
cd SkillSpectrum/frontend
npm run dev

# Browser
http://localhost:5173
```

Happy interviewing! 🎤📊
