import { BarChart3, Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { Brand } from './Brand'

const items = [
  { label: 'Resumen', icon: LayoutDashboard, active: true },
  { label: 'Proyectos', icon: BarChart3 },
  { label: 'Clientes', icon: Users },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const { signOut } = useAuth()
  return (
    <>
      <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir navegación"><Menu /></button>
      {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Cerrar navegación" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top"><Brand inverted /><button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Cerrar navegación"><X /></button></div>
        <nav aria-label="Navegación principal">
          <span className="nav-label">Espacio de trabajo</span>
          {items.map(({ label, icon: Icon, active }) => <button key={label} className={`nav-item ${active ? 'nav-item-active' : ''}`} type="button"><Icon size={19} /><span>{label}</span></button>)}
          <span className="nav-label nav-label-secondary">Sistema</span>
          <button className="nav-item" type="button"><Bell size={19} /><span>Notificaciones</span><span className="badge">3</span></button>
          <button className="nav-item" type="button"><Settings size={19} /><span>Configuración</span></button>
        </nav>
        <div className="sidebar-user"><div className="avatar">SC</div><div><strong>Santiago</strong><span>Administrador</span></div><ChevronDown size={16} /></div>
        <button className="logout-button" onClick={() => void signOut()}><LogOut size={17} /> Cerrar sesión</button>
      </aside>
    </>
  )
}
