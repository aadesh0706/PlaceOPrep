const Submission = require('../models/Submission');
const Question = require('../models/Question');

// Submit a coding solution
exports.submitSolution = async (req, res) => {
  try {
    console.log('=== Submission Request ===');
    console.log('Body:', req.body);
    console.log('User ID:', req.userId);
    
    const { questionId, code, language, testResults } = req.body;
    
    if (!questionId || !code || !language || !testResults) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Only save if all test cases passed
    if (!testResults.passed) {
      console.log('Test cases did not pass');
      return res.status(400).json({ message: 'All test cases must pass to submit' });
    }

    // Load questions from JSON to get difficulty
    const fs = require('fs');
    const path = require('path');
    let difficulty = 'medium'; // default
    
    try {
      const jsonPath = path.join(__dirname, '..', 'merged_problems.json');
      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const question = jsonData.questions.find(q => q.problem_id === questionId || q._id === questionId);
      
      if (question) {
        const difficultyMap = {
          'beginner': 'easy',
          'easy': 'easy',
          'intermediate': 'medium',
          'medium': 'medium',
          'advanced': 'hard',
          'hard': 'hard',
          'pro': 'hard'
        };
        difficulty = difficultyMap[question.difficulty?.toLowerCase()] || 'medium';
        console.log('Found question difficulty:', difficulty);
      }
    } catch (error) {
      console.log('Could not load question from JSON, using default difficulty');
    }

    // Always create new submission for history tracking
    console.log('Creating new submission');
    const submission = await Submission.create({
      userId: req.userId,
      questionId: questionId,
      code: code,
      language: language,
      difficulty: difficulty,
      runtime: testResults.runtime || '0 ms',
      testCasesPassed: testResults.testCases?.length || 0,
      totalTestCases: testResults.testCases?.length || 0,
      status: 'accepted'
    });

    console.log('Submission created successfully:', submission._id);
    res.status(201).json({ 
      message: 'Solution submitted successfully',
      submission: submission 
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const { difficulty, status } = req.query;
    const filter = { userId: req.userId };
    
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .select('questionId code language status runtime createdAt testCasesPassed totalTestCases difficulty');

    res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get submission stats
exports.getSubmissionStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          accepted: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 }
    };

    stats.forEach(stat => {
      if (result[stat._id]) {
        result[stat._id].solved = stat.accepted;
      }
    });

    // Get total questions count by difficulty
    const totalQuestions = await Question.aggregate([
      { $match: { category: 'technical', type: 'coding' } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $in: ['$difficulty', ['beginner', 'easy']] }, then: 'easy' },
                { case: { $in: ['$difficulty', ['intermediate', 'medium']] }, then: 'medium' },
                { case: { $in: ['$difficulty', ['advanced', 'hard', 'pro']] }, then: 'hard' }
              ],
              default: 'medium'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    totalQuestions.forEach(total => {
      if (result[total._id]) {
        result[total._id].total = total.count;
      }
    });

    res.json({ stats: result });
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if question is solved
exports.checkSolved = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const submission = await Submission.findOne({
      userId: req.userId,
      questionId: questionId,
      status: 'accepted'
    });

    res.json({ solved: !!submission });
  } catch (error) {
    console.error('Error checking solved status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get submission history for a specific question
exports.getQuestionSubmissions = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const submissions = await Submission.find({
      questionId: questionId // Use string questionId, not ObjectId
    })
    .sort({ createdAt: -1 })
    .select('code language status runtime createdAt testCasesPassed totalTestCases');

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching question submissions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};