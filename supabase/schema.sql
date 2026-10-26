-- Job Application Tracker schema
-- Run this whole file once in the Supabase SQL editor.

create extension if not exists pgcrypto;

-- Keeps updated_at current on every update
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- applications: also refresh last_updated on every update
create or replace function public.set_application_timestamps()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  new.last_updated = now();
  return new;
end;
$$;

-- ---------- applications ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company_name text not null check (length(trim(company_name)) > 0),
  job_title text not null check (length(trim(job_title)) > 0),
  job_category text check (job_category in ('Data Analyst','Business Analyst','Business Intelligence','Software Development','Other')),
  job_type text check (job_type in ('Full-time','Part-time','Internship','Contract')),
  work_mode text check (work_mode in ('On-site','Hybrid','Remote')),
  location text,
  job_posting_url text,
  application_source text,
  date_applied date not null,
  recruiter_name text,
  recruiter_email text,
  recruiter_phone text,
  recruiter_linkedin_url text,
  current_status text not null default 'Applied' check (current_status in ('Applied','Assessment','Screening','Interview Scheduled','Interviewing','On Hold','Offer Received','Rejected','Withdrawn')),
  current_interview_round text check (current_interview_round in ('HR','Technical','Managerial','Assignment Review','Final','Other')),
  next_follow_up_date date,
  follow_up_notes text,
  general_notes text,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on public.applications(user_id);
create index applications_status_idx on public.applications(current_status);
create index applications_date_applied_idx on public.applications(date_applied);
create index applications_follow_up_idx on public.applications(next_follow_up_date);

create trigger applications_updated_at before update on public.applications
for each row execute function public.set_application_timestamps();

-- ---------- interviews ----------
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  interview_round text check (interview_round in ('HR','Technical','Managerial','Assignment Review','Final','Other')),
  interview_datetime timestamptz,
  time_zone text,
  interview_mode text check (interview_mode in ('Video','Phone','On-site','Other')),
  meeting_link_or_venue text,
  interviewer_name text,
  interviewer_email text,
  interview_status text not null default 'Scheduled' check (interview_status in ('Scheduled','Rescheduled','Completed','Cancelled')),
  interview_outcome text not null default 'Pending' check (interview_outcome in ('Pending','Cleared','Rejected','Awaiting Response')),
  preparation_notes text,
  questions_asked text,
  feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interviews_user_id_idx on public.interviews(user_id);
create index interviews_application_id_idx on public.interviews(application_id);
create index interviews_datetime_idx on public.interviews(interview_datetime);
create index interviews_status_idx on public.interviews(interview_status);

create trigger interviews_updated_at before update on public.interviews
for each row execute function public.set_updated_at();

-- ---------- application_history ----------
create table public.application_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  old_status text check (old_status in ('Applied','Assessment','Screening','Interview Scheduled','Interviewing','On Hold','Offer Received','Rejected','Withdrawn')),
  new_status text not null check (new_status in ('Applied','Assessment','Screening','Interview Scheduled','Interviewing','On Hold','Offer Received','Rejected','Withdrawn')),
  note text,
  changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index history_user_id_idx on public.application_history(user_id);
create index history_application_id_idx on public.application_history(application_id);
create index history_new_status_idx on public.application_history(new_status);

create trigger history_updated_at before update on public.application_history
for each row execute function public.set_updated_at();

-- ---------- Access ----------
grant select, insert, update, delete on public.applications, public.interviews, public.application_history to authenticated;
grant all on public.applications, public.interviews, public.application_history to service_role;

-- ---------- Row Level Security: owner-only ----------
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.application_history enable row level security;

create policy "own applications select" on public.applications for select to authenticated using (user_id = auth.uid());
create policy "own applications insert" on public.applications for insert to authenticated with check (user_id = auth.uid());
create policy "own applications update" on public.applications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own applications delete" on public.applications for delete to authenticated using (user_id = auth.uid());

create policy "own interviews select" on public.interviews for select to authenticated using (user_id = auth.uid());
create policy "own interviews insert" on public.interviews for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "own interviews update" on public.interviews for update to authenticated using (user_id = auth.uid()) with check (
  user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "own interviews delete" on public.interviews for delete to authenticated using (user_id = auth.uid());

create policy "own history select" on public.application_history for select to authenticated using (user_id = auth.uid());
create policy "own history insert" on public.application_history for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "own history update" on public.application_history for update to authenticated using (user_id = auth.uid()) with check (
  user_id = auth.uid() and exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "own history delete" on public.application_history for delete to authenticated using (user_id = auth.uid());