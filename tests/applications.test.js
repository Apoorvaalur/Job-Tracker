import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
// Test pure functions without importing environment-configured auth.
const source = fs.readFileSync(new URL('../src/services/database.js', import.meta.url), 'utf8').replace("import { supabase } from './auth.js'", '')
const { cleanForm, prepareApplication, selectApplications, upcomingInterview } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const now = Date.parse('2026-10-27T04:45:00Z')
const rows = [
  { id: 'a', company_name: 'Northwind', job_title: 'Data Analyst', recruiter_name: 'Sara', date_applied: '2026-10-20', current_status: 'Applied', job_category: 'Data Analyst', work_mode: 'Remote', interviews: [] },
  { id: 'b', company_name: 'Acme', job_title: 'Developer', recruiter_name: 'Ravi', date_applied: '2026-10-24', current_status: 'Interviewing', job_category: 'Software Development', work_mode: 'Hybrid', interviews: [
    { interview_status: 'Scheduled', interview_datetime: '2026-10-28T10:00:00Z' },
    { interview_status: 'Cancelled', interview_datetime: '2026-10-27T10:00:00Z' },
    { interview_status: 'Completed', interview_datetime: '2026-10-25T10:00:00Z' },
  ] },
  { id: 'c', company_name: 'Zenith', job_title: 'Business Analyst', recruiter_name: null, date_applied: '2026-10-26', current_status: 'Rejected', job_category: 'Business Analyst', work_mode: 'On-site', interviews: [ { interview_status: 'Rescheduled', interview_datetime: '2026-11-01T10:00:00Z' } ] },
]
const select = (filters = {}, sort = 'date_applied', direction = 'desc') => selectApplications(rows, filters, sort, direction, now).map(row => row.id)
test('empty dropdowns, dates and optional text normalize to null', () => assert.deepEqual(cleanForm({ job_category: '', next_follow_up_date: '', recruiter_phone: '   ', general_notes: ' note ' }), { job_category: null, next_follow_up_date: null, recruiter_phone: null, general_notes: 'note' }))
test('company name is required', () => assert.throws(() => prepareApplication({ company_name: ' ', job_title: 'Analyst', date_applied: '2026-10-27' }), /required/))
test('job title is required', () => assert.throws(() => prepareApplication({ company_name: 'Acme', job_title: '', date_applied: '2026-10-27' }), /required/))
test('date applied is required', () => assert.throws(() => prepareApplication({ company_name: 'Acme', job_title: 'Analyst', date_applied: '' }), /required/))
test('optional application fields accept null and omitted status defaults to Applied', () => { const prepared = prepareApplication({ company_name: 'Acme', job_title: 'Analyst', date_applied: '2026-10-27' }); assert.equal(prepared.current_status, 'Applied'); assert.equal(prepared.recruiter_phone, null); assert.equal(prepared.recruiter_linkedin_url, null) })
test('search matches company', () => assert.deepEqual(select({ search: 'NORTHWIND' }), ['a']))
test('search matches job title', () => assert.deepEqual(select({ search: 'developer' }), ['b']))
test('search matches recruiter name', () => assert.deepEqual(select({ search: 'sara' }), ['a']))
test('status filter', () => assert.deepEqual(select({ status: 'Rejected' }), ['c']))
test('job category filter', () => assert.deepEqual(select({ category: 'Data Analyst' }), ['a']))
test('work mode filter', () => assert.deepEqual(select({ workMode: 'Hybrid' }), ['b']))
test('date range filter includes both boundaries', () => assert.deepEqual(select({ from: '2026-10-20', to: '2026-10-24' }), ['b', 'a']))
test('upcoming filter excludes completed and cancelled interviews', () => { assert.deepEqual(select({ upcoming: true }), ['c', 'b']); assert.equal(upcomingInterview(rows[1], now).interview_datetime, '2026-10-28T10:00:00Z') })
test('filters combine', () => assert.deepEqual(select({ upcoming: true, workMode: 'Remote' }), []))
test('cleared filters return all applications', () => assert.deepEqual(select({}), ['c', 'b', 'a']))
test('sort date applied', () => assert.deepEqual(select({}, 'date_applied', 'asc'), ['a', 'b', 'c']))
test('sort company', () => assert.deepEqual(select({}, 'company_name', 'asc'), ['b', 'a', 'c']))
test('sort status', () => assert.deepEqual(select({}, 'status', 'desc'), ['c', 'b', 'a']))
test('sort interview date puts missing dates last in either direction', () => { assert.deepEqual(select({}, 'interview_date', 'asc'), ['b', 'c', 'a']); assert.deepEqual(select({}, 'interview_date', 'desc'), ['c', 'b', 'a']) })
