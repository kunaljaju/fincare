import React from 'react';
import { 
  Home, 
  Plus, 
  List, 
  BarChart3, 
  Target
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-transaction', label: 'Add Transaction', icon: Plus },
    { id: 'transactions', label: 'Transactions', icon: List },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budget', label: 'Budget Manager', icon: Target }
  ];

  return (
    <aside className="sidebar">
      <nav>
        <ul className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;