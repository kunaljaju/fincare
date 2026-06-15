const express = require('express');
const budgetController = require('./budget.controller');
const authMiddleware = require('../auth/auth.middleware');
const budgetValidation = require('./budget.validators');

const router = express.Router();

// Apply authMiddleware globally to all budget routes
router.use(authMiddleware);

router.get('/', budgetController.getBudgets);
router.post('/', budgetValidation.create, budgetController.createBudget);
router.put('/:id', budgetValidation.update, budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
