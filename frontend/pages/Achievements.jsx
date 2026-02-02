import { useEffect, useState } from 'react';
import { Trophy, Lock } from 'lucide-react';
import api from '../services/api';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ unlocked: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get('/achievements');
      setAchievements(response.data.achievements);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Achievements</h1>
        <p className="text-gray-600 text-lg">Track your progress and unlock new achievements</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {stats.unlocked} / {stats.total} Achievements
            </h2>
            <p className="text-gray-600">You're {stats.percentage}% complete!</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded-lg">
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className={`rounded-xl shadow-md p-6 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                : 'bg-white border-2 border-gray-200 opacity-60'
            }`}
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`text-4xl ${
                  achievement.unlocked ? 'grayscale-0' : 'grayscale'
                }`}
              >
                {achievement.icon || '🏆'}
              </div>
              {!achievement.unlocked && (
                <Lock className="w-6 h-6 text-gray-400" />
              )}
            </div>

            {/* Title & Description */}
            <h3 className={`text-xl font-bold mb-2 ${
              achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {achievement.name}
            </h3>
            <p className={`text-sm mb-4 ${
              achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {achievement.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-700">
                  {achievement.progress} / {achievement.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-r from-green-400 to-green-600'
                      : 'bg-gradient-to-r from-blue-400 to-blue-600'
                  }`}
                  style={{
                    width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Unlocked Date */}
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No achievements yet</p>
          <p className="text-gray-400 text-sm">Start practicing to unlock achievements!</p>
        </div>
      )}
    </div>
  );
}
