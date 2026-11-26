'use client'

import { useState } from 'react'
import { useStore, actions, fmt, orderTotal, tableBill, session, type Order, type OrderItem, type OrderStatus, type Source } from '@/lib/store'
import { DishPhoto } from '@/components/DishPhoto'
import { Badge, Empty, statusColor, useTick, elapsed, isPlatform, orderWhere } from '@/components/common'

function CheckoutList() {
  const s = useStore()
  const list = Object.entries(s.sessions).flatMap(([table, v]) => (v && v.status !== 'open' ? [[table, v] as const] : []))
  return list.map(([table, v]) => {
    const b = tableBill(s, table)
    return (
      <div key={table} className="card border-amber-300">
        <div className="flex justify-between"><b>Checkout · {table.length > 2 ? 'Room' : 'Table'} {table}</b><Badge s={v.status} /></div>
        <p className="text-sm">Bill {fmt(b.total + v.tip)}{v.split > 1 && ` · ${v.paidShares}/${v.split} paid`}</p>
        {v.status === 'bill_requested' && <button className="btn btn-primary mt-2 w-full" onClick={() => actions.approveCheckout(table)}>Approve checkout</button>}
        {v.status === 'paid' && <button className="btn btn-green mt-2 w-full" onClick={() => actions.closeTable(table)}>Close table</button>}
      </div>
    )
  })
}

export function OrderCard({ o }: { o: Order }) {
  const s = useStore(); const t = useTick()
  const queued = s.pending.some((p) => p.args.id === o.id)
  const act = (st: OrderStatus) => () => actions.setStatus(o.id, st)
  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-3">
        <span className={'grid size-14 shrink-0 place-items-center rounded-lg text-sm font-semibold tabular-nums ' + (statusColor[o.status] || 'bg-stone-100')}>{elapsed(o.createdAt, t)}</span>
        <div className="min-w-0 flex-1"><b className="block truncate">{orderWhere(o)}</b><span className="block truncate text-xs text-stone-500">{o.id}{o.customer && ' · ' + o.customer}</span></div>
        <Badge s={o.status} />
      </div>
      {o.items.map((i) => <div key={i.id} className="flex justify-between text-sm"><span>{i.qty} × {i.name}</span><span>{fmt(i.price * i.qty)}</span></div>)}
      {o.note && <p className="text-xs text-sky-700">Note: {o.note}</p>}
      {o.allergyNote && <p className="text-xs font-bold text-red-600">⚠ Allergy: {o.allergyNote}</p>}
      <div className="mt-1 text-right font-bold">{fmt(orderTotal(o) + (o.packaging || 0))}</div>
      {queued ? <p className="text-xs text-amber-600">Queued — will sync when online</p> : (
        <div className="mt-2 flex flex-wrap gap-2">
          {o.status === 'received' && <><button className="btn btn-green flex-1" onClick={act('accepted')}>Accept</button><button className="btn btn-red flex-1" onClick={act('declined')}>Decline</button></>}
          {o.status === 'ready' && <button className="btn btn-primary flex-1" onClick={act('served')}>Mark served</button>}
          {['received', 'accepted', 'preparing'].includes(o.status) && !isPlatform(o) && (
            <select className="input" value="" onChange={(e) => e.target.value && actions.addItemToOrder(o.id, e.target.value)}>
              <option value="">+ Add item</option>{s.menu.filter((m) => m.available && m.stock > 0).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
        </div>
      )}
    </div>
  )
}

export function GuestRequests() {
  const s = useStore()
  const reqs = s.requests.filter((r) => r.status === 'open')
  return (
    <>
      <h2 className="font-bold">Guest requests</h2>
      {!reqs.length && <Empty>No open requests.</Empty>}
      {reqs.map((r) => (
        <div key={r.id} className="card !p-3">
          <b>{r.type} — {r.table.length > 2 ? 'Room' : 'Table'} {r.table}</b>
          <div className="mt-2 flex gap-2">
            <select className="input" value={r.assignedTo} onChange={(e) => actions.assignRequest(r.id, e.target.value)}><option value="">Assign…</option>{s.staff.filter((x) => x.enabled).map((x) => <option key={x.id}>{x.name}</option>)}</select>
            <button className="btn btn-green" disabled={s.pending.some((p) => p.args.id === r.id)} onClick={() => actions.resolveRequest(r.id)}>Done</button>
          </div>
        </div>
      ))}
    </>
  )
}

const filters = ['All', 'New', 'Preparing', 'Ready', 'Served', 'Unpaid', 'Platform'] as const
type Filter = (typeof filters)[number]
export function Orders({ side = true }) {
  const s = useStore(); const [f, setF] = useState<Filter>('All')
  const open = s.orders.filter((o) => !o.closed)
  const match = (o: Order, x: Filter) => ({ All: true, New: o.status === 'received', Preparing: ['accepted', 'preparing'].includes(o.status), Ready: o.status === 'ready', Served: o.status === 'served', Unpaid: !isPlatform(o) && o.status !== 'declined' && session(s, o.table).status !== 'paid', Platform: isPlatform(o) })[x]
  const list = open.filter((o) => match(o, f)).reverse()
  return (
    <div className={'grid grid-cols-1 gap-4 ' + (side ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : '')}>
      <section className="min-w-0">
        <div className="mb-4 flex gap-2 overflow-x-auto">{filters.map((x) => <button key={x} className={'tab ' + (f === x ? 'tab-on' : '')} onClick={() => setF(x)}>{x}<span className="count">{open.filter((o) => match(o, x)).length}</span></button>)}</div>
        {!list.length && <Empty>No orders here.</Empty>}
        <div className="grid gap-3 sm:grid-cols-2">{list.map((o) => <OrderCard key={o.id} o={o} />)}</div>
      </section>
      {side && <aside className="space-y-3">
        <CheckoutList />
        <GuestRequests />
      </aside>}
    </div>
  )
}

export function Messages() {
  const s = useStore(); const [sel, setSel] = useState(''); const [text, setText] = useState('')
  const threads = [...new Set(s.messages.map((m) => m.table))]
  const table = sel || threads[0]
  if (!table) return <Empty>No messages yet.</Empty>
  return (
    <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
      <div className="space-y-2">{threads.map((t) => <button key={t} className={'btn w-full ' + (t === table ? 'btn-primary' : 'btn-ghost')} onClick={() => setSel(t)}>{t.length > 2 ? 'Room' : 'Table'} {t}</button>)}</div>
      <div className="card">
        <div className="mb-3 min-h-[300px] space-y-2">{s.messages.filter((m) => m.table === table).map((m) => <div key={m.id} className={'w-fit max-w-[75%] rounded-2xl px-3 py-2 text-sm ' + (m.from === 'staff' ? 'ml-auto bg-brand text-white' : 'bg-stone-100')}>{m.text}</div>)}</div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { actions.sendMessage(table, 'staff', text.trim()); setText('') } }}><input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply" /><button className="btn btn-primary">Send</button></form>
      </div>
    </div>
  )
}

