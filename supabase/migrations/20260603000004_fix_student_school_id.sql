-- SECURITY DEFINER function to resolve school_id from a student invite code
-- before signup (unauthenticated context), bypassing RLS the same way
-- get_school_id_by_invite does for teacher invites.
CREATE OR REPLACE FUNCTION public.get_school_id_by_student_invite(invite_code_param TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p.school_id
  FROM public.counselor_invites ci
  JOIN public.profiles p ON p.user_id = ci.counselor_id
  WHERE ci.invite_code = invite_code_param
  LIMIT 1;
$$;

-- Backfill school_id for existing students who registered via invite link
-- but were left with school_id = NULL due to the RLS bug.
UPDATE public.profiles p
SET school_id = (
  SELECT p2.school_id
  FROM public.student_counselor_assignments sca
  JOIN public.profiles p2 ON p2.user_id = sca.counselor_id
  WHERE sca.student_id = p.user_id
    AND p2.school_id IS NOT NULL
  LIMIT 1
)
WHERE p.school_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.user_id AND ur.role = 'student'
  );
