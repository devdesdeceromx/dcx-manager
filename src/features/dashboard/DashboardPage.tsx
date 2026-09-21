import { ArrowUpRight, Clock3, Database, MoreHorizontal, Plus, Users2, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

const metrics = [
  { label: 'Ingresos del mes', value: '—', icon: WalletCards },
  { label: 'Proyectos activos', value: '0', icon: Clock3 },
  { label: 'Clientes activos', value: '0', icon: Users2 },
  { label: 'Pendiente por cobrar', value: '—', icon: WalletCards },
]

export function DashboardPage() {
  const { user } = useAuth()
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'equipo'
  const today = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date())
  return (
    <>
      <header className="dashboard-header">
        <div><span className="eyebrow dark">{today}</span><h1>Hola, {name}.</h1><p>Este es el pulso de DevDesdeCeroMX hoy.</p></div>
        <Link className="new-button" to="/projects"><Plus size={18} /> Nuevo proyecto</Link>
      </header>
      <section className="metrics-grid" aria-label="Métricas principales">
        {metrics.map(({ label, value, icon: Icon }) => <article className="metric-card" key={label}>
          <div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={19} /></div></div><strong>{value}</strong>
          <div className="metric-change neutral"><Database size={14} /><span>Sin datos registrados</span></div>
        </article>)}
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header"><div><h2>Rendimiento</h2><p>Ingresos de los últimos 6 meses</p></div><button className="period-button">Últimos 6 meses ⌄</button></div>
          <div className="empty-chart"><Database size={25} /><strong>Aún no hay movimientos</strong><span>La gráfica aparecerá cuando registremos información financiera.</span></div>
        </article>
        <article className="panel activity-panel"><div className="panel-header"><div><h2>Actividad reciente</h2><p>Últimos movimientos</p></div><button className="icon-button" aria-label="Más opciones"><MoreHorizontal /></button></div><div className="empty-compact"><Clock3 size={22} /><strong>Todo tranquilo por aquí</strong><span>Los cambios del equipo aparecerán en este espacio.</span></div></article>
      </section>
      <section className="panel projects-panel"><div className="panel-header"><div><h2>Proyectos prioritarios</h2><p>Seguimiento de entregas activas</p></div><Link className="link-button" to="/projects">Ver todos <ArrowUpRight size={16} /></Link></div><div className="empty-table"><strong>No hay proyectos todavía</strong><span>Crea el primero cuando definamos su estructura de datos.</span></div></section>
    </>
  )
}
