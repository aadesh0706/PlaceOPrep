import { useState } from 'react';
import InterviewDashboard from '../components/ai-interviewer/InterviewDashboard';
import PerformanceReport from '../components/ai-interviewer/PerformanceReport';

function AiInterviewer() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('30');
  const [format, setFormat] = useState('voice');
  const [loading, setLoading] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    
    const formData = {
      "Role Applied for": role,
      "Company Name": company,
      "Difficulty Level": difficulty,
      "Duration": duration
    };

    try {
      const response = await fetch('http://localhost:5000/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        setQuestions(result.questions);
        setSessionId(result.session_id);
        
        if (format === 'video') {
          const num_questions = result.questions.length;
          const tavusResponse = await fetch('http://localhost:5000/api/tavus/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              role, 
              company, 
              difficulty, 
              session_id: result.session_id,
              num_questions
            })
          });
          
          const tavusData = await tavusResponse.json();
          
          if (tavusData.success && tavusData.conversation_url) {
            window.location.href = tavusData.conversation_url;
            return;
          } else {
            alert('Failed to start video interview: ' + (tavusData.error || 'Unknown error'));
          }
        }
        
        setShowInterview(true);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = () => {
    setShowInterview(false);
    setShowReport(true);
  };

  const handleStartNewInterview = () => {
    setShowReport(false);
    setShowInterview(false);
    setRole('');
    setCompany('');
    setDifficulty('Intermediate');
    setDuration('30');
    setFormat('voice');
    setQuestions([]);
    setSessionId('');
  };

  if (showReport) {
    return <PerformanceReport sessionId={sessionId} onStartNew={handleStartNewInterview} />;
  }

  if (showInterview) {
    return <InterviewDashboard questions={questions} sessionId={sessionId} onEndInterview={handleEndInterview} duration={parseInt(duration)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8 px-4 relative overflow-auto">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="absolute top-2/4 w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
        <div className="absolute top-3/4 w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
      </div>

      <div className="relative w-full max-w-2xl bg-white backdrop-blur-xl rounded-2xl border border-blue-200 shadow-xl p-6 my-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Configure Your Session</h1>
          <p className="text-gray-600 text-xs">Tailor the AI to simulate your upcoming interview experience.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Role Applied For
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            >
              <option value="15">15 min (~5 questions)</option>
              <option value="30">30 min (~10 questions)</option>
              <option value="45">45 min (~15 questions)</option>
              <option value="60">60 min (~20 questions)</option>
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex gap-2">
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-700 text-xs">Longer durations allow the AI to ask deeper follow-up questions based on your previous answers.</p>
        </div>

        <div className="mb-4">
          <label className="block text-blue-600 text-xs font-medium mb-2">Interview Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('voice')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'voice'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <svg className="w-10 h-10 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <p className="text-gray-800 font-semibold text-sm">Voice Only</p>
            </button>

            <button
              onClick={() => setFormat('video')}
              className={`p-4 rounded-lg border-2 transition-all ${
                format === 'video'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <svg className="w-10 h-10 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-800 font-semibold text-sm">Video Enabled</p>
            </button>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading || !role || !company}
          className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all text-base flex items-center justify-center gap-2"
        >
          {loading ? 'Generating...' : (
            <>
              Start AI Interview
              <span className="text-xl">⚡</span>
            </>
          )}
        </button>

        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">AI Engine Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-600">Secure Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiInterviewer;
