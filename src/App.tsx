
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout';
import { GlobalErrorBoundary } from '@/components/ui/GlobalErrorBoundary';
import { BootDiagnostics } from '@/components/system/BootDiagnostics';
import { ProtectedRoute } from '@/components/system/ProtectedRoute';
import HardRenderTest from '@/pages/HardRenderTest';

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
import { ReactFlowProvider } from '@xyflow/react'; 

const AppRoutes = () => {
  const [showAI, setShowAI] = useState(false);
  const toggleAI = () => setShowAI(prev => !prev);

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/auth" element={<Auth />} />

      {/* Onboarding - Protected but skips onboarding check to avoid loops */}
      <Route path="/onboarding" element={
        <ProtectedRoute requireOnboarding={false}>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* Main App Layout - Protected & Requires Onboarding */}
      <Route element={
        <ProtectedRoute>
          <AppLayout showAI={showAI} toggleAI={toggleAI} />
        </ProtectedRoute>
      }>
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
      </Route>

      {/* Standalone Builder - Protected & Requires Onboarding */}
      <Route path="/automations/builder" element={
        <ProtectedRoute>
          <ReactFlowProvider>
            <AutomationBuilder />
          </ReactFlowProvider>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Component that wraps the main app logic with the necessary providers
const MainAppProviderTree = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BootDiagnostics />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      {/* HashRouter moved to top level to allow route-based provider isolation */}
      <HashRouter>
        <Routes>
          {/* 
            ROUTE: /__render_test
            PURPOSE: Diagnostic route that bypasses ALL providers (Theme, Auth, etc).
            If this renders, the issue is likely within the Provider Tree or hooks.
          */}
          <Route path="/__render_test" element={<HardRenderTest />} />
          
          {/* All other routes go through the standard provider tree */}
          <Route path="/*" element={<MainAppProviderTree />} />
        </Routes>
      </HashRouter>
    </GlobalErrorBoundary>
  );
};

export default App;
