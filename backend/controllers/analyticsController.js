const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');

/**
 * @desc    Get financial summary for the current user
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Get overall totals
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpenses = totals.find(t => t._id === 'expense')?.total || 0;
    const incomeCount = totals.find(t => t._id === 'income')?.count || 0;
    const expenseCount = totals.find(t => t._id === 'expense')?.count || 0;

    // Get current month data
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: currentMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyIncome = monthlyTotals.find(t => t._id === 'income')?.total || 0;
    const monthlyExpenses = monthlyTotals.find(t => t._id === 'expense')?.total || 0;

    // Get current week data
    const currentWeek = new Date();
    currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    currentWeek.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const weeklyTotals = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: currentWeek, $lt: nextWeek }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const weeklyIncome = weeklyTotals.find(t => t._id === 'income')?.total || 0;
    const weeklyExpenses = weeklyTotals.find(t => t._id === 'expense')?.total || 0;

    // Calculate savings rate and other metrics
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
    const avgTransactionAmount = (totalIncome + totalExpenses) / (incomeCount + expenseCount) || 0;

    // Get most used categories
    const topCategories = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    return sendSuccess(res, 200, 'Summary retrieved successfully', {
      overall: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        incomeCount,
        expenseCount,
        savingsRate: Math.round(savingsRate * 100) / 100,
        avgTransactionAmount: Math.round(avgTransactionAmount * 100) / 100
      },
      monthly: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        balance: monthlyIncome - monthlyExpenses
      },
      weekly: {
        income: weeklyIncome,
        expenses: weeklyExpenses,
        balance: weeklyIncome - weeklyExpenses
      },
      topCategories: topCategories.map(cat => ({
        category: cat._id,
        total: cat.total,
        count: cat.count
      }))
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    return sendError(res, 500, 'Failed to retrieve analytics summary');
  }
});

/**
 * @desc    Get expenses by category
 * @route   GET /api/analytics/categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const { type = 'expense', period = '6months' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: type,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' },
          lastTransaction: { $max: '$date' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calculate percentages
    const totalAmount = categoryData.reduce((sum, cat) => sum + cat.total, 0);
    const categoriesWithPercentages = categoryData.map(cat => ({
      category: cat._id,
      total: cat.total,
      count: cat.count,
      average: Math.round(cat.avgAmount * 100) / 100,
      minimum: cat.minAmount,
      maximum: cat.maxAmount,
      lastTransaction: cat.lastTransaction,
      percentage: totalAmount > 0 ? Math.round((cat.total / totalAmount) * 100 * 100) / 100 : 0
    }));

    return sendSuccess(res, 200, 'Category analytics retrieved successfully', {
      categories: categoriesWithPercentages,
      period,
      type,
      totalAmount,
      summary: {
        totalCategories: categoryData.length,
        totalAmount,
        totalTransactions: categoryData.reduce((sum, cat) => sum + cat.count, 0)
      }
    });

  } catch (error) {
    console.error('Category analytics error:', error);
    return sendError(res, 500, 'Failed to retrieve category analytics');
  }
});

/**
 * @desc    Get monthly trends
 * @route   GET /api/analytics/trends
 * @access  Private
 */
