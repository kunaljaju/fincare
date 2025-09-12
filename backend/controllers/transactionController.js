const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all transactions for the current user
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  const { 
    page = 1, 
    limit = 50, 
    type, 
    category, 
    startDate, 
    endDate, 
    search,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;
  
  try {
    // Build query
    const query = { user: req.user._id };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = new RegExp(category, 'i');
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    if (sortBy !== 'date') {
      sortObj.date = -1; // Secondary sort by date
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);

    // Calculate summary
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIncome = summary.find(s => s._id === 'income')?.total || 0;
    const totalExpenses = summary.find(s => s._id === 'expense')?.total || 0;

    return sendSuccess(res, 200, 'Transactions retrieved successfully', {
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: total
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return sendError(res, 500, 'Failed to retrieve transactions');
  }
});

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transactionData = {
      ...req.body,
      user: req.user._id
    };

    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();

    return sendSuccess(res, 201, 'Transaction created successfully', {
      transaction: savedTransaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, 'Validation failed', messages);
    }

    return sendError(res, 500, 'Failed to create transaction');
  }
});

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    // Update transaction fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        transaction[key] = req.body[key];
      }
    });

    const updatedTransaction = await transaction.save();

    return sendSuccess(res, 200, 'Transaction updated successfully', {
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, 'Validation failed', messages);
    }

    return sendError(res, 500, 'Failed to update transaction');
  }
});

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    await Transaction.deleteOne({ _id: req.params.id });

    return sendSuccess(res, 200, 'Transaction deleted successfully', {
      deletedTransactionId: req.params.id
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    return sendError(res, 500, 'Failed to delete transaction');
  }
});

/**
 * @desc    Get transaction categories for the current user
 * @route   GET /api/transactions/categories
 * @access  Private
 */
const getTransactionCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;

  try {
    const matchStage = { user: req.user._id };
    if (type && ['income', 'expense'].includes(type)) {
      matchStage.type = type;
    }

    const categories = await Transaction.aggregate([
      { $match: matchStage },
      { 
        $group: { 
          _id: {
            category: '$category',
            type: '$type'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          lastUsed: { $max: '$date' }
        } 
      },
      { 
        $group: {
          _id: '$_id.category',
          types: { 
            $push: {
              type: '$_id.type',
              count: '$count',
              totalAmount: '$totalAmount',
              lastUsed: '$lastUsed'
            }
          },
          totalCount: { $sum: '$count' },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalCount: -1 } }
    ]);

    // Format response
    const formattedCategories = categories.map(cat => ({
      category: cat._id,
      usage: {
        totalCount: cat.totalCount,
        totalAmount: cat.totalAmount,
        types: cat.types
      }
    }));

    return sendSuccess(res, 200, 'Categories retrieved successfully', {
      categories: formattedCategories.map(c => c.category),
      detailed: formattedCategories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return sendError(res, 500, 'Failed to retrieve categories');
  }
});

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = asyncHandler(async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendSuccess(res, 200, 'Transaction retrieved successfully', {
      transaction
    });

  } catch (error) {
    console.error('Get transaction by ID error:', error);
    return sendError(res, 500, 'Failed to retrieve transaction');
  }
});

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionCategories,
  getTransactionById
};
