import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill it in.')
}

// Single shared Supabase client, also used by database.js
export const supabase = createClient(url, key)

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Supabase returns "Invalid login credentials" for wrong email or password
    throw new Error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message)
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// Calls back with the session (or null) whenever auth state changes
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}