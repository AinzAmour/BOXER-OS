import {
  Footprints,
  Swords,
  Timer,
  AlertTriangle,
  ChevronRight,
  Dumbbell,
  Target,
  Zap,
  CheckCircle2,
  Circle,
  Network,
  Bot,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import type { TabId, Quest } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: TabId) => void;
}

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

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  // Live Dexie query for quests & profile
  const quests = useLiveQuery(async () => await db.quests.toArray(), []) || [];
  const profile = useLiveQuery(async () => await db.profiles.get('profile_default'), []);

  const toggleQuest = async (id: string, isCompleted: boolean) => {
    const now = new Date().toISOString();
    await db.quests.update(id, {
      is_completed: !isCompleted,
      completed_at: !isCompleted ? now : null,
      updated_at: now,
    });

    if (!isCompleted && profile) {
      const q = quests.find((item: Quest) => item.id === id);
      const gainedXp = q ? q.xp_reward : 50;
      const newXp = (profile.xp || 0) + gainedXp;
      const newLevel = Math.floor(newXp / 500) + 1;
      await db.profiles.update('profile_default', {
        xp: newXp,
        level: newLevel,
        updated_at: now,
      });
    }
  };

  const level = profile?.level || 1;
  const xp = profile?.xp || 150;
  const xpNext = level * 500;
  const xpProgress = Math.min(100, Math.round(((xp % 500) / 500) * 100));

  return (
    <div className="space-y-6">
      {/* ── Solo-Leveling Command Center Banner ── */}
      <div className="glass-card p-6 border-l-4 border-l-accent-cyan relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge bg-accent-gold/15 text-accent-gold text-[0.625rem] font-mono">
                FIGHTER RANK: LEVEL {level}
              </span>
              <span className="text-xs text-text-muted font-mono">{profile?.name || 'Mohammed Habibur Rahman'}</span>
            </div>
            <h2 className="text-xl font-black text-text-primary tracking-tight">
              LIFE<span className="text-accent-red">//</span>OS COMMAND CENTER
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Personal Development & Skill Mastery Operating System
            </p>
          </div>

          <button
            onClick={() => onNavigate('skills')}
            className="btn btn-primary text-xs flex items-center gap-2 self-start sm:self-center"
          >
            <Network size={14} /> Open Skill Graph
          </button>
        </div>

        {/* XP Bar */}
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span className="flex items-center gap-1"><Zap size={12} className="text-accent-gold" /> Experience</span>
            <span className="stat-number text-accent-gold">{xp} / {xpNext} XP</span>
          </div>
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent-gold rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Domain Status Cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <div onClick={() => onNavigate('skills')} className="glass-card glass-card-hover p-4 text-center cursor-pointer">
          <div className="text-[0.625rem] font-bold text-text-muted tracking-widest uppercase mb-1">BODY</div>
          <div className="stat-number text-xl text-accent-red">LVL {level}</div>
          <div className="text-[0.5625rem] text-text-muted mt-0.5">Boxing · Fitness · Run</div>
        </div>
        <div onClick={() => onNavigate('skills')} className="glass-card glass-card-hover p-4 text-center cursor-pointer">
          <div className="text-[0.625rem] font-bold text-text-muted tracking-widest uppercase mb-1">MIND</div>
          <div className="stat-number text-xl text-accent-purple">LVL {level}</div>
          <div className="text-[0.5625rem] text-text-muted mt-0.5">Study · Focus · Reading</div>
        </div>
        <div onClick={() => onNavigate('skills')} className="glass-card glass-card-hover p-4 text-center cursor-pointer">
          <div className="text-[0.625rem] font-bold text-text-muted tracking-widest uppercase mb-1">TECH</div>
          <div className="stat-number text-xl text-accent-cyan">LVL {level}</div>
          <div className="text-[0.5625rem] text-text-muted mt-0.5">Cyber · Linux · Web</div>
        </div>
      </div>

      {/* ── Daily Missions / Quests ── */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-accent-gold" />
            <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase">Today's Missions</h3>
          </div>
          <span className="text-xs text-text-muted font-mono">
            {quests.filter((q: Quest) => q.is_completed).length}/{quests.length} Done
          </span>
        </div>

        <div className="space-y-2">
          {quests.map((quest: Quest) => (
            <div
              key={quest.id}
              onClick={() => toggleQuest(quest.id, quest.is_completed)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                quest.is_completed
                  ? 'bg-status-success/10 border-status-success/30 text-text-muted'
                  : 'bg-bg-secondary border-border-default hover:border-border-active text-text-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                {quest.is_completed
                  ? <CheckCircle2 size={18} className="text-status-success flex-shrink-0" />
                  : <Circle size={18} className="text-text-muted flex-shrink-0" />
                }
                <div>
                  <div className={`text-xs font-semibold ${quest.is_completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {quest.title}
                  </div>
                  <div className="text-[0.5625rem] text-text-muted font-mono uppercase mt-0.5">
                    {quest.domain} · +{quest.xp_reward} XP
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Run-Fix Alert ── */}
      <div className="glass-card p-4 border-l-4 border-l-accent-gold flex items-start gap-3">
        <AlertTriangle size={20} className="text-accent-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-accent-gold">Run-Fix Active Investigation</p>
          <p className="text-xs text-text-secondary mt-1">
            Why is running currently difficult? Log running attempts to identify patterns.
          </p>
        </div>
        <button onClick={() => onNavigate('runfix')} className="btn-ghost text-accent-gold text-xs flex items-center gap-1">
          Open <ChevronRight size={14} />
        </button>
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
            <div key={stat.label} className={`glass-card p-3 text-center ${stat.warn ? 'border-accent-gold/30' : ''}`}>
              <div className="text-[0.625rem] font-semibold text-text-muted tracking-wider uppercase mb-1">{stat.label}</div>
              <div className={`stat-number text-lg ${stat.warn ? 'text-accent-gold' : 'text-text-primary'}`}>{stat.value}</div>
              {stat.unit && <div className="text-[0.5625rem] text-text-muted mt-0.5">{stat.unit}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Launcher Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => onNavigate('boxing')} className="glass-card glass-card-hover p-4 flex flex-col items-center gap-2 border border-accent-red/20 text-accent-red">
          <Swords size={20} /> <span className="text-xs font-semibold">Boxing Engine</span>
        </button>
        <button onClick={() => onNavigate('timer')} className="glass-card glass-card-hover p-4 flex flex-col items-center gap-2 border border-accent-teal/20 text-accent-teal">
          <Timer size={20} /> <span className="text-xs font-semibold">Round Timer</span>
        </button>
        <button onClick={() => onNavigate('runfix')} className="glass-card glass-card-hover p-4 flex flex-col items-center gap-2 border border-accent-gold/20 text-accent-gold">
          <Footprints size={20} /> <span className="text-xs font-semibold">Run-Fix</span>
        </button>
        <button onClick={() => onNavigate('ai_coach')} className="glass-card glass-card-hover p-4 flex flex-col items-center gap-2 border border-accent-purple/20 text-accent-purple">
          <Bot size={20} /> <span className="text-xs font-semibold">AI Mentor</span>
        </button>
      </div>
    </div>
  );
}
