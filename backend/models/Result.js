const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  feedback: String,
  detailedMetrics: {
    accuracy: Number,
    completeness: Number,
    codeQuality: Number,
    communication: Number
  },
  nlp: Object,
  emotion: Object,
  decision: Object
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);