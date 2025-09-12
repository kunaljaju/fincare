import React from 'react';
import { formatCurrency } from '../utils/currencyUtils';

const SummaryCard = ({ title, amount, icon: Icon, color }) => {
  return (
    <div className={`summary-card ${color}`}>
      <div className="card-icon">
        <Icon size={24} />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="amount">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
};

export default SummaryCard;