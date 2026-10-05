import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ContactRound,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { getStudentLeadRequest, updateStudentLeadRequest } from "../lib/authApi";
import { showToast } from "../lib/toast";

export default function EditLeadPage({ leadId, onNavigate, routerNavigate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleBack = () => {
    if (routerNavigate) {
      routerNavigate("/app/leads/management");
    } else if (onNavigate) {
      onNavigate("leadManagement");
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function loadLead() {
      if (!leadId) {
        setError("Invalid lead ID specified.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await getStudentLeadRequest(leadId);
        const lead = res?.lead || res;
        if (!lead || (!lead.id && !lead.name)) {
          throw new Error("Lead record not found.");
        }
        if (isMounted) {
          setFormData({
            name: lead.name === "—" ? "" : lead.name || "",
            email: lead.email === "—" ? "" : lead.email || "",
            phone: lead.phone === "—" ? "" : lead.phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to load lead:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load lead information.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLead();
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.name.trim()) {
      setError("Student Name is required.");
      showToast.error("Student Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };
      await updateStudentLeadRequest(leadId, payload);
      showToast.success("Lead updated successfully.");
      handleBack();
    } catch (err) {
      console.error("Failed to update lead:", err);
      const msg = err?.message || "Failed to update lead. Please try again.";
      setError(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 text-slate-900">
      {/* Header & Breadcrumbs */}
      <header className="flex flex-col gap-1 border-b border-blue-100 pb-5">
        <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-blue-600">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-700"
          >
            <ContactRound size={15} /> Lead Management
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="font-normal text-slate-500">Edit Lead</span>
        </nav>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Edit Lead
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">
              Update student lead information.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer sm:self-auto"
          >
            <ArrowLeft size={14} /> Back to Lead Management
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading lead details...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <User size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Lead Information
                </h2>
                <p className="text-xs text-slate-500">
                  Update primary contact details for this student lead.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Student Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Gourav Kumar"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="e.g. gourav@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
