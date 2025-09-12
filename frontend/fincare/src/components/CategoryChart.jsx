import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = () => {
  const { getTransactionsByCategory } = useFinance();

  const expensesByCategory = getTransactionsByCategory();

  // If no data, show placeholder
  if (Object.keys(expensesByCategory).length === 0) {
    return (
      <div className="chart-placeholder">
        <div className="placeholder-icon">📊</div>
        <p>No expense data available</p>
        <p>Add some expense transactions to see the breakdown</p>
      </div>
    );
  }

  // Convert to array and sort by amount
  const chartDataArray = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Modern color palette
  const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#84cc16', // Lime
    '#f97316', // Orange
  ];

  // Prepare chart data
  const chartData = {
    labels: chartDataArray.map(item => item.category),
    datasets: [
      {
        data: chartDataArray.map(item => item.amount),
        backgroundColor: colors.slice(0, chartDataArray.length),
        borderColor: '#1e293b',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
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
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = dataset.data.reduce((sum, value) => sum + value, 0);
              
              return data.labels.map((label, index) => {
                const value = dataset.data[index];
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor[index],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: index
                };
              });
            }
            return [];
          }
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
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.raw.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 3,
      }
    }
  };

  return (
    <div className="category-chart">
      <div className="chart-container">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CategoryChart;