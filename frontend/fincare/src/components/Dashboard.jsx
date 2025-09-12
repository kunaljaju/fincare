import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import SummaryCard from './SummaryCard';
import CategoryChart from './CategoryChart';
import BudgetProgress from './BudgetProgress';
import TransactionList from './TransactionList';

const Dashboard = () => {
  const { getSummaryData, transactions, loading } = useFinance();
  const summaryData = getSummaryData();

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
          <SummaryCard />
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Expenses by Category</h3>
              <p>Breakdown of your spending</p>
            </div>
            <CategoryChart />
          </div>
          
          <div className="chart-container">
            <div className="chart-header">
              <h3>Budget Progress</h3>
              <p>Track your budget goals</p>
            </div>
            <BudgetProgress />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <p>Your latest financial activity</p>
          </div>
          <TransactionList limit={5} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
