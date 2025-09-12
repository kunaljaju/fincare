const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all budgets for the current user
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req, res) => {
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

    return sendSuccess(res, 200, 'Budgets retrieved successfully', {
      budgets: budgetsWithSpending
    });

  } catch (error) {
    console.error('Get budgets error:', error);
    return sendError(res, 500, 'Failed to retrieve budgets');
  }
});

/**
 * @desc    Create a new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const budgetData = {
      ...req.body,
      user: req.user._id
    };

    const budget = new Budget(budgetData);
    const savedBudget = await budget.save();

    return sendSuccess(res, 201, 'Budget created successfully', {
      budget: savedBudget
    });

  } catch (error) {
    console.error('Create budget error:', error);
    
    if (error.code === 11000) {
      return sendError(res, 400, 'Budget already exists for this category and period');
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, 'Validation failed', messages);
    }

    return sendError(res, 500, 'Failed to create budget');
  }
});

/**
 * @desc    Update a budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return sendError(res, 404, 'Budget not found');
    }

    // Update budget fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        budget[key] = req.body[key];
      }
    });

    const updatedBudget = await budget.save();

    return sendSuccess(res, 200, 'Budget updated successfully', {
      budget: updatedBudget
    });

  } catch (error) {
    console.error('Update budget error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, 'Validation failed', messages);
    }

    return sendError(res, 500, 'Failed to update budget');
  }
});

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return sendError(res, 404, 'Budget not found');
    }

    await Budget.deleteOne({ _id: req.params.id });

    return sendSuccess(res, 200, 'Budget deleted successfully', {
      deletedBudgetId: req.params.id
    });

  } catch (error) {
    console.error('Delete budget error:', error);
    return sendError(res, 500, 'Failed to delete budget');
  }
});

/**
 * @desc    Get budget by ID
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudgetById = asyncHandler(async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return sendError(res, 404, 'Budget not found');
    }

    // Get spending data for this budget
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

    const budgetWithSpending = {
      ...budget.toJSON(),
      spent,
      percentage: Math.round(percentage * 100) / 100,
      remaining: budget.limit - spent,
      isOverBudget: spent > budget.limit,
      isNearLimit: percentage >= budget.alertThreshold
    };

    return sendSuccess(res, 200, 'Budget retrieved successfully', {
      budget: budgetWithSpending
    });

  } catch (error) {
    console.error('Get budget by ID error:', error);
    return sendError(res, 500, 'Failed to retrieve budget');
  }
});

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetById
};