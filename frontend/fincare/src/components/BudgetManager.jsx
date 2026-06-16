import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import BudgetProgress from './BudgetProgress';
import LoadingSpinner from './LoadingSpinner';
import { Plus, Target, AlertCircle } from 'lucide-react';

const BudgetManager = () => {
  const { 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget,
    fetchBudgets,
    loading
  } = useFinance();

  // Fetch budgets when component mounts
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Standard expense categories matching transactions
  const categories = [
    'Food & Dining', 'Rent', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
    'Healthcare', 'Education', 'Travel', 'Other Expenses'
  ];

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    alertThreshold: 80
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingBudget) {
      const budgetLimit = editingBudget.limit !== undefined && editingBudget.limit !== null ? editingBudget.limit : editingBudget.amount;
      setFormData({
        category: editingBudget.category,
        limit: budgetLimit !== undefined && budgetLimit !== null ? budgetLimit.toString() : '0',
        period: editingBudget.period,
        alertThreshold: editingBudget.alertThreshold
      });
      setShowForm(true);
    }
  }, [editingBudget]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      if (!formData.category.trim()) {
        setFormError('Please select a category');
        return;
      }

      if (!formData.limit || parseFloat(formData.limit) <= 0) {
        setFormError('Please enter a valid budget limit');
        return;
      }

      const budgetData = {
        ...formData,
        limit: parseFloat(formData.limit),
        alertThreshold: parseFloat(formData.alertThreshold)
      };

      let result;
      if (editingBudget) {
        result = await updateBudget(editingBudget._id, budgetData);
      } else {
        result = await addBudget(budgetData);
      }

      if (result && !result.success) {
        setFormError(result.error || 'Failed to save budget');
        return;
      }

      // Reset form
      setFormData({
        category: '',
        limit: '',
        period: 'monthly',
        alertThreshold: 80
      });
      setShowForm(false);
      setEditingBudget(null);

    } catch (err) {
      setFormError(err.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        setError('');
        const res = await deleteBudget(budgetId);
        if (!res.success) {
          setError(res.error || 'Failed to delete budget');
        }
      } catch (err) {
        console.error('Failed to delete budget:', err);
        setError('Failed to delete budget');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({
      category: '',
      limit: '',
      period: 'monthly',
      alertThreshold: 80
    });
    setFormError('');
  };

  const availableCategories = categories;

  return (
    <div className="budget-manager">
      <div className="budget-header">
        <h2 className="section-title">Budget Manager</h2>
        <p className="section-subtitle">Set spending limits and track your budget progress</p>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Create Budget'}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Budget Form */}
      {showForm && (
        <div className="budget-form">
          <h3>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h3>
          
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="error-banner">
                {formError}
              </div>
            )}

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Category</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Budget Limit (₹)</label>
              <div className="input-wrapper">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  name="limit"
                  value={formData.limit}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Period</label>
              <select
                name="period"
                value={formData.period}
                onChange={handleFormChange}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Alert Threshold (%)</label>
              <input
                type="number"
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleFormChange}
                min="0"
                max="100"
                placeholder="80"
              />
              <small>Get notified when spending reaches this percentage</small>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (editingBudget ? 'Update' : 'Create')} Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div className="budget-list">
        {loading ? (
          <LoadingSpinner message="Loading budgets..." />
        ) : budgets.length === 0 ? (
          <div className="empty-state">
            <Target size={48} />
            <h3>No budgets created yet</h3>
            <p>Create your first budget to start tracking your spending limits</p>
          </div>
        ) : (
          budgets.map(budget => (
            <BudgetProgress
              key={budget._id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetManager;