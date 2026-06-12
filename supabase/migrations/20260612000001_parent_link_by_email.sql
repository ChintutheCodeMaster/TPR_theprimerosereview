-- Parent signup without an invite code:
--   * Parents may sign up by providing the student's email instead of a code.
--   * If the student already exists, the link is created immediately.
--   * If not, the request is queued in pending_parent_links and resolved
--     automatically when the student signs up.

-- 1. Queue table for parent->student requests that can't be linked yet
CREATE TABLE IF NOT EXISTS public.pending_parent_links (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_email)
);

CREATE INDEX IF NOT EXISTS idx_pending_parent_links_email
  ON public.pending_parent_links (LOWER(student_email));

ALTER TABLE public.pending_parent_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parents_manage_own_pending_links" ON public.pending_parent_links;
CREATE POLICY "parents_manage_own_pending_links"
  ON public.pending_parent_links
  FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- 2. RPC called by a newly-registered parent.
--    Returns: 'linked'  -> assignment row created
--             'pending' -> student not found, queued for later
--             'no_email' -> empty input
CREATE OR REPLACE FUNCTION public.link_parent_by_student_email(
  _student_email text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _parent_id  uuid := auth.uid();
  _student_id uuid;
  _email      text;
BEGIN
  IF _parent_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  _email := LOWER(TRIM(COALESCE(_student_email, '')));
  IF _email = '' THEN
    RETURN 'no_email';
  END IF;

  SELECT u.id INTO _student_id
  FROM auth.users u
  JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE LOWER(u.email) = _email
    AND ur.role = 'student'
  LIMIT 1;

  IF _student_id IS NOT NULL THEN
    INSERT INTO public.parent_student_assignments (parent_id, student_id, invitation_code)
    VALUES (_parent_id, _student_id, NULL)
    ON CONFLICT (parent_id, student_id) DO NOTHING;
    RETURN 'linked';
  END IF;

  INSERT INTO public.pending_parent_links (parent_id, student_email)
  VALUES (_parent_id, _email)
  ON CONFLICT (parent_id, student_email) DO NOTHING;
  RETURN 'pending';
END;
$$;

-- 3. RPC called at the end of student signup to consume any queued parent
--    links keyed by that student's auth email.
CREATE OR REPLACE FUNCTION public.resolve_pending_parent_links_for_student(
  _student_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _count integer := 0;
BEGIN
  SELECT LOWER(email) INTO _email FROM auth.users WHERE id = _student_id;
  IF _email IS NULL THEN
    RETURN 0;
  END IF;

  WITH moved AS (
    DELETE FROM public.pending_parent_links
    WHERE LOWER(student_email) = _email
    RETURNING parent_id
  )
  INSERT INTO public.parent_student_assignments (parent_id, student_id, invitation_code)
  SELECT parent_id, _student_id, NULL FROM moved
  ON CONFLICT (parent_id, student_id) DO NOTHING;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_parent_by_student_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_pending_parent_links_for_student(uuid) TO authenticated;
