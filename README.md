# Job Application Tracker

A complete personal tracker built with React, JavaScript, React Router, Vite, Tailwind CSS, and an external hosted PostgreSQL/auth project. No custom server, permanent mock data, logos, social login, signup page, sign-out feature, charts, or notifications.

## Included
- Email/password login and protected dashboard, applications, detail/edit, interviews, follow-ups, and widget pages.
- Application create/edit/view/delete with confirmation, required-field checks, optional null-normalized values, search, combined filters, sortable table, recruiter contacts, notes and final outcome.
- Atomic chronological status history with optional notes and stale-edit protection.
- Multiple independent interview rounds; schedule, edit, reschedule, complete or cancel using the Status dropdown; outcomes, questions, preparation, and feedback retained.
- Six database-backed dashboard totals, upcoming interviews, recently updated applications, and follow-ups due.
- Inline follow-up dates/notes grouped into Due Today, Overdue, Upcoming.
- Protected `/widget` without a sidebar: active count, next interview, follow-ups due, quick add, and full-tracker link.
- Basic PWA manifest and plain solid-color installation icons. No offline mode or service worker; private responses are never cached by this app.

## Requirements
Use Node.js 22.12+ (Node 24 LTS recommended), npm, and your existing hosted project. The included package lock pins the tested package versions.

## Database setup
**Already used an earlier version:** keep your tables and data. Run `supabase/upgrade-existing.sql` in the SQL editor if you have not already installed the application's atomic save function. It is safe to rerun this function-only file. Do not rerun the full schema over existing tables.

**New empty database:** run `supabase/schema.sql` once. It creates the applications, interviews, history, CHECK constraints, indexes, timestamp triggers, owner-only policies and atomic save function. Do not run both SQL files on a new database; the schema includes the function.

Create your email/password account through the service's Authentication Users screen and confirm its email. Disable new user signups in Authentication settings. These account settings cannot be established by the schema file. There is deliberately no signup or sign-out page.

Every row belongs to its authenticated owner. Child inserts/updates also verify parent ownership. Application saves use a SECURITY INVOKER function: no privileged key is needed. Changing an application status never edits interview records. Deleting an application permanently cascades to its interviews/history.

## Local setup
Extract `job-tracker-full.zip` and open a terminal in the extracted `job-tracker` folder.

```bash
npm install
```

Copy your earlier `.env` into this folder, or create one:

macOS/Linux:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Set the project URL and public anonymous/publishable key in `.env`:

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLIC-KEY
```

Never put a service-role/secret key in this file. `.env` is ignored and not included in the download. Restart the local server after changing environment variables.

```bash
npm test
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). Sign in with the confirmed account you created.

Production check:
```bash
npm run build
npm run preview
```

Deploy the `dist` folder to a static HTTPS host; configure an SPA fallback to `/index.html` for all page paths. Without it, refreshes on detail/widget/interviews paths can return a host 404. Supply the same two public environment variables at build time. This archive contains source, not a deployed site.

## Time zones and counts
Interview date/time inputs are wall times in the **Time zone (IANA)** field, for example `Asia/Kolkata` or `Europe/London`. The app stores UTC instants and displays them in the recorded interview zone. Editing preserves that zone. Ambiguous/nonexistent daylight-saving times are rejected instead of silently shifted. Follow-up dates are calendar dates; due groups use your browser's current local date.

Dashboard Interviews counts applications whose status is Interview Scheduled or Interviewing, not the number of rounds. Assessments and Screenings combines those two statuses. The widget's active count excludes Offer Received, Rejected, and Withdrawn. Upcoming interview lists include only future Scheduled/Rescheduled rounds; completed and cancelled rounds remain in All rounds and outcomes and application details.

## Installation / compact view
Open `/widget` for a small browser window. On an HTTPS deployment, use your browser's Install app or Add to Home Screen option when available. The installed app opens `/widget` and still requires login. Browser availability varies. This is not a native Windows widget and has no desktop packaging or offline data mode.

## Verification
Automated tests: **35 passed**, covering form normalization, required values, search/filter/sort, dashboard counts, follow-up boundaries, active counts, upcoming rounds, and time-zone/DST conversion. The full production bundle compiled. Desktop and compact screenshots were inspected.

Browser verification used simulated login/API responses: application create/edit/history/read-back, two independent interview rounds, rescheduling, completion/outcome, follow-up edits/read-back, dashboard, sidebar-free compact view, manifest/icons. A prior isolated PostgreSQL-compatible test verified the same included schema/function, atomic history saves, owner isolation, timestamp refresh, preserved interviews, stale-edit rejection, and cascading deletion.

**Not verified against your real hosted account:** login settings, real credentials, deployed permissions, hosted persistence, actual browser installation prompt, and cross-account data isolation. No account connection or private credentials were available. Use this final checklist:

- [ ] Correct password logs in; incorrect password displays an error; refresh keeps your session.
- [ ] Private-window visits to every non-login path redirect to login, including `/widget` and deep application paths.
- [ ] Create an application with only required fields, refresh, edit, refresh again; optional blank fields save without constraint errors.
- [ ] Search company/title/recruiter, combine filters, clear them, and toggle every sort heading.
- [ ] Change application status with a note; chronological history persists. Notes-only changes add no duplicate status history.
- [ ] Schedule two rounds; reschedule one, complete it with an outcome, cancel another; all records remain in All rounds and outcomes and in details.
- [ ] Change application status again; all interview feedback/rounds remain intact.
- [ ] Compare dashboard counts against table rows; verify upcoming interview order.
- [ ] Set follow-ups yesterday/today/tomorrow; verify groups. Edit or clear dates/notes inline and refresh.
- [ ] Compare widget counts and next interview to the main pages; Quick add saves an application into the same database.
- [ ] In two tabs, save one edit, then attempt an older edit; stale application/interview/follow-up saves are rejected.
- [ ] Cancel then confirm deletion of a disposable application; confirm its child rows disappear only after confirmation.
- [ ] Check a narrow window: Menu opens/closes, fields fit, and tables scroll horizontally.
- [ ] On HTTPS, check the manifest/icons and browser install option; launch the installed app and refresh a deep link.

## Source tree
The source includes the requested `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`, `.env.example`, `.gitignore`; all seven pages, application components, database/auth services, schema and upgrade SQL, tests, and PWA assets. No dependencies, build output, private environment file or Git metadata is shipped.
