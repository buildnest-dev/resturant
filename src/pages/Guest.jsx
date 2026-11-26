import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useStore, actions, fmt, tableBill, session, orderTotal } from '../store.js'
import { Badge, Empty, Logo, Modal } from '../ui.jsx'

const T = {
  en: { search: 'Search dishes', add: 'ADD', sold: 'Sold out', menu: 'Menu', cart: 'Cart', track: 'Track', chat: 'Chat', bill: 'Bill' },
  hi: { search: 'व्यंजन खोजें', add: 'जोड़ें', sold: 'खत्म', menu: 'मेनू', cart: 'कार्ट', track: 'स्थिति', chat: 'चैट', bill: 'बिल' },
}

export function GuestLayout() {
  const { table } = useParams(); const s = useStore()
  const tb = s.tables.find((t) => t.id === table)
  const [cart, setCart] = useState(() => JSON.parse(sessionStorage.getItem('cart-' + table) || '{}'))
  const [lang, setLang] = useState(navigator.language.startsWith('hi') ? 'hi' : 'en')
  const [avoid, setAvoid] = useState([])
  const [toast, setToast] = useState('')
  const change = (id, d) => setCart((c) => {
    const n = { ...c, [id]: Math.max(0, (c[id] || 0) + d) }; if (!n[id]) delete n[id]
    sessionStorage.setItem('cart-' + table, JSON.stringify(n)); return n
  })
  const clear = () => { sessionStorage.removeItem('cart-' + table); setCart({}) }
  const notify = (m) => { setToast(m); setTimeout(() => setToast(''), 2500) }

  if (!tb || tb.locked) return (
    <div className="grid min-h-screen place-items-center p-6 text-center"><div><Logo /><h1 className="mt-4 text-xl font-bold">{tb ? 'This table is locked' : 'Invalid table link'}</h1><p className="text-stone-500">Please ask our staff for help.</p><Link className="btn btn-ghost mt-4" to="/signin">All pages</Link></div></div>
  )
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const nav = [['', 'menu', '🍽️'], ['cart', 'cart', '🛒'], ['track', 'track', '⏱️'], ['chat', 'chat', '💬'], ['bill', 'bill', '🧾']]
  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0 md:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-white p-3 md:flex print:!hidden">
        <Link to="/" className="px-2 py-1"><Logo /></Link>
        <div className="my-3 rounded-xl bg-indigo-50 p-3 text-sm"><b className="block">{s.restaurant.name}</b><span className="text-stone-500">Customer · {tb.label}</span></div>
        <nav className="flex flex-col gap-1">{nav.map(([p, k, icon]) => (
          <NavLink key={k} end to={`/t/${table}/${p}`} className={({ isActive }) => 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ' + (isActive ? 'bg-brand text-white' : 'text-stone-600 hover:bg-indigo-50')}><span>{icon}</span>{T[lang][k]}{k === 'cart' && count > 0 && <span className="chip ml-auto bg-white text-brand">{count}</span>}</NavLink>
        ))}</nav>
        <Link className="btn btn-ghost mt-auto" to="/signin">Switch role</Link>
      </aside>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <Link to="/signin" className="md:invisible"><Logo /></Link>
        <div className="text-center text-xs"><b className="block text-sm">{s.restaurant.name}</b>{tb.label}</div>
        <button className="btn btn-ghost" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>{lang === 'en' ? 'हिं' : 'EN'}</button>
      </header>
      <div className="mx-auto max-w-5xl p-4 md:p-6"><Outlet context={{ table, tb, cart, change, clear, lang, t: T[lang], avoid, setAvoid, notify }} /></div>
      {toast && <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white">{toast}</div>}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-white md:hidden print:hidden">
        {nav.map(([p, k, icon]) => (
          <NavLink key={k} end to={`/t/${table}/${p}`} className={({ isActive }) => 'relative flex-1 py-2 text-center text-xs ' + (isActive ? 'font-bold text-brand' : 'text-stone-500')}>
            <div className="text-lg">{icon}</div>{T[lang][k]}
            {k === 'cart' && count > 0 && <span className="absolute right-3 top-1 chip bg-brand text-white">{count}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function Menu() {
  const { table, cart, change, lang, t, avoid, setAvoid, notify } = useOutletContext(); const s = useStore()
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [group, setGroup] = useState(false)
  const link = location.origin + '/t/' + table
  const voice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return notify('Voice not supported in this browser')
    const r = new SR(); r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    r.onresult = (e) => { setQ(e.results[0][0].transcript.replace(/\.$/, '')); notify('Check the result, then tap ADD') }
    r.onerror = () => notify('Could not hear you. Try again.')
    r.start(); notify('Listening…')
  }
  const ask = (type) => { if (type === 'Bill please') { if (!tableBill(s, table).orders.length) return notify('Order something first'); actions.requestBill(table) } else actions.addRequest(table, type); notify(type + ' sent to staff') }
  const list = s.menu.filter((m) => m.available && (cat === 'All' || m.cat === cat) && (m.name + m.hi).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {[['Call waiter', '🙋'], ['Water', '💧'], ['Bill please', '🧾'], ['Clean table', '🧽']].map(([x, i]) => (
          <button key={x} className="btn btn-ghost flex-col !px-1 text-xs" onClick={() => ask(x)}><span className="text-lg">{i}</span>{x}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-ghost" title="Voice search" onClick={voice}>🎤</button>
        <button className="btn btn-ghost whitespace-nowrap" onClick={() => setGroup(true)}>👥 Group</button>
      </div>
      <div className="flex gap-2 overflow-x-auto">{['All', ...new Set(s.menu.map((m) => m.cat))].map((c) => <button key={c} onClick={() => setCat(c)} className={'btn ' + (cat === c ? 'btn-primary' : 'btn-ghost')}>{c}</button>)}</div>
      <div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-stone-500">I avoid:</span>
        {['Nuts', 'Dairy', 'Gluten'].map((a) => <button key={a} onClick={() => setAvoid(avoid.includes(a) ? avoid.filter((x) => x !== a) : [...avoid, a])} className={'chip border ' + (avoid.includes(a) ? 'border-red-600 bg-red-600 text-white' : 'border-stone-300')}>{a}</button>)}
      </div>
      {!list.length && <Empty>No dishes found.</Empty>}
      <div className="grid gap-3 lg:grid-cols-2">{list.map((m) => {
        const warn = m.allergens.filter((a) => avoid.includes(a)); const out = m.stock === 0
        return (
          <div key={m.id} className={'card flex gap-3 !p-3 ' + (out || warn.length ? 'opacity-60' : '')}>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-indigo-50 text-3xl">{m.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold"><span className={m.veg ? 'text-green-600' : 'text-red-600'}>● </span>{lang === 'hi' ? m.hi : m.name}</div>
              <div className="text-xs text-stone-500">⏱ ~{m.prep}–{m.prep + 5} min{!out && m.stock <= 5 && <b className="text-amber-600"> · only {m.stock} left</b>}</div>
              {warn.length > 0 && <div className="text-xs font-bold text-red-600">⚠ Contains {warn.join(', ')}</div>}
              <div className="mt-1 font-bold">{fmt(m.price)}</div>
            </div>
            <div className="self-end">
              {out ? <span className="chip bg-stone-200">{t.sold}</span> : cart[m.id]
                ? <div className="flex items-center gap-2"><button className="btn btn-ghost" onClick={() => change(m.id, -1)}>−</button><b>{cart[m.id]}</b><button className="btn btn-primary" disabled={cart[m.id] >= m.stock} onClick={() => change(m.id, 1)}>+</button></div>
                : <button className="btn btn-primary" onClick={() => change(m.id, 1)}>{t.add}</button>}
            </div>
          </div>
        )
      })}</div>
      <p className="text-center text-xs text-stone-400">Allergen info is guidance only. Please confirm with staff.</p>
      {group && <Modal title="Order together" onClose={() => setGroup(false)}><p className="mb-2 text-sm">Share this link so everyone at the table can add dishes. (Demo: shared cart sync needs the backend.)</p><input className="input" readOnly value={link} /><button className="btn btn-primary mt-3 w-full" onClick={() => { navigator.clipboard?.writeText(link); notify('Link copied'); setGroup(false) }}>Copy link</button></Modal>}
    </div>
  )
}

export function Cart() {
  const { table, cart, change, clear, avoid, notify } = useOutletContext(); const s = useStore(); const go = useNavigate()
  const [note, setNote] = useState('')
  const items = Object.entries(cart).map(([id, qty]) => ({ ...s.menu.find((m) => m.id === id), qty })).filter((i) => i.id)
  const sub = items.reduce((a, i) => a + i.price * i.qty, 0)
  const pairs = [...new Set(items.flatMap((i) => i.pairs))].filter((id) => !cart[id]).map((id) => s.menu.find((m) => m.id === id)).filter((m) => m && m.available && m.stock > 0).slice(0, 3)
  const place = () => {
    if (!navigator.onLine) return notify('You are offline. Reconnecting…')
    const recent = s.orders.filter((o) => o.table === table && Date.now() - o.createdAt < 60000).length
    if (recent >= 3) { actions.logAbuse(table, 'Too many orders in 1 minute'); return notify('Too many orders. Please call staff.') }
    actions.placeOrder(table, items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })), note, avoid.join(', '))
    clear(); go(`/t/${table}/track`)
  }
  if (!items.length) return <Empty>Your cart is empty. <Link className="text-brand" to={`/t/${table}`}>Browse the menu</Link></Empty>
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <h2 className="text-lg font-bold">Your cart</h2>
      {items.map((i) => <div key={i.id} className="card flex items-center justify-between !p-3"><div><b>{i.name}</b><div className="text-sm text-stone-500">{fmt(i.price)} · added by you</div></div><div className="flex items-center gap-2"><button className="btn btn-ghost" onClick={() => change(i.id, -1)}>−</button><b>{i.qty}</b><button className="btn btn-ghost" disabled={i.qty >= i.stock} onClick={() => change(i.id, 1)}>+</button></div></div>)}
      {pairs.length > 0 && <div><h3 className="mb-1 text-sm font-bold text-brand">✨ Goes well with</h3><div className="flex gap-2 overflow-x-auto">{pairs.map((m) => <button key={m.id} className="card !p-2 text-left text-sm" onClick={() => change(m.id, 1)}><div className="text-2xl">{m.emoji}</div><div className="whitespace-nowrap">{m.name}</div><b>+ {fmt(m.price)}</b></button>)}</div></div>}
      <textarea className="input" placeholder="Note for kitchen" value={note} onChange={(e) => setNote(e.target.value)} />
      {avoid.length > 0 && <p className="text-sm font-semibold text-red-600">Kitchen will be warned: avoid {avoid.join(', ')}</p>}
      <div className="flex justify-between font-bold"><span>Subtotal</span><span>{fmt(sub)}</span></div>
      <button className="btn btn-primary w-full !py-3" onClick={place}>Place order</button>
    </div>
  )
}

const steps = ['received', 'preparing', 'ready', 'served']
export function Track() {
  const { table } = useOutletContext(); const s = useStore()
  const list = s.orders.filter((o) => o.table === table && !o.closed)
  if (!list.length) return <Empty>No active orders yet.</Empty>
  return (
    <div className="mx-auto max-w-2xl space-y-3">{[...list].reverse().map((o) => {
      const idx = o.status === 'accepted' ? 0 : steps.indexOf(o.status)
      return (
        <div key={o.id} className="card">
          <div className="flex justify-between"><b>{o.id}</b><Badge s={o.status} /></div>
          {o.status === 'declined' ? <p className="mt-2 text-sm text-red-600">Sorry, this order was declined. Please call staff.</p> : (
            <div className="my-3 flex">{steps.map((st, i) => <div key={st} className="flex-1 text-center text-xs capitalize"><div className={'mb-1 h-2 ' + (i <= idx ? 'bg-brand' : 'bg-stone-200')} />{st}</div>)}</div>
          )}
          {o.items.map((i) => <div key={i.id} className="flex justify-between text-sm"><span>{i.qty} × {i.name}</span><span>{fmt(i.price * i.qty)}</span></div>)}
          <div className="mt-2 text-right font-bold">{fmt(orderTotal(o))}</div>
        </div>
      )
    })}</div>
  )
}

export function Chat() {
  const { table } = useOutletContext(); const s = useStore(); const [text, setText] = useState('')
  const msgs = s.messages.filter((m) => m.table === table)
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 min-h-[55vh] space-y-2">
        {!msgs.length && <Empty>Say hello to our staff 👋</Empty>}
        {msgs.map((m) => <div key={m.id} className={'w-fit max-w-[80%] rounded-2xl px-3 py-2 text-sm ' + (m.from === 'guest' ? 'ml-auto bg-brand text-white' : 'bg-stone-100')}>{m.text}</div>)}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { actions.sendMessage(table, 'guest', text.trim()); setText('') } }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" /><button className="btn btn-primary">Send</button>
      </form>
    </div>
  )
}

export function Bill() {
  const { table } = useOutletContext(); const s = useStore()
  const [pay, setPay] = useState(false)
  const b = tableBill(s, table); const ss = session(s, table)
  if (!b.orders.length) return <Empty>No bill yet. Order something tasty first.</Empty>
  const total = b.total + ss.tip; const share = total / ss.split
  const approved = ss.status === 'bill_approved'; const paid = ss.status === 'paid'
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="card print:shadow-none">
        <h2 className="text-center font-bold">{s.restaurant.name}</h2><p className="mb-2 text-center text-xs text-stone-500">GSTIN {s.restaurant.gst}</p>
        {b.orders.flatMap((o) => o.items.map((i) => <div key={o.id + i.id} className="flex justify-between text-sm"><span>{i.qty} × {i.name}</span><span>{fmt(i.price * i.qty)}</span></div>))}
        <hr className="my-2" />
        {[['Subtotal', b.sub], ['CGST', b.cgst], ['SGST', b.sgst], ['Tip', ss.tip]].map(([k, v]) => <div key={k} className="flex justify-between text-sm"><span>{k}</span><span>₹{v.toFixed(2)}</span></div>)}
        <div className="mt-1 flex justify-between text-lg font-black"><span>Total</span><span>{fmt(total)}</span></div>
        {paid && <p className="mt-2 text-center font-bold text-emerald-600">✔ PAID</p>}
      </div>
      {ss.status === 'open' && <button className="btn btn-primary w-full" onClick={() => actions.requestBill(table)}>Request final bill</button>}
      {ss.status === 'bill_requested' && <Empty>Waiting for staff to approve checkout…<br /><Link className="text-brand" to="/cashier">(demo: approve in Cashier → Billing)</Link></Empty>}
      {approved && (
        <div className="card space-y-3">
          <div><p className="mb-1 text-sm font-bold">Add a tip</p><div className="flex gap-2">{[0, 20, 50, 100].map((v) => <button key={v} disabled={ss.paidShares > 0} className={'btn flex-1 ' + (ss.tip === v ? 'btn-primary' : 'btn-ghost')} onClick={() => actions.setSplit(table, { tip: v })}>{v ? fmt(v) : 'None'}</button>)}</div></div>
          <div><p className="mb-1 text-sm font-bold">Split equally</p><div className="flex gap-2">{[1, 2, 3, 4].map((n) => <button key={n} disabled={ss.paidShares > 0} className={'btn flex-1 ' + (ss.split === n ? 'btn-primary' : 'btn-ghost')} onClick={() => actions.setSplit(table, { split: n })}>{n}</button>)}</div></div>
          <button className="btn btn-green w-full !py-3" onClick={() => setPay(true)}>Pay {fmt(share)} by UPI ({ss.paidShares + 1}/{ss.split})</button>
        </div>
      )}
      {(approved || paid) && <button className="btn btn-ghost w-full" onClick={() => window.print()}>Save / print bill</button>}
      {paid && <Link className="btn btn-primary w-full" to={`/t/${table}/thanks`}>Continue</Link>}
      {pay && <Modal title="UPI payment (demo)" onClose={() => setPay(false)}><p className="mb-3 text-center text-3xl font-black">{fmt(share)}</p><p className="mb-3 text-center text-xs text-stone-500">No real money moves in this demo.</p><button className="btn btn-green w-full" onClick={() => { actions.payShare(table); setPay(false) }}>Simulate successful payment</button></Modal>}
    </div>
  )
}

export function Thanks() {
  const { table, notify } = useOutletContext(); const s = useStore()
  const [rating, setRating] = useState(0); const [comment, setComment] = useState(''); const [sent, setSent] = useState(false)
  const [phone, setPhone] = useState(''); const [ok, setOk] = useState(false); const [joined, setJoined] = useState(false)
  const points = Math.floor(tableBill(s, table).total / 10)
  return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <div className="text-5xl">🙏</div><h2 className="text-2xl font-black">Thank you!</h2>
      <div className="card">
        <p className="font-bold">Rate your experience</p>
        <div className="text-3xl">{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={n + ' stars'} onClick={() => { setRating(n); setSent(false) }} className={n <= rating ? 'text-amber-400' : 'text-stone-300'}>★</button>)}</div>
        {rating > 0 && !sent && <><textarea className="input" placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} /><button className="btn btn-primary mt-2 w-full" onClick={() => { actions.saveFeedback(table, rating, comment); setSent(true) }}>Submit</button></>}
        {sent && (rating >= 4 ? <a className="btn btn-green mt-2 w-full" target="_blank" rel="noreferrer" href="https://www.google.com/maps">Leave a Google Review ⭐</a> : <p className="mt-2 text-sm">Sorry about that. Your feedback went privately to the manager.</p>)}
      </div>
      <div className="card text-left">
        <p className="font-bold">Join rewards (optional)</p>
        {joined ? <p className="text-sm text-emerald-600">Joined! {points} points added.</p> : <>
          <input className="input mt-2" inputMode="numeric" maxLength={10} placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
          <label className="mt-2 flex gap-2 text-xs"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> I agree to store my number for rewards.</label>
          <button className="btn btn-ghost mt-2 w-full" disabled={!ok || phone.length !== 10} onClick={() => { actions.joinLoyalty('Guest', phone.slice(0, 2) + 'xxxxxx' + phone.slice(-2), points); setJoined(true); notify('Welcome!') }}>Join</button>
        </>}
      </div>
    </div>
  )
}
