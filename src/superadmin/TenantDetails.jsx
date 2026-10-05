import { cloneElement, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Edit3,
  ExternalLink,
  FileText,
  Globe2,
  KeyRound,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { getTenantRequest, updateTenantRequest } from "@/lib/authApi";

const TENANT = {
  id: "TEN-000248",
  name: "BrightMind University",
  domain: "brightmind.edu",
  status: "Active",
  plan: "Enterprise Plan",
  planPrice: "$5,000 / month",
  admin: "Sarah Johnson",
  adminEmail: "sarah.johnson@brightmind.edu",
  industry: "Education",
  country: "United States",
  timezone: "America/New_York",
  memberSince: "May 12, 2024",
  logoLetter: "B",
  accent: "from-blue-600 to-indigo-600",
};

const TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "usage", label: "Usage", icon: BarChart3 },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "users", label: "Users", icon: Users },
];

const LIMITS = [
  {
    label: "Users",
    usedLabel: "120 / 200",
    percent: 60,
    color: "bg-violet-500",
  },
  {
    label: "API Requests",
    usedLabel: "680K / 1M",
    percent: 68,
    color: "bg-violet-500",
  },
  {
    label: "Storage",
    usedLabel: "256 GB / 500 GB",
    percent: 51.2,
    color: "bg-violet-500",
  },
  {
    label: "Environments",
    usedLabel: "5 / 10",
    percent: 50,
    color: "bg-violet-500",
  },
];

const QUICK_STATS = [
  {
    label: "Monthly Recurring Revenue",
    value: "$12,450",
    meta: "+12.5% vs last month",
    icon: CircleDollarSign,
    iconClass: "bg-emerald-50 text-emerald-600",
    positive: true,
  },
  {
    label: "Total Users",
    value: "120",
    meta: "+8 vs last month",
    icon: Users,
    iconClass: "bg-blue-50 text-blue-600",
    positive: true,
  },
  {
    label: "Active Users (30d)",
    value: "85",
    meta: "70.8% of total users",
    icon: BarChart3,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    label: "API Requests (30d)",
    value: "680K",
    meta: "+15.3% vs last month",
    icon: KeyRound,
    iconClass: "bg-orange-50 text-orange-600",
    positive: true,
  },
  {
    label: "Storage Used",
    value: "256 GB",
    meta: "51.2% of 500 GB",
    icon: Database,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
];

const ACTIVITY_ITEMS = [
  {
    title: "Subscription upgraded to Enterprise",
    by: "Sarah Johnson",
    time: "2h ago",
    icon: CreditCard,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    title: "12 new users were added",
    by: "Michael Brown",
    time: "5h ago",
    icon: Users,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    title: "API usage crossed 65% of limit",
    by: "System",
    time: "1d ago",
    icon: BarChart3,
    iconClass: "bg-orange-50 text-orange-600",
  },
  {
    title: "Admin profile was updated",
    by: "Sarah Johnson",
    time: "1d ago",
    icon: Pencil,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
];

const USER_ROWS = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@brightmind.edu",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Michael Brown",
    email: "michael.brown@brightmind.edu",
    role: "Manager",
    status: "Active",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@brightmind.edu",
    role: "Staff",
    status: "Invited",
  },
];

function formatDateRange() {
  return "May 2 – May 9, 2026";
}

