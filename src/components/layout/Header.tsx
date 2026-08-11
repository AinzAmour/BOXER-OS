import { Wifi, WifiOff, RefreshCw, Check, Zap } from 'lucide-react';
import { useState } from 'react';
import type { SyncStatus } from '../../types';
import { SyncModal } from '../sync/SyncModal';

interface HeaderProps {
  syncStatus: SyncStatus;
  userLevel?: number;
  userXp?: number;
  onSyncNow?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

const syncConfig: Record<SyncStatus, { icon: typeof Wifi; label: string; color: string; spin?: boolean }> = {
  online:  { icon: Wifi,      label: 'ONLINE',  color: 'text-status-success' },
  syncing: { icon: RefreshCw, label: 'SYNCING', color: 'text-accent-cyan', spin: true },
  offline: { icon: WifiOff,   label: 'OFFLINE', color: 'text-status-warning' },
  synced:  { icon: Check,     label: 'SYNCED',  color: 'text-status-success' },
};

export function Header({
  syncStatus,
  userLevel = 1,
  userXp = 150,
  onSyncNow,
  onExport,
  onImport,
}: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sync = syncConfig[syncStatus];
  const SyncIcon = sync.icon;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 py-3 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-md">
        {/* Logo & Level */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center glow-red">
            <span className="text-white font-bold text-sm tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">
              <span className="text-text-primary">LIFE</span>
              <span className="text-accent-red">//</span>
              <span className="text-text-secondary">OS</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="badge bg-accent-gold/15 text-accent-gold border border-accent-gold/20 text-[0.5625rem] py-0 px-1.5">
                LVL {userLevel}
              </span>
              <span className="text-[0.625rem] font-mono text-text-muted flex items-center gap-0.5">
                <Zap size={10} className="text-accent-gold" /> {userXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Sync Badge */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="badge bg-bg-card border border-border-subtle cursor-pointer hover:border-border-active transition-colors"
        >
          <SyncIcon
            size={12}
            className={`${sync.color} ${sync.spin ? 'animate-sync-spin' : ''}`}
          />
          <span className={`${sync.color} text-[0.625rem]`}>{sync.label}</span>
        </button>
      </header>

      <SyncModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        syncStatus={syncStatus}
        onSyncNow={onSyncNow || (() => {})}
        onExport={onExport || (() => {})}
        onImport={onImport || (() => {})}
      />
    </>
  );
}
