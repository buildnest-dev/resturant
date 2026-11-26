import Link from 'next/link'
import { ArrowRight, BarChart3, Bike, BellRing, BookOpen, Check, ChefHat, Plus, QrCode, ReceiptText, Star, type LucideIcon } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'
import { ROLES } from '@/lib/roles'
import { cn } from '@/lib/utils'
import { DishPhoto } from './DishPhoto'
import { Logo } from './common'

const product = PRODUCTS.restaurant
const LINKS = [['Features', '/#features'], ['Screens', '/#screens'], ['How it works', '/#how'], ['Plans', '/#plans']]

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-2 px-4 sm:gap-3">
        <Link href="/" className="shrink-0 rounded-full bg-brand-soft px-4 py-2"><Logo /></Link>
        <nav className="mx-auto hidden gap-1 rounded-full bg-brand-soft p-1 lg:flex">
          {LINKS.map(([label, href]) => <Link key={href} href={href} className="rounded-full px-4 py-2 text-sm transition hover:bg-white">{label}</Link>)}
        </nav>
        <Link className="btn btn-ghost ml-auto whitespace-nowrap lg:ml-0" href="/signin">Sign in</Link>
        <Link className="btn btn-primary whitespace-nowrap" href="/demo">Book a demo</Link>
      </div>
    </header>
  )
}

export const Footer = () => (
  <footer className="px-4 py-10 text-center text-sm text-ink/60">
    <Logo />
    <p className="mt-2">New Delhi · India · © 2026 ZAQSA</p>
    <a className="mt-1 inline-block underline" href="https://zaqsa.com/">zaqsa.com</a>
  </footer>
)

// A still picture of the Tables screen, built from the same pieces as the real one.
const PREVIEW_TABLES: [string, string, boolean][] = [['Table 1', 'Empty', false], ['Table 2', '12 mins', true], ['Table 3', 'Delivered', true], ['Table 4', 'Billing', true]]
const PREVIEW_DISHES: [string, string, string, string][] = [['m4', '🍛', 'Paneer Butter Masala', '₹260'], ['m5', '🍚', 'Chicken Biryani', '₹320'], ['m1', '🍹', 'Fresh Mint Mojito', '₹140']]
const box = 'rounded-3xl bg-paper p-3 text-left'

function Preview() {
  return (
    <div aria-hidden="true" className="pointer-events-none grid select-none gap-3 rounded-[2rem] border border-brand/10 bg-white p-3 shadow-2xl shadow-brand/10 sm:grid-cols-2 lg:grid-cols-3">
      <div className={box}>
        <p className="mb-2 px-1">1. Table List</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">{PREVIEW_TABLES.map(([name, state, busy], i) => {
          const chairs = <span className="flex gap-2">{[0, 1].map((n) => <span key={n} className={cn('block h-3 w-5 rounded border-2 border-brand', busy && 'bg-brand')} />)}</span>
          return (
            <div key={name} className="flex flex-col items-center gap-1">
              {chairs}
              <span className={cn('flex h-20 w-full flex-col items-center justify-center rounded-2xl border-2 border-brand', i === 1 ? 'bg-brand text-white' : 'bg-white')}><b className="text-sm">{name}</b><span className="text-xs">{state}</span></span>
              {chairs}
            </div>
          )
        })}</div>
      </div>
      <div className={cn(box, 'hidden lg:block')}>
        <p className="mb-2 px-1">2. Food Menu</p>
        <div className="space-y-2">{PREVIEW_DISHES.map(([id, emoji, name, price]) => (
          <div key={id} className="flex items-center gap-3 rounded-2xl bg-white p-2.5">
            <DishPhoto id={id} emoji={emoji} className="size-14" />
            <div className="min-w-0 flex-1"><b className="block truncate text-sm font-medium">{name}</b><span className="text-sm text-ink/60">{price}</span></div>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white"><Check className="size-4" /></span>
          </div>
        ))}</div>
      </div>
      <div className={box}>
        <p className="mb-2 px-1">3. Table 2</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-2"><span className="chip self-end bg-amber-50 text-amber-700">Cooking</span><DishPhoto id="m7" emoji="🍕" className="size-16" /><span className="text-xs">Pizza</span></div>
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-2 text-xs"><span className="grid size-10 place-items-center rounded-full bg-brand-soft"><Plus className="size-4" /></span>Add items</div>
        </div>
        <div className="mt-2 rounded-2xl bg-white p-3 text-sm">
          <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>₹280</span></div>
          <div className="flex justify-between text-ink/60"><span>GST (5%)</span><span>₹14</span></div>
          <div className="mt-2 flex justify-between text-base font-semibold"><span>Total</span><span>₹294</span></div>
          <div className="mt-3 rounded-full bg-brand py-2 text-center text-white">Send to kitchen</div>
        </div>
      </div>
    </div>
  )
}

