const Transaction = require('../transactions/transaction.model');
const Budget = require('../budgets/budget.model');
const mongoose = require('mongoose');

class AnalyticsService {
  async getSummary(userId, { startDate, endDate }) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { user: userId };
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    const transactions = await Transaction.find(filter);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length
    };
  }

  async getCategories(userId, { startDate, endDate }) {
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = { user: new mongoose.Types.ObjectId(userId), type: 'expense' };
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

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

    return { categories: categoryBreakdown };
  }

  async getTrends(userId, { period = 'month', months = 6 }) {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(endDate.getMonth() - parseInt(months));
    } else if (period === 'week') {
      startDate.setDate(endDate.getDate() - (parseInt(months) * 7));
    } else if (period === 'year') {
      startDate.setFullYear(endDate.getFullYear() - parseInt(months));
    }

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
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

    return { trends };
  }

  async getBudgetsPerformance(userId) {
    const budgets = await Budget.find({ user: userId });

    const budgetPerformance = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              type: 'expense',
              date: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
              }
            }
          },
          {
            $match: {
              $expr: {
                $eq: [ { $toLower: "$category" }, budget.category.trim().toLowerCase() ]
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
        const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
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

    return { budgets: budgetPerformance };
  }
}

module.exports = new AnalyticsService();
