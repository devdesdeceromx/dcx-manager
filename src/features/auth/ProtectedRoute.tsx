import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="auth-loading">Cargando DCX Manager…</div>
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />
}
