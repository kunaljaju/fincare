import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import TransactionItem from './TransactionItem';
import LoadingSpinner from './LoadingSpinner';
import { Search, Filter, Calendar, Tag } from 'lucide-react';

const TransactionList = ({ limit }) => {
  const { 
    transactions, 
    deleteTransaction, 
    fetchTransactions, 
    loading
  } = useFinance();

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      startDate: '',
      endDate: ''
    });
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !filters.search || 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesCategory = !filters.category || transaction.category === filters.category;
    
    const matchesDateRange = (!filters.startDate || new Date(transaction.date) >= new Date(filters.startDate)) &&
                           (!filters.endDate || new Date(transaction.date) <= new Date(filters.endDate));
    
    return matchesSearch && matchesType && matchesCategory && matchesDateRange;
  });

  // Apply limit if specified
  const displayTransactions = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

  const allCategories = [...new Set(transactions.map(t => t.category))];
  const filteredTransactionsCount = displayTransactions.length;
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="transaction-list-container">
      <div className="list-header">
        <h2 className="section-title">Transaction History</h2>
        <p className="section-subtitle">View and manage all your financial transactions</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="list-controls">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search transactions..."
            className="search-input"
          />
        </div>

        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
          {hasActiveFilters && <span className="filter-badge"></span>}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="filter-group">
              <label>
                <Tag size={16} />
                Type
              </label>
              <select name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <Tag size={16} />
                Category
              </label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <Calendar size={16} />
                From Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>
                <Calendar size={16} />
                To Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            {hasActiveFilters && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transaction Count */}
      <div className="list-summary">
        <p>
          {loading ? 'Loading...' : `${filteredTransactionsCount} transaction${filteredTransactionsCount !== 1 ? 's' : ''} found`}
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      {/* Transaction List */}
      <div className="transaction-list">
        {loading ? (
          <LoadingSpinner message="Loading transactions..." />
        ) : displayTransactions.length === 0 ? (
          <div className="empty-state">
            <p>
              {hasActiveFilters 
                ? 'No transactions match your filters.'
                : 'No transactions found. Start by adding your first transaction!'
              }
            </p>
          </div>
        ) : (
          displayTransactions.map((transaction) => (
            <TransactionItem
              key={transaction._id}
              transaction={transaction}
              onDelete={deleteTransaction}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;