
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout';
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

const App = () => {
  const [showAI, setShowAI] = useState(false);

  return (
    <HashRouter>
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
    </HashRouter>
  );
};

export default App;
