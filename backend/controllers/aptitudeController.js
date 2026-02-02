const Result = require('../models/Result');
const Session = require('../models/Session');

// Save aptitude exam result
exports.saveAptitudeResult = async (req, res) => {
  try {
    const { category, difficulty, score, totalQuestions, correctAnswers, timeSpent, questions } = req.body;

    // Create a session for the aptitude test
    const session = new Session({
      userId: req.userId,
      type: 'aptitude',
      status: 'completed',
      metadata: {
        category: category || 'all',
        difficulty: difficulty || 'all',
        totalQuestions,
        correctAnswers,
        timeSpent,
        questions: questions || []
      }
    });
    
    await session.save();

    // Create result linked to the session
    const result = new Result({
      sessionId: session._id,
      userId: req.userId,
      score,
      feedback: `Aptitude Test - ${category || 'All Categories'} (${difficulty || 'All Levels'})`,
      detailedMetrics: {
        accuracy: Math.round((correctAnswers / totalQuestions) * 100),
        completeness: 100,
        codeQuality: 0,
        communication: 0
      }
    });

    await result.save();
    res.status(201).json({ message: 'Result saved successfully', result, session });
  } catch (error) {
    console.error('Error saving aptitude result:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's aptitude results
exports.getAptitudeResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.userId })
      .populate({
        path: 'sessionId',
        match: { type: 'aptitude' },
        select: 'type status metadata createdAt'
      })
      .sort({ createdAt: -1 });
    
    // Filter out results where sessionId is null (non-aptitude sessions)
    const aptitudeResults = results.filter(r => r.sessionId);
    
    res.json({ results: aptitudeResults });
  } catch (error) {
    console.error('Error fetching aptitude results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get aptitude statistics
exports.getAptitudeStats = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.userId })
      .populate({
        path: 'sessionId',
        match: { type: 'aptitude' },
        select: 'type metadata'
      });
    
    const aptitudeResults = results.filter(r => r.sessionId);

    const stats = {
      totalExams: aptitudeResults.length,
      averageScore: aptitudeResults.length > 0 ? Math.round(aptitudeResults.reduce((sum, r) => sum + r.score, 0) / aptitudeResults.length) : 0,
      totalTime: aptitudeResults.reduce((sum, r) => sum + (r.sessionId.metadata?.timeSpent || 0), 0),
      bestScore: aptitudeResults.length > 0 ? Math.max(...aptitudeResults.map(r => r.score)) : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching aptitude stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};