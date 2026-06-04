-- ── Sync admin functions from main → dev ─────────────────────────────────────
-- These functions exist in main but were missing from dev.
-- Needed for SuperAdmin page and recommendation completion tracking.

-- ── admin_get_or_create_conversation ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_get_or_create_conversation(
  p_admin_id   uuid,
  p_student_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conv_id uuid;
BEGIN
  SELECT id INTO v_conv_id
    FROM conversations
    WHERE student_id = p_student_id
      AND counselor_id = p_admin_id
    LIMIT 1;

  IF v_conv_id IS NULL THEN
    INSERT INTO conversations (student_id, counselor_id, status)
      VALUES (p_student_id, p_admin_id, 'active')
      RETURNING id INTO v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

-- ── get_all_platform_users ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_platform_users()
RETURNS TABLE(
  user_id    uuid,
  email      text,
  full_name  text,
  role       text,
  school_name text,
  joined_at  timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.user_id,
    p.email,
    p.full_name,
    COALESCE(ur.role::text, 'no role') AS role,
    s.name AS school_name,
    au.created_at AS joined_at
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.user_id
  LEFT JOIN schools s ON s.id = p.school_id
  LEFT JOIN auth.users au ON au.id = p.user_id
  ORDER BY au.created_at DESC;
$$;

-- ── reassign_student ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reassign_student(
  p_student_id      uuid,
  p_new_counselor_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM student_counselor_assignments WHERE student_id = p_student_id;
  INSERT INTO student_counselor_assignments (student_id, counselor_id)
    VALUES (p_student_id, p_new_counselor_id);
  UPDATE conversations SET counselor_id = p_new_counselor_id WHERE student_id = p_student_id;
END;
$$;

-- ── handle_recommendation_sent (trigger function) ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_recommendation_sent()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status IS DISTINCT FROM 'sent' THEN
    UPDATE applications
    SET
      recommendations_submitted = recommendations_submitted + 1,
      completion_percentage = COALESCE(ROUND(
        ((completed_essays::decimal / NULLIF(required_essays, 0)) * 60) +
        (((recommendations_submitted + 1)::decimal / NULLIF(recommendations_requested, 0)) * 40)
      ), 0)
    WHERE student_id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger (idempotent: drop first)
DROP TRIGGER IF EXISTS on_recommendation_sent ON public.recommendation_requests;

CREATE TRIGGER on_recommendation_sent
  AFTER UPDATE ON public.recommendation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_recommendation_sent();
