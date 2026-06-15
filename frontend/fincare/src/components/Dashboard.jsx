import React, { useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Dashboard = () => {
  const { getSummaryData, transactions, budgets, loading, fetchTransactions } = useFinance();
  const summaryData = getSummaryData();

  // Refresh transactions when component mounts
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to your financial overview</p>
          </div>
          <div className="header-actions">
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Total Balance</span>
                <span className="stat-value">{summaryData.balance >= 0 ? '₹' + summaryData.balance.toFixed(2) : '-₹' + Math.abs(summaryData.balance).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Summary Cards */}
        <div className="summary-section">
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">
                <TrendingUp size={24} />
              </div>
              <div className="card-content">
                <h3>Total Income</h3>
                <p className="amount">₹{summaryData.totalIncome.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="summary-card expense">
              <div className="card-icon">
                <TrendingDown size={24} />
              </div>
              <div className="card-content">
                <h3>Total Expenses</h3>
                <p className="amount">₹{summaryData.totalExpenses.toFixed(2)}</p>
              </div>
            </div>
            
            <div className={`summary-card ${summaryData.balance >= 0 ? 'positive' : 'negative'}`}>
              <div className="card-icon">
                <Wallet size={24} />
              </div>
              <div className="card-content">
                <h3>Balance</h3>
                <p className="amount">₹{summaryData.balance.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="summary-card info">
              <div className="card-icon">
                <DollarSign size={24} />
              </div>
              <div className="card-content">
                <h3>Transactions</h3>
                <p className="amount">{summaryData.transactionCount}</p>
              </div>
            </div>
          </div>
        </div>



        {/* Recent Transactions */}
        <div className="recent-transactions">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <p>Your latest financial activity</p>
          </div>
          <div className="transaction-list">
            {transactions.slice(0, 5).map(transaction => (
              <div key={transaction._id} className="transaction-item">
                <div className="transaction-info">
                  <h4>{transaction.description}</h4>
                  <p>{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
