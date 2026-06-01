-- ── Session Tracking ──────────────────────────────────────────────────────────
-- Tracks student login sessions and feature-level page events.
-- Powers the Engagement Analytics tab in the SuperAdmin page.

-- user_sessions: one row per browser session per authenticated user
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id        UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  role             TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- session_events: one row per page view / feature interaction
CREATE TABLE IF NOT EXISTS public.session_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id   UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  page_path   TEXT NOT NULL,
  feature     TEXT,   -- 'primrose_lab' | 'essay_feedback' | 'scholarship_finder' | 'school_exploration'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id     ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_school_id   ON public.user_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at  ON public.user_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_role        ON public.user_sessions(role);
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON public.session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_user_id    ON public.session_events(user_id);
CREATE INDEX IF NOT EXISTS idx_session_events_school_id  ON public.session_events(school_id);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON public.session_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_events_feature    ON public.session_events(feature) WHERE feature IS NOT NULL;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

-- Users can fully manage their own session records
CREATE POLICY "users_own_sessions" ON public.user_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own events
CREATE POLICY "users_insert_own_events" ON public.session_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all sessions (for SuperAdmin engagement tab)
CREATE POLICY "admins_read_sessions" ON public.user_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Admins can read all events
CREATE POLICY "admins_read_events" ON public.session_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );
