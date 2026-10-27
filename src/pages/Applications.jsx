import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApplicationForm from '../components/ApplicationForm.jsx'
import ApplicationTable from '../components/ApplicationTable.jsx'
import { getCachedApplications, listApplications, saveApplication, deleteApplication, selectApplications } from '../services/database.js'

const emptyFilters = { search: '' }
const control = 'w-full rounded-md border border-subtle bg-surface px-3 py-2 text-sm'
export default function Applications({ create = false }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState(() => getCachedApplications() || [])
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState('date_applied')
  const [direction, setDirection] = useState('desc')
  const [loading, setLoading] = useState(() => !getCachedApplications())
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [deleting, setDeleting] = useState('')
  useEffect(() => {
    if (create) return
    let active = true
    setError('')
    listApplications().then(data => { if (active) setRows(data) }).catch(err => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [create, retry])
  const visible = selectApplications(rows, filters, sort, direction)
  function changeFilter(key, value) { setFilters(previous => ({ ...previous, [key]: value })) }
  async function remove(application) {
    if (!window.confirm(`Permanently delete ${application.company_name} — ${application.job_title}? Its interviews and status history will also be deleted.`)) return
    setDeleting(application.id)
    setError('')
    try { await deleteApplication(application.id); setRows(previous => previous.filter(row => row.id !== application.id)) } catch (err) { setError(err.message) } finally { setDeleting('') }
  }
  if (create) return <div className="max-w-3xl"><h2 className="mb-6 text-xl font-semibold">Add application</h2><ApplicationForm onSave={async values => { const application = await saveApplication(values); navigate(`/applications/${application.id}`) }} onCancel={() => navigate('/applications')} /></div>
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Applications</h2></div>
    <div className="max-w-md"><label className="text-sm">Search<input type="search" placeholder="Search by company" className={control} value={filters.search} onChange={e => changeFilter('search', e.target.value)} /></label></div>
    {error && <div role="alert" className="text-danger">{error} <button className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
    {loading ? <p role="status" className="text-muted">Loading applications…</p> : <><p className="text-sm text-muted">{visible.length} of {rows.length} applications</p>{visible.length ? <ApplicationTable applications={visible} sort={sort} direction={direction} onSort={field => { setSort(field); setDirection(sort === field && direction === 'asc' ? 'desc' : 'asc') }} onDelete={remove} deleting={deleting} /> : <p className="py-8 text-muted">{rows.length ? 'No applications match these filters.' : 'No applications yet.'}</p>}</>}
  </section>
}
