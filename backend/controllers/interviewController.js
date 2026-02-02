const axios = require('axios');
const Session = require('../models/Session');
const Result = require('../models/Result');
const { convertAudioToWav } = require('../utils/audioConverter');

async function start(req, res){
  const { mode } = req.body;
  const sessionType = mode.toLowerCase().replace(/\s+/g, '_'); // Convert to lowercase and replace spaces with underscores
  console.log('InterviewController.start - mode:', mode, 'sessionType:', sessionType, 'userId:', req.userId || req.user?.id);
  const session = await Session.create({ 
    userId: req.userId || req.user.id, 
    type: sessionType,
    startTime: new Date() 
  });
  res.json({ sessionId: session._id, session });
}

async function questions(req, res){
  const { mode } = req.query;
  const q = {
    Technical: ['Explain polymorphism in OOP.'],
    Coding: ['Describe logic to reverse a linked list.'],
    Aptitude: ['What is probability of getting two heads in coin toss?'],
    HR: ['Tell me about a challenge you overcame.'],
    Reverse: ['Ask the interviewer a deep question about product.'],
    Cultural: ['How do you handle diverse team perspectives?']
  };
  res.json({ questions: q[mode] || q.Technical });
}

async function submit(req, res){
  const mode = req.body.mode || 'Technical';
  const pyBase = req.app.get('PY_ENGINE_URL');
  const userId = req.userId || req.user?.id;
  console.log(`[Submit] Mode: ${mode}, User: ${userId}, Audio size: ${req.file?.buffer?.length || 0} bytes`);
  
  try {
    let audioBytes = req.file?.buffer;
    let transcript = '';
    
    // Convert audio to WAV if needed
    if(audioBytes && req.file?.mimetype !== 'audio/wav'){
      console.log(`[Submit] Converting ${req.file.mimetype} to WAV...`);
      audioBytes = await convertAudioToWav(audioBytes);
      console.log(`[Submit] Converted to WAV, size: ${audioBytes.length} bytes`);
    }
    
    // Transcribe audio
    if(audioBytes){
      console.log(`[Submit] Calling ${pyBase}/transcribe...`);
      const tr = await axios.post(`${pyBase}/transcribe`, audioBytes, { 
        headers: { 'Content-Type': 'audio/wav' },
        timeout: 60000,
        maxContentLength: 100 * 1024 * 1024
      });
      transcript = tr.data.text || '';
      console.log(`[Submit] Transcript: "${transcript.substring(0, 100)}..."`);
    } else {
      console.warn('[Submit] No audio provided, using empty transcript');
    }
    
    // NLP evaluation
    console.log(`[Submit] Calling ${pyBase}/evaluate...`);
    const nlp = (await axios.post(`${pyBase}/evaluate`, { text: transcript, mode }, { timeout: 20000 })).data;
    console.log('[Submit] NLP result:', nlp);
    
    // Emotion analysis
    console.log(`[Submit] Calling ${pyBase}/emotion...`);
    const emotion = (await axios.post(`${pyBase}/emotion`, audioBytes || Buffer.from([]), { 
      headers: { 'Content-Type': 'audio/wav' },
      timeout: 30000
    })).data;
    console.log('[Submit] Emotion result:', emotion);
    
    // Decision scoring
    console.log(`[Submit] Calling ${pyBase}/decide...`);
    const decision = (await axios.post(`${pyBase}/decide`, { nlp, emotion, mode }, { timeout: 20000 })).data;
    console.log('[Submit] Decision result:', decision);
    
    // Generate feedback
    console.log(`[Submit] Calling ${pyBase}/feedback...`);
    const feedbackData = (await axios.post(`${pyBase}/feedback`, { nlp, emotion, decision, mode }, { timeout: 20000 })).data;
    console.log('[Submit] Feedback result:', feedbackData);

    // Find or create a session for this result
    let session = await Session.findOne({ userId, type: mode.toLowerCase().replace(/\s+/g, '_'), completed: false }).sort({ startTime: -1 });
    if (!session) {
      session = await Session.create({ userId, type: mode.toLowerCase().replace(/\s+/g, '_'), startTime: new Date() });
    }

    // Update session with completion details
    const now = new Date();
    const durationSeconds = Math.floor((now - session.startTime) / 1000);
    session.endTime = now;
    session.duration = durationSeconds;
    session.score = decision.final_score || 70;
    session.completed = true;
    await session.save();
    console.log(`[Submit] Session ${session._id} marked as completed with score ${session.score}`);

    // Update user statistics
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      user.totalInterviews = (user.totalInterviews || 0) + 1;
      user.practiceTime = (user.practiceTime || 0) + Math.floor(durationSeconds / 60);
      
      // Calculate new average score
      const totalScore = ((user.averageScore || 0) * ((user.totalInterviews || 1) - 1)) + session.score;
      user.averageScore = Math.round(totalScore / user.totalInterviews);
      
      // Update best score
      user.bestScore = Math.max(user.bestScore || 0, session.score);
      
      await user.save();
      console.log(`[Submit] User stats updated: ${user.totalInterviews} interviews, ${user.practiceTime} min, avg ${user.averageScore}%`);
    }

    // Save to database
    console.log('[Submit] Saving result to database...');
    const result = await Result.create({ 
      sessionId: session._id,
      userId, 
      score: decision.final_score || 70,
      feedback: feedbackData.overall || 'Analysis completed',
      nlp, 
      emotion, 
      decision,
      detailedMetrics: {
        accuracy: nlp.relevance_score || 0,
        completeness: nlp.completeness_score || 0,
        communication: emotion.clarity || 0
      }
    });
    console.log(`[Submit] Result saved with ID: ${result._id}`);
    
    res.json({ transcript, nlp, emotion, decision, feedback: feedbackData, resultId: result._id });
  } catch(err){
    console.error('[Submit] Error:', err.message);
    if(err.response){
      console.error('[Submit] AI Engine response:', err.response.status, err.response.data);
      res.status(500).json({ error: `AI Engine error: ${err.response.data?.detail || err.message}` });
    } else if(err.code === 'ECONNREFUSED'){
      res.status(503).json({ error: 'AI Engine not reachable. Is it running on port 8000?' });
    } else {
      console.error('[Submit] Stack:', err.stack);
      res.status(500).json({ error: `Processing failed: ${err.message}` });
    }
  }
}

module.exports = { start, questions, submit };
