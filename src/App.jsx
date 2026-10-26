import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { getSession, onAuthChange } from './services/auth.js'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

// Redirects to /login when there is no session; otherwise renders the page
function ProtectedRoute({ session }) {
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

// Sidebar + header shell for the main app pages
function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="min-h-screen md:flex">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  // undefined = still checking, null = logged out
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    getSession().then(setSession)
    return onAuthChange(setSession)
  }, [])

  if (session === undefined) {
    return <p className="p-8 text-muted">Loading…</p>
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute session={session} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          {/* Applications, interviews, follow-ups and widget routes are added in later checkpoints */}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  )
}