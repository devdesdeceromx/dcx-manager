import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AccessRoute } from "@/features/auth/AccessRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { UpdatePasswordPage } from "@/features/auth/UpdatePasswordPage";
import { AppLayout } from "@/shared/components/AppLayout";
import { adminRoles, commercialRoles, financeRoles, projectRoles } from "@/shared/lib/permissions";

function lazyPage<T extends Record<string, ComponentType>>(loader: () => Promise<T>, name: keyof T) {
  return lazy(async () => ({ default: (await loader())[name] }));
}

const DashboardPage = lazyPage(() => import("@/features/dashboard/DashboardPage"), "DashboardPage");
const ClientsPage = lazyPage(() => import("@/features/clients/ClientsPage"), "ClientsPage");
const ProjectsPage = lazyPage(() => import("@/features/projects/ProjectsPage"), "ProjectsPage");
const ProspectsPage = lazyPage(() => import("@/features/prospects/ProspectsPage"), "ProspectsPage");
const QuotesPage = lazyPage(() => import("@/features/quotes/QuotesPage"), "QuotesPage");
const CalendarPage = lazyPage(() => import("@/features/calendar/CalendarPage"), "CalendarPage");
const FinancesPage = lazyPage(() => import("@/features/finances/FinancesPage"), "FinancesPage");
const SettingsPage = lazyPage(() => import("@/features/settings/SettingsPage"), "SettingsPage");
const TeamPage = lazyPage(() => import("@/features/team/TeamPage"), "TeamPage");
const ActivityPage = lazyPage(() => import("@/features/activity/ActivityPage"), "ActivityPage");
const ProfilePage = lazyPage(() => import("@/features/profile/ProfilePage"), "ProfilePage");
const WebsitePage = lazyPage(() => import("@/features/website/WebsitePage"), "WebsitePage");

export function App() {
  return <Suspense fallback={<div className="route-loading">Cargando módulo…</div>}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/prospects" element={<AccessRoute roles={commercialRoles}><ProspectsPage /></AccessRoute>} />
          <Route path="/projects" element={<AccessRoute roles={projectRoles}><ProjectsPage /></AccessRoute>} />
          <Route path="/clients" element={<AccessRoute roles={commercialRoles}><ClientsPage /></AccessRoute>} />
          <Route path="/quotes" element={<AccessRoute roles={commercialRoles}><QuotesPage /></AccessRoute>} />
          <Route path="/calendar" element={<AccessRoute roles={projectRoles}><CalendarPage /></AccessRoute>} />
          <Route path="/finances" element={<AccessRoute roles={financeRoles}><FinancesPage /></AccessRoute>} />
          <Route path="/settings" element={<AccessRoute roles={adminRoles}><SettingsPage /></AccessRoute>} />
          <Route path="/team" element={<AccessRoute roles={adminRoles}><TeamPage /></AccessRoute>} />
          <Route path="/activity" element={<AccessRoute roles={adminRoles}><ActivityPage /></AccessRoute>} />
          <Route path="/website" element={<AccessRoute roles={adminRoles}><WebsitePage /></AccessRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>;
}
