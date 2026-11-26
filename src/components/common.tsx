'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { Order, Source } from '@/lib/store'

export const statusColor: Record<string, string> = {
  received: 'bg-sky-100 text-sky-800', accepted: 'bg-indigo-100 text-indigo-800', preparing: 'bg-amber-100 text-amber-800',
  ready: 'bg-emerald-100 text-emerald-800', served: 'bg-stone-200 text-stone-700', declined: 'bg-red-100 text-red-700',
}
export const Badge = ({ s }: { s: string }) => <span className={'chip capitalize ' + (statusColor[s] || 'bg-stone-100')}>{s.replace('_', ' ')}</span>
export const Loading = () => <div className="grid min-h-screen place-items-center text-sm text-stone-500">Loading…</div>
export const Empty = ({ children }: { children: ReactNode }) => <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">{children}</div>
export const Logo = ({ dark }: { dark?: boolean }) => (
  <span className={'text-xl font-black tracking-wide ' + (dark ? 'text-white' : 'text-ink')}>
    ZAQ<span className="text-brand">SA</span>
  </span>
)
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-5 text-stone-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold">{title}</h3><button className="btn btn-ghost" onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  )
}
export function useTick(ms = 1000) {
  const [t, setT] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setT(Date.now()), ms); return () => clearInterval(i) }, [ms])
  return t
}
export const elapsed = (from: number, to: number) => { const s = Math.max(0, Math.floor((to - from) / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
export const sourceName: Record<Source, string> = { dine_in: 'Dine-in', room: 'Room', swiggy: 'Swiggy', zomato: 'Zomato', magicpin: 'Magicpin', ondc: 'ONDC', phone: 'Phone', web: 'Own website' }
export const isPlatform = (o: Order) => !['dine_in', 'room'].includes(o.source)
export const orderWhere = (o: Order) => isPlatform(o) ? `${sourceName[o.source]} #${o.platformNo || '-'}` : `${o.source === 'room' ? 'Room' : 'Table'} ${o.table}`
