import { supabase } from './auth.js'

// CHECK constraints reject "", so every form value goes through this before saving:
// empty or whitespace-only strings become null, other strings are trimmed.
export function cleanForm(values) {
  const cleaned = {}
  for (const [field, value] of Object.entries(values)) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      cleaned[field] = trimmed === '' ? null : trimmed
    } else {
      cleaned[field] = value ?? null
    }
  }
  return cleaned
}

// Database functions for applications, interviews and history are added in checkpoints 3 and 4.
export { supabase }