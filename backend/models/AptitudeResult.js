const mongoose = require('mongoose');

const aptitudeResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: 'all'
  },
  difficulty: {
    type: String,
    default: 'all'
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
      ref: 'Question'
    },
    selectedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('AptitudeResult', aptitudeResultSchema);