const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: String, // Changed from ObjectId to String to support JSON question IDs
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  runtime: {
    type: String,
    default: '0 ms'
  },
  memory: {
    type: String,
    default: '0 MB'
  },
  status: {
    type: String,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error'],
    default: 'accepted'
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
submissionSchema.index({ userId: 1, questionId: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ questionId: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);