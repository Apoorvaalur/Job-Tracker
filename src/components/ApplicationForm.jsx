import { useState } from 'react'
import { applicationFields, categories, jobTypes, workModes, statuses, rounds } from '../services/database.js'

const groups = [
  ['Job details', ['company_name', 'job_title', 'date_applied', 'job_category', 'job_type', 'work_mode', 'location', 'job_posting_url', 'application_source']],
  ['Recruiter contact', ['recruiter_name', 'recruiter_email', 'recruiter_phone', 'recruiter_linkedin_url']],
  ['Status and follow-up', ['current_status', 'current_interview_round', 'next_follow_up_date', 'follow_up_notes', 'general_notes']],
]
const choices = { job_category: categories, job_type: jobTypes, work_mode: workModes, current_status: statuses, current_interview_round: rounds }
const required = ['company_name', 'job_title', 'date_applied']
const label = key => key.split('_').map(word => word === 'url' ? 'URL' : word[0].toUpperCase() + word.slice(1)).join(' ')
const control = 'w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-btn-primary'

export default function ApplicationForm({ application, onSave, onCancel }) {
  const [values, setValues] = useState(() => Object.fromEntries(applicationFields.map(key => [key, application?.[key] ?? ''])))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try { await onSave(values, note) } catch (err) { setError(err.message) } finally { setSaving(false) }
  }
  return <form onSubmit={submit} className="application-form space-y-6" aria-label={application ? 'Edit application' : 'Add application'}>
    {groups.map(([title, fields]) => <fieldset disabled={saving} key={title}>
      <legend className="mb-3 font-semibold">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(key => <div key={key} className={key.endsWith('notes') ? 'sm:col-span-2' : ''}>
          <label className="mb-1 block text-sm" htmlFor={key}>{label(key)}{required.includes(key) ? ' *' : ''}</label>
          {choices[key] ? <select id={key} className={control} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })}>
            <option value="">{key === 'current_status' ? 'Applied (default)' : 'Not specified'}</option>
            {choices[key].map(value => <option key={value}>{value}</option>)}
          </select> : key.endsWith('notes') ? <textarea id={key} rows={3} className={control} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })} /> :
            <input id={key} className={control} required={required.includes(key)} type={key.includes('date') ? 'date' : key.endsWith('email') ? 'email' : key.endsWith('url') ? 'url' : key.endsWith('phone') ? 'tel' : 'text'} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })} />}
        </div>)}
      </div>
    </fieldset>)}
    {application && (values.current_status || 'Applied') !== application.current_status && <div>
      <label htmlFor="status-note" className="mb-1 block text-sm">Status change note</label>
      <textarea id="status-note" rows={2} className={control} value={note} onChange={e => setNote(e.target.value)} disabled={saving} />
    </div>}
    {error && <p role="alert" className="text-danger">{error}</p>}
    <div className="form-actions flex flex-wrap gap-3">
      <button disabled={saving} className="rounded-md bg-btn-primary px-4 py-2 text-sm text-btn-text disabled:opacity-60">{saving ? 'Saving…' : 'Save application'}</button>
      <button type="button" disabled={saving} onClick={onCancel} className="rounded-md border border-subtle px-4 py-2 text-sm">Cancel</button>
    </div>
  </form>
}
