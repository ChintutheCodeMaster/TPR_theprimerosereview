-- 1. Teachers table — one record per real-world teacher, keyed by email
CREATE TABLE IF NOT EXISTS public.teachers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  role       TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Add nullable FK on recommendation_requests
--    Old rows stay untouched (teacher_id = NULL)
ALTER TABLE public.recommendation_requests
  ADD COLUMN IF NOT EXISTS teacher_id UUID
    REFERENCES public.teachers(id) ON DELETE SET NULL;

-- 3. RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read teachers
CREATE POLICY "authenticated users can read teachers"
  ON public.teachers FOR SELECT
  TO authenticated
  USING (true);

-- Students need INSERT to upsert a teacher record on form submission
CREATE POLICY "authenticated users can insert teachers"
  ON public.teachers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow updating name/role if a student re-submits with corrected details
CREATE POLICY "authenticated users can update teachers"
  ON public.teachers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);