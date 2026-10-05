import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";
import { listFollowUpsRequest, createFollowUpRequest } from "../../lib/authApi";
import { showToast } from "../../lib/toast";

export default function CreateFollowUp({
  onNavigate,
  routerNavigate,
  userRole,
  permissions = [],
}) {
  const canCreateFollowUp =
    userRole === "ADMIN" ||
    (Array.isArray(permissions) && permissions.includes("follow_ups.create"));

  const [loadingLeads, setLoadingLeads] = useState(true);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    leadId: "",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00 AM",
    purpose: "",
  });

  const handleBack = () => {
    if (routerNavigate) {
      routerNavigate("/app/leads/follow-ups");
    } else if (onNavigate) {
      onNavigate("followUps");
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoadingLeads(true);
        const res = await listFollowUpsRequest();
        if (isMounted) {
          if (res?.data?.assignedLeads) {
            setAssignedLeads(res.data.assignedLeads);
          } else if (res?.assignedLeads) {
            setAssignedLeads(res.assignedLeads);
          }
        }
      } catch (err) {
        console.error("Failed to load assigned leads for follow-up:", err);
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
    if (!canCreateFollowUp) {
      setError("You do not have permission to schedule follow-ups.");
      return;
    }
    if (!formData.leadId) {
      setError("Please select an assigned student lead.");
      return;
    }
    if (!formData.date) {
      setError("Please specify a follow-up date.");
      return;
    }
    if (!formData.purpose.trim()) {
      setError("Please provide notes or purpose for the follow-up.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await createFollowUpRequest({
        leadId: formData.leadId,
        date: formData.date,
        time: formData.time || "10:00 AM",
        purpose: formData.purpose.trim(),
      });
      showToast.success("Follow-up scheduled successfully.");
      handleBack();
    } catch (err) {
      console.error("Failed to schedule follow-up:", err);
      const msg = err?.message || "Failed to schedule follow-up. Please try again.";
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
            <CalendarDays size={15} /> Follow-ups
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-normal text-slate-500">Schedule Follow-up</span>
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Schedule Follow-up
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Set a reminder to follow up with an assigned student lead.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer sm:self-auto"
          >
            <ArrowLeft size={14} /> Back to Follow-ups
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

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Follow-up Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Follow-up Time
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM or 15:00"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Purpose / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Purpose / Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="What needs to be discussed? (e.g. Follow up on fee structure, admission status, documents required)"
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              required
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
            disabled={submitting || !canCreateFollowUp}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <CalendarDays size={16} />
                <span>Schedule Follow-up</span>
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
