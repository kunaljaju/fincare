import React from 'react';
import { formatCurrency } from '../utils/CurrencyUtils';
import { Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const BudgetProgress = ({ budget, onEdit, onDelete }) => {
  const {
    _id,
    category,
    limit,
    spent = 0,
    remaining = limit,
    percentage = 0,
    isOverBudget = false,
    isNearLimit = false,
    period
  } = budget;

  const getProgressBarColor = () => {
    if (isOverBudget) return '#ef4444'; // Red
    if (isNearLimit) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle size={20} className="status-icon over-budget" />;
    }
    if (isNearLimit) {
      return <AlertTriangle size={20} className="status-icon near-limit" />;
    }
    return <CheckCircle size={20} className="status-icon on-track" />;
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget';
    if (isNearLimit) return 'Near Limit';
    return 'On Track';
  };

  return (
    <div className={`budget-progress ${isOverBudget ? 'over-budget' : isNearLimit ? 'near-limit' : 'on-track'}`}>
      <div className="budget-header">
        <div className="budget-info">
          <h3 className="budget-category">{category}</h3>
          <span className="budget-period">{period}</span>
        </div>
        
        <div className="budget-status">
          {getStatusIcon()}
          <span className="status-text">{getStatusText()}</span>
        </div>

        <div className="budget-actions">
          <button 
            className="action-btn edit"
            onClick={() => onEdit(budget)}
            title="Edit Budget"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="action-btn delete"
            onClick={() => onDelete(_id)}
            title="Delete Budget"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="budget-amounts">
        <div className="amount-item">
          <span className="label">Spent</span>
          <span className="value">{formatCurrency(spent)}</span>
        </div>
        <div className="amount-item">
          <span className="label">Limit</span>
          <span className="value">{formatCurrency(limit)}</span>
        </div>
        <div className="amount-item">
          <span className="label">Remaining</span>
          <span className={`value ${remaining < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-percentage">
            {percentage.toFixed(1)}% used
          </span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: getProgressBarColor()
            }}
          ></div>
        </div>
      </div>

      {isOverBudget && (
        <div className="budget-alert">
          <AlertTriangle size={16} />
          <span>You've exceeded your budget by {formatCurrency(spent - limit)}</span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;