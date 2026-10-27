import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ApplicationForm from '../components/ApplicationForm.jsx'
import { formatInterview, getApplication, saveApplication, deleteApplication } from '../services/database.js'

function Value({ name, value, url = false }) {
  if (!value) return null
  let safeUrl = false
  try { safeUrl = ['https:', 'http:'].includes(new URL(value).protocol) } catch { /* Show malformed links as text. */ }
  return <div><dt className="text-sm text-muted">{name}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{url && safeUrl ? <a href={value} target="_blank" rel="noopener noreferrer" className="underline">{value}</a> : value}</dd></div>
}
export default function ApplicationDetail({ edit = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    getApplication(id).then(data => { if (active) setApplication(data) }).catch(err => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, retry])
  async function remove() {
    if (!window.confirm(`Permanently delete ${application.company_name} — ${application.job_title}? Its interviews and status history will also be deleted.`)) return
    setDeleting(true); setError('')
    try { await deleteApplication(id); navigate('/applications', { replace: true }) } catch (err) { setError(err.message); setDeleting(false) }
  }
  if (loading) return <p role="status">Loading application…</p>
  if (!application) return <div><p role={error ? 'alert' : undefined}>{error || 'Application not found.'}</p>{error && <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button>}<Link to="/applications" className="ml-3 underline">Back to applications</Link></div>
  if (edit) return <div className="max-w-3xl"><h2 className="mb-6 text-xl font-semibold">Edit application</h2><ApplicationForm key={application.updated_at} application={application} onSave={async (values, note) => { const saved = await saveApplication(values, application, note); setApplication({ ...application, ...saved }); setRetry(value => value + 1); navigate(`/applications/${id}`) }} onCancel={() => navigate(`/applications/${id}`)} /></div>
  const history = [...application.application_history].sort((a, b) => a.changed_at.localeCompare(b.changed_at) || a.id.localeCompare(b.id))
  const interviews = [...application.interviews].sort((a, b) => (a.interview_datetime || a.created_at).localeCompare(b.interview_datetime || b.created_at))
  return <article className="max-w-5xl space-y-7">
    <Link to="/applications" className="text-sm underline">← Applications</Link>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="break-words text-2xl font-semibold">{application.company_name}</h2><p className="break-words text-muted">{application.job_title}</p></div><div className="flex flex-wrap items-center gap-3"><Link to={`/interviews?application=${id}`} className="rounded-md border border-subtle px-4 py-2 text-sm">Schedule interview</Link><Link to={`/applications/${id}/edit`} className="rounded-md bg-btn-primary px-4 py-2 text-sm text-btn-text">Edit application</Link><button disabled={deleting} onClick={remove} className="text-sm text-danger underline">{deleting ? 'Deleting…' : 'Delete'}</button></div></div>
    {error && <p role="alert" className="text-danger">{error}</p>}
    {[
      ['Job details', [['Category', application.job_category], ['Type', application.job_type], ['Work mode', application.work_mode], ['Location', application.location], ['Date applied', application.date_applied], ['Application source', application.application_source], ['Job posting', application.job_posting_url, true]]],
      ['Recruiter contact', [['Name', application.recruiter_name], ['Email', application.recruiter_email], ['Phone', application.recruiter_phone], ['LinkedIn', application.recruiter_linkedin_url, true]]],
      ['Status and outcome', [['Current status', application.current_status], ['Current interview round', application.current_interview_round], ['Final outcome', ['Offer Received', 'Rejected', 'Withdrawn'].includes(application.current_status) ? application.current_status : ''], ['Last updated', new Date(application.last_updated).toLocaleString()]]],
      ['Follow-up and notes', [['Next follow-up', application.next_follow_up_date], ['Follow-up notes', application.follow_up_notes], ['General notes', application.general_notes]]],
    ].filter(([, fields]) => fields.some(([, value]) => value)).map(([title, fields]) => <section key={title} className="border-t border-subtle pt-5"><h3 className="mb-4 font-semibold">{title}</h3><dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{fields.map(([name, value, url]) => <Value key={name} name={name} value={value} url={url} />)}</dl></section>)}
    {history.length > 0 && <section className="border-t border-subtle pt-5"><h3 className="mb-4 font-semibold">Status history</h3><ol className="space-y-4">{history.map(item => <li key={item.id}><p className="font-medium">{item.old_status ? `${item.old_status} → ` : ''}{item.new_status}</p><time className="text-sm text-muted" dateTime={item.changed_at}>{new Date(item.changed_at).toLocaleString()}</time>{item.note && <p className="whitespace-pre-wrap break-words text-sm">{item.note}</p>}</li>)}</ol></section>}
    {interviews.length > 0 && <section className="border-t border-subtle pt-5"><h3 className="mb-4 font-semibold">Interview history</h3><div className="space-y-5">{interviews.map(item => <section key={item.id} className="border-l-2 border-subtle pl-4"><h4 className="mb-3 font-medium">{item.interview_round || 'Unspecified round'}</h4><dl className="grid gap-3 sm:grid-cols-2"><Value name="Date and time" value={item.interview_datetime ? formatInterview(item.interview_datetime, item.time_zone) : null} /><Value name="Time zone" value={item.time_zone} /><Value name="Status" value={item.interview_status} /><Value name="Outcome" value={item.interview_outcome} /><Value name="Mode" value={item.interview_mode} /><Value name="Meeting link or venue" value={item.meeting_link_or_venue} url /><Value name="Interviewer" value={item.interviewer_name} /><Value name="Interviewer email" value={item.interviewer_email} /><Value name="Preparation notes" value={item.preparation_notes} /><Value name="Questions asked" value={item.questions_asked} /><Value name="Feedback" value={item.feedback} /></dl></section>)}</div></section>}
  </article>
}
