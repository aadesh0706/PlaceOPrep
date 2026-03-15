# AI Interviewer - Python Architecture & Deployment

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER                                 │
│                    (Port 5173)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  React Frontend (AIInterviewerLive.jsx)                         │
│  ├─ Web Speech API (for transcription)                          │
│  ├─ MediaRecorder API (for audio)                               │
│  └─ Timer & UI Components                                       │
│                                                                   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ HTTP/REST API
                  │ Requests to Port 8000
                  │
        ┌─────────▼──────────────┐
        │  PYTHON BACKEND        │
        │  (Port 8000)           │
        │  FastAPI + Uvicorn     │
        ├────────────────────────┤
        │                        │
        │  ┌──────────────────┐  │
        │  │  Main.py         │  │
        │  │  - FastAPI app   │  │
        │  │  - Middleware    │  │
        │  │  - Router init   │  │
        │  └────────┬─────────┘  │
        │           │            │
        │  ┌────────▼─────────────────┐
        │  │   routes/voice.py        │
        │  │  7 API Endpoints:        │
        │  │  • /initialize           │
        │  │  • /frame                │
        │  │  • /record               │
        │  │  • /metrics/{id}         │
        │  │  • /end                  │
        │  │  • /active               │
        │  │  • /health               │
        │  └────────┬────────────────┘
        │           │
        │  ┌────────▼──────────────────┐
        │  │ voiceStreamService.py     │
        │  │ Core Business Logic:      │
        │  │ • initialize_stream()     │
        │  │ • process_frame()         │
        │  │ • record_segment()        │
        │  │ • get_metrics()           │
        │  │ • end_stream()            │
        │  │ • cleanup()               │
        │  └────────┬─────────────────┘
        │           │
        └───────────┼─────────────────┘
                    │
        ┌───────────┴──────────┬──────────────┬──────────┐
        │                      │              │          │
        ▼                      ▼              ▼          ▼
    ./sessions/         LiveKit API      Groq API    External
    (JSON files)        (Voice)         (AI Model)    Logs
```

## 📊 Data Flow

### 1. Session Initialization
```
Browser Request
    ↓
/api/voice/initialize (POST)
    ↓
Pydantic Validation
    ↓
voiceStreamService.initialize_voice_stream()
    ↓
Create session record
    ↓
Return streamId + config
    ↓
Browser receives response
```

### 2. Audio Processing
```
Audio Frames from Browser
    ↓
/api/voice/frame (POST)
    ↓
Base64 Decode
    ↓
voiceStreamService.process_audio_frame()
    ↓
Calculate metrics
    ↓
Return metrics
    ↓
Browser updates UI
```

### 3. Answer Recording
```
User Submits Answer
    ↓
/api/voice/record (POST)
    ↓
Receive base64 audio
    ↓
voiceStreamService.record_audio_segment()
    ↓
Save to ./sessions/{sessionId}.json
    ↓
Calculate duration
    ↓
Return recordingId
    ↓
Browser confirms
```

### 4. Stream Termination
```
Next Question Clicked
    ↓
/api/voice/end (POST)
    ↓
voiceStreamService.end_voice_stream()
    ↓
Calculate final metrics
    ↓
Save session summary
    ↓
Return metrics
    ↓
Browser cleanup
```

## 🔌 API Contract

### Request/Response Format

```json
// POST /api/voice/initialize
{
  "request": {
    "sessionId": "session-001",
    "roomName": "interview-room",
    "participantId": "user-123"
  },
  "response": {
    "success": true,
    "streamId": "stream-1",
    "config": {
      "sampleRate": 48000,
      "bitrate": 128000,
      "codec": "PCM16"
    }
  }
}
```

```json
// POST /api/voice/record
{
  "request": {
    "sessionId": "session-001",
    "questionIndex": 0,
    "audioData": "base64encodedaudio..."
  },
  "response": {
    "success": true,
    "recordingId": "recording-001",
    "duration": 45.2
  }
}
```

```json
// GET /api/voice/metrics/{sessionId}
{
  "response": {
    "sessionId": "session-001",
    "status": "active",
    "metrics": {
      "recordedTime": 45.2,
      "framesProcessed": 450,
      "audioLevel": -20.5,
      "bitrate": 128000
    }
  }
}
```

## 🎯 Key Components

### Backend (Python/FastAPI)

**main.py**
- Application entry point
- CORS configuration
- Middleware setup
- Error handlers

**voiceStreamService.py**
- Core business logic
- Stream management
- Audio processing
- Metrics tracking
- File I/O

**voice.py**
- API route definitions
- Request validation (Pydantic)
- Response formatting
- Error handling

### Frontend (React)

**AIInterviewerLive.jsx**
- Interview UI
- Web Speech API integration
- MediaRecorder setup
- API calls
- Real-time updates

### Storage

**./sessions/**
- JSON files per session
- Recording metadata
- Timestamps
- Durations
- Participant info

## 🚀 Deployment Topology

### Development
```
Laptop
├── Terminal 1: python main.py (Port 8000)
└── Terminal 2: npm run dev (Port 5173)
```

### Staging/Production
```
Server
├── Python Backend (Gunicorn + Uvicorn)
│   ├── Port 8000 (internal)
│   └── Behind reverse proxy (HTTPS)
├── React Frontend (Static files)
│   └── Served via Nginx/Apache
└── Session Storage
    ├── Local: ./sessions/
    └── Backup: Cloud storage
