import { useSyncExternalStore } from 'react'

const KEY = 'zaqsa-v1'
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase()
const now = () => Date.now()

export const GST_RATE = 0.05
export const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN')

const menu = [
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

function seed() {
  const t = now()
  return {
    restaurant: { name: 'The Grand Hotel', id: 'XH10001', gst: '27ABCDE1234F1Z5', gstRate: 5 },
    menu,
    tables: [
      ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: 'Table ' + n, type: 'table', locked: false, tokenVersion: 1 })),
      ...['101', '102', '103'].map((n) => ({ id: n, label: 'Room ' + n, type: 'room', locked: false, tokenVersion: 1 })),
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

let state
try { state = JSON.parse(localStorage.getItem(KEY)) || seed() } catch { state = seed() }
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())
const save = () => localStorage.setItem(KEY, JSON.stringify(state))
function set(fn) { state = fn(structuredClone(state)); save(); emit() }
window.addEventListener('storage', (e) => {
  if (e.key === KEY && e.newValue) { state = JSON.parse(e.newValue); emit() }
})

export const useStore = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb) }, () => state)

export const orderTotal = (o) => o.items.reduce((s, i) => s + i.price * i.qty, 0)
export function tableBill(s, table) {
  const orders = s.orders.filter((o) => o.table === table && !o.closed && o.status !== 'declined')
  const sub = orders.reduce((a, o) => a + orderTotal(o), 0)
  const gst = Math.round(sub * (s.restaurant.gstRate / 100))
  return { orders, sub, cgst: gst / 2, sgst: gst / 2, total: sub + gst }
}
export const session = (s, table) => s.sessions[table] || { status: 'open', split: 1, tip: 0, paidShares: 0 }

const takeStock = (d, items) => items.forEach((i) => { const m = d.menu.find((x) => x.id === i.id); if (m) m.stock = Math.max(0, m.stock - i.qty) })
const applyStatus = (d, id, status) => {
  const o = d.orders.find((x) => x.id === id)
  if (!o) return
  if (status === 'accepted' && o.status === 'received') takeStock(d, o.items)
  o.status = status
}

const queueable = (type, args, apply) => {
  set((d) => {
    if (d.offline) d.pending.push({ type, args, at: now() })
    else apply(d)
    return d
  })
}

