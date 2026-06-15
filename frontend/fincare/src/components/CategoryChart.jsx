import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.color = '#ffffff';

const CategoryChart = ({ height = '450px' }) => {
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
    '#39ff14', // Cyber Neon Green
    '#10b981', // Tech Mint
    '#06b6d4', // Cyber Cyan
    '#84cc16', // Electric Lime
    '#059669', // Dark Emerald
    '#adff2f', // Green-Yellow
    '#eab308', // Electric Yellow
    '#14b8a6', // Deep Teal
    '#64748b', // Contrast Slate
    '#8b5cf6', // Contrast Violet/Purple
  ];

  // Prepare chart data
  const chartData = {
    labels: chartDataArray.map(item => item.category),
    datasets: [
      {
        data: chartDataArray.map(item => item.amount),
        backgroundColor: chartDataArray.map((_, index) => colors[index % colors.length]),
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
            family: 'Inter, sans-serif',
            weight: '500'
          },
          color: '#ffffff',
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
                  index: index,
                  fontColor: '#ffffff',
                  color: '#ffffff'
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
          family: 'Inter, sans-serif',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
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
    <div className="category-chart" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="pie-chart-wrapper" style={{ height, position: 'relative', margin: '0 auto', width: '100%', maxWidth: '600px' }}>
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CategoryChart;