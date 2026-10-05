import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Database,
  Edit3,
  FileText,
  MessageSquare,
  ShieldAlert,
  Users,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

import { Line } from "react-chartjs-2";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const BASE_TENANT = {
  id: "TEN-000248",
  name: "BrightMind University",
  domain: "brightmind.edu",
  status: "Active",
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

const USAGE_LIMITS = [
  {
    key: "messages",
    label: "Messages",
    used: 12480,
    limit: 50000,
    display: "12,480 / 50,000",
  },
  {
    key: "tokens",
    label: "AI Tokens",
    used: 245820,
    limit: 500000,
    display: "245,820 / 500,000",
  },
  {
    key: "minutes",
    label: "Voice Minutes",
    used: 680,
    limit: 2000,
    display: "680 / 2,000",
  },
  {
    key: "contacts",
    label: "Contacts",
    used: 8420,
    limit: 20000,
    display: "8,420 / 20,000",
  },
  {
    key: "storage",
    label: "Storage",
    used: 256,
    limit: 500,
    display: "256 GB / 500 GB",
  },
];

const HISTORICAL_USAGE = {
  labels: ["Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26"],
  values: [118000, 142000, 156000, 188000, 214000, 245820],
};

function percent(used, limit) {
  return limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
}

export default function TenantUsage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const tenant = useMemo(
    () => ({ ...BASE_TENANT, id: tenantId || BASE_TENANT.id }),
    [tenantId],
  );

  const lineData = {
    labels: HISTORICAL_USAGE.labels,
    datasets: [
      {
        label: "AI Tokens",
        data: HISTORICAL_USAGE.values,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.12)",
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.raw.toLocaleString()} tokens`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 300000,
        border: { display: false },
        grid: { color: "#e2e8f0", drawTicks: false },
        ticks: {
          stepSize: 50000,
          color: "#94a3b8",
          font: { size: 10 },
          callback: (value) => (value === 0 ? "0" : `${value / 1000}K`),
        },
      },
    },
  };

  const highest = Math.max(
    ...USAGE_LIMITS.map((item) => percent(item.used, item.limit)),
  );

  const goToTab = (key) => {
    if (key === "usage") {
      navigate(`/super-admin/tenants/${tenant.id}/usage`);
      return;
    }

    if (key === "activity") {
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
            <div className="mb-4 flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => navigate("/super-admin/tenants")}
                className="cursor-pointer text-blue-500 hover:text-blue-600"
              >
                Admins
              </button>
              <span className="text-slate-300">›</span>
              <button
                type="button"
                onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
                className="cursor-pointer truncate text-slate-600 hover:text-blue-600"
              >
                {tenant.name}
              </button>
              <span className="text-slate-300">›</span>
              <span className="text-slate-600">Usage</span>
            </div>

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
                  className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Admin
                </button>
              </div>
            </section>

            <div className="mt-4 overflow-x-auto">
              <div className="flex min-w-max border-b border-slate-200">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname.endsWith("/usage")
                    ? tab.key === "usage"
                    : tab.key === "overview";

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => goToTab(tab.key)}
                      className={`relative flex cursor-pointer items-center gap-2 px-5 py-3 text-sm font-medium ${
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

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Admin Usage
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor current usage against limits and historical usage.
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  highest >= 90
                    ? "bg-red-50 text-red-600"
                    : highest >= 75
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {highest >= 90
                  ? "Critical Usage"
                  : highest >= 75
                    ? "Approaching Limit"
                    : "Healthy"}
              </span>
            </div>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.12fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Usage vs Limits
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Current admin resource usage.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    Current
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  {USAGE_LIMITS.map((item) => {
                    const value = percent(item.used, item.limit);
                    return (
                      <div key={item.key}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-700">
                            {item.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {item.display}
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              value >= 90
                                ? "bg-red-500"
                                : value >= 75
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>

                        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                          <span>{value}% used</span>
                          <span>{100 - value}% available</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Historical Usage
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      AI token consumption over the last six months.
                    </p>
                  </div>

                  <div className="relative shrink-0">
                    <select
                      defaultValue="monthly"
                      className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none hover:bg-slate-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="mt-5 h-64 sm:h-72">
                  <Line data={lineData} options={lineOptions} />
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              <WarningBanner
                tone="warning"
                title="Usage is approaching a limit"
                description="AI token usage is currently at 49% of the current allocation."
              />
              <WarningBanner
                tone="neutral"
                title="No overage detected"
                description="Current usage is within the configured admin limits."
              />
            </section>

            <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard
                label="AI Tokens"
                value="245,820"
                meta="49% of 500,000"
                icon={BarChart3}
                iconClass="bg-blue-50 text-blue-600"
              />
              <SummaryCard
                label="Messages"
                value="12,480"
                meta="25% of 50,000"
                icon={MessageSquare}
                iconClass="bg-emerald-50 text-emerald-600"
              />
              <SummaryCard
                label="Storage"
                value="256 GB"
                meta="51.2% of 500 GB"
                icon={Database}
                iconClass="bg-violet-50 text-violet-600"
              />
            </section>

            <p className="mt-6 text-center text-xs text-slate-400">
              Admin usage • Last updated just now
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function WarningBanner({ tone, title, description }) {
  const warning = tone === "warning";
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        warning ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            warning ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <p
            className={`text-sm font-semibold ${warning ? "text-amber-800" : "text-slate-800"}`}
          >
            {title}
          </p>
          <p
            className={`mt-1 text-xs leading-5 ${warning ? "text-amber-700" : "text-slate-500"}`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, meta, icon, iconClass }) {
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{meta}</p>
        </div>
      </div>
    </div>
  );
}
