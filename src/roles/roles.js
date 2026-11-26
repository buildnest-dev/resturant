import { createElement as h } from 'react'
import { User, ConciergeBell, Briefcase, IndianRupee, ChefHat, ClipboardList, LayoutGrid, BellRing, MessageSquare, ReceiptText, Bike, Users, BarChart3, BookOpen, UserCog, QrCode, Star, Settings as Cog, Hotel, Package, UtensilsCrossed, ShoppingCart, Timer } from 'lucide-react'
import { Orders, Floor, Messages, MenuAdmin, FrontDesk, Platform } from '../pages/Admin.jsx'
import { Staff, Tables, Customers, Reports, Feedback, Settings } from '../pages/Manage.jsx'
import Kitchen from '../pages/Kitchen.jsx'
import { Billing, Requests, Stock } from './Screens.jsx'

// one entry per page: path under the role, menu label, icon, screen
const page = (path, label, icon, el) => ({ path, label, icon, el })

// Who sees what. Edit this list to move a page between roles.
export const ROLES = [
  {
    key: 'customer', title: 'Customer', ask: 'Are you a customer?', icon: User, home: '/t/1',
    pages: [page('', 'Menu', UtensilsCrossed), page('cart', 'Cart', ShoppingCart), page('track', 'Track order', Timer), page('chat', 'Chat', MessageSquare), page('bill', 'Bill & pay', ReceiptText)],
  },
  {
    key: 'staff', title: 'Staff', ask: 'Are you staff?', icon: ConciergeBell, home: '/staff',
    pages: [
      page('', 'Orders', ClipboardList, h(Orders, { side: false })),
      page('floor', 'Tables', LayoutGrid, h(Floor, { link: false })),
      page('requests', 'Guest requests', BellRing, h(Requests)),
      page('messages', 'Messages', MessageSquare, h(Messages)),
    ],
  },
  {
    key: 'manager', title: 'Manager', ask: 'Are you a manager?', icon: Briefcase, home: '/manager',
    pages: [
      page('', 'Reports', BarChart3, h(Reports)),
      page('orders', 'Orders', ClipboardList, h(Orders)),
      page('floor', 'Tables', LayoutGrid, h(Floor, { link: false })),
      page('messages', 'Messages', MessageSquare, h(Messages)),
      page('menu', 'Menu & stock', BookOpen, h(MenuAdmin)),
      page('front-desk', 'Front desk', Hotel, h(FrontDesk)),
      page('delivery', 'Delivery orders', Bike, h(Platform)),
      page('staff', 'Staff', UserCog, h(Staff)),
      page('qr', 'Tables & QR', QrCode, h(Tables)),
      page('customers', 'Customers', Users, h(Customers)),
      page('feedback', 'Feedback', Star, h(Feedback)),
      page('settings', 'Settings', Cog, h(Settings)),
    ],
  },
  {
    key: 'cashier', title: 'Cashier', ask: 'Are you a cashier?', icon: IndianRupee, home: '/cashier',
    pages: [
      page('', 'Billing', ReceiptText, h(Billing)),
      page('delivery', 'Delivery orders', Bike, h(Platform)),
      page('customers', 'Customers', Users, h(Customers)),
    ],
  },
  {
    key: 'chef', title: 'Kitchen chef', ask: 'Are you a kitchen chef?', icon: ChefHat, home: '/chef',
    pages: [
      page('', 'Kitchen orders', ChefHat, h(Kitchen)),
      page('stock', 'Stock & sold out', Package, h(Stock)),
    ],
  },
]
