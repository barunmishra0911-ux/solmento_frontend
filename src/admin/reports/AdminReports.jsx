import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Loader2,
  MessageSquare,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  User,
  Users,
  AlertCircle,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  X,
} from "lucide-react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  getReportsRequest,
  createReportActivityRequest,
} from "@/lib/authApi";
import {
  formatDisplayDate,
  formatISODate,
} from "@/admin/datePeriodUtils";
import TwoMonthDateRangePicker from "@/admin/TwoMonthDateRangePicker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

const PRESET_PERIODS = [
  "Today",
  "Last 7 days",
  "Last 30 days",
  "This month",
  "This quarter",
];

const REPORT_TYPE_OPTIONS = [
  { id: "all", label: "All Reports" },
  { id: "leads", label: "Leads" },
  { id: "conversations", label: "Conversations" },
  { id: "calls", label: "Calls" },
  { id: "team", label: "Team Performance" },
];

function MiniSparkline({ data = [], color = "#3b82f6" }) {
  const chartData = useMemo(() => {
    const points = Array.isArray(data) && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
    return {
      labels: points.map((_, i) => i),
      datasets: [
        {
          data: points,
          borderColor: color,
          borderWidth: 2,
          tension: 0.45,
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [data, color]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
    }),
    [],
  );

  return (
    <div className="h-10 w-28 shrink-0">
      <Line data={chartData} options={options} />
    </div>
  );
}

function DateRangeDropdown({ value, onChange, align = "right" }) {
  return <TwoMonthDateRangePicker value={value} onChange={onChange} align={align} />;
}

export default function AdminReports({ onNavigate, routerNavigate, userRole = "ADMIN", user = null }) {
  // 1. Filter States
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const end = formatISODate(lastDay);
    return { start, end, period: "This month" };
  });

  const [reportType, setReportType] = useState("all");
  const [counsellorId, setCounsellorId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [grouping, setGrouping] = useState("daily");
  const [showAllActivity, setShowAllActivity] = useState(false);

  // 2. Data State
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [viewDetailModal, setViewDetailModal] = useState(null);

  // 3. Fetch Real Data
  const loadReports = (overrides = {}) => {
    setLoading(true);
    setError(null);

    const activeRange = overrides.dateRange || dateRange;
    const activeType = overrides.reportType !== undefined ? overrides.reportType : reportType;
    const activeCounsellor = overrides.counsellorId !== undefined ? overrides.counsellorId : counsellorId;
    const activeGrouping = overrides.grouping || grouping;
    const activeSearch = overrides.searchQuery !== undefined ? overrides.searchQuery : searchQuery;

    const params = {
      startDate: activeRange.start,
      endDate: activeRange.end,
      period: activeRange.period,
      grouping: activeGrouping,
    };
    if (activeType && activeType !== "all") params.reportType = activeType;
    if (activeCounsellor && activeCounsellor !== "all") params.counsellorId = activeCounsellor;
    if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();

    getReportsRequest(params)
      .then((res) => {
        setReportsData(res || null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load reports. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports();
  }, [dateRange, reportType, counsellorId, grouping]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => {
      loadReports({ searchQuery });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]); // eslint-disable-line

  // 4. Export Real Filtered CSV
  const handleExport = async () => {
    if (!reportsData) return;
    setExporting(true);

    try {
      const overview = reportsData.overview || {};
      const trend = reportsData.leadsTrend || {};
      const rangeLabel = reportsData.dateRange?.label || `${dateRange.start} to ${dateRange.end}`;
      const exportName = `SolmentoAI_Report_${dateRange.start}_to_${dateRange.end}.csv`;

      // Build real CSV content
      const lines = [];
      lines.push(["Solmento AI - Performance Report Summary"]);
      lines.push(["Date Range", rangeLabel]);
      lines.push(["Filtered Counsellor", counsellorId === "all" ? "All Counsellors" : (reportsData.counsellors?.find(c => String(c.id) === String(counsellorId))?.name || counsellorId)]);
      lines.push(["Exported At", new Date().toLocaleString()]);
      lines.push([]);

      // Section 1: Overview KPIs
      lines.push(["REPORT OVERVIEW", "TOTAL", "CHANGE", "COMPARISON", "DESCRIPTION"]);
      lines.push([
        overview.leadsReport?.title || "Leads Report",
        overview.leadsReport?.total || 0,
        overview.leadsReport?.change || "0%",
        overview.leadsReport?.comparison || "vs previous period",
        `"${overview.leadsReport?.description || ""}"`,
      ]);
      lines.push([
        overview.conversationsReport?.title || "Conversations Report",
        overview.conversationsReport?.total || 0,
        overview.conversationsReport?.change || "0%",
        overview.conversationsReport?.comparison || "vs previous period",
        `"${overview.conversationsReport?.description || ""}"`,
      ]);
      lines.push([
        overview.callsReport?.title || "Calls Report",
        overview.callsReport?.total || 0,
        overview.callsReport?.change || "0%",
        overview.callsReport?.comparison || "vs previous period",
        `"${overview.callsReport?.description || ""}"`,
      ]);
      lines.push([
        overview.teamPerformanceReport?.title || "Team Performance Report",
        overview.teamPerformanceReport?.total || 0,
        overview.teamPerformanceReport?.change || "0%",
        overview.teamPerformanceReport?.comparison || "vs previous period",
        `"${overview.teamPerformanceReport?.description || ""}"`,
      ]);
      lines.push([]);

      // Section 2: Leads Trend Points
      lines.push(["LEADS TREND TIMELINE", "DATE", "COUNT"]);
      if (Array.isArray(trend.points)) {
        trend.points.forEach((pt) => {
          lines.push([pt.label || "", pt.date || "", pt.count || 0]);
        });
      }
      lines.push([]);

      // Section 3: Report Activity History
      lines.push(["REPORT ACTIVITY HISTORY", "DATE RANGE", "GENERATED BY", "STATUS"]);
      if (Array.isArray(reportsData.reportActivity)) {
        reportsData.reportActivity.forEach((act) => {
          lines.push([act.name || "", act.dateRange || "", act.generatedBy || "", act.status || "Completed"]);
        });
      }

      const csvString = lines.map((row) => row.join(",")).join("\r\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", exportName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record this real export activity in database
      await createReportActivityRequest({
        reportName: reportType !== "all" ? `${reportType.toUpperCase()} Report Export` : "Full Performance Report Export",
        dateRange: rangeLabel,
        reportType: reportType || "all",
      });

      // Reload to show fresh activity row
      loadReports();
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  // 5. Navigation for View Report
  const handleViewReport = (reportKey) => {
    if (reportKey === "leads") {
      if (routerNavigate) routerNavigate("/app/leads/students");
      else if (onNavigate) onNavigate("studentLeads");
    } else if (reportKey === "conversations") {
      if (routerNavigate) routerNavigate("/app/inbox");
      else if (onNavigate) onNavigate("inbox");
    } else if (reportKey === "calls") {
      if (routerNavigate) routerNavigate("/app/calls");
      else if (onNavigate) onNavigate("calls");
    } else if (reportKey === "team") {
      if (routerNavigate) routerNavigate("/app/counsellors/performance");
      else if (onNavigate) onNavigate("counsellorPerformance");
    } else {
      setReportType(reportKey || "all");
    }
  };

  const overview = reportsData?.overview || {};
  const counsellors = reportsData?.counsellors || [];
  const leadsTrend = reportsData?.leadsTrend || { labels: [], data: [], points: [] };
  const reportActivity = reportsData?.reportActivity || [];
  const displayedActivity = showAllActivity ? reportActivity : reportActivity.slice(0, 3);

  // 6. Trend Chart configuration
  const trendChartData = useMemo(() => {
    return {
      labels: leadsTrend.labels || [],
      datasets: [
        {
          data: leadsTrend.data || [],
          borderColor: "#2563eb",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 220);
            gradient.addColorStop(0, "rgba(37, 99, 235, 0.22)");
            gradient.addColorStop(1, "rgba(37, 99, 235, 0.01)");
            return gradient;
          },
          borderWidth: 2.2,
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: leadsTrend.data?.length > 20 ? 3 : 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [leadsTrend]);

  const trendChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          titleFont: { size: 11, weight: "bold" },
          bodyFont: { size: 12 },
          padding: { top: 8, bottom: 8, left: 12, right: 12 },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              const pt = leadsTrend.points?.[idx];
              return pt?.formattedDate || pt?.date || items[0]?.label || "";
            },
            label: (item) => {
              const val = item.raw || 0;
              return `• ${val} ${val === 1 ? "lead" : "leads"}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            color: "#94a3b8",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 9,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
          ticks: {
            font: { size: 10 },
            color: "#94a3b8",
            stepSize: 50,
            precision: 0,
          },
        },
      },
    };
  }, [leadsTrend]);

  return (
    <div className="flex flex-col gap-5">
      {/* =========================================================================
          SECTION 1: TOP HEADER
          Title, Subtitle, Date Range Picker & Export Button
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Measure admissions performance across leads, conversations, calls, team activity and AI usage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DateRangeDropdown value={dateRange} onChange={setDateRange} />

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-100/80 transition disabled:opacity-50"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: REPORT FILTER BAR
          Date Range, Report Type, Counsellor, Search
          ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-3.5 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* A. Date Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Date Range
            </label>
            <DateRangeDropdown value={dateRange} onChange={setDateRange} align="left" />
          </div>

          {/* B. Report Type */}
          <div className="min-w-0">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Report Type
            </label>
            <div className="relative min-w-0">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-xs truncate"
              >
                {REPORT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* C. Counsellor */}
          <div className="min-w-0">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Counsellor
            </label>
            <div className="relative min-w-0">
              <select
                value={counsellorId}
                onChange={(e) => setCounsellorId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-xs truncate"
              >
                <option value="all">All Counsellors</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <User size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* D. Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadReports()}
            className="flex items-center gap-1 font-semibold text-rose-800 hover:underline"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: REPORTS OVERVIEW
          Grid of 4 Report Cards + Leads Trend
          ========================================================================= */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Reports Overview</h2>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info size={14} className="text-blue-500 shrink-0" />
            <span>Reports update according to the selected date range.</span>
          </p>
        </div>

        {/* Row 1: 3 Cards (Leads, Conversations, Calls) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card A: Leads Report */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-4 shadow-xs transition hover:shadow-md">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
                  <Users size={18} />
                </span>
                <span className="text-sm font-bold text-slate-800">Leads Report</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "..." : (overview.leadsReport?.total || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Leads</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span>{overview.leadsReport?.change?.startsWith("-") ? "↓" : "↑"}</span>
                    <span>{overview.leadsReport?.change || "0%"}</span>
                    <span className="font-normal text-slate-400">{overview.leadsReport?.comparison || "vs previous period"}</span>
                  </p>
                </div>
                <MiniSparkline data={overview.leadsReport?.sparkline} color="#2563eb" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {overview.leadsReport?.description || "Lead volume, sources, status and conversion."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleViewReport("leads")}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-50/80 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <span>View Report</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Card B: Conversations Report */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-purple-600 bg-white p-4 shadow-xs transition hover:shadow-md">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600 shadow-xs">
                  <MessageSquare size={18} />
                </span>
                <span className="text-sm font-bold text-slate-800">Conversations Report</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "..." : (overview.conversationsReport?.total || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Conversations</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span>{overview.conversationsReport?.change?.startsWith("-") ? "↓" : "↑"}</span>
                    <span>{overview.conversationsReport?.change || "0%"}</span>
                    <span className="font-normal text-slate-400">{overview.conversationsReport?.comparison || "vs previous period"}</span>
                  </p>
                </div>
                <MiniSparkline data={overview.conversationsReport?.sparkline} color="#9333ea" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {overview.conversationsReport?.description || "Conversation volume and channel activity."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleViewReport("conversations")}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-50/80 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
            >
              <span>View Report</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Card C: Calls Report */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-emerald-600 bg-white p-4 shadow-xs transition hover:shadow-md">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shadow-xs">
                  <Phone size={18} />
                </span>
                <span className="text-sm font-bold text-slate-800">Calls Report</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "..." : (overview.callsReport?.total || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Calls</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span>{overview.callsReport?.change?.startsWith("-") ? "↓" : "↑"}</span>
                    <span>{overview.callsReport?.change || "0%"}</span>
                    <span className="font-normal text-slate-400">{overview.callsReport?.comparison || "vs previous period"}</span>
                  </p>
                </div>
                <MiniSparkline data={overview.callsReport?.sparkline} color="#059669" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {overview.callsReport?.description || "Call activity, outcomes and duration."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleViewReport("calls")}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50/80 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <span>View Report</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Row 2: Team Performance Report (left) + Leads Trend (right, 2 cols) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Card D: Team Performance Report */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-4 shadow-xs transition hover:shadow-md">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600 shadow-xs">
                  <Users size={18} />
                </span>
                <span className="text-sm font-bold text-slate-800">Team Performance Report</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "..." : (overview.teamPerformanceReport?.total || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Counsellors</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <span>{overview.teamPerformanceReport?.change?.startsWith("-") ? "↓" : "↑"}</span>
                    <span>{overview.teamPerformanceReport?.change || "0%"}</span>
                    <span className="font-normal text-slate-400">{overview.teamPerformanceReport?.comparison || "vs previous period"}</span>
                  </p>
                </div>
                <MiniSparkline data={overview.teamPerformanceReport?.sparkline} color="#d97706" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {overview.teamPerformanceReport?.description || "Counsellor workload, activity and conversion."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleViewReport("team")}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-50/80 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <span>View Report</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Leads Trend Chart Card (spans 2 columns on lg) */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-4 shadow-xs lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
                  <BarChart3 size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Leads Trend</h3>
                  <p className="text-[11px] text-slate-400">Daily leads captured during the selected period.</p>
                </div>
              </div>

              {/* Grouping dropdown: Daily / Weekly / Monthly */}
              <div className="relative">
                <select
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-6 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-100 transition"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* Chart Body */}
            <div className="mt-3 h-48 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Loading trend data...</span>
                </div>
              ) : trendChartData.labels.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-xs text-slate-400">
                  <p>No leads captured in this period.</p>
                </div>
              ) : (
                <Line data={trendChartData} options={trendChartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: REPORT ACTIVITY TABLE
          Report Name, Date Range, Generated By, Status, Action
          ========================================================================= */}
      <div className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-600 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Report Activity</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {reportActivity.length}
            </span>
          </div>

          {reportActivity.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllActivity((prev) => !prev)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              <span>{showAllActivity ? "View Less" : "View All"}</span>
              {showAllActivity ? <ChevronUp size={13} /> : <ArrowRight size={13} />}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5 pl-2 font-semibold">Report Name</th>
                <th className="pb-2.5 font-semibold">Date Range</th>
                <th className="pb-2.5 font-semibold">Generated By</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 pr-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportActivity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    No report activity records found matching filters.
                  </td>
                </tr>
              ) : (
                displayedActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 pl-2 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={15} className="text-slate-400 shrink-0" />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{row.dateRange}</td>
                    <td className="py-3 text-slate-700 font-medium">{row.generatedBy}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                        <Check size={10} className="stroke-[3]" />
                        {row.status || "Completed"}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewDetailModal(row)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-600 shadow-2xs hover:bg-blue-50 transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewDetailModal(row)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          REPORT DETAIL MODAL (When clicking "View" on Report Activity)
          ========================================================================= */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{viewDetailModal.name}</h3>
              </div>
              <button
                onClick={() => setViewDetailModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Date Range</span>
                <span className="font-semibold text-slate-800">{viewDetailModal.dateRange}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Generated By</span>
                <span className="font-semibold text-slate-800">{viewDetailModal.generatedBy}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-emerald-600">{viewDetailModal.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">Report Scope</span>
                <span className="font-semibold text-slate-800">
                  {counsellorId === "all" ? "All Counsellors" : counsellors.find(c => String(c.id) === String(counsellorId))?.name || "Filtered"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewDetailModal(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewDetailModal(null);
                  handleExport();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
