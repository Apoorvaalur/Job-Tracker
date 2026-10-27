-- Run on an existing tracker database to install or refresh the save function.
-- New databases: run schema.sql instead (it already includes this function).
-- SECURITY INVOKER retains the caller's owner-only RLS policies.
create or replace function public.save_application(
  p_id uuid,
  p_values jsonb,
  p_note text default null,
  p_expected_updated_at timestamptz default null
) returns public.applications
language plpgsql
security invoker
set search_path = ''
as $$
declare
  previous public.applications;
  incoming public.applications;
  saved public.applications;
begin
  if auth.uid() is null then
    raise exception 'Please log in before saving an application.';
  end if;
  incoming := jsonb_populate_record(null::public.applications, p_values);
  incoming.current_status := coalesce(incoming.current_status, 'Applied');
  if p_id is null then
    insert into public.applications (
      company_name, job_title, date_applied, job_category, job_type, work_mode,
      location, job_posting_url, application_source, recruiter_name, recruiter_email,
      recruiter_phone, recruiter_linkedin_url, current_status, current_interview_round,
      next_follow_up_date, follow_up_notes, general_notes
    ) values (
      incoming.company_name, incoming.job_title, incoming.date_applied, incoming.job_category,
      incoming.job_type, incoming.work_mode, incoming.location, incoming.job_posting_url,
      incoming.application_source, incoming.recruiter_name, incoming.recruiter_email,
      incoming.recruiter_phone, incoming.recruiter_linkedin_url, incoming.current_status,
      incoming.current_interview_round, incoming.next_follow_up_date, incoming.follow_up_notes,
      incoming.general_notes
    ) returning * into saved;
  else
    select * into previous from public.applications
    where id = p_id and user_id = auth.uid() for update;
    if not found then
      raise exception 'Application not found or access denied.';
    end if;
    if p_expected_updated_at is null or previous.updated_at <> p_expected_updated_at then
      raise exception 'This application changed since you opened it. Reload the page before saving.';
    end if;
    update public.applications set
      company_name = incoming.company_name, job_title = incoming.job_title,
      date_applied = incoming.date_applied, job_category = incoming.job_category,
      job_type = incoming.job_type, work_mode = incoming.work_mode, location = incoming.location,
      job_posting_url = incoming.job_posting_url, application_source = incoming.application_source,
      recruiter_name = incoming.recruiter_name, recruiter_email = incoming.recruiter_email,
      recruiter_phone = incoming.recruiter_phone, recruiter_linkedin_url = incoming.recruiter_linkedin_url,
      current_status = incoming.current_status, current_interview_round = incoming.current_interview_round,
      next_follow_up_date = incoming.next_follow_up_date, follow_up_notes = incoming.follow_up_notes,
      general_notes = incoming.general_notes
    where id = p_id and user_id = auth.uid() returning * into saved;
  end if;
  if p_id is null or previous.current_status is distinct from saved.current_status then
    insert into public.application_history (application_id, old_status, new_status, note)
    values (saved.id, previous.current_status, saved.current_status, nullif(btrim(p_note), ''));
  end if;
  return saved;
end;
$$;

revoke all on function public.save_application(uuid, jsonb, text, timestamptz) from public, anon;
grant execute on function public.save_application(uuid, jsonb, text, timestamptz) to authenticated;
