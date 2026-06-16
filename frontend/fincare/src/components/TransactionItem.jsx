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
              <div 
                className="action-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: '#0a0a0c', // matches var(--surface)
                  border: '1px solid rgba(255, 255, 255, 0.08)', // matches var(--border)
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                  padding: '4px',
                  zIndex: 100,
                  minWidth: '110px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <button 
                  onClick={handleEdit} 
                  className="action-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '0.8125rem',
                    borderRadius: '4px',
                    color: '#94a3b8', // matches var(--text-secondary)
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#f8fafc'; // matches var(--text-primary)
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button 
                  onClick={handleDelete} 
                  className="action-item delete"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '0.8125rem',
                    borderRadius: '4px',
                    color: '#ff2d55', // matches var(--danger-color)
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 45, 85, 0.1)';
                    e.currentTarget.style.color = '#ff4d6d';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ff2d55';
                  }}
                >
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