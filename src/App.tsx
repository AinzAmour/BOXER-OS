import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { TabId } from './types';
import { db } from './db/dexie';
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
import { OnboardingPage } from './pages/OnboardingPage';
import { seedReferenceData } from './db/seed';
import { useSync } from './hooks/useSync';
import { useAuth } from './hooks/useAuth';
import { Bot, RotateCcw, ArrowRight } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { status, flushSync, exportJSON, importJSON } = useSync();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [skipMigration, setSkipMigration] = useState(false);

  const userId = user?.id || 'local_user';

  // Query profile from Dexie for current user
  const profiles = useLiveQuery(
    async () => db.profiles.toArray(),
    []
  );

  const userProfile = profiles?.find((p) => p.user_id === userId || p.id === 'profile_default');
  const isLegacyProfile = userProfile?.id === 'profile_default' && userProfile?.name === 'Mohammed Habibur Rahman';

  useEffect(() => {
    // Seed universal reference data into IndexedDB on app load
    seedReferenceData(userId).catch(console.error);

    // Check remember me state
    const isRemembered = localStorage.getItem('boxer_os_remember_me') === 'true';
    const isGuestUnlocked = localStorage.getItem('boxer_os_guest_unlocked') === 'true';
    if (isRemembered || isGuestUnlocked) {
      setUnlocked(true);
    }
  }, [userId]);

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

  const handleResetLegacyProfile = async () => {
    try {
      // Clear legacy profile so user can undergo fresh Ciel onboarding
      await db.profiles.where('id').equals('profile_default').delete();
      await db.assessments.where('entry_number').equals(0).delete();
      setSkipMigration(true);
    } catch (err) {
      console.error('Error clearing legacy profile:', err);
    }
  };

  if (loading || profiles === undefined) {
    return (
      <div className="min-h-dvh bg-[#0b0d10] text-[#f0f2f5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center mx-auto glow-red animate-pulse-glow">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
          </div>
          <p className="text-xs text-text-muted font-mono tracking-widest uppercase">INITIALIZING CIEL INTELLIGENCE LAYER...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !unlocked) {
    return <AuthPage onAuthenticated={() => setUnlocked(true)} />;
  }

  // Check legacy profile choice
  if (isLegacyProfile && !skipMigration) {
    return (
      <div className="min-h-dvh bg-bg-primary text-text-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-bg-card border border-border-subtle rounded-2xl p-6 space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center mx-auto text-accent-gold">
            <Bot size={28} />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Legacy Profile Detected</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              We detected default baseline data from BOXER//OS v0.1. LIFE//OS v2.0 uses Ciel AI to build a personalized profile tailored strictly to you.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setSkipMigration(true)}
              className="w-full py-3 px-4 rounded-xl bg-accent-red hover:bg-accent-red/90 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Keep & Continue with Existing Data</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleResetLegacyProfile}
              className="w-full py-3 px-4 rounded-xl bg-bg-secondary border border-border-subtle hover:border-border-active text-text-primary font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} className="text-accent-cyan" />
              <span>Start Fresh with Ciel AI Onboarding</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if profile exists for this user. If not, trigger Ciel Onboarding Page!
  if (!userProfile && !skipMigration) {
    return (
      <OnboardingPage
        userId={userId}
        onComplete={() => {
          setSkipMigration(true);
        }}
      />
    );
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
      userId={userId}
      onSyncNow={flushSync}
      onExport={handleExport}
      onImport={handleImport}
    >
      {renderPage()}
    </AppShell>
  );
}

export default App;
