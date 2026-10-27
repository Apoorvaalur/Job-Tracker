import Icon from './Icon.jsx'

export default function SummaryCard({ title, count }) {
  const icon = title.toLowerCase().includes('interview') ? 'interviews' : title.toLowerCase().includes('follow') ? 'followups' : 'applications'
  return <div className="summary-card rounded-md border border-subtle bg-surface"><Icon name={icon} className="summary-icon" /><p className="text-sm text-muted">{title}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{count}</p></div>
}
