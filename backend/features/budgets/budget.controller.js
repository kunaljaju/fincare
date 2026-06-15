const budgetService = require('./budget.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

const getBudgets = asyncHandler(async (req, res) => {
  try {
    const budgets = await budgetService.getBudgets(req.user._id);
    return sendSuccess(res, 200, 'Budgets retrieved successfully', budgets);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve budgets');
  }
});

const createBudget = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const budget = await budgetService.createBudget(req.user._id, req.body);
    return sendSuccess(res, 201, 'Budget created successfully', budget);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to create budget');
  }
});

const updateBudget = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const budget = await budgetService.updateBudget(req.params.id, req.user._id, req.body);
    return sendSuccess(res, 200, 'Budget updated successfully', budget);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to update budget');
  }
});

const deleteBudget = asyncHandler(async (req, res) => {
  try {
    await budgetService.deleteBudget(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Budget deleted successfully');
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to delete budget');
  }
});

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
