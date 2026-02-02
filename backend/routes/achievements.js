const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Achievement routes
router.get('/', achievementController.getUserAchievements);
router.get('/:type', achievementController.getAchievementByType);

module.exports = router;
