import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Edit3,
  FileText,
  Pencil,
  Users,
} from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

const BASE_TENANT = {
  id: "TEN-000248",
  name: "BrightMind University",
  domain: "brightmind.edu",
  status: "Active",
  logoLetter: "B",
  accent: "from-blue-600 to-indigo-600",
};

/* API-friendly demo activity data */
const ACTIVITY_ITEMS = [
  {
    id: 1,
    action: "Subscription upgraded to Enterprise",
    actor: "Sarah Johnson",
    actionType: "Subscription",
    time: "2h ago",
    icon: CreditCard,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: 2,
    action: "12 new users were added",
    actor: "Michael Brown",
    actionType: "Users",
    time: "5h ago",
    icon: Users,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: 3,
    action: "API usage crossed 65% of limit",
    actor: "System",
    actionType: "Usage",
    time: "1d ago",
    icon: BarChart3,
    iconClass: "bg-orange-50 text-orange-600",
  },
  {
    id: 4,
    action: "Admin profile was updated",
    actor: "Sarah Johnson",
    actionType: "Profile",
    time: "1d ago",
    icon: Pencil,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
];

const TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "usage", label: "Usage", icon: BarChart3 },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "users", label: "Users", icon: Users },
];

const ACTOR_OPTIONS = [
  "All Actors",
  "Sarah Johnson",
  "Michael Brown",
  "System",
];

const ACTION_OPTIONS = [
  "All Actions",
  "Subscription",
  "Users",
  "Usage",
  "Profile",
];

export default function TenantActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams();

  const [actorFilter, setActorFilter] = useState("All Actors");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const tenant = useMemo(
    () => ({
      ...BASE_TENANT,
      id: tenantId || BASE_TENANT.id,
    }),
    [tenantId],
  );

  const filteredActivities = useMemo(() => {
    return ACTIVITY_ITEMS.filter((item) => {
      const actorMatches =
        actorFilter === "All Actors" || item.actor === actorFilter;

      const actionMatches =
        actionFilter === "All Actions" || item.actionType === actionFilter;

      return actorMatches && actionMatches;
    });
  }, [actorFilter, actionFilter]);

  const handleTabClick = (tabKey) => {
    if (tabKey === "usage") {
      navigate(`/super-admin/tenants/${tenant.id}/usage`);
      return;
    }

    if (tabKey === "activity") {
      navigate(`/super-admin/tenants/${tenant.id}/activity`);
      return;
    }

    navigate(`/super-admin/tenants/${tenant.id}`);
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

              <button
                type="button"
                onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
                className="max-w-[260px] cursor-pointer truncate text-slate-600 transition hover:text-blue-600"
              >
                {tenant.name}
              </button>

              <span className="text-slate-300">›</span>
              <span className="text-slate-600">Activity</span>
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
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/super-admin/tenants/${tenant.id}/edit`)
                  }
                  className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Admin
                </button>
              </div>
            </section>

            {/* tabs */}
            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-max border-b border-slate-200">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive =
                    tab.key === "activity" &&
                    location.pathname.endsWith("/activity");

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabClick(tab.key)}
                      className={`relative flex cursor-pointer items-center gap-2 px-5 py-3 text-sm font-medium transition ${
                        isActive
                          ? "text-blue-600"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
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

            {/* activity feed */}
            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Admin Activity
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Chronological activity for this admin.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <FilterSelect
                    value={actorFilter}
                    onChange={setActorFilter}
                    options={ACTOR_OPTIONS}
                  />

                  <FilterSelect
                    value={actionFilter}
                    onChange={setActionFilter}
                    options={ACTION_OPTIONS}
                  />
                </div>
              </div>

              {filteredActivities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredActivities.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 px-5 py-4 sm:px-6"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.action}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            by {item.actor}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {item.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:px-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                    <Activity className="h-5 w-5 text-slate-400" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    No activity found
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    No activity matches the selected actor and action filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setActorFilter("All Actors");
                      setActionFilter("All Actions");
                    }}
                    className="mt-4 cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </section>

            <p className="mt-6 text-center text-xs text-slate-400">
              Admin activity • Last updated just now
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[140px] cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
