const Session = require('../models/Session');
const User = require('../models/User');
const Question = require('../models/Question');
const Skill = require('../models/Skill');
const Achievement = require('../models/Achievement');

// Helper function to update achievements
const updateAchievements = async (userId, type, score) => {
  const user = await User.findById(userId);
  
  // Update first_steps
  await Achievement.findOneAndUpdate(
    { userId, type: 'first_steps' },
    { $inc: { progress: 1 }, $set: { unlocked: true, unlockedAt: new Date() } }
  );

  // Update getting_started (5 interviews)
  if (user.totalInterviews >= 5) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'getting_started' },
      { progress: user.totalInterviews, unlocked: true, unlockedAt: new Date() }
    );
  }

  // Update practice_perfect (10 interviews)
  if (user.totalInterviews >= 10) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'practice_perfect' },
      { progress: user.totalInterviews, unlocked: true, unlockedAt: new Date() }
    );
  }

  // Update streak achievements
  if (user.currentStreak >= 3) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'consistency' },
      { progress: user.currentStreak, unlocked: true, unlockedAt: new Date() }
    );
  }

  if (user.currentStreak >= 7) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'week_warrior' },
      { progress: user.currentStreak, unlocked: true, unlockedAt: new Date() }
    );
  }

  // Update score achievements
  if (score >= 80) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'high_performer' },
      { $inc: { progress: 1 }, $set: { unlocked: true, unlockedAt: new Date() } }
    );
  }

  if (score >= 90) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'excellence' },
      { $inc: { progress: 1 }, $set: { unlocked: true, unlockedAt: new Date() } }
    );
  }

  // Update category-specific achievements
  const categoryMap = {
    'technical': 'technical_master',
    'hr': 'communication_expert',
    'aptitude': 'aptitude_ace',
    'full_simulation': 'simulation_champion'
  };

  if (categoryMap[type]) {
    const count = await Session.countDocuments({ userId, type, completed: true });
    const target = type === 'full_simulation' ? 1 : 5;
    
    if (count >= target) {
      await Achievement.findOneAndUpdate(
        { userId, type: categoryMap[type] },
        { progress: count, unlocked: true, unlockedAt: new Date() }
      );
    }
  }

  // Update time warrior (10 hours = 600 minutes)
  if (user.practiceTime >= 600) {
    await Achievement.findOneAndUpdate(
      { userId, type: 'time_warrior' },
      { progress: user.practiceTime, unlocked: true, unlockedAt: new Date() }
    );
  }
};

// Helper function to update skills
const updateSkills = async (userId, type, score) => {
  const skillMap = {
    'technical': 'technical',
    'hr': 'hr',
    'aptitude': 'aptitude',
    'general': 'communication'
  };

  const skillKey = skillMap[type];
  if (!skillKey) return;

  const skill = await Skill.findOne({ userId });
  if (!skill) return;

  // Calculate new skill level (weighted average)
  const currentValue = skill[skillKey] || 0;
  const newValue = Math.round((currentValue * 0.7) + (score * 0.3));

  await Skill.findOneAndUpdate(
    { userId },
    { [skillKey]: newValue, lastUpdated: new Date() }
  );
};

// Start session
exports.startSession = async (req, res) => {
  console.log('=== startSession controller called ===');
  console.log('Request body:', req.body);
  console.log('User ID:', req.userId);
  try {
    const { mode, type, difficulty, questionId } = req.body;
    const sessionType = mode || type; // Accept both 'mode' and 'type'

    let question;
    if (questionId) {
      // Validate ObjectId before querying
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ message: 'Invalid question ID' });
      }
      question = await Question.findById(questionId);
    } else {
      // Get random question
      const filter = { category: sessionType };
      if (difficulty) filter.difficulty = difficulty;
      
      console.log('Finding question with filter:', filter);
      const count = await Question.countDocuments(filter);
      console.log('Question count:', count);
      const random = Math.floor(Math.random() * count);
      question = await Question.findOne(filter).skip(random);
      console.log('Found question:', question ? question._id : 'null');
    }

    if (!question) {
      console.log('No question found - returning 404');
      return res.status(404).json({ message: 'No questions available' });
    }

    const session = await Session.create({
      userId: req.userId,
      type: sessionType,
      difficulty: difficulty || question.difficulty,
      questionId: question._id,
      startTime: new Date()
    });

    console.log('Session created, sending response');
    res.status(201).json({ session, question });
  } catch (error) {
    console.error('Error in startSession:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit session
exports.submitSession = async (req, res) => {
  try {
    const { sessionId, code, language, userAnswer, score } = req.body;

    const session = await Session.findById(sessionId).populate('questionId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000);

    // Update session with metadata (like aptitude system)
    session.code = code;
    session.language = language;
    session.userAnswer = userAnswer;
    session.score = score || 100;
    session.endTime = endTime;
    session.duration = duration;
    session.completed = true;
    session.status = 'completed';
    
    // Save metadata like aptitude system
    session.metadata = {
      questionId: session.questionId._id,
      code: code,
      language: language,
      runtime: '0 ms',
      testCasesPassed: 0,
      totalTestCases: 0
    };
    
    await session.save();

    res.json({ session, score: score || 100, message: 'Session completed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user sessions
exports.getUserSessions = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const filter = { userId: req.userId, completed: true };
    
    if (type) filter.type = type;

    const sessions = await Session.find(filter)
      .populate('questionId', 'title difficulty category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Session.countDocuments(filter);

    res.json({ sessions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('questionId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
