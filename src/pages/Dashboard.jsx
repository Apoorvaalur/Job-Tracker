import React, { useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function Dashboard({ session }) {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <div className="app-shell">
      <Header session={session} />
      <div className="app-body">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="main-content">
          <div className="dashboard-hero">
            <h2 className="dashboard-greeting">
              Welcome back{session?.user?.email ? `, ${session.user.email.split('@')[0]}` : ''}! 👋
            </h2>
            <p className="dashboard-sub">Here's a summary of your job search progress.</p>
          </div>

          <div className="stats-grid">
            {[
              { label: 'Applied',    value: '0', color: '#6c63ff' },
              { label: 'Interviews', value: '0', color: '#00d4aa' },
              { label: 'Offers',     value: '0', color: '#f5a623' },
              { label: 'Rejected',   value: '0', color: '#ff5c6a' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card" style={{ '--accent': stat.color }}>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .app-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          background: var(--color-bg);
        }
        .dashboard-hero {
          margin-bottom: 2rem;
        }
        .dashboard-greeting {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-text);
        }
        .dashboard-sub {
          color: var(--color-text-muted);
          margin-top: 0.4rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1.25rem;
        }
        .stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          border-top: 3px solid var(--accent, var(--color-primary));
          transition: transform var(--transition), box-shadow var(--transition);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--accent, var(--color-primary));
        }
        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
