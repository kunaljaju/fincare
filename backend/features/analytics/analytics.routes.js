const express = require('express');
const analyticsController = require('./analytics.controller');
const authMiddleware = require('../auth/auth.middleware');
const analyticsValidation = require('./analytics.validators');

const router = express.Router();

// Apply authMiddleware globally to all analytics routes
router.use(authMiddleware);

router.get('/summary', analyticsController.getSummary);
router.get('/categories', analyticsValidation.categories, analyticsController.getCategories);
router.get('/trends', analyticsValidation.trends, analyticsController.getTrends);
router.get('/budgets', analyticsController.getBudgetsPerformance);

module.exports = router;
