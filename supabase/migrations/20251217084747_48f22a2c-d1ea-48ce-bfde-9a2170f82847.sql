-- Add 'parent' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parent';

-- Create parent_student_assignments table for parent-child relationships via invitation codes
CREATE TABLE public.parent_student_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  invitation_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

-- Enable RLS
ALTER TABLE public.parent_student_assignments ENABLE ROW LEVEL SECURITY;

-- Parents can view their own assignments
CREATE POLICY "Parents can view their assignments"
ON public.parent_student_assignments
FOR SELECT
USING (parent_id = auth.uid());

-- Students can view who their parents are
CREATE POLICY "Students can view their parent assignments"
ON public.parent_student_assignments
FOR SELECT
USING (student_id = auth.uid());

-- Students can create invitation codes (insert their own assignment placeholder)
CREATE POLICY "Students can create parent invitations"
ON public.parent_student_assignments
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Parents can claim invitations (update to add their parent_id)
CREATE POLICY "Parents can claim invitations"
ON public.parent_student_assignments
FOR UPDATE
USING (invitation_code IS NOT NULL AND parent_id = auth.uid());

-- Create schools table for student comparisons
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Everyone can view schools
CREATE POLICY "Anyone can view schools"
ON public.schools
FOR SELECT
USING (true);

-- Add school_id to profiles
ALTER TABLE public.profiles ADD COLUMN school_id uuid REFERENCES public.schools(id);

-- Function to check if user is parent of student
CREATE OR REPLACE FUNCTION public.is_student_parent(_parent_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parent_student_assignments
    WHERE parent_id = _parent_id
      AND student_id = _student_id
  )
$$;

-- Parents can view their children's profiles
CREATE POLICY "Parents can view their children profiles"
ON public.profiles
FOR SELECT
USING (is_student_parent(auth.uid(), user_id));