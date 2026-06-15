import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

// Mock data for demo purposes
const mockTransactions = [
  {
    _id: '1',
    type: 'income',
    amount: 5000,
    category: 'Salary',
    description: 'Monthly salary',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    type: 'expense',
    amount: 1200,
    category: 'Rent',
    description: 'Monthly rent payment',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    type: 'expense',
    amount: 300,
    category: 'Food & Dining',
    description: 'Grocery shopping',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    type: 'expense',
    amount: 150,
    category: 'Transportation',
    description: 'Gas and public transport',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: '5',
    type: 'income',
    amount: 500,
    category: 'Freelance',
    description: 'Freelance project payment',
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

const mockBudgets = [
  {
    _id: '1',
    category: 'Food & Dining',
    amount: 500,
    spent: 300,
    period: 'monthly',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    category: 'Transportation',
    amount: 200,
    spent: 150,
    period: 'monthly',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    category: 'Entertainment',
    amount: 300,
    spent: 80,
    period: 'monthly',
    createdAt: new Date().toISOString()
  }
];

const mockAnalytics = {
  summary: {
    totalIncome: 5000,
    totalExpenses: 1200,
    balance: 3800,
    transactionCount: 5
  },
  categories: {
    categories: [
      { category: 'Food & Dining', total: 300, count: 1 },
      { category: 'Rent', total: 1200, count: 1 },
      { category: 'Transportation', total: 150, count: 1 },
      { category: 'Entertainment', total: 80, count: 1 }
    ]
  }
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [loading, setLoading] = useState(false);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add transaction
  const addTransaction = useCallback(async (transactionData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const newTransaction = {
          _id: Date.now().toString(),
          ...transactionData,
          createdAt: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return { success: true };
      }

      const response = await axios.post('/transactions', transactionData);
      if (response.data.success) {
        setTransactions(prev => [response.data.data, ...prev]);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to add transaction'
        };
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      const errors = error.response?.data?.errors;
      const errorMsg = errors && Array.isArray(errors) && errors.length > 0
        ? errors.map(err => err.msg).join('. ')
        : error.response?.data?.message || 'Failed to add transaction';
      return {
        success: false,
        error: errorMsg
      };
    }
  }, []);

  // Update transaction
  const updateTransaction = useCallback(async (id, transactionData) => {
    try {
      const response = await axios.put(`/transactions/${id}`, transactionData);
      if (response.data.success) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction._id === id ? response.data.data : transaction
          )
        );
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to update transaction'
        };
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      const errors = error.response?.data?.errors;
      const errorMsg = errors && Array.isArray(errors) && errors.length > 0
        ? errors.map(err => err.msg).join('. ')
        : error.response?.data?.message || 'Failed to update transaction';
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    try {
      const response = await axios.delete(`/transactions/${id}`);
      if (response.data.success) {
        setTransactions(prev => prev.filter(transaction => transaction._id !== id));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to delete transaction'
        };
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete transaction' 
      };
    }
  }, []);

  // Fetch budgets
  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/budgets');
      if (response.data.success) {
        setBudgets(response.data.data);
      } else {
        setBudgets(mockBudgets);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets(mockBudgets);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add budget
  const addBudget = useCallback(async (budgetData) => {
    try {
      const response = await axios.post('/budgets', budgetData);
      if (response.data.success) {
        setBudgets(prev => [response.data.data, ...prev]);
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to add budget'
        };
      }
    } catch (error) {
      console.error('Failed to add budget:', error);
      const errors = error.response?.data?.errors;
      const errorMsg = errors && Array.isArray(errors) && errors.length > 0
        ? errors.map(err => err.msg).join('. ')
        : error.response?.data?.message || 'Failed to add budget';
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (id, budgetData) => {
    try {
      const response = await axios.put(`/budgets/${id}`, budgetData);
      if (response.data.success) {
        setBudgets(prev => 
          prev.map(budget => 
            budget._id === id ? response.data.data : budget
          )
        );
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to update budget'
        };
      }
    } catch (error) {
      console.error('Failed to update budget:', error);
      const errors = error.response?.data?.errors;
      const errorMsg = errors && Array.isArray(errors) && errors.length > 0
        ? errors.map(err => err.msg).join('. ')
        : error.response?.data?.message || 'Failed to update budget';
      return { 
        success: false, 
        error: errorMsg
      };
    }
  }, []);

  // Delete budget
  const deleteBudget = useCallback(async (id) => {
    try {
      const response = await axios.delete(`/budgets/${id}`);
      if (response.data.success) {
        setBudgets(prev => prev.filter(budget => budget._id !== id));
        return { success: true };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to delete budget'
        };
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete budget' 
      };
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryResponse, categoriesResponse] = await Promise.all([
        axios.get('/analytics/summary'),
        axios.get('/analytics/categories')
      ]);
      
      if (summaryResponse.data.success && categoriesResponse.data.success) {
        setAnalytics({
          summary: summaryResponse.data.data,
          categories: categoriesResponse.data.data
        });
      } else {
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(mockAnalytics);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate summary data
  const getSummaryData = useCallback(() => {
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
  }, [transactions]);

  // Get transactions by category
  const getTransactionsByCategory = useCallback(() => {
    const categoryTotals = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = 
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });
    return categoryTotals;
  }, [transactions]);

  // Load initial data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTransactions(mockTransactions);
      setBudgets(mockBudgets);
      setAnalytics(mockAnalytics);
      setLoading(false);
    } else {
      fetchTransactions();
      fetchBudgets();
      fetchAnalytics();
    }
  }, [fetchTransactions, fetchBudgets, fetchAnalytics]);


  const value = {
    transactions,
    budgets,
    analytics,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    fetchAnalytics,
    getSummaryData,
    getTransactionsByCategory
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
