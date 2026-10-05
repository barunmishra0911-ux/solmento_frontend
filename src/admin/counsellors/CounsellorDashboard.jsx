import { useEffect, useMemo, useState, useRef } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  MessagesSquare,
  Phone,
  RefreshCw,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import { getCounsellorDashboardRequest } from "@/lib/authApi";
import {
  formatDisplayDate,
  formatISODate,
  getDynamicPeriodOptions,
  resolvePeriodDates,
} from "../datePeriodUtils";
import TwoMonthDateRangePicker from "./TwoMonthDateRangePicker";

function getGreeting(name = "Counsellor") {
  const hour = new Date().getHours();
  let timeGreeting = "Good morning";
  if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
  else if (hour >= 17) timeGreeting = "Good evening";
  return `${timeGreeting}, ${name}! 👋`;
}

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDisplayDate(date);
}

function MiniSparkline({ color, data }) {
  const safeData = Array.isArray(data) && data.length > 1 ? data : [0, 0, 0];
  return (
    <div className="mt-3 h-8 w-full">
      <Line
        data={{
          labels: safeData.map((_, i) => i),
          datasets: [
            {
              data: safeData,
              borderColor: color,
              borderWidth: 2,
              tension: 0.45,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
        }}
      />
    </div>
  );
}

function CounsellorKpiCard({ title, value, delta, subtext, icon: Icon, iconBg, iconColor, borderColor, lineColor, sparklineData }) {
  const isUp = delta?.sign === "up";
  return (
    <article
      className={`rounded-2xl border border-slate-200 border-t-4 ${borderColor} bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}>
            <Icon size={19} />
          </span>
          <p className="text-xs font-semibold text-slate-600 line-clamp-1">{title}</p>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
          {delta && delta.value > 0 ? (
            <span className={`font-semibold ${isUp ? "text-emerald-600" : "text-rose-600"}`}>
              {isUp ? "↑" : "↓"} {delta.value}%
            </span>
          ) : (
            <span className="font-semibold text-slate-400">0%</span>
          )}
          <span>{subtext || "vs yesterday"}</span>
        </p>
      </div>
      <MiniSparkline color={lineColor} data={sparklineData} />
    </article>
  );
}

export default function CounsellorDashboard({ onNavigate, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Period state
  const periodDefaults = useMemo(() => getDynamicPeriodOptions(new Date()), []);
  const [selectedPeriod, setSelectedPeriod] = useState(periodDefaults.selected);
  const [periodOpen, setPeriodOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dates = resolvePeriodDates(selectedPeriod);
      const res = await getCounsellorDashboardRequest({
        ...dates,
        period: selectedPeriod,
      });
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load counsellor dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedPeriod]);

  const counsellorName = user?.name || "Counsellor";
  const greeting = getGreeting(counsellorName);

  // Chart data for "My Leads Over Time"
  const lineChartData = useMemo(() => {
    const trend = data?.leadTrend || [];
    return {
      labels: trend.map((t) => t.date),
      datasets: [
        {
          label: "Leads Assigned",
          data: trend.map((t) => t.count),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#2563eb",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [data?.leadTrend]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} leads`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#94a3b8",
          font: { size: 11 },
        },
        grid: { color: "#f1f5f9" },
      },
    },
  };

  // Doughnut Chart data for "Conversations by Channel"
  const doughnutData = useMemo(() => {
    const channels = data?.conversationChannels || [];
    if (!channels.length) {
      return {
        labels: ["No Channels"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 0,
          },
        ],
      };
    }
    return {
      labels: channels.map((c) => c.channel),
      datasets: [
        {
          data: channels.map((c) => c.count),
          backgroundColor: channels.map((c) =>
            String(c.channel || c.channelKey || "").toLowerCase().includes("whatsapp")
              ? "#25D366"
              : c.color || "#2563eb"
          ),
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 4,
        },
      ],
    };
  }, [data?.conversationChannels]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} conversations`,
        },
      },
    },
  };

  const kpis = data?.kpis || {};
  const deltas = data?.deltas || {};
  const subtexts = data?.subtexts || {};
  const sparklines = data?.sparklines || {};
  const totalConversations = data?.totalConversations ?? 0;
  const conversationChannels = data?.conversationChannels || [];
  const leadStatuses = data?.leadStatus || [];
  const upcomingFollowUps = data?.upcomingFollowUps || [];
  const recentConversations = data?.recentConversations || [];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with greeting and date range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Here's what's happening with your assigned leads and conversations today.
          </p>
        </div>

        {/* TEST-ONLY: TwoMonthDateRangePicker matching user reference image */}
        <TwoMonthDateRangePicker
          value={selectedPeriod}
          onChange={setSelectedPeriod}
        />

        {/* PRESERVED ORIGINAL COUNSELLOR DATE SELECTOR (FOR ZERO-RISK REVERT):
        <div ref={pickerRef} className="relative self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriodOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <CalendarDays size={15} className="text-slate-400" />
            <span>{selectedPeriod}</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${periodOpen ? "rotate-180" : ""}`}
            />
          </button>
          {periodOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              {periodDefaults.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(option);
                    setPeriodOpen(false);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                    selectedPeriod === option
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
        */}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-white p-4 shadow-sm border border-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 h-72 animate-pulse rounded-2xl bg-white border border-slate-200" />
            <div className="lg:col-span-4 h-72 animate-pulse rounded-2xl bg-white border border-slate-200" />
            <div className="lg:col-span-3 h-72 animate-pulse rounded-2xl bg-white border border-slate-200" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
            <div className="lg:col-span-5 h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
            <div className="lg:col-span-3 h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-600 mb-3">
            <Zap size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Failed to load dashboard</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* 2. Top KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <CounsellorKpiCard
              title="My Open Conversations"
              value={kpis.openConversations ?? 0}
              delta={deltas.openConversations}
              subtext={subtexts.openConversations || "vs previous period"}
              icon={MessagesSquare}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              borderColor="border-t-blue-500"
              lineColor="#3b82f6"
              sparklineData={sparklines.openConversations}
            />
            <CounsellorKpiCard
              title="My Leads"
              value={kpis.myLeads ?? 0}
              delta={deltas.myLeads}
              subtext={subtexts.myLeads || "vs previous period"}
              icon={UsersRound}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              borderColor="border-t-purple-500"
              lineColor="#a855f7"
              sparklineData={sparklines.myLeads}
            />
            <CounsellorKpiCard
              title="Leads Due Today"
              value={kpis.leadsDueToday ?? 0}
              delta={deltas.leadsDueToday}
              subtext={subtexts.leadsDueToday || "vs previous period"}
              icon={CalendarDays}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              borderColor="border-t-amber-500"
              lineColor="#f59e0b"
              sparklineData={sparklines.leadsDueToday}
            />
            <CounsellorKpiCard
              title="My Calls Today"
              value={kpis.callsToday ?? 0}
              delta={deltas.callsToday}
              subtext={subtexts.callsToday || "vs previous period"}
              icon={Phone}
              iconBg="bg-sky-50"
              iconColor="text-sky-600"
              borderColor="border-t-sky-500"
              lineColor="#0ea5e9"
              sparklineData={sparklines.callsToday}
            />
            <CounsellorKpiCard
              title="My Conversion Rate"
              value={`${kpis.conversionRate ?? 0}%`}
              delta={deltas.conversionRate}
              subtext={subtexts.conversionRate || "vs last week"}
              icon={BarChart3}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              borderColor="border-t-emerald-500"
              lineColor="#10b981"
              sparklineData={sparklines.conversionRate}
            />
          </div>

          {/* 3. Middle Section: Leads Over Time + Conversations by Channel + My Lead Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* A. My Leads Over Time */}
            <section className="lg:col-span-5 rounded-2xl border border-slate-200 border-t-4 border-t-[#3366FF] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    My Leads Over Time
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Leads assigned to you</p>
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 truncate max-w-[140px]" title={data?.period?.label || selectedPeriod}>
                  {data?.period?.label || selectedPeriod}
                </span>
              </div>
              <div className="h-56 w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </section>

            {/* B. Conversations by Channel */}
            <section className="lg:col-span-4 rounded-2xl border border-slate-200 border-t-4 border-t-[#8B5CF6] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Conversations by Channel
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your assigned conversations</p>
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 truncate max-w-[140px]" title={data?.period?.label || selectedPeriod}>
                  {data?.period?.label || selectedPeriod}
                </span>
              </div>
              <div className="flex items-center gap-5 my-auto">
                <div className="relative h-36 w-36 shrink-0">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <strong className="text-xl font-bold text-slate-900">{totalConversations}</strong>
                    <span className="text-[10px] text-slate-500">Conversations</span>
                  </div>
                </div>
            <div className="min-w-0 flex-1 space-y-2">
              {conversationChannels.length ? (
                conversationChannels.map((c) => (
                  <div key={c.channel} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: String(c.channel || c.channelKey || "").toLowerCase().includes("whatsapp")
                            ? "#25D366"
                            : c.color || "#2563eb",
                        }}
                      />
                      <span className="truncate font-medium text-slate-700">{c.channel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-semibold text-slate-900">{c.percentage}%</span>
                      <span className="text-[11px] text-slate-400">({c.count})</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No active channels yet</p>
              )}
            </div>
          </div>
        </section>

        {/* C. My Lead Status */}
        <section className="lg:col-span-3 rounded-2xl border border-slate-200 border-t-4 border-t-[#16A34A] bg-white p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              My Lead Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned leads by current status</p>
          </div>
          <div className="space-y-3.5 my-auto">
            {leadStatuses.map((st) => (
              <div key={st.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{st.status}</span>
                  <span className="text-slate-500">
                    <strong className="text-slate-900 font-semibold">{st.percentage}%</strong>{" "}
                    <span className="text-[11px] text-slate-400">({st.count})</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(st.percentage, 0)}%`,
                      backgroundColor: st.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Bottom Section: Upcoming Follow-ups + Recent Conversations + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* D. Upcoming Follow-ups */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-200 border-t-4 border-t-[#F59E0B] bg-white p-5 shadow-sm flex flex-col h-[290px]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Upcoming Follow-ups
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("followUps")}
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          {upcomingFollowUps.length ? (
            <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
              {upcomingFollowUps.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl p-2.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "OVERDUE"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {item.status || "Pending"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]" title={item.task}>
                        {item.task}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                      {item.dueLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="my-auto py-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
                <CalendarDays size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-800">No follow-ups scheduled</p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                Follow-ups due for your assigned leads will appear here.
              </p>
            </div>
          )}
        </section>

        {/* E. Recent Assigned Conversations */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-200 border-t-4 border-t-[#0284C7] bg-white p-5 shadow-sm flex flex-col h-[290px]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <MessagesSquare size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Recent Assigned Conversations
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("studentLeads")}
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight size={13} />
            </button>
          </div>

          {recentConversations.length ? (
            <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
              {recentConversations.map((item) => {
                const initials = item.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <button
                    key={item.conversationId || item.leadId}
                    type="button"
                    onClick={() => {
                      if (item.leadId) {
                        onNavigate("studentLeads");
                      }
                    }}
                    className="group flex w-full items-center justify-between rounded-xl p-2.5 text-left transition hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-xs font-bold text-blue-700">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-sm">
                          {item.lastMessage}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400 pl-2">
                      {formatRelativeTime(item.lastActivityTime)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="my-auto py-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
                <MessagesSquare size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-800">No recent conversations</p>
              <p className="mt-1 text-xs text-slate-500">
                Incoming conversations for your leads will be listed here.
              </p>
            </div>
          )}
        </section>

        {/* F. Quick Actions */}
        <section className="lg:col-span-3 rounded-2xl border border-slate-200 border-t-4 border-t-[#6366F1] bg-white p-5 shadow-sm flex flex-col h-[290px]">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3 shrink-0">
            <Zap size={16} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 my-auto">
            <button
              type="button"
              onClick={() => onNavigate("studentLeads")}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-center transition hover:border-blue-200 hover:bg-blue-50/80 group"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                <UsersRound size={18} />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-700">
                View My Leads
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("inbox")}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-center transition hover:border-sky-200 hover:bg-sky-50/80 group"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
                <MessagesSquare size={18} />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-sky-700">
                Open Inbox
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("followUps")}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-center transition hover:border-amber-200 hover:bg-amber-50/80 group"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                <CalendarDays size={18} />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-amber-700">
                Add Follow-up
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("calls")}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-center transition hover:border-indigo-200 hover:bg-indigo-50/80 group"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <Phone size={18} />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-700">
                Log a Call
              </span>
            </button>
          </div>
        </section>
      </div>
      </>
    )}

      {/* 5. Footer */}
      <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/70 pt-4 text-xs text-slate-400 gap-2">
        <span>SolmentoAI — Empowering Education, Enabling Futures</span>
        <span>Counsellor Panel | v1.0</span>
      </footer>
    </div>
  );
}
