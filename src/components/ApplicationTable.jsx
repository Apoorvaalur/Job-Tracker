import { Link } from 'react-router-dom'
import { formatInterview, upcomingInterview } from '../services/database.js'

export default function ApplicationTable({ applications, sort, direction, onSort, onDelete, deleting }) {
  function heading(field, title) {
    return <th scope="col" className="px-4 py-3 text-left font-medium" aria-sort={sort === field ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
      <button onClick={() => onSort(field)} className="whitespace-nowrap">{title}{sort === field ? direction === 'asc' ? ' ↑' : ' ↓' : ' ↕'}</button>
    </th>
  }
  return <div className="overflow-x-auto border-y border-subtle">
    <table className="w-full text-sm">
      <caption className="sr-only">Job applications</caption>
      <thead className="bg-canvas"><tr>{heading('company_name', 'Company / role')}{heading('date_applied', 'Date applied')}{heading('status', 'Status')}{heading('interview_date', 'Next interview')}<th scope="col" className="px-4 py-3 text-left">Work mode</th><th scope="col" className="px-4 py-3 text-left">Actions</th></tr></thead>
      <tbody>{applications.map(application => {
        const interview = upcomingInterview(application)
        return <tr key={application.id} className="border-t border-subtle">
          <td className="px-4 py-4"><Link className="font-medium underline underline-offset-4" to={`/applications/${application.id}`}>{application.company_name}</Link><p className="text-muted">{application.job_title}</p></td>
          <td className="whitespace-nowrap px-4 py-4">{application.date_applied}</td>
          <td className="px-4 py-4"><span className="status-badge" data-status={application.current_status}>{application.current_status}</span></td>
          <td className="px-4 py-4">{interview ? formatInterview(interview.interview_datetime, interview.time_zone) : '—'}</td>
          <td className="px-4 py-4">{application.work_mode || '—'}</td>
          <td className="px-4 py-4"><div className="flex items-center gap-3"><Link className="underline" to={`/applications/${application.id}/edit`}>Edit</Link><button disabled={Boolean(deleting)} className="text-danger underline disabled:opacity-60" onClick={() => onDelete(application)}>{deleting === application.id ? 'Deleting…' : 'Delete'}</button></div></td>
        </tr>
      })}</tbody>
    </table>
  </div>
}
