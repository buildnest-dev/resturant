import { useSyncExternalStore } from 'react'

// Tiny localStorage store with cross-tab sync. Demo only; replaced by Firebase later.
export function createStore(key, seed) {
  const fresh = () => structuredClone(seed())
  let state
  try { state = JSON.parse(localStorage.getItem(key)) || fresh() } catch { state = fresh() }
  const listeners = new Set()
  const emit = () => listeners.forEach((l) => l())
  const commit = (next) => { state = next; localStorage.setItem(key, JSON.stringify(state)); emit() }
  window.addEventListener('storage', (e) => { if (e.key === key && e.newValue) { state = JSON.parse(e.newValue); emit() } })
  const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb) }
  return {
    use: () => useSyncExternalStore(subscribe, () => state),
    // mutate a draft copy; return false from fn to cancel
    set: (fn) => { const d = structuredClone(state); if (fn(d) !== false) commit(d) },
    reset: () => commit(fresh()),
  }
}

export const uid = (p = '') => p + Math.random().toString(36).slice(2, 7).toUpperCase()
export const money = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
const pad = (n) => String(n).padStart(2, '0')
// local calendar date, offset in days
export const day = (offset = 0, from) => {
  const d = from ? new Date(from + 'T00:00:00') : new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const nights = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000)
