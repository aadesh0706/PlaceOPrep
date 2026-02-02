const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('./models/Question');
require('dotenv').config();

async function seedFromJSON() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Read the JSON files
    const technical = JSON.parse(fs.readFileSync('../technical_questions.json', 'utf8'));
    const logical = JSON.parse(fs.readFileSync('../logical_reasoning.json', 'utf8'));
    const math = JSON.parse(fs.readFileSync('../mathematical_aptitude.json', 'utf8'));

    const allQuestions = [...technical, ...logical, ...math];

    console.log(`📊 Total questions to import: ${allQuestions.length}`);

    // Clear existing aptitude questions
    const deleteResult = await Question.deleteMany({ category: 'aptitude' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing aptitude questions`);

    // Save new questions
    let savedCount = 0;
    for (const q of allQuestions) {
      try {
        // Map category
        let cat = 'aptitude';
        if (q.category.includes('technical_questions')) cat = 'technical';
        else if (q.category.includes('logical_reasoning')) cat = 'logical';
        else if (q.category.includes('mathematical_aptitude')) cat = 'math';

        // Transform to match the existing model
        const questionData = {
          title: q.question,
          description: q.question,
          category: cat,
          difficulty: q.difficulty,
          type: 'mcq',
          company: [q.company_tag],
          options: [q.options.A, q.options.B, q.options.C, q.options.D],
          correctAnswer: q.answer,
          points: q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 15 : 20
        };
        await Question.create(questionData);
        savedCount++;
      } catch (error) {
        console.error('Error saving question:', error.message);
      }
    }

    console.log(`✅ Successfully imported ${savedCount} aptitude questions!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedFromJSON();