import { ChevronDown, ChevronUp, LogOut, Minus, Pause, Pin, PinOff, Play, Square, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { configured, supabase, type Entry, type Project } from './supabase'

export function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])
  if (!configured) return <Shell><div className="center"><b>Falta configurar Supabase</b><small>El widget usa las mismas variables del Manager.</small></div></Shell>
  if (loading) return <Shell><div className="center"><span className="spinner" /></div></Shell>
  return <Shell>{session ? <Timer email={session.user.email ?? ''} /> : <Login />}</Shell>
}

function Shell({ children }: { children: ReactNode }) {
  const [pinned, setPinned] = useState(true)
  const [compact, setCompact] = useState(false)
  return <main className={compact ? 'widget compact' : 'widget'}>
    <header className="titlebar"><div className="brand"><span>DCX</span><b>Timer</b></div><div className="window-actions">
      <button title={pinned ? 'Dejar de fijar' : 'Mantener visible'} onClick={() => void window.desktop.togglePin().then(setPinned)}>{pinned ? <Pin size={14} /> : <PinOff size={14} />}</button>
      <button title={compact ? 'Expandir' : 'Modo compacto'} onClick={() => { const next = !compact; setCompact(next); void window.desktop.setCompact(next) }}>{compact ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
      <button title="Minimizar" onClick={window.desktop.minimize}><Minus size={15} /></button><button title="Ocultar" onClick={window.desktop.close}><X size={15} /></button>
    </div></header>{children}
  </main>
}

function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState('')
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); const { error: signInError } = await supabase.auth.signInWithPassword({ email, password }); if (signInError) setError('No pudimos iniciar sesión. Revisa tus datos.') }
  return <form className="login" onSubmit={submit}><div className="logo">D</div><h1>Inicia tu jornada</h1><p>Usa tu cuenta de DevDesdeCeroMx Manager.</p><input type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required /><input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />{error && <small className="error">{error}</small>}<button className="primary"><Play size={17} /> Entrar</button></form>
}

function Timer({ email }: { email: string }) {
  const [projects, setProjects] = useState<Project[]>([]), [entries, setEntries] = useState<Entry[]>([])
  const [project, setProject] = useState(''), [task, setTask] = useState(''), [now, setNow] = useState(Date.now()), [error, setError] = useState('')
  const active = entries.find(entry => !entry.ended_at), selected = projects.find(item => item.id === project)
  const seconds = useMemo(() => active ? active.accumulated_seconds + (active.status === 'running' ? Math.max(0, Math.floor((now - new Date(active.last_resumed_at).getTime()) / 1000)) : 0) : 0, [active, now])
  const load = async () => {
    const [projectResult, entryResult] = await Promise.all([
      supabase.from('projects').select('id,folio,name,project_tasks(id,title,status)').not('status', 'in', '("closed","cancelled")').order('created_at', { ascending: false }).returns<Project[]>(),
      supabase.from('time_entries').select('id,project_id,task_id,status,last_resumed_at,accumulated_seconds,ended_at,projects(name,folio),project_tasks(title)').order('started_at', { ascending: false }).limit(10).returns<Entry[]>(),
    ])
    setProjects(projectResult.data ?? []); setEntries(entryResult.data ?? [])
    if (projectResult.error || entryResult.error) setError('No pudimos sincronizar el cronómetro.')
  }
  useEffect(() => { void load(); const tick = setInterval(() => setNow(Date.now()), 1000); const sync = setInterval(() => void load(), 30000); return () => { clearInterval(tick); clearInterval(sync) } }, [])
  async function start() { if (!project) { setError('Selecciona un proyecto.'); return } setError(''); const { error: requestError } = await supabase.rpc('start_time_entry', { p_project_id: project, p_task_id: task || null, p_notes: null, p_billable: true }); if (requestError) setError(requestError.message); else await load() }
  async function action(kind: 'pause' | 'resume' | 'stop') { if (!active) return; const name = kind === 'pause' ? 'pause_time_entry' : kind === 'resume' ? 'resume_time_entry' : 'stop_time_entry'; const args = kind === 'stop' ? { p_entry_id: active.id, p_notes: null } : { p_entry_id: active.id }; const { error: requestError } = await supabase.rpc(name, args); if (requestError) setError(requestError.message); else await load() }
  return <section className="timer"><div className="account"><span>{email}</span><button title="Cerrar sesión" onClick={() => void supabase.auth.signOut()}><LogOut size={14} /></button></div><div className={`clock ${active?.status === 'paused' ? 'paused' : ''}`}><small>{active?.status === 'paused' ? 'EN PAUSA' : active ? 'TRABAJANDO' : 'LISTO PARA COMENZAR'}</small><strong>{format(seconds)}</strong>{active && <p>{active.projects?.folio} · {active.projects?.name}<br />{active.project_tasks?.title ?? 'Trabajo general'}</p>}</div>{error && <small className="error">{error}</small>}{active ? <div className="controls">{active.status === 'running' ? <button onClick={() => void action('pause')}><Pause />Pausar</button> : <button className="primary" onClick={() => void action('resume')}><Play />Continuar</button>}<button className="danger" onClick={() => void action('stop')}><Square />Finalizar</button></div> : <div className="selection"><label>Proyecto<select value={project} onChange={e => { setProject(e.target.value); setTask('') }}><option value="">Selecciona…</option>{projects.map(item => <option key={item.id} value={item.id}>{item.folio} · {item.name}</option>)}</select></label><label>Tarea<select value={task} onChange={e => setTask(e.target.value)}><option value="">Trabajo general</option>{selected?.project_tasks.filter(item => item.status !== 'completed').map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><button className="primary" onClick={() => void start()}><Play />Iniciar jornada</button></div>}<footer>Sincronizado con DevDesdeCeroMx Manager</footer></section>
}

function format(total: number) { const hours = Math.floor(total / 3600), minutes = Math.floor(total % 3600 / 60), seconds = total % 60; return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` }
