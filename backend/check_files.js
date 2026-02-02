const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for JSON files...');

const files = [
  'Aptitude_Questions.json',
  'logical_reasoning_questions.json', 
  'Mathematical_Aptitude_Questions.json',
  'technical_questions.json'
];

files.forEach(filename => {
  const filePath = path.join(__dirname, '..', filename);
  console.log(`📁 Checking: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`   ✅ Found ${data.length} questions`);
    } catch (error) {
      console.log(`   ❌ Error reading file: ${error.message}`);
    }
  } else {
    console.log(`   ❌ File not found`);
  }
});

console.log('\n🚀 Testing API endpoint simulation...');

// Simulate the loadAptitudeQuestionsFromJSON function
const loadAptitudeQuestionsFromJSON = () => {
  try {
    const files = [
      { path: '../Aptitude_Questions.json', category: 'aptitude' },
      { path: '../logical_reasoning_questions.json', category: 'logical' },
      { path: '../Mathematical_Aptitude_Questions.json', category: 'quantitative' },
      { path: '../technical_questions.json', category: 'technical' }
    ];
    
    let allQuestions = [];
    
    files.forEach(file => {
      try {
        const filePath = path.join(__dirname, file.path);
        if (fs.existsSync(filePath)) {
          const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`📂 Loaded ${jsonData.length} questions from ${file.path}`);
          
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
          console.log(`❌ File not found: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error loading ${file.path}:`, error.message);
      }
    });
    
    return allQuestions;
  } catch (error) {
    console.error('❌ Error loading aptitude questions:', error);
    return [];
  }
};

const questions = loadAptitudeQuestionsFromJSON();
console.log(`\n✅ Total questions loaded: ${questions.length}`);

if (questions.length > 0) {
  console.log('\n📋 Sample questions:');
  questions.slice(0, 3).forEach((q, index) => {
    console.log(`   ${index + 1}. ${q.title} (${q.company[0]}) - ${q.difficulty}`);
  });
}