
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

interface UIUser {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Staff';
  orgId?: string;
  onboarded: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UIUser | null;
  org: any | null; 
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateOnboarding: (orgData: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UIUser | null>(null);
  const [org, setOrg] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session (Simple local storage mock)
  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('mock_user_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the Mock API
      const response = await api.login(email);
      const userData = { ...response.user, onboarded: true } as UIUser;
      
      setUser(userData);
      localStorage.setItem('mock_user_session', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string) => {
    // Mock Signup
    const newUser = { id: `u-${Date.now()}`, email, name, role: 'Admin' as const, onboarded: false };
    setUser(newUser);
    localStorage.setItem('mock_user_session', JSON.stringify(newUser));
  };

  const logout = () => {
    localStorage.removeItem('mock_user_session');
    setUser(null);
    setOrg(null);
  };

  const updateOnboarding = async (orgData: any) => {
    if (user) {
        const updated = { ...user, onboarded: true };
        setUser(updated);
        localStorage.setItem('mock_user_session', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, org, login, signup, logout, updateOnboarding, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
