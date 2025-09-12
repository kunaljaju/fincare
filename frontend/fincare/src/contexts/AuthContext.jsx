import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  axios.defaults.baseURL = API_BASE_URL;

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token with backend
      verifyToken();
    } else {
      // Immediately set up mock user for demo
      setupMockUser();
    }
  }, []);

  const setupMockUser = () => {
    // Clear any existing auth data
    localStorage.removeItem('token');
    localStorage.removeItem('demoDataAdded');
    
    // Immediately set up mock user for demo
    const mockUser = {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@fincare.com',
      preferences: {
        currency: 'INR',
        theme: 'dark'
      }
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const autoRegisterDemoUser = async () => {
    try {
      // First try to login with demo credentials
      try {
        const loginResult = await login('demo@fincare.com', 'demo123456');
        if (loginResult.success) {
          return; // Success, exit early
        }
      } catch (loginError) {
        console.log('Login failed, trying registration...');
      }

      // If login fails, try to register
      try {
        const response = await axios.post('/auth/register', {
          name: 'Demo User',
          email: 'demo@fincare.com',
          password: 'demo123456'
        });
        
        if (response.data.success) {
          const { token, user } = response.data.data;
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch (registerError) {
        console.log('Registration failed, user might already exist. Trying login again...');
        // Try login one more time in case user was created
        try {
          const loginResult = await login('demo@fincare.com', 'demo123456');
          if (loginResult.success) {
            return;
          }
        } catch (finalError) {
          console.error('All attempts failed:', finalError);
          // Set a temporary mock user for demo purposes
          const mockUser = {
            id: 'demo-user-123',
            name: 'Demo User',
            email: 'demo@fincare.com',
            preferences: {
              currency: 'INR',
              theme: 'dark'
            }
          };
          setUser(mockUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auto-register failed:', error);
      // Set a temporary mock user for demo purposes
      const mockUser = {
        id: 'demo-user-123',
        name: 'Demo User',
        email: 'demo@fincare.com',
        preferences: {
          currency: 'INR',
          theme: 'dark'
        }
      };
      setUser(mockUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async () => {
    try {
      const response = await axios.get('/auth/verify');
      if (response.data.success) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { data } = response.data;
      const { token, user } = data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/auth/register', { name, email, password });
      const { data } = response.data;
      const { token, user } = data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
