import type { ReactNode } from 'react'
import { GuestShell } from '@/screens/Guest'

export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ table: string }> }) {
  const { table } = await params
  return <GuestShell key={table} table={table}>{children}</GuestShell>
}
