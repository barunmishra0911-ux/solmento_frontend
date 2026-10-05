import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
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
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import leadDashboardData from "./leadDashboardData";
import { getStudentLeadRequest } from "../lib/authApi";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

const statusStyles = {
  New: "bg-blue-50 text-blue-700 border border-blue-100",
  Contacted: "bg-purple-50 text-purple-700 border border-purple-100",
  Qualified: "bg-green-50 text-green-700 border border-green-100",
  Converted: "bg-orange-50 text-orange-700 border border-orange-100",
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
    Icon: BarChart3,
    tone: "text-blue-500",
    bgTone: "bg-blue-50",
  },
  Location: { Icon: MapPin, tone: "text-red-500", bgTone: "bg-red-50" },
  "Additional Notes": {
    Icon: Star,
    tone: "text-purple-500",
    bgTone: "bg-purple-50",
  },
};

const avatarColors = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-sky-400 to-blue-600",
];

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(Number(d))) return String(value);
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  const formattedHours = hh % 12 || 12;
  return `${formattedHours}:${mm} ${ampm}`;
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
    website_widget: "Website",
    website: "Website",
    whatsapp: "WhatsApp",
    social_media: "Social Media",
    instagram: "Social Media",
    facebook: "Social Media",
    direct: "Direct",
    referral: "Referral",
    referal: "Referral",
    unknown: "Website",
  };
  const key = String(value || "website").toLowerCase().replace(/[\s_-]+/g, "_");
  return map[key] || (value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : "Website");
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

