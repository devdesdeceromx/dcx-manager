import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, TriangleAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "@/shared/components/Brand";
import { supabase } from "@/shared/lib/supabase";
import { useAuth } from "./AuthContext";

export function UpdatePasswordPage() {
  const [linkHasError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    return Boolean(params.get("error_description") ?? hash.get("error_description"));
  });
  const [ready, setReady] = useState(linkHasError);
  const [validSession, setValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(
    linkHasError ? "Este enlace venció o ya fue utilizado." : null,
  );
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (linkHasError) return;
    void supabase.auth.getSession().then(({ data }) => {
      setValidSession(Boolean(data.session));
      setReady(true);
    });
  }, [linkHasError]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    const requestError = await updatePassword(password);
    setSaving(false);
    if (requestError) {
      setError("No pudimos actualizar la contraseña. Solicita un nuevo enlace.");
      return;
    }
    setCompleted(true);
  }

  return <main className="login-page">
    <section className="login-intro" aria-label="Presentación de DCX Manager">
      <Brand inverted />
      <div className="intro-content"><span className="eyebrow">Acceso protegido</span><h1>Tu cuenta,<br />bajo tu control.</h1><p>Define una contraseña personal para ingresar de forma segura a DCX Manager.</p></div>
      <div className="intro-footer"><span className="status-pulse" aria-hidden="true" />Sesión cifrada por Supabase</div>
    </section>
    <section className="login-panel"><div className="login-card">
      <div className="mobile-brand"><Brand /></div>
      {!ready ? <div className="auth-loading-inline">Validando enlace…</div> : completed ? <div className="auth-result">
        <div className="icon-tile success"><CheckCircle2 size={22} /></div><h2>Contraseña guardada</h2><p>Tu acceso está listo. Ya puedes continuar a DCX Manager.</p><button className="primary-button" onClick={() => navigate("/dashboard", { replace: true })}>Entrar al Dashboard <ArrowRight size={18} /></button>
      </div> : !validSession ? <div className="auth-result">
        <div className="icon-tile warning"><TriangleAlert size={22} /></div><h2>Enlace no válido</h2><p>{error ?? "Este enlace venció, ya fue utilizado o no contiene una sesión válida."}</p><Link className="primary-button" to="/login">Solicitar otro enlace</Link>
      </div> : <>
        <div className="login-heading"><div className="icon-tile"><KeyRound size={21} /></div><h2>Crea tu contraseña</h2><p>Será la contraseña que usarás para iniciar sesión.</p></div>
        <form onSubmit={submit}>
          <label htmlFor="new-password">Nueva contraseña</label>
          <div className="password-field"><input id="new-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="Mínimo 8 caracteres" required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          <label htmlFor="password-confirmation">Confirmar contraseña</label>
          <input id="password-confirmation" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} placeholder="Repite tu contraseña" required />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar contraseña"}{!saving && <ArrowRight size={18} />}</button>
        </form>
      </>}
    </div></section>
  </main>;
}
