const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Analytics routes
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/detailed', analyticsController.getDetailedAnalytics);
router.get('/skills', analyticsController.getSkills);

module.exports = router;
