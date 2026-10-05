import { useEffect, useRef, useState } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ChevronDown,
  MessageSquare,
  Ticket,
  Users,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line, Bar, Doughnut } from "react-chartjs-2";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { getSuperAdminDashboardRequest } from "@/lib/authApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Filler,
);

export default function SuperAdminDashboard() {
  /* chart period */

  const [revenuePeriod, setRevenuePeriod] = useState("monthly");
  const [tenantPeriod, setTenantPeriod] = useState("monthly");
  const [usagePeriod, setUsagePeriod] = useState("today");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: "2026-09-02",
    end: "2026-09-09",
  });
  const [draftDateRange, setDraftDateRange] = useState(dateRange);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    getSuperAdminDashboardRequest().then(({ metrics: savedMetrics }) => setMetrics(savedMetrics)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!isDatePickerOpen) return undefined;

    const closeDatePicker = (event) => {
      if (!datePickerRef.current?.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    const closeDatePickerOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeDatePicker);
    document.addEventListener("keydown", closeDatePickerOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeDatePicker);
      document.removeEventListener("keydown", closeDatePickerOnEscape);
    };
  }, [isDatePickerOpen]);

  const toggleDatePicker = () => {
    if (!isDatePickerOpen) {
      setDraftDateRange(dateRange);
    }

    setIsDatePickerOpen((current) => !current);
  };

  const applyDateRange = () => {
    if (
      !draftDateRange.start ||
      !draftDateRange.end ||
      draftDateRange.start > draftDateRange.end
    ) {
      return;
    }

    setDateRange(draftDateRange);
    setIsDatePickerOpen(false);
  };

  /* KPI data */

  const kpis = [
    {
      title: "Total Tenants",
      value: "248",
      change: "+12",
      subtitle: "vs Aug 26 – Sep 1, 2026",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      borderTopColor: "border-t-blue-500",
      chartColor: "#3b82f6",
      spark: [210, 218, 214, 225, 219, 238, 248],
    },
    {
      title: "Active Tenants",
      value: "192",
      change: "+8",
      subtitle: "vs Aug 26 – Sep 1, 2026",
      icon: CheckCircle2,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      borderTopColor: "border-t-emerald-500",
      chartColor: "#10b981",
      spark: [158, 165, 161, 170, 168, 184, 192],
    },
    {
      title: "MRR",
      value: "$145,230",
      change: "+14.6%",
      subtitle: "vs Aug 26 – Sep 1, 2026",
      icon: CircleDollarSign,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-500",
      borderTopColor: "border-t-violet-500",
      chartColor: "#8b5cf6",
      spark: [105000, 112000, 108000, 120000, 116000, 135000, 145230],
    },
    {
      title: "AI Tokens Used Today",
      value: "245,820",
      change: "49%",
      subtitle: "of 500,000",
      icon: BarChart3,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-500",
      borderTopColor: "border-t-cyan-500",
      chartColor: "#06b6d4",
      spark: [180000, 194000, 188000, 207000, 201000, 230000, 245820],
    },
    {
      title: "Active Conversations",
      value: "1,842",
      change: "+11%",
      subtitle: "vs Aug 26 – Sep 1, 2026",
      icon: MessageSquare,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      borderTopColor: "border-t-emerald-500",
      chartColor: "#10b981",
      spark: [1400, 1480, 1440, 1570, 1520, 1750, 1842],
    },
    {
      title: "Open Tickets",
      value: "32",
      change: "+5",
      subtitle: "vs Aug 26 – Sep 1, 2026",
      icon: Ticket,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      borderTopColor: "border-t-red-500",
      chartColor: "#ef4444",
      spark: [21, 25, 24, 28, 27, 31, 32],
      negative: true,
    },
  ];

  /* revenue data */

  const revenueData = {
    labels: ["Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26"],

    datasets: [
      {
        label: "Revenue",

        data:
          revenuePeriod === "weekly"
            ? [112000, 118000, 121000, 128000, 135000, 145230]
            : [82000, 90000, 86000, 108000, 126000, 145230],

        borderColor: "#3b82f6",

        backgroundColor: "rgba(59, 130, 246, 0.14)",

        borderWidth: 3,

        fill: true,

        tension: 0.4,

        pointRadius: 0,

        pointHoverRadius: 5,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,

    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0f172a",

        padding: 10,

        displayColors: false,

        callbacks: {
          label: (context) => {
            return `$${context.raw.toLocaleString()}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        border: {
          display: false,
        },

        ticks: {
          color: "#94a3b8",

          font: {
            size: 10,
          },
        },
      },

      y: {
        min: 0,

        max: 200000,

        border: {
          display: false,
        },

        grid: {
          color: "#e2e8f0",

          drawTicks: false,
        },

        ticks: {
          stepSize: 50000,

          color: "#94a3b8",

          font: {
            size: 10,
          },

          callback: (value) => {
            return `$${value / 1000}K`;
          },
        },
      },
    },
  };

  /* tenant growth data */

  const tenantGrowthData = {
    labels: ["Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26"],

    datasets: [
      {
        label: "Tenants",

        data:
          tenantPeriod === "weekly"
            ? [220, 228, 236, 244, 255, 268]
            : [190, 210, 228, 242, 255, 280],

        backgroundColor: [
          "#bfdbfe",
          "#bfdbfe",
          "#bfdbfe",
          "#bfdbfe",
          "#bfdbfe",
          "#3b82f6",
        ],

        borderRadius: 7,

        borderSkipped: false,

        barPercentage: 0.62,

        categoryPercentage: 0.7,
      },
    ],
  };

  const tenantGrowthOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0f172a",

        padding: 10,

        callbacks: {
          label: (context) => {
            return `${context.raw} tenants`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        border: {
          display: false,
        },

        ticks: {
          color: "#94a3b8",

          font: {
            size: 10,
          },
        },
      },

      y: {
        min: 0,

        max: 300,

        border: {
          display: false,
        },

        grid: {
          color: "#e2e8f0",

          drawTicks: false,
        },

        ticks: {
          stepSize: 50,

          color: "#94a3b8",

          font: {
            size: 10,
          },
        },
      },
    },
  };

  /* usage data */

  const usageData = {
    labels: ["Chat", "Document AI", "Summarization", "Translation", "Other"],

    datasets: [
      {
        data: [120430, 56780, 34560, 22340, 11710],

        backgroundColor: [
          "#3b82f6",
          "#34d399",
          "#a855f7",
          "#f59e0b",
          "#94a3b8",
        ],

        borderWidth: 0,

        hoverOffset: 5,
      },
    ],
  };

  const usageOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "67%",

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0f172a",

        padding: 10,

        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
  };

  /* tenants needing attention */

  const attentionTenants = [
    {
      name: "BrightMind University",
      domain: "brightmind.edu",
      issue: "Payment Failed",
      status: "Payment",
      users: "12",
      activity: "2h ago",
    },

    {
      name: "EduCore Institute",
      domain: "educore.in",
      issue: "High Token Usage",
      status: "Usage",
      users: "8",
      activity: "5h ago",
    },

    {
      name: "NextGen College",
      domain: "nextgencollege.edu",
      issue: "Subscription Expiring",
      status: "Subscription",
      users: "15",
      activity: "1d ago",
    },

    {
      name: "Global Learning Hub",
      domain: "globalhub.org",
      issue: "Multiple Open Tickets",
      status: "Support",
      users: "6",
      activity: "1d ago",
    },
  ];

  /* recent activity */

  const activities = [
    {
      title: 'New tenant "Future Skills Academy" was created',

      by: "Sarah Johnson",

      time: "10m ago",

      icon: Building2,

      iconClass: "bg-emerald-100 text-emerald-600",
    },

    {
      title: "Payment of $2,450 received from TechLearn Pro",

      by: "System",

      time: "1h ago",

      icon: CircleDollarSign,

      iconClass: "bg-violet-100 text-violet-600",
    },

    {
      title: "Subscription upgraded for DataScience Hub",

      by: "Michael Brown",

      time: "2h ago",

      icon: ArrowUpRight,

      iconClass: "bg-blue-100 text-blue-600",
    },

    {
      title: "AI usage limit reached for SmartEdu Platform",

      by: "System",

      time: "3h ago",

      icon: BarChart3,

      iconClass: "bg-orange-100 text-orange-600",
    },

    {
      title: "New support ticket #TKT-1289 created",

      by: "James Wilson",

      time: "4h ago",

      icon: Ticket,

      iconClass: "bg-red-100 text-red-600",
    },
  ];

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
        {/* sidebar */}

        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* dashboard */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            {/* page heading */}

            <div
              className="
                mb-5
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  Super Admin Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of platform performance and tenant activity
                </p>
              </div>

              {/* date */}

              <div ref={datePickerRef} className="relative w-fit">
                <button
                  type="button"
                  aria-expanded={isDatePickerOpen}
                  aria-haspopup="dialog"
                  onClick={toggleDatePicker}
                  className="
                    flex
                    w-fit
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-xs
                    font-medium
                    text-slate-600
                    shadow-sm
                    transition
                    hover:bg-slate-50
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                  "
                >
                  <CalendarDays className="h-4 w-4 text-slate-400" />

                  <span>{formatDateRange(dateRange)}</span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                      isDatePickerOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDatePickerOpen && (
                  <div
                    role="dialog"
                    aria-label="Select dashboard date range"
                    className="absolute left-0 top-[calc(100%+8px)] z-30 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0 sm:w-80"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-semibold text-slate-600">
                        Start date
                        <input
                          type="date"
                          value={draftDateRange.start}
                          max={draftDateRange.end}
                          onChange={(event) =>
                            setDraftDateRange((current) => ({
                              ...current,
                              start: event.target.value,
                            }))
                          }
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>

                      <label className="text-xs font-semibold text-slate-600">
                        End date
                        <input
                          type="date"
                          value={draftDateRange.end}
                          min={draftDateRange.start}
                          onChange={(event) =>
                            setDraftDateRange((current) => ({
                              ...current,
                              end: event.target.value,
                            }))
                          }
                          className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="h-9 cursor-pointer rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={applyDateRange}
                        disabled={
                          !draftDateRange.start ||
                          !draftDateRange.end ||
                          draftDateRange.start > draftDateRange.end
                        }
                        className="h-9 cursor-pointer rounded-lg bg-blue-500 px-3 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KPI cards */}

            <section
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                xl:grid-cols-3
                2xl:grid-cols-6
              "
            >
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                const liveValues = {
                  "Total Tenants": metrics?.totalTenants,
                  "Active Tenants": metrics?.activeTenants,
                  "AI Tokens Used Today": metrics?.aiTokensUsedToday,
                  "Open Tickets": metrics?.openTickets,
                };
                const liveValue = liveValues[kpi.title];

                return (
                  <div
                    key={kpi.title}
                    className={`
                      rounded-2xl
                      border
                      border-t-4
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                      transition
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-md
                      ${kpi.borderTopColor}
                    `}
                  >
                    {/* card header */}

                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${kpi.iconBg}
                        `}
                      >
                        <Icon className={`h-5 w-5 ${kpi.iconColor}`} />
                      </div>

                      <p className="text-xs font-medium text-slate-500">
                        {kpi.title}
                      </p>
                    </div>

                    {/* value */}

                    <p
                      className="
                        mt-4
                        text-2xl
                        font-bold
                        tracking-tight
                        text-slate-900
                      "
                    >
                      {liveValue == null ? kpi.value : liveValue.toLocaleString("en-IN")}
                    </p>

                    {/* change */}

                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <span
                          className={`
                            inline-flex
                            items-center
                            text-xs
                            font-semibold
                            ${
                              kpi.negative ? "text-red-500" : "text-emerald-500"
                            }
                          `}
                        >
                          {kpi.negative ? (
                            <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                          )}

                          {kpi.change}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] leading-4 text-slate-400">
                        {kpi.subtitle}
                      </p>
                    </div>

                    {/* mini chart */}

                    <div className="mt-4 h-9 w-full">
                      <Line
                        data={{
                          labels: kpi.spark.map((_, index) => index + 1),

                          datasets: [
                            {
                              data: kpi.spark,

                              borderColor: kpi.chartColor,

                              borderWidth: 2,

                              tension: 0.45,

                              pointRadius: 0,

                              pointHoverRadius: 0,

                              fill: false,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,

                          maintainAspectRatio: false,

                          animation: false,

                          plugins: {
                            legend: {
                              display: false,
                            },

                            tooltip: {
                              enabled: false,
                            },
                          },

                          interaction: {
                            intersect: false,
                          },

                          scales: {
                            x: {
                              display: false,
                            },

                            y: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </section>

            {/* charts */}

            <section
              className="
                mt-5
                grid
                grid-cols-1
                gap-4
                items-stretch
                xl:grid-cols-3
                xl:auto-rows-[328px]
              "
            >
              {/* revenue trend */}

              <div
                className="
                  w-full
                  rounded-2xl
                  border
                  border-t-4
                  border-slate-200
                  border-t-blue-500
                  bg-white
                  h-full
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Revenue Trend
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold text-slate-900">
                        $145,230
                      </span>

                      <span className="text-xs font-semibold text-emerald-500">
                        ↑ 14.6%
                      </span>

                      <span className="text-[10px] text-slate-400">
                        vs last month
                      </span>
                    </div>
                  </div>

                  <ChartPeriodSelect
                    value={revenuePeriod}
                    onChange={setRevenuePeriod}
                  />
                </div>

                <div className="mt-4 h-56 xl:h-[210px]">
                  <Line data={revenueData} options={revenueOptions} />
                </div>
              </div>

              {/* tenant growth */}

              <div
                className="
                  w-full
                  rounded-2xl
                  border
                  border-t-4
                  border-slate-200
                  border-t-emerald-500
                  bg-white
                  h-full
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Tenant Growth
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold text-slate-900">
                        248
                      </span>

                      <span className="text-xs font-semibold text-emerald-500">
                        ↑ 12
                      </span>

                      <span className="text-[10px] text-slate-400">
                        vs last month
                      </span>
                    </div>
                  </div>

                  <ChartPeriodSelect
                    value={tenantPeriod}
                    onChange={setTenantPeriod}
                  />
                </div>

                <div className="mt-4 h-56 xl:h-[210px]">
                  <Bar data={tenantGrowthData} options={tenantGrowthOptions} />
                </div>
              </div>

              {/* usage breakdown */}

              <div
                className="
                  w-full
                  h-full
                  min-h-[328px]
                  rounded-2xl
                  border
                  border-t-4
                  border-slate-200
                  border-t-violet-500
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Usage Breakdown (AI Tokens)
                  </p>

                  <UsagePeriodSelect
                    value={usagePeriod}
                    onChange={setUsagePeriod}
                  />
                </div>

                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    items-center
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-center
                    xl:gap-4
                    xl:h-[220px]
                  "
                >
                  {/* donut */}

                  <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
                    <Doughnut data={usageData} options={usageOptions} />

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        flex
                        flex-col
                        items-center
                        justify-center
                      "
                    >
                      <span className="text-lg font-bold text-slate-900 sm:text-xl">
                        245,820
                      </span>

                      <span className="text-[9px] text-slate-400">
                        Total Tokens
                      </span>
                    </div>
                  </div>

                  {/* legend */}

                  <div className="w-full space-y-2 sm:w-auto">
                    <UsageItem
                      label="Chat"
                      value="120,430"
                      percent="49%"
                      dotClass="bg-blue-500"
                    />

                    <UsageItem
                      label="Document AI"
                      value="56,780"
                      percent="23%"
                      dotClass="bg-emerald-500"
                    />

                    <UsageItem
                      label="Summarization"
                      value="34,560"
                      percent="14%"
                      dotClass="bg-violet-500"
                    />

                    <UsageItem
                      label="Translation"
                      value="22,340"
                      percent="9%"
                      dotClass="bg-orange-400"
                    />

                    <UsageItem
                      label="Other"
                      value="11,710"
                      percent="5%"
                      dotClass="bg-slate-400"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* bottom section */}

            <section className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[1.4fr_1fr]">
              {/* tenants needing attention */}

              <div className="min-w-0 overflow-hidden rounded-2xl border border-t-4 border-slate-200 border-t-red-500 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-800">
                      Tenants Needing Attention
                    </h2>

                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-500">
                      6
                    </span>
                  </div>

                  <button
                    type="button"
                    className="
                      cursor-pointer
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-blue-500
                      transition
                      hover:bg-blue-50
                    "
                  >
                    View All
                  </button>
                </div>

                <div className="max-w-full overflow-x-auto md:overflow-x-visible">
                  <table className="w-full min-w-[720px] md:min-w-0 md:table-fixed">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3">Tenant</th>

                        <th className="px-3 py-3">Issue</th>

                        <th className="px-3 py-3">Status</th>

                        <th className="px-3 py-3">Users Affected</th>

                        <th className="px-3 py-3">Last Activity</th>

                        <th className="px-3 py-3" />
                      </tr>
                    </thead>

                    <tbody>
                      {attentionTenants.map((tenant) => (
                        <tr
                          key={tenant.name}
                          className="border-t border-slate-100"
                        >
                          <td className="px-5 py-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {tenant.name}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                {tenant.domain}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-xs text-slate-600">
                            {tenant.issue}
                          </td>

                          <td className="px-3 py-3">
                            <StatusBadge status={tenant.status} />
                          </td>

                          <td className="px-3 py-3 text-xs text-slate-600">
                            {tenant.users}
                          </td>

                          <td className="px-3 py-3 text-xs text-slate-500">
                            {tenant.activity}
                          </td>

                          <td className="px-3 py-3 text-right text-slate-400">
                            ⋮
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-100 px-5 py-4 text-center">
                  <button
                    type="button"
                    className="
                      cursor-pointer
                      text-xs
                      font-semibold
                      text-blue-500
                      hover:underline
                    "
                  >
                    View All Tenants
                  </button>
                </div>
              </div>

              {/* recent activity */}

              <div className="min-w-0 overflow-hidden rounded-2xl border border-t-4 border-slate-200 border-t-emerald-500 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Recent Activity
                  </h2>

                  <button
                    type="button"
                    className="
                      cursor-pointer
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-blue-500
                      transition
                      hover:bg-blue-50
                    "
                  >
                    View All
                  </button>
                </div>

                <div className="max-w-full overflow-x-auto md:overflow-x-visible">
                  <div className="min-w-[520px] divide-y divide-slate-100 md:min-w-0">
                    {activities.map((activity) => {
                      const Icon = activity.icon;

                      return (
                        <div
                          key={activity.title}
                          className="
                            flex
                            items-start
                            gap-3
                            px-5
                            py-4
                          "
                        >
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              ${activity.iconClass}
                            `}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-5 text-slate-800">
                              {activity.title}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              by {activity.by}
                            </p>
                          </div>

                          <span className="shrink-0 text-[10px] text-slate-400">
                            {activity.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function formatDateRange({ start, end }) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startFormatter.format(startDate)} - ${endFormatter.format(endDate)}`;
}

/* chart period */

function ChartPeriodSelect({ value, onChange }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-9
          cursor-pointer
          appearance-none
          rounded-lg
          border
          border-slate-200
          bg-white
          py-1.5
          pl-3
          pr-8
          text-xs
          font-medium
          text-slate-600
          outline-none
          transition
          hover:bg-slate-50
          focus:border-blue-300
          focus:ring-2
          focus:ring-blue-100
        "
      >
        <option value="monthly">Monthly</option>

        <option value="weekly">Weekly</option>
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-2
          top-1/2
          h-3.5
          w-3.5
          -translate-y-1/2
          text-slate-400
        "
      />
    </div>
  );
}

/* usage period */

function UsagePeriodSelect({ value, onChange }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-9
          cursor-pointer
          appearance-none
          rounded-lg
          border
          border-slate-200
          bg-white
          py-1.5
          pl-3
          pr-8
          text-xs
          font-medium
          text-slate-600
          outline-none
          transition
          hover:bg-slate-50
          focus:border-blue-300
          focus:ring-2
          focus:ring-blue-100
        "
      >
        <option value="today">Today</option>

        <option value="weekly">Weekly</option>
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-2
          top-1/2
          h-3.5
          w-3.5
          -translate-y-1/2
          text-slate-400
        "
      />
    </div>
  );
}

/* usage item */

function UsageItem({ label, value, percent, dotClass }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />

      <span className="min-w-[78px] text-slate-600">{label}</span>

      <span className="font-medium text-slate-700">{value}</span>

      <span className="text-slate-400">({percent})</span>
    </div>
  );
}

/* status badge */

function StatusBadge({ status }) {
  const styles = {
    Payment: "bg-red-100 text-red-500",

    Usage: "bg-orange-100 text-orange-500",

    Subscription: "bg-amber-100 text-amber-500",

    Support: "bg-violet-100 text-violet-500",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2
        py-1
        text-[10px]
        font-medium
        ${styles[status] || "bg-slate-100 text-slate-500"}
      `}
    >
      {status}
    </span>
  );
}
