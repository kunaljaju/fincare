import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { formatDateForInput } from '../utils/CurrencyUtils';
import { Save, X, DollarSign, FileText, Tag, Calendar } from 'lucide-react';

const TransactionForm = ({ transaction = null, onCancel = null }) => {
  const { addTransaction, updateTransaction, loading } = useFinance();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    date: formatDateForInput(new Date()),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form if editing transaction
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description,
        category: transaction.category,
        date: formatDateForInput(new Date(transaction.date)),
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validation
      if (!formData.description.trim()) {
        setError('Please enter a description');
        return;
      }

      if (!formData.category.trim()) {
        setError('Please select or enter a category');
        return;
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction._id, transactionData);
      } else {
        // Add new transaction
        await addTransaction(transactionData);
      }

      // Reset form after successful submission
      if (!transaction) {
        setFormData({
          type: 'expense',
          amount: '',
          description: '',
          category: '',
          date: formatDateForInput(new Date()),
          notes: ''
        });
      }

      if (onCancel) onCancel(); // Close form if in edit mode

    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define categories based on transaction type
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'];
  const expenseCategories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other Expenses'];
  
  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="transaction-form-container">
      <div className="form-header">
        <h2 className="form-title">{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <p className="form-subtitle">Track your {formData.type === 'income' ? 'earnings' : 'expenses'} in Indian Rupees (₹)</p>
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Transaction Type */}
        <div className="form-group">
          <label className="form-label">Transaction Type</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="expense"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={handleChange}
              />
              <label htmlFor="expense" className="radio-custom expense"></label>
              <span>Expense</span>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="income"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={handleChange}
              />
              <label htmlFor="income" className="radio-custom income"></label>
              <span>Income</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">
            <DollarSign size={18} />
            Amount
          </label>
          <div className="input-wrapper">
            <span className="input-prefix">₹</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">
            <FileText size={18} />
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter transaction description"
            maxLength="200"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">
            <Tag size={18} />
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={18} />
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={formatDateForInput(new Date())}
            required
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional notes..."
            maxLength="500"
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X size={18} />
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                {transaction ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {transaction ? 'Update Transaction' : 'Add Transaction'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;