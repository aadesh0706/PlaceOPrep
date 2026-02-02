const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Session routes
router.post('/', sessionController.startSession);
router.post('/start', sessionController.startSession);
router.post('/submit', sessionController.submitSession);
router.get('/', sessionController.getUserSessions);
router.get('/:id', sessionController.getSessionById);

module.exports = router;
