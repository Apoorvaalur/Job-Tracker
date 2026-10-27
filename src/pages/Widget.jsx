import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import ApplicationForm from '../components/ApplicationForm.jsx'
import { formatInterview, getCachedApplications, listApplications, activeCount, allUpcomingInterviews, groupFollowUps, saveApplication } from '../services/database.js'

export default function Widget() {
  const [rows, setRows] = useState(getCachedApplications)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [adding, setAdding] = useState(false)
  useEffect(() => { let active = true; setError(''); listApplications().then(data => { if (active) setRows(data) }).catch(err => { if (active) setError(err.message) }); return () => { active = false } }, [retry])
  const next = rows ? allUpcomingInterviews(rows)[0] : null
  const groups = rows ? groupFollowUps(rows) : null
  return <div className="flex min-h-screen flex-col"><main className="mx-auto w-full max-w-2xl flex-1 space-y-5 p-4"><header className="flex flex-wrap justify-between gap-3 border-b border-subtle pb-3"><h1 className="text-lg font-semibold">Job Application Tracker</h1><Link className="text-sm underline" to="/">Open full tracker</Link></header>
    {error && <p role="alert" className="text-danger">{error} <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!rows ? !error && <p role="status">Loading…</p> : adding ? <ApplicationForm onSave={async values => { await saveApplication(values); setAdding(false); setRetry(value => value + 1) }} onCancel={() => setAdding(false)} /> : <>
      <div className="flex items-center justify-between border-b border-subtle pb-4"><h2 className="font-medium">Active applications</h2><span className="text-3xl font-semibold tabular-nums">{activeCount(rows)}</span></div>
      <section><h2 className="mb-2 font-medium">Next interview</h2>{next ? <><Link className="underline" to={`/applications/${next.application.id}`}>{next.application.company_name} — {next.application.job_title}</Link><p className="mt-1 text-sm text-muted">{next.interview_round || 'Unspecified round'} · {formatInterview(next.interview_datetime, next.time_zone)}</p></> : <p className="text-sm text-muted">No upcoming interviews.</p>}</section>
      <section className="border-t border-subtle pt-4"><h2 className="mb-2 font-medium">Follow-ups due</h2><Link to="/follow-ups" className="underline">{groups.today.length + groups.overdue.length} due</Link>{groups.overdue.length > 0 && <p className="mt-1 text-sm text-danger">{groups.overdue.length} overdue</p>}</section>
      <button className="w-full rounded-md bg-btn-primary px-4 py-2 text-sm text-btn-text" onClick={() => setAdding(true)}>Quick add application</button>
    </>}
  </main><Footer /></div>
}
