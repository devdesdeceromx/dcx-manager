import { Download, FilePlus2, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { listClients, type Client } from "@/features/clients/clientService";
import { createQuote, listQuotes, updateQuoteStatus } from "./quoteService";
import type { Quote, QuoteItemInput, QuoteStatus } from "./types";
import { downloadQuotePdf } from "@/shared/lib/pdf";

const statusLabels: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  viewed: "Vista",
  negotiation: "Negociación",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Vencida",
};
const emptyItem: QuoteItemInput = {
  description: "",
  quantity: 1,
  unit_price: 0,
};

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_id: "",
    title: "",
    description: "",
    valid_until: "",
    notes: "",
    discount: 0,
    tax: 0,
  });
  const [items, setItems] = useState<QuoteItemInput[]>([{ ...emptyItem }]);

  async function load() {
    const [quotesResult, clientsResult] = await Promise.all([
      listQuotes(),
      listClients(),
    ]);
    setQuotes(quotesResult.data ?? []);
    setClients(clientsResult.data ?? []);
    setError(
      quotesResult.error?.message ?? clientsResult.error?.message ?? null,
    );
    setLoading(false);
  }
  useEffect(() => {
    void Promise.all([listQuotes(), listClients()]).then(
      ([quotesResult, clientsResult]) => {
        setQuotes(quotesResult.data ?? []);
        setClients(clientsResult.data ?? []);
        setError(
          quotesResult.error?.message ?? clientsResult.error?.message ?? null,
        );
        setLoading(false);
      },
    );
  }, []);
  const filtered = useMemo(
    () =>
      quotes.filter((quote) =>
        [
          quote.folio,
          quote.title,
          quote.clients?.name,
          quote.clients?.business_name,
        ].some((value) => value?.toLowerCase().includes(search.toLowerCase())),
      ),
    [quotes, search],
  );
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const total = Math.max(subtotal - form.discount + form.tax, 0);

  function close() {
    setOpen(false);
    setForm({
      client_id: "",
      title: "",
      description: "",
      valid_until: "",
      notes: "",
      discount: 0,
      tax: 0,
    });
    setItems([{ ...emptyItem }]);
    setError(null);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const { error: requestError } = await createQuote(
      { ...form, valid_until: form.valid_until || undefined },
      items,
    );
    setSaving(false);
    if (requestError) return setError(requestError.message);
    close();
    await load();
  }
  async function changeStatus(quote: Quote, status: QuoteStatus) {
    const previous = quotes;
    setQuotes((all) =>
      all.map((item) => (item.id === quote.id ? { ...item, status } : item)),
    );
    const { error: requestError } = await updateQuoteStatus(quote.id, status);
    if (requestError) {
      setQuotes(previous);
      setError(requestError.message);
    }
  }

  return (
    <>
      <header className="module-header module-header-row">
        <div>
          <span className="eyebrow dark">Comercial</span>
          <h1>Cotizaciones</h1>
          <p>Prepara propuestas reutilizando los datos de tus clientes.</p>
        </div>
        <button
          className="new-button"
          onClick={() => setOpen(true)}
          disabled={!clients.length}
        >
          <Plus size={18} /> Nueva cotización
        </button>
      </header>
      <section className="panel prospects-panel">
        <div className="prospects-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              placeholder="Buscar folio, cliente o cotización"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span>{filtered.length} cotizaciones</span>
        </div>
        {error && <p className="auth-error panel-error">{error}</p>}
        {loading ? (
          <div className="empty-table">
            <strong>Cargando cotizaciones…</strong>
          </div>
        ) : !clients.length ? (
          <div className="module-empty prospects-empty">
            <div className="module-empty-icon">
              <FilePlus2 size={27} />
            </div>
            <h2>Primero necesitas un cliente</h2>
            <p>
              Convierte un prospecto ganado para poder preparar su primera
              cotización.
            </p>
            <Link className="new-button" to="/prospects">
              Ir a prospectos
            </Link>
          </div>
        ) : !quotes.length ? (
          <div className="module-empty prospects-empty">
            <div className="module-empty-icon">
              <FilePlus2 size={27} />
            </div>
            <h2>Crea tu primera cotización</h2>
            <p>
              Agrega conceptos y el sistema calculará automáticamente el total.
            </p>
            <button className="new-button" onClick={() => setOpen(true)}>
              Nueva cotización
            </button>
          </div>
        ) : (
          <div className="prospect-list">
            {filtered.map((quote) => (
              <article className="quote-row" key={quote.id}>
                <div>
                  <small>{quote.folio}</small>
                  <strong>{quote.title}</strong>
                  <span>
                    {quote.clients?.business_name || quote.clients?.name}
                  </span>
                </div>
                <div>
                  <small>Vigencia</small>
                  <span>
                    {quote.valid_until
                      ? new Intl.DateTimeFormat("es-MX").format(
                          new Date(`${quote.valid_until}T12:00:00`),
                        )
                      : "Sin fecha"}
                  </span>
                </div>
                <strong className="quote-total">
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(quote.total)}
                </strong>
                <button
                  className="icon-button pdf-button"
                  onClick={() => downloadQuotePdf(quote)}
                  aria-label={`Descargar ${quote.folio}`}
                  title="Descargar PDF"
                >
                  <Download size={17} />
                </button>
                <select
                  className="status"
                  value={quote.status}
                  onChange={(event) =>
                    void changeStatus(quote, event.target.value as QuoteStatus)
                  }
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        )}
      </section>
      {open && (
        <div className="modal-backdrop">
          <section
            className="prospect-modal quote-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow dark">Nueva propuesta</span>
                <h2 id="quote-title">Crear cotización</h2>
              </div>
              <button
                className="icon-button"
                onClick={close}
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>
            <form className="prospect-form" onSubmit={submit}>
              <label>
                Cliente
                <select
                  required
                  value={form.client_id}
                  onChange={(event) =>
                    setForm({ ...form, client_id: event.target.value })
                  }
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option value={client.id} key={client.id}>
                      {client.business_name || client.name} · {client.folio}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Título
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </label>
              <label>
                Descripción
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              <div className="quote-items-header">
                <strong>Conceptos</strong>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setItems([...items, { ...emptyItem }])}
                >
                  <Plus size={15} /> Agregar concepto
                </button>
              </div>
              {items.map((item, index) => (
                <div className="quote-item" key={index}>
                  <input
                    aria-label={`Concepto ${index + 1}`}
                    required
                    placeholder="Descripción del servicio"
                    value={item.description}
                    onChange={(event) =>
                      setItems(
                        items.map((current, i) =>
                          i === index
                            ? { ...current, description: event.target.value }
                            : current,
                        ),
                      )
                    }
                  />
                  <input
                    aria-label={`Cantidad ${index + 1}`}
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      setItems(
                        items.map((current, i) =>
                          i === index
                            ? {
                                ...current,
                                quantity: Number(event.target.value),
                              }
                            : current,
                        ),
                      )
                    }
                  />
                  <input
                    aria-label={`Precio ${index + 1}`}
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(event) =>
                      setItems(
                        items.map((current, i) =>
                          i === index
                            ? {
                                ...current,
                                unit_price: Number(event.target.value),
                              }
                            : current,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Eliminar concepto ${index + 1}`}
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems(items.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
              <div className="form-grid">
                <label>
                  Descuento
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount}
                    onChange={(event) =>
                      setForm({ ...form, discount: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  Impuestos
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.tax}
                    onChange={(event) =>
                      setForm({ ...form, tax: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  Válida hasta
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={(event) =>
                      setForm({ ...form, valid_until: event.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                Notas
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                />
              </label>
              <div className="quote-summary">
                <span>
                  Subtotal <strong>{money(subtotal)}</strong>
                </span>
                <span>
                  Total <strong>{money(total)}</strong>
                </span>
              </div>
              {error && <p className="auth-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="period-button" onClick={close}>
                  Cancelar
                </button>
                <button className="new-button" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar borrador"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function money(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}
