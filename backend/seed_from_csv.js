const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Question = require('./models/Question');

dotenv.config();

// Topic to category mapping
const topicToCategory = {
  'SQL': 'technical',
  'DSA': 'technical',
  'C Programming': 'technical',
  'C++': 'technical',
  'Trees': 'technical',
  'Linked List': 'technical',
  'Algorithms': 'technical',
  'OS': 'technical',
  'OOP': 'technical',
  'DP': 'technical',
  'Hashing': 'technical',
  'Sorting': 'technical',
  'Graphs': 'technical',
  'Strings': 'technical',
  'Java': 'technical',
  'Networking': 'technical',
  'DBMS': 'technical',
  'System Design': 'technical',
  'Technical-C': 'technical',
  'Technical-C++': 'technical',
  'Technical-Java': 'technical',
  'Technical-DBMS': 'technical',
  'Data Structures': 'technical',
  'Scheduling': 'technical',
  'Electronics': 'technical',
  'Physics': 'technical',
  'Chemistry': 'technical',
  'Calculus': 'technical',
  'Shell': 'technical',
  'Math': 'technical',
  'Estimation': 'technical',
  'Logic': 'technical',
  'Probability': 'aptitude',
  'Quantitative Aptitude': 'aptitude',
  'Logical Reasoning': 'aptitude',
  'Direction Sense': 'aptitude',
  'Blood Relation': 'aptitude',
  'Seating Arrangement': 'aptitude',
  'Coding-Decoding': 'aptitude',
  'Analytical Reasoning': 'aptitude',
  'Permutation': 'aptitude',
  'Series': 'aptitude',
  'Combinatorics': 'aptitude',
  'Maths': 'aptitude',
  'General': 'hr',
  'English Comprehension': 'general',
  'English Vocabulary': 'general',
  'Grammar': 'general',
  'Sentence Improvement': 'general',
  'Inference': 'general'
};

// Topic to type mapping
const topicToType = {
  'SQL': 'coding',
  'DSA': 'coding',
  'C Programming': 'coding',
  'C++': 'coding',
  'Trees': 'coding',
  'Linked List': 'coding',
  'Algorithms': 'coding',
  'OS': 'behavioral',
  'OOP': 'behavioral',
  'DP': 'coding',
  'Hashing': 'coding',
  'Sorting': 'coding',
  'Graphs': 'coding',
  'Strings': 'coding',
  'Java': 'coding',
  'Networking': 'behavioral',
  'DBMS': 'behavioral',
  'System Design': 'behavioral',
  'Technical-C': 'coding',
  'Technical-C++': 'coding',
  'Technical-Java': 'coding',
  'Technical-DBMS': 'behavioral',
  'Data Structures': 'coding',
  'Scheduling': 'behavioral',
  'Electronics': 'behavioral',
  'Physics': 'behavioral',
  'Chemistry': 'behavioral',
  'Calculus': 'behavioral',
  'Shell': 'coding',
  'Math': 'reasoning',
  'Estimation': 'reasoning',
  'Logic': 'reasoning',
  'Probability': 'reasoning',
  'Quantitative Aptitude': 'reasoning',
  'Logical Reasoning': 'reasoning',
  'Direction Sense': 'reasoning',
  'Blood Relation': 'reasoning',
  'Seating Arrangement': 'reasoning',
  'Coding-Decoding': 'reasoning',
  'Analytical Reasoning': 'reasoning',
  'Permutation': 'reasoning',
  'Series': 'reasoning',
  'Combinatorics': 'reasoning',
  'Maths': 'reasoning',
  'General': 'behavioral',
  'English Comprehension': 'mcq',
  'English Vocabulary': 'mcq',
  'Grammar': 'mcq',
  'Sentence Improvement': 'mcq',
  'Inference': 'reasoning'
};

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 3 && values[2]) { // At least company, topic, question
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] || '';
      });
      data.push(obj);
    }
  }
  return data;
}

function determineDifficulty(topic, question) {
  const advancedTopics = ['System Design', 'DP', 'Graphs', 'Algorithms'];
  const intermediateTopics = ['DSA', 'Trees', 'OOP', 'OS', 'Networking'];
  
  if (advancedTopics.includes(topic)) return 'advanced';
  if (intermediateTopics.includes(topic)) return 'intermediate';
  if (question.toLowerCase().includes('design') || question.toLowerCase().includes('implement')) {
    return 'advanced';
  }
  if (question.toLowerCase().includes('explain') || question.toLowerCase().includes('difference')) {
    return 'intermediate';
  }
  return 'beginner';
}

async function seedFromCSV() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeoprep';
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing questions (optional - comment out if you want to keep existing)
    // await Question.deleteMany({});
    // console.log('Cleared existing questions');

    const csvFiles = [
      path.join(__dirname, '../ai-engine/datasets/skillspectrum_interview_training_dataset.csv'),
      path.join(__dirname, '../ai-engine/datasets/skillspectrum_infosys_wipro_training_dataset.csv')
    ];

    let totalAdded = 0;

    for (const csvFile of csvFiles) {
      if (!fs.existsSync(csvFile)) {
        console.log(`⚠️  File not found: ${csvFile}`);
        continue;
      }

      console.log(`\nProcessing ${path.basename(csvFile)}...`);
      const data = parseCSV(csvFile);
      console.log(`Found ${data.length} questions`);

      for (const row of data) {
        const company = (row.company || '').trim();
        const topic = (row.topic || '').trim();
        const question = (row.question || '').trim();
        const answer = (row.answer || '').trim();

        if (!question) continue;

        const category = topicToCategory[topic] || 'technical';
        const type = topicToType[topic] || 'behavioral';
        const difficulty = determineDifficulty(topic, question);
        const companies = company ? [company] : [];

        // Check if question already exists
        const existing = await Question.findOne({ description: question });
        if (existing) {
          // Update company tags if not present
          if (company && !existing.company.includes(company)) {
            existing.company.push(company);
            await existing.save();
          }
          continue;
        }

        const questionDoc = {
          title: question.substring(0, 100) || `${topic} Question`,
          description: question,
          category: category,
          difficulty: difficulty,
          type: type,
          company: companies,
          points: difficulty === 'advanced' ? 20 : difficulty === 'intermediate' ? 15 : 10,
          timeLimit: difficulty === 'advanced' ? 45 : difficulty === 'intermediate' ? 30 : 20
        };

        // Add boilerplate code for coding questions
        if (type === 'coding') {
          questionDoc.boilerplateCode = {
            python: `def solution():\n    # ${question.substring(0, 50)}\n    pass`,
            java: `public class Solution {\n    public void solution() {\n        // ${question.substring(0, 50)}\n    }\n}`,
            cpp: `void solution() {\n    // ${question.substring(0, 50)}\n}`,
            javascript: `function solution() {\n    // ${question.substring(0, 50)}\n}`
          };
        }

        // Add STAR method guide for HR questions
        if (category === 'hr') {
          questionDoc.starMethodGuide = {
            situation: 'Describe the context or situation',
            task: 'Explain your responsibility or goal',
            action: 'Detail the steps you took',
            result: 'Share the outcome and what you learned'
          };
        }

        await Question.create(questionDoc);
        totalAdded++;
      }
    }

    console.log(`\n✅ Successfully added ${totalAdded} questions to database`);
    console.log(`📊 Total questions in database: ${await Question.countDocuments()}`);
    
    // Print statistics
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\nQuestions by category:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedFromCSV();
