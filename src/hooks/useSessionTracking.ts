import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuthState';

const FEATURE_MAP: Record<string, string> = {
  '/primrose-lab': 'primrose_lab',
  '/preview/primrose-lab': 'primrose_lab',
  '/student-feedback': 'essay_feedback',
  '/essays': 'essay_feedback',
  '/essay-analytics': 'essay_feedback',
  '/submit-essay': 'essay_feedback',
  '/edit-essay': 'essay_feedback',
  '/scholarship-finder': 'scholarship_finder',
  '/preview/scholarship-finder': 'scholarship_finder',
  '/add-application': 'school_exploration',
  '/applications': 'school_exploration',
  '/student-personal-area': 'school_exploration',
  '/preview/student-personal-area': 'school_exploration',
};

function detectFeature(path: string): string | null {
  return FEATURE_MAP[path] ?? null;
}

async function closePendingSession() {
  const raw = sessionStorage.getItem('tpr_session_end');
  if (!raw) return;
  sessionStorage.removeItem('tpr_session_end');
  try {
    const { id, ended_at, duration_seconds } = JSON.parse(raw);
    if (id) {
      await supabase.from('user_sessions' as any)
        .update({ ended_at, duration_seconds, last_activity_at: ended_at })
        .eq('id', id);
    }
  } catch (_) {}
}

export function useSessionTracking() {
  const { user, isAuthenticated } = useAuthState();
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      sessionIdRef.current = null;
      return;
    }

    const initSession = async () => {
      // Close any session that was open when the tab was last closed
      await closePendingSession();

      // Reuse existing session within the same browser tab
      const stored = sessionStorage.getItem('tpr_session_id');
      if (stored) {
        sessionIdRef.current = stored;
        return;
      }

      const [roleRes, profileRes] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('school_id').eq('user_id', user.id).maybeSingle(),
      ]);

      const { data, error } = await supabase.from('user_sessions' as any).insert({
        user_id: user.id,
        role: roleRes.data?.role ?? null,
        school_id: profileRes.data?.school_id ?? null,
      }).select('id').single();

      if (!error && data) {
        const id = (data as any).id as string;
        sessionIdRef.current = id;
        sessionStartRef.current = Date.now();
        sessionStorage.setItem('tpr_session_id', id);

        // Log the initial page view immediately after session is created
        const feature = detectFeature(window.location.pathname);
        await supabase.from('session_events' as any).insert({
          session_id: id,
          user_id: user.id,
          school_id: profileRes.data?.school_id ?? null,
          page_path: window.location.pathname,
          feature,
        });
      }
    };

    initSession();

    // Ping activity every 60s
    pingRef.current = setInterval(() => {
      if (!sessionIdRef.current) return;
      supabase.from('user_sessions' as any)
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionIdRef.current);
    }, 60_000);

    // Mark session ended when tab is hidden / closed
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
        const payload = JSON.stringify({
          id: sessionIdRef.current,
          ended_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        });
        sessionStorage.setItem('tpr_session_end', payload);
        sessionStorage.removeItem('tpr_session_id');
        sessionIdRef.current = null;

        // Best-effort async update
        supabase.from('user_sessions' as any)
          .update({ ended_at: new Date().toISOString(), duration_seconds: durationSeconds })
          .eq('id', JSON.parse(payload).id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, user?.id]);

  // Log page views on route changes (skips initial load — handled in initSession)
  useEffect(() => {
    if (!isAuthenticated || !user || !sessionIdRef.current) return;

    supabase.from('session_events' as any).insert({
      session_id: sessionIdRef.current,
      user_id: user.id,
      page_path: location.pathname,
      feature: detectFeature(location.pathname),
    });
  }, [location.pathname]);
}
