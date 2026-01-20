import React, { useState, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Reservations } from './components/Reservations';
import { CalendarView } from './components/Calendar';
import { Classes } from './components/Classes';
import { POS } from './components/POS';
import { Profiles } from './components/Profiles';
import { ReportCards } from './components/ReportCards';
import { Reports } from './components/Reports';
import { Admin } from './components/Admin';
import { Automations } from './components/Automations';
import { Notifications } from './components/Notifications';
import { TeamManagement } from './components/Team';
import { InternalChat } from './components/InternalChat';
import { CareDashboard } from './components/CareDashboard';
import { Marketing } from './components/Marketing';
import { ServiceDashboard } from './components/ServiceDashboard'; 
import { FacilityMap } from './components/FacilityMap';
import { CommunicationProvider, MessagesPage } from './components/Messaging';
import { TeamChatProvider } from './components/TeamChatContext';
import { ThemeProvider } from './components/ThemeContext';
import { SystemProvider } from './components/SystemContext';
import { DataProvider } from './components/DataContext';
import { AuthProvider } from './components/AuthContext';
import { ToastProvider } from './components/ToastContext';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center p-8 bg-white rounded-lg border shadow-sm">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 text-white rounded">Reload Application</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [showAI, setShowAI] = useState(false);

  return (
    <HashRouter>
      <ThemeProvider>
        <ToastProvider>
          <SystemProvider>
            <DataProvider>
              <AuthProvider>
                <TeamChatProvider>
                  <CommunicationProvider>
                    <ErrorBoundary>
                      <AppLayout showAI={showAI} toggleAI={() => setShowAI(prev => !prev)}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/reservations" element={<Reservations />} />
                          <Route path="/calendar" element={<CalendarView />} />
                          <Route path="/map" element={<FacilityMap />} />
                          <Route path="/classes" element={<Classes />} />
                          <Route path="/pos" element={<POS />} />
                          <Route path="/owners-pets" element={<Profiles />} />
                          <Route path="/messages" element={<MessagesPage />} />
                          <Route path="/team" element={<TeamManagement />} />
                          <Route path="/team/chat" element={<InternalChat />} />
                          <Route path="/care" element={<CareDashboard />} />
                          <Route path="/services" element={<ServiceDashboard />} />
                          <Route path="/marketing" element={<Marketing />} />
                          <Route path="/automations" element={<Automations />} />
                          <Route path="/report-cards" element={<ReportCards />} />
                          <Route path="/reports" element={<Reports />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/notifications" element={<Notifications />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </AppLayout>
                    </ErrorBoundary>
                  </CommunicationProvider>
                </TeamChatProvider>
              </AuthProvider>
            </DataProvider>
          </SystemProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;