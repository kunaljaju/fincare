import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Analytics = () => {
  const { transactions, budgets, getTransactionsByCategory, getSummaryData } = useFinance();
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState({});

  const summaryData = getSummaryData();
  const categoryData = getTransactionsByCategory();

  // Filter transactions by time range
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    return transactions.filter(transaction => 
      new Date(transaction.date) >= startDate
    );
  };

  // Prepare pie chart data
  const getPieChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryTotals = {};

    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = 
          (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    return {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  // Prepare monthly trend data
  const getMonthlyTrendData = () => {
    const monthlyData = {};
    const filteredTransactions = getFilteredTransactions();

    filteredTransactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });

    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expense);

    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: '#4BC0C0',
          borderColor: '#4BC0C0',
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          borderWidth: 2
        }
      ]
    };
  };

  const pieChartData = getPieChartData();
  const trendData = getMonthlyTrendData();

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1 className="page-title">Analytics</h1>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Summary Stats */}
        <div className="analytics-summary">
          <div className="stat-card">
            <h3>Total Income</h3>
            <p className="stat-value income">${summaryData.totalIncome.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Expenses</h3>
            <p className="stat-value expense">${summaryData.totalExpenses.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Net Balance</h3>
            <p className={`stat-value ${summaryData.balance >= 0 ? 'positive' : 'negative'}`}>
              ${summaryData.balance.toFixed(2)}
            </p>
          </div>
          <div className="stat-card">
            <h3>Transactions</h3>
            <p className="stat-value">{summaryData.transactionCount}</p>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-container">
          <h3>Expense Categories</h3>
          <div className="chart-wrapper">
            <Pie 
              data={pieChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="chart-container">
          <h3>Income vs Expenses Trend</h3>
          <div className="chart-wrapper">
            {/* Note: You would need to implement a Bar chart component here */}
            <div className="trend-placeholder">
              <p>Monthly trend chart would go here</p>
              <p>Income: ${summaryData.totalIncome.toFixed(2)}</p>
              <p>Expenses: ${summaryData.totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
