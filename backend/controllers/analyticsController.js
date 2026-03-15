const Session = require('../models/Session');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Achievement = require('../models/Achievement');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skills = await Skill.findOne({ userId: req.userId });
    
    // Get date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    // Today's stats
    const todaySessions = await Session.find({
      userId: req.userId,
      completed: true,
      createdAt: { $gte: todayStart }
    });
    const todayStats = {
      sessions: todaySessions.length,
      time: Math.floor(todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
      avgScore: todaySessions.length > 0 
        ? Math.round(todaySessions.reduce((sum, s) => sum + (s.score || 0), 0) / todaySessions.length)
        : 0
    };

    // Yesterday's stats
    const yesterdaySessions = await Session.find({
      userId: req.userId,
      completed: true,
      createdAt: { $gte: yesterdayStart, $lt: todayStart }
    });
    const yesterdayStats = {
      sessions: yesterdaySessions.length,
      time: Math.floor(yesterdaySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
      avgScore: yesterdaySessions.length > 0
        ? Math.round(yesterdaySessions.reduce((sum, s) => sum + (s.score || 0), 0) / yesterdaySessions.length)
        : 0
    };

    // This week's stats
    const weekSessions = await Session.find({
      userId: req.userId,
      completed: true,
      createdAt: { $gte: weekStart }
    });
    const weekStats = {
      sessions: weekSessions.length,
      time: Math.floor(weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
      avgScore: weekSessions.length > 0
        ? Math.round(weekSessions.reduce((sum, s) => sum + (s.score || 0), 0) / weekSessions.length)
        : 0
    };
    
    // Get recent sessions
    const recentSessions = await Session.find({ 
      userId: req.userId, 
      completed: true 
    })
      .populate('questionId', 'title category difficulty')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get achievements preview (unlocked only)
    const achievements = await Achievement.find({ 
      userId: req.userId, 
      unlocked: true 
    })
      .sort({ unlockedAt: -1 })
      .limit(4);

    // Get progress over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const progressData = await Session.aggregate([
      {
        $match: {
          userId: user._id,
          completed: true,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      kpis: {
        totalSessions: user.totalInterviews || 0,
        practiceTime: user.practiceTime || 0,
        averageScore: user.averageScore || 0,
        bestScore: user.bestScore || 0,
        currentStreak: user.currentStreak || 0
      },
      todayStats,
      yesterdayStats,
      weekStats,
      skills: skills || { technical: 0, hr: 0, aptitude: 0, communication: 0 },
      recentSessions,
      achievements,
      progressData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed analytics
exports.getDetailedAnalytics = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Category-wise performance
    const categoryStats = await Session.aggregate([
      { $match: { userId: user._id, completed: true } },
      {
        $group: {
          _id: '$type',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
          totalTime: { $sum: '$duration' }
        }
      }
    ]);

    // Difficulty-wise performance
    const difficultyStats = await Session.aggregate([
      { $match: { userId: user._id, completed: true } },
      {
        $group: {
          _id: '$difficulty',
          avgScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Weekly performance trend
    const weeklyStats = await Session.aggregate([
      { $match: { userId: user._id, completed: true } },
      {
        $group: {
          _id: { $week: '$createdAt' },
          avgScore: { $avg: '$score' },
          count: { $sum: 1 },
          totalTime: { $sum: '$duration' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({
      categoryStats,
      difficultyStats,
      weeklyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get skills
exports.getSkills = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const skills = await Skill.findOne({ userId: req.userId });
    if (!skills) {
      return res.status(404).json({ message: 'Skills not found' });
    }
    res.json({ skills });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};