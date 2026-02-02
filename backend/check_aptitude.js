const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

async function check() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    const questions = await Question.find({ category: { $in: ['logical', 'math', 'technical'] } });
    console.log(`Found ${questions.length} aptitude questions:`);
    questions.forEach(q => {
      console.log(`- ${q.category}: ${q.title.substring(0, 50)}...`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();