import { useSyncExternalStore } from 'react'

const never = () => () => {}

// false on the server and during hydration, true afterwards
export const useMounted = () => useSyncExternalStore(never, () => true, () => false)
