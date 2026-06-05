import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      api.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (phone, password) => {
    await api.login(phone, password);
    await fetchUser();
  };

  const register = async (data) => {
    const result = await api.register(data);
    return result;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = useCallback((updated) => {
    setUser(prev => prev ? { ...prev, ...updated } : prev);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchUser,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'service_provider',
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'area_manager',
    isVerified: user?.is_verified === true,
    isApproved: user?.is_approved === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
