import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Star,
  Target,
  UsersRound,
  X,
  Bot,
  Filter,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import studentLeadsData from "./studentLeadsData";
import { getStudentLeadRequest, updateStudentLeadRequest } from "../lib/authApi";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

const statusStyles = {
  New: "bg-blue-50 text-blue-700 border border-blue-100",
  Contacted: "bg-purple-50 text-purple-700 border border-purple-100",
  Qualified: "bg-green-50 text-green-700 border border-green-100",
  Converted: "bg-orange-50 text-orange-700 border border-orange-100",
  Lost: "bg-rose-50 text-rose-700 border border-rose-100",
};

const infoFieldIcons = {
  Name: { Icon: UsersRound, tone: "text-blue-500", bgTone: "bg-blue-50" },
  Email: { Icon: Mail, tone: "text-blue-500", bgTone: "bg-blue-50" },
  Phone: { Icon: Phone, tone: "text-blue-500", bgTone: "bg-blue-50" },
  "Interested Course": {
    Icon: Target,
    tone: "text-green-500",
    bgTone: "bg-green-50",
  },
  "Fees Query": { Icon: Filter, tone: "text-green-500", bgTone: "bg-green-50" },
  "Hostel Query": {
    Icon: Target,
    tone: "text-green-500",
    bgTone: "bg-green-50",
  },
  "Hostel Fees": {
    Icon: Filter,
    tone: "text-green-500",
    bgTone: "bg-green-50",
  },
  "Preferred Intake": {
    Icon: Target,
    tone: "text-blue-500",
    bgTone: "bg-blue-50",
  },
  "Lead Source": { Icon: Target, tone: "text-blue-500", bgTone: "bg-blue-50" },
  Location: { Icon: MapPin, tone: "text-red-500", bgTone: "bg-red-50" },
  Status: { Icon: Target, tone: "text-blue-500", bgTone: "bg-blue-50" },
  "Additional Notes": {
    Icon: Star,
    tone: "text-purple-500",
    bgTone: "bg-purple-50",
  },
  "Created On": {
    Icon: UsersRound,
    tone: "text-blue-500",
    bgTone: "bg-blue-50",
  },
  "Assigned To": {
    Icon: UsersRound,
    tone: "text-blue-500",
    bgTone: "bg-blue-50",
  },
};

function ChatConversation({ lead, messages, avatarColor, loading, error }) {
  return (
    <article
      className={`${cardClass} border-t-4 border-t-blue-500 flex h-[540px] xl:h-full max-h-full min-h-0 min-w-0 flex-col overflow-hidden`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="font-bold text-slate-950">
            Chat Conversation{" "}
            <span className="font-semibold text-blue-600">(60%)</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Complete conversation history with the student.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-sm ring-2 ring-white ${avatarColor}`}
        >
          {lead.initials}
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm text-slate-900">
            {lead.name}
          </strong>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {lead.source} · {lead.lastActivity}
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[lead.status] ||
            "bg-slate-50 text-slate-700 border border-slate-100"
            }`}
        >
          {lead.status}
        </span>
      </div>
      {loading ? (
        <div className="flex flex-1 min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          Loading conversation…
        </div>
      ) : error ? (
        <div className="flex flex-1 min-h-40 items-center justify-center gap-2 px-5 text-sm text-rose-600">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : messages?.length ? (
        <div className="sidebar-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "lead" ? "justify-start" : "justify-end"
                } gap-2`}
            >
              {message.role === "lead" && (
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white ${avatarColor}`}
                >
                  {lead.initials}
                </span>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${message.role === "lead"
                  ? "rounded-tl-md bg-slate-100 text-slate-700"
                  : "rounded-tr-md bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-slate-700"
                  }`}
              >
                <p>{message.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${message.role === "lead"
                    ? "text-slate-400"
                    : "text-purple-400"
                    }`}
                >
                  {message.time}
                </span>
              </div>
              {message.role === "assistant" && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-sm ring-2 ring-white">
                  <Bot size={14} />
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 p-5 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
          No conversation messages yet
        </div>
      )}
    </article>
  );
}

