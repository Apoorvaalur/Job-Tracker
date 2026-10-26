import React from 'react'

const navItems = [
  { id: 'dashboard',   label: 'Dashboard',     icon: '🏠' },
  { id: 'applications', label: 'Applications', icon: '📋' },
  { id: 'interviews',  label: 'Interviews',    icon: '🗓️' },
  { id: 'offers',      label: 'Offers',        icon: '🎉' },
  { id: 'settings',   label: 'Settings',       icon: '⚙️' },
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .sidebar {
          width: 220px;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          height: 100%;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--color-text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
          transition: all var(--transition);
        }
        .sidebar-item:hover {
          background: var(--color-surface-2);
          color: var(--color-text);
        }
        .sidebar-item.active {
          background: rgba(108, 99, 255, 0.15);
          color: var(--color-primary);
        }
        .sidebar-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }
        .sidebar-label {
          flex: 1;
        }
      `}</style>
    </aside>
  )
}

export default Sidebar
