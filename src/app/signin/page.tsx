import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Logo } from '@/components/ui'
import { ROLES } from '@/lib/roles'

export default function Page() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/"><Logo /></Link><Link className="btn btn-ghost" href="/demo">Book a demo</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-center text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-center text-stone-600">Choose who you are. No password is needed in this preview.</p>
        <div className="mt-6 flex flex-col gap-3">
          {ROLES.map((r) => (
            <Link key={r.key} href={r.home} className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-brand hover:shadow-lg hover:shadow-indigo-100 sm:p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-brand sm:size-14"><r.icon className="size-6" /></span>
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
