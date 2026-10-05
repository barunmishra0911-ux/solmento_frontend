import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Save,
  Plus,
  Trash2,
  X,
  UserCheck,
  Palmtree,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  getCounsellorAvailabilityRequest,
  updateCounsellorLiveStatusRequest,
  updateCounsellorScheduleRequest,
  addCounsellorLeaveRequest,
  deleteCounsellorLeaveRequest,
} from "../../lib/authApi";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_SCHEDULE = [
  { day: "Monday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Thursday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Friday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Saturday", enabled: true, startTime: "10:00", endTime: "15:00" },
  { day: "Sunday", enabled: false, startTime: "09:00", endTime: "18:00" },
];

export default function CounsellorAvailability({ onNavigate, routerNavigate, userRole }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [addingLeave, setAddingLeave] = useState(false);
  const [deletingLeaveId, setDeletingLeaveId] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  const [availability, setAvailability] = useState({
    counsellor: { name: "", email: "", designation: "" },
    liveStatus: "ONLINE",
    schedule: DEFAULT_SCHEDULE,
    leaves: [],
  });

  // Schedule editor state
  const [scheduleState, setScheduleState] = useState(DEFAULT_SCHEDULE);

  // Leave modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [deleteTargetLeave, setDeleteTargetLeave] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    type: "HOLIDAY",
    note: "",
  });

  const showToast = (msg) => {
    setSuccessToast(msg);
    window.setTimeout(() => setSuccessToast(""), 3500);
  };

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCounsellorAvailabilityRequest();
      const payload = res?.data || res;
      if (payload) {
        setAvailability(payload);
        if (Array.isArray(payload.schedule) && payload.schedule.length) {
          setScheduleState(payload.schedule);
        }
      }
    } catch (err) {
      console.error("Error loading availability:", err);
      setError(err?.message || "Failed to load counsellor availability.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Handle Live Status Change
  const handleStatusChange = async (newStatus) => {
    if (newStatus === availability.liveStatus) return;
    try {
      setSavingStatus(true);
      // Optimistic update so UI reflects immediately
      setAvailability((prev) => ({ ...prev, liveStatus: newStatus }));
      const res = await updateCounsellorLiveStatusRequest(newStatus);
      const payload = res?.data || res;
      if (payload) {
        setAvailability(payload);
        showToast(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast(err?.message || "Failed to update status");
      // Revert if failed
      fetchAvailability();
    } finally {
      setSavingStatus(false);
    }
  };

  // Handle Schedule Toggle / Time Change
  const handleScheduleToggle = (dayName) => {
    setScheduleState((prev) =>
      prev.map((item) =>
        item.day === dayName ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  const handleTimeChange = (dayName, field, value) => {
    setScheduleState((prev) =>
      prev.map((item) =>
        item.day === dayName ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      const res = await updateCounsellorScheduleRequest(scheduleState);
      const payload = res?.data || res;
      if (payload) {
        setAvailability(payload);
        if (Array.isArray(payload.schedule) && payload.schedule.length) {
          setScheduleState(payload.schedule);
        }
        showToast("Weekly working hours saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
      showToast(err?.message || "Failed to save weekly schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  // Handle Add Leave
  const handleAddLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.title.trim()) {
      alert("Please enter a title for the holiday / leave.");
      return;
    }
    if (!leaveForm.startDate) {
      alert("Please select a start date.");
      return;
    }

    try {
      setAddingLeave(true);
      const res = await addCounsellorLeaveRequest({
        ...leaveForm,
        endDate: leaveForm.endDate || leaveForm.startDate,
      });
      const payload = res?.data || res;
      if (payload) {
        setAvailability(payload);
        setIsLeaveModalOpen(false);
        setLeaveForm({
          title: "",
          startDate: "",
          endDate: "",
          type: "HOLIDAY",
          note: "",
        });
        showToast("Holiday / Leave period marked successfully!");
      }
    } catch (err) {
      console.error("Failed to add leave:", err);
      alert(err?.message || "Failed to mark leave");
    } finally {
      setAddingLeave(false);
    }
  };

  // Handle Delete Leave
  const handleConfirmDeleteLeave = async () => {
    if (!deleteTargetLeave?.id) return;
    const leaveId = deleteTargetLeave.id;
    try {
      setDeletingLeaveId(leaveId);
      const res = await deleteCounsellorLeaveRequest(leaveId);
      const payload = res?.data || res;
      if (payload) {
        setAvailability(payload);
        showToast("Holiday/Leave entry removed.");
      }
      setDeleteTargetLeave(null);
    } catch (err) {
      console.error("Failed to delete leave:", err);
      showToast(err?.message || "Failed to delete leave");
    } finally {
      setDeletingLeaveId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Counsellor Availability
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal live working status, weekly schedule, and marked leaves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAvailability}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading your availability schedule...</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center">
          <AlertCircle size={40} className="text-rose-500" />
          <h3 className="mt-3 text-base font-bold text-rose-900">Failed to load availability</h3>
          <p className="mt-1 text-sm text-rose-600">{error}</p>
          <button
            onClick={fetchAvailability}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Top Row: Live Availability Status Card */}
          <div className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <UserCheck size={16} />
                  </span>
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    Live Working Status
                  </h2>
                  {savingStatus && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <Loader2 size={12} className="animate-spin" /> Saving...
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                  Set whether you are actively taking calls and conversations right now.
                </p>
              </div>

              {/* Status Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={savingStatus}
                  onClick={() => handleStatusChange("ONLINE")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    availability.liveStatus === "ONLINE"
                      ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-2"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      availability.liveStatus === "ONLINE" ? "bg-white animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                  Online
                </button>

                <button
                  type="button"
                  disabled={savingStatus}
                  onClick={() => handleStatusChange("AWAY")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    availability.liveStatus === "AWAY"
                      ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-600 ring-offset-2"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      availability.liveStatus === "AWAY" ? "bg-white" : "bg-amber-500"
                    }`}
                  />
                  Away
                </button>

                <button
                  type="button"
                  disabled={savingStatus}
                  onClick={() => handleStatusChange("OFFLINE")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                    availability.liveStatus === "OFFLINE"
                      ? "bg-slate-700 text-white shadow-sm ring-2 ring-slate-700 ring-offset-2"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      availability.liveStatus === "OFFLINE" ? "bg-white" : "bg-slate-400"
                    }`}
                  />
                  Offline
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Currently logged in as:</span>
              <span className="font-medium text-blue-700">
                {availability.counsellor?.name || "Counsellor"} ({availability.counsellor?.email})
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Current status:{" "}
                <strong
                  className={
                    availability.liveStatus === "ONLINE"
                      ? "text-emerald-700"
                      : availability.liveStatus === "AWAY"
                      ? "text-amber-700"
                      : "text-slate-700"
                  }
                >
                  {availability.liveStatus}
                </strong>
              </span>
            </div>
          </div>

          {/* Two-Column Grid: Weekly Schedule + Holiday / Leave Marking */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Weekly Schedule Grid (Takes 2 Columns on desktop) */}
            <div className="rounded-2xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Clock size={16} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Weekly Working Hours</h2>
                    <p className="text-xs text-slate-500">Set daily hours when you are available for student queries.</p>
                  </div>
                </div>

                <button
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingSchedule ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Schedule
                    </>
                  )}
                </button>
              </div>

              {/* Schedule Days List */}
              <div className="mt-4 divide-y divide-slate-100">
                {DAYS_OF_WEEK.map((day) => {
                  const dayConfig = scheduleState.find((s) => s.day === day) || {
                    day,
                    enabled: day !== "Sunday",
                    startTime: "09:00",
                    endTime: "18:00",
                  };

                  return (
                    <div
                      key={day}
                      className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={dayConfig.enabled}
                          onChange={() => handleScheduleToggle(day)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`day-${day}`}
                          className={`text-sm font-semibold cursor-pointer ${
                            dayConfig.enabled ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {day}
                        </label>
                      </div>

                      {dayConfig.enabled ? (
                        <div className="flex items-center gap-2 pl-7 sm:pl-0">
                          <input
                            type="time"
                            value={dayConfig.startTime || "09:00"}
                            onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="time"
                            value={dayConfig.endTime || "18:00"}
                            onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                      ) : (
                        <span className="pl-7 text-xs italic text-slate-400 sm:pl-0">
                          Unavailable / Day off
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Holiday / Leave Marking (Takes 1 Column) */}
            <div className="rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Palmtree size={16} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Leaves & Holidays</h2>
                    <p className="text-xs text-slate-500">Mark planned absences.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Leaves List */}
              <div className="mt-4 space-y-3">
                {availability.leaves && availability.leaves.length > 0 ? (
                  availability.leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="group flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{leave.title}</h4>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              leave.type === "HOLIDAY"
                                ? "bg-amber-100 text-amber-800"
                                : leave.type === "SICK"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {leave.type}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar size={12} />
                          <span>
                            {leave.startDate} {leave.endDate && leave.endDate !== leave.startDate ? `to ${leave.endDate}` : ""}
                          </span>
                        </div>
                        {leave.note && (
                          <p className="mt-1 text-[11px] text-slate-600 italic">"{leave.note}"</p>
                        )}
                      </div>

                      <button
                        onClick={() => setDeleteTargetLeave(leave)}
                        className="ml-2 rounded p-1 text-slate-400 opacity-80 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                        title="Remove leave"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
                    <CalendarDays size={28} className="text-slate-300" />
                    <p className="mt-2 text-xs font-semibold text-slate-700">No leaves marked</p>
                    <p className="text-[11px] text-slate-400">You are scheduled for standard working hours.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Mark Holiday or Leave</h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLeaveSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Reason / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Family Vacation / Public Holiday"
                  value={leaveForm.title}
                  onChange={(e) => setLeaveForm({ ...leaveForm, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    min={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Leave Type</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="HOLIDAY">Public Holiday</option>
                  <option value="LEAVE">Personal Leave</option>
                  <option value="VACATION">Vacation</option>
                  <option value="SICK">Sick Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional remarks for supervisor or team..."
                  value={leaveForm.note}
                  onChange={(e) => setLeaveForm({ ...leaveForm, note: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingLeave}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {addingLeave && <Loader2 size={13} className="animate-spin" />}
                  Save Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Delete Confirmation Modal */}
      {deleteTargetLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Do you really want to delete this leave?
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-800">"{deleteTargetLeave.title}"</strong> ({deleteTargetLeave.startDate} {deleteTargetLeave.endDate && deleteTargetLeave.endDate !== deleteTargetLeave.startDate ? `to ${deleteTargetLeave.endDate}` : ""}) from your scheduled leaves? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={Boolean(deletingLeaveId)}
                onClick={() => setDeleteTargetLeave(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingLeaveId)}
                onClick={handleConfirmDeleteLeave}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deletingLeaveId ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
