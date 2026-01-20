
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserAccount } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: UserAccount | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  // Default to first mock user (John Doe, Admin) for immediate access
  const [user, setUser] = useState<UserAccount | null>(MOCK_USERS[0]);

  const login = (email: string) => {
    const found = MOCK_USERS.find(u => u.email === email);
    if (found) setUser(found);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
