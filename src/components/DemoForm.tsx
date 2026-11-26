'use client'

import Link from 'next/link'
import { useState, useSyncExternalStore, type FormEvent, type InputHTMLAttributes } from 'react'
import { PRODUCTS } from '@/lib/products'
import { uid } from '@/lib/store'

type Plan = 'Monthly' | 'Yearly'
type TextField = 'name' | 'business' | 'phone' | 'city' | 'date'
type Details = Record<TextField, string> & { plan: string; features: string[]; note: string }
type Lead = Details & { id: string; product: string; createdAt: number }

const never = () => () => {}
const localToday = () => new Date().toLocaleDateString('en-CA')

export function DemoForm({ initialPlan }: { initialPlan: Plan }) {
  const p = PRODUCTS.restaurant
  const [v, setV] = useState<Details>({ name: '', business: '', phone: '', city: '', date: '', plan: initialPlan, features: [], note: '' })
  const [done, setDone] = useState<Lead | null>(null); const [err, setErr] = useState('')
  const field = (k: TextField, label: string, type = 'text', extra: InputHTMLAttributes<HTMLInputElement> = {}) => <label className="text-sm font-semibold">{label}<input className="input mt-1 font-normal" required type={type} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...extra} /></label>
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(v.phone)) return setErr('Enter a valid 10 digit mobile number')
    if (!v.features.length) return setErr('Pick at least one feature')
    const lead: Lead = { id: 'DEMO-' + uid(), product: 'restaurant', ...v, createdAt: Date.now() }
    const all: Lead[] = JSON.parse(localStorage.getItem('zaqsa-leads') || '[]')
    localStorage.setItem('zaqsa-leads', JSON.stringify([...all, lead])); setDone(lead)
  }
  // the visitor's own date; empty until the page is interactive, so the form cannot submit before that
  const today = useSyncExternalStore(never, localToday, () => '')
  return (
    <div className="mx-auto my-6 max-w-2xl rounded-[2rem] bg-paper p-3 sm:p-5">
        {done ? (
          <div className="card !rounded-2xl !p-8 text-center"><div className="text-5xl">✅</div><h1 className="mt-2 text-3xl font-semibold">Demo request recorded</h1><p className="mt-2 text-stone-600">Reference {done.id}. {done.business} · {done.plan} · {done.features.length} features.</p><p className="mt-2 text-sm text-amber-700">Preview mode: this request is saved only in this browser and is not yet sent to the ZAQSA team.</p><div className="mt-5 flex justify-center gap-2"><Link className="btn btn-ghost" href="/">Back to home</Link><Link className="btn btn-primary" href="/signin">Sign in preview</Link></div></div>
        ) : (
          <form onSubmit={submit} className="card !rounded-2xl !p-6 space-y-4">
            <h1 className="text-3xl font-semibold">Book a {p.short.toLowerCase()} software demo</h1>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{field('name', 'Your name')}{field('business', 'Business name')}{field('phone', 'Mobile number', 'tel', { maxLength: 10 })}{field('city', 'City')}{field('date', 'Preferred date', 'date', { min: today })}
              <label className="text-sm font-semibold">Plan interest<select className="input mt-1 font-normal" value={v.plan} onChange={(e) => setV({ ...v, plan: e.target.value })}><option>Monthly</option><option>Yearly</option></select></label></div>
            <fieldset className="min-w-0"><legend className="text-sm font-semibold">Features you want</legend>
              <button type="button" className="mb-2 text-xs text-brand underline" onClick={() => setV({ ...v, features: v.features.length === p.features.length ? [] : p.features.map((f) => f[0]) })}>Select / clear all</button>
              <div className="grid gap-2 sm:grid-cols-2">{p.features.map(([t]) => <label key={t} className="flex gap-2 rounded-lg border p-2 text-sm"><input type="checkbox" checked={v.features.includes(t)} onChange={() => setV({ ...v, features: v.features.includes(t) ? v.features.filter((x) => x !== t) : [...v.features, t] })} />{t}</label>)}</div></fieldset>
            <textarea className="input" placeholder="Anything else? (optional)" value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button className="btn btn-primary w-full !py-3" disabled={!today}>Book demo</button>
          </form>
        )}
    </div>
  )
}