export default function TenantDetails() {
  const navigate = useNavigate();
  const { tenantId } = useParams();

  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");

  const activeTab = location.pathname.endsWith("/usage")
    ? "usage"
    : location.pathname.endsWith("/activity")
      ? "activity"
      : selectedTab;
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [tenant, setTenant] = useState(() => ({
    ...TENANT,
    id: tenantId || TENANT.id,
  }));

  useEffect(() => {
    let active = true;
    getTenantRequest(tenantId)
      .then(({ tenant: savedTenant }) => {
        if (!active) return;
        setTenant((current) => ({
          ...current,
          id: savedTenant.id,
          name: savedTenant.companyName,
          domain: savedTenant.companyDomain || "—",
          status: savedTenant.status === "ACTIVE" ? "Active" : "Suspended",
          plan: savedTenant.plan || "Unassigned",
          admin: savedTenant.admin?.name || "—",
          adminEmail: savedTenant.admin?.email || "—",
          logoLetter: (savedTenant.companyName || "T")
            .slice(0, 1)
            .toUpperCase(),
        }));
        setLoadError("");
      })
      .catch((error) => {
        if (active)
          setLoadError(error.message || "Unable to load this admin.");
      });
    return () => {
      active = false;
    };
  }, [tenantId]);

  const handleEditTenant = () => {
    navigate(`/super-admin/tenants/${tenantId}/edit`);
  };

  const handleDeleteTenant = () => {
    setLoadError(
      "Admin deletion requires a typed confirmation workflow and is not enabled yet.",
    );
    setShowDeleteModal(false);
  };

  const handleSuspendTenant = () => {
    updateTenantRequest(tenant.id, { status: "INACTIVE" })
      .then(() => {
        setTenant((current) => ({ ...current, status: "Suspended" }));
        setShowSuspendModal(false);
      })
      .catch((error) =>
        setLoadError(error.message || "Unable to suspend tenant."),
      );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
        onMobileSidebarToggle={() =>
          setIsMobileSidebarOpen((current) => !current)
        }
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            {loadError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {loadError}
              </div>
            )}
            {/* breadcrumb */}

            <div className="mb-4 flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => navigate("/super-admin/tenants")}
                className="cursor-pointer text-blue-500 transition hover:text-blue-600"
              >
                Admins
              </button>

              <span className="text-slate-300">›</span>

              <span className="truncate text-slate-600">{tenant.name}</span>
            </div>

            {/* tenant header */}

            <section className="border-b border-slate-200 pb-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tenant.accent} text-xl font-bold text-white shadow-sm sm:h-16 sm:w-16 sm:text-2xl`}
                  >
                    {tenant.logoLetter}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {tenant.name}
                      </h1>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {tenant.status}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                      <span>{tenant.domain}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Admin ID: {tenant.id}</span>
                      <button
                        type="button"
                        title="Copy admin ID"
                        className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        onClick={() =>
                          navigator.clipboard?.writeText(tenant.id)
                        }
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsMoreOpen((value) => !value)}
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      More actions
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {isMoreOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMoreOpen(false);
                            setShowSuspendModal(true);
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <ShieldAlert className="h-4 w-4 text-amber-500" />
                          Suspend Admin
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsMoreOpen(false);
                            setShowDeleteModal(true);
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Admin
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleEditTenant}
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Admin
                  </button>
                </div>
              </div>
            </section>

            {/* tabs */}

            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-max border-b border-slate-200">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        if (tab.key === "usage") {
                          navigate(`/super-admin/tenants/${tenant.id}/usage`);
                          return;
                        }

                        if (tab.key === "activity") {
                          navigate(
                            `/super-admin/tenants/${tenant.id}/activity`,
                          );
                          return;
                        }

                        setSelectedTab(tab.key);
                        navigate(`/super-admin/tenants/${tenant.id}`);
                      }}
                      className={`
                        relative
                        flex
                        cursor-pointer
                        items-center
                        gap-2
                        px-5
                        py-3
                        text-sm
                        font-medium
                        transition
                        ${
                          isActive
                            ? "text-blue-600"
                            : "text-slate-500 hover:text-slate-800"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}

                      {isActive && (
                        <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* tab content */}

            {activeTab === "overview" && (
              <OverviewTab
                tenant={tenant}
                onEdit={handleEditTenant}
                onSuspend={() => setShowSuspendModal(true)}
                onDelete={() => setShowDeleteModal(true)}
              />
            )}

            {activeTab === "billing" && <BillingTab />}

            {activeTab === "users" && <UsersTab />}

            {/* footer */}

            <p className="mt-6 text-center text-xs text-slate-400">
              Admin details • Last updated just now
            </p>
          </div>
        </main>
      </div>

      {/* suspend modal */}

      {showSuspendModal && (
        <ConfirmationModal
          type="suspend"
          title="Suspend Admin?"
          description="This will temporarily prevent users of this admin from accessing the platform."
          confirmLabel="Suspend Admin"
          onCancel={() => setShowSuspendModal(false)}
          onConfirm={handleSuspendTenant}
        />
      )}

      {/* delete modal */}

      {showDeleteModal && (
        <ConfirmationModal
          type="delete"
          title="Delete Admin?"
          description="This permanently deletes the admin and its associated data. This action cannot be undone."
          confirmLabel="Delete Admin"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteTenant}
        />
      )}
    </div>
  );
}

/* overview */

function OverviewTab({ tenant, onEdit, onSuspend, onDelete }) {
  const logoInputRef = useRef(null);

  const [logoPreview, setLogoPreview] = useState(() =>
    localStorage.getItem(`tenant-logo-${tenant.id}`),
  );

  // for uploading company image
  const handleLogoSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)$/i.test(file.name);

    if (!isImage) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;
      setLogoPreview(imageData);
      localStorage.setItem(`tenant-logo-${tenant.id}`, imageData);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="mt-5 space-y-5">
      {/* top cards */}

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        {/* company profile */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Company Profile
            </h2>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              aria-label="Edit admin information"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[190px_1fr]">
            {/* logo */}

            <div className="relative mx-auto h-56 w-full max-w-[190px] overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-indigo-700">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute left-8 top-5 h-32 w-12 rounded-t-full bg-white" />
                <div className="absolute left-16 top-12 h-24 w-8 rounded-t-full bg-white" />
                <div className="absolute right-9 top-8 h-28 w-10 rounded-t-full bg-white" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt={`${tenant.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-3xl font-bold text-white backdrop-blur-sm">
                    {tenant.logoLetter}
                  </div>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*,.svg,.bmp,.ico,.avif"
                className="hidden"
                onChange={handleLogoSelect}
              />

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Change Logo
              </button>
            </div>

            {/* details */}

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
              <InfoRow
                icon={<Building2 />}
                label="Company Name"
                value={tenant.name}
              />

              <InfoRow
                icon={<Globe2 />}
                label="Domain"
                value={
                  <span className="flex flex-wrap items-center gap-2">
                    {tenant.domain}
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Verified
                    </span>
                  </span>
                }
              />

              <InfoRow
                icon={<Building2 />}
                label="Industry"
                value={tenant.industry}
              />

              <InfoRow
                icon={<Globe2 />}
                label="Country / Region"
                value={tenant.country}
              />

              <InfoRow
                icon={<Clock3 />}
                label="Time Zone"
                value={tenant.timezone}
              />

              <InfoRow
                icon={<CalendarDays />}
                label="Member Since"
                value={tenant.memberSince}
              />
            </div>
          </div>
        </div>

        {/* plan limits */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Plan & Limits
            </h2>

            <button
              type="button"
              className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Subscription
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <ShieldAlert className="h-5 w-5 text-violet-600" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {tenant.plan}
                  </p>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    Active
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{tenant.planPrice}</span>
                  <span>•</span>
                  <span>Renews on Jun 12, 2026</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {LIMITS.map((item) => (
                <LimitRow key={item.label} {...item} />
              ))}
            </div>

            <button
              type="button"
              className="mt-4 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              View all limits & details
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* quick stats */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {QUICK_STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{stat.label}</p>

                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                    {stat.value}
                  </p>

                  <p
                    className={`mt-1 text-[11px] ${
                      stat.positive ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {stat.meta}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* danger zone */}

      <section className="overflow-hidden rounded-2xl border border-red-100 bg-red-50/40">
        <div className="p-5 sm:p-6">
          <div className="border-b border-red-100 pb-4">
            <h2 className="text-base font-semibold text-red-600">
              Danger Zone
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              These actions are irreversible. Please proceed with caution.
            </p>
          </div>

          <DangerRow
            icon={<ShieldAlert />}
            title="Suspend Admin"
            description="Temporarily suspend this admin. Users will not be able to access the platform."
            buttonLabel="Suspend Admin"
            onClick={onSuspend}
          />

          <DangerRow
            icon={<Trash2 />}
            title="Delete Admin"
            description="Permanently delete this admin and all associated data. This action cannot be undone."
            buttonLabel="Delete Admin"
            onClick={onDelete}
            destructive
          />
        </div>
      </section>
    </div>
  );
}

/* billing */

function BillingTab() {
  return (
    <div className="mt-5 space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SimpleMetric
          label="Monthly Recurring Revenue"
          value="$12,450"
          icon={CircleDollarSign}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SimpleMetric
          label="Current Plan"
          value="Enterprise"
          icon={CreditCard}
          iconClass="bg-violet-50 text-violet-600"
        />

        <SimpleMetric
          label="Next Renewal"
          value="Jun 12, 2026"
          icon={CalendarDays}
          iconClass="bg-blue-50 text-blue-600"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            Billing History
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recent invoices for this admin.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 sm:px-6">Invoice</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {[
                ["INV-10248", "$5,000", "Paid", "May 12, 2026"],
                ["INV-10198", "$5,000", "Paid", "Apr 12, 2026"],
                ["INV-10143", "$5,000", "Paid", "Mar 12, 2026"],
              ].map(([invoice, amount, status, date]) => (
                <tr key={invoice} className="border-t border-slate-100">
                  <td className="px-5 py-4 text-sm font-medium text-slate-800 sm:px-6">
                    {invoice}
                  </td>

                  <td className="px-3 py-4 text-sm text-slate-600">{amount}</td>

                  <td className="px-3 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                      {status}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-sm text-slate-500">{date}</td>

                  <td className="px-3 py-4">
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* users */

function UsersTab() {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Admin Users
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Users associated with this admin.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-lg bg-blue-500 px-3 text-xs font-semibold text-white hover:bg-blue-600"
        >
          <UserRound className="h-3.5 w-3.5" />
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 sm:px-6">User</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {USER_ROWS.map((user) => (
              <tr key={user.email} className="border-t border-slate-100">
                <td className="px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-4 text-sm text-slate-600">
                  {user.role}
                </td>

                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      user.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-3 py-4">
                  <button
                    type="button"
                    className="cursor-pointer text-slate-400 hover:text-slate-700"
                    title="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* reusable pieces */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-slate-400">{cloneIcon(icon)}</div>

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function LimitRow({ label, usedLabel, percent, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{usedLabel}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function DangerRow({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  destructive = false,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-red-100 py-5 last:border-b-0 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            destructive ? "bg-red-100 text-red-600" : "bg-red-100 text-red-600"
          }`}
        >
          {cloneIcon(icon)}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function SimpleMetric({ label, value, icon, iconClass }) {
  const Icon = icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function UsageBadge({ value }) {
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
      {value}
    </span>
  );
}

function cloneIcon(iconElement) {
  return cloneElement(iconElement, {
    className: `${iconElement.props.className || ""} h-4 w-4`,
  });
}

function ConfirmationModal({
  type,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  const isDelete = type === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isDelete
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {isDelete ? (
                <Trash2 className="h-5 w-5" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 cursor-pointer rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 cursor-pointer rounded-lg px-4 text-sm font-semibold text-white ${
              isDelete
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
