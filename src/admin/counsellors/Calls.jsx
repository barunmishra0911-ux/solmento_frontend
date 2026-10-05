import React, { useState, useEffect, useMemo } from "react";
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Calendar,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  X,
  ArrowUpRight,
  FileText,
  CalendarDays,
} from "lucide-react";
import { listCallsRequest, createCallRequest } from "../../lib/authApi";

export default function Calls({ onNavigate, routerNavigate, userRole, permissions = [] }) {
  const canCreateCall = userRole === "ADMIN" || (Array.isArray(permissions) && permissions.includes("calls.create"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    calls: [],
    groups: { today: [], upcoming: [], recent: [] },
    counts: { total: 0, today: 0, upcoming: 0, recent: 0 },
    assignedLeads: [],
  });

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'today' | 'upcoming' | 'recent'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [directionFilter, setDirectionFilter] = useState("ALL");



  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listCallsRequest();
      if (res && res.data) {
        setData(res.data);
      } else if (res && res.calls) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load calls:", err);
      setError(err?.message || "Failed to load calls. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);



  const displayedCalls = useMemo(() => {
    let list = [];
    if (activeTab === "all") {
      list = data.calls || [];
    } else if (data.groups && data.groups[activeTab]) {
      list = data.groups[activeTab];
    }

    if (statusFilter !== "ALL") {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (directionFilter !== "ALL") {
      list = list.filter((c) => c.direction === directionFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.leadName.toLowerCase().includes(q) ||
          c.outcome.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q) ||
          c.counsellorName.toLowerCase().includes(q) ||
          (c.leadPhone && c.leadPhone.includes(q)) ||
          (c.leadCourse && c.leadCourse.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [data, activeTab, statusFilter, directionFilter, searchQuery]);

  const tabs = [
    {
      id: "all",
      label: "All Calls",
      count: data.counts.total,
      badge: "bg-slate-100 text-slate-700",
    },
    {
      id: "today",
      label: "Today's Calls",
      count: data.counts.today,
      badge: "bg-blue-100 text-blue-700",
    },
    {
      id: "upcoming",
      label: "Upcoming / Scheduled",
      count: data.counts.upcoming,
      badge: "bg-purple-100 text-purple-700",
    },
    {
      id: "recent",
      label: "Recent Call Records",
      count: data.counts.recent,
      badge: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Calls</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track calls, recordings and follow-up outcomes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCalls}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh calls"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {canCreateCall && (
            <button
              type="button"
              onClick={() => {
                if (routerNavigate) {
                  routerNavigate("/app/calls/new");
                } else if (onNavigate) {
                  onNavigate("logCall");
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} /> Log Call
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4 bg-slate-50/50">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${isActive
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isActive ? "bg-blue-100 text-blue-700" : tab.badge
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search calls by student, notes, outcome, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">
                Direction:
              </span>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All</option>
                <option value="OUTBOUND">Outbound</option>
                <option value="INBOUND">Inbound</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="ALL">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="MISSED">Missed</option>
                <option value="BUSY">Busy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Loading calls...
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Fetching call records from database
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Unable to load call records
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">{error}</p>
            <button
              type="button"
              onClick={fetchCalls}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : displayedCalls.length === 0 ? (
          /* Truthful Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <PhoneCall size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900">
              {activeTab === "today"
                ? "No calls recorded today"
                : activeTab === "upcoming"
                  ? "No upcoming calls scheduled"
                  : activeTab === "recent"
                    ? "No recent call records found"
                    : searchQuery
                      ? "No calls matching your search"
                      : "No call records found"}
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Call consultations, outbound calls, and outcomes logged for your
              assigned leads will appear here.
            </p>
            {canCreateCall && (
              <button
                type="button"
                onClick={() => {
                  setModalError("");
                  setShowLogModal(true);
                }}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus size={14} /> Log Call Record
              </button>
            )}
          </div>
        ) : (
          /* Calls Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="py-3 px-4">Lead / Student</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Counsellor</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Disposition / Outcome</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedCalls.map((call) => {
                  const isOutbound = call.direction === "OUTBOUND";
                  const isMissed = call.status === "MISSED";
                  const isScheduled = call.status === "SCHEDULED";
                  const isCompleted = call.status === "COMPLETED";

                  const initials = call.leadName
                    ? call.leadName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : "L";

                  return (
                    <tr
                      key={call.id}
                      className="transition hover:bg-slate-50/75"
                    >
                      {/* Lead / Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                            {initials}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                if (routerNavigate && call.leadPublicId) {
                                  routerNavigate(
                                    `/app/leads/students/${call.leadPublicId}`,
                                  );
                                } else if (onNavigate) {
                                  onNavigate("studentLeads");
                                }
                              }}
                              className="font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1 text-left"
                            >
                              <span>{call.leadName}</span>
                              <ArrowUpRight
                                size={12}
                                className="text-slate-400"
                              />
                            </button>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {call.leadCourse || "General Inquiry"}
                              {call.leadPhone ? ` • ${call.leadPhone}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="py-3.5 px-4">
                        {isOutbound ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <PhoneOutgoing size={11} /> Outbound
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            <PhoneIncoming size={11} /> Inbound
                          </span>
                        )}
                      </td>

                      {/* Counsellor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <User size={13} className="text-slate-400" />
                          <span className="font-semibold">
                            {call.counsellorName}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-medium text-slate-900 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {call.callDate}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-slate-400" />
                            {call.callTime}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${call.durationSeconds > 0
                              ? "text-slate-900"
                              : "text-slate-400"
                            }`}
                        >
                          {call.durationFormatted}
                        </span>
                      </td>

                      {/* Disposition / Outcome */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                          {call.outcome}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        ) : isScheduled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 border border-purple-200">
                            <Clock size={11} /> Scheduled
                          </span>
                        ) : isMissed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
                            <PhoneMissed size={11} /> Missed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <AlertCircle size={11} /> {call.status}
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600 font-normal leading-relaxed">
                          {call.notes || "—"}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (routerNavigate && call.leadPublicId) {
                              routerNavigate(
                                `/app/leads/students/${call.leadPublicId}`,
                              );
                            } else if (onNavigate) {
                              onNavigate("studentLeads");
                            }
                          }}
                          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
                          title="View lead profile"
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
