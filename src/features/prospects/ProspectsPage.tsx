import {
  ArrowRight,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  UserRoundPlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  convertProspect,
  createProspect,
  listProspects,
  updateProspect,
  updateProspectStatus,
} from "./prospectService";
import type {
  Prospect,
  ProspectInput,
  ProspectSource,
  ProspectStatus,
} from "./types";
import { useAuth } from "@/features/auth/AuthContext";
import { canManageCommercial } from "@/shared/lib/permissions";

const statusLabels: Record<ProspectStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  quote: "Cotización",
  negotiation: "Negociación",
  won: "Ganado",
  lost: "No ganado",
};
const sourceLabels: Record<ProspectSource, string> = {
  referral: "Recomendación",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Página web",
  whatsapp: "WhatsApp",
  existing_client: "Cliente existente",
  direct_contact: "Contacto directo",
  other: "Otro",
};
const emptyForm: ProspectInput = {
  name: "",
  business_name: "",
  phone: "",
  email: "",
  service_interest: "",
  source: "other",
  description: "",
  notes: "",
  status: "new",
};

export function ProspectsPage() {
  const { role } = useAuth();
  const canEdit = canManageCommercial(role);
  const [searchParams, setSearchParams] = useSearchParams();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(
    () => searchParams.get("new") === "1",
  );
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [form, setForm] = useState<ProspectInput>(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProspectStatus>(
    "all",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data, error: requestError } = await listProspects();
    setProspects(data ?? []);
    setError(requestError?.message ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void listProspects().then(({ data, error: requestError }) => {
      setProspects(data ?? []);
      setError(requestError?.message ?? null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filtered = useMemo(
    () =>
      prospects.filter((prospect) => {
        const query = search.trim().toLowerCase();
        const matchesText =
          !query ||
          [prospect.folio, prospect.name, prospect.business_name].some(
            (value) => value?.toLowerCase().includes(query),
          );
        return (
          matchesText &&
          (statusFilter === "all" || prospect.status === statusFilter)
        );
      }),
    [prospects, search, statusFilter],
  );

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(prospect: Prospect) {
    setSelected(prospect);
    setForm({
      name: prospect.name,
      business_name: prospect.business_name ?? "",
      phone: prospect.phone ?? "",
      email: prospect.email ?? "",
      service_interest: prospect.service_interest,
      source: prospect.source,
      estimated_budget: prospect.estimated_budget ?? undefined,
      description: prospect.description ?? "",
      notes: prospect.notes ?? "",
      status: prospect.status,
    });
    setError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setSelected(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      estimated_budget: form.estimated_budget || undefined,
    };
    const { error: requestError } = selected
      ? await updateProspect(selected.id, payload)
      : await createProspect(payload);
    setSaving(false);
    if (requestError) return setError(requestError.message);
    closeModal();
    await load();
  }

  async function changeStatus(prospect: Prospect, status: ProspectStatus) {
    const previous = prospects;
    setProspects((items) =>
      items.map((item) =>
        item.id === prospect.id ? { ...item, status } : item,
      ),
    );
    const { error: requestError } = await updateProspectStatus(
      prospect.id,
      status,
    );
    if (requestError) {
      setProspects(previous);
      setError(requestError.message);
    }
  }

  async function handleConvert() {
    if (!selected || selected.converted_at) return;
    setSaving(true);
    setError(null);
    const { error: requestError } = await convertProspect(selected.id);
    setSaving(false);
    if (requestError) return setError(requestError.message);
    closeModal();
    await load();
  }

  return (
    <>
      <header className="module-header module-header-row">
        <div>
          <span className="eyebrow dark">CRM</span>
          <h1>Prospectos</h1>
          <p>Da seguimiento a cada oportunidad desde el primer contacto.</p>
        </div>
        {canEdit && <button className="new-button" onClick={openCreate}>
          <Plus size={18} /> Nuevo prospecto
        </button>}
      </header>
      <section className="pipeline" aria-label="Resumen del pipeline">
        {Object.entries(statusLabels).map(([status, label]) => (
          <button
            key={status}
            className={statusFilter === status ? "pipeline-active" : ""}
            onClick={() =>
              setStatusFilter(
                statusFilter === status ? "all" : (status as ProspectStatus),
              )
            }
          >
            <span>{label}</span>
            <strong>
              {prospects.filter((item) => item.status === status).length}
            </strong>
          </button>
        ))}
      </section>
      <section className="panel prospects-panel">
        <div className="prospects-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              placeholder="Buscar por nombre, negocio o folio"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span>
            {filtered.length} de {prospects.length}
          </span>
        </div>
        {error && <p className="auth-error panel-error">{error}</p>}
        {loading ? (
          <div className="empty-table">
            <strong>Cargando prospectos…</strong>
          </div>
        ) : prospects.length === 0 ? (
          <div className="module-empty prospects-empty">
            <div className="module-empty-icon">
              <UserRoundPlus size={27} />
            </div>
            <h2>Registra tu primer prospecto</h2>
            <p>
              Cuando alguien pregunte por un servicio, agrégalo aquí para no
              perder el seguimiento.
            </p>
            {canEdit && <button className="new-button" onClick={openCreate}>
              Nuevo prospecto
            </button>}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-table">
            <strong>No encontramos coincidencias</strong>
            <span>Prueba otra búsqueda o elimina el filtro de etapa.</span>
          </div>
        ) : (
          <div className="prospect-list">
            {filtered.map((prospect) => (
              <article className="prospect-row" key={prospect.id}>
                <button
                  className="prospect-main"
                  onClick={() => canEdit && openEdit(prospect)}
                >
                  <small>{prospect.folio}</small>
                  <strong>{prospect.name}</strong>
                  <span>
                    {prospect.business_name || "Sin negocio registrado"}
                  </span>
                </button>
                <div>
                  <small>Interés</small>
                  <strong>{prospect.service_interest}</strong>
                </div>
                <div>
                  <small>Origen</small>
                  <span>{sourceLabels[prospect.source]}</span>
                </div>
                <select
                  className={`status prospect-${prospect.status}`}
                  aria-label={`Estado de ${prospect.name}`}
                  value={prospect.status}
                  disabled={!canEdit || Boolean(prospect.converted_at)}
                  onChange={(event) =>
                    void changeStatus(
                      prospect,
                      event.target.value as ProspectStatus,
                    )
                  }
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {canEdit && <button
                  className="icon-button edit-prospect"
                  onClick={() => openEdit(prospect)}
                  aria-label={`Editar ${prospect.name}`}
                >
                  <Pencil size={17} />
                </button>}
              </article>
            ))}
          </div>
        )}
      </section>
      {modalOpen && (
        <ProspectModal
          selected={selected}
          form={form}
          setForm={setForm}
          error={error}
          saving={saving}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onConvert={handleConvert}
        />
      )}
    </>
  );
}

type ProspectModalProps = {
  selected: Prospect | null;
  form: ProspectInput;
  setForm: (form: ProspectInput) => void;
  error: string | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  onConvert: () => Promise<void>;
};

function ProspectModal({
  selected,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
  onConvert,
}: ProspectModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="prospect-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prospect-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow dark">
              {selected ? selected.folio : "Nueva oportunidad"}
            </span>
            <h2 id="prospect-title">
              {selected ? "Editar prospecto" : "Registrar prospecto"}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <X />
          </button>
        </div>
        <form onSubmit={onSubmit} className="prospect-form">
          <label>
            Nombre completo
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Negocio
            <input
              value={form.business_name}
              onChange={(e) =>
                setForm({ ...form, business_name: e.target.value })
              }
            />
          </label>
          <div className="form-grid">
            <label>
              Teléfono
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
          </div>
          <label>
            Servicio de interés
            <input
              required
              value={form.service_interest}
              onChange={(e) =>
                setForm({ ...form, service_interest: e.target.value })
              }
            />
          </label>
          <div className="form-grid">
            <label>
              Origen
              <select
                value={form.source}
                onChange={(e) =>
                  setForm({ ...form, source: e.target.value as ProspectSource })
                }
              >
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Etapa
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ProspectStatus })
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Presupuesto estimado
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.estimated_budget ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  estimated_budget: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </label>
          <label>
            Descripción
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label>
            Notas de seguimiento
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <div className="modal-actions modal-actions-split">
            {selected && (
              <button
                type="button"
                className="convert-button"
                onClick={() => void onConvert()}
                disabled={saving || Boolean(selected.converted_at)}
              >
                {selected.converted_at ? (
                  <>
                    <CheckCircle2 size={17} /> Ya es cliente
                  </>
                ) : (
                  <>
                    Convertir a cliente <ArrowRight size={17} />
                  </>
                )}
              </button>
            )}
            <div>
              <button type="button" className="period-button" onClick={onClose}>
                Cancelar
              </button>
              <button className="new-button" disabled={saving}>
                {saving
                  ? "Guardando…"
                  : selected
                    ? "Guardar cambios"
                    : "Guardar prospecto"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
