# Streaming Transcription - Frontend Integration Guide

## Installation

```bash
npm install socket.io-client
```

## React Hook for Recording

```javascript
import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

export function useStreamingTranscription(sessionId, questionIndex) {
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const socketRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = io('http://localhost:5000')

    socketRef.current.on('connected', () => {
      console.log('WebSocket connected')
    })

    socketRef.current.on('transcript_update', (data) => {
      if (data.type === 'transcript') {
        setTranscript(prev => prev + ' ' + data.text)
      }
    })

    socketRef.current.on('transcription_complete', (data) => {
      console.log('Final transcript:', data.transcript)
      setTranscript(data.transcript)
      setIsRecording(false)
    })

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error)
      setIsRecording(false)
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const startRecording = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording')
        return
      }

      console.log('Requesting microphone permission...')
      
      // This will trigger browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })

      console.log('Microphone permission granted')

      // Use WAV format
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          
          // Convert to base64 and send
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64Audio = reader.result.split(',')[1]
            socketRef.current.emit('audio_chunk', { audio: base64Audio })
          }
          reader.readAsDataURL(event.data)
        }
      }

      // Start transcription session
      socketRef.current.emit('start_transcription', {
        session_id: sessionId,
        question_index: questionIndex
      })

      mediaRecorder.start(100) // Send chunks every 100ms
      setIsRecording(true)
      setTranscript('')

    } catch (error) {
      console.error('Error starting recording:', error)
      
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow microphone access to record your answer.')
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.')
      } else {
        alert('Error accessing microphone: ' + error.message)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      
      // Signal end of transcription
      socketRef.current.emit('stop_transcription')
      setIsRecording(false)
    }
  }

  return {
    transcript,
    isRecording,
    startRecording,
    stopRecording
  }
}
```

## Usage in Component

```javascript
function InterviewDashboard({ sessionId, questions }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  
  const {
    transcript,
    isRecording,
    startRecording,
    stopRecording
  } = useStreamingTranscription(sessionId, currentQuestionIndex)

  return (
    <div>
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{questions[currentQuestionIndex]?.question}</p>

      {/* Live Transcript Display */}
      <div className="transcript-box">
        <h3>Your Answer (Live):</h3>
        <p>{transcript || 'Start speaking...'}</p>
      </div>

      {/* Recording Controls */}
      <div className="controls">
        {!isRecording ? (
          <button onClick={startRecording}>
            Start Answer
          </button>
        ) : (
          <button onClick={stopRecording}>
            End Answer
          </button>
        )}
      </div>
    </div>
  )
}
```

## Architecture Flow

```
Frontend (React)
    ↓
  MediaRecorder API (16kHz WAV)
    ↓
  Socket.IO Client
    ↓
  Emit: audio_chunk (base64)
    ↓
Flask Backend (Socket.IO Server)
    ↓
  Collect audio chunks
    ↓
  AsyncSarvamAI WebSocket
    ↓
  Sarvam Streaming API
    ↓
  Real-time transcript
    ↓
  Emit: transcript_update
    ↓
  Frontend displays live
```

## Key Points

1. **Audio Format**: Must be WAV, 16kHz, mono
2. **Chunking**: Send small chunks (100ms) for low latency
3. **Base64 Encoding**: Required for WebSocket transmission
4. **Session Management**: Track session_id and question_index
5. **Error Handling**: Handle disconnections gracefully
6. **VAD Signals**: Backend receives speech_start/speech_end events

## Installation & Run

```bash
cd backend
pip install -r requirements.txt
python app_streaming.py
```

Frontend will connect to `http://localhost:5000` via Socket.IO.
