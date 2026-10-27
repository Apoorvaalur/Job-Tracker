import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCachedApplications, listApplications, groupFollowUps, updateFollowUp } from '../services/database.js'

function FollowUpRow({ application, overdue, onSaved }) {
  const [date, setDate] = useState(application.next_follow_up_date || '')
  const [notes, setNotes] = useState(application.follow_up_notes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('')
    try { const saved = await updateFollowUp(application, { next_follow_up_date: date, follow_up_notes: notes }); onSaved(saved) } catch (err) { setError(err.message) } finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="grid items-start gap-3 border-t border-subtle py-4 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_2fr_auto]" aria-label={`Follow-up for ${application.company_name}`}>
    <div><Link className="font-medium underline" to={`/applications/${application.id}`}>{application.company_name}</Link><p className="text-sm text-muted">{application.job_title}</p>{overdue && <span className="text-sm font-medium text-danger">Overdue</span>}</div>
    <label className="text-sm">Follow-up date<input type="date" disabled={saving} className={`mt-1 w-full rounded-md border border-subtle bg-surface px-3 py-2 ${overdue ? 'text-danger' : ''}`} value={date} onChange={e => setDate(e.target.value)} /></label>
    <label className="text-sm">Follow-up notes<textarea rows={2} disabled={saving} className="mt-1 w-full rounded-md border border-subtle bg-surface px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} /></label>
    <button disabled={saving} className="mt-6 rounded-md bg-btn-primary px-4 py-2 text-sm text-btn-text disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
    {error && <p role="alert" className="text-sm text-danger sm:col-span-2 lg:col-span-4">{error}</p>}
  </form>
}
export default function FollowUps() {
  const [rows, setRows] = useState(getCachedApplications)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  useEffect(() => { let active = true; setError(''); listApplications().then(data => { if (active) setRows(data) }).catch(err => { if (active) setError(err.message) }); return () => { active = false } }, [retry])
  if (error) return <p role="alert" className="text-danger">{error} <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>
  if (!rows) return <p role="status">Loading follow-ups…</p>
  const groups = groupFollowUps(rows)
  return <div className="space-y-7"><h2 className="text-xl font-semibold">Follow-ups</h2>{[['today', 'Due Today'], ['overdue', 'Overdue'], ['upcoming', 'Upcoming']].map(([key, title]) => <section key={key}><h3 className={`mb-3 font-semibold ${key === 'overdue' ? 'text-danger' : ''}`}>{title} <span className="text-sm text-muted">({groups[key].length})</span></h3>{groups[key].length ? groups[key].map(row => <FollowUpRow key={`${row.id}-${row.updated_at}`} application={row} overdue={key === 'overdue'} onSaved={saved => setRows(previous => previous.map(item => item.id === saved.id ? { ...item, ...saved } : item))} />) : <p className="text-sm text-muted">No follow-ups.</p>}</section>)}</div>
}