function KeyInformation({
  keyInfo,
  onSave,
  isSaving,
  saveSuccess,
  saveError,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        name: keyInfo["Name"] === "Not provided" ? "" : keyInfo["Name"] || "",
        email: keyInfo["Email"] === "Not provided" ? "" : keyInfo["Email"] || "",
        phone: keyInfo["Phone"] === "Not provided" ? "" : keyInfo["Phone"] || "",
        coursesInterested:
          keyInfo["Interested Course"] === "Not provided"
            ? ""
            : keyInfo["Interested Course"] || "",
        feesQuery: keyInfo["Fees Query"] || "Not provided",
        hostelQuery: keyInfo["Hostel Query"] || "Not provided",
        hostelFees:
          keyInfo["Hostel Fees"] === "Not provided"
            ? ""
            : keyInfo["Hostel Fees"] || "",
        preferredIntake:
          keyInfo["Preferred Intake"] === "Not provided"
            ? ""
            : keyInfo["Preferred Intake"] || "",
        location:
          keyInfo["Location"] === "Not provided"
            ? ""
            : keyInfo["Location"] || "",
        status: keyInfo["Status"] || "New",
        additionalNotes:
          keyInfo["Additional Notes"] === "Not provided"
            ? ""
            : keyInfo["Additional Notes"] || "",
      });
      setLocalError(null);
    }
  }, [keyInfo, isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setLocalError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalError(null);
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLocalError(null);
    try {
      await onSave?.(formData);
      setIsEditing(false);
    } catch (err) {
      setLocalError(err?.message || "Failed to save key information.");
    }
  };

  const entries = Object.entries(keyInfo);
  const isBadgeField = (label) =>
    label === "Fees Query" || label === "Hostel Query";
  const isReadOnlySystemField = (label) =>
    label === "Created On" || label === "Assigned To" || label === "Lead Source";

  return (
    <article
      className={`${cardClass} border-t-4 border-t-violet-500 min-w-0 p-5 self-start w-full transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-950">
            Key Information{" "}
            <span className="font-semibold text-blue-600">(40%)</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isEditing
              ? "Edit details and save directly to lead database."
              : "Important details extracted from conversation."}
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm"
          >
            <Edit3 size={13} />
            Edit Details
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check size={13} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {(saveSuccess || saveError || localError) && (
        <div className="mt-3">
          {saveSuccess && (
            <p className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
              <CheckCircle2 size={12} />
              Key Information saved successfully!
            </p>
          )}
          {(saveError || localError) && (
            <p className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 border border-rose-100">
              <AlertCircle size={12} />
              {saveError || localError}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 sm:grid-cols-2">
        {entries.map(([label, value]) => {
          const config = infoFieldIcons[label] || {
            Icon: Target,
            tone: "text-slate-500",
            bgTone: "bg-slate-50",
          };
          const { Icon, tone, bgTone } = config;
          const isStatus = label === "Status";

          return (
            <div key={label} className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`grid h-5 w-5 place-items-center rounded ${bgTone}`}
                >
                  <Icon size={11} className={tone} />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </span>
              </div>
              <div className="ml-7 text-sm leading-5 text-slate-700 break-words">
                {isEditing ? (
                  isReadOnlySystemField(label) ? (
                    <div className="text-xs text-slate-400 py-1 italic">
                      {value || "Not provided"}
                    </div>
                  ) : label === "Name" ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.name || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder="Student name"
                    />
                  ) : label === "Email" ? (
                    <input
                      type="email"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.email || ""}
                      onChange={(e) => handleFieldChange("email", e.target.value)}
                      placeholder="student@example.com"
                    />
                  ) : label === "Phone" ? (
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.phone || ""}
                      onChange={(e) => handleFieldChange("phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  ) : label === "Interested Course" ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.coursesInterested || ""}
                      onChange={(e) =>
                        handleFieldChange("coursesInterested", e.target.value)
                      }
                      placeholder="e.g. B.Tech, MCA"
                    />
                  ) : label === "Fees Query" ? (
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.feesQuery || "Not provided"}
                      onChange={(e) =>
                        handleFieldChange("feesQuery", e.target.value)
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not provided">Not provided</option>
                    </select>
                  ) : label === "Hostel Query" ? (
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.hostelQuery || "Not provided"}
                      onChange={(e) =>
                        handleFieldChange("hostelQuery", e.target.value)
                      }
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not provided">Not provided</option>
                    </select>
                  ) : label === "Hostel Fees" ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.hostelFees || ""}
                      onChange={(e) =>
                        handleFieldChange("hostelFees", e.target.value)
                      }
                      placeholder="e.g. Yes, No, Not provided"
                    />
                  ) : label === "Preferred Intake" ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.preferredIntake || ""}
                      onChange={(e) =>
                        handleFieldChange("preferredIntake", e.target.value)
                      }
                      placeholder="e.g. Fall 2026"
                    />
                  ) : label === "Location" ? (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.location || ""}
                      onChange={(e) =>
                        handleFieldChange("location", e.target.value)
                      }
                      placeholder="City or state"
                    />
                  ) : label === "Status" ? (
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.status || "New"}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Converted">Converted</option>
                      <option value="Lost">Lost</option>
                    </select>
                  ) : label === "Additional Notes" ? (
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={formData.additionalNotes || ""}
                      onChange={(e) =>
                        handleFieldChange("additionalNotes", e.target.value)
                      }
                      placeholder="Additional notes..."
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      value={value === "Not provided" ? "" : value || ""}
                      disabled
                    />
                  )
                ) : isStatus ? (
                  <div className="relative w-full max-w-[180px]">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                        statusStyles[value] ||
                        "bg-slate-50 text-slate-700 border border-slate-100"
                      } pr-7`}
                    >
                      {value}
                    </span>
                    <ChevronDown
                      size={12}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                ) : isBadgeField(label) && value === "Yes" ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 size={10} className="mr-1" />
                    {value}
                  </span>
                ) : isBadgeField(label) && value === "No" ? (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {value}
                  </span>
                ) : (
                  value || "Not provided"
                )}
              </div>
            </div>
          );
        })}
      </form>
    </article>
  );
}

