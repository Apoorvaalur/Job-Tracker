import { supabase } from './auth.js'

export const statuses = ['Applied', 'Assessment', 'Screening', 'Interview Scheduled', 'Interviewing', 'On Hold', 'Offer Received', 'Rejected', 'Withdrawn']
export const categories = ['Data Analyst', 'Business Analyst', 'Business Intelligence', 'Software Development', 'Other']
export const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract']
export const workModes = ['On-site', 'Hybrid', 'Remote']
export const rounds = ['HR', 'Technical', 'Managerial', 'Assignment Review', 'Final', 'Other']
export const applicationFields = ['company_name', 'job_title', 'job_category', 'job_type', 'work_mode', 'location', 'job_posting_url', 'application_source', 'date_applied', 'recruiter_name', 'recruiter_email', 'recruiter_phone', 'recruiter_linkedin_url', 'current_status', 'current_interview_round', 'next_follow_up_date', 'follow_up_notes', 'general_notes']

export function cleanForm(values) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() || null : value ?? null]))
}

export function prepareApplication(values) {
  const result = cleanForm(Object.fromEntries(applicationFields.map(key => [key, values[key]])))
  if (!result.company_name || !result.job_title || !result.date_applied) throw new Error('Company name, job title and date applied are required.')
  // An unset status uses the table's default; the database column is NOT NULL.
  result.current_status ||= 'Applied'
  return result
}

export function upcomingInterview(application, now = Date.now()) {
  return (application.interviews || []).filter(item => ['Scheduled', 'Rescheduled'].includes(item.interview_status) && item.interview_datetime && Date.parse(item.interview_datetime) >= now)
    .sort((a, b) => Date.parse(a.interview_datetime) - Date.parse(b.interview_datetime))[0] || null
}

export function selectApplications(rows, filters, sort = 'date_applied', direction = 'desc', now = Date.now()) {
  const search = (filters.search || '').trim().toLowerCase()
  return rows.filter(row => {
    return (!search || [row.company_name, row.job_title, row.recruiter_name].some(value => (value || '').toLowerCase().includes(search))) &&
      (!filters.status || row.current_status === filters.status) &&
      (!filters.category || row.job_category === filters.category) &&
      (!filters.workMode || row.work_mode === filters.workMode) &&
      (!filters.from || row.date_applied >= filters.from) &&
      (!filters.to || row.date_applied <= filters.to) &&
      (!filters.upcoming || upcomingInterview(row, now))
  }).sort((a, b) => {
    const first = sort === 'interview_date' ? upcomingInterview(a, now)?.interview_datetime : sort === 'status' ? a.current_status : a[sort]
    const second = sort === 'interview_date' ? upcomingInterview(b, now)?.interview_datetime : sort === 'status' ? b.current_status : b[sort]
    if (!first && !second) return a.id.localeCompare(b.id)
    if (!first) return 1
    if (!second) return -1
    const result = first.localeCompare(second, undefined, { sensitivity: 'base' })
    return result ? result * (direction === 'asc' ? 1 : -1) : a.id.localeCompare(b.id)
  })
}

// In-memory cache: pages show the last known data instantly and refresh in the background.
let cache = null
let inflight = null
export const getCachedApplications = () => cache
export const clearApplicationCache = () => { cache = null }

async function fetchAllApplications() {
  const rows = []
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('applications').select('*, interviews(*)').order('date_applied', { ascending: false }).order('id').range(offset, offset + 499)
    if (error) throw error
    rows.push(...data)
    if (data.length < 500) return rows
  }
}

export function listApplications() {
  // Share one request between pages that ask at the same time.
  if (!inflight) inflight = fetchAllApplications().then(rows => { cache = rows; return rows }).finally(() => { inflight = null })
  return inflight
}

