import { Footprints, Plus, AlertTriangle, MapPin, Thermometer } from 'lucide-react';
import { useState } from 'react';
import type { PainLocation, RunSymptom, RunSurface } from '../types';

interface RunEntry {
  id: number;
  date: string;
  duration_minutes: number;
  distance_km: string;
  surface: RunSurface;
  footwear: string;
  pace: string;
  breathing_rpe: number;
  leg_fatigue_rpe: number;
  pain_score: number;
  pain_locations: PainLocation[];
  symptoms: RunSymptom[];
  coach_feel: string;
  coach_stopped: string;
  coach_unusual: string;
}

const PAIN_LOCATIONS: PainLocation[] = ['shin', 'knee', 'ankle', 'foot', 'hip', 'back'];
const SYMPTOMS: { value: RunSymptom; label: string }[] = [
  { value: 'breathlessness', label: 'Breathlessness' },
  { value: 'leg_fatigue', label: 'Leg fatigue' },
  { value: 'sharp_pain', label: 'Sharp pain' },
  { value: 'dull_ache', label: 'Dull ache' },
  { value: 'tightness', label: 'Tightness' },
  { value: 'dizziness', label: 'Dizziness' },
];
const SURFACES: RunSurface[] = ['tarmac', 'grass', 'track', 'treadmill', 'dirt'];

function RPESlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const color = value <= 3 ? 'text-status-success' : value <= 6 ? 'text-accent-gold' : 'text-accent-red';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="label mb-0">{label}</label>
        <span className={`stat-number text-sm ${color}`}>{value}/10</span>
      </div>
      <input
        type="range" min={1} max={10} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-accent-cyan"
      />
    </div>
  );
}

function detectPatterns(entries: RunEntry[]): string[] {
  if (entries.length < 3) return [];
  const patterns: string[] = [];
  const recent = entries.slice(0, 5);

  // Pain location patterns
  for (const loc of PAIN_LOCATIONS) {
    const count = recent.filter((e) => e.pain_locations.includes(loc)).length;
    if (count >= 2) {
      patterns.push(
        `${loc.charAt(0).toUpperCase() + loc.slice(1)} discomfort appeared in ${count} of your last ${recent.length} running attempts.`
      );
    }
  }

  // Symptom patterns
  for (const sym of SYMPTOMS) {
    const count = recent.filter((e) => e.symptoms.includes(sym.value)).length;
    if (count >= 3) {
      patterns.push(
        `${sym.label} was reported in ${count} of your last ${recent.length} attempts.`
      );
    }
  }

  // High RPE patterns
  const highBreathing = recent.filter((e) => e.breathing_rpe >= 8).length;
  if (highBreathing >= 3) {
    patterns.push(
      `Breathing difficulty (RPE ≥ 8) appeared in ${highBreathing} of your last ${recent.length} attempts.`
    );
  }

  return patterns;
}

