import { Plus, Search, UserRoundPlus, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { createProspect, listProspects } from './prospectService'
import type { NewProspect, Prospect, ProspectSource, ProspectStatus } from './types'

const statusLabels: Record<ProspectStatus, string> = { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', quote: 'Cotización', negotiation: 'Negociación', won: 'Ganado', lost: 'No ganado' }
const sourceLabels: Record<ProspectSource, string> = { referral: 'Recomendación', facebook: 'Facebook', tiktok: 'TikTok', website: 'Página web', whatsapp: 'WhatsApp', existing_client: 'Cliente existente', direct_contact: 'Contacto directo', other: 'Otro' }

const initialForm: NewProspect = { name: '', business_name: '', phone: '', email: '', service_interest: '', source: 'other', description: '' }

export function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<NewProspect>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data, error: requestError } = await listProspects()
    setProspects(data ?? [])
    setError(requestError?.message ?? null)
    setLoading(false)
  }

  useEffect(() => {
    void listProspects().then(({ data, error: requestError }) => {
      setProspects(data ?? [])
      setError(requestError?.message ?? null)
      setLoading(false)
    })
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const { error: requestError } = await createProspect({ ...form, estimated_budget: form.estimated_budget || undefined })
    setSaving(false)
    if (requestError) return setError(requestError.message)
    setForm(initialForm)
    setOpen(false)
    await load()
  }

  return <>
    <header className="module-header module-header-row"><div><span className="eyebrow dark">CRM</span><h1>Prospectos</h1><p>Da seguimiento a cada oportunidad desde el primer contacto.</p></div><button className="new-button" onClick={() => setOpen(true)}><Plus size={18}/> Nuevo prospecto</button></header>
    <section className="panel prospects-panel">
      <div className="prospects-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Buscar por nombre, negocio o folio" disabled /></div><span>{prospects.length} prospectos</span></div>
      {error && <p className="auth-error">{error}</p>}
      {loading ? <div className="empty-table"><strong>Cargando prospectos…</strong></div> : prospects.length === 0 ? <div className="module-empty prospects-empty"><div className="module-empty-icon"><UserRoundPlus size={27}/></div><h2>Registra tu primer prospecto</h2><p>Cuando alguien pregunte por un servicio, agrégalo aquí para no perder el seguimiento.</p><button className="new-button" onClick={() => setOpen(true)}>Nuevo prospecto</button></div> : <div className="prospect-list">{prospects.map((prospect) => <article className="prospect-row" key={prospect.id}><div><small>{prospect.folio}</small><strong>{prospect.name}</strong><span>{prospect.business_name || 'Sin negocio registrado'}</span></div><div><small>Interés</small><strong>{prospect.service_interest}</strong></div><div><small>Origen</small><span>{sourceLabels[prospect.source]}</span></div><span className={`status prospect-${prospect.status}`}>{statusLabels[prospect.status]}</span></article>)}</div>}
    </section>
    {open && <div className="modal-backdrop" role="presentation"><section className="prospect-modal" role="dialog" aria-modal="true" aria-labelledby="prospect-title"><div className="modal-header"><div><span className="eyebrow dark">Nueva oportunidad</span><h2 id="prospect-title">Registrar prospecto</h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar"><X/></button></div><form onSubmit={handleSubmit} className="prospect-form"><label>Nombre completo<input required value={form.name} onChange={(e) => setForm({...form, name:e.target.value})}/></label><label>Negocio<input value={form.business_name} onChange={(e) => setForm({...form, business_name:e.target.value})}/></label><div className="form-grid"><label>Teléfono<input value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})}/></label><label>Correo<input type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})}/></label></div><label>Servicio de interés<input required value={form.service_interest} onChange={(e) => setForm({...form, service_interest:e.target.value})}/></label><div className="form-grid"><label>Origen<select value={form.source} onChange={(e) => setForm({...form, source:e.target.value as ProspectSource})}>{Object.entries(sourceLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Presupuesto estimado<input type="number" min="0" step="0.01" value={form.estimated_budget ?? ''} onChange={(e) => setForm({...form, estimated_budget:e.target.value ? Number(e.target.value) : undefined})}/></label></div><label>Descripción<textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description:e.target.value})}/></label>{error && <p className="auth-error">{error}</p>}<div className="modal-actions"><button type="button" className="period-button" onClick={() => setOpen(false)}>Cancelar</button><button className="new-button" disabled={saving}>{saving ? 'Guardando…' : 'Guardar prospecto'}</button></div></form></section></div>}
  </>
}
