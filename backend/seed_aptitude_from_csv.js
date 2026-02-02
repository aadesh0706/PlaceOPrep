const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('./models/Question');
require('dotenv').config();

async function seedAptitudeFromJSON() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    console.log('\n📄 Loading questions from JSON files...');
    
    const files = [
      { path: '../logical_reasoning.json', category: 'logical' },
      { path: '../mathematical_aptitude.json', category: 'quantitative' },
      { path: '../technical_questions.json', category: 'technical' }
    ];
    
    let totalQuestions = 0;
    
    for (const file of files) {
      const filePath = path.join(__dirname, file.path);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
      }
      
      console.log(`📂 Processing ${file.path}...`);
      
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`   Found ${jsonData.length} questions`);
      
      for (const q of jsonData) {
        try {
          // Map categories from JSON to valid enum values
          let mappedCategory = file.category; // default from file mapping
          if (q.category && Array.isArray(q.category)) {
            for (const cat of q.category) {
              switch(cat.toLowerCase()) {
                case 'technical_questions':
                  mappedCategory = 'technical';
                  break;
                case 'logical_reasoning':
                  mappedCategory = 'logical';
                  break;
                case 'mathematical_aptitude':
                  mappedCategory = 'quantitative';
                  break;
              }
              if (mappedCategory !== file.category) break; // Use first specific match
            }
          }
          
          const questionData = {
            title: `Question ${q.question_no}`,
            problem_id: q.id || `${q.company_tag}_${q.question_no}`,
            frontend_id: q.id || `${q.company_tag}_${q.question_no}`,
            problem_slug: `question-${q.question_no}-${q.company_tag}`,
            description: q.question,
            options: [q.options.A, q.options.B, q.options.C, q.options.D],
            correctAnswer: q.answer,
            difficulty: q.difficulty || 'medium',
            category: mappedCategory,
            type: 'mcq',
            company: [q.company_tag],
            topics: q.category || [mappedCategory],
            points: 10
          };
          
          // Check if question already exists
          const existingQuestion = await Question.findOne({
            $or: [
              { problem_id: questionData.problem_id },
              { description: questionData.description }
            ]
          });
          
          if (!existingQuestion) {
            await Question.create(questionData);
            totalQuestions++;
          }
        } catch (error) {
          console.error(`   ❌ Error importing question ${q.question_no}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Successfully imported ${totalQuestions} questions to database!`);
    console.log('\n📊 Questions are now available in MongoDB for the aptitude section.');
    
    // Show distribution by category and difficulty
    const stats = await Question.aggregate([
      { $match: { type: 'mcq' } },
      { $group: { _id: { category: '$category', difficulty: '$difficulty' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1, '_id.difficulty': 1 } }
    ]);
    
    console.log('\n📈 Distribution by category and difficulty:');
    stats.forEach(stat => {
      console.log(`   ${stat._id.category}-${stat._id.difficulty}: ${stat.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAptitudeFromJSON();