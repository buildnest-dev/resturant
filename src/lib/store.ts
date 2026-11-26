'use client'

import { useSyncExternalStore } from 'react'

export type Source = 'dine_in' | 'room' | 'swiggy' | 'zomato' | 'magicpin' | 'ondc' | 'phone' | 'web'
export type OrderStatus = 'received' | 'accepted' | 'preparing' | 'ready' | 'served' | 'declined'
export type SessionStatus = 'open' | 'bill_requested' | 'bill_approved' | 'paid'
export type MenuItem = { id: string; cat: string; name: string; hi: string; price: number; prep: number; stock: number; available: boolean; allergens: string[]; veg: boolean; emoji: string; pairs: string[] }
export type OrderItem = { id: string; name: string; price: number; qty: number }
export type Order = { id: string; table: string; source: Source; status: OrderStatus; items: OrderItem[]; note: string; allergyNote: string; createdAt: number; closed: boolean; customer?: string; platformNo?: string; packaging?: number }
export type PlatformOrder = Pick<Order, 'source' | 'items' | 'note' | 'customer' | 'platformNo' | 'packaging'>
export type Table = { id: string; label: string; type: 'table' | 'room'; locked: boolean; tokenVersion: number }
export type GuestRequest = { id: string; table: string; type: string; status: 'open' | 'done'; assignedTo: string; createdAt: number }
export type Message = { id: string; table: string; from: 'guest' | 'staff'; text: string; at: number }
export type Session = { status: SessionStatus; split: number; tip: number; paidShares: number; paidAt?: number; method?: string }
export type StaffMember = { id: string; name: string; username: string; role: string; enabled: boolean; perms: number[] }
export type Customer = { id: string; name: string; phone: string; visits: number; points: number }
export type FeedbackEntry = { id: string; table: string; rating: number; comment: string; at: number }
export type AbuseFlag = { id: string; table: string; why: string; at: number }
// actions made while offline, replayed when back online
export type PendingAction =
  | { type: 'status'; args: { id: string; status: OrderStatus }; at: number }
  | { type: 'resolve'; args: { id: string }; at: number }
export type State = {
  restaurant: { name: string; id: string; gst: string; gstRate: number }
  menu: MenuItem[]
  tables: Table[]
  orders: Order[]
  requests: GuestRequest[]
  messages: Message[]
  sessions: Record<string, Session | undefined>
  staff: StaffMember[]
  perms: string[]
  customers: Customer[]
  feedback: FeedbackEntry[]
  abuse: AbuseFlag[]
  offline: boolean
  pending: PendingAction[]
}

const KEY = 'zaqsa-v1'
export const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase()
const now = () => Date.now()

export const GST_RATE = 0.05
export const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

