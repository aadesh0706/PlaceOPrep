# SkillSpectrum - Complete Startup Guide

## Prerequisites
- Docker Desktop installed
- Node.js 18+ installed
- Python 3.9+ installed
- Git installed

---

## Step 1: Start Docker Services

### Option 1: PowerShell (Recommended)
```powershell
cd c:\Users\HP\Downloads\SkillSpectrum\SkillSpectrum
powershell -ExecutionPolicy Bypass -File setup-docker.ps1
```

### Option 2: Batch
```cmd
cd c:\Users\HP\Downloads\SkillSpectrum\SkillSpectrum
setup-docker.bat
```

**Expected Output:**
```
✅ Docker found
✅ Docker Compose found
✅ docker-compose.yml found
Starting LiveKit and Redis services...
✅ Services started successfully!
```

Wait for services to show "healthy" status:
```
skillspectrum-redis     redis:7-alpine          Up   (healthy)
skillspectrum-livekit   livekit/livekit-server  Up   (healthy)
```

---

## Step 2: Start Backend (Python)

Open a **NEW Terminal** and run:

```powershell
cd c:\Users\HP\Downloads\SkillSpectrum\SkillSpectrum\ai-interviewer-backend

# Activate virtual environment (if exists)
if (Test-Path "venv\Scripts\Activate.ps1") {
    .\venv\Scripts\Activate.ps1
}

# Install dependencies
pip install -r requirements-python.txt

# Start backend
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
✅ Sessions directory ready: ./sessions
🚀 AI Interviewer Backend started
📍 API: http://localhost:8000/api
🔗 LiveKit URL: ws://localhost:7880
🎙️ Voice Service: Operational
```

---

## Step 3: Start Frontend (React)

Open a **THIRD Terminal** and run:

```powershell
cd c:\Users\HP\Downloads\SkillSpectrum\SkillSpectrum\frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v5.4.2  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Step 4: Access Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## Troubleshooting

### Issue: Backend returning 500 errors
**Solution:** Check if Docker services are running:
```powershell
docker-compose ps
```

All services should show `Up` and `(healthy)`.

### Issue: Frontend can't connect to backend
**Solution:** Verify backend is running on port 8000:
```powershell
netstat -an | findstr :8000
```

Should show `LISTENING` on `127.0.0.1:8000`

### Issue: LiveKit token generation fails
**Solution:** 
1. Check backend .env has correct credentials:
   ```
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=secret
   LIVEKIT_URL=ws://localhost:7880
   ```

2. Verify LiveKit container is healthy:
   ```powershell
   docker logs skillspectrum-livekit
   ```

### Issue: CORS errors
**Solution:** Backend CORS is already configured. If issues persist:
1. Clear browser cache
2. Restart frontend: `npm run dev`

---

## Useful Commands

### View Docker logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f skillspectrum-livekit
docker-compose logs -f skillspectrum-redis
```

### Stop services
```powershell
docker-compose down
```

### Stop and remove all data
```powershell
docker-compose down -v
```

### Restart services
```powershell
docker-compose restart
```

### Check service status
```powershell
docker-compose ps
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_LIVEKIT_URL=ws://localhost:7880
```

### Backend (.env)
```
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_WS_URL=ws://localhost:7880
```

### Docker (.env.docker)
```
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Architecture

```
┌─────────────────┐
│   Browser       │
│   (localhost:   │
│    5173)        │
└────────┬────────┘
         │
         │ HTTP/WS
         ▼
┌──────────────────────┐
│  Frontend (React)    │
│  - Vite dev server   │
│  - AIInterviewer     │
│    Components        │
└────────┬─────────────┘
         │
         │ API Calls
         ▼
┌──────────────────────┐
│  Backend (Python)    │
│  FastAPI on :8000    │
│  - Session mgmt      │
│  - Voice processing  │
│  - LiveKit token     │
└────────┬─────────────┘
         │
         │ SDK/API
         ▼
┌──────────────────────┐
│  Docker Services     │
│  - LiveKit :7880     │
│  - Redis :6379       │
└──────────────────────┘
```

---

## Next Steps

1. ✅ Start Docker services
2. ✅ Start backend
3. ✅ Start frontend
4. 📝 Create an interview session
5. 🎤 Test audio recording
6. 📊 Review analytics dashboard

---

For detailed issues, check logs in each terminal window.
