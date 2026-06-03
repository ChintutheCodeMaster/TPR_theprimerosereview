-- Fix infinite recursion in "Principals view profiles at their school" policy.
-- The original policy did a subquery on profiles inside a profiles policy → recursion.
-- Solution: SECURITY DEFINER function bypasses RLS when fetching the caller's own school_id.

CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

DROP POLICY IF EXISTS "Principals view profiles at their school" ON public.profiles;

CREATE POLICY "Principals view profiles at their school"
  ON public.profiles FOR SELECT
  USING (
    has_role(auth.uid(), 'principal') AND
    school_id = public.get_my_school_id()
  );
