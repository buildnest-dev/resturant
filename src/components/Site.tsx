import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'
import { Logo } from './ui'

const product = PRODUCTS.restaurant

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-indigo-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/"><Logo /></Link>
        <span className="chip hidden bg-indigo-50 text-brand sm:inline-flex">{product.short}</span>
        <a className="ml-auto hidden text-sm sm:block" href="https://zaqsa.com/">zaqsa.com</a>
        <Link className="btn btn-ghost ml-auto whitespace-nowrap sm:ml-0" href="/signin">Sign in</Link><Link className="btn btn-primary whitespace-nowrap" href="/demo">Book a demo</Link>
      </div>
    </header>
  )
}
export const Footer = () => <footer className="border-t border-indigo-100 bg-white py-8 text-center text-sm text-stone-500"><Logo /><p className="mt-1">New Delhi · India · © 2026 ZAQSA</p></footer>

const steps = [['Book a demo', 'Tell us about your business and the features you want.'], ['We onboard you', 'The ZAQSA team sets up your account and data with you.'], ['Choose your plan', 'Pick only the features you need, monthly or yearly.'], ['Go live', 'Your staff start using it, with our support.']]

export function Landing() {
  const p = product
  return (
    <div><Header />
      <section className="bg-gradient-to-b from-white to-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">{p.name}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{p.headline}</h1>
            <p className="mt-4 text-lg text-stone-600">{p.sub}</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link className="btn btn-primary !px-5 !py-3" href="/demo">Book a demo</Link><Link className="btn btn-ghost !px-5 !py-3" href="/signin">Sign in</Link></div>
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{[['Monthly', 'Pay month to month. Change features as your business changes.'], ['Yearly', 'One annual payment for your chosen features.']].map(([t, d]) => <div key={t} className="card !rounded-2xl !p-6 text-center"><h3 className="text-xl font-bold">{t}</h3><p className="my-3 text-stone-600">{d}</p><p className="mb-3 text-sm text-stone-500">Price depends on the features you pick.</p><Link className="btn btn-primary w-full" href={`/demo?plan=${t}`}>Get a quote</Link></div>)}</div>
      </section>
      <section className="bg-ink px-4 py-12 text-center text-white"><h2 className="text-3xl font-semibold">See it working for your business</h2><Link className="btn btn-primary mt-5 !px-6 !py-3" href="/demo">Book a demo</Link></section>
      <Footer />
    </div>
  )
}
