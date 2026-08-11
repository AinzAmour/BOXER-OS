import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRemembered, setIsRemembered] = useState<boolean>(() => {
    try {
      return localStorage.getItem('boxer_os_remember_me') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase session warning, resetting auth state:', error);
          // If session is invalid, clear stale auth items so app doesn't freeze
          localStorage.removeItem('sb-dwlwcabszyvszlgeicek-auth-token');
        } else if (isMounted && data?.session) {
          setSession(data.session);
          setUser(data.session.user ?? null);
        }
      } catch (err) {
        console.error('Error recovering session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen for auth state changes safely
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
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
    try {
      await signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setUser(null);
    setSession(null);
  };

  const isGuestUnlocked = () => {
    try {
      return localStorage.getItem('boxer_os_guest_unlocked') === 'true';
    } catch {
      return false;
    }
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
    isAuthenticated: !!user || isGuestUnlocked(),
  };
}
