import { Network, ChevronRight, BookOpen, Wrench, Zap } from 'lucide-react';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import type { DomainType, SkillState, SkillNode } from '../types';

function stateBadge(state: SkillState) {
  const configs: Record<SkillState, { bg: string; text: string; label: string }> = {
    unknown:    { bg: 'bg-text-muted/15',      text: 'text-text-muted',    label: 'UNKNOWN' },
    discovered: { bg: 'bg-accent-purple/15',   text: 'text-accent-purple', label: 'DISCOVERED' },
    training:   { bg: 'bg-accent-gold/15',     text: 'text-accent-gold',   label: 'TRAINING' },
    practicing: { bg: 'bg-accent-cyan/15',     text: 'text-accent-cyan',   label: 'PRACTICING' },
    proficient: { bg: 'bg-status-info/15',     text: 'text-status-info',   label: 'PROFICIENT' },
    mastered:   { bg: 'bg-status-success/15',  text: 'text-status-success',label: 'MASTERED' },
    advanced:   { bg: 'bg-accent-red/15',      text: 'text-accent-red',    label: 'ADVANCED' },
  };
  const c = configs[state] || configs.unknown;
  return <span className={`badge ${c.bg} ${c.text} text-[0.5625rem]`}>{c.label}</span>;
}

export function SkillGraphPage() {
  const [selectedDomain, setSelectedDomain] = useState<'all' | DomainType>('all');
  const [selectedState, setSelectedState] = useState<'all' | SkillState>('all');
  const [editingSkill, setEditingSkill] = useState<SkillNode | null>(null);

  // Live Dexie query
  const skills = useLiveQuery(async () => await db.skills.toArray(), []) || [];

  const filteredSkills = skills.filter((s: SkillNode) => {
    if (selectedDomain !== 'all' && s.domain !== selectedDomain) return false;
    if (selectedState !== 'all' && s.state !== selectedState) return false;
    return true;
  });

  const handleUpdateSkill = async (updated: SkillNode) => {
    const now = new Date().toISOString();
    await db.skills.put({
      ...updated,
      updated_at: now,
    });
    setEditingSkill(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={20} className="text-accent-cyan" />
          <h2 className="text-lg font-bold">Personal Skill Graph</h2>
          <span className="badge bg-accent-cyan/15 text-accent-cyan text-[0.5625rem]">LIFE//OS</span>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Domains' },
          { id: 'body', label: '💪 Body' },
          { id: 'mind', label: '🧠 Mind' },
          { id: 'tech', label: '💻 Tech' },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDomain(d.id as 'all' | DomainType)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDomain === d.id
                ? 'bg-bg-card text-accent-cyan border border-border-active shadow-md'
                : 'bg-bg-secondary text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* State Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {(['all', 'training', 'practicing', 'proficient', 'mastered', 'unknown'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            className={`px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold tracking-wider uppercase border transition-all ${
              selectedState === st
                ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/40'
                : 'bg-bg-secondary text-text-muted border-border-default hover:border-border-active'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* ── Skill Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredSkills.map((skill: SkillNode) => (
          <div
            key={skill.id}
            onClick={() => setEditingSkill(skill)}
            className="glass-card glass-card-hover p-5 space-y-4 cursor-pointer relative"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.625rem] font-bold tracking-widest text-text-muted uppercase">
                    {skill.domain.toUpperCase()} · {skill.category.toUpperCase()}
                  </span>
                  {stateBadge(skill.state)}
                </div>
                <h3 className="text-base font-bold text-text-primary">{skill.name}</h3>
              </div>
              <ChevronRight size={18} className="text-text-muted mt-1" />
            </div>

            {/* Metrics */}
            <div className="space-y-2 pt-1 border-t border-border-subtle">
              {/* Knowledge */}
              <div>
                <div className="flex justify-between text-[0.6875rem] text-text-secondary mb-1">
                  <span className="flex items-center gap-1"><BookOpen size={10} /> Knowledge</span>
                  <span className="stat-number">{skill.knowledge_pct}%</span>
                </div>
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent-purple rounded-full" style={{ width: `${skill.knowledge_pct}%` }} />
                </div>
              </div>

              {/* Ability/Practical */}
              <div>
                <div className="flex justify-between text-[0.6875rem] text-text-secondary mb-1">
                  <span className="flex items-center gap-1"><Wrench size={10} /> Practical Ability</span>
                  <span className="stat-number">{skill.practical_pct}%</span>
                </div>
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${skill.practical_pct}%` }} />
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex justify-between text-[0.6875rem] text-text-secondary mb-1">
                  <span className="flex items-center gap-1"><Zap size={10} /> Experience</span>
                  <span className="stat-number">{skill.experience_pct}%</span>
                </div>
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent-gold rounded-full" style={{ width: `${skill.experience_pct}%` }} />
                </div>
              </div>
            </div>

            {skill.notes && (
              <p className="text-xs text-text-muted italic truncate">"{skill.notes}"</p>
            )}
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Network size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No skills found in this domain or state filter.</p>
        </div>
      )}

      {/* ── Edit Skill Modal ── */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border border-border-default">
            <h3 className="text-base font-bold text-text-primary">{editingSkill.name}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="label">State</label>
                <select
                  value={editingSkill.state}
                  onChange={(e) => setEditingSkill({ ...editingSkill, state: e.target.value as SkillState })}
                  className="input"
                >
                  <option value="unknown">Unknown</option>
                  <option value="discovered">Discovered</option>
                  <option value="training">Training</option>
                  <option value="practicing">Practicing</option>
                  <option value="proficient">Proficient</option>
                  <option value="mastered">Mastered</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="label mb-0">Knowledge ({editingSkill.knowledge_pct}%)</label>
                </div>
                <input
                  type="range" min={0} max={100} value={editingSkill.knowledge_pct}
                  onChange={(e) => setEditingSkill({ ...editingSkill, knowledge_pct: parseInt(e.target.value) })}
                  className="w-full accent-accent-purple"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="label mb-0">Practical Ability ({editingSkill.practical_pct}%)</label>
                </div>
                <input
                  type="range" min={0} max={100} value={editingSkill.practical_pct}
                  onChange={(e) => setEditingSkill({ ...editingSkill, practical_pct: parseInt(e.target.value) })}
                  className="w-full accent-accent-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="label mb-0">Experience ({editingSkill.experience_pct}%)</label>
                </div>
                <input
                  type="range" min={0} max={100} value={editingSkill.experience_pct}
                  onChange={(e) => setEditingSkill({ ...editingSkill, experience_pct: parseInt(e.target.value) })}
                  className="w-full accent-accent-gold"
                />
              </div>

              <div>
                <label className="label">Notes & Observations</label>
                <textarea
                  value={editingSkill.notes}
                  onChange={(e) => setEditingSkill({ ...editingSkill, notes: e.target.value })}
                  className="input resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleUpdateSkill(editingSkill)} className="btn btn-primary flex-1">Save Progress</button>
              <button onClick={() => setEditingSkill(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
