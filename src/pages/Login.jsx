import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../services/auth.js'
import Footer from '../components/Footer.jsx'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page flex min-h-screen flex-col">
    <div className="flex flex-1 items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="login-panel w-full space-y-4 rounded-lg border border-subtle bg-surface"
      >
        <div className="login-heading"><h1>Job Application Tracker</h1><p>Sign in</p></div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-primary">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-subtle px-3 py-2 text-sm focus:border-btn-primary focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-primary">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-subtle px-3 py-2 text-sm focus:border-btn-primary focus:outline-none"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-md text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-btn-primary px-4 py-2 text-sm font-medium text-btn-text disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
    <Footer tone="dark" />
    </div>
  )
}
