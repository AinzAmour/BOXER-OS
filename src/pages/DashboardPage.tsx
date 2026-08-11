import {
  Activity,
  Footprints,
  Swords,
  Timer,
  UtensilsCrossed,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Dumbbell,
  Target,
} from 'lucide-react';
import type { TabId } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: TabId) => void;
}

// ── Baseline Entry #0 snapshot ──
const baseline = {
  weight_kg: 85,
  body_fat_pct: '>30%',
  waist_inches: 34,
  pushups: 15,
  squats: 20,
  pullups: 5,
  plank: '>1 min',
  jump_rope: '>1 min',
  walking: '~10 min',
  jogging: '~15 min',
  running: 'Unable',
};

const quickActions: { id: TabId; icon: typeof Activity; label: string; color: string; glow: string }[] = [
  { id: 'assessments', icon: Activity,         label: 'Retest',       color: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/20',  glow: 'glow-cyan' },
  { id: 'runfix',      icon: Footprints,       label: 'Log Run',      color: 'bg-accent-gold/15 text-accent-gold border-accent-gold/20',  glow: 'glow-gold' },
  { id: 'boxing',      icon: Swords,           label: 'Train Boxing', color: 'bg-accent-red/15 text-accent-red border-accent-red/20',     glow: 'glow-red' },
  { id: 'timer',       icon: Timer,            label: 'Round Timer',  color: 'bg-accent-teal/15 text-accent-teal border-accent-teal/20',  glow: 'glow-teal' },
  { id: 'nutrition',   icon: UtensilsCrossed,  label: 'Log Meal',     color: 'bg-accent-purple/15 text-accent-purple border-accent-purple/20', glow: '' },
  { id: 'progression', icon: TrendingUp,       label: 'Roadmap',      color: 'bg-status-success/15 text-status-success border-status-success/20', glow: '' },
];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      {/* ── Run-Fix Investigation Alert ── */}
      <div className="glass-card p-4 border-l-4 border-l-accent-gold flex items-start gap-3">
        <AlertTriangle size={20} className="text-accent-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent-gold">Active Investigation</p>
          <p className="text-xs text-text-secondary mt-1">
            Why is running currently difficult? Log running attempts in Run-Fix to help identify patterns.
          </p>
        </div>
        <button
          onClick={() => onNavigate('runfix')}
          className="btn-ghost text-accent-gold text-xs flex items-center gap-1"
        >
          Open <ChevronRight size={14} />
        </button>
      </div>

      {/* ── Phase Status ── */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-accent-red" />
            <span className="text-xs font-bold tracking-widest text-text-muted uppercase">Current Phase</span>
          </div>
          <span className="badge bg-accent-red/15 text-accent-red border border-accent-red/20">PHASE 1</span>
        </div>
        <h2 className="text-lg font-bold text-text-primary">Beginner Fitness</h2>
        <p className="text-sm text-text-secondary mt-1">Improve fitness + lose excess fat + learn boxing fundamentals</p>
      </div>

      {/* ── Baseline Snapshot ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={16} className="text-accent-cyan" />
          <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase">Baseline — Day 0</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { label: 'Weight', value: `${baseline.weight_kg}`, unit: 'kg' },
            { label: 'Body Fat', value: baseline.body_fat_pct, unit: '' },
            { label: 'Waist', value: `${baseline.waist_inches}`, unit: 'in' },
            { label: 'Push-ups', value: `${baseline.pushups}`, unit: '' },
            { label: 'Squats', value: `${baseline.squats}`, unit: '' },
            { label: 'Pull-ups', value: `${baseline.pullups}`, unit: '' },
            { label: 'Plank', value: baseline.plank, unit: '' },
            { label: 'Jump Rope', value: baseline.jump_rope, unit: '' },
            { label: 'Walking', value: baseline.walking, unit: '' },
            { label: 'Jogging', value: baseline.jogging, unit: '' },
            { label: 'Running', value: baseline.running, unit: '', warn: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`glass-card p-3 text-center ${stat.warn ? 'border-accent-gold/30' : ''}`}
            >
              <div className="text-[0.625rem] font-semibold text-text-muted tracking-wider uppercase mb-1">
                {stat.label}
              </div>
              <div className={`stat-number text-lg ${stat.warn ? 'text-accent-gold' : 'text-text-primary'}`}>
                {stat.value}
              </div>
              {stat.unit && (
                <div className="text-[0.5625rem] text-text-muted mt-0.5">{stat.unit}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`glass-card glass-card-hover p-4 flex flex-col items-center gap-2 text-center border ${action.color}`}
              >
                <Icon size={24} />
                <span className="text-xs font-semibold">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Training Background Note ── */}
      <div className="glass-card p-4">
        <p className="text-xs text-text-muted">
          <span className="font-semibold text-text-secondary">Background:</span>{' '}
          ~1 year gym experience · Previous badminton · Equipment: jump rope · Sleep: 6–7 hrs (2–3 AM → 10–11 AM) · Very flexible schedule
        </p>
      </div>
    </div>
  );
}
