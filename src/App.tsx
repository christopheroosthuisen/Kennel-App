import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout';
import { GlobalErrorBoundary } from '@/components/ui/GlobalErrorBoundary';

// Pages
import { Dashboard } from '@/components/Dashboard';
import { Reservations } from '@/components/Reservations';
import { CalendarView } from '@/components/Calendar';
import { POS } from '@/components/POS';
import { Profiles } from '@/components/Profiles';
import { ReportCards } from '@/components/ReportCards';
import { Reports } from '@/components/Reports';
import { Admin } from '@/components/Admin';
import { Automations } from '@/components/Automations';
import { Notifications } from '@/components/Notifications';
import { Auth } from '@/pages/Auth';
import { Onboarding } from '@/pages/Onboarding';
import { AutomationBuilder } from '@/pages/AutomationBuilder'; 
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Dog } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react'; 

// Component to handle Auth state routing
const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showAI, setShowAI] = useState(false);

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

  // 1. Not Logged In
  if (!user) {
    return <Auth />;
  }

  // 2. Logged In, but No Organization (Needs Onboarding)
  if (!user.onboarded) {
    return <Onboarding />;
  }

  // 3. Authenticated & Onboarded
  return (
    <HashRouter>
      <Routes>
        {/* Standalone Route for Builder (No sidebar layout) */}
        <Route 
          path="/automations/builder" 
          element={
            <ReactFlowProvider>
              <AutomationBuilder />
            </ReactFlowProvider>
          } 
        />

        {/* Main Layout Routes */}
        <Route
          path="*"
          element={
            <AppLayout showAI={showAI} toggleAI={() => setShowAI(prev => !prev)}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/owners-pets" element={<Profiles />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/report-cards" element={<ReportCards />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </HashRouter>
  );
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
};

export default App;