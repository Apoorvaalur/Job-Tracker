import React from 'react'
import { signOut } from '../services/auth'

function Header({ session }) {
  const userEmail = session?.user?.email ?? ''

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">💼</span>
        <h1 className="header-title">Job Tracker</h1>
      </div>

      <div className="header-actions">
        <span className="header-user">{userEmail}</span>
        <button className="btn btn-ghost" onClick={handleSignOut} id="sign-out-btn">
          Sign Out
        </button>
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          height: 60px;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .header-logo {
          font-size: 1.4rem;
        }
        .header-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-user {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }
        .btn {
          padding: 0.45rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
        }
        .btn-ghost {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
        }
        .btn-ghost:hover {
          background: var(--color-surface-2);
          color: var(--color-text);
          border-color: var(--color-primary);
        }
      `}</style>
    </header>
  )
}

export default Header
