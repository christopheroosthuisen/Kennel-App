
import React, { createContext, useContext, useState, useEffect, ReactNode, PropsWithChildren } from 'react';
import { PlatinumEngine } from '../lib/platinum-engine';

// Define User shape to match PlatinumEngine + App requirements
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  token: string;
  onboarded?: boolean; // Required by App.tsx logic
}

interface AuthContextType {
  user: User | null;
  org: any | null; // Mocked for App compatibility
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

  // 1. Restore Session on Mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('platinum_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse session", e);
          localStorage.removeItem('platinum_user');
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  // 2. Login Logic
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await PlatinumEngine.login(email, pass);
      
      if (result.success && result.user) {
        // Inject 'onboarded: true' to ensure the user bypasses the onboarding screen
        const sessionUser = { ...result.user, onboarded: true };
        
        setUser(sessionUser);
        localStorage.setItem('platinum_user', JSON.stringify(sessionUser));
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Logout Logic
  const logout = () => {
    setUser(null);
    localStorage.removeItem('platinum_user');
  };

  // Mock Org object to satisfy App.tsx requirements without a full Org fetch
  const mockOrg = user ? { id: 'org-1', name: 'Platinum Kennel' } : null;

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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
