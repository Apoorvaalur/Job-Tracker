import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatInterview, getCachedApplications, listApplications, saveInterview, rounds, interviewModes, interviewStatuses, interviewOutcomes, interviewFields, localDateTime } from '../services/database.js'

const control = 'w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-btn-primary'
const choices = { interview_round: rounds, interview_mode: interviewModes, interview_status: interviewStatuses, interview_outcome: interviewOutcomes }
const label = key => key.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
function InterviewForm({ rows, interview, applicationId, onSave, onCancel }) {
  const [values, setValues] = useState(() => ({ ...Object.fromEntries(interviewFields.map(key => [key, interview?.[key] ?? ''])), application_id: interview?.application_id || applicationId || '', interview_datetime: localDateTime(interview?.interview_datetime, interview?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone), time_zone: interview?.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone }))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('')
    try { const saved = await saveInterview(values, interview); onSave(saved) } catch (err) { setError(err.message) } finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="max-w-3xl space-y-4" aria-label={interview ? 'Edit interview' : 'Schedule interview'}>
    <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
      <legend className="mb-4 font-semibold">{interview ? 'Edit interview' : 'Schedule interview'}</legend>
      <label className="text-sm sm:col-span-2">Application *<select required className={control} value={values.application_id} disabled={Boolean(interview)} onChange={e => setValues({ ...values, application_id: e.target.value })}><option value="">Select application</option>{rows.map(row => <option value={row.id} key={row.id}>{row.company_name} — {row.job_title}</option>)}</select></label>
      {interviewFields.filter(key => key !== 'application_id').map(key => <label className={`text-sm ${['preparation_notes', 'questions_asked', 'feedback'].includes(key) ? 'sm:col-span-2' : ''}`} key={key}>{key === 'interview_datetime' ? 'Date and time (interview time zone)' : key === 'time_zone' ? 'Time zone (IANA)' : label(key)}
        {choices[key] ? <select className={control} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })}><option value="">{key === 'interview_status' ? 'Scheduled (default)' : key === 'interview_outcome' ? 'Pending (default)' : 'Not specified'}</option>{choices[key].map(value => <option key={value}>{value}</option>)}</select> : ['preparation_notes', 'questions_asked', 'feedback'].includes(key) ? <textarea className={control} rows={3} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })} /> : <input className={control} type={key === 'interview_datetime' ? 'datetime-local' : key === 'interviewer_email' ? 'email' : 'text'} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })} />}
      </label>)}
    </fieldset>
    {error && <p role="alert" className="text-danger">{error}</p>}
    <div className="flex gap-3"><button disabled={saving} className="rounded-md bg-btn-primary px-4 py-2 text-sm text-btn-text disabled:opacity-60">{saving ? 'Saving…' : 'Save interview'}</button><button type="button" disabled={saving} onClick={onCancel} className="rounded-md border border-subtle px-4 py-2 text-sm">Cancel</button></div>
  </form>
}
export default function Interviews() {
  const [params, setParams] = useSearchParams()
  const [rows, setRows] = useState(getCachedApplications)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(params.has('application'))
  const [view, setView] = useState('upcoming')
  useEffect(() => { let active = true; setError(''); listApplications().then(data => { if (active) setRows(data) }).catch(err => { if (active) setError(err.message) }); return () => { active = false } }, [retry])
  const all = (rows || []).flatMap(row => row.interviews.map(item => ({ ...item, application: row }))).sort((a, b) => (a.interview_datetime || '9999').localeCompare(b.interview_datetime || '9999'))
  const visible = view === 'all' ? all : all.filter(item => item.interview_datetime && Date.parse(item.interview_datetime) >= Date.now() && ['Scheduled', 'Rescheduled'].includes(item.interview_status))
  function close() { setAdding(false); setEditing(null); setParams({}) }
  function saved() { close(); setRetry(value => value + 1) }
  if (!rows) return error ? <p role="alert" className="text-danger">{error} <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p> : <p role="status">Loading interviews…</p>
  return <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Interviews</h2>{!adding && !editing && <button className="rounded-md bg-btn-primary px-4 py-2 text-sm text-btn-text" onClick={() => setAdding(true)}>Schedule interview</button>}</div>
    {error && <p role="alert" className="text-danger">{error}</p>}
    {adding || editing ? rows.length ? <InterviewForm key={editing?.id || 'new'} rows={rows} interview={editing} applicationId={params.get('application')} onSave={saved} onCancel={close} /> : <p>No applications yet. <Link className="underline" to="/applications/new">Add application</Link></p> : <>
      <label className="block max-w-xs text-sm">View<select className={control} value={view} onChange={e => setView(e.target.value)}><option value="upcoming">Upcoming</option><option value="all">All rounds and outcomes</option></select></label>
      {visible.length ? <div className="overflow-x-auto border-y border-subtle"><table className="w-full text-left text-sm"><caption className="sr-only">Interviews</caption><thead className="bg-canvas"><tr>{['Application', 'Date and time', 'Round', 'Status', 'Outcome', 'Actions'].map(title => <th scope="col" className="px-4 py-3" key={title}>{title}</th>)}</tr></thead><tbody>{visible.map(item => <tr key={item.id} className="border-t border-subtle"><td className="px-4 py-4"><Link className="underline" to={`/applications/${item.application.id}`}>{item.application.company_name}</Link><p className="text-muted">{item.application.job_title}</p></td><td className="px-4 py-4">{item.interview_datetime ? formatInterview(item.interview_datetime, item.time_zone) : '—'}<p className="text-muted">{item.time_zone}</p></td><td className="px-4 py-4">{item.interview_round || '—'}</td><td className="px-4 py-4">{item.interview_status}</td><td className="px-4 py-4">{item.interview_outcome}</td><td className="px-4 py-4"><button className="underline" onClick={() => setEditing(item)}>Edit</button></td></tr>)}</tbody></table></div> : <p className="py-6 text-muted">{view === 'upcoming' ? 'No upcoming interviews.' : 'No interviews recorded.'}</p>}
    </>}
  </section>
}
