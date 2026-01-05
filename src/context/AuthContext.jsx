import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('pare_token');
      
      if (token) {
        try {
          const response = await api.getMe();
          if (response.success) {
            setUser(response.data.user);
          }
        } catch (err) {
          console.error('Failed to load user:', err);
          // Token inválido, limpar
          api.clearToken();
          localStorage.removeItem('pare_current_user');
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.register(name, email, password);
      
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('pare_current_user', response.data.user.email);
        return { success: true, user: response.data.user };
      }
      
      const errorMessage = response.message || 'Erro ao criar conta';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      const errorMessage = err.message || 'Erro de conexão. Verifique sua internet.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.login(email, password);
      
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('pare_current_user', response.data.user.email);
        return { success: true, user: response.data.user };
      }
      
      const errorMessage = response.message || 'Email ou senha incorretos';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } catch (err) {
      const errorMessage = err.message || 'Erro de conexão. Verifique sua internet.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    localStorage.removeItem('pare_current_user');
    // Manter pare_users para não perder dados locais
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const refreshUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
