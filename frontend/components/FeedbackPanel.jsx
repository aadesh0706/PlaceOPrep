import React from 'react';

export default function FeedbackPanel({ data }){
  if(!data) return null;
  const { transcript, nlp, emotion, decision, feedback } = data;
  
  // Get the actual score from decision.final_score
  const score = decision?.final_score || 0;
  const getScoreColor = (s) => {
    if(s >= 80) return 'from-green-500 to-emerald-600';
    if(s >= 60) return 'from-blue-500 to-indigo-600';
    if(s >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };
  
  return (
    <div className="card-gradient p-8 animate-slide-up">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg animate-bounce">
          ✓
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Analysis Complete</h3>
          <p className="text-sm text-gray-500">AI-powered evaluation results</p>
        </div>
      </div>
      
      {/* Overall Score - Hero Section */}
      <div className={`bg-gradient-to-br ${getScoreColor(score)} rounded-2xl p-8 mb-6 text-white shadow-2xl`}>
        <div className="text-center">
          <p className="text-white/90 text-sm font-medium mb-2">Overall Performance</p>
          <div className="text-7xl font-black mb-2">{score.toFixed(1)}<span className="text-4xl">%</span></div>
          <div className="w-32 h-2 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{width: `${score}%`}}></div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">💬</span>
          <h4 className="font-bold text-gray-900">Your Response</h4>
        </div>
        <p className="text-gray-700 leading-relaxed italic">"{transcript || 'No transcript available'}"</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Content Analysis */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">📝</span>
            <h4 className="font-bold text-blue-900">Content Analysis</h4>
          </div>
          <div className="space-y-3">
            <MetricBar label="Relevance" value={nlp?.relevance_score || 0} color="blue" />
            <MetricBar label="Clarity" value={nlp?.clarity_score || 0} color="indigo" />
            <MetricBar label="Completeness" value={nlp?.completeness_score || 0} color="purple" />
            <div className="bg-white/50 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-gray-700">Keywords Found: </span>
              <span className="font-bold text-gray-900">{nlp?.keywords_found?.join(', ') || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Voice & Emotion */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🎭</span>
            <h4 className="font-bold text-purple-900">Voice & Emotion</h4>
          </div>
          <div className="space-y-3">
            <InfoRow icon="😊" label="Sentiment" value={nlp?.sentiment || 'Neutral'} />
            <InfoRow icon="🎯" label="Confidence" value={`${emotion?.confidence || 0}%`} />
            <InfoRow icon="⚡" label="Enthusiasm" value={`${emotion?.enthusiasm || 0}%`} />
            <InfoRow icon="😰" label="Nervousness" value={`${emotion?.nervousness || 0}%`} />
            <InfoRow icon="⏱️" label="Speaking Pace" value={emotion?.pace || 'N/A'} />
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">💡</span>
          <h4 className="font-bold text-amber-900">AI Recommendations</h4>
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-800 mb-2">{feedback?.overall || 'Great performance! Keep practicing.'}</p>
            <p className="text-sm text-gray-600">{feedback?.detailed_analysis}</p>
          </div>
          
          {feedback?.strengths && feedback.strengths.length > 0 && (
            <div>
              <p className="font-semibold text-green-700 mb-2">✅ Strengths:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          
          {feedback?.improvements && feedback.improvements.length > 0 && (
            <div>
              <p className="font-semibold text-orange-700 mb-2">📈 Areas for Improvement:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {feedback.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
              </ul>
            </div>
          )}

          {feedback?.emotion_feedback && (
            <p className="text-sm text-gray-600 italic">{feedback.emotion_feedback}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    pink: 'bg-pink-600'
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000`} style={{width: `${value}%`}}></div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-white/50 rounded-lg px-4 py-2">
      <div className="flex items-center space-x-2">
        <span>{icon}</span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
