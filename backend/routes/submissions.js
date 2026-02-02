const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const submissionController = require('../controllers/submissionController');

// Submit solution
router.post('/submit', auth, submissionController.submitSolution);

// Get user submissions
router.get('/', auth, submissionController.getUserSubmissions);

// Get submission stats
router.get('/stats', auth, submissionController.getSubmissionStats);

// Check if question is solved
router.get('/check/:questionId', auth, submissionController.checkSolved);

// Get submissions by questionId
router.get('/:questionId', auth, submissionController.getQuestionSubmissions);

module.exports = router;