
import React, { useState } from 'react';
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
import { ServiceDashboard } from './components/ServiceDashboard'; // Import new dashboard
import { CommunicationProvider, MessagesPage } from './components/Messaging';
import { TeamChatProvider } from './components/TeamChatContext';
import { ThemeProvider } from './components/ThemeContext';
import { SystemProvider } from './components/SystemContext';

const App = () => {
  const [showAI, setShowAI] = useState(false);

  return (
    <HashRouter>
      <ThemeProvider>
        <SystemProvider>
          <TeamChatProvider>
            <CommunicationProvider>
              <AppLayout showAI={showAI} toggleAI={() => setShowAI(prev => !prev)}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/calendar" element={<CalendarView />} />
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
            </CommunicationProvider>
          </TeamChatProvider>
        </SystemProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
