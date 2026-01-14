
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/Layout';

// Pages
import { Dashboard } from './components/Dashboard';
import { Reservations } from './components/Reservations';
import { CalendarView } from './components/Calendar';
import { POS } from './components/POS';
import { Profiles } from './components/Profiles';
import { ReportCards } from './components/ReportCards';
import { Reports } from './components/Reports';
import { Admin } from './components/Admin';
import { Automations } from './components/Automations';
import { Notifications } from './components/Notifications';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { AutomationBuilder } from './pages/AutomationBuilder'; 
import { Dog } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react'; 

// Component to handle Auth state routing
const AppContent = () => {
  const { user, org, isLoading } = useAuth();
  const [showAI, setShowAI] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white animate-bounce">
          <Dog size={24} />
        </div>
        <div className="text-slate-400 font-medium text-sm animate-pulse">Loading Partners Ops...</div>
      </div>
    );
  }

  // 1. Not Logged In
  if (!user) {
    return <Auth />;
  }

  // 2. Logged In, but No Organization (Needs Onboarding)
  if (!user.onboarded || !org) {
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
