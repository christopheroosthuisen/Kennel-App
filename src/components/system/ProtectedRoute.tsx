
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Dog } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 gap-6">
        <div className="relative">
          <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 animate-bounce">
            <Dog size={32} />
          </div>
          <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-white rounded-full flex items-center justify-center animate-spin">
            <div className="h-2 w-2 bg-indigo-600 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-white font-bold text-xl tracking-tight">Partners Ops</h2>
          <div className="text-slate-400 font-medium text-sm">Initializing System...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If the route requires onboarding (default) and user hasn't completed it, redirect
  if (requireOnboarding && !user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is trying to access onboarding but is already onboarded, send to dashboard
  if (!requireOnboarding && user.onboarded && window.location.hash.includes('onboarding')) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