const menu: MenuItem[] = [
  { id: 'm1', cat: 'Drinks', name: 'Fresh Mint Mojito', hi: 'फ्रेश मिंट मोजितो', price: 140, prep: 5, stock: 40, available: true, allergens: [], veg: true, emoji: '🍹', pairs: ['m5', 'm7'] },
  { id: 'm2', cat: 'Drinks', name: 'Cold Coffee with Ice Cream', hi: 'आइसक्रीम के साथ कोल्ड कॉफ़ी', price: 140, prep: 6, stock: 30, available: true, allergens: ['Dairy'], veg: true, emoji: '🧋', pairs: ['m10'] },
  { id: 'm3', cat: 'Drinks', name: 'Masala Chai', hi: 'मसाला चाय', price: 60, prep: 4, stock: 60, available: true, allergens: ['Dairy'], veg: true, emoji: '☕', pairs: ['m6'] },
  { id: 'm4', cat: 'Meals', name: 'Paneer Butter Masala', hi: 'पनीर बटर मसाला', price: 260, prep: 15, stock: 20, available: true, allergens: ['Dairy', 'Nuts'], veg: true, emoji: '🍛', pairs: ['m8', 'm1'] },
  { id: 'm5', cat: 'Meals', name: 'Chicken Biryani', hi: 'चिकन बिरयानी', price: 320, prep: 20, stock: 15, available: true, allergens: [], veg: false, emoji: '🍚', pairs: ['m1', 'm3'] },
  { id: 'm6', cat: 'Meals', name: 'Veg Sandwich', hi: 'वेज सैंडविच', price: 120, prep: 8, stock: 25, available: true, allergens: ['Gluten', 'Dairy'], veg: true, emoji: '🥪', pairs: ['m3', 'm2'] },
  { id: 'm7', cat: 'Meals', name: 'Margherita Pizza', hi: 'मार्गेरिटा पिज़्ज़ा', price: 280, prep: 18, stock: 3, available: true, allergens: ['Gluten', 'Dairy'], veg: true, emoji: '🍕', pairs: ['m1'] },
  { id: 'm8', cat: 'Meals', name: 'Butter Naan', hi: 'बटर नान', price: 50, prep: 6, stock: 80, available: true, allergens: ['Gluten', 'Dairy'], veg: true, emoji: '🫓', pairs: ['m4'] },
  { id: 'm9', cat: 'Desserts', name: 'Gulab Jamun', hi: 'गुलाब जामुन', price: 90, prep: 4, stock: 0, available: true, allergens: ['Dairy', 'Gluten'], veg: true, emoji: '🍮', pairs: ['m3'] },
  { id: 'm10', cat: 'Desserts', name: 'Chocolate Brownie', hi: 'चॉकलेट ब्राउनी', price: 150, prep: 5, stock: 18, available: true, allergens: ['Nuts', 'Gluten', 'Dairy'], veg: true, emoji: '🍫', pairs: ['m2'] },
  { id: 'm11', cat: 'Desserts', name: 'Vanilla Ice Cream', hi: 'वनीला आइसक्रीम', price: 100, prep: 2, stock: 35, available: true, allergens: ['Dairy'], veg: true, emoji: '🍨', pairs: ['m10'] },
]

const perms = ['Accept & serve orders', 'View bills & history', 'Checkout approval', 'Edit menu', 'Discounts / GST / price changes', 'Tables & QR cards', 'Customer list', 'Reports']

function seed(): State {
  const t = now()
  return {
    restaurant: { name: 'The Grand Hotel', id: 'XH10001', gst: '27ABCDE1234F1Z5', gstRate: 5 },
    menu,
    tables: [
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: 'Table ' + n, type: 'table' as const, locked: false, tokenVersion: 1 })),
      ...['101', '102', '103'].map((n) => ({ id: n, label: 'Room ' + n, type: 'room' as const, locked: false, tokenVersion: 1 })),
    ],
    orders: [
      { id: 'O-1001', table: '2', source: 'dine_in', status: 'preparing', items: [{ id: 'm5', name: 'Chicken Biryani', price: 320, qty: 1 }], note: '', allergyNote: '', createdAt: t - 9 * 60000, closed: false },
      { id: 'O-1002', table: '101', source: 'room', status: 'received', items: [{ id: 'm3', name: 'Masala Chai', price: 60, qty: 2 }], note: 'Less sugar', allergyNote: '', createdAt: t - 2 * 60000, closed: false },
    ],
    requests: [{ id: 'R-1', table: '1', type: 'Clean table', status: 'open', assignedTo: '', createdAt: t - 4 * 60000 }],
    messages: [{ id: 'C-1', table: '2', from: 'guest', text: 'Can we get extra raita?', at: t - 5 * 60000 }],
    sessions: {}, // table -> { status: open|bill_requested|bill_approved|paid, split, tip, paidShares }
    staff: [
      { id: 's1', name: 'Ravi Kumar', username: 'ravi', role: 'Waiter', enabled: true, perms: [0, 1] },
      { id: 's2', name: 'Meena Singh', username: 'meena', role: 'Manager', enabled: true, perms: [0, 1, 2, 3, 4, 5, 6, 7] },
      { id: 's3', name: 'Arjun Das', username: 'arjun', role: 'Kitchen', enabled: true, perms: [0] },
    ],
    perms,
    customers: [
      { id: 'c1', name: 'Aman', phone: '98xxxxxx21', visits: 4, points: 320 },
      { id: 'c2', name: 'Priya', phone: '99xxxxxx08', visits: 2, points: 110 },
    ],
    feedback: [{ id: 'f1', table: '3', rating: 5, comment: 'Quick and tasty!', at: t - 86400000 }],
    abuse: [],
    offline: false,
    pending: [],
  }
}

