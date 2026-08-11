import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import type { SyncStatus } from '../../types';

interface HeaderProps {
  syncStatus: SyncStatus;
}

const syncConfig: Record<SyncStatus, { icon: typeof Wifi; label: string; color: string; spin?: boolean }> = {
  online:  { icon: Wifi,      label: 'ONLINE',  color: 'text-status-success' },
  syncing: { icon: RefreshCw, label: 'SYNCING', color: 'text-accent-cyan', spin: true },
  offline: { icon: WifiOff,   label: 'OFFLINE', color: 'text-status-warning' },
  synced:  { icon: Check,     label: 'SYNCED',  color: 'text-status-success' },
};

export function Header({ syncStatus }: HeaderProps) {
  const sync = syncConfig[syncStatus];
  const SyncIcon = sync.icon;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 py-3 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center glow-red">
          <span className="text-white font-bold text-sm tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>B</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-text-primary">BOXER</span>
          <span className="text-accent-red">//</span>
          <span className="text-text-secondary">OS</span>
        </h1>
      </div>

      {/* Sync Badge */}
      <button className="badge bg-bg-card border border-border-subtle cursor-pointer hover:border-border-active transition-colors">
        <SyncIcon
          size={12}
          className={`${sync.color} ${sync.spin ? 'animate-sync-spin' : ''}`}
        />
        <span className={`${sync.color} text-[0.625rem]`}>{sync.label}</span>
      </button>
    </header>
  );
}
