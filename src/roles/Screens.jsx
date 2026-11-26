import { useStore, actions, fmt, tableBill, session } from '../store.js'
import { Badge, Empty } from '../ui.jsx'
import { GuestRequests } from '../pages/Admin.jsx'

export function Requests() {
  return <div className="mx-auto max-w-xl space-y-3"><GuestRequests /></div>
}

// Cashier: every table with a running bill
export function Billing() {
  const s = useStore()
  const open = s.tables.map((t) => ({ t, b: tableBill(s, t.id), ss: session(s, t.id) })).filter((x) => x.b.orders.length)
  const order = { bill_requested: 0, bill_approved: 1, paid: 2, open: 3 }
  open.sort((a, b) => order[a.ss.status] - order[b.ss.status])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Billing</h1>
      {!open.length && <Empty>No open bills.</Empty>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{open.map(({ t, b, ss }) => (
        <div key={t.id} className={'card flex flex-col ' + (ss.status === 'bill_requested' ? '!border-amber-400 ring-2 ring-amber-100' : '')}>
          <div className="flex justify-between"><b>{t.label}</b><Badge s={ss.status} /></div>
          <div className="my-2 flex-1 text-sm">{b.orders.flatMap((o) => o.items.map((i) => <div key={o.id + i.id} className="flex justify-between"><span>{i.qty} × {i.name} <span className="text-stone-400">({o.status})</span></span><span>{fmt(i.price * i.qty)}</span></div>))}</div>
          <div className="border-t pt-2 text-sm">
            {[['Subtotal', b.sub], ['CGST', b.cgst], ['SGST', b.sgst], ['Tip', ss.tip]].map(([k, v]) => <div key={k} className="flex justify-between text-stone-500"><span>{k}</span><span>₹{v.toFixed(2)}</span></div>)}
            <div className="flex justify-between text-lg font-black"><span>Total</span><span>{fmt(b.total + ss.tip)}</span></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['open', 'bill_requested'].includes(ss.status) && <button className="btn btn-primary flex-1" onClick={() => actions.approveCheckout(t.id)}>Approve checkout</button>}
            {ss.status === 'bill_approved' && ['Cash', 'UPI'].map((m) => <button key={m} className="btn btn-green flex-1" onClick={() => confirm(`${m} payment received for ${t.label}?`) && actions.markPaid(t.id)}>{m} received</button>)}
            {ss.status === 'paid' && <button className="btn btn-green flex-1" onClick={() => actions.closeTable(t.id)}>Close table</button>}
          </div>
        </div>
      ))}</div>
    </div>
  )
}

// Chef: change stock only, never prices
export function Stock() {
  const s = useStore()
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Stock &amp; sold out</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{s.menu.map((m) => (
        <div key={m.id} className="card flex min-w-0 items-center gap-2 !p-3">
          <span className="text-2xl">{m.emoji}</span>
          <div className="min-w-0 flex-1"><b className="block truncate">{m.name}</b>{m.stock === 0 ? <span className="chip bg-red-100 text-red-700">Sold out</span> : <span className="text-sm text-stone-500">{m.stock} left</span>}</div>
          <button className="btn btn-ghost" aria-label={'Less ' + m.name} disabled={!m.stock} onClick={() => actions.updateMenu(m.id, { stock: m.stock - 1 })}>−</button>
          <button className="btn btn-ghost" aria-label={'More ' + m.name} onClick={() => actions.updateMenu(m.id, { stock: m.stock + 1 })}>+</button>
          {m.stock > 0 && <button className="btn btn-red" onClick={() => actions.updateMenu(m.id, { stock: 0 })}>86</button>}
        </div>
      ))}</div>
    </div>
  )
}
