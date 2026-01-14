
import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { apiFetch, setToken, clearToken, getToken } from '../auth/auth';

// Minimal User interface for Context
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  onboarded: boolean;
  avatar?: string;
  orgId: string;
}

interface AuthContextType {
  user: User | null;
  org: any | null; 
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate session on mount
  useEffect(() => {
    const hydrate = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiFetch<{ user: any }>('/api/auth/me');
        setUser({ ...res.user, onboarded: true }); // Assume onboarded for now
      } catch (e) {
        console.error("Session hydration failed", e);
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ token: string, user: any }>('/api/auth/login', {
        method: 'POST',
        data: { email, password: pass }
      });
      
      setToken(res.token);
      setUser({ ...res.user, onboarded: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const mockOrg = user ? { id: user.orgId, name: 'My Kennel' } : null;

  return (
    <AuthContext.Provider value={{
      user,
      org: mockOrg,
      isLoading,
      login,
      logout,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
