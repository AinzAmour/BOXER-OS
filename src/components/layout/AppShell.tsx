import type { ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/dexie';
import type { TabId, SyncStatus } from '../../types';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';

interface AppShellProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  syncStatus: SyncStatus;
  userId?: string;
  onSyncNow?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  children: ReactNode;
}

export function AppShell({
  activeTab,
  onTabChange,
  syncStatus,
  userId = 'local_user',
  onSyncNow,
  onExport,
  onImport,
  children,
}: AppShellProps) {
  const profile = useLiveQuery(
    async () => db.profiles.where('user_id').equals(userId).first(),
    [userId]
  );

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <DesktopSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          enabledModules={profile?.enabled_modules}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header
          syncStatus={syncStatus}
          userLevel={profile?.level || 1}
          userXp={profile?.xp || 100}
          onSyncNow={onSyncNow}
          onExport={onExport}
          onImport={onImport}
        />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 px-4 lg:px-8 pt-4">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="lg:hidden">
        <MobileNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          enabledModules={profile?.enabled_modules}
        />
      </div>
    </div>
  );
}
