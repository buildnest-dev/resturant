'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Repeat } from 'lucide-react'
import { useStore, actions } from '@/lib/store'
import { ROLES, type Role, type RoleKey } from '@/lib/roles'
import { useMounted } from '@/lib/use-mounted'
import { Loading, Logo } from './ui'

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
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r bg-white p-3 md:flex print:!hidden">
        <Link href="/" className="px-2 py-1"><Logo /></Link>
        <div className="my-3 flex items-center gap-3 rounded-xl bg-indigo-50 p-3"><role.icon className="size-5 text-brand" /><div><b className="block text-sm">{role.title}</b><span className="text-xs text-stone-500">{s.restaurant.name}</span></div></div>
        <nav className="flex flex-col gap-1">{role.pages.map((p) => {
          const active = path === to(p.path)
          return <Link key={p.label} href={to(p.path)} aria-current={active ? 'page' : undefined} className={'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ' + (active ? 'bg-brand text-white' : 'text-stone-600 hover:bg-indigo-50')}><p.icon className="size-4" />{p.label}</Link>
        })}</nav>
        <div className="mt-auto flex flex-col gap-2 pt-3">{online}<Link className="btn btn-ghost" href="/signin"><Repeat className="size-4" />Switch role</Link></div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-white px-3 py-2 md:hidden print:hidden">
          <Link href="/"><Logo /></Link><span className="chip bg-indigo-50 text-brand">{role.title}</span>
          <span className="ml-auto">{online}</span><Link className="btn btn-ghost" href="/signin" aria-label="Switch role"><Repeat className="size-4" /></Link>
        </header>
        <main className="mx-auto max-w-6xl p-3 pb-24 md:p-6">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t bg-white md:hidden print:hidden">{role.pages.map((p) => {
          const active = path === to(p.path)
          return <Link key={p.label} href={to(p.path)} aria-current={active ? 'page' : undefined} className={'flex min-w-[76px] flex-1 flex-col items-center gap-1 px-1 py-2 text-center text-[11px] leading-tight ' + (active ? 'font-bold text-brand' : 'text-stone-500')}><p.icon className="size-5" />{p.label}</Link>
        })}</nav>
      </div>
    </div>
  )
}