```

## 🔄 Component Interactions

### Request Lifecycle

```
1. Browser                      Frontend Makes Request
   ├─ Validates input
   └─ Converts audio to base64

2. Network
   └─ Sends HTTP POST

3. FastAPI Server               Backend Receives
   ├─ CORS middleware
   ├─ Request logging
   └─ Route matching

4. Route Handler                /api/voice/...
   ├─ Pydantic validation
   ├─ Calls service
   └─ Error handling

5. Service Layer                voiceStreamService
   ├─ Business logic
   ├─ State management
   └─ File I/O

6. Response                     JSON Response
   ├─ Status code
   ├─ Data payload
   └─ Timestamp

7. Browser                      Frontend Updates
   ├─ Error handling
   ├─ UI update
   └─ Calls next API
```

## 🌐 Network Diagram

```
Internet
   │
   └─→ [ Reverse Proxy / Load Balancer ]
        └─→ HTTPS
        
        ├─→ [ API Gateway ]
        │    └─→ Port 8000 (Python Backend)
        │
        └─→ [ Static Web Server ]
             └─→ Port 80/443 (React Frontend)
```

## 🔌 Service Dependencies

```
FastAPI Application
    ├─ Uvicorn (ASGI server)
    ├─ Pydantic (validation)
    ├─ Python 3.11+ (runtime)
    └─ python-multipart (form handling)

Voice Processing
    ├─ Base64 codec
    ├─ JSON (serialization)
    └─ Datetime (timestamps)

External APIs
    ├─ LiveKit (voice streaming)
    ├─ Groq (AI model)
    └─ Web Speech API (browser)
```

## 📊 State Management

### Server State
```python
{
    "session-001": {
        "streamId": "stream-1",
        "status": "active",
        "config": {...},
        "metrics": {
            "startTime": "2024-01-15T10:30:00",
            "framesProcessed": 450,
            "recordedTime": 45.2
        }
    }
}
```

### Session File (.json)
```json
{
    "sessionId": "session-001",
    "participantId": "user-123",
    "startTime": "2024-01-15T10:30:00Z",
    "answers": [
        {
            "questionIndex": 0,
            "question": "Tell me about yourself...",
            "recordingId": "recording-001",
            "duration": 45.2,
            "timestamp": "2024-01-15T10:30:45Z"
        }
    ],
    "endTime": "2024-01-15T10:35:00Z"
}
```

## 🎯 Configuration Hierarchy

```
Environment Variables (.env)
    ├─ LIVEKIT_API_KEY
    ├─ LIVEKIT_API_SECRET
    ├─ GROQ_API_KEY
    ├─ PORT
    └─ SESSIONS_DIR

Frontend .env (VITE_*)
    └─ VITE_API_URL

FastAPI Settings
    ├─ Main.py configuration
    ├─ CORS settings
    └─ Logging configuration
```

## 🔐 Security Layers

```
1. Input Validation Layer
   └─ Pydantic models validate all requests

2. CORS Middleware
   └─ Controls cross-origin access

3. Error Handling Layer
   └─ Prevents data leaks in error messages

4. Session Validation
   └─ Verifies session exists before operations

5. File System Permissions
   └─ Restricts access to ./sessions/
```

## 📈 Performance Considerations

### Optimization Points
```
Request Processing
├─ Pydantic validation (fast)
├─ Service method call (optimized)
├─ File I/O (async ready)
└─ JSON serialization (fast)

Audio Processing
├─ Base64 decoding (efficient)
├─ In-memory buffers (no disk I/O)
└─ Metrics calculation (lightweight)

Session Management
├─ Dictionary lookups (O(1))
├─ JSON file I/O (async)
└─ Cleanup on shutdown
```

### Scaling Strategy
```
Vertical Scaling (CPU/RAM)
├─ Increase Uvicorn workers
├─ Increase available RAM
└─ Optimize metrics calculation

Horizontal Scaling
├─ Multiple Python instances
├─ Load balancer (Nginx/HAProxy)
├─ Shared session storage (S3/NFS)
└─ Session ID routing
```

## 🔄 Lifecycle Management

### Startup Sequence
```
1. Python interpreter starts
2. main.py executed
3. FastAPI app initialized
4. Middleware registered
5. Routes loaded
6. Startup events triggered
   ├─ Create ./sessions/ directory
   ├─ Initialize logging
   └─ Connect to external services
7. Uvicorn server starts
8. Listening on port 8000
```

### Shutdown Sequence
```
1. SIGTERM signal received
2. Shutdown events triggered
   ├─ End all active streams
   ├─ Save session data
   ├─ Cleanup resources
   └─ Close connections
3. Active requests completed
4. Server stops
5. Port 8000 released
```

## 📊 Monitoring Points

```
Application Health
├─ /health endpoint
├─ Response time
└─ Error rate

Voice Service
├─ /api/voice/health
├─ Active streams count
└─ Recording success rate

System Resources
├─ CPU usage
├─ Memory usage
├─ Disk I/O
└─ Network I/O

Business Metrics
├─ Sessions completed
├─ Average recording duration
├─ Error frequency
└─ User satisfaction
```

---

**Architecture Version**: 1.0  
**Framework**: FastAPI  
**Python**: 3.11+  
**Status**: Production Ready
