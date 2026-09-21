import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
