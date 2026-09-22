import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  KeyRound,
  Settings,
  ShieldCheck,
  UserRoundSearch,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Brand } from "./Brand";
import { NotificationCenter } from "@/features/notifications/NotificationCenter";
import { adminRoles, allRoles, commercialRoles, financeRoles, projectRoles, type AppRole } from "@/shared/lib/permissions";

const items = [
  { label: "Resumen", icon: LayoutDashboard, to: "/dashboard", roles: allRoles },
  { label: "Prospectos", icon: UserRoundSearch, to: "/prospects", roles: commercialRoles },
  { label: "Proyectos", icon: BarChart3, to: "/projects", roles: projectRoles },
  { label: "Calendario", icon: CalendarDays, to: "/calendar", roles: projectRoles },
  { label: "Finanzas", icon: CircleDollarSign, to: "/finances", roles: financeRoles },
  { label: "Clientes", icon: Users, to: "/clients", roles: commercialRoles },
  { label: "Cotizaciones", icon: FileText, to: "/quotes", roles: commercialRoles },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const email = user?.email ?? "Usuario";
  const displayName = user?.user_metadata?.full_name || email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <>
      <button
        className="mobile-menu"
        onClick={() => setOpen(true)}
        aria-label="Abrir navegación"
      >
        <Menu />
      </button>
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Brand inverted />
          <button
            className="sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar navegación"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Navegación principal">
          <span className="nav-label">Espacio de trabajo</span>
          {items.filter((item) => role && item.roles.includes(role as AppRole)).map(({ label, icon: Icon, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
          <span className="nav-label nav-label-secondary">Sistema</span>
          <NotificationCenter />
          {role && adminRoles.includes(role) && <><NavLink
            to="/team"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? "nav-item-active" : ""}`
            }
          >
            <ShieldCheck size={19} />
            <span>Equipo y permisos</span>
          </NavLink>
          <NavLink
            to="/activity"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? "nav-item-active" : ""}`
            }
          >
            <Activity size={19} />
            <span>Actividad</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `nav-item ${isActive ? "nav-item-active" : ""}`
            }
          >
            <Settings size={19} />
            <span>Configuración</span>
          </NavLink></>}
        </nav>
        <div className="sidebar-account">
          {accountOpen && <div className="account-menu">
            <NavLink to="/profile" onClick={() => { setAccountOpen(false); setOpen(false) }}><UserRound size={16}/> Mi perfil</NavLink>
            <Link to="/profile#security" onClick={() => { setAccountOpen(false); setOpen(false) }}><KeyRound size={16}/> Seguridad</Link>
          </div>}
          <button className="sidebar-user" type="button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen}>
            <div className="avatar">{initials}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{email}</span>
            </div>
            <ChevronDown className={accountOpen ? "account-chevron-open" : ""} size={16} />
          </button>
        </div>
        <button className="logout-button" onClick={() => void signOut()}>
          <LogOut size={17} /> Cerrar sesión
        </button>
      </aside>
    </>
  );
}