export function MenuAdmin() {
  const s = useStore(); const [f, setF] = useState<{ name: string; price: string; cat: string; stock: string | number }>({ name: '', price: '', cat: 'Meals', stock: 20 })
  const low = s.menu.filter((m) => m.stock <= 5)
  return (
    <div className="space-y-4">
      {low.length > 0 && <div className="rounded-lg bg-amber-100 p-3 text-sm">⚠ Low stock: {low.map((m) => `${m.name} (${m.stock})`).join(', ')}</div>}
      <form className="card grid gap-2 sm:grid-cols-5" onSubmit={(e) => { e.preventDefault(); actions.addMenu({ ...f, price: +f.price, stock: +f.stock }); setF({ ...f, name: '', price: '' }) }}>
        <input className="input" required placeholder="Dish name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" required type="number" min="1" placeholder="Price ₹" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <select className="input" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}><option>Drinks</option><option>Meals</option><option>Desserts</option></select>
        <input className="input" type="number" min="0" placeholder="Stock" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} />
        <button className="btn btn-primary">Add dish</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-left text-stone-500"><th className="py-2">Dish</th><th>Hindi name</th><th>Category</th><th>Price ₹</th><th>Stock</th><th>Allergens</th><th>Visible</th></tr></thead>
          <tbody>{s.menu.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="py-2"><span className="flex items-center gap-2"><DishPhoto id={m.id} emoji={m.emoji} className="size-10 text-xl" />{m.name}</span></td>
              <td><input className="input" value={m.hi} onChange={(e) => actions.updateMenu(m.id, { hi: e.target.value })} /></td>
              <td>{m.cat}</td>
              <td><input className="input !w-24" type="number" min="1" value={m.price} onChange={(e) => actions.updateMenu(m.id, { price: +e.target.value })} /></td>
              <td><input className="input !w-20" type="number" min="0" value={m.stock} onChange={(e) => actions.updateMenu(m.id, { stock: Math.max(0, +e.target.value) })} />{m.stock === 0 && <span className="chip bg-red-100 text-red-700">Sold out</span>}</td>
              <td className="text-xs">{m.allergens.join(', ') || '—'}</td>
              <td><input type="checkbox" checked={m.available} onChange={(e) => actions.updateMenu(m.id, { available: e.target.checked })} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

export function FrontDesk() {
  const s = useStore()
  const rooms = s.tables.filter((t) => t.type === 'room')
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">{rooms.map((r) => {
        const b = tableBill(s, r.id)
        return <div key={r.id}><div className="mb-2 flex justify-between"><h2 className="font-bold">{r.label}</h2><span>Folio: <b>{fmt(b.total)}</b></span></div>
          {b.orders.length ? <><div className="grid gap-3 sm:grid-cols-2">{b.orders.map((o) => <OrderCard key={o.id} o={o} />)}</div><button className="btn btn-ghost mt-2" onClick={() => { if (confirm(`Charge ${fmt(b.total)} to ${r.label} folio and close?`)) actions.closeTable(r.id) }}>Charge to room & close</button></> : <Empty>No room-service orders.</Empty>}</div>
      })}</div>
      <aside className="space-y-3"><CheckoutList /></aside>
    </div>
  )
}

