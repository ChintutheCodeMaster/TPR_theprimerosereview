-- Applications: archive support
alter table public.applications
  add column if not exists archived boolean not null default false;

create index if not exists applications_archived_idx
  on public.applications (student_id, archived);

-- Essay slots: limit type enum + column on slots and drafts
do $$ begin
  create type public.essay_limit_type as enum ('words','chars_with_spaces','chars_no_spaces');
exception when duplicate_object then null; end $$;

alter table public.application_essays
  add column if not exists limit_type public.essay_limit_type not null default 'words';

alter table public.essay_feedback
  add column if not exists limit_type public.essay_limit_type not null default 'words';
