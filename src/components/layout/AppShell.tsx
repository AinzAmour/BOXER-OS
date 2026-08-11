import type { ReactNode } from 'react';
import type { TabId, SyncStatus } from '../../types';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';

interface AppShellProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  syncStatus: SyncStatus;
  children: ReactNode;
}

export function AppShell({ activeTab, onTabChange, syncStatus, children }: AppShellProps) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <DesktopSidebar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header syncStatus={syncStatus} />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 px-4 lg:px-8 pt-4">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="lg:hidden">
        <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
