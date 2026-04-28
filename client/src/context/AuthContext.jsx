import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      const storedUser = localStorage.getItem('userInfo');
      const parsed = storedUser ? JSON.parse(storedUser) : {};
      
      const refreshed = { ...parsed, ...res.data };
      setUser(refreshed);
      localStorage.setItem('userInfo', JSON.stringify(refreshed));
      return refreshed;
    } catch (err) {
      if (err.response?.data?.errorCode === 'ACCOUNT_BLOCKED') {
        logout();
        return null;
      }
      console.warn('[AuthContext] Background refresh failed:', err.message);
      return null;
    }
  };

  // Load and Sync User Profile
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      refreshProfile(); // Immediate sync on mount
    }
    setLoading(false);

    // Dynamic Permission Sync: Refresh profile periodically (every 30s)
    // This ensures "Team Chat" appears/disappears near-realtime after Admin action
    const interval = setInterval(() => {
      if (localStorage.getItem('userInfo')) {
        refreshProfile();
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateUserData = (newData) => {
    // Preserve token explicitly but overwrite variables like name/email seamlessly
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, updateUserData, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
