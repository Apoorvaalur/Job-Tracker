const paths = {
  dashboard: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  applications: ['M9 5V3h6v2', 'M3 5h18v15H3z', 'M3 10h18', 'M10 10v3h4v-3'],
  interviews: ['M8 2v4', 'M16 2v4', 'M3 4h18v17H3z', 'M3 9h18', 'M8 13h3', 'M8 17h7'],
  followups: ['M4 12a8 8 0 1 0 2-6', 'M4 3v5h5', 'M12 8v5l3 2'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  arrow: ['M5 12h14', 'M14 7l5 5-5 5'],
}

export default function Icon({ name, className = '' }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{(paths[name] || paths.applications).map((d, i) => <path key={i} d={d} />)}</svg>
}