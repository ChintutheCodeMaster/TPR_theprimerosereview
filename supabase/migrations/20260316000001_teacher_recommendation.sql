-- Add teacher fields to recommendation_requests
ALTER TABLE recommendation_requests
  ADD COLUMN IF NOT EXISTS teacher_email TEXT,
  ADD COLUMN IF NOT EXISTS teacher_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS teacher_draft TEXT;

-- Ensure every existing row has a token
UPDATE recommendation_requests
SET teacher_token = gen_random_uuid()
WHERE teacher_token IS NULL;

-- Public function: teacher fetches request by token (no auth needed)
CREATE OR REPLACE FUNCTION get_recommendation_by_token(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec recommendation_requests%ROWTYPE;
  v_student_name TEXT;
BEGIN
  SELECT * INTO v_rec
  FROM recommendation_requests
  WHERE teacher_token = p_token;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT full_name INTO v_student_name
  FROM profiles
  WHERE user_id = v_rec.student_id;

  RETURN json_build_object(
    'id',                   v_rec.id,
    'student_name',         v_student_name,
    'referee_name',         v_rec.referee_name,
    'referee_role',         v_rec.referee_role,
    'relationship_duration',v_rec.relationship_duration,
    'relationship_capacity',v_rec.relationship_capacity,
    'meaningful_project',   v_rec.meaningful_project,
    'best_moment',          v_rec.best_moment,
    'difficulties_overcome',v_rec.difficulties_overcome,
    'strengths',            v_rec.strengths,
    'personal_notes',       v_rec.personal_notes,
    'teacher_draft',        v_rec.teacher_draft,
    'status',               v_rec.status
  );
END;
$$;

-- Public function: teacher submits their draft by token (no auth needed)
CREATE OR REPLACE FUNCTION submit_teacher_draft(p_token UUID, p_draft TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE recommendation_requests
  SET
    teacher_draft = p_draft,
    status        = 'in_progress',
    updated_at    = now()
  WHERE teacher_token = p_token;
$$;
