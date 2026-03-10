-- ─────────────────────────────────────────────────────────────────────────────
-- Missing tables (all created with IF NOT EXISTS so it is safe to run against
-- a database that already has these tables from the Supabase dashboard)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── student_profiles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grade            TEXT,
  graduation_year  INTEGER,
  phone            TEXT,
  gpa              NUMERIC,
  sat_score        INTEGER,
  act_score        INTEGER,
  parent_name      TEXT,
  parent_email     TEXT,
  parent_phone     TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own profile"
  ON public.student_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Counselors can view their students student_profiles"
  ON public.student_profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), user_id)
  );

CREATE POLICY "Counselors can update their students student_profiles"
  ON public.student_profiles FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), user_id)
  );

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── counselor_profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.counselor_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone               TEXT,
  bio                 TEXT,
  title               TEXT,
  years_of_experience INTEGER,
  specialization      TEXT,
  max_students        INTEGER,
  certifications      TEXT[],
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.counselor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can manage their own counselor_profile"
  ON public.counselor_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Students can view their counselor profile"
  ON public.counselor_profiles FOR SELECT
  USING (public.is_student_counselor(user_id, auth.uid()));

CREATE TRIGGER update_counselor_profiles_updated_at
  BEFORE UPDATE ON public.counselor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── counselor_invites ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.counselor_invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code  TEXT NOT NULL UNIQUE,
  counselor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.counselor_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can manage their own invites"
  ON public.counselor_invites FOR ALL
  USING (counselor_id = auth.uid());

CREATE POLICY "Anyone can read active invites"
  ON public.counselor_invites FOR SELECT
  USING (is_active = TRUE);

-- ── extracurriculars ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.extracurriculars (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity   TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.extracurriculars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own extracurriculars"
  ON public.extracurriculars FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can view their students extracurriculars"
  ON public.extracurriculars FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

-- ── meeting_notes ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_date  TIMESTAMP WITH TIME ZONE NOT NULL,
  summary       TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can manage their meeting notes"
  ON public.meeting_notes FOR ALL
  USING (counselor_id = auth.uid());

CREATE POLICY "Students can view their meeting notes"
  ON public.meeting_notes FOR SELECT
  USING (student_id = auth.uid());

-- ── milestones ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date     TIMESTAMP WITH TIME ZONE,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own milestones"
  ON public.milestones FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can manage their students milestones"
  ON public.milestones FOR ALL
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

-- ── target_schools ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.target_schools (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.target_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own target_schools"
  ON public.target_schools FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can view their students target_schools"
  ON public.target_schools FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

-- ── tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  task         TEXT NOT NULL,
  due_date     TIMESTAMP WITH TIME ZONE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own tasks"
  ON public.tasks FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can manage their students tasks"
  ON public.tasks FOR ALL
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── applications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name               TEXT NOT NULL,
  application_type          TEXT NOT NULL,
  deadline_date             TIMESTAMP WITH TIME ZONE NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'in_progress',
  program                   TEXT,
  notes                     TEXT,
  required_essays           INTEGER NOT NULL DEFAULT 0,
  completed_essays          INTEGER NOT NULL DEFAULT 0,
  recommendations_requested INTEGER NOT NULL DEFAULT 0,
  recommendations_submitted INTEGER NOT NULL DEFAULT 0,
  completion_percentage     NUMERIC NOT NULL DEFAULT 0,
  urgent                    BOOLEAN NOT NULL DEFAULT FALSE,
  ai_score_avg              NUMERIC,
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own applications"
  ON public.applications FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can view their students applications"
  ON public.applications FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

CREATE POLICY "Counselors can update their students applications"
  ON public.applications FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── application_essays ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.application_essays (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  essay_label       TEXT NOT NULL,
  essay_prompt      TEXT,
  word_limit        INTEGER,
  essay_feedback_id UUID REFERENCES public.essay_feedback(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'not_started',
  display_order     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.application_essays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own application_essays"
  ON public.application_essays FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can view their students application_essays"
  ON public.application_essays FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

CREATE TRIGGER update_application_essays_updated_at
  BEFORE UPDATE ON public.application_essays
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── submitted_applications ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submitted_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitted_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  essay_snapshots  JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.submitted_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own submitted_applications"
  ON public.submitted_applications FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Counselors can view their students submitted_applications"
  ON public.submitted_applications FOR SELECT
  USING (
    public.has_role(auth.uid(), 'counselor')
    AND public.is_student_counselor(auth.uid(), student_id)
  );

-- ── essay_feedback_history ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.essay_feedback_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id         UUID NOT NULL REFERENCES public.essay_feedback(id) ON DELETE CASCADE,
  student_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version          INTEGER NOT NULL DEFAULT 1,
  feedback_items   JSONB,
  manual_notes     TEXT,
  personal_message TEXT,
  ai_analysis      JSONB,
  status           TEXT NOT NULL DEFAULT 'draft',
  sent_at          TIMESTAMP WITH TIME ZONE,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.essay_feedback_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counselors can manage essay_feedback_history they created"
  ON public.essay_feedback_history FOR ALL
  USING (counselor_id = auth.uid());

CREATE POLICY "Students can view their essay_feedback_history"
  ON public.essay_feedback_history FOR SELECT
  USING (student_id = auth.uid());

-- ── conversations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'urgent', 'archived')),
  tags         TEXT[],
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ── messages ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
