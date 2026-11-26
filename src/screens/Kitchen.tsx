'use client'

import { useState } from 'react'
import { useStore, actions } from '@/lib/store'
import { useTick, elapsed, isPlatform, orderWhere, Badge } from '@/components/common'

const tabs = ['All', 'Tables', 'Rooms', 'Platform']
export function Kitchen() {
  const s = useStore(); const t = useTick()
  const [tab, setTab] = useState('All')
  const [ack, setAck] = useState<Record<string, boolean>>({})
  const list = s.orders.filter((o) => !o.closed && ['accepted', 'preparing', 'ready'].includes(o.status))
    .filter((o) => tab === 'All' || (tab === 'Tables' && o.source === 'dine_in') || (tab === 'Rooms' && o.source === 'room') || (tab === 'Platform' && isPlatform(o)))
  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-2 text-xl font-semibold">Kitchen</h1>
        {tabs.map((x) => <button key={x} onClick={() => setTab(x)} className={'tab ' + (tab === x ? 'tab-on' : '')}>{x}</button>)}
      </header>
      {!list.length && <div className="mt-32 text-center text-xl text-stone-500">No orders waiting — all caught up! 🎉</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((o) => {
          const queued = s.pending.some((p) => p.args.id === o.id)
          return (
            <div key={o.id} className={'card border-t-4 ' + (o.status === 'accepted' ? '!border-t-indigo-400' : o.status === 'preparing' ? '!border-t-orange-500' : '!border-t-emerald-500')}>
              <div className="flex justify-between"><b>{orderWhere(o)}</b><span className="font-mono font-semibold text-orange-600">{elapsed(o.createdAt, t)}</span></div>
              <div className="mb-2 flex gap-2 text-xs text-stone-500">{o.id} <Badge s={o.status} /></div>
              {o.items.map((i) => <div key={i.id} className="text-lg">{i.qty} × {i.name}</div>)}
              {o.note && <p className="mt-2 text-sm text-sky-700">Note: {o.note}</p>}
              {o.allergyNote && <div className="mt-2 rounded-lg bg-red-600 p-2 text-sm font-bold text-white">⚠ ALLERGY: {o.allergyNote}
                {o.status === 'accepted' && <label className="mt-1 flex gap-2 font-normal"><input type="checkbox" checked={!!ack[o.id]} onChange={(e) => setAck({ ...ack, [o.id]: e.target.checked })} /> Acknowledged</label>}</div>}
              {queued && <p className="mt-2 text-xs text-amber-600">Queued — will sync when online</p>}
              <div className="mt-3">
                {o.status === 'accepted' && <button className="btn btn-primary w-full" disabled={queued || (!!o.allergyNote && !ack[o.id])} onClick={() => actions.setStatus(o.id, 'preparing')}>Start preparing</button>}
                {o.status === 'preparing' && <button className="btn btn-green w-full" disabled={queued} onClick={() => actions.setStatus(o.id, 'ready')}>Ready</button>}
                {o.status === 'ready' && <p className="text-center text-sm font-semibold text-emerald-600">Waiting to be served</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
