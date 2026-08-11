import { useState } from 'react';
import type { TabId, SyncStatus } from './types';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { RunFixPage } from './pages/RunFixPage';
import { BoxingPage } from './pages/BoxingPage';
import { TimerPage } from './pages/TimerPage';
import { NutritionPage } from './pages/NutritionPage';
import { ProgressionPage } from './pages/ProgressionPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [syncStatus] = useState<SyncStatus>('offline');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab} />;
      case 'assessments': return <AssessmentsPage />;
      case 'runfix': return <RunFixPage />;
      case 'boxing': return <BoxingPage />;
      case 'timer': return <TimerPage />;
      case 'nutrition': return <NutritionPage />;
      case 'progression': return <ProgressionPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      syncStatus={syncStatus}
    >
      {renderPage()}
    </AppShell>
  );
}

export default App;
