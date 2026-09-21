import { BarChart3, Bell, ChevronDown, FileText, LayoutDashboard, LogOut, Menu, Settings, UserRoundSearch, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { Brand } from './Brand'

const items = [
  { label: 'Resumen', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Prospectos', icon: UserRoundSearch, to: '/prospects' },
  { label: 'Proyectos', icon: BarChart3, to: '/projects' },
  { label: 'Clientes', icon: Users, to: '/clients' },
  { label: 'Cotizaciones', icon: FileText, to: '/quotes' },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const email = user?.email ?? 'Usuario'
  const displayName = user?.user_metadata?.full_name || email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()
  return (
    <>
      <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir navegación"><Menu /></button>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Cerrar navegación" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top"><Brand inverted /><button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Cerrar navegación"><X /></button></div>
        <nav aria-label="Navegación principal">
          <span className="nav-label">Espacio de trabajo</span>
          {items.map(({ label, icon: Icon, to }) => <NavLink key={label} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}><Icon size={19} /><span>{label}</span></NavLink>)}
          <span className="nav-label nav-label-secondary">Sistema</span>
          <button className="nav-item" type="button"><Bell size={19} /><span>Notificaciones</span><span className="badge">3</span></button>
          <button className="nav-item" type="button"><Settings size={19} /><span>Configuración</span></button>
        </nav>
        <div className="sidebar-user"><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>{email}</span></div><ChevronDown size={16} /></div>
        <button className="logout-button" onClick={() => void signOut()}><LogOut size={17} /> Cerrar sesión</button>
      </aside>
    </>
  )
}
