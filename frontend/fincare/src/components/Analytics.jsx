import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import CategoryChart from './CategoryChart';
import IncomeExpenseChart from './IncomeExpenseChart';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, PieChart } from 'lucide-react';

const Analytics = () => {
  const { transactions, budgets, getTransactionsByCategory, getSummaryData } = useFinance();
  const [activeChart, setActiveChart] = useState('trend');
  
  const summaryData = getSummaryData();
  const expensesByCategory = getTransactionsByCategory();

  // Calculate top categories
  const topCategories = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Calculate monthly trends
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-IN', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expense += transaction.amount;
    }
    return acc;
  }, {});

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Insights into your financial patterns</p>
        </div>
        <div className="chart-toggle">
          <button
            className={`toggle-btn ${activeChart === 'trend' ? 'active' : ''}`}
            onClick={() => setActiveChart('trend')}
          >
            <BarChart3 size={18} />
            Trend Analysis
          </button>
          <button
            className={`toggle-btn ${activeChart === 'category' ? 'active' : ''}`}
            onClick={() => setActiveChart('category')}
          >
            <PieChart size={18} />
            Category Breakdown
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Key Metrics */}
        <div className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-card income">
              <div className="metric-icon">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Income</h3>
                <p className="metric-value">₹{summaryData.totalIncome.toLocaleString('en-IN')}</p>
                <span className="metric-change positive">+12.5% from last month</span>
              </div>
            </div>

            <div className="metric-card expense">
              <div className="metric-icon">
                <TrendingDown size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Expenses</h3>
                <p className="metric-value">₹{summaryData.totalExpenses.toLocaleString('en-IN')}</p>
                <span className="metric-change negative">+8.2% from last month</span>
              </div>
            </div>

            <div className="metric-card balance">
              <div className="metric-icon">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <h3>Net Balance</h3>
                <p className="metric-value">₹{summaryData.balance.toLocaleString('en-IN')}</p>
                <span className="metric-change positive">+15.3% from last month</span>
              </div>
            </div>

            <div className="metric-card transactions">
              <div className="metric-icon">
                <Calendar size={24} />
              </div>
              <div className="metric-content">
                <h3>Transactions</h3>
                <p className="metric-value">{summaryData.transactionCount}</p>
                <span className="metric-change neutral">This month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="chart-section">
          <div className="chart-container">
            <div className="chart-header">
              <h3>
                {activeChart === 'trend' ? 'Income vs Expenses Trend' : 'Expense Categories'}
              </h3>
              <p>
                {activeChart === 'trend' 
                  ? 'Monthly comparison of income and expenses' 
                  : 'Breakdown of your spending by category'
                }
              </p>
            </div>
            <div className="chart-content">
              {activeChart === 'trend' ? <IncomeExpenseChart /> : <CategoryChart />}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="categories-section">
          <div className="section-header">
            <h3>Top Spending Categories</h3>
            <p>Your highest expense categories this month</p>
          </div>
          <div className="categories-list">
            {topCategories.map((item, index) => {
              const percentage = (item.amount / summaryData.totalExpenses) * 100;
              return (
                <div key={item.category} className="category-item">
                  <div className="category-info">
                    <div className="category-rank">#{index + 1}</div>
                    <div className="category-details">
                      <h4>{item.category}</h4>
                      <p>₹{item.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="category-stats">
                    <div className="percentage">{percentage.toFixed(1)}%</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Overview */}
        <div className="budget-section">
          <div className="section-header">
            <h3>Budget Overview</h3>
            <p>Track your budget performance</p>
          </div>
          <div className="budget-list">
            {budgets.length > 0 ? (
              budgets.map(budget => {
                const percentage = (budget.spent / budget.amount) * 100;
                const isOverBudget = budget.spent > budget.amount;
                return (
                  <div key={budget._id} className="budget-item">
                    <div className="budget-info">
                      <h4>{budget.category}</h4>
                      <div className="budget-amounts">
                        <span className="spent">₹{budget.spent.toLocaleString('en-IN')}</span>
                        <span className="total">/ ₹{budget.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="budget-progress">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {percentage.toFixed(1)}% {isOverBudget && '(Over Budget)'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-budgets">
                <p>No budgets set yet</p>
                <p>Create budgets to track your spending goals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;