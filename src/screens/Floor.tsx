'use client'

import { useState } from 'react'
import { useStore, fmt, tableBill, session, type State, type Table } from '@/lib/store'
import { Empty } from '@/components/common'
import { cn } from '@/lib/utils'

type Kind = 'free' | 'dining' | 'billing' | 'locked'
const LOOK: Record<Kind, { name: string; dot: string; box: string; chair: string }> = {
  free: { name: 'Available', dot: 'bg-indigo-400', box: 'bg-indigo-50 text-indigo-600', chair: 'border-stone-300 bg-white' },
  dining: { name: 'Dining', dot: 'bg-orange-600', box: 'bg-orange-100 text-orange-700', chair: 'border-orange-600 bg-orange-600' },
  billing: { name: 'Billing', dot: 'bg-teal-700', box: 'bg-teal-100 text-teal-800', chair: 'border-teal-700 bg-teal-700' },
  locked: { name: 'Locked', dot: 'bg-stone-400', box: 'bg-stone-200 text-stone-500', chair: 'border-stone-300 bg-stone-300' },
}

function describe(s: State, t: Table) {
  const bill = tableBill(s, t.id); const status = session(s, t.id).status
  const kind: Kind = t.locked ? 'locked' : status !== 'open' ? 'billing' : bill.orders.length ? 'dining' : 'free'
  const detail = status !== 'open' ? status.replace('_', ' ') : LOOK[kind].name
  const items = bill.orders.flatMap((o) => o.items).reduce((a, i) => a + i.qty, 0)
  return { t, kind, detail, items, total: bill.total }
}

const Chair = ({ className }: { className: string }) => <span className={cn('block h-3.5 w-5 rounded-md border-2', className)} />

function TableShape({ info }: { info: ReturnType<typeof describe> }) {
  const look = LOOK[info.kind]
  const row = <div className="flex justify-center gap-3"><Chair className={look.chair} /><Chair className={look.chair} /></div>
  return (
    <div className="flex flex-col items-center gap-2">
      {row}
      <div className={cn('flex h-24 w-32 flex-col items-center justify-center rounded-xl text-center text-sm', look.box)}>
        <b>{info.t.label}</b>
        <span className="text-xs capitalize">{info.detail}</span>
        {info.total > 0 && <span className="text-xs font-semibold">{fmt(info.total)}</span>}
      </div>
      {row}
    </div>
  )
}

const FILTERS = ['all', 'dining', 'billing', 'free'] as const
const AREAS = [['table', 'Dining'], ['room', 'Rooms']] as const

export function Floor() {
  const s = useStore()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all')
  const [area, setArea] = useState<Table['type']>('table')
  const all = s.tables.map((t) => describe(s, t))
  const list = all.filter((x) => filter === 'all' || x.kind === filter)
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
      <section className="order-2 min-w-0 space-y-3 xl:order-1">
        <div className="flex gap-2 overflow-x-auto">{FILTERS.map((f) => (
          <button key={f} className={cn('tab capitalize', filter === f && 'tab-on')} onClick={() => setFilter(f)}>{f === 'free' ? 'Available' : f}<span className="count">{all.filter((x) => f === 'all' || x.kind === f).length}</span></button>
        ))}</div>
        {!list.length && <Empty>No tables here.</Empty>}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">{list.map((x) => (
          <div key={x.t.id} className="card flex items-center gap-3 !p-2.5">
            <div className={cn('grid size-16 shrink-0 place-items-center rounded-lg text-center text-sm font-semibold', LOOK[x.kind].box)}>{LOOK[x.kind].name === 'Available' ? 'Free' : LOOK[x.kind].name}</div>
            <div className="min-w-0 flex-1"><b className="block text-sm">{x.t.label}</b><span className="text-sm text-stone-500">{x.items > 0 && `${x.items} ${x.items === 1 ? 'item' : 'items'} · `}<span className="capitalize">{x.detail}</span></span></div>
            {x.total > 0 && <b className="text-sm">{fmt(x.total)}</b>}
          </div>
        ))}</div>
      </section>
      <section className="card order-1 min-w-0 self-start xl:order-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Floor plan</h2>
          <div className="flex gap-2">{AREAS.map(([key, label]) => <button key={key} className={cn('btn', area === key ? 'btn-primary' : 'btn-ghost')} onClick={() => setArea(key)}>{label}</button>)}</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">{Object.values(LOOK).map((l) => <span key={l.name} className="flex items-center gap-2"><span className={cn('size-2.5 rounded-full', l.dot)} />{l.name}</span>)}</div>
        <div className="mt-4 grid grid-cols-2 justify-items-center gap-x-2 gap-y-8 rounded-xl bg-paper px-2 py-8 md:grid-cols-3">{all.filter((x) => x.t.type === area).map((x) => <TableShape key={x.t.id} info={x} />)}</div>
      </section>
    </div>
  )
}