const getTrends = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }

  try {
    const { months = 6 } = req.query;
    
    // Calculate start date
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const trendData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format data for frontend
    const monthlyData = {};
    
    trendData.forEach(item => {
      const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          income: 0, 
          expense: 0, 
          incomeCount: 0, 
          expenseCount: 0,
          incomeAvg: 0,
          expenseAvg: 0
        };
      }
      monthlyData[monthKey][item._id.type] = item.total;
      monthlyData[monthKey][`${item._id.type}Count`] = item.count;
      monthlyData[monthKey][`${item._id.type}Avg`] = Math.round(item.avgAmount * 100) / 100;
    });

    const trends = Object.keys(monthlyData)
      .sort()
      .map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(year, month - 1, 1);
        const data = monthlyData[monthKey];
        
        return {
          month: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          monthKey,
          income: data.income,
          expense: data.expense,
          balance: data.income - data.expense,
          incomeCount: data.incomeCount,
          expenseCount: data.expenseCount,
          totalTransactions: data.incomeCount + data.expenseCount,
          incomeAvg: data.incomeAvg,
          expenseAvg: data.expenseAvg,
          savingsRate: data.income > 0 ? Math.round(((data.income - data.expense) / data.income) * 100 * 100) / 100 : 0
        };
      });

    // Calculate growth rates
    const trendsWithGrowth = trends.map((trend, index) => {
      if (index === 0) {
        return { ...trend, incomeGrowth: 0, expenseGrowth: 0 };
      }
      
      const prevTrend = trends[index - 1];
      const incomeGrowth = prevTrend.income > 0 ? 
        Math.round(((trend.income - prevTrend.income) / prevTrend.income) * 100 * 100) / 100 : 0;
      const expenseGrowth = prevTrend.expense > 0 ? 
        Math.round(((trend.expense - prevTrend.expense) / prevTrend.expense) * 100 * 100) / 100 : 0;
      
      return { ...trend, incomeGrowth, expenseGrowth };
    });

    return sendSuccess(res, 200, 'Trend analytics retrieved successfully', {
      trends: trendsWithGrowth,
      period: `${months} months`,
      summary: {
        totalMonths: trends.length,
        avgMonthlyIncome: trends.reduce((sum, t) => sum + t.income, 0) / trends.length,
        avgMonthlyExpense: trends.reduce((sum, t) => sum + t.expense, 0) / trends.length,
        bestMonth: trends.reduce((best, current) => 
          current.balance > best.balance ? current : best, trends || {}),
        worstMonth: trends.reduce((worst, current) => 
          current.balance < worst.balance ? current : worst, trends || {})
      }
    });

  } catch (error) {
    console.error('Trends analytics error:', error);
    return sendError(res, 500, 'Failed to retrieve trend analytics');
  }
});

/**
 * @desc    Get budget performance analytics
 * @route   GET /api/analytics/budgets
 * @access  Private
 */
const getBudgetAnalytics = asyncHandler(async (req, res) => {
  try {
    const budgets = await Budget.find({ 
      user: req.user._id,
      isActive: true 
    });

    if (budgets.length === 0) {
      return sendSuccess(res, 200, 'No active budgets found', {
        budgets: [],
        summary: {
          totalBudgets: 0,
          totalBudgetAmount: 0,
          totalSpent: 0,
          overBudgetCount: 0
        }
      });
    }

    const budgetAnalytics = await Promise.all(
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
              total: { $sum: '$amount' },
              count: { $sum: 1 },
              avgAmount: { $avg: '$amount' }
            }
          }
        ]);

        const spent = spending?.total || 0;
        const transactionCount = spending?.count || 0;
        const avgTransaction = spending?.avgAmount || 0;
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
          budgetId: budget._id,
          category: budget.category,
          limit: budget.limit,
          spent,
          remaining: budget.limit - spent,
          percentage: Math.round(percentage * 100) / 100,
          isOverBudget: spent > budget.limit,
          isNearLimit: percentage >= budget.alertThreshold,
          transactionCount,
          avgTransaction: Math.round(avgTransaction * 100) / 100,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate
        };
      })
    );

    const summary = {
      totalBudgets: budgetAnalytics.length,
      totalBudgetAmount: budgetAnalytics.reduce((sum, b) => sum + b.limit, 0),
      totalSpent: budgetAnalytics.reduce((sum, b) => sum + b.spent, 0),
      overBudgetCount: budgetAnalytics.filter(b => b.isOverBudget).length,
      nearLimitCount: budgetAnalytics.filter(b => b.isNearLimit && !b.isOverBudget).length,
      avgBudgetUtilization: budgetAnalytics.reduce((sum, b) => sum + b.percentage, 0) / budgetAnalytics.length
    };

    return sendSuccess(res, 200, 'Budget analytics retrieved successfully', {
      budgets: budgetAnalytics,
      summary
    });

  } catch (error) {
    console.error('Budget analytics error:', error);
    return sendError(res, 500, 'Failed to retrieve budget analytics');
  }
});

module.exports = {
  getSummary,
  getCategories,
  getTrends,
  getBudgetAnalytics
};

