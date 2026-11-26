import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/hanken-grotesk'
import './index.css'
import { Landing, Demo } from './site/Site.jsx'
import SignIn from './roles/SignIn.jsx'
import RoleShell from './roles/RoleShell.jsx'
import { ROLES } from './roles/roles.js'
import { GuestLayout, Menu, Cart, Track, Chat, Bill, Thanks } from './pages/Guest.jsx'

document.title = 'ZAQSA Restaurant'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing product="restaurant" />} />
      <Route path="/demo" element={<Demo product="restaurant" />} />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/t/:table" element={<GuestLayout />}>
        <Route index element={<Menu />} />
        <Route path="cart" element={<Cart />} />
        <Route path="track" element={<Track />} />
        <Route path="chat" element={<Chat />} />
        <Route path="bill" element={<Bill />} />
        <Route path="thanks" element={<Thanks />} />
      </Route>
      {ROLES.filter((r) => r.key !== 'customer').map((r) => (
        <Route key={r.key} path={r.home} element={<RoleShell key={r.key} role={r} />}>
          {r.pages.map((p) => p.path ? <Route key={p.path} path={p.path} element={p.el} /> : <Route key="index" index element={p.el} />)}
        </Route>
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>,
)
