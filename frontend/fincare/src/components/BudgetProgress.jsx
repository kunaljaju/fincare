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
    if (isOverBudget) return 'var(--danger-color)'; // Red
    if (isNearLimit) return 'var(--warning-color)'; // Orange
    return 'var(--fincare-primary)'; // Neon Green
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
      <div className="budget-progress-row">
        {/* Left Section: Category, Period & Status */}
        <div className="budget-left-section">
          <div className="budget-info">
            <h3 className="budget-category">{category}</h3>
            <span className="budget-period">{period}</span>
          </div>
          
          <div className="budget-status">
            {getStatusIcon()}
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>

        {/* Middle Section: Progress Bar */}
        <div className="budget-middle-section">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressBarColor()
                }}
              ></div>
            </div>
            <span className="progress-percentage">
              {percentage.toFixed(1)}% used
            </span>
          </div>
        </div>

        {/* Right Section: Amounts */}
        <div className="budget-right-section">
          <div className="amount-item spent">
            <span className="label">Spent</span>
            <span className="value">{formatCurrency(spent)}</span>
          </div>
          <div className="amount-item limit">
            <span className="label">Limit</span>
            <span className="value">{formatCurrency(limit)}</span>
          </div>
          <div className="amount-item remaining">
            <span className="label">Remaining</span>
            <span className={`value ${remaining < 0 ? 'negative' : 'positive'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Actions Section: Edit / Delete */}
        <div className="budget-actions-section">
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