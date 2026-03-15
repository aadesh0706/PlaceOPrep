# AI Interviewer Integration Guide

## What Was Done

### 1. Backend Integration
- Copied Flask backend from `ai_interview/backend` to `SkillSpectrum/ai-interviewer-backend`
- All Flask files including:
  - `app.py` - Main Flask application
  - `requirements.txt` - Python dependencies
  - `.env` and `.env.example` - Environment configuration
  - Supporting files for streaming, Tavus integration, etc.

### 2. Frontend Integration
- Created new page: `frontend/pages/AiInterviewer.jsx`
- Created components folder: `frontend/components/ai-interviewer/`
  - `InterviewDashboard.jsx` - Main interview interface
  - `PerformanceReport.jsx` - Post-interview report
- Added route in `frontend/src/App.jsx` for `/ai-interviewer`
- Updated `Sidebar.jsx` to include "AiInterviewer" button with Bot icon

### 3. File Structure
```
SkillSpectrum/
├── backend/                        # Node.js backend
├── frontend/                       # React frontend
├── ai-interviewer-backend/         # Flask backend (NEW)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env
│   └── ...
│   ├── components/
│   │   ├── ai-interviewer/         # AI Interviewer components (NEW)
│   │   │   ├── InterviewDashboard.jsx
│   │   │   └── PerformanceReport.jsx
│   │   └── Sidebar.jsx             # Updated with AI button
│   ├── pages/
│   │   ├── AiInterviewer.jsx       # Main AI Interviewer page (NEW)
│   │   └── ...
│   └── src/
│       └── App.jsx                 # Updated with route
└── start-ai-interviewer.bat        # Startup script (NEW)
```

## How to Use

### Setup (First Time)

1. **Install Python Dependencies**
   ```bash
   cd ai-interviewer-backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in `ai-interviewer-backend`
   - Add your API keys:
     - OpenAI API key
     - Deepgram API key (for speech-to-text)
     - Tavus API key (optional, for video interviews)

3. **Start Both Backends**
   - Terminal 1: Start Node.js backend (existing)
     ```bash
     cd backend
     npm start
     ```
   - Terminal 2: Start Flask backend (AI Interviewer)
     ```bash
     cd ai-interviewer-backend
     python app.py
     ```
   
   OR use the startup script:
   ```bash
   start-ai-interviewer.bat
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

### Using AI Interviewer

1. Login to SkillSpectrum
2. Click "AiInterviewer" button in the sidebar (with robot icon)
3. Fill in interview details:
   - Role Applied For
   - Company Name
   - Difficulty Level
   - Duration
   - Interview Format (Voice/Video)
4. Click "Start AI Interview"
5. Answer questions using the microphone
6. View performance report at the end

## API Endpoints

The Flask backend runs on `http://localhost:5000` with these endpoints:

- `POST /generate-questions` - Generate interview questions based on role/company
- `POST /speak-question` - Convert question text to speech
- `POST /transcribe-answer` - Convert candidate's speech to text
- `POST /generate-report` - Generate performance report with feedback
- `POST /api/tavus/start` - Start video interview (requires Tavus API)

## Features

1. **Voice Interview**
   - AI speaks questions using text-to-speech
   - Candidate answers using microphone
   - Real-time speech-to-text transcription
   - Live transcription display

2. **Video Interview** (Optional)
   - Requires Tavus API integration
   - Full video avatar experience

3. **Performance Report**
   - Question-by-question breakdown
   - Ideal answers vs candidate answers
   - Overall feedback and recommendations

## Troubleshooting

### Backend Not Starting
- Ensure Python 3.8+ is installed
- Check if port 5000 is available
- Verify all dependencies are installed

### Microphone Not Working
- Grant browser microphone permissions
- Check browser console for errors
- Ensure HTTPS or localhost (required for microphone access)

### API Errors
- Verify API keys in `.env` file
- Check Flask backend console for error messages
- Ensure both backends are running

## Notes

- The AI Interviewer backend (Flask) runs independently from the main SkillSpectrum backend (Node.js)
- Both backends must be running for full functionality
- The frontend communicates with Flask backend on port 5000
- Make sure to keep your API keys secure and never commit them to version control
