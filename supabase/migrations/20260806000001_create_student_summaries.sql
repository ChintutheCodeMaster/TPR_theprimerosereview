-- Cached AI-generated snapshots of a student built from onboarding_answers + voice_insights.
-- One row per student. source_signature is a hash of the underlying rows' updated_at/created_at
-- so the edge function knows when the cache is stale.

CREATE TABLE IF NOT EXISTS public.student_summaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  summary           JSONB NOT NULL,
  source_signature  TEXT,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_summaries_student_id
  ON public.student_summaries(student_id);

ALTER TABLE public.student_summaries ENABLE ROW LEVEL SECURITY;

-- Students may read their own summary
CREATE POLICY "Students can read their own summary"
  ON public.student_summaries FOR SELECT
  USING (auth.uid() = student_id);

-- Counselors can read summaries for students assigned to them
CREATE POLICY "Counselors read assigned student summaries"
  ON public.student_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_counselor_assignments a
      WHERE a.student_id = student_summaries.student_id
        AND a.counselor_id = auth.uid()
    )
  );

-- Writes happen from the edge function using the service role, which bypasses RLS.
