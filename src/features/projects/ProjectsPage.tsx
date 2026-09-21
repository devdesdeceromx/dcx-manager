import { FolderKanban, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects, updateProject, type Project, type ProjectStatus } from './projectService'

const statuses: Array<[ProjectStatus, string]> = [
  ['preparation', 'Preparación'], ['waiting_deposit', 'Esperando anticipo'], ['ready_to_start', 'Listo para iniciar'],
  ['development', 'En desarrollo'], ['review', 'En revisión'], ['adjustments', 'Ajustes'],
  ['ready_delivery', 'Listo para entregar'], ['delivered', 'Entregado'], ['warranty', 'Garantía'],
  ['closed', 'Cerrado'], ['paused', 'Pausado'], ['cancelled', 'Cancelado'],
]

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { void listProjects().then(({ data, error: requestError }) => { setProjects(data ?? []); setError(requestError?.message ?? null); setLoading(false) }) }, [])
  const filtered = useMemo(() => projects.filter((project) => [project.folio, project.name, project.clients?.name, project.clients?.business_name].some((value) => value?.toLowerCase().includes(search.toLowerCase()))), [projects, search])

  async function save(id: string, updates: { status?: ProjectStatus; progress?: number }) {
    const previous = projects
    setProjects((current) => current.map((project) => project.id === id ? { ...project, ...updates } : project))
    setSaving(id); setError(null)
    const { error: requestError } = await updateProject(id, updates)
    if (requestError) { setProjects(previous); setError(requestError.message) }
    setSaving(null)
  }

  return <>
    <header className="module-header"><span className="eyebrow dark">OPERACIÓN</span><h1>Proyectos</h1><p>Da seguimiento al trabajo contratado, desde el anticipo hasta la entrega.</p></header>
    <section className="panel prospects-panel"><div className="prospects-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Buscar proyecto, cliente o folio" value={search} onChange={(event) => setSearch(event.target.value)}/></div><span>{filtered.length} proyectos</span></div>
      {error && <p className="auth-error panel-error">{error}</p>}
      {loading ? <div className="empty-table"><strong>Cargando proyectos…</strong></div> : projects.length === 0 ? <div className="module-empty prospects-empty"><div className="module-empty-icon"><FolderKanban size={27}/></div><h2>Todavía no hay proyectos</h2><p>Cuando una cotización sea aceptada, su proyecto aparecerá aquí automáticamente.</p><Link className="new-button" to="/quotes">Ir a cotizaciones</Link></div> : <div className="prospect-list">{filtered.map((project) => <article className="project-list-row" key={project.id}>
        <div><small>{project.folio}</small><strong>{project.name}</strong><span>{project.clients?.business_name || project.clients?.name || 'Cliente'}</span></div>
        <div><small>Valor</small><strong className="quote-total">{money.format(project.price)}</strong></div>
        <label className="project-progress"><small>Avance · {project.progress}%</small><input aria-label={`Avance de ${project.name}`} type="range" min="0" max="100" step="5" value={project.progress} disabled={saving === project.id} onChange={(event) => setProjects((current) => current.map((item) => item.id === project.id ? { ...item, progress: Number(event.target.value) } : item))} onMouseUp={(event) => void save(project.id, { progress: Number(event.currentTarget.value) })} onTouchEnd={(event) => void save(project.id, { progress: Number(event.currentTarget.value) })}/></label>
        <select className="status project-status" value={project.status} disabled={saving === project.id} onChange={(event) => void save(project.id, { status: event.target.value as ProjectStatus })}>{statuses.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
      </article>)}</div>}
    </section>
  </>
}