// Data is read from the browser on first use, so importing this file is safe on the server.
let state: State | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
function load(): State {
  if (typeof window === 'undefined') return seed()
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') || seed() } catch { return seed() }
}
const get = () => (state ??= load())
const commit = (next: State) => { state = next; localStorage.setItem(KEY, JSON.stringify(next)); emit() }
function set(fn: (d: State) => void) { const d = structuredClone(get()); fn(d); commit(d) }

// keep other open tabs in step
const onStorage = (e: StorageEvent) => {
  if (e.key === KEY && e.newValue) { state = JSON.parse(e.newValue); emit() }
}
function subscribe(cb: () => void) {
  if (!listeners.size) {
    window.addEventListener('storage', onStorage)
    // pick up changes made in other tabs while nothing here was listening
    if (localStorage.getItem(KEY)) state = load()
  }
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
    if (!listeners.size) window.removeEventListener('storage', onStorage)
  }
}

export const useStore = () => useSyncExternalStore(subscribe, get, get)

export const orderTotal = (o: Order) => o.items.reduce((s, i) => s + i.price * i.qty, 0)
export function tableBill(s: State, table: string) {
  const orders = s.orders.filter((o) => o.table === table && !o.closed && o.status !== 'declined')
  const sub = orders.reduce((a, o) => a + orderTotal(o), 0)
  const gst = Math.round(sub * (s.restaurant.gstRate / 100))
  return { orders, sub, cgst: gst / 2, sgst: gst / 2, total: sub + gst }
}
export const session = (s: State, table: string): Session => s.sessions[table] || { status: 'open', split: 1, tip: 0, paidShares: 0 }

const takeStock = (d: State, items: Pick<OrderItem, 'id' | 'qty'>[]) => items.forEach((i) => { const m = d.menu.find((x) => x.id === i.id); if (m) m.stock = Math.max(0, m.stock - i.qty) })
function applyPending(d: State, p: PendingAction) {
  if (p.type === 'status') {
    const o = d.orders.find((x) => x.id === p.args.id)
    if (!o) return
    if (p.args.status === 'accepted' && o.status === 'received') takeStock(d, o.items)
    o.status = p.args.status
  } else {
    const r = d.requests.find((x) => x.id === p.args.id)
    if (r) r.status = 'done'
  }
}
const queueable = (p: PendingAction) => set((d) => {
  if (d.offline) d.pending.push(p)
  else applyPending(d, p)
})
function must<T extends { id: string }>(list: T[], id: string): T {
  const found = list.find((x) => x.id === id)
  if (!found) throw new Error('Not found: ' + id)
  return found
}

