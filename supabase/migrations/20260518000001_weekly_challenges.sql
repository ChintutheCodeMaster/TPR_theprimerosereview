-- Weekly challenges table: one row per challenge period
create table if not exists public.weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_number int not null,
  title text not null,
  theme text not null,
  description text not null,
  example_prompt text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Student hook submissions: one per student per challenge (enforced by unique constraint)
create table if not exists public.challenge_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.weekly_challenges(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  hook_text text not null,
  ai_scores jsonb,
  submitted_at timestamptz not null default now(),
  unique(challenge_id, student_id)
);

-- Enable RLS
alter table public.weekly_challenges enable row level security;
alter table public.challenge_submissions enable row level security;

-- Policies: weekly_challenges
create policy "Authenticated users can view challenges"
  on public.weekly_challenges for select
  to authenticated
  using (true);

-- Policies: challenge_submissions
create policy "Authenticated users can view all submissions"
  on public.challenge_submissions for select
  to authenticated
  using (true);

create policy "Students can insert their own submission"
  on public.challenge_submissions for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Students can update their own submission"
  on public.challenge_submissions for update
  to authenticated
  using (auth.uid() = student_id);

-- Seed: Week 1 challenge (runs for 7 days from migration time)
insert into public.weekly_challenges (week_number, title, theme, description, example_prompt, starts_at, ends_at, is_active)
values (
  1,
  'Week 1: The Defining Moment',
  'A moment that changed everything',
  'Write a powerful hook — just 1 to 3 sentences — that opens a college essay about a defining moment in your life. Your hook should immediately grab the reader''s attention and make them hungry to read more. No build-up, no context: drop us right into the moment.',
  'Think of a moment — big or small — that shifted how you see yourself or the world. Open right in the middle of that moment, or with a striking image, a sharp question, or a surprising fact.',
  now(),
  now() + interval '7 days',
  true
);
