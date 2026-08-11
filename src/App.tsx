import { useState, useEffect } from 'react';
import type { TabId } from './types';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { SkillGraphPage } from './pages/SkillGraphPage';
import { AdaptiveAssessmentPage } from './pages/AdaptiveAssessmentPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { RunFixPage } from './pages/RunFixPage';
import { BoxingPage } from './pages/BoxingPage';
import { TimerPage } from './pages/TimerPage';
import { NutritionPage } from './pages/NutritionPage';
import { ProgressionPage } from './pages/ProgressionPage';
import { AICoachPage } from './pages/AICoachPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { seedInitialData } from './db/seed';
import { useSync } from './hooks/useSync';
import { useAuth } from './hooks/useAuth';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { status, flushSync, exportJSON, importJSON } = useSync();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Seed initial Day 0 data & LIFE//OS skill trees into IndexedDB on app load
    seedInitialData().catch(console.error);

    // Check remember me state
    const isRemembered = localStorage.getItem('boxer_os_remember_me') === 'true';
    const isGuestUnlocked = localStorage.getItem('boxer_os_guest_unlocked') === 'true';
    if (isRemembered || isGuestUnlocked) {
      setUnlocked(true);
    }
  }, []);

  const handleExport = async () => {
    const json = await exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
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

  const handleLogout = async () => {
    localStorage.removeItem('boxer_os_remember_me');
    localStorage.removeItem('boxer_os_guest_unlocked');
    setUnlocked(false);
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0b0d10] text-[#f0f2f5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center mx-auto glow-red animate-pulse-glow">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
          </div>
          <p className="text-xs text-text-muted font-mono tracking-widest uppercase">INITIALIZING LIFE//OS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !unlocked) {
    return <AuthPage onAuthenticated={() => setUnlocked(true)} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage onNavigate={setActiveTab} />;
      case 'skills': return <SkillGraphPage />;
      case 'assessments': return (
        <div className="space-y-8">
          <AdaptiveAssessmentPage />
          <div className="border-t border-border-subtle pt-6">
            <AssessmentsPage />
          </div>
        </div>
      );
      case 'runfix': return <RunFixPage />;
      case 'boxing': return <BoxingPage />;
      case 'timer': return <TimerPage />;
      case 'nutrition': return <NutritionPage />;
      case 'progression': return <ProgressionPage />;
      case 'ai_coach': return <AICoachPage />;
      case 'settings': return <SettingsPage onLogout={handleLogout} userEmail={user?.email} />;
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
