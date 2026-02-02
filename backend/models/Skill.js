const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  technical: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  hr: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aptitude: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  communication: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
