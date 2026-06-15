const transactionService = require('./transaction.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

const getTransactions = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transactions = await transactionService.getTransactions(req.user._id, req.query);
    return sendSuccess(res, 200, 'Transactions retrieved successfully', transactions);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve transactions');
  }
});

const getTransactionSummary = asyncHandler(async (req, res) => {
  try {
    const summary = await transactionService.getTransactionSummary(req.user._id, req.query);
    return sendSuccess(res, 200, 'Summary retrieved successfully', summary);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve summary');
  }
});

const getTransactionById = asyncHandler(async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Transaction retrieved successfully', transaction);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to retrieve transaction');
  }
});

const createTransaction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transaction = await transactionService.createTransaction(req.user._id, req.body);
    return sendSuccess(res, 201, 'Transaction created successfully', transaction);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to create transaction');
  }
});

const updateTransaction = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.user._id, req.body);
    return sendSuccess(res, 200, 'Transaction updated successfully', transaction);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to update transaction');
  }
});

const deleteTransaction = asyncHandler(async (req, res) => {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Transaction deleted successfully');
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Failed to delete transaction');
  }
});

module.exports = {
  getTransactions,
  getTransactionSummary,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
