import { TrendingUp, Lock, CheckCircle2, Circle, ChevronRight, Bot } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import type { PhaseProgress } from '../types';

export function ProgressionPage() {
  const phaseRecords = useLiveQuery(async () => await db.phase_progress.toArray(), []) || [];

  const statusColors = {
    active: 'border-accent-cyan',
    locked: 'border-border-subtle',
    completed: 'border-status-success',
  };

  const statusBadges = {
    active: { bg: 'bg-accent-cyan/15', text: 'text-accent-cyan', label: 'ACTIVE' },
    locked: { bg: 'bg-bg-secondary', text: 'text-text-muted', label: 'LOCKED' },
    completed: { bg: 'bg-status-success/15', text: 'text-status-success', label: 'COMPLETE' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-status-success" />
          <h2 className="text-lg font-bold">Phase Roadmap</h2>
        </div>
        <span className="text-xs text-text-muted font-mono">{phaseRecords.length} Phases Configured</span>
      </div>

      {phaseRecords.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-3">
          <Bot size={32} className="mx-auto text-accent-cyan animate-pulse" />
          <h3 className="text-sm font-bold text-text-primary">No Phase Roadmap Generated Yet</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Ciel AI generates your personalized phase roadmap during onboarding or weekly reviews.
          </p>
        </div>
      ) : (
        /* Timeline */
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-border-subtle" />

          {phaseRecords.map((phase: PhaseProgress, index: number) => {
            const status = phase.status || 'locked';
            const badge = statusBadges[status];
            const criteriaObj = phase.criteria || {};
            const criteriaList = Object.entries(criteriaObj).map(([key, val]) => ({
              label: key.replace(/_/g, ' '),
              met: Boolean(val),
            }));
            const metCount = criteriaList.filter((c) => c.met).length;
            const totalCount = Math.max(criteriaList.length, 1);

            return (
              <div key={phase.id || phase.phase_number} className="relative">
                {/* Timeline dot */}
                <div className={`absolute left-3.5 top-6 w-3.5 h-3.5 rounded-full border-2 z-10 ${
                  status === 'active' ? 'bg-accent-cyan border-accent-cyan animate-pulse-glow'
                  : status === 'completed' ? 'bg-status-success border-status-success'
                  : 'bg-bg-primary border-border-default'
                }`} />

                {/* Card */}
                <div className={`ml-12 glass-card p-5 border-l-4 ${statusColors[status]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-text-muted tracking-widest">PHASE {phase.phase_number}</span>
                        <span className={`badge ${badge.bg} ${badge.text} text-[0.5625rem]`}>
                          {status === 'locked' && <Lock size={8} className="mr-0.5" />}
                          {badge.label}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-text-primary">{phase.phase_name}</h3>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 mb-2">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                      <span>Readiness</span>
                      <span className="stat-number">{metCount}/{totalCount}</span>
                    </div>
                    <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          status === 'active' ? 'bg-accent-cyan' : status === 'completed' ? 'bg-status-success' : 'bg-border-default'
                        }`}
                        style={{ width: `${(metCount / totalCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Criteria checklist */}
                  {criteriaList.length > 0 && (
                    <div className="space-y-1.5 mt-3">
                      {criteriaList.map((criterion, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {criterion.met
                            ? <CheckCircle2 size={14} className="text-status-success flex-shrink-0" />
                            : <Circle size={14} className="text-text-muted flex-shrink-0" />
                          }
                          <span className={`text-xs capitalize ${criterion.met ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {criterion.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow between phases */}
                {index < phaseRecords.length - 1 && (
                  <div className="absolute left-[1.05rem] -bottom-1 text-text-muted">
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
