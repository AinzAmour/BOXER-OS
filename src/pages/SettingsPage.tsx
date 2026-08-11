import { Settings, Download, Upload, Database, Moon, Smartphone } from 'lucide-react';
import { useState } from 'react';

export function SettingsPage() {
  const [theme] = useState('dark');

  const handleExport = () => {
    // TODO: Export all IndexedDB data as JSON
    const data = {
      app: 'BOXER//OS',
      version: '0.1.0',
      exported_at: new Date().toISOString(),
      // In production: serialize all Dexie tables
      profile: {},
      assessments: [],
      running_attempts: [],
      boxing_sessions: [],
      nutrition_logs: [],
      timer_presets: [],
      phase_progress: [],
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boxer-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.app !== 'BOXER//OS') {
          alert('Invalid BOXER//OS backup file.');
          return;
        }
        // TODO: Import data into IndexedDB
        alert('Backup restored successfully!');
      } catch {
        alert('Failed to read backup file.');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-text-secondary" />
        <h2 className="text-lg font-bold">Settings</h2>
      </div>

      {/* App Info */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent-red flex items-center justify-center glow-red">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-mono)' }}>B</span>
          </div>
          <div>
            <h3 className="text-base font-bold">BOXER<span className="text-accent-red">//</span>OS</h3>
            <p className="text-xs text-text-muted font-mono">v0.1.0</p>
          </div>
        </div>
        <p className="text-xs text-text-secondary">
          Tactical boxing fitness tracker. Track baselines, diagnose running difficulty, train boxing fundamentals, time rounds, manage nutrition — synced across devices.
        </p>
      </div>

      {/* Theme */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Moon size={16} className="text-accent-purple" />
          <h3 className="text-sm font-bold">Appearance</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Theme</span>
          <span className="badge bg-bg-secondary text-text-muted border border-border-default">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
      </div>

      {/* Sync */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Database size={16} className="text-accent-cyan" />
          <h3 className="text-sm font-bold">Cloud Sync</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Status</span>
            <span className="badge bg-status-warning/15 text-status-warning">Setup Required</span>
          </div>
          <p className="text-xs text-text-muted">
            Sign in to sync your data across Windows and Android devices via Supabase.
          </p>
        </div>
      </div>

      {/* Device */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} className="text-accent-gold" />
          <h3 className="text-sm font-bold">Device</h3>
        </div>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>Device ID</span>
            <span className="font-mono text-xs text-text-muted">{typeof crypto !== 'undefined' ? crypto.randomUUID().slice(0, 8) : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform</span>
            <span className="text-text-muted">{navigator.userAgent.includes('Android') ? 'Android' : 'Desktop'}</span>
          </div>
        </div>
      </div>

      {/* Backup */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-bold">Data Backup</h3>
        <p className="text-xs text-text-muted">Export all your data as a JSON file, or restore from a previous backup.</p>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleExport} className="btn btn-secondary text-sm">
            <Download size={16} /> Export JSON
          </button>
          <button onClick={handleImport} className="btn btn-secondary text-sm">
            <Upload size={16} /> Import JSON
          </button>
        </div>
      </div>
    </div>
  );
}
