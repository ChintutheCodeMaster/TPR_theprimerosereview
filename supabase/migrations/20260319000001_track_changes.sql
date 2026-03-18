-- Add track_changes column to essay_feedback
ALTER TABLE essay_feedback
  ADD COLUMN IF NOT EXISTS track_changes jsonb DEFAULT '[]'::jsonb;

-- Add track_changes column to essay_feedback_history
ALTER TABLE essay_feedback_history
  ADD COLUMN IF NOT EXISTS track_changes jsonb DEFAULT '[]'::jsonb;