export default function LeadDetailReadOnly({
  leadId: propLeadId,
  data = leadDashboardData,
  onNavigate,
  routerNavigate,
}) {
  const { id: routeId } = useParams() || {};
  const { pathname } = useLocation();
  const pathId = pathname.match(/^\/app\/leads\/([^/?#]+)/)?.[1] || "";
  const leadId = propLeadId || routeId || pathId || "";

  const [livePayload, setLivePayload] = useState(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState(null);

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

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [leadId]);

  const { lead, messages } = useMemo(() => {
    if (liveLoading) {
      return {
        lead: {
          name: "Loading…",
          initials: "…",
          status: "New",
          source: "Website",
          lastActivity: "Recently",
          avatarColorIdx: 0,
          keyInfoFields: [
            ["Name", "Loading…"],
            ["Email", "Loading…"],
            ["Phone", "Loading…"],
            ["Interested Course", "Loading…"],
            ["Fees Query", "Loading…"],
            ["Hostel Query", "Loading…"],
            ["Hostel Fees", "Loading…"],
            ["Location", "Loading…"],
          ],
          additionalNotes: "Loading…",
        },
        messages: [],
      };
    }

    if (!livePayload?.lead) {
      return {
        lead: {
          name: "Lead not found",
          initials: "—",
          status: "New",
          source: "Website",
          lastActivity: "Recently",
          avatarColorIdx: 0,
          keyInfoFields: [
            ["Name", "Not provided"],
            ["Email", "Not provided"],
            ["Phone", "Not provided"],
            ["Interested Course", "Not provided"],
            ["Fees Query", "Not provided"],
            ["Hostel Query", "Not provided"],
            ["Hostel Fees", "Not provided"],
            ["Location", "Not provided"],
          ],
          additionalNotes: "Not provided",
        },
        messages: [],
      };
    }

    const rawLead = livePayload.lead;
    const rawMessages = livePayload.messages || [];
    const leadName = rawLead.keyInfo?.name || rawLead.name || `Lead ${String(rawLead.id).slice(0, 6)}`;
    const normalizedStatus = normalizeStatus(rawLead.status);
    const normalizedSource = formatSource(rawLead.source);

    const keyInfoFields = [
      ["Name", rawLead.keyInfo?.name || rawLead.name || "Not provided"],
      ["Email", rawLead.keyInfo?.email || rawLead.email || "Not provided"],
      ["Phone", rawLead.keyInfo?.phone || rawLead.phone || "Not provided"],
      ["Interested Course", formatCourses(rawLead.keyInfo?.coursesInterested)],
      ["Fees Query", formatYesNo(rawLead.keyInfo?.feesQuery)],
      ["Hostel Query", formatYesNo(rawLead.keyInfo?.hostelQuery)],
      ["Hostel Fees", rawLead.keyInfo?.hostelQuery ? "Requested" : "Not provided"],
      ["Location", rawLead.keyInfo?.location || "Not provided"],
    ];

    const mappedMessages = rawMessages.map((m, idx) => {
      const isLead = m.role === "USER" || m.role === "lead";
      return {
        id: m.id || `msg-${idx}`,
        role: isLead ? "lead" : "assistant",
        text: m.content || "—",
        time: formatDateTime(m.timestamp || m.createdAt || m.created_at),
      };
    });

    return {
      lead: {
        id: rawLead.id,
        name: leadName,
        initials: getInitials(leadName),
        status: normalizedStatus,
        source: normalizedSource,
        lastActivity: relativeTime(rawLead.updatedAt || rawLead.createdAt),
        avatarColorIdx: hashIndex(leadName, avatarColors.length),
        keyInfoFields,
        additionalNotes: rawLead.keyInfo?.additionalNotes || "Not provided",
      },
      messages: mappedMessages,
    };
  }, [livePayload, liveLoading]);

  const avatarColor =
    avatarColors[(lead?.avatarColorIdx ?? 0) % avatarColors.length] ||
    avatarColors[0];

  const handleBack = () => {
    if (routerNavigate) {
      routerNavigate("/app/leads/management");
    } else if (onNavigate) {
      onNavigate("leadManagement");
    }
  };

  return (
    <div className="flex flex-col text-slate-900 xl:h-[calc(100dvh-120px)] xl:max-h-[calc(100dvh-120px)]">
      <div className="mb-5 flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={handleBack}
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
                Lead Details – {lead?.name || "Lead"}
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
          onClick={handleBack}
          aria-label="Close details"
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition"
        >
          <X size={17} />
        </button>
      </div>

      <section className="grid min-h-0 flex-1 grid-cols-1 items-start gap-5 xl:grid-cols-[1.5fr_1fr] xl:h-full xl:max-h-full">
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
                Complete conversation history with the user.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-sm ring-2 ring-white ${avatarColor}`}
            >
              {lead?.initials || "RK"}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm text-slate-900">
                {lead?.name}
              </strong>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {lead?.source} · {lead?.lastActivity}
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                statusStyles[lead?.status] ||
                "bg-slate-50 text-slate-700 border border-slate-100"
              }`}
            >
              {lead?.status}
            </span>
          </div>
          {liveLoading ? (
            <div className="flex flex-1 min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Loading conversation…
            </div>
          ) : messages?.length ? (
            <div className="sidebar-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "lead" ? "justify-start" : "justify-end"
                  } gap-2`}
                >
                  {m.role === "lead" && (
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-white ${avatarColor}`}
                    >
                      {lead?.initials || "RK"}
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
                      m.role === "lead"
                        ? "rounded-tl-md bg-slate-100 text-slate-700"
                        : "rounded-tr-md bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-slate-700"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`mt-1 block text-[10px] ${
                        m.role === "lead" ? "text-slate-400" : "text-purple-400"
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                  {m.role === "assistant" && (
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

        <article
          className={`${cardClass} border-t-4 border-t-violet-500 min-w-0 p-5 self-start w-full`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">
                Key Information{" "}
                <span className="font-semibold text-blue-600">(40%)</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Important details extracted from conversation.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              <Edit3 size={13} /> Edit Details
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {lead.keyInfoFields.map(([label, value]) => {
              const cfg = infoFieldIcons[label] || {
                Icon: Target,
                tone: "text-slate-500",
                bgTone: "bg-slate-50",
              };
              const { Icon, tone, bgTone } = cfg;
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
                  <p className="ml-7 text-sm leading-5 text-slate-700 break-words">
                    {(label === "Fees Query" || label === "Hostel Query") &&
                    value === "Yes" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={10} className="mr-1" />
                        {value}
                      </span>
                    ) : (
                      value || "Not provided"
                    )}
                  </p>
                </div>
              );
            })}
            <div className="min-w-0 sm:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="grid h-5 w-5 place-items-center rounded bg-purple-50">
                  <Star size={11} className="text-purple-500" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Additional Notes
                </span>
              </div>
              <p className="ml-7 text-sm leading-5 text-slate-700 break-words">
                {lead?.additionalNotes || "Not provided"}
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
