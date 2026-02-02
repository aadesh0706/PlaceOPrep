const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/skillSpectrum', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const questions = await Question.find({}).limit(5);
    console.log('Sample questions:');
    questions.forEach((q, i) => {
      console.log(`Question ${i+1}:`);
      console.log(`  Category: ${q.category}`);
      console.log(`  Difficulty: ${q.difficulty}`);
      console.log(`  Company: ${q.company}`);
      console.log('');
    });

    // Count by category
    const categories = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    console.log('Categories count:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });