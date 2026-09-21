import { Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { listClients, type Client } from './clientService'

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { void listClients().then(({ data, error: requestError }) => { setClients(data ?? []); setError(requestError?.message ?? null); setLoading(false) }) }, [])
  const filtered = useMemo(() => clients.filter((client) => [client.folio, client.name, client.business_name].some((value) => value?.toLowerCase().includes(search.toLowerCase()))), [clients, search])

  return <>
    <header className="module-header"><span className="eyebrow dark">CRM</span><h1>Clientes</h1><p>Expedientes creados desde oportunidades ganadas.</p></header>
    <section className="panel prospects-panel"><div className="prospects-toolbar"><div className="search-field"><Search size={17}/><input placeholder="Buscar cliente, negocio o folio" value={search} onChange={(event) => setSearch(event.target.value)}/></div><span>{filtered.length} clientes</span></div>{error && <p className="auth-error panel-error">{error}</p>}{loading ? <div className="empty-table"><strong>Cargando clientes…</strong></div> : clients.length === 0 ? <div className="module-empty prospects-empty"><div className="module-empty-icon"><Users size={27}/></div><h2>Todavía no hay clientes</h2><p>Los prospectos convertidos aparecerán automáticamente en este espacio.</p></div> : <div className="prospect-list">{filtered.map((client) => <article className="client-row" key={client.id}><div><small>{client.folio}</small><strong>{client.name}</strong><span>{client.business_name || 'Sin negocio registrado'}</span></div><div><small>Teléfono</small><span>{client.phone || 'Sin teléfono'}</span></div><div><small>Correo</small><span>{client.email || 'Sin correo'}</span></div><span className="status">Activo</span></article>)}</div>}</section>
  </>
}
