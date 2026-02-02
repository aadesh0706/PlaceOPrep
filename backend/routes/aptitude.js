const express = require('express');
const router = express.Router();
const aptitudeController = require('../controllers/aptitudeController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Aptitude result routes
router.post('/results', aptitudeController.saveAptitudeResult);
router.get('/results', aptitudeController.getAptitudeResults);
router.get('/stats', aptitudeController.getAptitudeStats);

module.exports = router;