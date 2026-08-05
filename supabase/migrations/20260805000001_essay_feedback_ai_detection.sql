-- Persist AI-detection results per essay so counselors don't lose them on modal close.
-- ai_detection stores the full result payload from the essay-toolkit edge fn.
-- ai_detection_content stores the essay text that was analyzed — used to
-- invalidate the stored result when the student re-sends (text changes).

ALTER TABLE essay_feedback
  ADD COLUMN IF NOT EXISTS ai_detection jsonb,
  ADD COLUMN IF NOT EXISTS ai_detection_content text;
