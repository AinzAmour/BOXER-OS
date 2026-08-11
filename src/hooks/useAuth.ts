import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRemembered, setIsRemembered] = useState<boolean>(() => {
    return localStorage.getItem('boxer_os_remember_me') === 'true';
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string, remember: boolean) => {
    localStorage.setItem('boxer_os_remember_me', String(remember));
    setIsRemembered(remember);
    const res = await signInWithEmail(email, pass);
    setUser(res.user);
    setSession(res.session);
    return res;
  };

  const register = async (email: string, pass: string, remember: boolean) => {
    localStorage.setItem('boxer_os_remember_me', String(remember));
    setIsRemembered(remember);
    const res = await signUpWithEmail(email, pass);
    setUser(res.user);
    setSession(res.session);
    return res;
  };

  const loginWithGoogle = async () => {
    localStorage.setItem('boxer_os_remember_me', 'true');
    setIsRemembered(true);
    await signInWithGoogle();
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    isRemembered,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user || localStorage.getItem('boxer_os_guest_unlocked') === 'true',
  };
}
