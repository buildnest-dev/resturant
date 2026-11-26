import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { useStore, actions, fmt, orderTotal } from '../store.js'
import { Empty, sourceName } from '../ui.jsx'

export function Staff() {
  const s = useStore(); const [f, setF] = useState({ name: '', username: '', role: 'Waiter' }); const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault(); const username = f.username.trim().toLowerCase()
    if (s.staff.some((x) => x.username === username)) return setErr('Username already exists')
    actions.addStaff({ ...f, username }); setF({ name: '', username: '', role: 'Waiter' }); setErr('')
  }
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="card grid gap-2 sm:grid-cols-4">
        <input className="input" required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" required placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
        <select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option>Waiter</option><option>Manager</option><option>Kitchen</option></select>
        <button className="btn btn-primary">Add staff</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <div className="grid gap-3 md:grid-cols-2">{s.staff.map((x) => (
        <div key={x.id} className="card">
          <div className="flex items-center justify-between"><div><b>{x.name}</b> <span className="chip bg-indigo-100">{x.role}</span><div className="text-xs text-stone-500">@{x.username}</div></div>
            <button className={'btn ' + (x.enabled ? 'btn-green' : 'btn-ghost')} onClick={() => actions.updateStaff(x.id, { enabled: !x.enabled })}>{x.enabled ? 'Login on' : 'Login off'}</button></div>
          <div className="mt-3 space-y-1">{s.perms.map((p, i) => <label key={p} className="flex gap-2 text-sm"><input type="checkbox" checked={x.perms.includes(i)} onChange={() => actions.togglePerm(x.id, i)} />{p}</label>)}</div>
        </div>
      ))}</div>
    </div>
  )
}

function QR({ url }) {
  const [src, setSrc] = useState('')
  useEffect(() => { QRCode.toDataURL(url, { width: 180, margin: 1 }).then(setSrc) }, [url])
  return src ? <img src={src} alt={'QR code for ' + url} className="mx-auto" /> : null
}

export function Tables() {
  const s = useStore()
  return (
    <div className="space-y-4">
      <button className="btn btn-ghost print:hidden" onClick={() => window.print()}>Print QR cards</button>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{s.tables.map((t) => {
        const url = `${location.origin}/t/${t.id}`
        return (
          <div key={t.id} className="card text-center">
            <b className="text-lg">{t.label}</b><div className="text-xs text-stone-500">Tap NFC or scan to order · link v{t.tokenVersion}</div>
            <QR url={`${url}?v=${t.tokenVersion}`} />
            <Link className="block break-all text-xs text-brand" to={'/t/' + t.id}>{url}</Link>
            <div className="mt-2 flex gap-2 print:hidden">
              <button className="btn btn-ghost flex-1" onClick={() => actions.updateTable(t.id, { locked: !t.locked })}>{t.locked ? 'Unlock' : 'Lock'}</button>
              <button className="btn btn-ghost flex-1" onClick={() => actions.rotateToken(t.id)}>Rotate link</button>
            </div>
          </div>
        )
      })}</div>
      <div className="card print:hidden"><h2 className="mb-2 font-bold">Abuse flags</h2>
        {!s.abuse.length ? <p className="text-sm text-stone-500">No suspicious activity.</p> : s.abuse.map((a) => <div key={a.id} className="text-sm">⚠ Table {a.table}: {a.why} ({new Date(a.at).toLocaleTimeString()})</div>)}
      </div>
    </div>
  )
}

export function Customers() {
  const s = useStore()
  return (
    <div className="card overflow-x-auto">
      <h2 className="mb-2 font-bold">Customers &amp; loyalty (opted-in only)</h2>
      <table className="w-full text-sm"><thead><tr className="text-left text-stone-500"><th className="py-2">Name</th><th>Phone</th><th>Visits</th><th>Points</th></tr></thead>
        <tbody>{s.customers.map((c) => <tr key={c.id} className="border-t"><td className="py-2">{c.name}</td><td>{c.phone}</td><td>{c.visits}</td><td>{c.points}</td></tr>)}</tbody></table>
    </div>
  )
}

function Bars({ title, data, money }) {
  const max = Math.max(1, ...data.map((d) => d[1]))
  return (
    <div className="card"><h2 className="mb-3 font-bold">{title}</h2>
      {!data.length && <p className="text-sm text-stone-500">No data yet.</p>}
      {data.map(([k, v]) => <div key={k} className="mb-2 text-sm"><div className="flex justify-between"><span>{k}</span><b>{money ? fmt(v) : v}</b></div><div className="h-2 rounded bg-stone-100"><div className="h-2 rounded bg-brand" style={{ width: (v / max) * 100 + '%' }} /></div></div>)}
    </div>
  )
}

export function Reports() {
  const s = useStore()
  const list = s.orders.filter((o) => o.status !== 'declined')
  const sum = (key) => Object.entries(list.reduce((a, o) => { const k = key(o); a[k] = (a[k] || 0) + orderTotal(o); return a }, {})).sort((a, b) => b[1] - a[1])
  const items = Object.entries(list.flatMap((o) => o.items).reduce((a, i) => ({ ...a, [i.name]: (a[i.name] || 0) + i.qty }), {})).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const sales = list.reduce((a, o) => a + orderTotal(o), 0)
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">{[['Order value (before GST)', fmt(sales)], ['Orders', list.length], ['Average order', fmt(list.length ? sales / list.length : 0)]].map(([k, v]) => <div key={k} className="card"><div className="text-sm text-stone-500">{k}</div><div className="text-2xl font-black">{v}</div></div>)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><Bars title="Sales by source" money data={sum((o) => sourceName[o.source])} /><Bars title="Top dishes (quantity)" data={items} /></div>
    </div>
  )
}

export function Feedback() {
  const s = useStore()
  const avg = s.feedback.reduce((a, f) => a + f.rating, 0) / (s.feedback.length || 1)
  return (
    <div className="space-y-3">
      <div className="card"><span className="text-3xl font-black">{avg.toFixed(1)}</span> ★ average from {s.feedback.length} ratings</div>
      {!s.feedback.length && <Empty>No feedback yet.</Empty>}
      {[...s.feedback].reverse().map((f) => <div key={f.id} className={'card ' + (f.rating <= 3 ? 'border-red-300' : '')}><span className="text-amber-500">{'★'.repeat(f.rating)}</span> · Table {f.table}{f.rating <= 3 && <span className="chip ml-2 bg-red-100 text-red-700">Needs attention</span>}<p className="text-sm">{f.comment || '(no comment)'}</p></div>)}
    </div>
  )
}

export function Settings() {
  const s = useStore()
  return (
    <div className="max-w-md space-y-4">
      <div className="card space-y-2"><h2 className="font-bold">Restaurant</h2><p className="text-sm">{s.restaurant.name} · {s.restaurant.id}<br />GSTIN {s.restaurant.gst} (sample)</p>
        <label className="block text-sm">GST rate %<input className="input" type="number" min="0" max="28" value={s.restaurant.gstRate} onChange={(e) => actions.setGst(Math.min(28, Math.max(0, +e.target.value)))} /></label>
        <p className="text-xs text-stone-500">Menu languages: English, Hindi</p></div>
      <button className="btn btn-red" onClick={() => { if (confirm('Reset all demo data?')) actions.reset() }}>Reset demo data</button>
      <p className="text-xs text-stone-500">Powered by ZAQSA</p>
    </div>
  )
}
