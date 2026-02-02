const express = require('express');
const router = express.Router();
const multer = require('multer');
const sessionController = require('../controllers/sessionController');
const questionController = require('../controllers/questionController');
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/auth');

const upload = multer();

// All routes require authentication
router.use(authMiddleware);

// Session management - use interviewController for audio-based interviews
router.post('/start', (req, res, next) => {
  console.log('Start route handler called');
  next();
}, interviewController.start);
router.post('/submit', upload.single('audio'), interviewController.submit);

// Questions
router.get('/questions', interviewController.questions);
router.get('/question/:id', questionController.getQuestionById);
router.get('/question/random', questionController.getRandomQuestion);

module.exports = router;
