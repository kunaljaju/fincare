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
import AuthLayout from './components/AuthLayout';
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (loading) {
    return <LoadingSpinner/>;
  }
  if (!isAuthenticated) {
    return <AuthLayout />;
  }

  return (
    <div className="app">
      {/* Liquid Glass Background Blobs */}
      <div className="liquid-blob blob-1"></div>
      <div className="liquid-blob blob-2"></div>
      <div className="liquid-blob blob-3"></div>

      <Header />
      <div className="app-body">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <ProtectedRoute>
            {renderActiveComponent()}
          </ProtectedRoute>
        </main>
      </div>
    </div>
  );

}

function App() {
  return (
    
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;