export async function getApplication(id) {
  const { data, error } = await supabase.from('applications').select('*, interviews(*), application_history(*)').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function saveApplication(values, previous = null, note = '') {
  const payload = prepareApplication(values)
  // One transaction saves the application and its status-history entry together.
  const { data, error } = await supabase.rpc('save_application', {
    p_id: previous?.id || null,
    p_values: payload,
    p_note: cleanForm({ note }).note,
    p_expected_updated_at: previous?.updated_at || null,
  })
  if (error) throw error
  cache = null
  return data
}

export async function deleteApplication(id) {
  const { data, error } = await supabase.from('applications').delete().eq('id', id).select('id').single()
  if (error) throw error
  cache = null
  return data
}

export const interviewModes = ['Video', 'Phone', 'On-site', 'Other']
export const interviewStatuses = ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled']
export const interviewOutcomes = ['Pending', 'Cleared', 'Rejected', 'Awaiting Response']
export const interviewFields = ['application_id', 'interview_round', 'interview_datetime', 'time_zone', 'interview_mode', 'meeting_link_or_venue', 'interviewer_name', 'interviewer_email', 'interview_status', 'interview_outcome', 'preparation_notes', 'questions_asked', 'feedback']

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function localDateTime(instant, zone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  if (!instant) return ''
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant)).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
export function zonedInstant(wallTime, zone) {
  const target = Date.parse(`${wallTime}:00Z`)
  if (!Number.isFinite(target)) throw new Error('Enter a valid interview date and time.')
  try {
    const offsets = new Set([-36, 0, 36].map(hours => {
      const sample = target + hours * 3600000
      return Date.parse(`${localDateTime(new Date(sample).toISOString(), zone)}:00Z`) - sample
    }))
    const matches = [...offsets].map(offset => target - offset).filter(candidate => localDateTime(new Date(candidate).toISOString(), zone) === wallTime)
    if (matches.length !== 1) throw new Error(matches.length ? 'This time occurs twice during the clock change. Choose an unambiguous time.' : 'This local time does not exist during the clock change. Choose another time.')
    return new Date(matches[0]).toISOString()
  } catch (error) {
    if (error instanceof RangeError) throw new Error('Enter a valid IANA time zone, such as Asia/Kolkata or Europe/London.')
    throw error
  }
}
export function prepareInterview(values) {
  const payload = cleanForm(Object.fromEntries(interviewFields.map(key => [key, values[key]])))
  if (!payload.application_id) throw new Error('Select an application.')
  if (payload.interview_datetime) {
    payload.interview_datetime = zonedInstant(payload.interview_datetime, payload.time_zone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  }
  payload.interview_status ||= 'Scheduled'
  payload.interview_outcome ||= 'Pending'
  return payload
}
export function groupFollowUps(rows, today = localDate()) {
  const result = { today: [], overdue: [], upcoming: [] }
  for (const row of rows) {
    if (!row.next_follow_up_date) continue
    result[row.next_follow_up_date === today ? 'today' : row.next_follow_up_date < today ? 'overdue' : 'upcoming'].push(row)
  }
  for (const group of Object.values(result)) group.sort((a, b) => a.next_follow_up_date.localeCompare(b.next_follow_up_date) || a.company_name.localeCompare(b.company_name))
  return result
}
export function summaryCounts(rows) {
  const count = allowed => rows.filter(row => allowed.includes(row.current_status)).length
  return {
    'Total Applications': rows.length,
    'Applied': count(['Applied']),
    'Assessments and Screenings': count(['Assessment', 'Screening']),
    'Interviews': count(['Interview Scheduled', 'Interviewing']),
    'Offers': count(['Offer Received']),
    'Rejections': count(['Rejected']),
  }
}
export function allUpcomingInterviews(rows, now = Date.now()) {
  return rows.flatMap(application => (application.interviews || []).filter(item => ['Scheduled', 'Rescheduled'].includes(item.interview_status) && item.interview_datetime && Date.parse(item.interview_datetime) >= now).map(item => ({ ...item, application })))
    .sort((a, b) => Date.parse(a.interview_datetime) - Date.parse(b.interview_datetime))
}
export function activeCount(rows) {
  return rows.filter(row => !['Offer Received', 'Rejected', 'Withdrawn'].includes(row.current_status)).length
}
export async function saveInterview(values, previous = null) {
  const payload = prepareInterview(values)
  // Reusing an interview edits that round; scheduling another creates a new row.
  let query = previous ? supabase.from('interviews').update(payload).eq('id', previous.id).eq('updated_at', previous.updated_at) : supabase.from('interviews').insert(payload)
  const { data, error } = await query.select().single()
  if (error) throw new Error(error.code === 'PGRST116' ? 'This interview changed or is no longer available. Reload before saving.' : error.message)
  cache = null
  return data
}
export async function updateFollowUp(application, values) {
  const payload = cleanForm({ next_follow_up_date: values.next_follow_up_date, follow_up_notes: values.follow_up_notes })
  const { data, error } = await supabase.from('applications').update(payload).eq('id', application.id).eq('updated_at', application.updated_at).select().single()
  if (error) throw new Error(error.code === 'PGRST116' ? 'This application changed. Reload before saving the follow-up.' : error.message)
  cache = null
  return data
}

export function formatInterview(instant, zone) {
  if (!instant) return '—'
  try { return new Date(instant).toLocaleString(undefined, { timeZone: zone || undefined }) + (zone ? ` (${zone})` : '') }
  catch { return new Date(instant).toLocaleString() + ' (local time)' }
}
