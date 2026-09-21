import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ClientsPage } from '@/features/clients/ClientsPage'
import { ProjectsPage } from '@/features/projects/ProjectsPage'
import { ProspectsPage } from '@/features/prospects/ProspectsPage'
import { QuotesPage } from '@/features/quotes/QuotesPage'
import { AppLayout } from '@/shared/components/AppLayout'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/prospects" element={<ProspectsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
