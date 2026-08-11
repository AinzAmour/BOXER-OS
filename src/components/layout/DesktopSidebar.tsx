import {
  LayoutDashboard,
  Network,
  Activity,
  Footprints,
  Swords,
  Timer,
  UtensilsCrossed,
  TrendingUp,
  Bot,
  Settings,
} from 'lucide-react';
import type { TabId } from '../../types';

interface DesktopSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  enabledModules?: string[];
}

const navSections: {
  title: string;
  items: { id: TabId; icon: typeof LayoutDashboard; label: string; moduleKey?: string }[];
}[] = [
  {
    title: 'CORE',
    items: [
      { id: 'dashboard',   icon: LayoutDashboard,  label: 'Command Center' },
      { id: 'skills',      icon: Network,          label: 'Skill Graph' },
    ],
  },
  {
    title: 'BODY',
    items: [
      { id: 'assessments',  icon: Activity,         label: 'Assessments',  moduleKey: 'fitness' },
      { id: 'runfix',      icon: Footprints,       label: 'Run-Fix',      moduleKey: 'running' },
      { id: 'boxing',      icon: Swords,           label: 'Boxing Engine', moduleKey: 'boxing' },
      { id: 'timer',       icon: Timer,            label: 'Round Timer' },
      { id: 'nutrition',   icon: UtensilsCrossed,  label: 'Nutrition',    moduleKey: 'nutrition' },
      { id: 'progression', icon: TrendingUp,       label: 'Phase Roadmap' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'ai_coach',    icon: Bot,              label: 'AI Assistant' },
      { id: 'settings',    icon: Settings,         label: 'Settings' },
    ],
  },
];

export function DesktopSidebar({ activeTab, onTabChange, enabledModules }: DesktopSidebarProps) {
  // Filter sections by enabled_modules if provided
  const isModuleVisible = (moduleKey?: string) => {
    if (!moduleKey || !enabledModules || enabledModules.length === 0) return true;
    return enabledModules.includes(moduleKey);
  };

  return (
    <aside className="w-56 h-dvh sticky top-0 border-r border-border-subtle bg-bg-secondary flex flex-col overflow-y-auto">
      {/* Spacer for header alignment */}
      <div className="h-14 flex-shrink-0" />

      <nav className="flex-1 px-3 py-4 space-y-6">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => isModuleVisible(item.moduleKey));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <div className="px-3 mb-2 text-[0.625rem] font-bold tracking-[0.15em] text-text-muted uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-bg-card text-accent-cyan border border-border-active'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50 border border-transparent'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Version footer */}
      <div className="px-6 py-4 border-t border-border-subtle">
        <p className="text-[0.625rem] text-text-muted font-mono tracking-wider">LIFE//OS v2.0.0</p>
      </div>
    </aside>
  );
}
