-- SECURITY DEFINER function so a newly-registered parent (who has no
-- student assignments yet) can still find their child and create the link.
CREATE OR REPLACE FUNCTION public.link_parent_to_student(
  _counselor_invite_code TEXT,
  _parent_email          TEXT
)
RETURNS UUID   -- returns the matched student_id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _counselor_id UUID;
  _student_id   UUID;
BEGIN
  -- 1. Validate the counselor invite code
  SELECT counselor_id INTO _counselor_id
  FROM public.counselor_invites
  WHERE invite_code = _counselor_invite_code
    AND (is_active IS NULL OR is_active = TRUE)
  LIMIT 1;

  IF _counselor_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- 2. Find a student whose registered parent_email matches and who is
  --    assigned to that counselor
  SELECT sp.user_id INTO _student_id
  FROM public.student_profiles sp
  JOIN public.student_counselor_assignments sca
    ON sca.student_id = sp.user_id
  WHERE LOWER(sp.parent_email) = LOWER(_parent_email)
    AND sca.counselor_id = _counselor_id
  LIMIT 1;

  IF _student_id IS NULL THEN
    RAISE EXCEPTION
      'No student found for this invite code and email. '
      'Make sure you are using the same email your child registered for you.';
  END IF;

  -- 3. Create the parent-student link (ignore if already exists)
  INSERT INTO public.parent_student_assignments (parent_id, student_id, invitation_code)
  VALUES (auth.uid(), _student_id, _counselor_invite_code)
  ON CONFLICT (parent_id, student_id) DO NOTHING;

  RETURN _student_id;
END;
$$;
