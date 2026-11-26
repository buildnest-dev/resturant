'use client'

import { useState } from 'react'
import { BellRing, Check, CookingPot, Lock, Minus, Plus, Printer, ReceiptText, Send, Timer, X, type LucideIcon } from 'lucide-react'
import { useStore, actions, fmt, tableBill, session, type MenuItem, type OrderStatus, type State, type Table } from '@/lib/store'
import { Empty, useTick } from '@/components/common'
import { DishPhoto } from '@/components/DishPhoto'
import { cn } from '@/lib/utils'

type Draft = { qty: Record<string, number>; note: string; avoid: string[] }
const emptyDraft: Draft = { qty: {}, note: '', avoid: [] }
type Pane = 'tables' | 'menu' | 'order'

const tone = {
  grey: 'bg-brand-soft text-ink/70',
  blue: 'bg-indigo-50 text-indigo-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
}
const Pill = ({ kind, icon: Icon, children }: { kind: keyof typeof tone; icon: LucideIcon; children: string }) => (
  <span className={cn('chip gap-1', tone[kind])}><Icon className="size-3.5" />{children}</span>
)

function tableState(s: State, t: Table, now: number): { label: string; icon: LucideIcon } {
  const orders = tableBill(s, t.id).orders
  const status = session(s, t.id).status
  if (t.locked) return { label: 'Locked', icon: Lock }
  if (status !== 'open') return { label: status === 'paid' ? 'Paid' : 'Billing', icon: ReceiptText }
  if (!orders.length) return { label: 'Empty', icon: Timer }
  if (orders.some((o) => o.status === 'received')) return { label: 'New order', icon: BellRing }
  const cooking = orders.filter((o) => o.status === 'accepted' || o.status === 'preparing')
  if (cooking.length) {
    const mins = Math.max(0, Math.floor((now - Math.min(...cooking.map((o) => o.createdAt))) / 60000))
    return { label: `${mins} mins`, icon: CookingPot }
  }
  if (orders.some((o) => o.status === 'ready')) return { label: 'Ready', icon: BellRing }
  return { label: 'Delivered', icon: Check }
}

const dishState: Record<Exclude<OrderStatus, 'declined'>, { label: string; kind: keyof typeof tone; icon: LucideIcon }> = {
  received: { label: 'New', kind: 'amber', icon: BellRing },
  accepted: { label: 'Queued', kind: 'blue', icon: Timer },
  preparing: { label: 'Cooking', kind: 'amber', icon: CookingPot },
  ready: { label: 'Ready', kind: 'green', icon: BellRing },
  served: { label: 'Done', kind: 'green', icon: Check },
}

const panel = 'min-w-0 rounded-3xl bg-paper p-3 xl:h-[calc(100vh-7.5rem)] xl:overflow-y-auto'
const round = 'grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-ink transition hover:bg-brand hover:text-white disabled:pointer-events-none disabled:opacity-40'

function DishRow({ dish, left, blocked, onAdd }: { dish: MenuItem; left: number; blocked: boolean; onAdd: (qty: number) => void }) {
  const [picked, setPicked] = useState(1)
  const qty = Math.min(picked, Math.max(left, 1))
  const off = blocked || left <= 0
  return (
    <div className={cn('card flex gap-3 !p-3', left <= 0 && 'opacity-60')}>
      <DishPhoto id={dish.id} emoji={dish.emoji} className="size-20" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2"><b className="font-medium">{dish.name}</b><span className="text-sm">{fmt(dish.price)}</span></div>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className={cn('chip', dish.veg ? tone.green : 'bg-red-50 text-red-700')}>{dish.veg ? 'Veg' : 'Non-veg'}</span>
          {dish.allergens.map((a) => <span key={a} className="chip bg-amber-50 text-amber-800">{a}</span>)}
          <span className={cn('chip', tone.grey)}>{dish.stock === 0 ? 'Sold out' : `${dish.stock} left`}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button className={round} aria-label={'Less ' + dish.name} disabled={off || qty <= 1} onClick={() => setPicked(qty - 1)}><Minus className="size-4" /></button>
          <span className="grid size-10 place-items-center rounded-full bg-brand-soft text-sm tabular-nums">{String(qty).padStart(2, '0')}</span>
          <button className={round} aria-label={'More ' + dish.name} disabled={off || qty >= left} onClick={() => setPicked(qty + 1)}><Plus className="size-4" /></button>
          <button className="ml-auto grid size-11 place-items-center rounded-full bg-brand text-white transition active:scale-95 disabled:opacity-30" aria-label={'Add ' + dish.name} disabled={off} onClick={() => { onAdd(qty); setPicked(1) }}><Check className="size-5" /></button>
        </div>
      </div>
    </div>
  )
}

