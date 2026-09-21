import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { UpdatePasswordPage } from "@/features/auth/UpdatePasswordPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ClientsPage } from "@/features/clients/ClientsPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { ProspectsPage } from "@/features/prospects/ProspectsPage";
import { QuotesPage } from "@/features/quotes/QuotesPage";
import { CalendarPage } from "@/features/calendar/CalendarPage";
import { FinancesPage } from "@/features/finances/FinancesPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { TeamPage } from "@/features/team/TeamPage";
import { ActivityPage } from "@/features/activity/ActivityPage";
import { AppLayout } from "@/shared/components/AppLayout";
import { AccessRoute } from "@/features/auth/AccessRoute";
import {
  adminRoles,
  commercialRoles,
  financeRoles,
  projectRoles,
} from "@/shared/lib/permissions";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/prospects"
            element={
              <AccessRoute roles={commercialRoles}>
                <ProspectsPage />
              </AccessRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <AccessRoute roles={projectRoles}>
                <ProjectsPage />
              </AccessRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <AccessRoute roles={commercialRoles}>
                <ClientsPage />
              </AccessRoute>
            }
          />
          <Route
            path="/quotes"
            element={
              <AccessRoute roles={commercialRoles}>
                <QuotesPage />
              </AccessRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <AccessRoute roles={projectRoles}>
                <CalendarPage />
              </AccessRoute>
            }
          />
          <Route
            path="/finances"
            element={
              <AccessRoute roles={financeRoles}>
                <FinancesPage />
              </AccessRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <AccessRoute roles={adminRoles}>
                <SettingsPage />
              </AccessRoute>
            }
          />
          <Route
            path="/team"
            element={
              <AccessRoute roles={adminRoles}>
                <TeamPage />
              </AccessRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <AccessRoute roles={adminRoles}>
                <ActivityPage />
              </AccessRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