type PlatformForm = { source: Source; platformNo: string; customer: string; note: string; packaging: number }
export function Platform() {
  const s = useStore()
  const blank: PlatformForm = { source: 'swiggy', platformNo: '', customer: '', note: '', packaging: 20 }
  const [f, setF] = useState(blank); const [items, setItems] = useState<OrderItem[]>([])
  const add = (id: string) => { const m = s.menu.find((x) => x.id === id); if (!m) return; setItems((l) => l.some((i) => i.id === id) ? l.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...l, { id, name: m.name, price: m.price, qty: 1 }]) }
  const list = s.orders.filter((o) => isPlatform(o) && !o.closed)
  const field = (k: Exclude<keyof PlatformForm, 'source'>, ph: string, type = 'text') => <input className="input" type={type} placeholder={ph} value={f[k]} required={k === 'platformNo'} onChange={(e) => setF({ ...f, [k]: type === 'number' ? +e.target.value : e.target.value })} />
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <form className="card space-y-2" onSubmit={(e) => { e.preventDefault(); if (!items.length) return alert('Add at least one item'); actions.addPlatformOrder({ ...f, items }); setF(blank); setItems([]) }}>
        <h2 className="font-bold">New platform order</h2>
        <select className="input" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as Source })}>{['swiggy', 'zomato', 'magicpin', 'ondc', 'phone', 'web'].map((x) => <option key={x}>{x}</option>)}</select>
        {field('platformNo', 'Order number')}{field('customer', 'Customer name')}{field('note', 'Kitchen note')}
        <label className="block text-xs">Packaging charge ₹{field('packaging', 'Packaging', 'number')}</label>
        <select className="input" value="" onChange={(e) => e.target.value && add(e.target.value)}><option value="">+ Add item</option>{s.menu.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        {items.map((i) => <div key={i.id} className="flex justify-between text-sm"><span>{i.qty} × {i.name}</span><button type="button" className="text-red-600" onClick={() => setItems(items.filter((x) => x.id !== i.id))}>remove</button></div>)}
        <button className="btn btn-primary w-full">Send to kitchen</button>
      </form>
      <div>
        {!list.length && <Empty>No platform orders. They stay separate from table bills.</Empty>}
        <div className="grid gap-3 sm:grid-cols-2">{list.map((o) => <div key={o.id}><OrderCard o={o} />{o.status === 'served' && <button className="btn btn-ghost mt-1 w-full" onClick={() => actions.closeOrder(o.id)}>Handed to delivery · close</button>}</div>)}</div>
      </div>
    </div>
  )
}
