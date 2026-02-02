const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'coding', 'aptitude', 'hr', 'reverse', 'cultural', 'general', 'full_simulation'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'pro']
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  userAnswer: mongoose.Schema.Types.Mixed,
  code: String,
  language: String,
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 100
  },
  duration: Number, // in seconds
  feedback: {
    overall: String,
    strengths: [String],
    improvements: [String],
    detailedAnalysis: String,
    emotionAnalysis: mongoose.Schema.Types.Mixed,
    codeQuality: mongoose.Schema.Types.Mixed
  },
  completed: {
    type: Boolean,
    default: false
  },
  startTime: Date,
  endTime: Date
}, {
  timestamps: true
});

// Index for faster queries
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Session', sessionSchema);