export const actions = {
  reset: () => commit(seed()),
  placeOrder(table: string, items: OrderItem[], note: string, allergyNote: string) {
    set((d) => {
      if (d.sessions[table]?.status === 'paid') { d.orders.filter((o) => o.table === table).forEach((o) => (o.closed = true)); delete d.sessions[table] }
      const tb = d.tables.find((t) => t.id === table)
      d.orders.push({ id: 'O-' + (1000 + d.orders.length + 1 + Math.floor(Math.random() * 9)), table, source: tb?.type === 'room' ? 'room' : 'dine_in', status: 'received', items, note, allergyNote, createdAt: now(), closed: false })
    })
  },
  addPlatformOrder(o: PlatformOrder) {
    set((d) => { d.orders.push({ id: 'P-' + uid(), table: '-', status: 'accepted', closed: false, createdAt: now(), allergyNote: '', ...o }); takeStock(d, o.items) })
  },
  addItemToOrder(orderId: string, itemId: string) {
    set((d) => {
      const o = must(d.orders, orderId); const m = must(d.menu, itemId)
      if (o.status !== 'received') takeStock(d, [{ id: itemId, qty: 1 }])
      const ex = o.items.find((i) => i.id === itemId)
      if (ex) ex.qty += 1; else o.items.push({ id: m.id, name: m.name, price: m.price, qty: 1 })
    })
  },
  setStatus: (id: string, status: OrderStatus) => queueable({ type: 'status', args: { id, status }, at: now() }),
  closeOrder: (id: string) => set((d) => { must(d.orders, id).closed = true }),
  addRequest(table: string, type: string) {
    set((d) => { d.requests.push({ id: 'R-' + uid(), table, type, status: 'open', assignedTo: '', createdAt: now() }) })
  },
  assignRequest: (id: string, who: string) => set((d) => { must(d.requests, id).assignedTo = who }),
  resolveRequest: (id: string) => queueable({ type: 'resolve', args: { id }, at: now() }),
  sendMessage(table: string, from: Message['from'], text: string) {
    set((d) => { d.messages.push({ id: 'C-' + uid(), table, from, text, at: now() }) })
  },
  requestBill(table: string) {
    set((d) => {
      d.sessions[table] = { ...session(d, table), status: 'bill_requested' }
      d.requests.push({ id: 'R-' + uid(), table, type: 'Bill please', status: 'open', assignedTo: '', createdAt: now() })
    })
  },
  approveCheckout: (table: string) => set((d) => { d.sessions[table] = { ...session(d, table), status: 'bill_approved' } }),
  setSplit: (table: string, patch: Partial<Session>) => set((d) => { d.sessions[table] = { ...session(d, table), ...patch } }),
  payShare(table: string) {
    set((d) => {
      const ss = session(d, table); const paidShares = ss.paidShares + 1
      d.sessions[table] = paidShares >= ss.split ? { ...ss, paidShares, status: 'paid', method: 'UPI', paidAt: now() } : { ...ss, paidShares }
    })
  },
  markPaid: (table: string, method: string) => set((d) => { const ss = session(d, table); d.sessions[table] = { ...ss, paidShares: ss.split, status: 'paid', method, paidAt: now() } }),
  closeTable(table: string) {
    set((d) => { d.orders.filter((o) => o.table === table).forEach((o) => (o.closed = true)); delete d.sessions[table]; d.requests.filter((r) => r.table === table && r.type === 'Bill please').forEach((r) => (r.status = 'done')) })
  },
  saveFeedback(table: string, rating: number, comment: string) {
    set((d) => { d.feedback.push({ id: 'f' + uid(), table, rating, comment, at: now() }) })
  },
  joinLoyalty(name: string, phone: string, points: number) {
    set((d) => { d.customers.push({ id: 'c' + uid(), name: name || 'Guest', phone, visits: 1, points }) })
  },
  updateMenu: (id: string, patch: Partial<MenuItem>) => set((d) => { Object.assign(must(d.menu, id), patch) }),
  addMenu: (m: Pick<MenuItem, 'name' | 'price' | 'cat' | 'stock'>) => set((d) => { d.menu.push({ id: 'm' + uid(), allergens: [], pairs: [], emoji: '🍽️', prep: 10, veg: true, available: true, hi: m.name, ...m }) }),
  updateTable: (id: string, patch: Partial<Table>) => set((d) => { Object.assign(must(d.tables, id), patch) }),
  rotateToken: (id: string) => set((d) => { must(d.tables, id).tokenVersion += 1 }),
  addStaff: (m: Pick<StaffMember, 'name' | 'username' | 'role'>) => set((d) => { d.staff.push({ id: 's' + uid(), enabled: true, perms: [], ...m }) }),
  updateStaff: (id: string, patch: Partial<StaffMember>) => set((d) => { Object.assign(must(d.staff, id), patch) }),
  togglePerm: (id: string, i: number) => set((d) => { const m = must(d.staff, id); m.perms = m.perms.includes(i) ? m.perms.filter((p) => p !== i) : [...m.perms, i] }),
  setGst: (v: number) => set((d) => { d.restaurant.gstRate = v }),
  logAbuse(table: string, why: string) { set((d) => { d.abuse.push({ id: uid(), table, why, at: now() }) }) },
  setOffline(v: boolean) {
    set((d) => {
      d.offline = v
      if (!v) {
        d.pending.forEach((p) => applyPending(d, p))
        d.pending = []
      }
    })
  },
}
