const analyticsService = require('./analytics.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

const getSummary = asyncHandler(async (req, res) => {
  try {
    const summary = await analyticsService.getSummary(req.user._id, req.query);
    return sendSuccess(res, 200, 'Summary retrieved successfully', summary);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve summary');
  }
});

const getCategories = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const categories = await analyticsService.getCategories(req.user._id, req.query);
    return sendSuccess(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve categories');
  }
});

const getTrends = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const trends = await analyticsService.getTrends(req.user._id, req.query);
    return sendSuccess(res, 200, 'Trends retrieved successfully', trends);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve trends');
  }
});

const getBudgetsPerformance = asyncHandler(async (req, res) => {
  try {
    const performance = await analyticsService.getBudgetsPerformance(req.user._id);
    return sendSuccess(res, 200, 'Budget performance retrieved successfully', performance);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve budget performance');
  }
});

module.exports = {
  getSummary,
  getCategories,
  getTrends,
  getBudgetsPerformance
};
