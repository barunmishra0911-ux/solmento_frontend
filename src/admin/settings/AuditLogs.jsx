import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  AlignLeft,
  Calendar,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Edit3,
  FileText,
  Filter,
  Layers,
  LogIn,
  MoreVertical,
  PlusCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
  Loader2,
} from "lucide-react";
import {
  initialFilterState,
  getTodayDateString,
  getInitialFilterState,
} from "./auditLogsData";
import { getAuditLogsRequest, exportAuditLogsRequest } from "@/lib/authApi";
import TwoMonthDateRangePicker from "../TwoMonthDateRangePicker";

// Visual Action Badges according to specs
function ActionBadge({ action }) {
  switch (action) {
    case "Updated":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-600">
          <Edit3 size={13} className="text-blue-500" />
          Updated
        </span>
      );
    case "Created":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          <PlusCircle size={13} className="text-emerald-500" />
          Created
        </span>
      );
    case "Deleted":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-600">
          <Trash2 size={13} className="text-rose-500" />
          Deleted
        </span>
      );
    case "Logged In":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
          <LogIn size={13} className="text-slate-500" />
          Logged In
        </span>
      );
  }
}

// Data-driven Role Badges
function RoleBadge({ role }) {
  if (role === "Admin") {
    return (
      <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-purple-50 border border-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-600">
      Counsellor
    </span>
  );
}

// User initials display with static styling
function UserDisplay({ user }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${user.avatarBg}`}
      >
        {user.initials}
      </span>
      <span className="truncate text-xs font-semibold text-slate-800">
        {user.name}
      </span>
    </div>
  );
}

export default function AuditLogs({ onNavigate }) {
  // Filter state
  const [filterInputs, setFilterInputs] = useState(getInitialFilterState);
  const [activeFilters, setActiveFilters] = useState(getInitialFilterState);

  // Real audit log list & pagination state (ONLY from GET /api/admin/audit-logs)
  const [logs, setLogs] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Selected audit log row for side panel
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Row dropdown action menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch audit logs strictly from GET /api/admin/audit-logs
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogsRequest({
        search: activeFilters.search,
        module: activeFilters.module,
        action: activeFilters.action,
        user: activeFilters.user,
        role: activeFilters.role,
        dateFrom: activeFilters.dateFrom,
        dateTo: activeFilters.dateTo,
        page: currentPage,
        limit: rowsPerPage,
      });

      if (res && Array.isArray(res.logs)) {
        setLogs(res.logs);
        setTotalEntries(typeof res.total === "number" ? res.total : res.logs.length);
        if (res.logs.length > 0) {
          if (!selectedLogId || !res.logs.some((l) => l.id === selectedLogId)) {
            setSelectedLogId(res.logs[0].id);
          }
        } else {
          setSelectedLogId(null);
        }
      } else {
        setLogs([]);
        setTotalEntries(0);
        setSelectedLogId(null);
      }
    } catch (err) {
      console.error("Audit logs API fetch error:", err);
      setLogs([]);
      setTotalEntries(0);
      setSelectedLogId(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, currentPage, rowsPerPage, selectedLogId]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Apply filters
  const handleApplyFilters = () => {
    setActiveFilters({ ...filterInputs });
    setCurrentPage(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    const initialState = getInitialFilterState();
    setFilterInputs(initialState);
    setActiveFilters(initialState);
    setCurrentPage(1);
  };

  // Handle Date Range change from TwoMonthDateRangePicker
  const handleDateRangeChange = (val) => {
    if (!val) return;
    const newStart = val.start || val.startDate || "";
    const newEnd = val.end || val.endDate || "";
    const period = val.period || "Custom Range";

    const updated = {
      ...filterInputs,
      dateFrom: newStart,
      dateTo: newEnd,
      period: period,
    };
    setFilterInputs(updated);
    setActiveFilters(updated);
    setCurrentPage(1);
  };

  // Export state & handler
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  const handleExportLogs = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError("");
    setExportSuccess("");
    try {
      await exportAuditLogsRequest(activeFilters);
      setExportSuccess("Audit logs exported successfully.");
      setTimeout(() => setExportSuccess(""), 4000);
    } catch (err) {
      console.error("Export logs failed:", err);
      setExportError(err?.message || "Failed to export audit logs. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Currently selected audit log object
  const selectedLog = useMemo(() => {
    if (!selectedLogId || logs.length === 0) return null;
    return logs.find((log) => log.id === selectedLogId) || logs[0] || null;
  }, [logs, selectedLogId]);

  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;

  const handleRowClick = (logId) => {
    setSelectedLogId(logId);
    setIsPanelOpen(true);
  };

  return (
    <div className="min-w-0 flex-1">
      {/* 1. PAGE BREADCRUMB & HEADER */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("settings")}
            className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
          >
            <Sparkles size={14} className="text-blue-500" />
            Settings
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-700">Audit Logs</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Audit Logs
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Track all important activities, changes and actions performed across the platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
            {/* Dynamic Two-Month Date Range Picker (Reused from Reports) */}
            <TwoMonthDateRangePicker
              value={{
                start: activeFilters.dateFrom,
                end: activeFilters.dateTo,
                period: activeFilters.period || "This Month",
              }}
              onChange={handleDateRangeChange}
              align="right"
            />

            {/* Export Logs button hidden from UI as per requirements, backend logic preserved */}
            {false && (
              <button
                type="button"
                onClick={handleExportLogs}
                disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition self-start sm:self-auto cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 size={16} className="text-blue-600 animate-spin" />
                ) : (
                  <Download size={16} className="text-slate-500" />
                )}
                <span>{isExporting ? "Exporting..." : "Export Logs"}</span>
              </button>
            )}
          </div>
        </div>
        {exportError && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl">
            <X size={14} className="cursor-pointer" onClick={() => setExportError("")} />
            <span>{exportError}</span>
          </div>
        )}
      </div>

      {/* 2. FILTER / SEARCH SECTION */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-[280px] lg:w-[310px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={filterInputs.search}
                onChange={(e) =>
                  setFilterInputs((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                placeholder="Search by user, action, module or details..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* Dropdowns */}
            <select
              value={filterInputs.module}
              onChange={(e) =>
                setFilterInputs((prev) => ({ ...prev, module: e.target.value }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              <option value="ALL">All Modules</option>
              <option value="Counsellor">Counsellor</option>
              <option value="Lead">Lead</option>
              <option value="Follow Ups">Follow Ups</option>
              <option value="Company Profile">Company Profile</option>
              <option value="Settings">Settings</option>
              <option value="Student Lead">Student Lead</option>
              <option value="Roles & Permissions">Roles & Permissions</option>
              <option value="My Leads">My Leads</option>
              <option value="Campaigns">Campaigns</option>
              <option value="Authentication">Authentication</option>
            </select>

            <select
              value={filterInputs.action}
              onChange={(e) =>
                setFilterInputs((prev) => ({ ...prev, action: e.target.value }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="Updated">Updated</option>
              <option value="Created">Created</option>
              <option value="Deleted">Deleted</option>
              <option value="Logged In">Logged In</option>
            </select>

            <select
              value={filterInputs.user}
              onChange={(e) =>
                setFilterInputs((prev) => ({ ...prev, user: e.target.value }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              <option value="ALL">All Users</option>
              <option value="Suraj Kumar">Suraj Kumar</option>
              <option value="Barun Mishra">Barun Mishra</option>
              <option value="Rishav Kumar">Rishav Kumar</option>
              <option value="Anjali Patel">Anjali Patel</option>
            </select>

            <select
              value={filterInputs.role}
              onChange={(e) =>
                setFilterInputs((prev) => ({ ...prev, role: e.target.value }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Counsellor">Counsellor</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            >
              <RotateCcw size={14} /> Clear Filters
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
            >
              <Filter size={14} /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT: TABLE & LOG DETAILS PANEL */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Audit Log Table Container */}
        <div className="w-full flex-1 min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto relative min-h-[300px]">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            )}
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th scope="col" className="px-3.5 py-3.5 w-10 text-center">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
                      <span>Date & Time</span>
                      <ChevronsUpDown size={14} className="text-slate-400" />
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">
                    Module / Page
                  </th>
                  <th scope="col" className="px-4 py-3.5 min-w-[200px]">
                    Details
                  </th>
                  <th scope="col" className="px-3 py-3.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500 text-sm font-medium"
                    >
                      No audit logs match the selected filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isSelected = selectedLogId === log.id && isPanelOpen;
                    return (
                      <tr
                        key={log.id}
                        onClick={() => handleRowClick(log.id)}
                        className={`transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/60 font-medium"
                            : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="px-3.5 py-3.5 text-center text-slate-500 font-medium">
                          {log.id}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {log.timestamp}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <UserDisplay user={log.user} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <RoleBadge role={log.role} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <ActionBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                          {log.module}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 max-w-[280px] lg:max-w-[340px] truncate">
                          {log.details}
                        </td>
                        <td
                          className="px-3 py-3.5 text-center relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === log.id ? null : log.id
                              )
                            }
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === log.id && (
                            <div className="absolute right-3 top-10 z-20 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  handleRowClick(log.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 text-left transition flex items-center gap-2 cursor-pointer"
                              >
                                <FileText size={14} /> View Details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. PAGINATION FOOTER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 px-4 py-3.5 text-xs text-slate-600">
            <div>
              Showing {logs.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * rowsPerPage, totalEntries)} of{" "}
              {totalEntries} entries
            </div>

            <div className="flex items-center gap-1.5">
              {/* Previous button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                &lt;
              </button>

              {/* Page buttons */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}

              {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

              {/* Next button */}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                &gt;
              </button>

              {/* Rows per page dropdown */}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. LOG DETAILS SIDE PANEL */}
        {isPanelOpen && selectedLog && (
          <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm self-stretch flex flex-col">
            {/* Side Panel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Log Details
              </h2>
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Top Action Banner */}
            <div className="mt-4 mb-5 rounded-2xl bg-blue-50/70 border border-blue-100 p-4 flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <Edit3 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedLog.summaryTitle}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedLog.summarySubtitle}
                </p>
              </div>
            </div>

            {/* Details Field List */}
            <div className="space-y-4 text-xs">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400 shrink-0" />
                <div className="w-24 font-semibold text-slate-500">
                  Date & Time
                </div>
                <div className="font-semibold text-slate-900">
                  {selectedLog.timestamp}
                </div>
              </div>

              {/* User */}
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400 shrink-0" />
                <div className="w-24 font-semibold text-slate-500">User</div>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${selectedLog.user.avatarBg}`}
                  >
                    {selectedLog.user.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {selectedLog.user.name}
                    </div>
                    {selectedLog.user.email && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {selectedLog.user.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-slate-400 shrink-0" />
                <div className="w-24 font-semibold text-slate-500">Role</div>
                <div>
                  <RoleBadge role={selectedLog.role} />
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3">
                <Edit3 size={16} className="text-slate-400 shrink-0" />
                <div className="w-24 font-semibold text-slate-500">Action</div>
                <div>
                  <ActionBadge action={selectedLog.action} />
                </div>
              </div>

              {/* Module */}
              <div className="flex items-center gap-3">
                <Layers size={16} className="text-slate-400 shrink-0" />
                <div className="w-24 font-semibold text-slate-500">Module</div>
                <div className="font-semibold text-slate-900">
                  {selectedLog.module}
                </div>
              </div>

              {/* Page */}
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <div className="w-24 font-semibold text-slate-500">Page</div>
                <div className="font-semibold text-slate-900">
                  {selectedLog.page}
                </div>
              </div>

              {/* Details */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2 font-semibold text-slate-500">
                  <AlignLeft size={16} className="text-slate-400" />
                  <span>Details</span>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 text-xs text-slate-700 leading-relaxed">
                  {selectedLog.fullDetails || selectedLog.details}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
