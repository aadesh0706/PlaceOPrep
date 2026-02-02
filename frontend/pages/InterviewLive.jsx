import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import { getQuestions, startInterview } from '../services/interview';

const MODE_ICONS = {
  Technical: '💻',
  Coding: '⌨️',
  Aptitude: '🧮',
  HR: '🤝',
  Reverse: '🔄',
  Cultural: '🌍'
};

export default function InterviewLive(){
  const { state } = useLocation();
  const mode = state?.mode || 'Technical';
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await startInterview(mode);
        const qs = await getQuestions(mode);
        setQuestion(qs.questions[0]);
      } catch(err) {
        console.error('Failed to start interview:', err);
        setQuestion('Error loading question');
      } finally {
        setLoading(false);
      }
    })();
  }, [mode]);

  const handleResult = (data) => {
    console.log('Received result:', data);
    setResult(data);
  };

  return (
    <div className="animate-slide-up">
      <div className="card-gradient p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              {MODE_ICONS[mode] || '🎯'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Live Interview Session</h2>
              <p className="text-sm text-gray-500">{mode} Mode • Real-time Analysis</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Active</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-inner">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">❓</div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Your Question:</p>
                <p className="text-lg text-gray-800 leading-relaxed">{question}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card-gradient p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <span>🎤</span>
          <span>Record Your Answer</span>
        </h3>
        <VoiceRecorder mode={mode} onResult={handleResult} />
      </div>

      {result && <FeedbackPanel data={result} />}
    </div>
  );
}
