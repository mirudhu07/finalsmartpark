import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'driver';
  phone?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('smartpark_admin_token');
    const savedUser = localStorage.getItem('smartpark_admin_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    const { user: loggedInUser, accessToken } = res.data;

    if (loggedInUser.role !== 'admin' && loggedInUser.role !== 'operator') {
      throw new Error('Access denied. Administrator or Operator role required.');
    }

    setUser(loggedInUser);
    setToken(accessToken);
    localStorage.setItem('smartpark_admin_token', accessToken);
    localStorage.setItem('smartpark_admin_user', JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartpark_admin_token');
    localStorage.removeItem('smartpark_admin_user');
  };

  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isOperator }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
