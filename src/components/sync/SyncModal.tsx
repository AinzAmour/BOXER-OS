import { RefreshCw, Download, Upload, X, Check, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import type { SyncStatus } from '../../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  onSyncNow: () => void;
  onExport: () => void;
  onImport: () => void;
  pendingCount?: number;
}

export function SyncModal({
  isOpen,
  onClose,
  syncStatus,
  onSyncNow,
  onExport,
  onImport,
  pendingCount = 0,
}: SyncModalProps) {
  const [lastSyncTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  if (!isOpen) return null;

  const statusIcons: Record<SyncStatus, { icon: typeof Wifi; color: string; label: string }> = {
    online:  { icon: Wifi,      color: 'text-status-success', label: 'Online — Connected to cloud' },
    syncing: { icon: RefreshCw, color: 'text-accent-cyan animate-sync-spin', label: 'Syncing changes...' },
    offline: { icon: WifiOff,   color: 'text-status-warning', label: 'Offline — Using local storage' },
    synced:  { icon: Check,     color: 'text-status-success', label: 'All changes synced' },
  };

  const current = statusIcons[syncStatus];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-sm p-5 space-y-4 border border-border-default shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">Sync Status</h3>
          <button onClick={onClose} className="btn-ghost p-1 rounded-lg text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <Icon size={24} className={current.color} />
          <div>
            <div className="text-sm font-semibold text-text-primary">{current.label}</div>
            <div className="text-xs text-text-muted mt-0.5">Last sync: {lastSyncTime}</div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-text-secondary">
          <div className="flex justify-between py-1 border-b border-border-subtle">
            <span>Pending changes</span>
            <span className="stat-number text-accent-gold">{pendingCount}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border-subtle">
            <span>Local Database</span>
            <span className="text-text-primary font-mono text-[0.6875rem]">IndexedDB (Dexie.js)</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Cloud Provider</span>
            <span className="text-text-primary font-mono text-[0.6875rem]">Supabase PostgreSQL</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button onClick={onSyncNow} className="btn btn-primary text-xs col-span-2 py-2.5">
            <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-sync-spin' : ''} /> Sync Now
          </button>
          <button onClick={onExport} className="btn btn-secondary text-xs py-2">
            <Download size={14} /> Export JSON
          </button>
          <button onClick={onImport} className="btn btn-secondary text-xs py-2">
            <Upload size={14} /> Import JSON
          </button>
        </div>
      </div>
    </div>
  );
}
