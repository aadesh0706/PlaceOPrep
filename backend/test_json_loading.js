const fs = require('fs');
const path = require('path');

// Test the JSON loading function directly
const loadAptitudeQuestionsFromJSON = () => {
  try {
    const files = [
      { path: '../logical_reasoning.json', category: 'logical' },
      { path: '../mathematical_aptitude.json', category: 'quantitative' },
      { path: '../technical_questions.json', category: 'technical' }
    ];
    
    let allQuestions = [];
    
    files.forEach(file => {
      try {
        const filePath = path.join(__dirname, file.path);
        console.log(`📂 Loading ${file.path}...`);
        
        if (fs.existsSync(filePath)) {
          const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`   Found ${jsonData.length} questions`);
          
          const questions = jsonData.map(q => ({
            _id: q.id || `${q.company_tag}_${q.question_no}`,
            title: `Question ${q.question_no}`,
            description: q.question,
            options: [q.options.A, q.options.B, q.options.C, q.options.D],
            correctAnswer: q.answer,
            difficulty: q.difficulty || 'medium',
            category: q.category?.[0] || file.category,
            type: 'mcq',
            company: [q.company_tag],
            question_no: q.question_no
          }));
          
          allQuestions = allQuestions.concat(questions);
        } else {
          console.log(`   ❌ File not found: ${filePath}`);
        }
      } catch (error) {
        console.error(`   ❌ Error loading ${file.path}:`, error.message);
      }
    });
    
    return allQuestions;
  } catch (error) {
    console.error('❌ Error loading aptitude questions:', error);
    return [];
  }
};

console.log('🚀 Testing aptitude JSON loading...');
const questions = loadAptitudeQuestionsFromJSON();

console.log(`\n✅ Total questions loaded: ${questions.length}`);

// Group by company
const byCompany = {};
questions.forEach(q => {
  const company = q.company[0];
  if (!byCompany[company]) byCompany[company] = 0;
  byCompany[company]++;
});

console.log('\n🏢 Questions by company:');
Object.entries(byCompany).forEach(([company, count]) => {
  console.log(`   ${company}: ${count} questions`);
});

// Show sample questions
console.log('\n📋 Sample questions:');
questions.slice(0, 5).forEach((q, index) => {
  console.log(`   ${index + 1}. ${q.title} (${q.company[0]}) - ${q.difficulty}`);
  console.log(`      ${q.description.substring(0, 60)}...`);
});

console.log('\n✅ JSON loading test completed!');