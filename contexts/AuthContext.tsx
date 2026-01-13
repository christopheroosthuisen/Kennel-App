
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  org: Organization | null;
  login: (email: string) => Promise<void>;
  signup: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateOnboarding: (orgData: Organization) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const sessionUserId = localStorage.getItem('ops_session_uid');
      if (sessionUserId) {
        // Find user
        // Note: In a real app we'd have a findById, reusing findByEmail logic for mock efficiency here is tricky
        // so we will just load all users and find.
        const users = JSON.parse(localStorage.getItem('ops_users') || '[]');
        const foundUser = users.find((u: User) => u.id === sessionUserId);
        
        if (foundUser) {
          setUser(foundUser);
          if (foundUser.orgId) {
             const foundOrg = await db.getOrganization(foundUser.orgId);
             setOrg(foundOrg || null);
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const foundUser = await db.findUserByEmail(email);
      if (!foundUser) {
        throw new Error('User not found. Please sign up.');
      }
      
      setUser(foundUser);
      localStorage.setItem('ops_session_uid', foundUser.id);

      if (foundUser.orgId) {
        const foundOrg = await db.getOrganization(foundUser.orgId);
        setOrg(foundOrg || null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const existing = await db.findUserByEmail(email);
      if (existing) {
        throw new Error('User already exists. Please login.');
      }

      const newUser: User = {
        id: 'u-' + Date.now().toString(36),
        email,
        name,
        role: 'Admin', // Default to Admin for new signups
        onboarded: false
      };

      await db.createUser(newUser);
      setUser(newUser);
      localStorage.setItem('ops_session_uid', newUser.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setOrg(null);
    localStorage.removeItem('ops_session_uid');
  };

  const updateOnboarding = async (orgData: Organization) => {
    setIsLoading(true);
    if (!user) return;

    try {
      // 1. Create the Organization
      const newOrg = await db.createOrganization(orgData);
      
      // 2. Link User to Organization
      const updatedUser = await db.updateUser(user.id, {
        orgId: newOrg.id,
        onboarded: true
      });

      setOrg(newOrg);
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
