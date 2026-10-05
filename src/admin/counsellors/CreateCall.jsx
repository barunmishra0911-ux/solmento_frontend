import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneCall,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { listCallsRequest, createCallRequest } from "../../lib/authApi";
import { showToast } from "../../lib/toast";

export default function CreateCall({
  onNavigate,
  routerNavigate,
  userRole,
  permissions = [],
}) {
  const canCreateCall =
    userRole === "ADMIN" ||
    (Array.isArray(permissions) && permissions.includes("calls.create"));

  const [loadingLeads, setLoadingLeads] = useState(true);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    leadId: "",
    direction: "OUTBOUND",
    callDate: new Date().toISOString().slice(0, 10),
    callTime: "10:30 AM",
    durationMinutes: "5",
    status: "COMPLETED",
    outcome: "Interested",
    notes: "",
  });

  const handleBack = () => {
    if (routerNavigate) {
      routerNavigate("/app/calls");
    } else if (onNavigate) {
      onNavigate("calls");
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingLeads(true);
        const res = await listCallsRequest();
        if (isMounted) {
          if (res?.data?.assignedLeads) {
            setAssignedLeads(res.data.assignedLeads);
          } else if (res?.assignedLeads) {
            setAssignedLeads(res.assignedLeads);
          }
        }
      } catch (err) {
        console.error("Failed to load assigned leads for call:", err);
      } finally {
        if (isMounted) setLoadingLeads(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreateCall) {
      setError("You do not have permission to log calls.");
      return;
    }
    if (!formData.leadId) {
      setError("Please select an assigned student lead.");
      return;
    }
    if (!formData.callDate) {
      setError("Please specify a call date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const durationSec =
        formData.status === "MISSED" || formData.status === "SCHEDULED"
          ? 0
          : Math.max(0, parseInt(formData.durationMinutes, 10) * 60 || 0);

      await createCallRequest({
        leadId: formData.leadId,
        direction: formData.direction,
        callDate: formData.callDate,
        callTime: formData.callTime || "10:30 AM",
        durationSeconds: durationSec,
        status: formData.status,
        outcome: formData.outcome,
        notes: formData.notes.trim(),
      });

      showToast.success("Call record saved successfully.");
      handleBack();
    } catch (err) {
      console.error("Failed to log call:", err);
      const msg = err?.message || "Failed to log call. Please try again.";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 text-slate-900">
      {/* Header & Breadcrumbs */}
      <header className="flex flex-col gap-1 border-b border-blue-100 pb-5">
        <nav
          aria-label="Breadcrumb"
          className="mb-1 flex items-center gap-1.5 text-sm font-medium text-blue-600"
        >
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-700"
          >
            <Phone size={15} /> Calls
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-normal text-slate-500">Log Call Record</span>
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Log Call Record
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Record an outbound/inbound call or schedule an upcoming call with your student lead.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer sm:self-auto"
          >
            <ArrowLeft size={14} /> Back to Calls
          </button>
        </div>
      </header>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {error && (
          <div
            role="alert"
            className="mx-5 mt-5 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6 lg:mx-7"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5 p-5 sm:p-6 lg:p-7">
          {/* Student Lead Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Student Lead <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.leadId}
                onChange={(e) =>
                  setFormData({ ...formData, leadId: e.target.value })
                }
                required
                disabled={loadingLeads}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {loadingLeads
                    ? "Loading assigned leads..."
                    : "-- Choose Assigned Student Lead --"}
                </option>
                {assignedLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.course || "General"} • {lead.phone || "No phone"})
                  </option>
                ))}
              </select>
            </div>
            {!loadingLeads && assignedLeads.length === 0 && (
              <p className="mt-1.5 text-xs text-amber-600">
                No leads are currently assigned to you.
              </p>
            )}
          </div>

          {/* Direction & Call Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Direction
              </label>
              <select
                value={formData.direction}
                onChange={(e) =>
                  setFormData({ ...formData, direction: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="OUTBOUND">Outbound (We called student)</option>
                <option value="INBOUND">Inbound (Student called us)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Call Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled / Upcoming</option>
                <option value="MISSED">Missed / Unanswered</option>
                <option value="BUSY">Busy / Rejected</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.callDate}
                onChange={(e) =>
                  setFormData({ ...formData, callDate: e.target.value })
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Time
              </label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM or 14:15"
                value={formData.callTime}
                onChange={(e) =>
                  setFormData({ ...formData, callTime: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duration & Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationMinutes: e.target.value,
                  })
                }
                disabled={
                  formData.status === "MISSED" || formData.status === "SCHEDULED"
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Disposition / Outcome
              </label>
              <select
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Interested">Interested</option>
                <option value="Callback Requested">Callback Requested</option>
                <option value="Admission Query">Admission Query</option>
                <option value="Fee Structure Discussed">Fee Structure Discussed</option>
                <option value="Enrolled">Enrolled / Confirmed</option>
                <option value="Not Reachable">Not Reachable</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Call Summary & Notes
            </label>
            <textarea
              rows={4}
              placeholder="Key points discussed during the consultation..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !canCreateCall}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <PhoneCall size={16} />
                <span>Save Call Record</span>
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
