const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/skillSpectrum')
  .then(async () => {
    console.log('Checking all questions in database...\n');

    const allQuestions = await Question.find({});
    console.log(`Total questions in database: ${allQuestions.length}\n`);

    if (allQuestions.length > 0) {
      // Count by category
      const categoryCount = {};
      allQuestions.forEach(q => {
        categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
      });
      console.log('Questions by category:');
      Object.entries(categoryCount).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });

      console.log('\nSample questions:');
      allQuestions.slice(0, 3).forEach((q, i) => {
        console.log(`${i+1}. Category: ${q.category}, Difficulty: ${q.difficulty}`);
        console.log(`   Company: ${JSON.stringify(q.company)}`);
        console.log(`   Title: ${q.title?.substring(0, 50)}...`);
        console.log('');
      });

    } else {
      console.log('No questions found in database at all!');
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });