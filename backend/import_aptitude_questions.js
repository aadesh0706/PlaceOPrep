const mongoose = require('mongoose');
const Question = require('./models/Question');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';

async function importAptitudeQuestions() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // File paths
    const files = [
      { path: '../logical_reasoning.json', category: 'logical' },
      { path: '../Aptitude_Questions.json', category: 'aptitude' },
      { path: '../technical_questions.json', category: 'technical' },
      { path: '../mathematical_aptitude.json', category: 'quantitative' }
    ];

    let totalImported = 0;

    for (const file of files) {
      const filePath = path.join(__dirname, file.path);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        continue;
      }

      console.log(`📂 Processing ${file.path}...`);
      
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      for (const item of jsonData) {
        try {
          // Map category based on the original category or file type
          let category = 'aptitude';
          let type = 'mcq';
          
          if (item.category && item.category.length > 0) {
            const originalCategory = item.category[0];
            if (originalCategory === 'logical_reasoning') category = 'logical';
            else if (originalCategory === 'mathematical_aptitude') category = 'math';
            else if (originalCategory === 'technical_questions') category = 'technical';
          }

          const questionData = {
            title: `Question ${item.question_no}`,
            problem_id: item.id || `${item.company_tag}_${category}_${item.question_no}`,
            frontend_id: item.id || `${item.company_tag}_${category}_${item.question_no}`,
            problem_slug: `question-${item.question_no}-${item.company_tag}`,
            description: item.question,
            options: [
              item.options.A,
              item.options.B,
              item.options.C,
              item.options.D
            ],
            correctAnswer: item.answer,
            difficulty: item.difficulty || 'medium',
            category: category,
            type: type,
            company: [item.company_tag],
            topics: item.category || [category],
            points: 10
          };

          // Check if question already exists
          const existingQuestion = await Question.findOne({
            $or: [
              { problem_id: questionData.problem_id },
              { description: questionData.description }
            ]
          });

          if (existingQuestion) {
            console.log(`   ⚠️  Question ${item.question_no} already exists, skipping...`);
            continue;
          }

          await Question.create(questionData);
          console.log(`   ✅ Imported question ${item.question_no} (${category})`);
          totalImported++;

        } catch (error) {
          console.error(`   ❌ Error importing question ${item.question_no}:`, error.message);
        }
      }
    }

    // Show summary
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total questions imported: ${totalImported}`);

    // Count by category
    const categories = await Question.aggregate([
      { $match: { type: 'aptitude' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    console.log(`\n📋 Questions by category:`);
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} questions`);
    });

    // Count by company
    const companies = await Question.aggregate([
      { $match: { type: 'aptitude' } },
      { $unwind: '$company' },
      { $group: { _id: '$company', count: { $sum: 1 } } }
    ]);

    console.log(`\n🏢 Questions by company:`);
    companies.forEach(comp => {
      console.log(`   ${comp._id}: ${comp.count} questions`);
    });

    console.log(`\n✅ Aptitude questions import completed!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importAptitudeQuestions();