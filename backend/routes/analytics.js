const express = require('express');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/summary
// @desc    Get financial summary
// @access  Private
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { user: userId };
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    // Get all transactions
    const transactions = await Transaction.find(filter);

    // Calculate summary
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount: transactions.length
      }
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching summary'
    });
  }
});

// @route   GET /api/analytics/categories
// @desc    Get category breakdown
// @access  Private
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { user: userId, type: 'expense' };
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        categories: categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get spending trends over time
// @access  Private
router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month', months = 6 } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - parseInt(months));
    } else if (period === 'week') {
      startDate.setDate(endDate.getDate() - (parseInt(months) * 7));
    } else if (period === 'year') {
      startDate.setFullYear(endDate.getFullYear() - parseInt(months));
    }

    // Get monthly trends
    const trends = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          }
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          income: 1,
          expenses: 1,
          balance: { $subtract: ['$income', '$expenses'] },
          _id: 0
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        trends
      }
    });

  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trends'
    });
  }
});

// @route   GET /api/analytics/budgets
// @desc    Get budget performance
// @access  Private
router.get('/budgets', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all budgets
    const budgets = await Budget.find({ user: userId });

    // Calculate performance for each budget
    const budgetPerformance = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: 'expense',
              category: budget.category,
              date: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
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

        const spentAmount = spent.length > 0 ? spent[0].total : 0;
        const percentage = (spentAmount / budget.amount) * 100;
        const remaining = budget.amount - spentAmount;

        return {
          ...budget.toObject(),
          spent: spentAmount,
          remaining,
          percentage: Math.round(percentage * 100) / 100,
          status: percentage >= budget.alertThreshold ? 'warning' : 'good'
        };
      })
    );

    res.json({
      success: true,
      data: {
        budgets: budgetPerformance
      }
    });

  } catch (error) {
    console.error('Get budget performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budget performance'
    });
  }
});

module.exports = router;