export function PointOfSale() {
  const s = useStore(); const now = useTick(15000)
  const [selected, setSelected] = useState(() => s.tables.find((t) => tableBill(s, t.id).orders.length)?.id ?? s.tables[0].id)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [category, setCategory] = useState('All')
  const [pane, setPane] = useState<Pane>('tables')
  const [error, setError] = useState('')

  const table = s.tables.find((t) => t.id === selected) ?? s.tables[0]
  const draft = drafts[table.id] ?? emptyDraft
  const patch = (change: Partial<Draft>) => { setError(''); setDrafts((all) => ({ ...all, [table.id]: { ...(all[table.id] ?? emptyDraft), ...change } })) }
  const bill = tableBill(s, table.id)
  const status = session(s, table.id).status
  const blocked = table.locked ? 'This table is locked.' : status !== 'open' ? 'Billing is in progress. New items can be added after the cashier closes the table.' : ''

  const draftItems = Object.entries(draft.qty).flatMap(([id, qty]) => { const m = s.menu.find((x) => x.id === id); return m && qty > 0 ? [{ id, name: m.name, price: m.price, qty, emoji: m.emoji, stock: m.stock }] : [] })
  const sent = bill.orders.flatMap((o) => (o.status === 'declined' ? [] : o.items.map((i) => ({ ...i, key: o.id + i.id, look: dishState[o.status as Exclude<OrderStatus, 'declined'>] }))))
  const draftSum = draftItems.reduce((a, i) => a + i.price * i.qty, 0)
  const subtotal = bill.sub + draftSum
  const tax = Math.round(subtotal * (s.restaurant.gstRate / 100))
  const count = draftItems.reduce((a, i) => a + i.qty, 0)
  const dishes = s.menu.filter((m) => m.available && (category === 'All' || m.cat === category))
  const latest = bill.orders[bill.orders.length - 1]

  const send = () => {
    const short = draftItems.find((i) => i.qty > i.stock)
    if (short) return setError(`Only ${short.stock} ${short.name} left. Remove it and add again.`)
    actions.staffOrder(table.id, draftItems.map(({ id, name, price, qty }) => ({ id, name, price, qty })), draft.note.trim(), draft.avoid.join(', '))
    patch(emptyDraft)
  }
  const remove = (id: string) => { const next = { ...draft.qty }; delete next[id]; patch({ qty: next }) }
  const show = (p: Pane) => (pane === p ? 'block' : 'hidden xl:block')

  return (
    <div>
      <div className="mb-3 flex gap-2 xl:hidden print:hidden">
        {([['tables', 'Tables'], ['menu', 'Menu'], ['order', `Order${count ? ` (${count})` : ''}`]] as const).map(([key, label]) => (
          <button key={key} className={cn('btn flex-1', pane === key ? 'btn-primary' : 'btn-ghost')} onClick={() => setPane(key)}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)]">
        <section className={cn(panel, show('tables'), 'print:hidden')}>
          <div className="mb-3 flex items-center justify-between gap-2 px-1"><h2 className="text-xl">1. Table List</h2><span className="rounded-full bg-white px-4 py-2 text-sm">Total {s.tables.length}</span></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-2">{s.tables.map((t) => {
            const look = tableState(s, t, now)
            const picked = t.id === table.id
            const busy = look.label !== 'Empty' && look.label !== 'Locked'
            const chairs = <span className="flex gap-3">{[0, 1].map((n) => <span key={n} className={cn('block h-3.5 w-6 rounded-md border-2 border-brand', busy && 'bg-brand')} />)}</span>
            return (
              <button key={t.id} aria-pressed={picked} aria-label={`${t.label}, ${look.label}`} onClick={() => { setSelected(t.id); setPane('menu'); setError('') }}
                className="group flex min-w-0 flex-col items-center gap-1.5 py-2">
                {chairs}
                <span className={cn('flex h-24 w-full max-w-36 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand transition', picked ? 'bg-brand text-white' : 'bg-white group-hover:bg-brand-soft')}>
                  <b className="text-sm">{t.label}</b>
                  <span className="flex items-center gap-1 text-xs"><look.icon className="size-3.5" />{look.label}</span>
                </span>
                {chairs}
              </button>
            )
          })}</div>
        </section>

        <section className={cn(panel, show('menu'), 'print:hidden')}>
          <div className="mb-3 flex items-center justify-between gap-2 px-1"><h2 className="text-xl">2. Food Menu ({dishes.length})</h2><span className="rounded-full bg-white px-4 py-2 text-sm">{table.label}</span></div>
          <div className="mb-3 flex gap-2 overflow-x-auto">{['All', ...new Set(s.menu.map((m) => m.cat))].map((c) => <button key={c} className={cn('tab', category === c && 'tab-on')} onClick={() => setCategory(c)}>{c}</button>)}</div>
          {blocked && <p className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{blocked}</p>}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">{dishes.map((m) => {
            const left = m.stock - (draft.qty[m.id] ?? 0)
            return <DishRow key={m.id} dish={m} left={left} blocked={!!blocked} onAdd={(qty) => patch({ qty: { ...draft.qty, [m.id]: (draft.qty[m.id] ?? 0) + qty } })} />
          })}</div>
        </section>

        <section className={cn(panel, show('order'), 'print:block')}>
          <div className="mb-3 flex items-center justify-between gap-2 px-1"><h2 className="text-xl">3. {table.label}</h2><span className="rounded-full bg-white px-4 py-2 text-sm">{latest ? `Order #${latest.id}` : 'No order'}</span></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-2">
            {sent.map((i) => (
              <div key={i.key} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-2">
                <span className="self-end"><Pill kind={i.look.kind} icon={i.look.icon}>{i.look.label}</Pill></span>
                <DishPhoto id={i.id} emoji={s.menu.find((m) => m.id === i.id)?.emoji ?? '🍽️'} className="size-24" />
                <span className="self-start text-sm">{i.qty} × {i.name}</span>
              </div>
            ))}
            {draftItems.map((i) => (
              <div key={'draft-' + i.id} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand/40 bg-white p-2">
                <div className="flex w-full items-center justify-between"><button className="grid size-7 place-items-center rounded-full bg-brand-soft print:hidden" aria-label={'Remove ' + i.name} onClick={() => remove(i.id)}><X className="size-4" /></button><Pill kind="grey" icon={Send}>Not sent</Pill></div>
                <DishPhoto id={i.id} emoji={i.emoji} className="size-24" />
                <span className="self-start text-sm">{i.qty} × {i.name}</span>
              </div>
            ))}
            <button className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl bg-white text-sm print:hidden" onClick={() => setPane('menu')}>
              <span className="grid size-12 place-items-center rounded-full bg-brand-soft"><Plus className="size-5" /></span>Add items
            </button>
          </div>

          {draftItems.length > 0 && (
            <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 print:hidden">
              <div className="flex flex-wrap items-center gap-2 text-sm"><span>Allergy:</span>{['Nuts', 'Dairy', 'Gluten'].map((a) => (
                <button key={a} aria-pressed={draft.avoid.includes(a)} className={cn('chip border', draft.avoid.includes(a) ? 'border-red-600 bg-red-600 text-white' : 'border-stone-300')} onClick={() => patch({ avoid: draft.avoid.includes(a) ? draft.avoid.filter((x) => x !== a) : [...draft.avoid, a] })}>{a}</button>
              ))}</div>
              <input className="input" placeholder="Note for kitchen" value={draft.note} onChange={(e) => patch({ note: e.target.value })} />
            </div>
          )}

          <div className="mt-3 rounded-2xl bg-white p-4 text-sm">
            {!sent.length && !draftItems.length && <Empty>Pick dishes from the menu.</Empty>}
            <div className="mt-2 flex justify-between text-ink/60"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="flex justify-between text-ink/60"><span>GST ({s.restaurant.gstRate}%)</span><span>{fmt(tax)}</span></div>
            <div className="mt-4 flex justify-between text-lg font-semibold"><span>Total</span><span>{fmt(subtotal + tax)}</span></div>
            {error && <p className="mt-2 text-red-600">{error}</p>}
            {s.offline && draftItems.length > 0 && <p className="mt-2 text-amber-700">You are offline. Send the order when you are back online.</p>}
            <div className="mt-4 flex flex-wrap gap-2 print:hidden">
              <button className="btn btn-ghost flex-1 !py-3" disabled={!sent.length} onClick={() => window.print()}><Printer className="size-4" />Print receipt</button>
              <button className="btn btn-primary flex-1 !py-3" disabled={!draftItems.length || !!blocked || s.offline} onClick={send}><Send className="size-4" />Send to kitchen</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
