const transactionService = require('./transaction.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');

const getTransactions = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transactions = await transactionService.getTransactions(req.user._id, req.query);
    return sendSuccess(res, 200, 'Transactions retrieved successfully', transactions);
  } catch (error) {
    next(error);
  }
});

const getTransactionSummary = asyncHandler(async (req, res, next) => {
  try {
    const summary = await transactionService.getTransactionSummary(req.user._id, req.query);
    return sendSuccess(res, 200, 'Summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
});

const getTransactionById = asyncHandler(async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Transaction retrieved successfully', transaction);
  } catch (error) {
    next(error);
  }
});

const createTransaction = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transaction = await transactionService.createTransaction(req.user._id, req.body);
    return sendSuccess(res, 201, 'Transaction created successfully', transaction);
  } catch (error) {
    next(error);
  }
});

const updateTransaction = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.user._id, req.body);
    return sendSuccess(res, 200, 'Transaction updated successfully', transaction);
  } catch (error) {
    next(error);
  }
});

const deleteTransaction = asyncHandler(async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user._id);
    return sendSuccess(res, 200, 'Transaction deleted successfully');
  } catch (error) {
    next(error);
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
