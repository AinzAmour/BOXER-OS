import { TrendingUp, Lock, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface Phase {
  number: number;
  name: string;
  subtitle: string;
  status: 'active' | 'locked' | 'completed';
  criteria: { label: string; met: boolean }[];
}

const PHASES: Phase[] = [
  {
    number: 1,
    name: 'Beginner Fitness',
    subtitle: 'Improve fitness + lose excess fat + learn boxing fundamentals',
    status: 'active',
    criteria: [
      { label: 'Complete 20 consecutive push-ups', met: false },
      { label: 'Complete 30 consecutive squats', met: false },
      { label: 'Complete 8 pull-ups', met: false },
      { label: 'Hold plank for 2 minutes', met: false },
      { label: 'Jump rope 3 minutes continuous', met: false },
      { label: 'Jog 20 minutes without stopping', met: false },
      { label: 'Reach <25% estimated body fat', met: false },
      { label: 'Know all 6 punches + slip + roll', met: false },
      { label: 'Complete 10 shadowboxing sessions', met: false },
      { label: 'Log 5 Run-Fix attempts', met: false },
    ],
  },
  {
    number: 2,
    name: 'Recreational Boxer',
    subtitle: 'Competent recreational boxing with solid conditioning',
    status: 'locked',
    criteria: [
      { label: 'Complete 30 consecutive push-ups', met: false },
      { label: 'Complete 10 pull-ups', met: false },
      { label: 'Run 5 km continuously', met: false },
      { label: 'Jump rope 5 minutes continuous', met: false },
      { label: 'Complete 6 rounds shadowboxing (3 min each)', met: false },
      { label: 'Reach <20% estimated body fat', met: false },
      { label: 'Join a boxing gym or class', met: false },
      { label: 'Competent proficiency in all 6 punches', met: false },
      { label: 'Complete 30 total boxing sessions', met: false },
      { label: 'Demonstrate fluid 4-punch combinations', met: false },
    ],
  },
  {
    number: 3,
    name: 'Serious Training',
    subtitle: 'Serious boxing conditioning, technique, defense, movement and fight IQ',
    status: 'locked',
    criteria: [
      { label: 'Complete 50 push-ups', met: false },
      { label: 'Run 10 km', met: false },
      { label: 'Jump rope 10 minutes continuous', met: false },
      { label: 'Complete 12 rounds shadowboxing', met: false },
      { label: 'Reach <15% body fat', met: false },
      { label: 'Consistent gym attendance (3+ months)', met: false },
      { label: 'Coach-approved defensive fundamentals', met: false },
      { label: 'Controlled sparring experience', met: false },
      { label: 'Demonstrate fight IQ in drills', met: false },
    ],
  },
  {
    number: 4,
    name: 'Long-Term — "D" Goal',
    subtitle: 'Your ultimate destination',
    status: 'locked',
    criteria: [
      { label: 'Define your "D" goal', met: false },
    ],
  },
];

export function ProgressionPage() {
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
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-status-success" />
        <h2 className="text-lg font-bold">Phase Roadmap</h2>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-border-subtle" />

        {PHASES.map((phase, index) => {
          const badge = statusBadges[phase.status];
          const metCount = phase.criteria.filter((c) => c.met).length;
          const totalCount = phase.criteria.length;

          return (
            <div key={phase.number} className="relative">
              {/* Timeline dot */}
              <div className={`absolute left-3.5 top-6 w-3.5 h-3.5 rounded-full border-2 z-10 ${
                phase.status === 'active' ? 'bg-accent-cyan border-accent-cyan animate-pulse-glow'
                : phase.status === 'completed' ? 'bg-status-success border-status-success'
                : 'bg-bg-primary border-border-default'
              }`} />

              {/* Card */}
              <div className={`ml-12 glass-card p-5 border-l-4 ${statusColors[phase.status]}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-text-muted tracking-widest">PHASE {phase.number}</span>
                      <span className={`badge ${badge.bg} ${badge.text} text-[0.5625rem]`}>
                        {phase.status === 'locked' && <Lock size={8} className="mr-0.5" />}
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary">{phase.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{phase.subtitle}</p>
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
                        phase.status === 'active' ? 'bg-accent-cyan' : phase.status === 'completed' ? 'bg-status-success' : 'bg-border-default'
                      }`}
                      style={{ width: `${(metCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Criteria checklist */}
                <div className="space-y-1.5 mt-3">
                  {phase.criteria.map((criterion, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {criterion.met
                        ? <CheckCircle2 size={14} className="text-status-success flex-shrink-0" />
                        : <Circle size={14} className="text-text-muted flex-shrink-0" />
                      }
                      <span className={`text-xs ${criterion.met ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {criterion.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow between phases */}
              {index < PHASES.length - 1 && (
                <div className="absolute left-[1.05rem] -bottom-1 text-text-muted">
                  <ChevronRight size={12} className="rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
