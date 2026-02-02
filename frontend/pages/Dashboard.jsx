import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Users, Brain, Zap, TrendingUp, Clock, Target, Award, Trophy } from 'lucide-react';
import { LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { totalInterviews: 0, practiceTime: 0, averageScore: 0, bestScore: 0, currentStreak: 0 },
    todayStats: { interviews: 0, time: 0, avgScore: 0 },
    yesterdayStats: { interviews: 0, time: 0, avgScore: 0 },
    weekStats: { interviews: 0, time: 0, avgScore: 0 },
    skills: { technical: 0, hr: 0, aptitude: 0, communication: 0 },
    recentSessions: [],
    achievements: [],
    progressData: []
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setData({
        ...response.data,
        todayStats: response.data.todayStats || { interviews: 0, time: 0, avgScore: 0 },
        yesterdayStats: response.data.yesterdayStats || { interviews: 0, time: 0, avgScore: 0 },
        weekStats: response.data.weekStats || { interviews: 0, time: 0, avgScore: 0 }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const quickStartOptions = [
    {
      title: 'Technical Round',
      icon: Code,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/practice',
      state: { type: 'technical' }
    },
    {
      title: 'HR Round',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      path: '/practice',
      state: { type: 'hr' }
    },
    {
      title: 'Aptitude Test',
      icon: Brain,
      gradient: 'from-green-500 to-emerald-500',
      path: '/practice',
      state: { type: 'aptitude' }
    },
    {
      title: 'Full Simulation',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500',
      path: '/practice',
      state: { type: 'full_simulation' }
    }
  ];

  const kpiCards = [
    {
      title: 'Total Interviews',
      value: data.kpis.totalInterviews,
      icon: Target,
      gradient: 'from-blue-500 to-blue-600',
      motivation: 'Keep practicing!'
    },
    {
      title: 'Practice Time',
      value: `${data.kpis.practiceTime} min`,
      icon: Clock,
      gradient: 'from-purple-500 to-purple-600',
      motivation: 'Time well spent'
    },
    {
      title: 'Average Score',
      value: `${data.kpis.averageScore}%`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-600',
      motivation: 'Great progress!'
    },
    {
      title: 'Best Score',
      value: `${data.kpis.bestScore}%`,
      icon: Award,
      gradient: 'from-orange-500 to-orange-600',
      motivation: 'Outstanding!'
    }
  ];

  const skillData = [
    { subject: 'Technical', score: data.skills.technical, fullMark: 100 },
    { subject: 'HR', score: data.skills.hr, fullMark: 100 },
    { subject: 'Aptitude', score: data.skills.aptitude, fullMark: 100 },
    { subject: 'Communication', score: data.skills.communication, fullMark: 100 }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Ready to ace your next interview? Let's continue your practice journey.
        </p>
        <button
          onClick={() => navigate('/practice')}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
        >
          Start New Practice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mb-1">{card.value}</p>
              <p className="text-xs text-gray-500">{card.motivation}</p>
            </div>
          );
        })}
      </div>

      {/* Activity Stats - Today, Yesterday, This Week */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-900">📅 Today</h3>
            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">Live</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Interviews:</span>
              <span className="font-bold text-blue-900">{data.todayStats.interviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Practice Time:</span>
              <span className="font-bold text-blue-900">{data.todayStats.time} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Avg Score:</span>
              <span className="font-bold text-blue-900">{data.todayStats.avgScore}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-purple-900">⏮️ Yesterday</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-700">Interviews:</span>
              <span className="font-bold text-purple-900">{data.yesterdayStats.interviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700">Practice Time:</span>
              <span className="font-bold text-purple-900">{data.yesterdayStats.time} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700">Avg Score:</span>
              <span className="font-bold text-purple-900">{data.yesterdayStats.avgScore}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-900">📊 This Week</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-700">Interviews:</span>
              <span className="font-bold text-green-900">{data.weekStats.interviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Practice Time:</span>
              <span className="font-bold text-green-900">{data.weekStats.time} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Avg Score:</span>
              <span className="font-bold text-green-900">{data.weekStats.avgScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStartOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(option.path, { state: option.state })}
                className={`p-6 bg-gradient-to-br ${option.gradient} rounded-xl text-white hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200`}
              >
                <Icon className="w-10 h-10 mb-3" />
                <h3 className="font-semibold text-lg">{option.title}</h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Sessions</h2>
          {data.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {data.recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/history`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      session.type === 'technical' ? 'bg-blue-100 text-blue-600' :
                      session.type === 'hr' ? 'bg-purple-100 text-purple-600' :
                      session.type === 'aptitude' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {session.type === 'technical' ? <Code className="w-5 h-5" /> :
                       session.type === 'hr' ? <Users className="w-5 h-5" /> :
                       session.type === 'aptitude' ? <Brain className="w-5 h-5" /> :
                       <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {session.questionId?.title || 'Practice Session'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(session.createdAt)} • {session.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">{session.score}%</p>
                    <p className="text-xs text-gray-500">{Math.floor(session.duration / 60)} min</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No practice sessions yet</p>
              <button
                onClick={() => navigate('/practice')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start your first session
              </button>
            </div>
          )}
        </div>

        {/* Skill Assessment */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Skill Assessment</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Radar name="Skills" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 text-center mt-2">
            Keep practicing to improve your skills across all areas
          </p>
        </div>
      </div>

      {/* Progress Over Time & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Over Time */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Progress Over Time</h2>
          {data.progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Complete more sessions to see your progress</p>
            </div>
          )}
        </div>

        {/* Achievements Preview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Achievements</h2>
          {data.achievements.length > 0 ? (
            <div className="space-y-3">
              {data.achievements.slice(0, 4).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{achievement.name}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => navigate('/achievements')}
                className="w-full mt-2 py-2 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors"
              >
                View All Achievements
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No achievements yet</p>
              <p className="text-xs text-gray-400 mt-1">Keep practicing to unlock!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
