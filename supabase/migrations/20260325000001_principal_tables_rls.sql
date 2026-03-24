-- ── Add logo_url to schools ──────────────────────────────────────────────────
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ── Create school_activities table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.school_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id   UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TEXT,
  location    TEXT,
  category    TEXT NOT NULL DEFAULT 'General',
  status      TEXT NOT NULL DEFAULT 'Upcoming'
              CHECK (status IN ('Upcoming', 'Past', 'Cancelled')),
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;

-- ── Helper function ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_school_principal(_user_id uuid, _school_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles r ON r.user_id = p.user_id
    WHERE p.user_id   = _user_id
      AND p.school_id = _school_id
      AND r.role      = 'principal'
  )
$$;

-- ── RLS: school_activities ────────────────────────────────────────────────────

CREATE POLICY "Parents view school activities"
  ON public.school_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_assignments psa
      JOIN public.profiles sp ON sp.user_id = psa.student_id
      WHERE psa.parent_id = auth.uid()
        AND sp.school_id  = school_activities.school_id
    )
  );

CREATE POLICY "Principals manage school activities"
  ON public.school_activities FOR ALL
  USING  (is_school_principal(auth.uid(), school_id))
  WITH CHECK (is_school_principal(auth.uid(), school_id));

-- ── RLS: schools (principal can update their school row) ──────────────────────
CREATE POLICY "Principals update their school"
  ON public.schools FOR UPDATE
  USING (
    has_role(auth.uid(), 'principal') AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id   = auth.uid()
        AND school_id = schools.id
    )
  );

-- ── RLS: profiles (principal can read all profiles at their school) ───────────
CREATE POLICY "Principals view profiles at their school"
  ON public.profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'principal') AND
    school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- ── RLS: essay_feedback ───────────────────────────────────────────────────────
CREATE POLICY "Principals view essays at their school"
  ON public.essay_feedback FOR SELECT
  USING (
    has_role(auth.uid(), 'principal') AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id   = essay_feedback.student_id
        AND school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- ── RLS: recommendation_requests ─────────────────────────────────────────────
CREATE POLICY "Principals view recs at their school"
  ON public.recommendation_requests FOR SELECT
  USING (
    has_role(auth.uid(), 'principal') AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id   = recommendation_requests.student_id
        AND school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- ── RLS: applications ────────────────────────────────────────────────────────
CREATE POLICY "Principals view applications at their school"
  ON public.applications FOR SELECT
  USING (
    has_role(auth.uid(), 'principal') AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id   = applications.student_id
        AND school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- ── RLS: student_counselor_assignments ───────────────────────────────────────
CREATE POLICY "Principals view assignments at their school"
  ON public.student_counselor_assignments FOR SELECT
  USING (
    has_role(auth.uid(), 'principal') AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id   = student_counselor_assignments.counselor_id
        AND school_id = (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );
