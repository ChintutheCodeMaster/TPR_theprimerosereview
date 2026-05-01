create table if not exists public.feedback_student (
  id uuid default gen_random_uuid() primary key,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text,
  feedback_text text not null,
  rating integer check (rating >= 1 and rating <= 5),
  category text,
  mood text,
  created_at timestamptz default now()
);

alter table public.feedback_student enable row level security;

create policy "Students can insert own feedback"
  on public.feedback_student for insert
  with check (auth.uid() = student_id);

create policy "Students can view own feedback"
  on public.feedback_student for select
  using (auth.uid() = student_id);
