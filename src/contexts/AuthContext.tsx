
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../../shared/domain'; // Use shared domain type
import { apiFetch, setToken, clearToken, getToken } from '../auth/auth';

// Define a type compatible with the frontend UI expectation if necessary, 
// or simply assume Shared.UserAccount is sufficient. 
// For now, mapping response user to existing UI User type.
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
  org: any | null; // Placeholder for now until org API is ready
  login: (email: string) => Promise<void>;
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

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const { user } = await apiFetch<{ user: any }>('/api/auth/me');
          setUser({ ...user, onboarded: true }); // Assume onboarded for seeded users for now
        } catch (err) {
          console.error("Session restore failed", err);
          clearToken();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => { // Updated signature to accept password
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch<{ token: string, user: any }>('/api/auth/login', {
        method: 'POST',
        data: { email, password }
      });
      
      setToken(response.token);
      setUser({ ...response.user, onboarded: true });
      // In a real flow, fetch org details here if orgId exists
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string) => {
    setError("Self-signup is disabled in local mode. Please use admin@local / admin123");
  };

  const logout = () => {
    // Fire and forget logout on server
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    clearToken();
    setUser(null);
    setOrg(null);
  };

  const updateOnboarding = async (orgData: any) => {
    // Placeholder for future implementation
    console.log("Onboarding update:", orgData);
  };

  return (
    <AuthContext.Provider value={{ user, org, login: login as any, signup, logout, updateOnboarding, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
