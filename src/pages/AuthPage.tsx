import { useState } from 'react';
import { Mail, Key, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password, rememberMe);
      } else {
        await register(email, password, rememberMe);
      }
      onAuthenticated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestUnlock = () => {
    localStorage.setItem('boxer_os_guest_unlocked', 'true');
    if (rememberMe) {
      localStorage.setItem('boxer_os_remember_me', 'true');
    }
    onAuthenticated();
  };

  return (
    <div className="min-h-dvh bg-[#0b0d10] text-[#f0f2f5] flex items-center justify-center p-4">
      {/* Background glow ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-red/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
      </div>

      <div className="glass-card max-w-md w-full p-6 sm:p-8 space-y-6 border border-border-default relative z-10 shadow-2xl">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-red flex items-center justify-center mx-auto glow-red">
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-mono)' }}>B</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            <span>BOXER</span>
            <span className="text-accent-red">//</span>
            <span className="text-text-secondary">OS</span>
          </h1>

          <p className="text-xs text-text-muted font-mono tracking-widest uppercase">
            FIGHTER ACCESS GATEWAY
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-bg-card text-accent-cyan border border-border-active'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            <LogIn size={14} /> Sign In
          </button>

          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-bg-card text-accent-red border border-border-active'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label flex items-center gap-1">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              required
              className="input"
              placeholder="fighter@boxeros.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label flex items-center gap-1">
              <Key size={12} /> Password
            </label>
            <input
              type="password"
              required
              className="input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Remember Me & Options */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary hover:text-text-primary">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border-default bg-bg-secondary accent-accent-red cursor-pointer"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {error && (
            <div className="glass-card p-3 border-l-2 border-l-accent-red text-xs text-accent-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'signin' ? (
              <>
                <LogIn size={16} /> Enter BOXER//OS
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Fighter Profile
              </>
            )}
          </button>
        </form>

        {/* Quick Access Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-border-subtle w-full" />
          <span className="bg-[#1a1f2e] px-3 text-[0.625rem] text-text-muted font-mono uppercase tracking-widest absolute">
            OR QUICK ACCESS
          </span>
        </div>

        {/* Quick Access Pass */}
        <button
          type="button"
          onClick={handleGuestUnlock}
          className="btn btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <ShieldCheck size={14} className="text-accent-cyan" />
          Continue with Device Session
          <ArrowRight size={14} />
        </button>

        {/* Footer info */}
        <p className="text-[0.625rem] text-text-muted text-center leading-relaxed">
          Encrypted profile data · IndexedDB Local Storage · Supabase Cloud Sync
        </p>
      </div>
    </div>
  );
}
