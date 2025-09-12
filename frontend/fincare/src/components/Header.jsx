import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, User, LogOut } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Wallet size={32} />
          <h1>FinCare</h1>
        </div>

        <div className="user-section">
          <div className="user-info">
            <User size={18} />
            <span>Welcome, {user?.name || 'User'}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;