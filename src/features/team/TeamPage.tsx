import {
  Clock3,
  Mail,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  cancelStaffInvitation,
  inviteStaffMember,
  listStaff,
  resendStaffInvitation,
  updateStaffMember,
  type AppRole,
  type StaffMember,
} from "./teamService";

const roles: Record<AppRole, string> = {
  administrator: "Administrador",
  development: "Desarrollo",
  administration: "Administración",
  collaborator: "Colaborador",
  read_only: "Solo lectura",
};

export function TeamPage() {
  const { user } = useAuth(),
    [members, setMembers] = useState<StaffMember[]>([]),
    [search, setSearch] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState<string | null>(null),
    [notice, setNotice] = useState<string | null>(null),
    [error, setError] = useState<string | null>(null),
    [inviteOpen, setInviteOpen] = useState(false);
  const load = async () => {
    const { data, error: requestError } = await listStaff();
    setMembers(data ?? []);
    setError(requestError?.message ?? null);
    setLoading(false);
  };
  useEffect(() => {
    void listStaff().then(({ data, error: requestError }) => {
      setMembers(data ?? []);
      setError(requestError?.message ?? null);
      setLoading(false);
    });
  }, []);
  const filtered = useMemo(
    () =>
      members.filter((member) =>
        [member.full_name, member.email, roles[member.role]].some((value) =>
          value?.toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    [members, search],
  );
  async function change(
    member: StaffMember,
    updates: Partial<Pick<StaffMember, "role" | "is_active">>,
  ) {
    setSaving(member.id);
    setError(null);
    const { error: requestError } = await updateStaffMember(
      member.id,
      updates.role ?? member.role,
      updates.is_active ?? member.is_active,
    );
    if (requestError) setError(requestError.message);
    else await load();
    setSaving(null);
  }
  async function managePending(
    member: StaffMember,
    action: "resend" | "cancel",
  ) {
    if (
      action === "cancel" &&
      !window.confirm(
        `¿Cancelar la invitación para ${member.email}? Esta persona ya no podrá aceptarla.`,
      )
    )
      return;
    setSaving(member.id);
    setError(null);
    setNotice(null);
    const { error: requestError } =
      action === "resend"
        ? await resendStaffInvitation(member.id)
        : await cancelStaffInvitation(member.id);
    if (requestError) setError(requestError.message);
    else {
      setNotice(
        action === "resend"
          ? `Invitación reenviada a ${member.email}.`
          : `Invitación cancelada para ${member.email}.`,
      );
      await load();
    }
    setSaving(null);
  }
  return (
    <>
      <header className="module-header module-header-row">
        <div><span className="eyebrow dark">SISTEMA</span><h1>Equipo y permisos</h1><p>Controla quién puede acceder a DCX Manager y qué función desempeña.</p></div>
        <button className="new-button" onClick={() => setInviteOpen(true)}><Plus size={18}/> Invitar usuario</button>
      </header>
      <section className="team-summary">
        <article>
          <ShieldCheck />
          <div>
            <strong>
              {
                members.filter((member) => member.role === "administrator")
                  .length
              }
            </strong>
            <span>Administradores</span>
          </div>
        </article>
        <article>
          <UserCheck />
          <div>
            <strong>
              {members.filter((member) => member.is_active).length}
            </strong>
            <span>Usuarios activos</span>
          </div>
        </article>
        <article>
          <Clock3 />
          <div>
            <strong>
              {
                members.filter(
                  (member) => member.invitation_status === "pending",
                ).length
              }
            </strong>
            <span>Invitaciones pendientes</span>
          </div>
        </article>
        <article>
          <UserX />
          <div>
            <strong>
              {members.filter((member) => !member.is_active).length}
            </strong>
            <span>Accesos suspendidos</span>
          </div>
        </article>
      </section>
      <section className="panel prospects-panel">
        <div className="prospects-toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              placeholder="Buscar nombre, correo o rol"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span>{filtered.length} integrantes</span>
        </div>
        {error && <p className="auth-error panel-error">{error}</p>}
        {notice && <p className="team-notice">{notice}</p>}
        {loading ? (
          <div className="empty-table">
            <strong>Cargando equipo…</strong>
          </div>
        ) : (
          <div className="team-list">
            {filtered.map((member) => (
              <article className="team-row" key={member.id}>
                <div className="team-avatar">
                  {(member.full_name || member.email || "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <strong>{member.full_name || "Sin nombre"}</strong>
                  <span>
                    {member.email || "Correo no disponible"}
                    {member.id === user?.id ? " · Tú" : ""}
                  </span>
                  <small
                    className={`invitation-status ${member.invitation_status}`}
                  >
                    {member.invitation_status === "pending"
                      ? "Invitación pendiente"
                      : "Acceso confirmado"}
                  </small>
                </div>
                <select
                  aria-label={`Rol de ${member.full_name || member.email}`}
                  value={member.role}
                  disabled={saving === member.id || member.id === user?.id}
                  onChange={(e) =>
                    void change(member, { role: e.target.value as AppRole })
                  }
                >
                  {Object.entries(roles).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {member.invitation_status === "pending" ? (
                  <div className="invitation-actions">
                    <button
                      className="access-button active"
                      disabled={saving === member.id}
                      onClick={() => void managePending(member, "resend")}
                      title="Reenviar invitación"
                    >
                      <RotateCw size={15} /> Reenviar
                    </button>
                    <button
                      className="icon-button invitation-cancel"
                      disabled={saving === member.id}
                      onClick={() => void managePending(member, "cancel")}
                      aria-label={`Cancelar invitación de ${member.full_name || member.email}`}
                      title="Cancelar invitación"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    className={`access-button ${member.is_active ? "active" : "inactive"}`}
                    disabled={saving === member.id || member.id === user?.id}
                    onClick={() =>
                      void change(member, { is_active: !member.is_active })
                    }
                  >
                    {member.is_active ? (
                      <>
                        <UserCheck size={15} />
                        Activo
                      </>
                    ) : (
                      <>
                        <UserX size={15} />
                        Suspendido
                      </>
                    )}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <aside className="permission-note">
        <ShieldCheck size={18} />
        <div>
          <strong>Protección administrativa</strong>
          <span>
            No puedes suspender tu propia cuenta ni retirarte el rol de
            administrador.
          </span>
        </div>
      </aside>
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvited={async () => { setInviteOpen(false); await load() }} />}
    </>
  );
}

function InviteModal({onClose,onInvited}:{onClose:()=>void;onInvited:()=>Promise<void>}) {
  const [fullName,setFullName]=useState(''),[email,setEmail]=useState(''),[role,setRole]=useState<AppRole>('read_only'),[sending,setSending]=useState(false),[error,setError]=useState<string|null>(null)
  async function submit(event:FormEvent){event.preventDefault();setSending(true);setError(null);const{error:requestError}=await inviteStaffMember(email,fullName,role);if(requestError){setError(requestError.message);setSending(false);return}await onInvited()}
  return <div className="modal-backdrop"><section className="prospect-modal invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title"><div className="modal-header"><div><span className="eyebrow dark">NUEVO ACCESO</span><h2 id="invite-title">Invitar usuario</h2><p>Recibirá un correo para establecer su contraseña.</p></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X/></button></div><form className="prospect-form" onSubmit={submit}><label>Nombre completo<input required autoFocus value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Nombre del integrante"/></label><label>Correo electrónico<input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="nombre@empresa.com"/></label><label>Rol inicial<select value={role} onChange={(e)=>setRole(e.target.value as AppRole)}>{Object.entries(roles).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><div className="invite-role"><Mail size={18}/><div><strong>Invitación segura</strong><span>El acceso tendrá el rol seleccionado desde el momento en que sea aceptado.</span></div></div>{error&&<p className="auth-error">{error}</p>}<div className="modal-actions"><button type="button" className="period-button" onClick={onClose}>Cancelar</button><button className="new-button" disabled={sending}>{sending?'Enviando…':'Enviar invitación'}</button></div></form></section></div>
}
