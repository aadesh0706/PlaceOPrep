import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MODES = [
  { name: 'Technical', icon: '💻', desc: 'System design, algorithms, architecture' },
  { name: 'Coding', icon: '⌨️', desc: 'Logic explanation and problem solving' },
  { name: 'Aptitude', icon: '🧮', desc: 'Quantitative and logical reasoning' },
  { name: 'HR', icon: '🤝', desc: 'Behavioral and situational questions' },
  { name: 'Reverse', icon: '🔄', desc: 'Ask insightful questions to interviewer' },
  { name: 'Cultural', icon: '🌍', desc: 'Diversity and team collaboration' }
];

export default function InterviewSelect(){
  const navigate = useNavigate();
  const [mode, setMode] = useState('Technical');
  
  return (
    <div className="animate-slide-up">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Select Interview Type</h1>
        <p className="text-gray-600">Choose the type of interview you want to practice</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {MODES.map(m => (
          <button
            key={m.name}
            onClick={() => setMode(m.name)}
            className={`card-gradient p-6 text-left transition-all duration-200 transform hover:-translate-y-1 ${
              mode === m.name 
                ? 'ring-4 ring-blue-500 shadow-2xl' 
                : 'hover:shadow-xl'
            }`}
          >
            <div className="text-4xl mb-3">{m.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{m.name}</h3>
            <p className="text-sm text-gray-600">{m.desc}</p>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button 
          className="btn-success flex items-center space-x-2 mx-auto text-lg px-8"
          onClick={()=>navigate('/interview/live', { state: { mode } })}
        >
          <span>🚀</span>
          <span>Start {mode} Interview</span>
        </button>
      </div>
    </div>
  );
}
