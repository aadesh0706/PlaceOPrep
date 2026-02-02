const Achievement = require('../models/Achievement');

// Get user achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId }).sort({ type: 1 });
    
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;

    res.json({ 
      achievements, 
      stats: {
        unlocked: unlockedCount,
        total: totalCount,
        percentage: Math.round((unlockedCount / totalCount) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get achievement by type
exports.getAchievementByType = async (req, res) => {
  try {
    const achievement = await Achievement.findOne({
      userId: req.userId,
      type: req.params.type
    });

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    res.json({ achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
