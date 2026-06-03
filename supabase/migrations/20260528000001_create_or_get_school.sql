-- Returns the id of an existing school (case-insensitive match) or creates a new one.
-- SECURITY DEFINER bypasses RLS so newly-registered users can create schools during signup.
CREATE OR REPLACE FUNCTION public.create_or_get_school(school_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id
  FROM public.schools
  WHERE lower(name) = lower(trim(school_name))
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.schools (name)
    VALUES (trim(school_name))
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;
