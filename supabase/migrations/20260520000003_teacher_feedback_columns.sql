ALTER TABLE public.essay_teacher_shares
  ADD COLUMN IF NOT EXISTS feedback_items   JSONB,
  ADD COLUMN IF NOT EXISTS track_changes    JSONB,
  ADD COLUMN IF NOT EXISTS ai_analysis      JSONB,
  ADD COLUMN IF NOT EXISTS personal_message TEXT,
  ADD COLUMN IF NOT EXISTS sent_at          TIMESTAMPTZ;