const FEATURE_ICONS: LucideIcon[] = [QrCode, ChefHat, BellRing, ReceiptText, BookOpen, Bike, Star, BarChart3]
const STEPS = [['Book a demo', 'Tell us about your business and the features you want.'], ['We onboard you', 'The ZAQSA team sets up your account and data with you.'], ['Choose your plan', 'Pick only the features you need, monthly or yearly.'], ['Go live', 'Your staff start using it, with our support.']]
const PLANS = [['Monthly', 'Pay month to month. Change features as your business changes.'], ['Yearly', 'One annual payment for your chosen features.']]
const section = 'mx-auto max-w-6xl scroll-mt-24 px-4 py-8'
const heading = 'text-center text-2xl font-semibold sm:text-3xl'

export function Landing() {
  const p = product
  return (
    <div className="app-theme min-h-screen bg-white">
      <Header />
      <main>
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 text-center sm:pt-16">
          <p className="mx-auto inline-block rounded-full bg-brand-soft px-4 py-2 text-xs uppercase tracking-widest">{p.name}</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">{p.headline}</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/70">{p.sub}</p>
          <div className="mb-10 mt-7 flex flex-wrap justify-center gap-3">
            <Link className="btn btn-primary !px-6 !py-3" href="/demo">Book a demo<ArrowRight className="size-4" /></Link>
            <Link className="btn btn-ghost !px-6 !py-3" href="/signin">Sign in</Link>
          </div>
          <Preview />
        </section>

        <section id="features" className={section}>
          <div className="rounded-[2rem] bg-paper p-4 sm:p-8">
            <h2 className={heading}>Everything included to choose from</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{p.features.map(([title, text], i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length]
              return (
                <div key={title} className="rounded-3xl bg-white p-5">
                  <span className="grid size-12 place-items-center rounded-full bg-brand-soft"><Icon className="size-5" /></span>
                  <h3 className="mt-6 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-ink/60">{text}</p>
                </div>
              )
            })}</div>
          </div>
        </section>

        <section id="screens" className={section}>
          <h2 className={heading}>A screen for everyone</h2>
          <p className="mt-2 text-center text-sm text-ink/60">Open any role and look around. No password is needed in this preview.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{ROLES.map((r) => (
            <Link key={r.key} href={r.home} className="group flex flex-col items-center rounded-3xl border-2 border-transparent bg-paper p-5 text-center transition hover:border-brand">
              <span className="grid size-14 place-items-center rounded-full bg-white transition group-hover:bg-brand group-hover:text-white"><r.icon className="size-6" /></span>
              <b className="mt-3">{r.title}</b>
              <span className="mt-1 text-xs text-ink/60">{r.pages.slice(0, 3).map((x) => x.label).join(' · ')}</span>
            </Link>
          ))}</div>
        </section>

        <section id="how" className={section}>
          <h2 className={heading}>How it works</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([title, text], i) => (
            <li key={title} className="rounded-3xl bg-paper p-5">
              <span className="grid size-12 place-items-center rounded-full bg-brand text-sm text-white">0{i + 1}</span>
              <h3 className="mt-6 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-ink/60">{text}</p>
            </li>
          ))}</ol>
        </section>

        <section id="plans" className={cn(section, 'max-w-4xl')}>
          <h2 className={heading}>Simple plans</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{PLANS.map(([title, text]) => (
            <div key={title} className="flex flex-col rounded-3xl bg-paper p-3">
              <div className="flex-1 rounded-2xl bg-white p-6 text-center">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-ink/70">{text}</p>
                <p className="mt-3 text-xs text-ink/50">Price depends on the features you pick.</p>
              </div>
              <Link className="btn btn-primary mt-3 !py-3" href={`/demo?plan=${title}`}>Get a quote</Link>
            </div>
          ))}</div>
        </section>

        <section className={section}>
          <div className="rounded-[2rem] bg-brand px-4 py-12 text-center text-white">
            <h2 className={heading}>See it working for your business</h2>
            <Link className="btn mt-6 bg-white !px-6 !py-3 text-brand" href="/demo">Book a demo<ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
