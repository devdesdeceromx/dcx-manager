import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/app/App'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { AuthProvider } from '@/features/auth/AuthContext'
import { supabaseConfigurationError } from '@/shared/lib/supabase'
import '@/shared/styles/global.css'

const application = supabaseConfigurationError ? (
  <main className="system-message"><h1>Configuración pendiente</h1><p>DevDesdeCeroMx Manager necesita las variables públicas de Supabase para iniciar.</p><small>Revisa VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.</small></main>
) : (
  <ErrorBoundary>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {application}
  </StrictMode>,
)
