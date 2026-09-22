import { CheckCircle2, KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import type { AppRole } from "@/shared/lib/permissions";
import { updateMyProfile } from "./profileService";

const roleLabels: Record<AppRole, string> = {
  administrator: "Administrador",
  development: "Desarrollo",
  administration: "Administración",
  collaborator: "Colaborador",
  read_only: "Solo lectura",
};

export function ProfilePage() {
  const { user, role, updatePassword } = useAuth();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    const { error } = await updateMyProfile(fullName);
    setProfileSaving(false);
    if (error) return setProfileError(error.message);
    setProfileSaved(true);
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPasswordError(null);
    setPasswordSaved(false);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password !== confirmation) return setPasswordError("Las contraseñas no coinciden.");
    setPasswordSaving(true);
    const error = await updatePassword(password);
    setPasswordSaving(false);
    if (error) return setPasswordError("No fue posible actualizar la contraseña.");
    formElement.reset();
    setPasswordSaved(true);
  }

  return <>
    <header className="module-header"><span className="eyebrow dark">CUENTA</span><h1>Mi perfil</h1><p>Administra tu identidad y la seguridad de tu acceso.</p></header>
    <section className="profile-summary panel">
      <div className="profile-avatar">{fullName.slice(0, 2).toUpperCase()}</div>
      <div><strong>{fullName}</strong><span>{user?.email}</span></div>
      <div className="profile-access"><span><ShieldCheck size={15}/> {role ? roleLabels[role] : "Sin rol"}</span><small>Cuenta activa</small></div>
    </section>
    <div className="profile-layout">
      <form className="panel settings-section" onSubmit={saveProfile}>
        <div className="settings-heading"><UserRound/><div><h2>Información personal</h2><p>Este nombre identifica tus acciones dentro del Manager.</p></div></div>
        <label>Nombre completo<input value={fullName} minLength={2} maxLength={80} onChange={(event) => setFullName(event.target.value)} required/></label>
        <label>Correo electrónico<input value={user?.email ?? ""} disabled/></label>
        <small className="field-help">El correo se administra desde el sistema de autenticación.</small>
        {profileError && <p className="auth-error">{profileError}</p>}
        {profileSaved && <p className="settings-success"><CheckCircle2 size={15}/> Perfil actualizado correctamente.</p>}
        <div className="modal-actions"><button className="new-button" disabled={profileSaving}><Save size={17}/>{profileSaving ? "Guardando…" : "Guardar perfil"}</button></div>
      </form>
      <form id="security" className="panel settings-section" onSubmit={savePassword}>
        <div className="settings-heading"><KeyRound/><div><h2>Seguridad</h2><p>Usa una contraseña única de al menos 8 caracteres.</p></div></div>
        <label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Mínimo 8 caracteres" required/></label>
        <label>Confirmar contraseña<input name="confirmation" type="password" autoComplete="new-password" minLength={8} placeholder="Repite la contraseña" required/></label>
        {passwordError && <p className="auth-error">{passwordError}</p>}
        {passwordSaved && <p className="settings-success"><CheckCircle2 size={15}/> Contraseña actualizada correctamente.</p>}
        <div className="modal-actions"><button className="new-button" disabled={passwordSaving}><KeyRound size={17}/>{passwordSaving ? "Actualizando…" : "Actualizar contraseña"}</button></div>
      </form>
    </div>
  </>;
}
