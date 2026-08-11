import { Swords, Shuffle, BookOpen, Zap } from 'lucide-react';
import { useState, useCallback } from 'react';

// ── Punch System ──
const PUNCHES: Record<string, string> = {
  '1': 'Jab',
  '2': 'Cross',
  '3': 'Lead Hook',
  '4': 'Rear Hook',
  '5': 'Lead Uppercut',
  '6': 'Rear Uppercut',
};

const DEFENSE: Record<string, string> = {
  'Slip L': 'Slip Left',
  'Slip R': 'Slip Right',
  'Roll': 'Roll Under',
  'Pull': 'Pull Back',
};

const FUNDAMENTALS = [
  { name: 'Orthodox Stance', desc: 'Left foot forward, right foot back at ~45°. Weight 50/50. Hands up, chin tucked.' },
  { name: 'Guard', desc: 'Hands high, elbows in, chin behind lead shoulder. Eyes through the gloves.' },
  { name: 'Footwork', desc: 'Push off rear foot to move forward, lead foot to move back. Never cross feet. Small steps.' },
  { name: '1 — Jab', desc: 'Straight left hand. Extend from guard, rotate fist, snap back. Your most important punch.' },
  { name: '2 — Cross', desc: 'Straight right hand. Rotate hips and rear foot. Full body rotation. Power punch.' },
  { name: '3 — Lead Hook', desc: 'Left hook. Pivot on lead foot, elbow at 90°, rotate torso. Short to mid range.' },
  { name: '4 — Rear Hook', desc: 'Right hook. Similar mechanics, opposite side. Less common but powerful.' },
  { name: '5 — Lead Uppercut', desc: 'Left uppercut. Drop slightly, drive up from legs. Close range.' },
  { name: '6 — Rear Uppercut', desc: 'Right uppercut. Rotate hips, drive upward. Inside fighting weapon.' },
  { name: 'Slip', desc: 'Small lateral head movement to avoid straight punches. Bend at waist, not legs.' },
  { name: 'Roll / Weave', desc: 'U-shaped ducking motion under hooks. Go down, under, and up on the other side.' },
];

// ── Combo Templates ──
const COMBO_TEMPLATES = [
  ['1', '2'],
  ['1', '1', '2'],
  ['1', '2', '3'],
  ['1', '2', '1', '2'],
  ['1', '2', '3', '2'],
  ['1', '2', 'Slip L', '2'],
  ['1', '2', '5', '2'],
  ['1', '2', '3', '6', '2'],
  ['Slip R', '2', '3'],
  ['1', 'Slip L', '2', '3'],
  ['1', '2', 'Roll', '3', '2'],
  ['1', '6', '3', '2'],
];

export function BoxingPage() {
  const [activeTab, setActiveTab] = useState<'guide' | 'combos' | 'generator'>('guide');
  const [currentCombo, setCurrentCombo] = useState<string[]>([]);
  const [comboHistory, setComboHistory] = useState<string[][]>([]);

  const generateCombo = useCallback(() => {
    const template = COMBO_TEMPLATES[Math.floor(Math.random() * COMBO_TEMPLATES.length)];
    setCurrentCombo(template);
    setComboHistory((prev) => [template, ...prev.slice(0, 9)]);
  }, []);

  const tabs = [
    { id: 'guide' as const, icon: BookOpen, label: 'Skill Guide' },
    { id: 'combos' as const, icon: Zap, label: 'Combos' },
    { id: 'generator' as const, icon: Shuffle, label: 'Generator' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Swords size={20} className="text-accent-red" />
        <h2 className="text-lg font-bold">Boxing Engine</h2>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-bg-card text-accent-red border border-border-active'
                  : 'text-text-muted hover:text-text-secondary border border-transparent'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Skill Guide ── */}
      {activeTab === 'guide' && (
        <div className="space-y-2">
          {FUNDAMENTALS.map((skill) => (
            <div key={skill.name} className="glass-card glass-card-hover p-4">
              <h4 className="text-sm font-bold text-text-primary mb-1">{skill.name}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{skill.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Combo Library ── */}
      {activeTab === 'combos' && (
        <div className="space-y-2">
          {COMBO_TEMPLATES.map((combo, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-2 flex-wrap">
              {combo.map((move, j) => {
                const isDefense = move in DEFENSE;
                return (
                  <span key={j} className="flex items-center gap-1.5">
                    {j > 0 && <span className="text-text-muted text-xs">→</span>}
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      isDefense
                        ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20'
                        : 'bg-accent-red/15 text-accent-red border border-accent-red/20'
                    }`}>
                      {move in PUNCHES ? `${move} ${PUNCHES[move]}` : move in DEFENSE ? DEFENSE[move] : move}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Combo Generator ── */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          {/* Current combo display */}
          <div className="glass-card p-8 text-center">
            {currentCombo.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {currentCombo.map((move, i) => {
                    const isDefense = move in DEFENSE;
                    return (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <span className="text-text-muted text-xl">→</span>}
                        <span className={`px-4 py-2.5 rounded-xl text-base font-bold ${
                          isDefense
                            ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 glow-cyan'
                            : 'bg-accent-red/20 text-accent-red border border-accent-red/30 glow-red'
                        }`}>
                          {move in PUNCHES ? `${move} ${PUNCHES[move]}` : move in DEFENSE ? DEFENSE[move] : move}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-text-muted">Throw this combo during shadowboxing</p>
              </div>
            ) : (
              <div>
                <Shuffle size={40} className="mx-auto text-text-muted/30 mb-3" />
                <p className="text-sm text-text-muted">Hit Generate to get a random combination</p>
              </div>
            )}
          </div>

          <button onClick={generateCombo} className="btn btn-primary w-full py-4 text-base">
            <Shuffle size={20} />
            Generate Combo
          </button>

          {/* History */}
          {comboHistory.length > 1 && (
            <div>
              <h4 className="text-xs font-bold text-text-muted tracking-widest uppercase mb-2">Previous</h4>
              <div className="space-y-1.5">
                {comboHistory.slice(1).map((combo, i) => (
                  <div key={i} className="flex items-center gap-1.5 py-1.5 px-3 bg-bg-secondary rounded-lg">
                    {combo.map((move, j) => (
                      <span key={j} className="flex items-center gap-1">
                        {j > 0 && <span className="text-text-muted text-[0.625rem]">→</span>}
                        <span className="text-xs text-text-secondary font-mono">
                          {move in PUNCHES ? move : move.replace(' ', '')}
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
