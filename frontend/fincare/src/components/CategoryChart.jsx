import React, { useEffect, useRef } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = () => {
  const { getExpensesByCategory, analytics } = useFinance();

  const expensesByCategory = getExpensesByCategory();
  const categories = analytics.categories?.categories || [];

  // If no data, show placeholder
  if (!categories.length || Object.keys(expensesByCategory).length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No expense data available for chart</p>
        <p>Add some expense transactions to see the breakdown</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: categories.map(cat => cat.category),
    datasets: [
      {
        data: categories.map(cat => cat.total),
        backgroundColor: [
          '#ef4444', // Red
          '#f97316', // Orange
          '#eab308', // Yellow
          '#22c55e', // Green
          '#06b6d4', // Cyan
          '#3b82f6', // Blue
          '#8b5cf6', // Purple
          '#ec4899', // Pink
          '#64748b', // Gray
          '#84cc16', // Lime
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.raw.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="category-chart">
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default CategoryChart;