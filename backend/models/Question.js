const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  problem_id: {
    type: String,
    required: true,
    unique: true
  },
  frontend_id: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'pro', 'easy', 'medium', 'hard'],
    required: true
  },
  problem_slug: {
    type: String,
    required: true
  },
  topics: [String],
  description: {
    type: String,
    required: true
  },
  examples: [{
    input: String,
    output: String,
    explanation: String,
    // Keep old format for backward compatibility
    example_num: Number,
    example_text: String,
    images: [String]
  }],
  constraints: [String],
  follow_ups: [String],
  hints: [String],
  code_snippets: {
    type: Object,
    default: {}
  },
  solution: String,
  category: {
    type: String,
    enum: ['technical', 'hr', 'aptitude', 'general', 'logical', 'math'],
    default: 'technical'
  },
  type: {
    type: String,
    enum: ['coding', 'mcq', 'behavioral', 'reasoning'],
    default: 'coding'
  },
  company: [String],
  expectedApproach: String,
  boilerplateCode: {
    python: String,
    java: String,
    cpp: String,
    javascript: String,
    c: String,
    csharp: String,
    typescript: String,
    go: String,
    kotlin: String,
    swift: String,
    rust: String,
    ruby: String,
    php: String
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    explanation: String,
    isHidden: Boolean
  }],
  options: [String], // for MCQ
  correctAnswer: String, // for MCQ
  starMethodGuide: {
    situation: String,
    task: String,
    action: String,
    result: String
  },
  timeLimit: Number, // in minutes
  points: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
