import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Logo } from '@/components/common'
import { ROLES } from '@/lib/roles'

export default function Page() {
  return (
    <div className="app-theme min-h-screen bg-white">
      <header>
        <div className="mx-auto flex h-20 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="rounded-full bg-brand-soft px-4 py-2"><Logo /></Link><Link className="btn btn-ghost" href="/demo">Book a demo</Link>
        </div>
      </header>
      <main className="mx-auto mb-8 max-w-3xl rounded-[2rem] bg-paper px-3 py-8 sm:px-6">
        <h1 className="text-center text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-center text-stone-600">Choose who you are. No password is needed in this preview.</p>
        <div className="mt-6 flex flex-col gap-3">
          {ROLES.map((r) => (
            <Link key={r.key} href={r.home} className="group flex items-center gap-4 rounded-3xl border-2 border-transparent bg-white p-4 transition hover:border-brand sm:p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white sm:size-14"><r.icon className="size-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold">{r.ask}</span>
                <span className="block text-sm text-stone-500">{r.pages.map((p) => p.label).join(' · ')}</span>
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-brand"><span className="hidden sm:inline">Click here</span><ChevronRight className="size-5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
