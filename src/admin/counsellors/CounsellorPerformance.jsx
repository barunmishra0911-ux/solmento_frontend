import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  UsersRound,
  PhoneCall,
  MessagesSquare,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronDown,
  RefreshCw,
  Target,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { getCounsellorPerformanceRequest } from "../../lib/authApi";
import {
  getDynamicPeriodOptions,
  resolvePeriodDates,
} from "../datePeriodUtils";
import TwoMonthDateRangePicker from "./TwoMonthDateRangePicker";

export default function CounsellorPerformance({ onNavigate, routerNavigate, userRole }) {
  const periodConfig = useMemo(() => getDynamicPeriodOptions(), []);
  const [selectedPeriod, setSelectedPeriod] = useState(periodConfig.selected || "Current Month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    counsellor: { name: "", email: "" },
    summary: {
      totalLeads: 0,
      contactedLeads: 0,
      qualifiedLeads: 0,
      convertedLeads: 0,
      lostLeads: 0,
      newLeads: 0,
      conversionRate: 0,
      contactRate: 0,
      totalConversations: 0,
      openConversations: 0,
      totalCalls: 0,
      completedCalls: 0,
      scheduledCalls: 0,
      missedCalls: 0,
      totalDurationSeconds: 0,
      avgDurationSeconds: 0,
      totalFollowUps: 0,
      completedFollowUps: 0,
      pendingFollowUps: 0,
    },
    funnelStages: [],
    activityTrend: [],
    statusBreakdown: [],
  });

  const fetchPerformance = async (periodStr = selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const { startDate, endDate } = resolvePeriodDates(periodStr);
      const res = await getCounsellorPerformanceRequest({ startDate, endDate, period: periodStr });
      if (res && res.data) {
        setData(res.data);
      } else if (res && res.summary) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load performance metrics:", err);
      setError(err?.message || "Failed to load performance metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance(selectedPeriod);
  }, [selectedPeriod]);

  const { summary, funnelStages, activityTrend, statusBreakdown, counsellor } = data;

  function formatTime(seconds) {
    const s = Number(seconds || 0);
    if (s <= 0) return "0s";
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m === 0) return `${rem}s`;
    return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  }

  const kpis = [
    {
      label: "My Leads Handled",
      value: summary.totalLeads,
      subtext: `${summary.newLeads} new • ${summary.contactedLeads} contacted`,
      icon: UsersRound,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      borderTop: "border-t-4 border-t-blue-500",
    },
    {
      label: "Conversion Rate",
      value: `${summary.conversionRate}%`,
      subtext: `${summary.convertedLeads} converted of ${summary.totalLeads}`,
      icon: Target,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      borderTop: "border-t-4 border-t-emerald-500",
    },
    {
      label: "Active Conversations",
      value: summary.totalConversations,
      subtext: `${summary.openConversations} currently open`,
      icon: MessagesSquare,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      borderTop: "border-t-4 border-t-purple-500",
    },
    {
      label: "Calls Handled",
      value: summary.totalCalls,
      subtext: `${summary.completedCalls} completed • ${formatTime(summary.totalDurationSeconds)} talk time`,
      icon: PhoneCall,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      borderTop: "border-t-4 border-t-amber-500",
    },
    {
      label: "Follow-ups Completed",
      value: `${summary.completedFollowUps} / ${summary.totalFollowUps}`,
      subtext: `${summary.pendingFollowUps} pending reminders`,
      icon: CalendarDays,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      borderTop: "border-t-4 border-t-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Date Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Counsellor Performance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Personal metrics for {counsellor.name || "your account"} — track leads, calls, and conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchPerformance(selectedPeriod)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh performance metrics"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Standardized TwoMonthDateRangePicker */}
          <TwoMonthDateRangePicker
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            align="right"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 text-slate-500">
          <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-semibold text-slate-800">
            Calculating performance metrics...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Aggregating real database data for leads, conversations and calls
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-2xl border border-slate-200 bg-white p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
            <AlertCircle size={24} />
          </div>
          <p className="text-base font-bold text-slate-900">
            Unable to load performance data
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md">{error}</p>
          <button
            type="button"
            onClick={() => fetchPerformance(selectedPeriod)}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : summary.totalLeads === 0 && summary.totalCalls === 0 ? (
        /* Truthful Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-2xl border border-slate-200 bg-white p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
            <BarChart3 size={28} />
          </div>
          <p className="text-base font-bold text-slate-900">
            No activity recorded for this period
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            There are currently no leads assigned, calls logged, or conversions recorded for this time range. As you work on assigned leads, your personal performance metrics will appear here.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.("studentLeads")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              View My Leads
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("calls")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Log a Call
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border border-slate-200 ${kpi.borderTop} bg-white p-5 shadow-sm transition hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {kpi.label}
                    </span>
                    <div className={`grid h-8 w-8 place-items-center rounded-xl border ${kpi.color}`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-950">
                    {kpi.value}
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                    {kpi.subtext}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Visuals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Conversion Funnel */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Admissions Conversion Funnel
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stage-by-stage pipeline for your assigned leads
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {summary.conversionRate}% Rate
                </span>
              </div>

              <div className="space-y-4 my-auto">
                {funnelStages.map((stage, idx) => {
                  const pctOfTotal =
                    summary.totalLeads > 0
                      ? Math.round((stage.count / summary.totalLeads) * 100)
                      : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {stage.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900">
                            {stage.count}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({pctOfTotal}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pctOfTotal, stage.count > 0 ? 6 : 0)}%`,
                            backgroundColor: stage.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Total Leads: <strong>{summary.totalLeads}</strong></span>
                <span>Contact Rate: <strong>{summary.contactRate}%</strong></span>
                <span>Conversions: <strong>{summary.convertedLeads}</strong></span>
              </div>
            </div>

            {/* Activity Trend (Last 7 Days) */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 border-t-4 border-t-purple-500 bg-white p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    7-Day Activity Trend
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily lead inquiries and call consultations
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" /> Leads
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block" /> Calls
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 items-end min-h-[160px] my-auto pt-4 pb-2">
                {activityTrend.map((day, idx) => {
                  const maxVal = Math.max(
                    ...activityTrend.map((d) => Math.max(d.leads, d.calls)),
                    1,
                  );
                  const leadHeight = Math.round((day.leads / maxVal) * 110);
                  const callHeight = Math.round((day.calls / maxVal) * 110);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="flex items-end gap-1 h-[120px]">
                        {/* Leads bar */}
                        <div
                          className="w-3 sm:w-4 rounded-t-md bg-blue-500 transition-all hover:bg-blue-600"
                          style={{ height: `${Math.max(leadHeight, day.leads > 0 ? 8 : 2)}px` }}
                          title={`${day.date}: ${day.leads} leads`}
                        />
                        {/* Calls bar */}
                        <div
                          className="w-3 sm:w-4 rounded-t-md bg-purple-500 transition-all hover:bg-purple-600"
                          style={{ height: `${Math.max(callHeight, day.calls > 0 ? 8 : 2)}px` }}
                          title={`${day.date}: ${day.calls} calls`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 text-center">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Recent Leads: <strong>{activityTrend.reduce((s, d) => s + d.leads, 0)}</strong></span>
                <span>Recent Calls: <strong>{activityTrend.reduce((s, d) => s + d.calls, 0)}</strong></span>
              </div>
            </div>
          </div>

          {/* Secondary Details: Status Breakdown + Operational Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lead Status Breakdown */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Lead Status Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current distribution of your assigned prospective students
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {statusBreakdown.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-xl border border-slate-100 bg-slate-50/75 p-3 text-center"
                  >
                    <div
                      className="text-xs font-bold mb-1"
                      style={{ color: item.color }}
                    >
                      {item.status}
                    </div>
                    <div className="text-xl font-black text-slate-900">
                      {item.count}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {summary.totalLeads > 0
                        ? `${Math.round((item.count / summary.totalLeads) * 100)}%`
                        : "0%"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Summary */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Counselling Performance Summary
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Key efficiency indicators for this period
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Total Consultations (Calls)</span>
                    <span className="font-bold text-slate-900">{summary.totalCalls}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Average Call Talk Time</span>
                    <span className="font-bold text-slate-900">{formatTime(summary.avgDurationSeconds)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Scheduled Callbacks</span>
                    <span className="font-bold text-purple-600">{summary.scheduledCalls}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">Follow-up Completion Rate</span>
                    <span className="font-bold text-emerald-600">
                      {summary.totalFollowUps > 0
                        ? `${Math.round((summary.completedFollowUps / summary.totalFollowUps) * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Documented Response Time</span>
                    <span className="font-medium text-slate-400 italic" title="Not available in current database schema">
                      Real-time Widget
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate?.("calls")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Calls <ArrowUpRight size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.("followUps")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View Follow-ups <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
