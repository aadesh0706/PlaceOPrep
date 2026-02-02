import React, { useEffect, useRef, useState } from 'react';
import { submitInterviewAudio } from '../services/interview';

export default function VoiceRecorder({ mode, onResult }){
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => { 
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      mediaRecorder.onstop = async () => {
        setLoading(true);
        setProgress('Preparing audio...');
        
        try {
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
          
          // Create blob from recorded chunks
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const file = new File([blob], 'audio.webm', { type: 'audio/webm' });
          
          setProgress('Sending to AI for analysis...');
          const result = await submitInterviewAudio({ file, mode });
          
          setProgress('');
          onResult && onResult(result);
        } catch(err) {
          console.error('Recording processing error:', err);
          if(err.code === 'ECONNABORTED' || err.message?.includes('timeout')){
            setError('Request timeout. The AI engine is taking too long. Please try a shorter response.');
          } else {
            setError(err.response?.data?.error || err.message || 'Failed to process audio');
          }
        } finally {
          setLoading(false);
          setProgress('');
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch(err) {
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-4">
        {!recording && !loading && (
          <button className="btn-primary flex items-center space-x-2" onClick={startRecording}>
            <span className="text-xl">🎤</span>
            <span>Start Recording</span>
          </button>
        )}
        {recording && (
          <button className="btn-danger flex items-center space-x-2 animate-pulse" onClick={stopRecording}>
            <span className="text-xl">⏹️</span>
            <span>Stop & Analyze</span>
          </button>
        )}
        {loading && (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="font-semibold">{progress || 'Processing...'}</span>
            </div>
            <p className="text-xs text-gray-500">This may take 10-30 seconds</p>
          </div>
        )}
      </div>
      {recording && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 text-red-600 animate-pulse-slow">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div>
            <span className="text-sm font-medium">Recording in progress...</span>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-800 flex items-start space-x-3 animate-slide-up">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold mb-1">Error Processing Audio</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
