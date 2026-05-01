create table if not exists public.school_at_risk_criteria (
  school_id                  uuid    primary key references public.schools(id) on delete cascade,
  at_risk_threshold          integer not null default 40,
  needs_attention_threshold  integer not null default 70,
  essay_weight               integer not null default 60,
  rec_weight                 integer not null default 40,
  trigger_no_essays          boolean not null default true,
  trigger_low_completion     boolean not null default true,
  trigger_many_deadlines     boolean not null default true,
  deadline_count_threshold   integer not null default 3,
  trigger_no_recs            boolean not null default true,
  updated_at                 timestamptz default now()
);

alter table public.school_at_risk_criteria enable row level security;

-- Principal (or any staff) can read and write criteria for their own school
create policy "School members can manage at-risk criteria"
  on public.school_at_risk_criteria
  for all
  using (
    school_id in (
      select school_id from public.profiles where user_id = auth.uid()
    )
  )
  with check (
    school_id in (
      select school_id from public.profiles where user_id = auth.uid()
    )
  );
