const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const tabToken =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("solmento_token") ||
        localStorage.getItem("solmento_token")
      : null;
  const authHeader = tabToken ? { Authorization: `Bearer ${tabToken}` } : {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    if (
      response.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/auth/")
    ) {
      window.dispatchEvent(
        new Event(
          path.startsWith("/superadmin/")
            ? "solmento:super-admin-auth-expired"
            : "solmento:tenant-auth-expired",
        ),
      );
    }
    const error = new Error(
      payload.message || "The authentication service is unavailable.",
    );
    error.status = response.status;
    error.details = payload.details;
    throw error;
  }
  return payload.data;
}

export function loginRequest({ email, password, rememberMe }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export function superAdminLoginRequest({ email, password, rememberMe }) {
  return request("/auth/superadmin/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export function logoutRequest() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("solmento_token");
    localStorage.removeItem("solmento_token");
  }
  return request("/auth/logout", { method: "POST" });
}

export function superAdminLogoutRequest() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("solmento_token");
    localStorage.removeItem("solmento_token");
  }
  return request("/auth/superadmin/logout", { method: "POST" });
}

export function meRequest() {
  return request("/auth/me");
}

export function superAdminMeRequest() {
  return request("/auth/superadmin/me");
}

export function registerRequest({
  companyName,
  name,
  email,
  password,
  termsAccepted,
  plan,
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      companyName,
      name,
      email,
      password,
      termsAccepted,
      plan,
    }),
  });
}

export function verifyEmailRequest(token) {
  return request(`/auth/verify-email/${encodeURIComponent(token)}`);
}

export function createAdminRequest(payload) {
  return request("/superadmin/admins", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createTeamMemberRequest(payload) {
  return request("/admin/team-members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listTeamMembersRequest() {
  return request("/admin/team-members");
}

export function listCounsellorsRequest() {
  return request("/admin/counsellors");
}

export function createCounsellorRequest(payload) {
  return request("/admin/counsellors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCounsellorRequest(id, payload) {
  return request(`/admin/counsellors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCounsellorRequest(id) {
  return request(`/admin/counsellors/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function listChatbotsRequest() {
  return request("/admin/chatbots");
}

export function getChatbotRequest(id) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}`);
}

export function getChatbotBuilderRequest(id) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/builder`);
}

export function saveChatbotBuilderDraftRequest(id, payload) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/builder`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function publishChatbotBuilderRequest(id, payload) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/builder/publish`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function crawlChatbotWebsiteRequest(id, payload = {}) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/crawl`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getChatbotCrawlStatusRequest(id) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/crawl-status`);
}

export function createChatbotRequest(payload) {
  return request("/admin/chatbots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateChatbotStatusRequest(id, status) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function duplicateChatbotRequest(id) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}/duplicate`, {
    method: "POST",
  });
}

