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

  const { login, register, loginWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google OAuth failed.';
      setError(msg);
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

      <div className="glass-card max-w-md w-full p-6 sm:p-8 space-y-5 border border-border-default relative z-10 shadow-2xl">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-red flex items-center justify-center mx-auto glow-red">
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-mono)' }}>L</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight">
            <span>LIFE</span>
            <span className="text-accent-red">//</span>
            <span className="text-text-secondary">OS</span>
          </h1>

          <p className="text-xs text-text-muted font-mono tracking-widest uppercase">
            PERSONAL ACCESS GATEWAY
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn w-full py-3 text-xs flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-md transition-all border border-gray-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-border-subtle w-full" />
          <span className="bg-[#1a1f2e] px-3 text-[0.625rem] text-text-muted font-mono uppercase tracking-widest absolute">
            OR EMAIL LOGIN
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-bg-card text-accent-red border border-border-active'
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label flex items-center gap-1">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              required
              className="input"
              placeholder="fighter@lifeos.app"
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

          {/* Remember Me */}
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
                <LogIn size={16} /> Enter LIFE//OS
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Profile
              </>
            )}
          </button>
        </form>

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
