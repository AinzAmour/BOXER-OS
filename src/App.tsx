import { useState, useEffect } from 'react';
import type { TabId } from './types';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { RunFixPage } from './pages/RunFixPage';
import { BoxingPage } from './pages/BoxingPage';
import { TimerPage } from './pages/TimerPage';
import { NutritionPage } from './pages/NutritionPage';
import { ProgressionPage } from './pages/ProgressionPage';
import { SettingsPage } from './pages/SettingsPage';
import { seedInitialData } from './db/seed';
import { useSync } from './hooks/useSync';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { status, flushSync, exportJSON, importJSON } = useSync();

  useEffect(() => {
    // Seed initial Day 0 data into IndexedDB on app load
    seedInitialData().catch(console.error);
  }, []);

  const handleExport = async () => {
    const json = await exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boxer-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const ok = await importJSON(text);
        if (ok) alert('Backup restored successfully into IndexedDB!');
        else alert('Failed to restore backup.');
      } catch {
        alert('Error reading backup file.');
      }
    };
    input.click();
  };

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
      syncStatus={status}
      onSyncNow={flushSync}
      onExport={handleExport}
      onImport={handleImport}
    >
      {renderPage()}
    </AppShell>
  );
}

export default App;
