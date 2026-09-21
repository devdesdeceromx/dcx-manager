import { ArrowDownRight, ArrowUpRight, Clock3, MoreHorizontal, Plus, Users2, WalletCards } from 'lucide-react'
import { Sidebar } from '@/shared/components/Sidebar'

const metrics = [
  { label: 'Ingresos del mes', value: '$84,240', change: '+12.5%', direction: 'up', icon: WalletCards },
  { label: 'Proyectos activos', value: '12', change: '+2 este mes', direction: 'up', icon: Clock3 },
  { label: 'Clientes activos', value: '28', change: '+8.2%', direction: 'up', icon: Users2 },
  { label: 'Pendiente por cobrar', value: '$18,950', change: '-4.1%', direction: 'down', icon: ArrowDownRight },
]

const projects = [
  { name: 'E-commerce Norte', client: 'Grupo Noroeste', status: 'En progreso', progress: 72, due: '26 sep' },
  { name: 'Portal de operaciones', client: 'Logística MX', status: 'En revisión', progress: 91, due: '30 sep' },
  { name: 'Identidad y sitio web', client: 'Estudio Prisma', status: 'Planeación', progress: 24, due: '14 oct' },
]

export function DashboardPage() {
  return (
    <div className="app-shell"><Sidebar /><main className="dashboard-main">
      <header className="dashboard-header">
        <div><span className="eyebrow dark">Domingo, 20 de septiembre</span><h1>Buenos días, Santiago.</h1><p>Este es el pulso de DevDesdeCeroMX hoy.</p></div>
        <button className="new-button"><Plus size={18} /> Nuevo proyecto</button>
      </header>
      <section className="metrics-grid" aria-label="Métricas principales">
        {metrics.map(({ label, value, change, direction, icon: Icon }) => <article className="metric-card" key={label}>
          <div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={19} /></div></div><strong>{value}</strong>
          <div className={`metric-change ${direction}`}>{direction === 'up' && <ArrowUpRight size={15} />}{change}<span> vs. mes anterior</span></div>
        </article>)}
      </section>
      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header"><div><h2>Rendimiento</h2><p>Ingresos de los últimos 6 meses</p></div><button className="period-button">Últimos 6 meses ⌄</button></div>
          <div className="chart-summary"><strong>$358,420</strong><span><ArrowUpRight size={15} /> 18.4%</span></div>
          <div className="chart" aria-label="Gráfica de ingresos"><div className="chart-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 680 180" preserveAspectRatio="none" role="img" aria-label="Tendencia ascendente de ingresos"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7162f2" stopOpacity=".28"/><stop offset="1" stopColor="#7162f2" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 154 C55 142 70 112 126 120 S216 145 270 102 S345 72 400 84 S480 112 525 64 S610 30 680 18 L680 180 L0 180 Z" /><path className="line" d="M0 154 C55 142 70 112 126 120 S216 145 270 102 S345 72 400 84 S480 112 525 64 S610 30 680 18" /></svg><div className="chart-labels"><span>Abr</span><span>May</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Sep</span></div></div>
        </article>
        <article className="panel activity-panel"><div className="panel-header"><div><h2>Actividad reciente</h2><p>Últimos movimientos</p></div><button className="icon-button" aria-label="Más opciones"><MoreHorizontal /></button></div><div className="activity-list"><Activity initials="LM" color="violet" title="Laura actualizó E-commerce Norte" time="Hace 24 min" /><Activity initials="JR" color="blue" title="José agregó un comentario" time="Hace 1 h" /><Activity initials="AC" color="orange" title="Ana registró un nuevo cliente" time="Hace 3 h" /><Activity initials="SC" color="dark" title="Se envió la factura #1048" time="Ayer" /></div></article>
      </section>
      <section className="panel projects-panel"><div className="panel-header"><div><h2>Proyectos prioritarios</h2><p>Seguimiento de entregas activas</p></div><button className="link-button">Ver todos <ArrowUpRight size={16} /></button></div><div className="project-table"><div className="project-row project-heading"><span>Proyecto</span><span>Estado</span><span>Progreso</span><span>Entrega</span><span /></div>{projects.map((project) => <div className="project-row" key={project.name}><div><strong>{project.name}</strong><small>{project.client}</small></div><span className={`status ${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span><div className="progress-wrap"><div className="progress"><i style={{ width: `${project.progress}%` }} /></div><small>{project.progress}%</small></div><span>{project.due}</span><button className="icon-button" aria-label={`Opciones de ${project.name}`}><MoreHorizontal size={19} /></button></div>)}</div></section>
    </main></div>
  )
}

function Activity({ initials, color, title, time }: { initials: string; color: string; title: string; time: string }) {
  return <div className="activity"><div className={`avatar ${color}`}>{initials}</div><div><strong>{title}</strong><span>{time}</span></div></div>
}
