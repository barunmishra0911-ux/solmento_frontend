import { Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./components/section/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperAdminProtectedRoute from "./components/SuperAdminProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OtpVerification from "./pages/OtpVerification";
import VerifyEmail from "./pages/VerifyEmail";
import Register from "./components/section/Registration";
import TwoFactorAuthentication from "./pages/TwoFactorAuthentication";
import SuperAdminDashboard from "./superadmin/SuperAdminDashboard";
import TenantList from "./superadmin/TenantList";
import CreateTenant from "./superadmin/CreateTenant";
import TenantDetails from "./superadmin/TenantDetails";
import EditTenant from "./superadmin/EditTenant";
import TenantUsage from "./superadmin/TenantUsage";
import TenantActivity from "./superadmin/TenantActivity";
import SuperAdminBasicPage from "./superadmin/SuperAdminBasicPage";

import SubscriptionPlans from "./superadmin/SubscriptionPlans";
import SubscriptionList from "./superadmin/SubscriptionList";
import CreatePlan from "./superadmin/CreatePlan";
import EditPlan from "./superadmin/EditPlan";
import BillingDashboard from "./superadmin/BillingDashboard";
import SettingSuperAdmin from "./superadmin/settingSuperAdmin";
import ClientAdminPanel from "./admin/ClientAdminPanel";
import SuperAdminLogin from "./components/section/SuperAdminLogin";
import SuperAdminModulePage from "./superadmin/SuperAdminModulePage";
import ToastContainer from "./components/ui/ToastContainer";

function HomeRedirect() {
  // const user = localStorage.getItem("user");
  //   return user ? (
  //     <Navigate to="/dashboard" replace />
  //   ) : (
  //     <Navigate to="/login" replace />
  //   );
}

function App() {
  const superAdminPage = (page) => (
    <SuperAdminProtectedRoute>{page}</SuperAdminProtectedRoute>
  );

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "HEAD_COUNSELLOR", "COUNSELLOR"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "HEAD_COUNSELLOR", "COUNSELLOR"]}>
              <ClientAdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/auth/register" element={<Register />} />
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/auth/forget-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/otp" element={<OtpVerification />} />
        <Route path="/auth/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/auth/2fa" element={<TwoFactorAuthentication />} />

        {/* Super admin */}
        <Route
          path="/super-admin/dashboard"
          element={superAdminPage(<SuperAdminDashboard />)}
        />
        <Route path="/super-admin/tenants" element={superAdminPage(<TenantList />)} />
        <Route path="/super-admin/tenants/new" element={superAdminPage(<CreateTenant />)} />
        <Route path="/super-admin/tenants/:id/edit" element={superAdminPage(<EditTenant />)} />

        <Route path="/super-admin/plans" element={superAdminPage(<SubscriptionPlans />)} />

        <Route path="/super-admin/plans/new" element={superAdminPage(<CreatePlan />)} />
        <Route path="/super-admin/plans/:planId/edit" element={superAdminPage(<EditPlan />)} />

        <Route path="/super-admin/billing" element={superAdminPage(<BillingDashboard />)} />
        <Route
          path="/super-admin/users"
          element={superAdminPage(<SuperAdminModulePage module="platform-users" />)}
        />
        <Route path="/super-admin/subscriptions" element={superAdminPage(<SubscriptionList />)} />
        <Route
          path="/super-admin/payments"
          element={superAdminPage(
            <SuperAdminBasicPage
              title="Payments"
              description="Review subscription payments and transaction status."
            />
          )}
        />
        <Route
          path="/super-admin/ai-usage"
          element={superAdminPage(
            <SuperAdminBasicPage
              title="AI Usage"
              description="Track token usage, limits, and consumption trends."
            />
          )}
        />
        <Route
          path="/super-admin/conversations"
          element={superAdminPage(
            <SuperAdminBasicPage
              title="Conversations"
              description="Monitor tenant conversations and platform activity."
            />
          )}
        />
        <Route
          path="/super-admin/tickets"
          element={superAdminPage(<SuperAdminModulePage module="tickets" />)}
        />
        {/* <Route
          path="/super-admin/billing"
          element={
            <SuperAdminBasicPage
              title="Billing"
              description="Review invoices, payments, and billing health."
            />
          }
        /> */}
        <Route
          path="/super-admin/audit-logs"
          element={superAdminPage(<SuperAdminModulePage module="audit-logs" />)}
        />
        <Route path="/super-admin/settings" element={superAdminPage(<SettingSuperAdmin />)} />
        <Route path="/super-admin/invoices" element={superAdminPage(<SuperAdminModulePage module="invoices" />)} />
        <Route path="/super-admin/provider/ai" element={superAdminPage(<SuperAdminModulePage module="ai-provider-settings" />)} />
        <Route path="/super-admin/provider/whatsapp" element={superAdminPage(<SuperAdminModulePage module="whatsapp-provider-settings" />)} />
        <Route path="/super-admin/provider/voice" element={superAdminPage(<SuperAdminModulePage module="voice-provider-settings" />)} />
        <Route path="/super-admin/platform-users" element={superAdminPage(<SuperAdminModulePage module="platform-users" />)} />
        <Route path="/super-admin/platform-roles" element={superAdminPage(<SuperAdminModulePage module="platform-roles" />)} />
        <Route path="/super-admin/platform-permissions" element={superAdminPage(<SuperAdminModulePage module="platform-permissions" />)} />
        <Route path="/super-admin/announcements" element={superAdminPage(<SuperAdminModulePage module="announcements" />)} />
        <Route path="/super-admin/global-analytics" element={superAdminPage(<SuperAdminModulePage module="global-analytics" />)} />
        <Route path="/super-admin/system-health" element={superAdminPage(<SuperAdminModulePage module="system-health" />)} />
        <Route path="/super-admin/tickets/:ticketId" element={superAdminPage(<SuperAdminModulePage module="ticket-details" />)} />
        <Route path="/super-admin/impersonation" element={superAdminPage(<SuperAdminModulePage module="impersonation" />)} />
        <Route
          path="/super-admin/settings/:sectionSlug"
          element={superAdminPage(<Navigate to="/super-admin/settings" replace />)}
        />
        <Route
          path="/super-admin/profile"
          element={superAdminPage(
            <SuperAdminBasicPage
              title="Profile"
              description="Review and manage your super admin profile."
            />
          )}
        />

        <Route
          path="/super-admin/tenants/:tenantId"
          element={superAdminPage(<TenantDetails />)}
        />

        <Route
          path="/super-admin/tenants/:tenantId/usage"
          element={superAdminPage(<TenantUsage />)}
        />
        <Route
          path="/super-admin/tenants/:tenantId/activity"
          element={superAdminPage(<TenantActivity />)}
        />
        <Route path="/super-admin/*" element={superAdminPage(<Navigate to="/super-admin/dashboard" replace />)} />
      </Routes>
    </>
  );
}

export default App;
