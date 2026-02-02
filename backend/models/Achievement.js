const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'first_steps',
      'getting_started',
      'practice_perfect',
      'consistency',
      'week_warrior',
      'high_performer',
      'excellence',
      'technical_master',
      'communication_expert',
      'aptitude_ace',
      'simulation_champion',
      'time_warrior'
    ],
    required: true
  },
  name: String,
  description: String,
  icon: String,
  progress: {
    type: Number,
    default: 0
  },
  target: Number,
  unlocked: {
    type: Boolean,
    default: false
  },
  unlockedAt: Date
}, {
  timestamps: true
});

// Create unique index
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
