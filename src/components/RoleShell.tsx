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
  return (
    <div className="app-theme min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex h-20 items-center gap-3 bg-white px-3 md:px-5 print:hidden">
        <Link href="/" className="shrink-0 rounded-full bg-brand-soft px-4 py-2"><Logo /></Link>
        <nav className="hidden min-w-0 flex-1 overflow-x-auto md:flex">
          <div className="mx-auto flex gap-1.5">{role.pages.map((p) => {
            const active = path === to(p.path)
            return <Link key={p.label} href={to(p.path)} title={p.label} aria-label={p.label} aria-current={active ? 'page' : undefined} className={'flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full text-sm transition ' + (active ? 'bg-brand px-4 text-white' : 'bg-brand-soft text-ink hover:bg-brand/15')}><p.icon className="size-5" />{active && <span className="whitespace-nowrap">{p.label}</span>}</Link>
          })}</div>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {online}
          <Link className="grid size-11 place-items-center rounded-full bg-brand-soft" href="/signin" title="Switch role" aria-label="Switch role"><Repeat className="size-5" /></Link>
          <div className="hidden items-center gap-3 rounded-full bg-brand-soft py-1 pl-1 pr-5 xl:flex">
            <span className="grid size-10 place-items-center rounded-full bg-brand text-white"><role.icon className="size-5" /></span>
            <div className="leading-tight"><b className="block text-sm">{role.title}</b><span className="text-xs text-ink/60">{s.restaurant.name}</span></div>
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-5rem)] px-3 pb-24 md:px-5 md:pb-5">
        {path === role.home + '/floor' ? children : <div className="min-h-[calc(100vh-6.5rem)] rounded-3xl bg-paper p-3 md:p-5">{children}</div>}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t bg-white md:hidden print:hidden">{role.pages.map((p) => {
        const active = path === to(p.path)
        return <Link key={p.label} href={to(p.path)} aria-current={active ? 'page' : undefined} className={'flex min-w-[84px] flex-1 flex-col items-center gap-1 px-1 py-2 text-center text-[11px] leading-tight ' + (active ? 'font-bold text-brand' : 'text-stone-500')}><p.icon className="size-5" />{p.label}</Link>
      })}</nav>
    </div>
  )
}
