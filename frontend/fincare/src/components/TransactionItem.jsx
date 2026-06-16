import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../utils/CurrencyUtils';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import TransactionForm from './TransactionForm';

const TransactionItem = ({ transaction, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(transaction._id);
    }
    setShowActions(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="transaction-item editing">
        <TransactionForm 
          transaction={transaction} 
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className={`transaction-item ${transaction.type} ${showActions ? 'menu-open' : ''}`}>
      <div className="transaction-main">
        <div className="transaction-details">
          <h4 className="transaction-description">{transaction.description}</h4>
          <div className="transaction-meta">
            <span className="transaction-category">{transaction.category}</span>
            <span className="transaction-date">{formatDate(transaction.date)}</span>
          </div>
          {transaction.notes && (
            <p className="transaction-notes">{transaction.notes}</p>
          )}
        </div>

        <div className="transaction-right">
          <div className={`transaction-amount ${transaction.type}`}>
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </div>
          
          <div className="transaction-actions">
            <button 
              className="action-btn"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical size={18} />
            </button>
            
            {showActions && (
              <div className="action-menu">
                <button onClick={handleEdit} className="action-item">
                  <Edit2 size={16} />
                  Edit
                </button>
                <button onClick={handleDelete} className="action-item delete">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;