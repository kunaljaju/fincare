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

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    try {
      const response = await axios.post('/transactions', transactionData);
      setTransactions(prev => [response.data, ...prev]);
      return { success: true };
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
      const response = await axios.put(`/transactions/${id}`, transactionData);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction._id === id ? response.data : transaction
        )
      );
      return { success: true };
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
      await axios.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(transaction => transaction._id !== id));
      return { success: true };
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
      const response = await axios.get('/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add budget
  const addBudget = async (budgetData) => {
    try {
      const response = await axios.post('/budgets', budgetData);
      setBudgets(prev => [response.data, ...prev]);
      return { success: true };
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
      const response = await axios.put(`/budgets/${id}`, budgetData);
      setBudgets(prev => 
        prev.map(budget => 
          budget._id === id ? response.data : budget
        )
      );
      return { success: true };
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
      await axios.delete(`/budgets/${id}`);
      setBudgets(prev => prev.filter(budget => budget._id !== id));
      return { success: true };
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
      const response = await axios.get('/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
    fetchTransactions();
    fetchBudgets();
    fetchAnalytics();
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
