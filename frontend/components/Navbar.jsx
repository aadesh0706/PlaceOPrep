import React from 'react';

export default function Navbar({ onNavigate }){
  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SkillSpectrum</div>
            <div className="text-xs text-gray-500">Interview Intelligence Platform</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <NavButton onClick={() => onNavigate('/dashboard')} icon="📊" label="Dashboard" />
          <NavButton onClick={() => onNavigate('/interview/select')} icon="🎯" label="Interview" />
          <NavButton onClick={() => onNavigate('/analytics')} icon="📈" label="Analytics" />
          <NavButton onClick={() => onNavigate('/history')} icon="📚" label="History" />
        </div>
      </div>
    </div>
  );
}

function NavButton({ onClick, icon, label }) {
  return (
    <button 
      onClick={onClick} 
      className="px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center space-x-2 group"
    >
      <span className="text-lg group-hover:scale-110 transition-transform duration-200">{icon}</span>
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{label}</span>
    </button>
  );
}
