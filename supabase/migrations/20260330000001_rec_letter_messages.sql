-- ============================================================
-- Rec Letter: Counselor ↔ Teacher comment thread
-- ============================================================

-- 1. Create rec_letter_messages table
CREATE TABLE IF NOT EXISTS public.rec_letter_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID        NOT NULL REFERENCES public.recommendation_requests(id) ON DELETE CASCADE,
  sender_role TEXT        NOT NULL CHECK (sender_role IN ('counselor', 'teacher')),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rec_letter_messages_request_id
  ON public.rec_letter_messages(request_id);

ALTER TABLE public.rec_letter_messages ENABLE ROW LEVEL SECURITY;

-- 2. RLS: authenticated counselors only
--    (teachers write via SECURITY DEFINER RPC below)

CREATE POLICY "Counselors view rec messages"
  ON public.rec_letter_messages FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor') AND
    EXISTS (
      SELECT 1 FROM public.recommendation_requests rr
      JOIN public.student_counselor_assignments sca ON sca.student_id = rr.student_id
      WHERE rr.id = rec_letter_messages.request_id
        AND sca.counselor_id = auth.uid()
    )
  );

CREATE POLICY "Counselors insert rec messages"
  ON public.rec_letter_messages FOR INSERT
  WITH CHECK (
    sender_role = 'counselor' AND
    public.has_role(auth.uid(), 'counselor') AND
    EXISTS (
      SELECT 1 FROM public.recommendation_requests rr
      JOIN public.student_counselor_assignments sca ON sca.student_id = rr.student_id
      WHERE rr.id = request_id
        AND sca.counselor_id = auth.uid()
    )
  );

-- 3. Update get_recommendation_by_token to include the messages thread
CREATE OR REPLACE FUNCTION get_recommendation_by_token(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec          recommendation_requests%ROWTYPE;
  v_student_name TEXT;
  v_messages     JSON;
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

  SELECT COALESCE(
    json_agg(
      json_build_object(
        'id',          m.id,
        'sender_role', m.sender_role,
        'content',     m.content,
        'created_at',  m.created_at
      ) ORDER BY m.created_at ASC
    ),
    '[]'::json
  ) INTO v_messages
  FROM rec_letter_messages m
  WHERE m.request_id = v_rec.id;

  RETURN json_build_object(
    'id',                    v_rec.id,
    'student_name',          v_student_name,
    'referee_name',          v_rec.referee_name,
    'referee_role',          v_rec.referee_role,
    'relationship_duration', v_rec.relationship_duration,
    'relationship_capacity', v_rec.relationship_capacity,
    'meaningful_project',    v_rec.meaningful_project,
    'best_moment',           v_rec.best_moment,
    'difficulties_overcome', v_rec.difficulties_overcome,
    'strengths',             v_rec.strengths,
    'personal_notes',        v_rec.personal_notes,
    'teacher_draft',         v_rec.teacher_draft,
    'status',                v_rec.status,
    'messages',              v_messages
  );
END;
$$;

-- 4. New RPC: teacher adds a reply message via token (no auth required)
CREATE OR REPLACE FUNCTION add_teacher_message_by_token(p_token UUID, p_content TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id UUID;
  v_message_id UUID;
BEGIN
  SELECT id INTO v_request_id
  FROM recommendation_requests
  WHERE teacher_token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;

  INSERT INTO rec_letter_messages (request_id, sender_role, content)
  VALUES (v_request_id, 'teacher', p_content)
  RETURNING id INTO v_message_id;

  RETURN v_message_id;
END;
$$;
