import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SummaryCard from '../components/SummaryCard.jsx'
import { formatInterview, getCachedApplications, listApplications, summaryCounts, allUpcomingInterviews, groupFollowUps, localDate } from '../services/database.js'

export default function Dashboard() {
  const [rows, setRows] = useState(getCachedApplications)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    setError('')
    listApplications().then(data => { if (active) setRows(data) }).catch(err => { if (active) setError(err.message) })
    return () => { active = false }
  }, [retry])
  if (error) return <p role="alert" className="text-danger">{error} <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>
  if (!rows) return <p role="status">Loading dashboard…</p>
  const interviews = allUpcomingInterviews(rows).slice(0, 5)
  const followUps = groupFollowUps(rows)
  const due = [...followUps.overdue, ...followUps.today]
  const recent = [...rows].sort((a, b) => b.last_updated.localeCompare(a.last_updated)).slice(0, 5)
  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Dashboard</h2><div className="flex flex-wrap gap-3 text-sm"><Link to="/applications/new" className="rounded-md bg-btn-primary px-4 py-2 text-btn-text">Add Application</Link><Link to="/widget" className="self-center underline">Compact view</Link></div></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(summaryCounts(rows)).map(([title, count]) => <SummaryCard key={title} title={title} count={count} />)}</div>
    <section className="border-t border-subtle pt-5"><h3 className="mb-4 font-semibold">Upcoming Interviews</h3>{interviews.length ? <ul className="divide-y divide-subtle">{interviews.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3"><Link className="underline" to={`/applications/${item.application.id}`}>{item.application.company_name} — {item.application.job_title}</Link><span className="text-sm text-muted">{item.interview_round || 'Unspecified round'} · {formatInterview(item.interview_datetime, item.time_zone)}</span></li>)}</ul> : <p className="text-muted">No upcoming interviews.</p>}</section>
    <section className="border-t border-subtle pt-5"><h3 className="mb-4 font-semibold">Recently Updated Applications</h3>{recent.length ? <ul className="divide-y divide-subtle">{recent.map(row => <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3"><Link className="underline" to={`/applications/${row.id}`}>{row.company_name} — {row.job_title}</Link><span className="text-sm text-muted">{row.current_status} · {new Date(row.last_updated).toLocaleString()}</span></li>)}</ul> : <p className="text-muted">No applications yet.</p>}</section>
    <section className="border-t border-subtle pt-5"><h3 className="mb-4 font-semibold">Follow-ups Due</h3>{due.length ? <ul className="divide-y divide-subtle">{due.map(row => <li key={row.id} className="flex flex-wrap justify-between gap-2 py-3"><Link className="underline" to="/follow-ups">{row.company_name} — {row.job_title}</Link><span className={row.next_follow_up_date < localDate() ? 'text-danger' : 'text-muted'}>{row.next_follow_up_date}</span></li>)}</ul> : <p className="text-muted">No follow-ups due.</p>}</section>
  </div>
}
