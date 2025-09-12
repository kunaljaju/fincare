import React from 'react';  
import { AuthProvider } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Analytics from './components/Analytics';
import BudgetManager from './components/BudgetManager';
import AuthLayout from './components/Authlayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/Errorboundary';
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import CategoryChart from './components/CategoryChart';
import SummaryCard from './components/SummaryCard';
import BudgetProgress from './components/BudgetProgress';



import './App.css';

function AppContent() {
 const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, loading } = useAuth();

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div>
            <SummaryCard />
            <CategoryChart />
            <BudgetProgress />
          </div>
        );
      case 'dashboard':
        return <Dashboard />;
      case 'add-transaction':
        return <TransactionForm />;
      case 'transactions':
        return <TransactionList />;
      case 'analytics':
        return <Analytics />;
      case 'budget':
        return <BudgetManager />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return <LoadingSpinner/>;
  }
  if (!isAuthenticated) {
    return <AuthLayout />;
  }

  return (
    <FinanceProvider>
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="main-content">
            <ProtectedRoute>
              {renderActiveComponent()}
            </ProtectedRoute>
          </main>
        </div>
      </div>
    </FinanceProvider>
  );

}

function App() {
  return (
    
    <ErrorBoundary>
      <AuthProvider>
       <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;