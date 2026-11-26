import { User, ConciergeBell, Briefcase, IndianRupee, ChefHat, ClipboardList, LayoutGrid, BellRing, MessageSquare, ReceiptText, Bike, Users, BarChart3, BookOpen, UserCog, QrCode, Star, Settings as Cog, Hotel, Package, UtensilsCrossed, ShoppingCart, Timer, type LucideIcon } from 'lucide-react'

export type RoleKey = 'customer' | 'staff' | 'manager' | 'cashier' | 'chef'
export type RolePage = { path: string; label: string; icon: LucideIcon }
export type Role = { key: RoleKey; title: string; ask: string; icon: LucideIcon; home: string; pages: RolePage[] }

// one entry per page: path under the role, menu label, icon
const page = (path: string, label: string, icon: LucideIcon): RolePage => ({ path, label, icon })

// Who sees what. To move a page between roles, edit this list and the matching folder in src/app.
export const ROLES: Role[] = [
  {
    key: 'customer', title: 'Customer', ask: 'Are you a customer?', icon: User, home: '/t/1',
    pages: [page('', 'Menu', UtensilsCrossed), page('cart', 'Cart', ShoppingCart), page('track', 'Track order', Timer), page('chat', 'Chat', MessageSquare), page('bill', 'Bill & pay', ReceiptText)],
  },
  {
    key: 'staff', title: 'Staff', ask: 'Are you staff?', icon: ConciergeBell, home: '/staff',
    pages: [
      page('', 'Orders', ClipboardList),
      page('floor', 'Tables', LayoutGrid),
      page('requests', 'Guest requests', BellRing),
      page('messages', 'Messages', MessageSquare),
    ],
  },
  {
    key: 'manager', title: 'Manager', ask: 'Are you a manager?', icon: Briefcase, home: '/manager',
    pages: [
      page('', 'Reports', BarChart3),
      page('orders', 'Orders', ClipboardList),
      page('floor', 'Tables', LayoutGrid),
      page('messages', 'Messages', MessageSquare),
      page('menu', 'Menu & stock', BookOpen),
      page('front-desk', 'Front desk', Hotel),
      page('delivery', 'Delivery orders', Bike),
      page('staff', 'Staff', UserCog),
      page('qr', 'Tables & QR', QrCode),
      page('customers', 'Customers', Users),
      page('feedback', 'Feedback', Star),
      page('settings', 'Settings', Cog),
    ],
  },
  {
    key: 'cashier', title: 'Cashier', ask: 'Are you a cashier?', icon: IndianRupee, home: '/cashier',
    pages: [
      page('', 'Billing', ReceiptText),
      page('delivery', 'Delivery orders', Bike),
      page('customers', 'Customers', Users),
    ],
  },
  {
    key: 'chef', title: 'Kitchen chef', ask: 'Are you a kitchen chef?', icon: ChefHat, home: '/chef',
    pages: [
      page('', 'Kitchen orders', ChefHat),
      page('stock', 'Stock & sold out', Package),
    ],
  },
]
