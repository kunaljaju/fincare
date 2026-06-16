import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

const defaultAnalytics = {
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  },
  categories: {
    categories: []
  }
};

export const FinanceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(defaultAnalytics);
  const [loading, setLoading] = useState(false);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
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
        setBudgets([]);
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets([]);
    } finally {
      setLoading(false);
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
        setAnalytics(defaultAnalytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(defaultAnalytics);
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
        fetchBudgets();
        fetchAnalytics();
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
  }, [fetchBudgets, fetchAnalytics]);

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
        fetchBudgets();
        fetchAnalytics();
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
  }, [fetchBudgets, fetchAnalytics]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id) => {
    try {
      const response = await axios.delete(`/transactions/${id}`);
      if (response.data.success) {
        setTransactions(prev => prev.filter(transaction => transaction._id !== id));
        fetchBudgets();
        fetchAnalytics();
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
  }, [fetchBudgets, fetchAnalytics]);

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

  // Load initial data / reset on auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      setTransactions([]);
      setBudgets([]);
      setAnalytics(defaultAnalytics);
      setLoading(false);
    } else {
      fetchTransactions();
      fetchBudgets();
      fetchAnalytics();
    }
  }, [isAuthenticated, fetchTransactions, fetchBudgets, fetchAnalytics]);


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
