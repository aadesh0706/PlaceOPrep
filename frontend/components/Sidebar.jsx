import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Library, History, Trophy, LogOut, User, Brain, Code, Bot } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ai-interviewer', icon: Bot, label: 'AI Interviewer' },
    { path: '/aptitude', icon: Brain, label: 'Aptitude' },
    { path: '/question-bank', icon: Library, label: 'Question Bank' },
    { path: '/coding-problems', icon: Code, label: 'Coding Problems' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo and Tagline */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          PlaceOPrep
        </h1>
        <p className="text-sm text-purple-200 mt-1">Master Your Interview</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={user?.avatar ? (user.avatar.startsWith('/uploads/') 
              ? `${import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'http://localhost:4000'}${user.avatar}`
              : user.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
            alt={user?.name || 'User'}
            className="w-10 h-10 rounded-full border-2 border-purple-400 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-purple-200 truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
