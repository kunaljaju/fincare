const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const router = express.Router();

// @route   GET /api/budgets
// @desc    Get all budgets for the current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    // Get spending data for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              category: budget.category,
              date: {
                $gte: budget.startDate,
                $lte: budget.endDate
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const spent = spending?.total || 0;
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
          ...budget.toJSON(),
          spent,
          percentage: Math.round(percentage * 100) / 100,
          remaining: budget.limit - spent,
          isOverBudget: spent > budget.limit,
          isNearLimit: percentage >= budget.alertThreshold
        };
      })
    );

    res.json({
      success: true,
      data: { budgets: budgetsWithSpending }
    });

  } catch (error) {
    console.error('Fetch budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budgets'
    });
  }
});

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', [
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required and must be less than 50 characters'),
  body('limit')
    .isFloat({ min: 0.01 })
    .withMessage('Budget limit must be greater than 0'),
  body('period')
    .optional()
    .isIn(['monthly', 'weekly', 'yearly'])
    .withMessage('Period must be monthly, weekly, or yearly'),
  body('alertThreshold')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alert threshold must be between 0 and 100')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const budgetData = {
      ...req.body,
      user: req.user._id
    };

    const budget = new Budget(budgetData);
    await budget.save();

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { budget }
    });

  } catch (error) {
    console.error('Create budget error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category and period'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating budget'
    });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', [
  body('limit')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Budget limit must be greater than 0'),
  body('alertThreshold')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Alert threshold must be between 0 and 100'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Update budget
    Object.keys(req.body).forEach(key => {
      budget[key] = req.body[key];
    });

    await budget.save();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget }
    });

  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating budget'
    });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await Budget.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting budget'
    });
  }
});

module.exports = router;