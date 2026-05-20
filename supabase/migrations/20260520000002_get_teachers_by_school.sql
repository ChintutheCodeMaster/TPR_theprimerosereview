CREATE OR REPLACE FUNCTION public.get_teachers_by_school(school_id_param UUID)
RETURNS TABLE(user_id UUID, full_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name
  FROM public.teacher_profiles tp
  JOIN public.profiles p ON p.user_id = tp.user_id
  WHERE tp.school_id = school_id_param;
$$;
