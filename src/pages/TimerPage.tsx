import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

type TimerState = 'idle' | 'work' | 'rest' | 'warning' | 'finished';

// ── Web Audio Synth ──
function playBell(ctx: AudioContext, type: 'work' | 'rest' | 'warning') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'work') {
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    // Double bell for work
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 800;
      gain2.gain.setValueAtTime(0.6, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.6);
    }, 200);
  } else if (type === 'rest') {
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } else {
    // Warning: short beep
    osc.frequency.value = 1000;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }
}

export function TimerPage() {
  const [workSeconds, setWorkSeconds] = useState(180);
  const [restSeconds, setRestSeconds] = useState(60);
  const [warningSeconds] = useState(10);
  const [totalRounds, setTotalRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const warningPlayedRef = useRef(false);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    clearTimer();
    setCurrentRound(1);
    setTimeLeft(workSeconds);
    setTimerState('idle');
    setIsPaused(false);
    warningPlayedRef.current = false;
  };

  const startWork = useCallback((round: number) => {
    setCurrentRound(round);
    setTimeLeft(workSeconds);
    setTimerState('work');
    setIsPaused(false);
    warningPlayedRef.current = false;
    if (audioEnabled) playBell(getAudioCtx(), 'work');
  }, [workSeconds, audioEnabled, getAudioCtx]);

  const startRest = useCallback(() => {
    setTimeLeft(restSeconds);
    setTimerState('rest');
    warningPlayedRef.current = false;
    if (audioEnabled) playBell(getAudioCtx(), 'rest');
  }, [restSeconds, audioEnabled, getAudioCtx]);

  const start = () => {
    if (timerState === 'idle' || timerState === 'finished') {
      startWork(1);
    } else {
      setIsPaused(false);
    }
  };

  // Timer tick
  useEffect(() => {
    if (timerState === 'idle' || timerState === 'finished' || isPaused) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        // Warning bell
        if (next === warningSeconds && !warningPlayedRef.current) {
          warningPlayedRef.current = true;
          if (audioEnabled) playBell(getAudioCtx(), 'warning');
        }

        if (next <= 0) {
          if (timerState === 'work') {
            if (currentRound >= totalRounds) {
              clearTimer();
              setTimerState('finished');
              if (audioEnabled) playBell(getAudioCtx(), 'rest');
              return 0;
            }
            startRest();
            return restSeconds;
          } else if (timerState === 'rest') {
            startWork(currentRound + 1);
            return workSeconds;
          }
        }
        return next;
      });
    }, 1000);

    return clearTimer;
  }, [timerState, isPaused, currentRound, totalRounds, workSeconds, restSeconds, warningSeconds, audioEnabled, startRest, startWork, getAudioCtx]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = timerState === 'work'
    ? ((workSeconds - timeLeft) / workSeconds) * 100
    : timerState === 'rest'
      ? ((restSeconds - timeLeft) / restSeconds) * 100
      : 0;

  const stateColors: Record<TimerState, string> = {
    idle: 'text-text-muted',
    work: 'text-accent-red',
    rest: 'text-accent-teal',
    warning: 'text-accent-gold',
    finished: 'text-status-success',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer size={20} className="text-accent-teal" />
          <h2 className="text-lg font-bold">Round Timer</h2>
        </div>
        <button onClick={() => setAudioEnabled(!audioEnabled)} className="btn-ghost p-2 rounded-lg">
          {audioEnabled ? <Volume2 size={18} className="text-text-secondary" /> : <VolumeX size={18} className="text-text-muted" />}
        </button>
      </div>

      {/* Timer Display */}
      <div className="glass-card p-8 lg:p-12 text-center relative overflow-hidden">
        {/* Progress bar background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timerState === 'work' ? 'bg-accent-red' : timerState === 'rest' ? 'bg-accent-teal' : ''
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* State label */}
        <div className={`text-xs font-bold tracking-[0.2em] uppercase mb-4 ${stateColors[timerState]}`}>
          {timerState === 'idle' ? 'READY' : timerState === 'finished' ? 'COMPLETE' : timerState.toUpperCase()}
        </div>

        {/* Round */}
        <div className="text-sm text-text-secondary mb-2">
          ROUND <span className="stat-number text-text-primary">{currentRound}</span>{' '}
          <span className="text-text-muted">/ {totalRounds}</span>
        </div>

        {/* Time */}
        <div className={`timer-display ${stateColors[timerState]} relative z-10`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Round dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i + 1 < currentRound
                  ? 'bg-status-success'
                  : i + 1 === currentRound
                    ? timerState === 'work' ? 'bg-accent-red animate-pulse-glow' : timerState === 'rest' ? 'bg-accent-teal' : 'bg-text-muted'
                    : 'bg-border-default'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={reset} className="btn btn-secondary w-16 h-16 rounded-2xl p-0">
          <RotateCcw size={24} />
        </button>

        <button
          onClick={() => {
            if (timerState === 'idle' || timerState === 'finished') start();
            else if (isPaused) setIsPaused(false);
            else setIsPaused(true);
          }}
          className={`btn w-20 h-20 rounded-2xl p-0 text-white ${
            timerState === 'work' || (timerState !== 'idle' && timerState !== 'finished' && !isPaused)
              ? 'bg-accent-red glow-red'
              : 'bg-accent-teal glow-teal'
          }`}
        >
          {timerState === 'idle' || timerState === 'finished' || isPaused ? <Play size={32} /> : <Pause size={32} />}
        </button>

        <div className="w-16 h-16" /> {/* Spacer for symmetry */}
      </div>

      {/* Settings (only when idle) */}
      {timerState === 'idle' && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase">Timer Settings</h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Work (sec)</label>
              <input type="number" className="input text-center" value={workSeconds}
                onChange={(e) => { setWorkSeconds(parseInt(e.target.value) || 180); setTimeLeft(parseInt(e.target.value) || 180); }} />
            </div>
            <div>
              <label className="label">Rest (sec)</label>
              <input type="number" className="input text-center" value={restSeconds}
                onChange={(e) => setRestSeconds(parseInt(e.target.value) || 60)} />
            </div>
            <div>
              <label className="label">Rounds</label>
              <input type="number" className="input text-center" value={totalRounds}
                onChange={(e) => setTotalRounds(parseInt(e.target.value) || 3)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
