const Transaction = require('./transaction.model');

class TransactionService {
  async getTransactions(userId, { type, category, startDate, endDate, limit }) {
    const filter = { user: userId };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let query = Transaction.find(filter).sort({ date: -1 });
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    return await query;
  }

  async getTransactionSummary(userId, { startDate, endDate }) {
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

    const categoryBreakdown = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactions.length,
      categoryBreakdown
    };
  }

  async getTransactionById(id, userId) {
    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  }

  async createTransaction(userId, { type, amount, description, category, date, notes }) {
    const transaction = new Transaction({
      user: userId,
      type,
      amount: parseFloat(amount),
      description: description && description.trim() ? description.trim() : category.trim(),
      category: category.trim(),
      date: new Date(date),
      notes: notes ? notes.trim() : ''
    });

    return await transaction.save();
  }

  async updateTransaction(id, userId, updateData) {
    const transaction = await Transaction.findOne({ _id: id, user: userId });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    const { type, amount, description, category, date, notes } = updateData;
    
    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (description !== undefined) {
      transaction.description = description.trim() ? description.trim() : (category ? category.trim() : transaction.category);
    }
    if (category) transaction.category = category.trim();
    if (date) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes.trim();

    return await transaction.save();
  }

  async deleteTransaction(id, userId) {
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: userId });
    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }
    return transaction;
  }
}

module.exports = new TransactionService();
