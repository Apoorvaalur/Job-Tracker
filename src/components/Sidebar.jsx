import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

const links = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/applications', label: 'Applications', icon: 'applications' },
  { to: '/interviews', label: 'Interviews', icon: 'interviews' },
  { to: '/follow-ups', label: 'Follow-ups', icon: 'followups' },
]

// Fixed column on desktop; slide-in panel with backdrop on mobile
export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-primary/30 md:hidden" onClick={onClose} />}
      <nav aria-label="Main navigation"
        className={`app-sidebar fixed inset-y-0 left-0 z-30 border-r border-subtle bg-surface transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button type="button" aria-label="Close menu" onClick={onClose} className="sidebar-close md:hidden"><Icon name="close" /></button>
        <p className="sidebar-title text-primary">Job Application Tracker</p>
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${
                    isActive ? 'active' : 'text-muted'
                  }`
                }
              >
                <Icon name={link.icon} />{link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
