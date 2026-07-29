import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const storedUser = localStorage.getItem('userInfo');
    if (!storedUser) return null;

    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed || !parsed.token) return null;

      console.log('[AuthContext] 🔄 Syncing profile with backend...');
      const res = await api.get('/auth/profile');
      const refreshed = { ...parsed, ...res.data };
      setUser(refreshed);
      localStorage.setItem('userInfo', JSON.stringify(refreshed));
      return refreshed;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.data?.errorCode === 'ACCOUNT_BLOCKED') {
        console.warn('[AuthContext] 🔒 401/Blocked on profile refresh. Logging out...');
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
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.token) {
          setUser(parsed);
          console.log('[AuthContext] 👤 User restored from localStorage:', parsed.name);
          refreshProfile(); // Sync profile if valid token exists
        } else {
          localStorage.removeItem('userInfo');
        }
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);

    // Dynamic Permission Sync: Refresh profile periodically (every 30s)
    const interval = setInterval(() => {
      const stored = localStorage.getItem('userInfo');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.token) {
            refreshProfile();
          }
        } catch (e) {}
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
