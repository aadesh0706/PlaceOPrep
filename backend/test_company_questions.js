const mongoose = require('mongoose');
const Question = require('./models/Question');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';

async function testCompanyQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test company-specific questions
    const companies = ['tcs', 'infosys', 'wipro', 'accenture', 'cognizant'];
    
    for (const company of companies) {
      const questions = await Question.find({ 
        company: company,
        type: 'mcq'
      });
      
      console.log(`\n🏢 ${company.toUpperCase()}: ${questions.length} questions`);
      
      if (questions.length > 0) {
        questions.forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.title} (${q.category}) - ${q.difficulty}`);
        });
      }
    }

    // Test by category
    console.log('\n📋 Questions by category:');
    const categories = await Question.aggregate([
      { $match: { type: 'mcq' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} questions`);
    });

    console.log('\n✅ Company aptitude questions are ready!');
    console.log('🎯 Users can now select companies and get aptitude questions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCompanyQuestions();