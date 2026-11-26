'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Repeat } from 'lucide-react'
import { useStore, actions } from '@/lib/store'
import { ROLES, type Role, type RoleKey } from '@/lib/roles'
import { useMounted } from '@/lib/use-mounted'
import { Loading, Logo } from './common'

// The screens read data saved in this browser, so they render only after loading.
export default function RoleShell({ role, children }: { role: RoleKey; children: ReactNode }) {
  const mounted = useMounted()
  const found = ROLES.find((r) => r.key === role)
  if (!mounted || !found) return <Loading />
  return <Shell role={found}>{children}</Shell>
}

// Sidebar on desktop, bottom bar on mobile. Same pages on both.
function Shell({ role, children }: { role: Role; children: ReactNode }) {
  const s = useStore()
  const path = usePathname()
  const to = (p: string) => role.home + (p ? '/' + p : '')
  const online = (
    <button className={'btn ' + (s.offline ? 'btn-red' : 'btn-ghost')} onClick={() => actions.setOffline(!s.offline)}>
      {s.offline ? `Offline · ${s.pending.length} queued` : '● Online'}
    </button>
  )
  const current = role.pages.find((p) => path === to(p.path))
  return (
    <div className="app-theme min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white px-3 md:px-0 print:hidden">
        <Link href="/" className="md:w-60 md:px-7"><Logo /></Link>
        <span className="hidden text-lg font-semibold md:block">{current?.label}</span>
        <div className="ml-auto flex items-center gap-2 md:gap-4 md:pr-6">
          {online}
          <div className="flex items-center gap-3">
            <span className="hidden size-10 place-items-center rounded-full bg-brand-soft text-brand sm:grid"><role.icon className="size-5" /></span>
            <div className="hidden leading-tight sm:block"><b className="block text-sm">{role.title}</b><span className="text-xs text-stone-500">{s.restaurant.name}</span></div>
          </div>
          <Link className="btn btn-ghost md:hidden" href="/signin" aria-label="Switch role"><Repeat className="size-4" /></Link>
        </div>
      </header>
      <div className="md:flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col overflow-y-auto border-r bg-white p-4 md:flex print:!hidden">
          <nav className="flex flex-col gap-1">{role.pages.map((p) => {
            const active = path === to(p.path)
            return <Link key={p.label} href={to(p.path)} aria-current={active ? 'page' : undefined} className={'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ' + (active ? 'bg-stone-100 text-ink' : 'text-stone-600 hover:bg-stone-50')}><p.icon className={'size-5 ' + (active ? 'text-brand' : '')} />{p.label}</Link>
          })}</nav>
          <Link className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50" href="/signin"><Repeat className="size-5" />Switch role</Link>
        </aside>
        <main className="min-h-[calc(100vh-4rem)] min-w-0 flex-1 bg-paper p-3 pb-24 md:p-6">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t bg-white md:hidden print:hidden">{role.pages.map((p) => {
        const active = path === to(p.path)
        return <Link key={p.label} href={to(p.path)} aria-current={active ? 'page' : undefined} className={'flex min-w-[76px] flex-1 flex-col items-center gap-1 px-1 py-2 text-center text-[11px] leading-tight ' + (active ? 'font-bold text-brand' : 'text-stone-500')}><p.icon className="size-5" />{p.label}</Link>
      })}</nav>
    </div>
  )
}
