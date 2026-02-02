const Question = require('../models/Question');
const fs = require('fs');
const path = require('path');

// Load aptitude questions from JSON files
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
        if (fs.existsSync(filePath)) {
          const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          const questions = jsonData.map(q => {
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
            
            return {
              _id: q.id || `${q.company_tag}_${q.question_no}`,
              title: `Question ${q.question_no}`,
              description: q.question,
              options: [q.options.A, q.options.B, q.options.C, q.options.D],
              correctAnswer: q.answer,
              difficulty: q.difficulty || 'medium',
              category: mappedCategory,
              type: 'mcq',
              company: [q.company_tag],
              question_no: q.question_no,
              companyTag: q.company_tag
            };
          });
          
          allQuestions = allQuestions.concat(questions);
        }
      } catch (error) {
        console.error(`Error loading ${file.path}:`, error.message);
      }
    });
    
    return allQuestions;
  } catch (error) {
    console.error('Error loading aptitude questions:', error);
    return [];
  }
};
const loadQuestionsFromJSON = () => {
  try {
    const jsonPath = path.join(__dirname, '..', 'merged_problems.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Transform questions to match our schema
    return jsonData.questions.map(q => {
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

      return {
        _id: q.problem_id,
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
        boilerplateCode: q.code_snippets || {}
      };
    });
  } catch (error) {
    console.error('Error loading questions from JSON:', error);
    return [];
  }
};

// Get all questions with filters
exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, company, type } = req.query;
    
    // For aptitude questions, load from JSON files
    if (category === 'aptitude' || category === 'technical' || category === 'logical' || category === 'quantitative') {
      let questions = loadAptitudeQuestionsFromJSON();
      
      // Apply category filter
      if (category && category !== 'aptitude') {
        questions = questions.filter(q => q.category === category);
      }
      
      // Apply difficulty filter
      if (difficulty) {
        questions = questions.filter(q => q.difficulty === difficulty.toLowerCase());
      }
      
      // Apply company filter
      if (company) {
        questions = questions.filter(q => 
          q.company.includes(company) || 
          q.companyTag === company
        );
      }
      
      // Return all questions
      return res.json({ questions });
    }
    
    // For coding questions, load from JSON
    let questions = loadQuestionsFromJSON();
    
    // Apply filters
    if (category && category !== 'aptitude') {
      questions = questions.filter(q => q.category === category);
    }
    
    if (type) {
      questions = questions.filter(q => q.type === type);
    }
    
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty.toLowerCase());
    }
    
    if (company) {
      questions = questions.filter(q => q.company && q.company.includes(company));
    }

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get random question
exports.getRandomQuestion = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const count = await Question.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne(filter).skip(random);

    if (!question) {
      return res.status(404).json({ message: 'No questions found' });
    }

    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First try to find in JSON files (for aptitude questions)
    const aptitudeQuestions = loadAptitudeQuestionsFromJSON();
    const aptitudeQuestion = aptitudeQuestions.find(q => q._id === id);
    
    if (aptitudeQuestion) {
      return res.json({ question: aptitudeQuestion });
    }
    
    // Then try coding questions from JSON
    const codingQuestions = loadQuestionsFromJSON();
    const codingQuestion = codingQuestions.find(q => q._id === id || q.problem_id === id);
    
    if (codingQuestion) {
      return res.json({ question: codingQuestion });
    }
    
    // Finally try database as fallback
    const dbQuestion = await Question.findOne({
      $or: [
        { problem_id: id },
        { _id: id }
      ]
    });
    
    if (dbQuestion) {
      return res.json({ question: dbQuestion });
    }
    
    return res.status(404).json({ message: 'Question not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create question (admin)
exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
