const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Question Schema
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problem_id: { type: String, required: true, unique: true },
  frontend_id: { type: String, required: true },
  difficulty: { type: String, required: true },
  problem_slug: { type: String, required: true },
  topics: [String],
  description: { type: String, required: true },
  examples: [{
    input: String,
    output: String,
    explanation: String,
    // Keep old format for backward compatibility
    example_num: Number,
    example_text: String,
    images: [String]
  }],
  constraints: [String],
  follow_ups: [String],
  hints: [String],
  code_snippets: {
    type: Map,
    of: String
  },
  solution: String,
  category: { type: String, default: 'technical' },
  type: { type: String, default: 'coding' },
  testCases: [{
    input: String,
    expectedOutput: String,
    explanation: String
  }],
  boilerplateCode: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

async function importQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillspectrum');
    console.log('Connected to MongoDB');

    // Read the JSON file
    const jsonPath = path.join(__dirname, 'merged_problems.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`Found ${jsonData.questions.length} questions to import`);

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Transform and import questions
    const transformedQuestions = jsonData.questions.map(q => {
      // Convert examples to test cases - handle new format
      const testCases = q.examples.map(example => {
        let input = '';
        let expectedOutput = '';
        
        // Handle new format with input/output properties
        if (example.input && example.output) {
          input = example.input;
          expectedOutput = example.output;
        } else if (example.example_text) {
          // Handle old format for backward compatibility
          const lines = example.example_text.split('\n');
          for (const line of lines) {
            if (line.includes('Input:')) {
              input = line.replace('Input:', '').trim();
            }
            if (line.includes('Output:')) {
              expectedOutput = line.replace('Output:', '').trim();
              break;
            }
          }
        }
        
        return {
          input: input,
          expectedOutput: expectedOutput,
          explanation: example.explanation || example.example_text || `Input: ${input}, Output: ${expectedOutput}`
        };
      });

      // Convert code_snippets to boilerplateCode
      const boilerplateCode = {};
      if (q.code_snippets) {
        Object.entries(q.code_snippets).forEach(([lang, code]) => {
          // Map language names to match our system
          const langMap = {
            'python3': 'python',
            'python': 'python',
            'cpp': 'cpp',
            'java': 'java',
            'javascript': 'javascript',
            'c': 'c',
            'csharp': 'csharp',
            'typescript': 'typescript',
            'golang': 'go',
            'kotlin': 'kotlin',
            'swift': 'swift',
            'rust': 'rust',
            'ruby': 'ruby',
            'php': 'php'
          };
          
          const mappedLang = langMap[lang] || lang;
          boilerplateCode[mappedLang] = code;
        });
      }

      return {
        title: q.title,
        problem_id: q.problem_id,
        frontend_id: q.frontend_id,
        difficulty: q.difficulty.toLowerCase(),
        problem_slug: q.problem_slug,
        topics: q.topics || [],
        description: q.description,
        examples: q.examples || [],
        constraints: q.constraints || [],
        follow_ups: q.follow_ups || [],
        hints: q.hints || [],
        code_snippets: q.code_snippets || {},
        solution: q.solution || '',
        category: 'technical',
        type: 'coding',
        testCases: testCases,
        boilerplateCode: boilerplateCode
      };
    });

    // Insert questions in batches
    const batchSize = 50;
    for (let i = 0; i < transformedQuestions.length; i += batchSize) {
      const batch = transformedQuestions.slice(i, i + batchSize);
      await Question.insertMany(batch);
      console.log(`Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(transformedQuestions.length/batchSize)}`);
    }

    console.log(`Successfully imported ${transformedQuestions.length} questions`);
    
    // Verify import
    const count = await Question.countDocuments();
    console.log(`Total questions in database: ${count}`);

  } catch (error) {
    console.error('Error importing questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
importQuestions();