import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { getSession, onAuthChange } from './services/auth.js'
import { clearApplicationCache } from './services/database.js'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Applications from './pages/Applications.jsx'
import ApplicationDetail from './pages/ApplicationDetail.jsx'
import Interviews from './pages/Interviews.jsx'
import FollowUps from './pages/FollowUps.jsx'
import Widget from './pages/Widget.jsx'

// Redirects to /login when there is no session; otherwise renders the page
function ProtectedRoute({ session }) {
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

// Sidebar + header shell for the main app pages
function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="app-shell min-h-screen md:flex">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className="app-main w-full flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  // undefined = still checking, null = logged out
  const [session, setSession] = useState(undefined)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let active = true
    let changed = false
    const unsubscribe = onAuthChange(value => { changed = true; if (!value) clearApplicationCache(); if (active) setSession(value) })
    getSession().then(value => { if (active && !changed) setSession(value) }).catch(error => { if (active) setAuthError(error.message) })
    return () => { active = false; unsubscribe() }
  }, [])

  if (authError) return <p role="alert" className="p-8 text-danger">{authError} <button className="underline" onClick={() => window.location.reload()}>Retry</button></p>
  if (session === undefined) {
    return <p className="p-8 text-muted">Loading…</p>
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute session={session} />}>
        <Route path="/widget" element={<Widget />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<Applications create />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/applications/:id/edit" element={<ApplicationDetail edit />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/follow-ups" element={<FollowUps />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} />
    </Routes>
  )
}
