# Checkpoint 1 – Database setup

1. Create a project at supabase.com (free tier is fine).
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**. It should say "Success. No rows returned".
3. Create your login: **Authentication → Users → Add user → Create new user**. Enter your email and password and tick **Auto Confirm User**.
4. Turn off public sign-ups: **Authentication → Sign In / Providers** — keep Email enabled and switch off **Allow new users to sign up**.
5. Copy your keys from **Project Settings → API**: the Project URL and the anon/publishable key. You'll paste them into `.env` in checkpoint 2.

## Verify before continuing
- [ ] Table Editor shows `applications`, `interviews`, `application_history`.
- [ ] Each table shows "RLS enabled" with 4 policies.
- [ ] Your user appears under Authentication → Users as confirmed.
- [ ] Optional test: in the SQL editor run
  ```sql
  insert into applications (user_id, company_name, job_title, date_applied, job_type)
  values ((select id from auth.users limit 1), 'X', 'Y', current_date, 'Weekly');
  ```
  It must fail with a check-constraint error on `job_type` (`applications_job_type_check`).

I can't access your Supabase project, so I couldn't run these checks myself.