export function RunFixPage() {
  const [entries, setEntries] = useState<RunEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    duration_minutes: '',
    distance_km: '',
    surface: 'tarmac' as RunSurface,
    footwear: '',
    pace: '',
    breathing_rpe: 5,
    leg_fatigue_rpe: 5,
    pain_score: 0,
    pain_locations: [] as PainLocation[],
    symptoms: [] as RunSymptom[],
    coach_feel: '',
    coach_stopped: '',
    coach_unusual: '',
  });

  const togglePain = (loc: PainLocation) => {
    setForm({
      ...form,
      pain_locations: form.pain_locations.includes(loc)
        ? form.pain_locations.filter((l) => l !== loc)
        : [...form.pain_locations, loc],
    });
  };

  const toggleSymptom = (sym: RunSymptom) => {
    setForm({
      ...form,
      symptoms: form.symptoms.includes(sym)
        ? form.symptoms.filter((s) => s !== sym)
        : [...form.symptoms, sym],
    });
  };

  const handleSubmit = () => {
    const entry: RunEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      duration_minutes: parseFloat(form.duration_minutes) || 0,
      distance_km: form.distance_km,
      surface: form.surface,
      footwear: form.footwear,
      pace: form.pace,
      breathing_rpe: form.breathing_rpe,
      leg_fatigue_rpe: form.leg_fatigue_rpe,
      pain_score: form.pain_score,
      pain_locations: form.pain_locations,
      symptoms: form.symptoms,
      coach_feel: form.coach_feel,
      coach_stopped: form.coach_stopped,
      coach_unusual: form.coach_unusual,
    };
    setEntries([entry, ...entries]);
    setShowForm(false);
    setForm({
      duration_minutes: '', distance_km: '', surface: 'tarmac',
      footwear: '', pace: '', breathing_rpe: 5, leg_fatigue_rpe: 5,
      pain_score: 0, pain_locations: [], symptoms: [],
      coach_feel: '', coach_stopped: '', coach_unusual: '',
    });
  };

  const patterns = detectPatterns(entries);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Footprints size={20} className="text-accent-gold" />
          <h2 className="text-lg font-bold">Run-Fix</h2>
          <span className="badge bg-accent-gold/15 text-accent-gold text-[0.5625rem]">INVESTIGATION</span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-sm">
          <Plus size={16} /> Log Attempt
        </button>
      </div>

      {/* Investigation Context */}
      <div className="glass-card p-4 border-l-4 border-l-accent-gold">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-accent-gold">Active question:</span>{' '}
          Why is running currently difficult? Log each running attempt to identify patterns through structured observation.
        </p>
      </div>

      {/* Pattern Alerts */}
      {patterns.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-accent-gold" />
            <span className="text-xs font-bold tracking-widest text-text-muted uppercase">Patterns Observed</span>
          </div>
          {patterns.map((p, i) => (
            <div key={i} className="glass-card p-3 border-l-2 border-l-accent-gold">
              <p className="text-sm text-text-secondary">{p}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Log Form ── */}
      {showForm && (
        <div className="glass-card p-5 space-y-5">
          <h3 className="text-sm font-bold text-text-primary">New Running Attempt</h3>

          {/* Basic fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration (min)</label>
              <input type="number" className="input" placeholder="e.g. 10"
                value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
            </div>
            <div>
              <label className="label">Distance (km)</label>
              <input type="text" className="input" placeholder="optional"
                value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} />
            </div>
            <div>
              <label className="label">Surface</label>
              <select className="input" value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value as RunSurface })}>
                {SURFACES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Footwear</label>
              <input type="text" className="input" placeholder="e.g. running shoes"
                value={form.footwear} onChange={(e) => setForm({ ...form, footwear: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Pace</label>
              <input type="text" className="input" placeholder="e.g. slow jog, brisk walk"
                value={form.pace} onChange={(e) => setForm({ ...form, pace: e.target.value })} />
            </div>
          </div>

          {/* RPE Sliders */}
          <RPESlider label="Breathing RPE" value={form.breathing_rpe} onChange={(v) => setForm({ ...form, breathing_rpe: v })} />
          <RPESlider label="Leg Fatigue RPE" value={form.leg_fatigue_rpe} onChange={(v) => setForm({ ...form, leg_fatigue_rpe: v })} />

          {/* Pain */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Pain Score</label>
              <span className={`stat-number text-sm ${form.pain_score === 0 ? 'text-status-success' : form.pain_score <= 3 ? 'text-accent-gold' : 'text-accent-red'}`}>
                {form.pain_score}/10
              </span>
            </div>
            <input type="range" min={0} max={10} value={form.pain_score}
              onChange={(e) => setForm({ ...form, pain_score: parseInt(e.target.value) })}
              className="w-full accent-accent-red" />
          </div>

          {/* Pain Locations */}
          <div>
            <label className="label flex items-center gap-1"><MapPin size={12} /> Pain Location</label>
            <div className="flex flex-wrap gap-2">
              {PAIN_LOCATIONS.map((loc) => (
                <button key={loc} onClick={() => togglePain(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.pain_locations.includes(loc)
                      ? 'bg-accent-red/20 text-accent-red border-accent-red/40'
                      : 'bg-bg-secondary text-text-muted border-border-default hover:border-border-active'
                  }`}>
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="label flex items-center gap-1"><Thermometer size={12} /> Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((sym) => (
                <button key={sym.value} onClick={() => toggleSymptom(sym.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.symptoms.includes(sym.value)
                      ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/40'
                      : 'bg-bg-secondary text-text-muted border-border-default hover:border-border-active'
                  }`}>
                  {sym.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coach Notes */}
          <div className="space-y-3">
            <div>
              <label className="label">How did this feel?</label>
              <textarea className="input resize-none h-16" placeholder="Describe the overall feeling..."
                value={form.coach_feel} onChange={(e) => setForm({ ...form, coach_feel: e.target.value })} />
            </div>
            <div>
              <label className="label">What stopped you?</label>
              <textarea className="input resize-none h-16" placeholder="What made you stop or slow down?"
                value={form.coach_stopped} onChange={(e) => setForm({ ...form, coach_stopped: e.target.value })} />
            </div>
            <div>
              <label className="label">Anything unusual?</label>
              <textarea className="input resize-none h-16" placeholder="Anything different this time?"
                value={form.coach_unusual} onChange={(e) => setForm({ ...form, coach_unusual: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn btn-primary flex-1">Save Attempt</button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Attempt History ── */}
      {entries.map((entry) => (
        <div key={entry.id} className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{entry.date}</span>
            <span className="text-xs text-text-muted">{entry.duration_minutes} min · {entry.surface}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-[0.5rem] text-text-muted uppercase font-semibold">Breathing</div>
              <div className="stat-number text-sm">{entry.breathing_rpe}/10</div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-[0.5rem] text-text-muted uppercase font-semibold">Fatigue</div>
              <div className="stat-number text-sm">{entry.leg_fatigue_rpe}/10</div>
            </div>
            <div className="bg-bg-secondary rounded-lg p-2 text-center">
              <div className="text-[0.5rem] text-text-muted uppercase font-semibold">Pain</div>
              <div className={`stat-number text-sm ${entry.pain_score > 3 ? 'text-accent-red' : 'text-text-primary'}`}>{entry.pain_score}/10</div>
            </div>
          </div>

          {entry.pain_locations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.pain_locations.map((loc) => (
                <span key={loc} className="badge bg-accent-red/10 text-accent-red text-[0.5625rem]">{loc}</span>
              ))}
            </div>
          )}

          {entry.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.symptoms.map((sym) => (
                <span key={sym} className="badge bg-accent-gold/10 text-accent-gold text-[0.5625rem]">{sym.replace('_', ' ')}</span>
              ))}
            </div>
          )}

          {entry.coach_feel && <p className="text-xs text-text-muted italic">"{entry.coach_feel}"</p>}
        </div>
      ))}

      {entries.length === 0 && !showForm && (
        <div className="text-center py-12 text-text-muted">
          <Footprints size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No running attempts logged yet.</p>
          <p className="text-xs mt-1">Start logging to build your observation data.</p>
        </div>
      )}
    </div>
  );
}
