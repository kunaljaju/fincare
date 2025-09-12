import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeExpenseChart = () => {
  const { transactions } = useFinance();

  // Generate last 6 months data
  const generateMonthlyData = () => {
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-IN', { month: 'short' });
      months.push(monthName);
      
      // For demo purposes, generate some realistic data
      const baseIncome = 5000 + Math.random() * 1000;
      const baseExpense = 1200 + Math.random() * 800;
      
      incomeData.push(Math.round(baseIncome));
      expenseData.push(Math.round(baseExpense));
    }
    
    return { months, incomeData, expenseData };
  };

  const { months, incomeData, expenseData } = generateMonthlyData();

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            family: 'Orbitron, monospace',
            weight: '500'
          },
          color: '#e2e8f0',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          family: 'Orbitron, monospace',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Orbitron, monospace',
          size: 12
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Orbitron, monospace',
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Orbitron, monospace',
            size: 12
          },
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="income-expense-chart">
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
