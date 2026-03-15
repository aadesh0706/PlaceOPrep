# Quick Start Commands - AI Interviewer (Python Backend)

## 🚀 First Time Setup

```bash
# 1. Install Python dependencies
cd SkillSpectrum/ai-interviewer-backend
pip install -r requirements-python.txt

# 2. Create .env file
copy .env.example .env
# Edit .env with your LiveKit & Groq credentials

# 3. Start Python backend
python main.py

# 4. In new terminal, start frontend
cd SkillSpectrum/frontend
npm install (if first time)
npm run dev
```

## 🎯 Daily Development

```bash
# Terminal 1: Backend
cd SkillSpectrum/ai-interviewer-backend
python main.py

# Terminal 2: Frontend
cd SkillSpectrum/frontend
npm run dev

# Open browser to http://localhost:5173
```

## 🔍 Testing Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Voice service health
curl http://localhost:8000/api/voice/health

# List active streams
curl http://localhost:8000/api/voice/active

# API documentation (in browser)
http://localhost:8000/docs
```

## 🧪 Test Voice Recording

```bash
# 1. Initialize stream
curl -X POST http://localhost:8000/api/voice/initialize \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1","roomName":"test","participantId":"user-1"}'

# 2. Get metrics
curl http://localhost:8000/api/voice/metrics/test-1

# 3. End stream
curl -X POST http://localhost:8000/api/voice/end \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1"}'
```

## 🛠️ Troubleshooting

```bash
# Check if port 8000 is in use
# Windows PowerShell:
netstat -ano | findstr :8000

# Kill process on port 8000 (Windows):
taskkill /PID <PID> /F

# Verify Python installation
python --version

# Check FastAPI is installed
python -c "import fastapi; print(fastapi.__version__)"

# Check all dependencies
pip list | findstr fastapi uvicorn pydantic

# Run with verbose output
python main.py --log-level debug
```

## 📁 File Locations

```
ai-interviewer-backend/
├── main.py                           (FastAPI server)
├── requirements-python.txt           (Dependencies)
├── services/voiceStreamService.py   (Voice logic)
├── routes/voice.py                   (API endpoints)
├── .env                              (Configuration)
├── sessions/                         (Recording files)
└── PYTHON_BACKEND_SETUP.md          (Setup guide)
```

## 🔧 Configuration

### .env file
```env
PORT=8000
SESSIONS_DIR=./sessions
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_WS_URL=wss://your-url.livekit.cloud
GROQ_API_KEY=your_groq_key
```

### Frontend configuration (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📊 Monitoring

```bash
# View backend logs
# Check Terminal 1 running "python main.py"

# Monitor active sessions
# Windows (run repeatedly):
curl http://localhost:8000/api/voice/active

# Check session files
dir ai-interviewer-backend/sessions/

# View specific session
type ai-interviewer-backend/sessions/session-<id>.json
```

## 🌐 API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Backend health |
| `/api/voice/health` | GET | Voice service health |
| `/api/voice/initialize` | POST | Start recording |
| `/api/voice/frame` | POST | Process audio |
| `/api/voice/record` | POST | Save recording |
| `/api/voice/end` | POST | Stop recording |
| `/api/voice/metrics/{id}` | GET | Get stats |
| `/api/voice/active` | GET | List sessions |
| `/docs` | GET | API docs |

## 💾 Database / Sessions

All interview sessions saved to `./sessions/` directory

```bash
# View all sessions
ls ai-interviewer-backend/sessions/

# View session details
cat ai-interviewer-backend/sessions/session-<id>.json

# Delete session
del ai-interviewer-backend/sessions/session-<id>.json
```

## 🐳 Docker Commands (Optional)

```bash
# Build Docker image
docker build -t ai-interviewer-backend .

# Run container
docker run -p 8000:8000 \
  -e LIVEKIT_API_KEY=your_key \
  -e LIVEKIT_API_SECRET=your_secret \
  ai-interviewer-backend

# View logs
docker logs <container_id>

# Stop container
docker stop <container_id>
```

## 🚢 Production Deployment

```bash
# Using Gunicorn
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Using systemd (Linux)
sudo systemctl start ai-interviewer
sudo systemctl status ai-interviewer
sudo journalctl -u ai-interviewer -f
```

## 📈 Performance Optimization

```bash
# Increase workers for production
gunicorn main:app --workers 8 --worker-class uvicorn.workers.UvicornWorker

# Monitor resource usage
# Windows Task Manager → Python.exe

# Check concurrent connections
netstat -an | findstr ESTABLISHED | findstr 8000
```

## 🔄 Git Commands

```bash
# Add Python backend files
git add ai-interviewer-backend/main.py
git add ai-interviewer-backend/services/voiceStreamService.py
git add ai-interviewer-backend/routes/voice.py
git add ai-interviewer-backend/requirements-python.txt

# Commit changes
git commit -m "Convert backend to Python FastAPI"

# Push to repository
git push origin main
```

## 🆘 Emergency Reset

```bash
# Stop all processes
# Kill backend (Ctrl+C in Terminal 1)
# Kill frontend (Ctrl+C in Terminal 2)

# Clear sessions
rmdir /s /q ai-interviewer-backend/sessions
mkdir ai-interviewer-backend/sessions

# Reinstall dependencies
pip install -r requirements-python.txt --force-reinstall

# Start fresh
python main.py
```

## 📞 Support Info

**Backend Port**: 8000  
**Frontend Port**: 5173  
**API Documentation**: http://localhost:8000/docs  
**Session Storage**: ./sessions/ (JSON files)  
**Logs**: Check terminal output  

**Common Issues**:
- Port in use? Change PORT in .env
- Microphone not working? Check browser permissions
- API errors? Check backend logs in terminal
- Frontend not connecting? Verify API_URL in .env

---

**Last Updated**: 2024  
**Python Version**: 3.11+  
**Framework**: FastAPI
