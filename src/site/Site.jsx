import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Logo } from '../ui.jsx'
import { PRODUCTS, base } from '../core/products.js'
import { uid } from '../core/db.js'


function Header({ product }) {
  const demo = product ? `${base(product)}/demo` : null
  return (
    <header className="sticky top-0 z-10 border-b border-indigo-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to={product ? base(product) || '/' : '/'}><Logo /></Link>
        {product && <span className="chip hidden bg-indigo-50 text-brand sm:inline-flex">{PRODUCTS[product].short}</span>}
        <a className="ml-auto hidden text-sm sm:block" href="https://zaqsa.com/">zaqsa.com</a>
        {product && <><Link className="btn btn-ghost ml-auto whitespace-nowrap sm:ml-0" to="/signin">Sign in</Link><Link className="btn btn-primary whitespace-nowrap" to={demo}>Book a demo</Link></>}
      </div>
    </header>
  )
}
const Footer = () => <footer className="border-t border-indigo-100 bg-white py-8 text-center text-sm text-stone-500"><Logo /><p className="mt-1">New Delhi · India · © 2026 ZAQSA</p></footer>

const steps = [['Book a demo', 'Tell us about your business and the features you want.'], ['We onboard you', 'The ZAQSA team sets up your account and data with you.'], ['Choose your plan', 'Pick only the features you need, monthly or yearly.'], ['Go live', 'Your staff start using it, with our support.']]

export function Landing({ product }) {
  const p = PRODUCTS[product]; const demo = `${base(product)}/demo`
  return (
    <div><Header product={product} />
      <section className="bg-gradient-to-b from-white to-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">{p.name}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{p.headline}</h1>
            <p className="mt-4 text-lg text-stone-600">{p.sub}</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link className="btn btn-primary !px-5 !py-3" to={demo}>Book a demo</Link><Link className="btn btn-ghost !px-5 !py-3" to="/signin">Sign in</Link></div>
          </div>
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
            <div className="text-6xl">{p.icon}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">{p.features.slice(0, 6).map(([t]) => <div key={t} className="rounded-xl bg-indigo-50 p-3 text-sm font-semibold">{t}</div>)}</div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-3xl font-semibold">Everything included to choose from</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{p.features.map(([t, d]) => <div key={t} className="card !rounded-2xl"><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-stone-600">{d}</p></div>)}</div>
      </section>
      <section className="bg-white py-12"><div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-semibold">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([t, d], i) => <li key={t} className="rounded-2xl border border-indigo-100 p-4"><span className="text-3xl font-black text-brand">0{i + 1}</span><h3 className="font-bold">{t}</h3><p className="text-sm text-stone-600">{d}</p></li>)}</ol>
      </div></section>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-center text-3xl font-semibold">Simple plans</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{[['Monthly', 'Pay month to month. Change features as your business changes.'], ['Yearly', 'One annual payment for your chosen features.']].map(([t, d]) => <div key={t} className="card !rounded-2xl !p-6 text-center"><h3 className="text-xl font-bold">{t}</h3><p className="my-3 text-stone-600">{d}</p><p className="mb-3 text-sm text-stone-500">Price depends on the features you pick.</p><Link className="btn btn-primary w-full" to={`${demo}?plan=${t}`}>Get a quote</Link></div>)}</div>
      </section>
      <section className="bg-ink px-4 py-12 text-center text-white"><h2 className="text-3xl font-semibold">See it working for your business</h2><Link className="btn btn-primary mt-5 !px-6 !py-3" to={demo}>Book a demo</Link></section>
      <Footer />
    </div>
  )
}

export function Demo({ product }) {
  const p = PRODUCTS[product]; const [params] = useSearchParams()
  const [v, setV] = useState({ name: '', business: '', phone: '', city: '', date: '', plan: params.get('plan') === 'Yearly' ? 'Yearly' : 'Monthly', features: [], note: '' })
  const [done, setDone] = useState(null); const [err, setErr] = useState('')
  const field = (k, label, type = 'text', extra = {}) => <label className="text-sm font-semibold">{label}<input className="input mt-1 font-normal" required type={type} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...extra} /></label>
  const submit = (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(v.phone)) return setErr('Enter a valid 10 digit mobile number')
    if (!v.features.length) return setErr('Pick at least one feature')
    const lead = { id: uid('DEMO-'), product, ...v, createdAt: Date.now() }
    const all = JSON.parse(localStorage.getItem('zaqsa-leads') || '[]')
    localStorage.setItem('zaqsa-leads', JSON.stringify([...all, lead])); setDone(lead)
  }
  const today = new Date().toLocaleDateString('en-CA')
  return (
    <div><Header product={product} />
      <div className="mx-auto max-w-2xl px-4 py-10">
        {done ? (
          <div className="card !rounded-2xl !p-8 text-center"><div className="text-5xl">✅</div><h1 className="mt-2 text-3xl font-semibold">Demo request recorded</h1><p className="mt-2 text-stone-600">Reference {done.id}. {done.business} · {done.plan} · {done.features.length} features.</p><p className="mt-2 text-sm text-amber-700">Preview mode: this request is saved only in this browser and is not yet sent to the ZAQSA team.</p><div className="mt-5 flex justify-center gap-2"><Link className="btn btn-ghost" to="/">Back to home</Link><Link className="btn btn-primary" to="/signin">Sign in preview</Link></div></div>
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
            <button className="btn btn-primary w-full !py-3">Book demo</button>
          </form>
        )}
      </div><Footer />
    </div>
  )
}
