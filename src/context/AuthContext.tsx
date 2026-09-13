import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ user: User }>;
  register: (payload: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => Promise<{ user: User }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session on mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const res = await api.auth.getMe();
        if (isMounted) {
          setUser(res.user);
          setToken(stored);
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
        setStoredToken(null);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ user: User }> => {
    const res = await api.auth.login({ email, password: pass });
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return { user: res.user };
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ user: User }> => {
    const res = await api.auth.register(payload);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return { user: res.user };
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.auth.getMe();
      setUser(res.user);
    } catch {
      logout();
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
