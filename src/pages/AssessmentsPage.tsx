import { Activity, Lock, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/dexie';
import type { Assessment } from '../types';

function DiffBadge({ baseline, current }: { baseline: number; current: number }) {
  const diff = current - baseline;
  if (diff === 0) return <Minus size={12} className="text-text-muted" />;
  if (diff > 0) return <span className="flex items-center gap-0.5 text-status-success text-[0.625rem] font-mono font-bold"><TrendingUp size={10} />+{diff}</span>;
  return <span className="flex items-center gap-0.5 text-accent-red text-[0.625rem] font-mono font-bold"><TrendingDown size={10} />{diff}</span>;
}

export function AssessmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    weight_kg: '',
    body_fat_pct: '',
    waist_inches: '',
    pushups: '',
    squats: '',
    pullups: '',
    plank_seconds: '',
    jump_rope_seconds: '',
    walking_minutes: '',
    jogging_minutes: '',
    running_status: 'limited',
    running_notes: '',
    coach_notes: '',
  });

  // Live Dexie query for all assessments
  const allAssessments = useLiveQuery(async () => await db.assessments.toArray(), []) || [];
  const baseline = allAssessments.find((a: Assessment) => a.is_baseline || a.entry_number === 0);
  const retests = allAssessments.filter((a: Assessment) => !a.is_baseline && a.entry_number > 0);

  const userId = baseline?.user_id || 'local_user';
  const baseWeight = baseline?.weight_kg || 70;
  const baseWaist = baseline?.waist_inches || 32;

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    const entryId = `retest_${Date.now()}`;
    const newEntry: Assessment = {
      id: entryId,
      user_id: userId,
      entry_number: retests.length + 1,
      is_baseline: false,
      weight_kg: parseFloat(form.weight_kg) || baseWeight,
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      waist_inches: parseFloat(form.waist_inches) || baseWaist,
      pushups: parseInt(form.pushups) || 0,
      squats: parseInt(form.squats) || 0,
      pullups: parseInt(form.pullups) || 0,
      plank_seconds: parseInt(form.plank_seconds) || 0,
      jump_rope_seconds: parseInt(form.jump_rope_seconds) || 0,
      walking_minutes: parseFloat(form.walking_minutes) || 0,
      jogging_minutes: parseFloat(form.jogging_minutes) || 0,
      running_status: form.running_status as 'unable' | 'limited' | 'progressing' | 'normal',
      running_notes: form.running_notes,
      coach_notes: form.coach_notes,
      created_at: now,
      updated_at: now,
      device_id: localStorage.getItem('boxer_os_device_id') || 'dev_local',
      deleted_at: null,
      sync_version: 1,
    };

    await db.assessments.put(newEntry);

    // Queue change for cloud sync
    await db.sync_queue.add({
      table_name: 'assessments',
      operation: 'INSERT',
      record_id: entryId,
      payload: newEntry as unknown as Record<string, unknown>,
      created_at: now,
    });

    setShowForm(false);
    setForm({
      weight_kg: '', body_fat_pct: '', waist_inches: '',
      pushups: '', squats: '', pullups: '',
      plank_seconds: '', jump_rope_seconds: '',
      walking_minutes: '', jogging_minutes: '',
      running_status: 'limited', running_notes: '', coach_notes: '',
    });
  };

  const renderMetricRow = (label: string, baselineVal: number, unit: string, fieldKey: string, placeholder: string) => (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <span className="text-xs text-text-secondary font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="stat-number text-xs text-text-muted">{baselineVal}{unit}</span>
        <input
          type="number"
          placeholder={placeholder}
          value={(form as Record<string, string>)[fieldKey]}
          onChange={(e) => setForm({ ...form, [fieldKey]: e.target.value })}
          className="input w-24 text-right text-sm py-1.5 px-2"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-accent-cyan" />
          <h2 className="text-lg font-bold">Assessments & Retests</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-sm cursor-pointer">
          <Plus size={16} /> New Retest
        </button>
      </div>

      {/* ── Baseline Entry #0 (From Live Dexie Database) ── */}
      {baseline ? (
        <div className="glass-card p-5 border-l-4 border-l-accent-cyan">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-accent-cyan" />
            <span className="text-xs font-bold tracking-widest text-accent-cyan uppercase">Entry #0 — Baseline Assessment</span>
            <span className="text-xs text-text-muted ml-auto">{baseline.created_at.split('T')[0]}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { label: 'Weight', value: `${baseline.weight_kg} kg` },
              { label: 'Body Fat', value: baseline.body_fat_pct ? `~${baseline.body_fat_pct}%` : 'N/A' },
              { label: 'Waist', value: `${baseline.waist_inches}"` },
              { label: 'Push-ups', value: `${baseline.pushups}` },
              { label: 'Squats', value: `${baseline.squats}` },
              { label: 'Pull-ups', value: `${baseline.pullups}` },
              { label: 'Plank', value: `${baseline.plank_seconds}s` },
              { label: 'Rope', value: `${baseline.jump_rope_seconds}s` },
              { label: 'Walk', value: `${baseline.walking_minutes}m` },
              { label: 'Jog', value: `${baseline.jogging_minutes}m` },
              { label: 'Running', value: baseline.running_status, warn: baseline.running_status === 'unable' },
            ].map((s) => (
              <div key={s.label} className={`bg-bg-secondary rounded-lg p-2 text-center ${'warn' in s && s.warn ? 'border border-accent-gold/30' : ''}`}>
                <div className="text-[0.5625rem] text-text-muted font-semibold tracking-wider uppercase">{s.label}</div>
                <div className={`stat-number text-sm mt-0.5 ${'warn' in s && s.warn ? 'text-accent-gold' : 'text-text-primary'}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {baseline.coach_notes && (
            <p className="text-xs text-text-muted mt-3 italic">"{baseline.coach_notes}"</p>
          )}
        </div>
      ) : (
        <div className="glass-card p-5 border-l-4 border-l-accent-gold text-xs text-text-muted text-center">
          No baseline assessment recorded yet. Baseline data will be generated when you complete Ciel AI Onboarding.
        </div>
      )}

      {/* ── New Retest Form ── */}
      {showForm && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4">Retest #{retests.length + 1}</h3>

          <div className="space-y-0">
            {renderMetricRow('Weight (kg)', baseline?.weight_kg || 70, 'kg', 'weight_kg', String(baseline?.weight_kg || 70))}
            {renderMetricRow('Body Fat (%)', baseline?.body_fat_pct || 20, '%', 'body_fat_pct', String(baseline?.body_fat_pct || 20))}
            {renderMetricRow('Waist (in)', baseline?.waist_inches || 32, '"', 'waist_inches', String(baseline?.waist_inches || 32))}
            {renderMetricRow('Push-ups', baseline?.pushups || 10, '', 'pushups', String(baseline?.pushups || 10))}
            {renderMetricRow('Squats', baseline?.squats || 15, '', 'squats', String(baseline?.squats || 15))}
            {renderMetricRow('Pull-ups', baseline?.pullups || 0, '', 'pullups', String(baseline?.pullups || 0))}
            {renderMetricRow('Plank (sec)', baseline?.plank_seconds || 30, 's', 'plank_seconds', String(baseline?.plank_seconds || 30))}
            {renderMetricRow('Jump Rope (sec)', baseline?.jump_rope_seconds || 30, 's', 'jump_rope_seconds', String(baseline?.jump_rope_seconds || 30))}
            {renderMetricRow('Walking (min)', baseline?.walking_minutes || 15, 'm', 'walking_minutes', String(baseline?.walking_minutes || 15))}
            {renderMetricRow('Jogging (min)', baseline?.jogging_minutes || 0, 'm', 'jogging_minutes', String(baseline?.jogging_minutes || 0))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Running Status</label>
              <select
                value={form.running_status}
                onChange={(e) => setForm({ ...form, running_status: e.target.value })}
                className="input"
              >
                <option value="unable">Unable</option>
                <option value="limited">Limited</option>
                <option value="progressing">Progressing</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="label">Running Notes</label>
              <textarea
                value={form.running_notes}
                onChange={(e) => setForm({ ...form, running_notes: e.target.value })}
                className="input resize-none h-16"
                placeholder="Any observations about running ability..."
              />
            </div>

            <div>
              <label className="label">Coach Notes — How did this feel overall?</label>
              <textarea
                value={form.coach_notes}
                onChange={(e) => setForm({ ...form, coach_notes: e.target.value })}
                className="input resize-none h-16"
                placeholder="Reflect on this assessment..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="btn btn-primary flex-1 cursor-pointer">Save Retest</button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Retest History ── */}
      {retests.map((retest: Assessment) => (
        <div key={retest.id} className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-text-primary">Retest #{retest.entry_number}</span>
            <span className="text-xs text-text-muted">{retest.created_at.split('T')[0]}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: 'Weight', val: retest.weight_kg, base: baseline?.weight_kg || 70, unit: 'kg' },
              { label: 'Waist', val: retest.waist_inches, base: baseline?.waist_inches || 32, unit: '"' },
              { label: 'Push-ups', val: retest.pushups, base: baseline?.pushups || 10, unit: '' },
              { label: 'Squats', val: retest.squats, base: baseline?.squats || 10, unit: '' },
              { label: 'Pull-ups', val: retest.pullups, base: baseline?.pullups || 0, unit: '' },
            ].map((m) => (
              <div key={m.label} className="bg-bg-secondary rounded-lg p-2 text-center">
                <div className="text-[0.5625rem] text-text-muted font-semibold tracking-wider uppercase">{m.label}</div>
                <div className="stat-number text-sm text-text-primary">{m.val}{m.unit}</div>
                <DiffBadge baseline={m.base} current={m.val} />
              </div>
            ))}
          </div>

          {retest.coach_notes && (
            <p className="text-xs text-text-muted mt-3 italic">"{retest.coach_notes}"</p>
          )}
        </div>
      ))}

      {retests.length === 0 && !showForm && (
        <div className="text-center py-12 text-text-muted">
          <Activity size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No retests logged yet. Tap "New Retest" to log your first assessment.</p>
        </div>
      )}
    </div>
  );
}
