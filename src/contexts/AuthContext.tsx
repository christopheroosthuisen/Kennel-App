
import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log("[AuthProvider] Mounting...");
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hydrate session on mount with timeout failsafe
  useEffect(() => {
    console.log("[AuthProvider] Hydration effect start");
    let mounted = true;

    const hydrate = async () => {
      const token = getToken();
      if (!token) {
        console.log("[AuthProvider] No token found, finishing load.");
        if (mounted) setIsLoading(false);
        return;
      }

      console.log("[AuthProvider] Token found, validating...");

      // 8-second timeout to prevent infinite loading screens if API is hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timed out")), 8000)
      );

      try {
        const res: any = await Promise.race([
          apiFetch<{ user: any }>('/api/auth/me'),
          timeoutPromise
        ]);

        if (mounted) {
          if (res && res.user) {
            console.log("[AuthProvider] Hydration success:", res.user.email);
            setUser({ ...res.user, onboarded: true });
          } else {
            // Valid JSON but no user? weird, clear token
            console.warn("[AuthProvider] Valid response but no user object.");
            clearToken();
          }
        }
      } catch (e: any) {
        console.warn("[AuthProvider] Session hydration failed:", e);
        if (mounted) {
          if (e.message === 'Unauthorized' || e.status === 401) {
            // Clean auth failure, just redirect to login
            clearToken();
            setUser(null);
          } else {
            // Network error or timeout - expose to UI
            setError(e.message || "Failed to connect to server");
            // We do NOT clear token here, effectively keeping the user "logged in" but in error state,
            // or we can treat as logged out. For safety, let's treat as logged out but keep error visible.
            // Actually, keep token so retry works.
          }
        }
      } finally {
        if (mounted) {
            console.log("[AuthProvider] Hydration complete. Loading: false");
            setIsLoading(false);
        }
      }
    };

    hydrate();
    return () => { mounted = false; };
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
      console.error("Login Error:", err);
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("[AuthProvider] Logging out");
    clearToken();
    setUser(null);
    // Best effort logout on server
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
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
