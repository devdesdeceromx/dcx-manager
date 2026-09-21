import { ArrowRight, Clock3, FileText, Plus, UserRoundSearch, Users2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { getDashboardData, type DashboardActivity, type DashboardData } from './dashboardService'

const initialData: DashboardData = { newProspects: 0, activeClients: 0, pendingQuotes: 0, activeProjects: 0, totalProspects: 0, pipeline: { new: 0, contacted: 0, qualified: 0, quote: 0, negotiation: 0, won: 0, lost: 0 }, activity: [] }
const pipelineLabels: Array<[keyof DashboardData['pipeline'], string]> = [['new','Nuevo'], ['contacted','Contactado'], ['qualified','Calificado'], ['quote','Cotización'], ['negotiation','Negociación'], ['won','Ganado'], ['lost','No ganado']]

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'equipo'
  const today = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date())

  useEffect(() => { void getDashboardData().then(setData).catch((requestError: Error) => setError(requestError.message)).finally(() => setLoading(false)) }, [])

  const metrics = [
    { label: 'Prospectos este mes', value: data.newProspects, detail: 'Registros del mes actual', icon: UserRoundSearch, ready: true },
    { label: 'Clientes activos', value: data.activeClients, detail: 'Expedientes activos', icon: Users2, ready: true },
    { label: 'Cotizaciones pendientes', value: data.pendingQuotes, detail: 'Borradores y seguimientos', icon: FileText, ready: true },
    { label: 'Proyectos activos', value: data.activeProjects, detail: 'En operación y seguimiento', icon: Clock3, ready: true },
  ]

  return <>
    <header className="dashboard-header"><div><span className="eyebrow dark">{today}</span><h1>Hola, {name}.</h1><p>Este es el pulso real de DevDesdeCeroMX hoy.</p></div><Link className="new-button" to="/prospects?new=1"><Plus size={18}/> Nuevo prospecto</Link></header>
    {error && <p className="auth-error dashboard-error">No pudimos cargar el resumen: {error}</p>}
    <section className="metrics-grid" aria-label="Métricas principales">{metrics.map(({ label, value, detail, icon: Icon, ready }) => <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={19}/></div></div><strong>{loading && ready ? '…' : value}</strong><div className={`metric-change ${ready ? 'up' : 'neutral'}`}><span>{detail}</span></div></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel pipeline-panel"><div className="panel-header"><div><h2>Pipeline comercial</h2><p>{data.totalProspects} oportunidades registradas</p></div><Link className="link-button" to="/prospects">Administrar <ArrowRight size={16}/></Link></div><div className="pipeline-chart">{pipelineLabels.map(([key,label]) => { const count = data.pipeline[key]; const width = data.totalProspects ? Math.max((count / data.totalProspects) * 100, count ? 6 : 0) : 0; return <div className="pipeline-line" key={key}><div><span>{label}</span><strong>{count}</strong></div><div className="pipeline-bar"><i style={{width:`${width}%`}}/></div></div> })}</div></article>
      <article className="panel activity-panel"><div className="panel-header"><div><h2>Actividad reciente</h2><p>Movimientos registrados por el sistema</p></div></div>{data.activity.length ? <div className="activity-list">{data.activity.map((activity) => <Activity key={activity.id} activity={activity}/>)}</div> : <div className="empty-compact"><Clock3 size={22}/><strong>Todo tranquilo por aquí</strong><span>Las altas, ediciones y conversiones aparecerán en este espacio.</span></div>}</article>
    </section>
    <section className="quick-actions" aria-label="Acciones rápidas"><Link to="/prospects?new=1"><UserRoundSearch size={20}/><div><strong>Nuevo prospecto</strong><span>Registra una oportunidad</span></div><ArrowRight size={17}/></Link><Link to="/prospects"><Clock3 size={20}/><div><strong>Revisar pipeline</strong><span>Continúa los seguimientos</span></div><ArrowRight size={17}/></Link><Link to="/clients"><Users2 size={20}/><div><strong>Ver clientes</strong><span>Consulta los expedientes</span></div><ArrowRight size={17}/></Link><Link to="/quotes"><FileText size={20}/><div><strong>Cotizaciones</strong><span>Prepara propuestas</span></div><ArrowRight size={17}/></Link></section>
  </>
}

function Activity({ activity }: { activity: DashboardActivity }) {
  const entity = activity.entity_type === 'prospects' ? 'prospecto' : activity.entity_type === 'clients' ? 'cliente' : activity.entity_type
  const action = activity.action === 'created' ? `Se registró un ${entity}` : activity.action === 'converted_to_client' ? 'Un prospecto se convirtió en cliente' : `Se actualizó un ${entity}`
  const time = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(activity.created_at))
  return <div className="activity"><div className="avatar violet">DC</div><div><strong>{action}</strong><span>{time}</span></div></div>
}
