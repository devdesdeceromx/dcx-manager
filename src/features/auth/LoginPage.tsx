import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Brand } from "@/shared/components/Brand";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "recovery">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading, signIn, requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isLoading && isAuthenticated && mode === "login") return <Navigate to="/dashboard" replace />;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const authError = await signIn(String(form.get("email")), String(form.get("password")));
    setIsSubmitting(false);
    if (authError) {
      setError("No pudimos iniciar sesión. Revisa tu correo y contraseña.");
      return;
    }
    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    navigate(destination ?? "/dashboard", { replace: true });
  }

  async function handleRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const requestError = await requestPasswordReset(email);
    setIsSubmitting(false);
    if (requestError) {
      setError("No pudimos enviar el enlace. Inténtalo nuevamente.");
      return;
    }
    setSentTo(email);
  }

  function showRecovery() {
    setMode("recovery"); setError(null); setSentTo(null);
  }
  function showLogin() {
    setMode("login"); setError(null); setSentTo(null);
  }

  return <main className="login-page">
    <section className="login-intro" aria-label="Presentación de DCX Manager">
      <Brand inverted />
      <div className="intro-content"><span className="eyebrow">Centro de operaciones</span><h1>Todo el negocio,<br />en un solo lugar.</h1><p>Visibilidad clara para decidir mejor, priorizar el trabajo y mantener el crecimiento bajo control.</p></div>
      <div className="intro-footer"><span className="status-pulse" aria-hidden="true" />Entorno local de desarrollo</div>
    </section>
    <section className="login-panel"><div className="login-card">
      <div className="mobile-brand"><Brand /></div>
      {mode === "login" ? <>
        <div className="login-heading"><div className="icon-tile"><LockKeyhole size={21} /></div><h2>Bienvenido de vuelta</h2><p>Ingresa para acceder al panel de DCX.</p></div>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required />
          <div className="label-row"><label htmlFor="password">Contraseña</label><button className="text-button" type="button" onClick={showRecovery}>¿La olvidaste?</button></div>
          <div className="password-field"><input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" minLength={6} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Ingresando…" : "Iniciar sesión"}{!isSubmitting && <ArrowRight size={18} />}</button>
        </form>
      </> : <RecoveryForm sentTo={sentTo} error={error} isSubmitting={isSubmitting} onSubmit={handleRecovery} onBack={showLogin} />}
      <div className="preview-note"><span>Acceso seguro</span><p>Tu sesión se valida mediante Supabase y permanece protegida en este dispositivo.</p></div>
    </div></section>
  </main>;
}

function RecoveryForm({ sentTo, error, isSubmitting, onSubmit, onBack }: { sentTo: string | null; error: string | null; isSubmitting: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>; onBack: () => void }) {
  return <>
    <button className="auth-back" type="button" onClick={onBack}><ArrowLeft size={16} /> Volver al inicio de sesión</button>
    <div className="login-heading"><div className="icon-tile">{sentTo ? <CheckCircle2 size={21} /> : <KeyRound size={21} />}</div><h2>{sentTo ? "Revisa tu correo" : "Recupera tu acceso"}</h2><p>{sentTo ? `Enviamos un enlace seguro a ${sentTo}.` : "Te enviaremos un enlace para crear una nueva contraseña."}</p></div>
    {sentTo ? <div className="auth-success">El enlace puede tardar unos minutos. Revisa también tu carpeta de correo no deseado.</div> : <form onSubmit={onSubmit}>
      <label htmlFor="recovery-email">Correo electrónico</label>
      <input id="recovery-email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required autoFocus />
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando…" : "Enviar enlace"}{!isSubmitting && <ArrowRight size={18} />}</button>
    </form>}
  </>;
}
