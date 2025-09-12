import React, { createContext, useContext, useState, useEffect } from 'react';
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
    category: 'Food',
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
    category: 'Food',
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

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [analytics, setAnalytics] = useState({
    monthlyTrend: [4000, 4200, 3800, 4500, 5000],
    categoryBreakdown: {
      'Food': 300,
      'Rent': 1200,
      'Transportation': 150,
      'Entertainment': 80
    }
  });
  const [loading, setLoading] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        // Fallback to mock data if API fails
        setTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Fallback to mock data if API fails
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    try {
      // Check if we have a token (real user) or not (mock user)
      const token = localStorage.getItem('token');
      if (!token) {
        // Mock user - add to local state directly
        const newTransaction = {
          _id: Date.now().toString(),
          ...transactionData,
          createdAt: new Date().toISOString()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return { success: true };
      }

      // Real user - use API
      const response = await axios.post('/api/transactions', transactionData);
      if (response.data.success) {
        // Add to local state immediately for real-time update
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
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add transaction'
      };
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await axios.put(`/api/transactions/${id}`, transactionData);
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
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update transaction' 
      };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      const response = await axios.delete(`/api/transactions/${id}`);
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
  };

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/budgets');
      if (response.data.success) {
        setBudgets(response.data.data);
      } else {
        // Fallback to mock data if API fails
        setBudgets(mockBudgets);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      // Fallback to mock data if API fails
      setBudgets(mockBudgets);
    } finally {
      setLoading(false);
    }
  };

  // Add budget
  const addBudget = async (budgetData) => {
    try {
      const response = await axios.post('/api/budgets', budgetData);
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
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add budget' 
      };
    }
  };

  // Update budget
  const updateBudget = async (id, budgetData) => {
    try {
      const response = await axios.put(`/api/budgets/${id}`, budgetData);
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
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update budget' 
      };
    }
  };

  // Delete budget
  const deleteBudget = async (id) => {
    try {
      const response = await axios.delete(`/api/budgets/${id}`);
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
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryResponse, categoriesResponse] = await Promise.all([
        axios.get('/api/analytics/summary'),
        axios.get('/api/analytics/categories')
      ]);
      
      if (summaryResponse.data.success && categoriesResponse.data.success) {
        setAnalytics({
          summary: summaryResponse.data.data,
          categories: categoriesResponse.data.data
        });
      } else {
        // Fallback to mock data if API fails
        setAnalytics({
          summary: {
            totalIncome: 5000,
            totalExpenses: 1200,
            balance: 3800,
            transactionCount: 5
          },
          categories: {
            categories: [
              { category: 'Food', total: 300, count: 1 },
              { category: 'Rent', total: 1200, count: 1 },
              { category: 'Transportation', total: 150, count: 1 },
              { category: 'Entertainment', total: 80, count: 1 }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Fallback to mock data if API fails
      setAnalytics({
        summary: {
          totalIncome: 5000,
          totalExpenses: 1200,
          balance: 3800,
          transactionCount: 5
        },
        categories: {
          categories: [
            { category: 'Food', total: 300, count: 1 },
            { category: 'Rent', total: 1200, count: 1 },
            { category: 'Transportation', total: 150, count: 1 },
            { category: 'Entertainment', total: 80, count: 1 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary data
  const getSummaryData = () => {
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
  };

  // Get transactions by category
  const getTransactionsByCategory = () => {
    const categoryTotals = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = 
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });
    return categoryTotals;
  };

  // Load initial data
  useEffect(() => {
    // Check if we're using mock user (no token)
    const token = localStorage.getItem('token');
    if (!token) {
      // Mock user - set mock data immediately
      setTransactions(mockTransactions);
      setBudgets(mockBudgets);
      setAnalytics({
        summary: {
          totalIncome: 5000,
          totalExpenses: 1200,
          balance: 3800,
          transactionCount: 5
        },
        categories: {
          categories: [
            { category: 'Food', total: 300, count: 1 },
            { category: 'Rent', total: 1200, count: 1 },
            { category: 'Transportation', total: 150, count: 1 },
            { category: 'Entertainment', total: 80, count: 1 }
          ]
        }
      });
      setLoading(false);
    } else {
      // Real user - fetch from API
      fetchTransactions();
      fetchBudgets();
      fetchAnalytics();
    }
  }, []);


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
