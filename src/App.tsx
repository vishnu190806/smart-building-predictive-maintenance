import React, { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { AccessControl } from './pages/AccessControl';
import { Activity, Zap } from 'lucide-react';
import { Header } from './components/layout/Header';

import { PredictiveMaintenance } from './pages/PredictiveMaintenance';
import { EnergyMonitor } from './pages/EnergyMonitor';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { About } from './pages/About';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'access':
        return <AccessControl />;
      case 'energy':
        return <EnergyMonitor />;
      case 'maintenance':
        return <PredictiveMaintenance />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'about':
        return <About onNavigate={setActivePage} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout activePage={activePage} onNavigate={setActivePage}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
