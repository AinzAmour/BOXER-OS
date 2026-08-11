import {
  LayoutDashboard,
  Activity,
  Footprints,
  Swords,
  Timer,
  UtensilsCrossed,
  TrendingUp,
  Settings,
} from 'lucide-react';
import type { TabId } from '../../types';

interface MobileNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const navItems: { id: TabId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard',   icon: LayoutDashboard,  label: 'HUD' },
  { id: 'assessments',  icon: Activity,         label: 'Test' },
  { id: 'runfix',      icon: Footprints,       label: 'Run' },
  { id: 'boxing',      icon: Swords,           label: 'Box' },
  { id: 'timer',       icon: Timer,            label: 'Timer' },
  { id: 'nutrition',   icon: UtensilsCrossed,  label: 'Food' },
  { id: 'progression', icon: TrendingUp,       label: 'Phase' },
  { id: 'settings',    icon: Settings,         label: 'Gear' },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-lg border-t border-border-subtle safe-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-lg transition-all duration-200 min-w-[3rem] ${
                isActive
                  ? 'text-accent-cyan'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[0.5625rem] font-semibold tracking-wide uppercase">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 w-6 h-0.5 bg-accent-cyan rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