function formatDate(value) {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(Number(d))) return String(value);
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(Number(d))) return String(value);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(d.getDate()).padStart(2, "0");
  const month = monthNames[d.getMonth()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${hh}:${mm}`;
}

function relativeTime(value) {
  if (!value) return "Recently";
  const d = new Date(value);
  const now = new Date();
  const diffMs = Number(now) - Number(d);
  if (Number.isNaN(diffMs) || diffMs < 0) return "Recently";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function formatSource(value) {
  const map = {
    website_widget: "Website Widget",
    website: "Website",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    direct: "Direct",
    referral: "Referral",
    referal: "Referral",
    unknown: "Unknown",
  };
  const key = String(value || "unknown").toLowerCase().replace(/[\s_-]+/g, "_");
  return map[key] || map[key.replace("_", "")] || map[key.replace(/_/g, "")] || (value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : "Unknown");
}

function formatCourses(value) {
  if (!value) return "Not provided";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  return String(value);
}

function formatYesNo(value) {
  if (value === null || value === undefined || value === "") return "Not provided";
  const s = String(value).toLowerCase().trim();
  if (s === "yes" || s === "true" || s === "1" || s === "y") return "Yes";
  if (s === "no" || s === "false" || s === "0" || s === "n") return "No";
  return String(value);
}

function normalizeStatus(value) {
  const s = String(value || "NEW").toUpperCase().trim();
  const map = {
    NEW: "New",
    CONTACTED: "Contacted",
    QUALIFIED: "Qualified",
    CONVERTED: "Converted",
    LOST: "Lost",
  };
  return map[s] || s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function hashIndex(name, colorsLength) {
  const s = String(name || "U");
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % Math.max(colorsLength, 1);
}

function getInitials(name) {
  const s = String(name || "U").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return s.charAt(0).toUpperCase();
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function StudentLeadDetails({
  leadId: propLeadId,
  data = studentLeadsData,
  onNavigate,
}) {
  const { id: routeId } = useParams() || {};
  const { pathname } = useLocation();
  const pathId = pathname.match(/^\/app\/leads\/students\/([^/?#]+)/)?.[1] || "";
  const leadId = propLeadId || routeId || pathId || "";
  const [livePayload, setLivePayload] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!leadId) {
      setLiveLoading(false);
      setLiveError("No lead ID specified.");
      setLivePayload(null);
      return;
    }
    let cancelled = false;
    setLiveLoading(true);
    setLiveError(null);
    setLivePayload(null);
    getStudentLeadRequest(leadId)
      .then((payload) => {
        if (cancelled) return;
        setLivePayload(payload || null);
      })
      .catch((error) => {
        if (cancelled) return;
        setLiveError(error?.message || "Unable to load lead details.");
        setLivePayload(null);
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const handleSaveKeyInfo = async (formData) => {
    if (!leadId) return;
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await updateStudentLeadRequest(leadId, formData);
      if (res?.lead) {
        setLivePayload((prev) => ({
          ...prev,
          lead: {
            ...prev.lead,
            ...res.lead,
            keyInfo: {
              ...(prev?.lead?.keyInfo || {}),
              ...(res.lead?.keyInfo || {}),
            },
          },
        }));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (err) {
      const msg = err?.message || "Failed to save key information.";
      setSaveError(msg);
      throw err;
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [leadId]);

  const avatarColors = data.avatarColors || [];

  const { detail, keyInfo, chatMessages, chatLoading, chatError } = useMemo(() => {
    if (liveLoading) {
      return {
        detail: null,
        keyInfo: {
          Name: "Loading…",
          Email: "Loading…",
          Phone: "Loading…",
          "Interested Course": "Loading…",
          "Fees Query": "Loading…",
          "Hostel Query": "Loading…",
          "Hostel Fees": "Loading…",
          "Preferred Intake": "Loading…",
          "Lead Source": "Loading…",
          Location: "Loading…",
          Status: "New",
          "Additional Notes": "Loading…",
          "Created On": "Loading…",
          "Assigned To": "Loading…",
        },
        chatMessages: [],
        chatLoading: true,
        chatError: null,
      };
    }
    if (!livePayload?.lead) {
      return {
        detail: null,
        keyInfo: {},
        chatMessages: [],
        chatLoading: false,
        chatError: liveError || "Lead not found.",
      };
    }
    const { lead, messages } = livePayload;
    const normalizedStatus = normalizeStatus(lead.status);
    const normalizedSource = formatSource(lead.source);
    const assignedToName = lead.assignedTo?.id ? lead.assignedTo.name : "Unassigned";
    const liveKeyInfo = {
      Name: lead.keyInfo?.name || lead.name || "Not provided",
      Email: lead.keyInfo?.email || lead.email || "Not provided",
      Phone: lead.keyInfo?.phone || lead.phone || "Not provided",
      "Interested Course": formatCourses(lead.keyInfo?.coursesInterested),
      "Fees Query": formatYesNo(lead.keyInfo?.feesQuery),
      "Hostel Query": formatYesNo(lead.keyInfo?.hostelQuery),
      "Hostel Fees": formatYesNo(lead.keyInfo?.hostelFees) || lead.keyInfo?.hostelFees || "Not provided",
      "Preferred Intake": lead.keyInfo?.preferredIntake || "Not provided",
      "Lead Source": normalizedSource,
      Location: lead.keyInfo?.location || "Not provided",
      Status: normalizedStatus,
      "Additional Notes": lead.keyInfo?.additionalNotes || "Not provided",
      "Created On": formatDate(lead.createdAt),
      "Assigned To": assignedToName,
    };
    const liveMessages = (messages || []).map((m, idx) => {
      const isLead = m.role === "USER" || m.role === "lead";
      return {
        id: m.id || `msg-${idx}`,
        role: isLead ? "lead" : "assistant",
        text: m.content || "—",
        time: formatDateTime(m.timestamp || m.createdAt || m.created_at),
      };
    });
    const detailShape = {
      id: lead.id,
      name: lead.keyInfo?.name || lead.name || `Lead ${String(lead.id).slice(0, 6)}`,
      initials: getInitials(lead.keyInfo?.name || lead.name || `Lead-${String(lead.id).slice(0, 4)}`),
      avatarColorIdx: hashIndex(lead.keyInfo?.name || lead.name || String(lead.id), avatarColors.length),
      status: normalizedStatus,
      source: normalizedSource,
      lastActivity: relativeTime(lead.updatedAt || lead.createdAt),
    };
    return {
      detail: detailShape,
      keyInfo: liveKeyInfo,
      chatMessages: liveMessages,
      chatLoading: false,
      chatError: null,
    };
  }, [livePayload, liveLoading, liveError, avatarColors]);

  const avatarColor =
    avatarColors[(detail?.avatarColorIdx ?? 0) % Math.max(avatarColors.length, 1)] ||
    avatarColors[0];

  return (
    <div className="flex flex-col text-slate-900 xl:h-[calc(100dvh-120px)] xl:max-h-[calc(100dvh-120px)]">
      <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate("studentLeads")}
            className="mb-2 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-start gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <UsersRound size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Lead Details – {detail?.name || "Student"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                View conversation history and key extracted information.
              </p>
              {liveError && !liveLoading && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-100">
                  <AlertCircle size={12} />
                  {liveError}
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate("studentLeads")}
          aria-label="Close details"
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition"
        >
          <X size={17} />
        </button>
      </div>

      <section className="grid min-h-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[1.5fr_1fr] xl:h-full xl:max-h-full">
        <ChatConversation
          lead={detail || { name: "Student", initials: "U", status: "New", source: "Unknown", lastActivity: "Recently" }}
          messages={chatMessages}
          avatarColor={avatarColor}
          loading={chatLoading}
          error={chatError}
        />
        <KeyInformation
          keyInfo={keyInfo || {}}
          onSave={handleSaveKeyInfo}
          isSaving={saveLoading}
          saveSuccess={saveSuccess}
          saveError={saveError}
        />
      </section>
    </div>
  );
}
