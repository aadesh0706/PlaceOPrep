const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Question routes
router.get('/', questionController.getQuestions);
router.get('/random', questionController.getRandomQuestion);
router.get('/:id', questionController.getQuestionById);
router.post('/', questionController.createQuestion);

module.exports = router;
