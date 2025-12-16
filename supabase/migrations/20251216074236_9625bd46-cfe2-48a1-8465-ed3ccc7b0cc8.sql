-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'counselor', 'admin');

-- Create enum for recommendation request status
CREATE TYPE public.recommendation_status AS ENUM ('draft', 'pending', 'in_progress', 'sent');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);

-- Create student_counselor_assignments table
CREATE TABLE public.student_counselor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counselor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (student_id, counselor_id)
);

-- Create recommendation_requests table
CREATE TABLE public.recommendation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referee_name TEXT NOT NULL,
  referee_role TEXT,
  relationship_duration TEXT,
  relationship_capacity TEXT,
  meaningful_project TEXT,
  best_moment TEXT,
  difficulties_overcome TEXT,
  strengths TEXT[] DEFAULT '{}',
  personal_notes TEXT,
  status recommendation_status DEFAULT 'pending' NOT NULL,
  counselor_notes TEXT,
  generated_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_counselor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if counselor manages student
CREATE OR REPLACE FUNCTION public.is_student_counselor(_counselor_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_counselor_assignments
    WHERE counselor_id = _counselor_id
      AND student_id = _student_id
  )
$$;

-- Get current user's counselor
CREATE OR REPLACE FUNCTION public.get_my_counselor_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT counselor_id
  FROM public.student_counselor_assignments
  WHERE student_id = auth.uid()
  LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors can view their students profiles"
ON public.profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'counselor') 
  AND public.is_student_counselor(auth.uid(), user_id)
);

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Student-counselor assignments RLS policies
CREATE POLICY "Counselors can view their assignments"
ON public.student_counselor_assignments FOR SELECT
USING (counselor_id = auth.uid());

CREATE POLICY "Students can view their counselor assignment"
ON public.student_counselor_assignments FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Counselors can create assignments"
ON public.student_counselor_assignments FOR INSERT
WITH CHECK (
  counselor_id = auth.uid() 
  AND public.has_role(auth.uid(), 'counselor')
);

CREATE POLICY "Counselors can delete their assignments"
ON public.student_counselor_assignments FOR DELETE
USING (
  counselor_id = auth.uid() 
  AND public.has_role(auth.uid(), 'counselor')
);

-- Recommendation requests RLS policies
CREATE POLICY "Students can view their own requests"
ON public.recommendation_requests FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create their own requests"
ON public.recommendation_requests FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their draft requests"
ON public.recommendation_requests FOR UPDATE
USING (student_id = auth.uid() AND status = 'draft');

CREATE POLICY "Counselors can view their students requests"
ON public.recommendation_requests FOR SELECT
USING (
  public.has_role(auth.uid(), 'counselor') 
  AND public.is_student_counselor(auth.uid(), student_id)
);

CREATE POLICY "Counselors can update their students requests"
ON public.recommendation_requests FOR UPDATE
USING (
  public.has_role(auth.uid(), 'counselor') 
  AND public.is_student_counselor(auth.uid(), student_id)
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recommendation_requests_updated_at
  BEFORE UPDATE ON public.recommendation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();