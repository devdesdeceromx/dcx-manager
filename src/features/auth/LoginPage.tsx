import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from '@/shared/components/Brand'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, isLoading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const form = new FormData(event.currentTarget)
    const authError = await signIn(String(form.get('email')), String(form.get('password')))
    setIsSubmitting(false)
    if (authError) {
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
      return
    }
    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
    navigate(destination ?? '/dashboard', { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Presentación de DCX Manager">
        <Brand inverted />
        <div className="intro-content">
          <span className="eyebrow">Centro de operaciones</span>
          <h1>Todo el negocio,<br />en un solo lugar.</h1>
          <p>Visibilidad clara para decidir mejor, priorizar el trabajo y mantener el crecimiento bajo control.</p>
        </div>
        <div className="intro-footer"><span className="status-pulse" aria-hidden="true" />Entorno local de desarrollo</div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand"><Brand /></div>
          <div className="login-heading">
            <div className="icon-tile"><LockKeyhole size={21} /></div>
            <h2>Bienvenido de vuelta</h2>
            <p>Ingresa para acceder al panel de DCX.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" required />
            <div className="label-row"><label htmlFor="password">Contraseña</label><button className="text-button" type="button" disabled>¿La olvidaste?</button></div>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" minLength={6} required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ingresando…' : 'Iniciar sesión'} {!isSubmitting && <ArrowRight size={18} />}</button>
          </form>
          <div className="preview-note"><span>Acceso seguro</span><p>Tu sesión se valida mediante Supabase y permanece protegida en este dispositivo.</p></div>
        </div>
      </section>
    </main>
  )
}