export function deleteChatbotRequest(id) {
  return request(`/admin/chatbots/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function listAdminAccountsRequest() {
  return request("/superadmin/admins");
}

export function listTenantAccountsRequest() {
  return request("/superadmin/tenants");
}

export function getTenantRequest(id) {
  return request(`/superadmin/tenants/${encodeURIComponent(id)}`);
}

export function updateTenantRequest(id, payload) {
  return request(`/superadmin/tenants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listAuditLogsRequest() {
  return request("/superadmin/audit-logs");
}

export function listSuperAdminRecordsRequest(module, params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(
    `/superadmin/modules/${encodeURIComponent(module)}${query ? `?${query}` : ""}`,
  );
}

export function createSuperAdminRecordRequest(module, payload) {
  return request(`/superadmin/modules/${encodeURIComponent(module)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteSuperAdminRecordRequest(module, id) {
  return request(
    `/superadmin/modules/${encodeURIComponent(module)}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export function listPlansRequest() {
  return request("/superadmin/plans");
}
export function createPlanRequest(payload) {
  return request("/superadmin/plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function updatePlanRequest(id, payload) {
  return request(`/superadmin/plans/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
export function getSuperAdminDashboardRequest() {
  return request("/superadmin/dashboard");
}

export function getAdminDashboardRequest(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/dashboard${query ? `?${query}` : ""}`);
}

export function getLeadKPIsRequest(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/leads/kpis${query ? `?${query}` : ""}`);
}

export function listStudentLeadsRequest(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/leads/students${query ? `?${query}` : ""}`);
}

export function getStudentLeadRequest(id) {
  return request(`/admin/leads/students/${encodeURIComponent(id)}`);
}

export function updateStudentLeadRequest(id, payload) {
  return request(`/admin/leads/students/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteStudentLeadRequest(id) {
  return request(`/admin/leads/students/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function getLeadManagementMetricsRequest(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/leads/management/metrics${query ? `?${query}` : ""}`);
}

export function listInboxConversationsRequest(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return request(`/admin/inbox/conversations${query ? `?${query}` : ""}`);
}

export function getInboxConversationRequest(id) {
  return request(`/admin/inbox/conversations/${encodeURIComponent(id)}`);
}

export function saveConversationFeedbackRequest(id, payload) {
  return request(
    `/admin/inbox/conversations/${encodeURIComponent(id)}/feedback`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function assignLeadRequest(payload) {
  return request("/admin/leads/assign", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function assignBulkLeadsRequest(payload) {
  return request("/admin/leads/assign/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCounsellorDashboardRequest(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/counsellors/dashboard${query ? `?${query}` : ""}`);
}

export function listFollowUpsRequest(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return request(`/admin/leads/follow-ups${query ? `?${query}` : ""}`);
}

export function createFollowUpRequest(payload) {
  return request("/admin/leads/follow-ups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateFollowUpRequest(id, payload) {
  return request(`/admin/leads/follow-ups/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listCallsRequest(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return request(`/admin/calls${query ? `?${query}` : ""}`);
}

export function createCallRequest(payload) {
  return request("/admin/calls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCounsellorPerformanceRequest(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return request(`/admin/counsellors/performance${query ? `?${query}` : ""}`);
}

export function getCounsellorAvailabilityRequest(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return request(`/admin/counsellors/availability${query ? `?${query}` : ""}`);
}

export function updateCounsellorLiveStatusRequest(status) {
  return request("/admin/counsellors/availability/status", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateCounsellorScheduleRequest(schedule) {
  return request("/admin/counsellors/availability/schedule", {
    method: "PUT",
    body: JSON.stringify({ schedule }),
  });
}

export function addCounsellorLeaveRequest(payload) {
  return request("/admin/counsellors/availability/leaves", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteCounsellorLeaveRequest(leaveId) {
  return request(
    `/admin/counsellors/availability/leaves/${encodeURIComponent(leaveId)}`,
    {
      method: "DELETE",
    },
  );
}

export function getReportsRequest(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  return request(`/admin/reports${query ? `?${query}` : ""}`);
}

export function createReportActivityRequest(payload) {
  return request("/admin/reports/activity", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// WhatsApp Phase 1 API
export function getWhatsAppConfigRequest() {
  return request("/admin/whatsapp/config");
}

export function saveWhatsAppConfigRequest(data) {
  return request("/admin/whatsapp/config", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function disconnectWhatsAppRequest() {
  return request("/admin/whatsapp/disconnect", {
    method: "POST",
  });
}

export function getWhatsAppLeadsRequest() {
  return request("/admin/whatsapp/leads");
}

export function sendWhatsAppMessageRequest(data) {
  return request("/admin/whatsapp/send", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getWhatsAppBroadcastsRequest(limit = 20) {
  return request(`/admin/whatsapp/broadcasts?limit=${limit}`);
}

// Dynamic Roles & Permissions APIs
export function listRolesRequest() {
  return request("/admin/roles");
}

export function getRoleRequest(roleId) {
  return request(`/admin/roles/${roleId}`);
}

export function createRoleRequest(data) {
  return request("/admin/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoleRequest(roleId, data) {
  return request(`/admin/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoleRequest(roleId) {
  return request(`/admin/roles/${roleId}`, {
    method: "DELETE",
  });
}

export function listPermissionsCatalogRequest() {
  return request("/admin/permissions");
}

export function getRolePermissionsRequest(roleId) {
  return request(`/admin/roles/${roleId}/permissions`);
}

export function updateRolePermissionsRequest(roleId, data) {
  return request(`/admin/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Audit Logs API Helper
export function getAuditLogsRequest(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.module && filters.module !== "ALL") params.append("module", filters.module);
  if (filters.action && filters.action !== "ALL") params.append("action", filters.action);
  if (filters.user && filters.user !== "ALL") params.append("user", filters.user);
  if (filters.role && filters.role !== "ALL") params.append("role", filters.role);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const query = params.toString();
  return request(`/admin/audit-logs${query ? `?${query}` : ""}`);
}

export async function exportAuditLogsRequest(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.module && filters.module !== "ALL") params.append("module", filters.module);
  if (filters.action && filters.action !== "ALL") params.append("action", filters.action);
  if (filters.user && filters.user !== "ALL") params.append("user", filters.user);
  if (filters.role && filters.role !== "ALL") params.append("role", filters.role);
  if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.append("dateTo", filters.dateTo);

  const tabToken =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("solmento_token") ||
        localStorage.getItem("solmento_token")
      : null;
  const authHeader = tabToken ? { Authorization: `Bearer ${tabToken}` } : {};

  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/admin/audit-logs/export${query ? `?${query}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        ...authHeader,
      },
    },
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to export audit logs");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "solmento-audit-logs.csv";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) filename = match[1];
  }
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function getCompanyProfileRequest() {
  return request("/admin/company-profile");
}

export function updateCompanyProfileRequest(payload) {
  return request("/admin/company-profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function restoreCounsellorRequest(id) {
  return request(`/admin/counsellors/${id}/restore`, { method: "POST" });
}

export function restoreRoleRequest(id) {
  return request(`/admin/roles/${id}/restore`, { method: "POST" });
}

export function restoreChatbotRequest(id) {
  return request(`/admin/chatbots/${id}/restore`, { method: "POST" });
}

export function restoreCampaignRequest(id) {
  return request(`/campaigns/${id}/restore`, { method: "POST" });
}

export function getNotificationsRequest(options = {}) {
  const params = new URLSearchParams();
  if (options.unreadOnly) params.append("unreadOnly", "true");
  if (options.page) params.append("page", String(options.page));
  if (options.limit) params.append("limit", String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/admin/notifications${query}`);
}

export function getUnreadNotificationCountRequest() {
  return request("/admin/notifications/unread-count");
}

export function markNotificationReadRequest(id) {
  return request(`/admin/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsReadRequest() {
  return request("/admin/notifications/read-all", { method: "PATCH" });
}

export function getMeRequest() {
  return request("/auth/me");
}

export function updateUserProfileRequest(data) {
  return request("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}



