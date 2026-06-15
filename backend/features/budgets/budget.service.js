const Budget = require('./budget.model');
const Transaction = require('../transactions/transaction.model');

class BudgetService {
  async getBudgetProgress(budget, userId) {
    const startDate = budget.startDate;
    const endDate = budget.endDate;

    const spentResult = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
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

    const spent = spentResult.length > 0 ? spentResult[0].total : 0;
    const limit = budget.amount; // or budget.limit via virtual
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const isOverBudget = spent > limit;
    const isNearLimit = spent >= (limit * (budget.alertThreshold / 100));

    const budgetObj = budget.toObject();
    return {
      ...budgetObj,
      spent,
      remaining,
      percentage,
      isOverBudget,
      isNearLimit
    };
  }

  async getBudgets(userId) {
    const budgets = await Budget.find({ user: userId });
    return await Promise.all(
      budgets.map(budget => this.getBudgetProgress(budget, userId))
    );
  }

  async createBudget(userId, { category, period = 'monthly', alertThreshold = 80, limit, amount }) {
    const budgetAmount = amount !== undefined ? amount : limit;
    if (budgetAmount === undefined || isNaN(parseFloat(budgetAmount)) || parseFloat(budgetAmount) <= 0) {
      const error = new Error('Limit/amount must be a positive number');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const existingBudget = await Budget.findOne({
      user: userId,
      category,
      period,
      startDate
    });

    if (existingBudget) {
      const error = new Error(`A budget for category '${category}' already exists for this period.`);
      error.statusCode = 400;
      throw error;
    }

    const budget = new Budget({
      user: userId,
      category,
      amount: parseFloat(budgetAmount),
      period,
      alertThreshold: parseInt(alertThreshold)
    });

    await budget.save();
    return await this.getBudgetProgress(budget, userId);
  }

  async updateBudget(id, userId, updateData) {
    const budget = await Budget.findOne({ _id: id, user: userId });
    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      throw error;
    }

    const { category, period, alertThreshold } = updateData;
    const amount = updateData.amount !== undefined ? updateData.amount : updateData.limit;

    if (category) budget.category = category;
    if (period) budget.period = period;
    if (alertThreshold !== undefined) budget.alertThreshold = parseInt(alertThreshold);
    if (amount !== undefined) {
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        const error = new Error('Limit/amount must be a positive number');
        error.statusCode = 400;
        throw error;
      }
      budget.amount = parseFloat(amount);
    }

    await budget.save();
    return await this.getBudgetProgress(budget, userId);
  }

  async deleteBudget(id, userId) {
    const budget = await Budget.findOneAndDelete({ _id: id, user: userId });
    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      throw error;
    }
    return budget;
  }
}

module.exports = new BudgetService();
