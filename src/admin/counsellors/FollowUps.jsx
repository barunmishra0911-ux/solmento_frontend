import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  X,
  ArrowUpRight,
  RefreshCw,
  Check,
  FileText,
  Calendar,
} from "lucide-react";
import {
  listFollowUpsRequest,
  createFollowUpRequest,
  updateFollowUpRequest,
} from "../../lib/authApi";

export default function FollowUps({ onNavigate, routerNavigate, userRole, permissions = [] }) {
  const canCreateFollowUp = userRole === "ADMIN" || (Array.isArray(permissions) && permissions.includes("follow_ups.create"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    followUps: [],
    groups: { today: [], tomorrow: [], thisWeek: [], overdue: [] },
    counts: { total: 0, today: 0, tomorrow: 0, thisWeek: 0, overdue: 0 },
    assignedLeads: [],
  });

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'today' | 'tomorrow' | 'thisWeek' | 'overdue'
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [updatingId, setUpdatingId] = useState(null);



  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listFollowUpsRequest();
      if (res && res.data) {
        setData(res.data);
      } else if (res && res.followUps) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load follow-ups:", err);
      setError(err?.message || "Failed to load follow-ups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleMarkComplete = async (fu) => {
    if (fu.status === "COMPLETED" || updatingId) return;
    try {
      setUpdatingId(fu.id);
      await updateFollowUpRequest(fu.id, { status: "COMPLETED" });
      await fetchFollowUps();
    } catch (err) {
      console.error("Failed to update follow-up:", err);
      alert(err?.message || "Failed to complete follow-up");
    } finally {
      setUpdatingId(null);
    }
  };



  // Filter follow-ups by activeTab, search query, and status
  const displayedFollowUps = useMemo(() => {
    let list = [];
    if (activeTab === "all") {
      list = data.followUps || [];
    } else if (data.groups && data.groups[activeTab]) {
      list = data.groups[activeTab];
    }

    if (statusFilter !== "ALL") {
      list = list.filter((f) => f.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.leadName.toLowerCase().includes(q) ||
          f.purpose.toLowerCase().includes(q) ||
          f.counsellorName.toLowerCase().includes(q) ||
          (f.leadCourse && f.leadCourse.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [data, activeTab, statusFilter, searchQuery]);

  const tabs = [
    {
      id: "all",
      label: "All Follow-ups",
      count: data.counts.total,
      tone: "text-slate-700",
      badge: "bg-slate-100 text-slate-700",
      activeBadge: "bg-blue-600 text-white",
    },
    {
      id: "today",
      label: "Today",
      count: data.counts.today,
      tone: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
      activeBadge: "bg-blue-600 text-white",
    },
    {
      id: "tomorrow",
      label: "Tomorrow",
      count: data.counts.tomorrow,
      tone: "text-purple-700",
      badge: "bg-purple-100 text-purple-700",
      activeBadge: "bg-purple-600 text-white",
    },
    {
      id: "thisWeek",
      label: "This Week",
      count: data.counts.thisWeek,
      tone: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      activeBadge: "bg-emerald-600 text-white",
    },
    {
      id: "overdue",
      label: "Overdue",
      count: data.counts.overdue,
      tone: data.counts.overdue > 0 ? "text-rose-700" : "text-slate-600",
      badge:
        data.counts.overdue > 0
          ? "bg-rose-100 text-rose-700 font-bold"
          : "bg-slate-100 text-slate-600",
      activeBadge: "bg-rose-600 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Follow-ups
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep every lead follow-up on track.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchFollowUps}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {canCreateFollowUp && (
            <button
              type="button"
              onClick={() => {
                if (routerNavigate) {
                  routerNavigate("/app/leads/follow-ups/new");
                } else if (onNavigate) {
                  onNavigate("createFollowUp");
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} /> Create new
            </button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white shadow-sm">
        {/* Navigation Tabs */}
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
              placeholder="Search follow-ups by student, purpose, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* Table or Content State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              Loading follow-ups...
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Fetching assigned follow-up schedule from database
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Unable to load follow-ups
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">{error}</p>
            <button
              type="button"
              onClick={fetchFollowUps}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : displayedFollowUps.length === 0 ? (
          /* Truthful Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <CalendarDays size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900">
              {activeTab === "overdue"
                ? "No overdue follow-ups"
                : activeTab === "today"
                  ? "No follow-ups due today"
                  : activeTab === "tomorrow"
                    ? "No follow-ups scheduled for tomorrow"
                    : activeTab === "thisWeek"
                      ? "No upcoming follow-ups this week"
                      : searchQuery
                        ? "No follow-ups matching your search"
                        : "No follow-ups scheduled yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {activeTab === "overdue"
                ? "Great job! All your assigned follow-up commitments are currently up to date."
                : "Scheduled follow-up reminders for your assigned student leads will appear here."}
            </p>
            {canCreateFollowUp && (
              <button
                type="button"
                onClick={() => {
                  setModalError("");
                  setShowCreateModal(true);
                }}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Plus size={14} /> Schedule Follow-up
              </button>
            )}
          </div>
        ) : (
          /* Follow-up List Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="py-3 px-4">Lead / Student</th>
                  <th className="py-3 px-4">Assigned Counsellor</th>
                  <th className="py-3 px-4">Follow-up Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Purpose / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedFollowUps.map((fu) => {
                  const isCompleted = fu.status === "COMPLETED";
                  const isOverdue = fu.isOverdue || fu.status === "OVERDUE";
                  const initials = fu.leadName
                    ? fu.leadName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : "L";

                  return (
                    <tr
                      key={fu.id}
                      className={`transition hover:bg-slate-50/75 ${isOverdue && !isCompleted ? "bg-rose-50/20" : ""
                        }`}
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
                                if (routerNavigate && fu.leadPublicId) {
                                  routerNavigate(
                                    `/app/leads/students/${fu.leadPublicId}`,
                                  );
                                } else if (onNavigate) {
                                  onNavigate("studentLeads");
                                }
                              }}
                              className="font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1 text-left"
                            >
                              <span>{fu.leadName}</span>
                              <ArrowUpRight
                                size={12}
                                className="text-slate-400"
                              />
                            </button>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {fu.leadCourse || "General Inquiry"}
                              {fu.leadPhone ? ` • ${fu.leadPhone}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Counsellor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <User size={13} className="text-slate-400" />
                          <span className="font-semibold">
                            {fu.counsellorName}
                          </span>
                        </div>
                      </td>

                      {/* Follow-up Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <Calendar
                            size={13}
                            className={
                              isOverdue && !isCompleted
                                ? "text-rose-500"
                                : "text-blue-500"
                            }
                          />
                          <span className="font-medium">{fu.date}</span>
                        </div>
                      </td>

                      {/* Follow-up Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Clock size={13} className="text-slate-400" />
                          <span>{fu.time}</span>
                        </div>
                      </td>

                      {/* Purpose / Note */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <FileText
                            size={13}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <p className="line-clamp-2 text-slate-700 font-normal leading-relaxed">
                            {fu.purpose}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
                            <AlertCircle size={11} /> Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => handleMarkComplete(fu)}
                              disabled={updatingId === fu.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 disabled:opacity-50"
                              title="Mark this follow-up as complete"
                            >
                              {updatingId === fu.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              <span>Complete</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (routerNavigate && fu.leadPublicId) {
                                routerNavigate(
                                  `/app/leads/students/${fu.leadPublicId}`,
                                );
                              } else if (onNavigate) {
                                onNavigate("studentLeads");
                              }
                            }}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600"
                            title="View lead details"
                          >
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
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