export const actions = {
  reset: () => { state = seed(); save(); emit() },
  placeOrder(table, items, note, allergyNote) {
    set((d) => {
      if (d.sessions[table]?.status === 'paid') { d.orders.filter((o) => o.table === table).forEach((o) => (o.closed = true)); delete d.sessions[table] }
      const tb = d.tables.find((t) => t.id === table)
      d.orders.push({ id: 'O-' + (1000 + d.orders.length + 1 + Math.floor(Math.random() * 9)), table, source: tb?.type === 'room' ? 'room' : 'dine_in', status: 'received', items, note, allergyNote, createdAt: now(), closed: false })
      return d
    })
  },
  addPlatformOrder(o) {
    set((d) => { d.orders.push({ id: 'P-' + uid(), table: '-', status: 'accepted', closed: false, createdAt: now(), allergyNote: '', ...o }); takeStock(d, o.items); return d })
  },
  addItemToOrder(orderId, itemId) {
    set((d) => {
      const o = d.orders.find((x) => x.id === orderId); const m = d.menu.find((x) => x.id === itemId)
      if (o.status !== 'received') takeStock(d, [{ id: itemId, qty: 1 }])
      const ex = o.items.find((i) => i.id === itemId)
      if (ex) ex.qty += 1; else o.items.push({ id: m.id, name: m.name, price: m.price, qty: 1 })
      return d
    })
  },
  setStatus: (id, status) => queueable('status', { id, status }, (d) => applyStatus(d, id, status)),
  closeOrder: (id) => set((d) => { d.orders.find((o) => o.id === id).closed = true; return d }),
  addRequest(table, type) {
    set((d) => { d.requests.push({ id: 'R-' + uid(), table, type, status: 'open', assignedTo: '', createdAt: now() }); return d })
  },
  assignRequest: (id, who) => set((d) => { d.requests.find((r) => r.id === id).assignedTo = who; return d }),
  resolveRequest: (id) => queueable('resolve', { id }, (d) => { d.requests.find((r) => r.id === id).status = 'done' }),
  sendMessage(table, from, text) {
    set((d) => { d.messages.push({ id: 'C-' + uid(), table, from, text, at: now() }); return d })
  },
  requestBill(table) {
    set((d) => {
      d.sessions[table] = { ...session(d, table), status: 'bill_requested' }
      d.requests.push({ id: 'R-' + uid(), table, type: 'Bill please', status: 'open', assignedTo: '', createdAt: now() })
      return d
    })
  },
  approveCheckout: (table) => set((d) => { d.sessions[table] = { ...session(d, table), status: 'bill_approved' }; return d }),
  setSplit: (table, patch) => set((d) => { d.sessions[table] = { ...session(d, table), ...patch }; return d }),
  payShare(table) {
    set((d) => {
      const ss = session(d, table); const paidShares = ss.paidShares + 1
      d.sessions[table] = { ...ss, paidShares, status: paidShares >= ss.split ? 'paid' : ss.status }
      return d
    })
  },
  markPaid: (table) => set((d) => { const ss = session(d, table); d.sessions[table] = { ...ss, paidShares: ss.split, status: 'paid' }; return d }),
  closeTable(table) {
    set((d) => { d.orders.filter((o) => o.table === table).forEach((o) => (o.closed = true)); delete d.sessions[table]; d.requests.filter((r) => r.table === table && r.type === 'Bill please').forEach((r) => (r.status = 'done')); return d })
  },
  saveFeedback(table, rating, comment) {
    set((d) => { d.feedback.push({ id: 'f' + uid(), table, rating, comment, at: now() }); return d })
  },
  joinLoyalty(name, phone, points) {
    set((d) => { d.customers.push({ id: 'c' + uid(), name: name || 'Guest', phone, visits: 1, points }); return d })
  },
  updateMenu: (id, patch) => set((d) => { Object.assign(d.menu.find((m) => m.id === id), patch); return d }),
  addMenu: (m) => set((d) => { d.menu.push({ id: 'm' + uid(), allergens: [], pairs: [], emoji: '🍽️', prep: 10, veg: true, available: true, hi: m.name, ...m }); return d }),
  updateTable: (id, patch) => set((d) => { Object.assign(d.tables.find((t) => t.id === id), patch); return d }),
  rotateToken: (id) => set((d) => { d.tables.find((t) => t.id === id).tokenVersion += 1; return d }),
  addStaff: (s) => set((d) => { d.staff.push({ id: 's' + uid(), enabled: true, perms: [], ...s }); return d }),
  updateStaff: (id, patch) => set((d) => { Object.assign(d.staff.find((s) => s.id === id), patch); return d }),
  togglePerm: (id, i) => set((d) => { const s = d.staff.find((x) => x.id === id); s.perms = s.perms.includes(i) ? s.perms.filter((p) => p !== i) : [...s.perms, i]; return d }),
  setGst: (v) => set((d) => { d.restaurant.gstRate = v; return d }),
  logAbuse(table, why) { set((d) => { d.abuse.push({ id: uid(), table, why, at: now() }); return d }) },
  setOffline(v) {
    set((d) => {
      d.offline = v
      if (!v) {
        d.pending.forEach((p) => {
          if (p.type === 'status') applyStatus(d, p.args.id, p.args.status)
          if (p.type === 'resolve') { const r = d.requests.find((x) => x.id === p.args.id); if (r) r.status = 'done' }
        })
        d.pending = []
      }
      return d
    })
  },
}
