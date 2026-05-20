-- Allow teacher-only essay submissions (counselor_id is null when student sends to teacher only)
ALTER TABLE public.essay_feedback
  ALTER COLUMN counselor_id DROP NOT NULL;
