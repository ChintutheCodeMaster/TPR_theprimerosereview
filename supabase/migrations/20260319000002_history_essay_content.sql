-- Add essay_content snapshot to essay_feedback_history
-- so each version captures the exact essay text at save time
ALTER TABLE essay_feedback_history
  ADD COLUMN IF NOT EXISTS essay_content text;
