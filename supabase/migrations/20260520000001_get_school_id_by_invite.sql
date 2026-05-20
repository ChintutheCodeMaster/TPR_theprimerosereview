-- Returns the school_id associated with an invite code.
-- SECURITY DEFINER bypasses RLS so it works before the teacher is authenticated.
CREATE OR REPLACE FUNCTION public.get_school_id_by_invite(invite_code_param TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.school_id
  FROM public.counselor_invites ci
  JOIN public.profiles p ON p.user_id = ci.counselor_id
  WHERE ci.invite_code = invite_code_param
    AND ci.is_active = TRUE
  LIMIT 1;
$$;
