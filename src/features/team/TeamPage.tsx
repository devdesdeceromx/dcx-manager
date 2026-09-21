import { Plus, Search, ShieldCheck, UserCheck, UserPlus, UserX, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import {
  inviteStaffMember,
  listStaff,
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
  const [fullName,setFullName]=useState(''),[email,setEmail]=useState(''),[sending,setSending]=useState(false),[error,setError]=useState<string|null>(null)
  async function submit(event:FormEvent){event.preventDefault();setSending(true);setError(null);const{error:requestError}=await inviteStaffMember(email,fullName);if(requestError){setError(requestError.message);setSending(false);return}await onInvited()}
  return <div className="modal-backdrop"><section className="prospect-modal invite-modal" role="dialog" aria-modal="true" aria-labelledby="invite-title"><div className="modal-header"><div><span className="eyebrow dark">NUEVO ACCESO</span><h2 id="invite-title">Invitar usuario</h2><p>Recibirá un correo para establecer su contraseña.</p></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X/></button></div><form className="prospect-form" onSubmit={submit}><label>Nombre completo<input required autoFocus value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Nombre del integrante"/></label><label>Correo electrónico<input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="nombre@empresa.com"/></label><div className="invite-role"><UserPlus size={18}/><div><strong>Acceso inicial: Solo lectura</strong><span>Después de aceptar la invitación podrás cambiar su rol desde esta pantalla.</span></div></div>{error&&<p className="auth-error">{error}</p>}<div className="modal-actions"><button type="button" className="period-button" onClick={onClose}>Cancelar</button><button className="new-button" disabled={sending}>{sending?'Enviando…':'Enviar invitación'}</button></div></form></section></div>
}
