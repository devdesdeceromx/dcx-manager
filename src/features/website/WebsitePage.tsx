import { ExternalLink, Globe2, Languages, Save, Share2 } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { getWebsiteSettings, updateWebsiteSettings, type WebsiteSettingsInput } from './websiteService'

const empty: WebsiteSettingsInput = {
  contact_email: 'devdesdeceromx@gmail.com', contact_phone: null,
  tiktok_url: null, facebook_url: null, instagram_url: null, youtube_url: null,
  hero_eyebrow_es: '', hero_eyebrow_en: '', hero_title_es: '', hero_title_en: '',
  hero_highlight_es: '', hero_highlight_en: '', hero_description_es: '', hero_description_en: '',
  show_services: true, show_industries: true, show_process: true, show_about: true,
}

export function WebsitePage() {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { void getWebsiteSettings().then(({ data, error: requestError }) => { if (data) { const { id: _id, updated_at: _updatedAt, ...input } = data; void _id; void _updatedAt; setForm(input) } setError(requestError?.message ?? null); setLoading(false) }) }, [])
  const text = (key: keyof WebsiteSettingsInput, value: string) => setForm(current => ({ ...current, [key]: value || null }))
  const toggle = (key: keyof WebsiteSettingsInput) => setForm(current => ({ ...current, [key]: !current[key] }))
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setSaved(false); setError(null); const { error: requestError } = await updateWebsiteSettings(form); setSaving(false); if (requestError) return setError(requestError.message); setSaved(true) }

  if (loading) return <section className="panel module-loading"><strong>Cargando sitio web…</strong></section>
  return <>
    <header className="module-header module-header-row"><div><span className="eyebrow dark">PRESENCIA DIGITAL</span><h1>Sitio web</h1><p>Edita la información pública que ven tus futuros clientes.</p></div><a className="new-button website-open" href="https://devdesdeceromx.github.io/" target="_blank" rel="noreferrer"><ExternalLink size={17}/> Ver sitio</a></header>
    <form className="website-settings" onSubmit={submit}>
      <section className="panel settings-section"><Heading icon={<Languages/>} title="Portada bilingüe" detail="El mensaje principal que recibe cada visitante."/><LanguageBlock label="Español" suffix="es" form={form} text={text}/><LanguageBlock label="English" suffix="en" form={form} text={text}/></section>
      <div className="website-settings-side">
        <section className="panel settings-section"><Heading icon={<Globe2/>} title="Contacto y secciones" detail="Controla qué información aparece en el sitio."/><label>Correo público<input type="email" required value={form.contact_email} onChange={e => text('contact_email', e.target.value)}/></label><label>Teléfono público<input value={form.contact_phone ?? ''} onChange={e => text('contact_phone', e.target.value)} placeholder="Opcional"/></label><div className="visibility-list"><Toggle label="Servicios" checked={form.show_services} onChange={() => toggle('show_services')}/><Toggle label="Tipos de negocio" checked={form.show_industries} onChange={() => toggle('show_industries')}/><Toggle label="Nosotros" checked={form.show_about} onChange={() => toggle('show_about')}/><Toggle label="Proceso" checked={form.show_process} onChange={() => toggle('show_process')}/></div></section>
        <section className="panel settings-section"><Heading icon={<Share2/>} title="Redes sociales" detail="Las redes vacías permanecerán ocultas."/>{(['tiktok','facebook','instagram','youtube'] as const).map(network => <label key={network}>{network[0].toUpperCase()+network.slice(1)}<input type="url" value={form[`${network}_url`] ?? ''} onChange={e => text(`${network}_url`, e.target.value)} placeholder="https://…"/></label>)}{error && <p className="auth-error">{error}</p>}{saved && <p className="settings-success">Cambios publicados correctamente.</p>}<button className="new-button" disabled={saving}><Save size={17}/>{saving ? 'Publicando…' : 'Publicar cambios'}</button></section>
      </div>
    </form>
  </>
}

function Heading({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) { return <div className="settings-heading">{icon}<div><h2>{title}</h2><p>{detail}</p></div></div> }
function LanguageBlock({ label, suffix, form, text }: { label: string; suffix: 'es'|'en'; form: WebsiteSettingsInput; text: (key:keyof WebsiteSettingsInput,value:string)=>void }) { return <fieldset className="language-block"><legend>{label}</legend><label>Etiqueta superior<input required value={form[`hero_eyebrow_${suffix}`]} onChange={e=>text(`hero_eyebrow_${suffix}`,e.target.value)}/></label><div className="form-grid"><label>Título<input required value={form[`hero_title_${suffix}`]} onChange={e=>text(`hero_title_${suffix}`,e.target.value)}/></label><label>Frase destacada<input required value={form[`hero_highlight_${suffix}`]} onChange={e=>text(`hero_highlight_${suffix}`,e.target.value)}/></label></div><label>Descripción<textarea rows={3} required value={form[`hero_description_${suffix}`]} onChange={e=>text(`hero_description_${suffix}`,e.target.value)}/></label></fieldset> }
function Toggle({ label, checked, onChange }: { label:string; checked:boolean; onChange:()=>void }) { return <label className="website-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={onChange}/><i/></label> }
