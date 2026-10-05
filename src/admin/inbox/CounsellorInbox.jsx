import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  MessageSquare,
  Inbox,
  Bot,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  Plus,
  Clock,
  PhoneCall,
  MessageCircle,
  Mic,
  CalendarCheck,
  Tag,
  Edit3,
  GraduationCap,
  Calendar,
  User,
  DollarSign,
  Building,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  listInboxConversationsRequest,
  getInboxConversationRequest,
  saveConversationFeedbackRequest,
} from "../../lib/authApi";

function getDefaultDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function getDefaultTime() {
  const n = new Date();
  let h = n.getHours();
  const m = String(n.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${m} ${ap}`;
}

function channelMeta(ch) {
  const c = String(ch || "website").toLowerCase();
  if (c.includes("call") || c.includes("phone"))
    return { label: "Call", icon: PhoneCall, color: "text-rose-500", bg: "bg-rose-50 border-rose-200" };
  if (c.includes("voice"))
    return { label: "Voice", icon: Mic, color: "text-violet-500", bg: "bg-violet-50 border-violet-200" };
  return { label: "Text", icon: MessageCircle, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" };
}

function deriveInterests(messages = [], lead = {}) {
  const s = new Set();
  const courses = Array.isArray(lead.coursesInterested)
    ? lead.coursesInterested
    : lead.coursesInterested
      ? [lead.coursesInterested]
      : [];
  courses.forEach((c) => c && s.add(String(c).trim()));
  if (lead.feesQuery && lead.feesQuery !== "—") s.add("Fee Structure");
  if (lead.hostelQuery && lead.hostelQuery !== "—") s.add("Hostel Facilities");

  const kw = [
    [["fee", "fees", "tuition", "cost", "scholarship"], "Fee Structure"],
    [["hostel", "accommodation", "residence"], "Hostel Facilities"],
    [["placement", "job", "campus", "package", "salary"], "Placement Support"],
    [["eligib", "criteria", "qualify", "entrance", "exam"], "Eligibility Criteria"],
    [["brochure", "prospectus", "syllabus", "curriculum"], "Brochure / Curriculum"],
    [["admission", "apply", "application", "registration", "deadline"], "Admission Process"],
    [["loan", "emi", "finance", "bank"], "Education Loan"],
    [["btech", "b.tech", "cse", "computer science", "engineering"], "B.Tech CSE"],
    [["mba", "management", "business"], "MBA"],
    [["bba", "bca", "mca"], "Management & Tech Programs"],
  ];
  const text = messages
    .filter((m) => m.role === "USER" || m.role === "LEAD")
    .map((m) => String(m.content || "").toLowerCase())
    .join(" ");

  for (const [keys, label] of kw) {
    if (keys.some((k) => text.includes(k))) s.add(label);
  }
  return Array.from(s).slice(0, 6);
}

function buildSummary(messages = [], leadName = "Student") {
  const um = messages.filter((m) => m.role === "USER" || m.role === "LEAD");
  const bm = messages.filter((m) => m.role !== "USER" && m.role !== "LEAD");
  if (!um.length) return "";
  const first = (um[0]?.content || "").slice(0, 120).replace(/\n/g, " ").trim();
  const last = um[um.length - 1]?.content || "";
  let s = `${leadName} initiated the conversation`;
  if (first.length > 5) s += ` inquiring about: "${first}${(um[0]?.content || "").length > 120 ? "..." : ""}"`;
  if (bm.length) s += ". Bot provided program details and addressed queries.";
  if (um.length > 1 && last !== um[0]?.content) {
    const sl = last.slice(0, 90).replace(/\n/g, " ").trim();
    s += ` Latest query: "${sl}${last.length > 90 ? "..." : ""}"`;
  }
  return s;
}

const AVATAR_COLORS = [
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-purple-500 to-pink-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-sky-500 to-cyan-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
];

function hashColor(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function getInitials(n = "") {
  const p = String(n || "Student").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "S";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function fmtRel(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  const s = Math.floor((Date.now() - dt) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${String(dt.getDate()).padStart(2, "0")} ${dt.toLocaleString("en-US", { month: "short" })}`;
}

function fmtTime(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_STYLES = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-purple-50 text-purple-700 border-purple-200",
  QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONVERTED: "bg-amber-50 text-amber-700 border-amber-200",
  LOST: "bg-rose-50 text-rose-700 border-rose-200",
  INTERESTED: "bg-teal-50 text-teal-700 border-teal-200",
};

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

const CHANNEL_OPTIONS = [
  { value: "website", label: "Text (Website)" },
  { value: "call", label: "Call" },
  { value: "voice", label: "Voice" },
  { value: "whatsapp", label: "WhatsApp" },
];

const SUGGESTED_TAGS = [
  "Fee Structure",
  "Hostel Facilities",
  "Placement Support",
  "Eligibility Criteria",
  "Admission Process",
  "Scholarship",
  "Education Loan",
  "Brochure / Curriculum",
  "B.Tech CSE",
  "MBA",
  "Entrance Exam",
  "Campus Visit",
];

export default function CounsellorInbox({ routerNavigate, onNavigate, userRole = "COUNSELLOR" }) {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const urlConversationId = searchParams.get("conversationId") || searchParams.get("id") || null;
  const urlChatbotId = searchParams.get("chatbotId") || null;

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedId, setSelectedId] = useState(() => {
    if (urlConversationId) return urlConversationId;
    try {
      return sessionStorage.getItem("solmento:inbox_selected_id") || null;
    } catch {
      return null;
    }
  });
  const [conversationDetail, setConversationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat' | 'details'
  const [showTabletDetails, setShowTabletDetails] = useState(false);

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [showTagDrop, setShowTagDrop] = useState(false);
  const [showAllPrev, setShowAllPrev] = useState(false);
  const msgEndRef = useRef(null);
  const selectedItemRef = useRef(null);

  const loadList = useCallback(
    (preferSel = null) => {
      setLoadingList(true);
      setListError(null);
      const p = {};
      if (statusFilter && statusFilter !== "all") p.status = statusFilter;
      if (urlChatbotId && urlChatbotId !== "all") p.chatbotId = urlChatbotId;
      const s = search.trim();
      if (s) p.search = s;

      listInboxConversationsRequest(p)
        .then((res) => {
          const rawList = res?.conversations || [];
          const seenIds = new Set();
          const list = [];
          for (const item of rawList) {
            const key = item.id || item.databaseId || item.public_id;
            if (key) {
              if (seenIds.has(String(key))) continue;
              seenIds.add(String(key));
            }
            list.push(item);
          }
          setConversations(list);
          if (list.length > 0) {
            let savedId = null;
            try {
              savedId = sessionStorage.getItem("solmento:inbox_selected_id");
            } catch { }
            const candidateId = preferSel || urlConversationId || selectedId || savedId;
            const matched = candidateId
              ? list.find(
                  (c) =>
                    String(c.id) === String(candidateId) ||
                    String(c.databaseId) === String(candidateId) ||
                    String(c.public_id) === String(candidateId) ||
                    String(c.visitorId) === String(candidateId) ||
                    String(c.visitor_id) === String(candidateId) ||
                    String(c.lead?.id) === String(candidateId),
                )
              : null;
            const sel = matched ? matched.id : (candidateId || list[0].id);
            setSelectedId(sel);
            try {
              sessionStorage.setItem("solmento:inbox_selected_id", sel);
            } catch { }
          } else if (urlConversationId) {
            setSelectedId(urlConversationId);
          } else {
            setSelectedId(null);
            setConversationDetail(null);
            try {
              sessionStorage.removeItem("solmento:inbox_selected_id");
            } catch { }
          }
        })
        .catch((e) => {
          setListError(e?.message || "Failed to load conversations.");
          setConversations([]);
          if (!urlConversationId) {
            setSelectedId(null);
          }
        })
        .finally(() => setLoadingList(false));
    },
    [statusFilter, search, urlChatbotId, urlConversationId, selectedId],
  );

  useEffect(() => {
    if (urlConversationId) {
      setSelectedId(urlConversationId);
      setMobileView("chat");
      try {
        sessionStorage.setItem("solmento:inbox_selected_id", urlConversationId);
      } catch { }
      loadList(urlConversationId);
    } else {
      loadList();
    }
  }, [urlConversationId, urlChatbotId]); // eslint-disable-line

  useEffect(() => {
    loadList(selectedId);
  }, [statusFilter]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => loadList(selectedId), 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  useEffect(() => {
    if (!selectedId) {
      setConversationDetail(null);
      setForm(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    setDetailError(null);
    getInboxConversationRequest(selectedId)
      .then((res) => {
        if (cancelled) return;
        setConversationDetail(res || null);
        if (res) initForm(res);
      })
      .catch((e) => {
        if (cancelled) return;
        setDetailError(e?.message || "Failed to load details.");
        setConversationDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]); // eslint-disable-line

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationDetail?.messages]);

  useEffect(() => {
    if (selectedId && !loadingList && conversations.length > 0) {
      const timer = setTimeout(() => {
        if (selectedItemRef.current) {
          selectedItemRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedId, loadingList, conversations.length]);

  function initForm(detail) {
    const lead = detail?.lead;
    const conv = detail?.conversation;
    const msgs = detail?.messages || [];
    const convDate = conv?.createdAt
      ? new Date(conv.createdAt).toISOString().slice(0, 10)
      : getDefaultDate();
    let convTime = getDefaultTime();
    if (conv?.createdAt) {
      const d = new Date(conv.createdAt);
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      convTime = `${String(h).padStart(2, "0")}:${m} ${ap}`;
    }
    setForm({
      conversationDate: convDate,
      conversationTime: convTime,
      channel: conv?.channel || "website",
      status: lead?.status || "CONTACTED",
      conversationSummary: buildSummary(msgs, lead?.name),
      keyInterests: deriveInterests(msgs, lead || {}),
      counsellorNotes: "",
      approachAgain: "no",
      followUpRequired: "no",
      nextFollowUpDate: "",
    });
    setFormError(null);
    setShowAllPrev(false);
  }

  const activeConvSummary = useMemo(
    () =>
      conversations.find(
        (c) =>
          String(c.id) === String(selectedId) ||
          String(c.databaseId) === String(selectedId) ||
          String(c.public_id) === String(selectedId) ||
          String(c.visitorId) === String(selectedId) ||
          String(c.visitor_id) === String(selectedId),
      ) || null,
    [conversations, selectedId],
  );
  const activeLead = conversationDetail?.lead || activeConvSummary?.lead || null;
  const activeConv = conversationDetail?.conversation || null;
  const msgs = conversationDetail?.messages || [];
  const convFeedbacks = activeLead?.conversationFeedbacks || [];
  const ch = channelMeta(activeConv?.channel || activeConvSummary?.channel);

  const handleOpenFeedbackModal = () => {
    if (conversationDetail) {
      initForm(conversationDetail);
    }
    setIsFeedbackModalOpen(true);
  };

  const upd = (field, val) => {
    setForm((prev) => (prev ? { ...prev, [field]: val } : prev));
    setFormError(null);
  };

  const addTag = (t) => {
    if (!t.trim()) return;
    setForm((p) => {
      if (!p) return p;
      const cur = Array.isArray(p.keyInterests) ? p.keyInterests : [];
      if (cur.includes(t.trim())) return p;
      return { ...p, keyInterests: [...cur, t.trim()] };
    });
    setTagInput("");
    setShowTagDrop(false);
  };

  const removeTag = (t) => {
    setForm((p) => (p ? { ...p, keyInterests: (p.keyInterests || []).filter((x) => x !== t) } : p));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !form) return;
    if (!form.conversationDate) {
      setFormError("Interaction date is required.");
      return;
    }
    if (!form.conversationTime) {
      setFormError("Interaction time is required.");
      return;
    }
    if (!form.conversationSummary?.trim()) {
      setFormError("Conversation summary is required.");
      return;
    }
    if (!form.status) {
      setFormError("Lead status is required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        conversationDate: form.conversationDate,
        conversationTime: form.conversationTime,
        channel: form.channel || "website",
        conversationSummary: form.conversationSummary.trim(),
        keyInterests: form.keyInterests || [],
        counsellorNotes: form.counsellorNotes?.trim() || "",
        feedback: form.conversationSummary.trim(),
        status: form.status,
        approachAgain: form.approachAgain === "yes",
        followUpRequired: form.followUpRequired === "yes",
        nextContactDate: form.followUpRequired === "yes" && form.nextFollowUpDate ? form.nextFollowUpDate : null,
        nextContactTime: null,
      };

      const res = await saveConversationFeedbackRequest(selectedId, payload);
      const upStatus = res?.leadStatus || form.status;

      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, lead: { ...c.lead, status: upStatus } } : c))
      );

      setSuccessToast(
        form.followUpRequired === "yes" && form.nextFollowUpDate
          ? `Feedback saved! Status: ${upStatus}. Follow-up scheduled for ${form.nextFollowUpDate}.`
          : `Feedback saved! Lead status: ${upStatus}.`
      );

      setIsFeedbackModalOpen(false);

      // Refresh conversation details to populate updated feedback list
      getInboxConversationRequest(selectedId).then((r) => {
        if (r) {
          setConversationDetail(r);
          initForm(r);
        }
      });
    } catch (err) {
      setFormError(err?.message || "Failed to save feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  const renderLeadDetailsContent = ({ isMobile = false, isTabletDrawer = false } = {}) => {
    if (!selectedId || !activeLead) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <User size={22} />
          </div>
          <p className="text-xs text-slate-400 max-w-[180px]">Select a conversation to view lead details.</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header: Student Name & Status + FEEDBACK BUTTON */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xs font-bold text-white shadow-sm ${hashColor(
                  activeLead.name
                )}`}
              >
                {getInitials(activeLead.name)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-950">{activeLead.name || "Student"}</h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${STATUS_STYLES[activeLead.status] || "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                  >
                    {activeLead.status || "NEW"}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Button - Prominent & Directly Accessible */}
            <button
              onClick={handleOpenFeedbackModal}
              id="btn-open-feedback-modal"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition shrink-0 cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Feedback</span>
            </button>
          </div>
        </div>

        {/* Scrollable lead details with independent vertical scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
          {/* Section 1: Contact Details */}
          <div className="p-4 space-y-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Details</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail size={13} />
                </div>
                <span className="truncate">{activeLead.email && activeLead.email !== "—" ? activeLead.email : "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Phone size={13} />
                </div>
                <span>{activeLead.phone && activeLead.phone !== "—" ? activeLead.phone : "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600">
                  <MapPin size={13} />
                </div>
                <span className="truncate">{activeLead.location && activeLead.location !== "—" ? activeLead.location : "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Lead Information / Academic Interest */}
          <div className="p-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lead Information</h4>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <GraduationCap size={12} className="text-blue-500" />
                  Interested Course
                </div>
                <div className="mt-1 font-semibold text-slate-800 truncate">
                  {Array.isArray(activeLead.coursesInterested)
                    ? activeLead.coursesInterested.join(", ")
                    : activeLead.coursesInterested || "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <DollarSign size={12} className="text-emerald-500" />
                  Fees Query
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${activeLead.feesQuery && activeLead.feesQuery !== "—" && activeLead.feesQuery !== "No"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {activeLead.feesQuery || "No"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <Building size={12} className="text-purple-500" />
                  Hostel Query
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${activeLead.hostelQuery && activeLead.hostelQuery !== "—" && activeLead.hostelQuery !== "No"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {activeLead.hostelQuery || "No"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <Calendar size={12} className="text-amber-500" />
                  Preferred Intake
                </div>
                <div className="mt-1 font-semibold text-slate-800 truncate">
                  {activeLead.preferredIntake || "2026"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <Tag size={12} className="text-indigo-500" />
                  Lead Source
                </div>
                <div className="mt-1 font-semibold text-slate-800 capitalize truncate">
                  {activeLead.source || "Website Chatbot"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <User size={12} className="text-cyan-500" />
                  Assigned To
                </div>
                <div className="mt-1 font-semibold text-slate-800 truncate">
                  {activeLead.assignedTo?.name || "Unassigned"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Previous Feedback History for this conversation */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                Previous Feedback
                <span className="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                  {convFeedbacks.length}
                </span>
              </h4>
              {convFeedbacks.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllPrev((v) => !v)}
                  className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  {showAllPrev ? "Show Less" : "View All"}
                </button>
              )}
            </div>

            {convFeedbacks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3.5 text-center">
                <p className="text-[11px] text-slate-500 font-medium">No feedback recorded yet.</p>
                <p className="mt-0.5 text-[10px] text-slate-400">Click &quot;Feedback&quot; above to log the conversation outcome.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(showAllPrev ? convFeedbacks : convFeedbacks.slice(0, 2)).map((fb, idx) => {
                  const fCh = channelMeta(fb.channel || "website");
                  return (
                    <div
                      key={fb.id || idx}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-[11px] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-800">
                          {fmtDate(fb.conversationDate)}
                          {fb.conversationTime ? ` · ${fb.conversationTime}` : ""}
                        </span>
                        {fb.status && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${STATUS_STYLES[fb.status] || "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                          >
                            {fb.status}
                          </span>
                        )}
                      </div>

                      {fb.conversationSummary && (
                        <p className="text-slate-700 leading-relaxed break-words">{fb.conversationSummary}</p>
                      )}

                      {fb.keyInterests && fb.keyInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {fb.keyInterests.map((ki) => (
                            <span
                              key={ki}
                              className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700"
                            >
                              {ki}
                            </span>
                          ))}
                        </div>
                      )}

                      {fb.counsellorNotes && (
                        <p className="text-slate-500 italic text-[10px] bg-white rounded-lg p-1.5 border border-slate-100">
                          <span className="font-semibold not-italic text-slate-600">Note:</span> {fb.counsellorNotes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                        <span className={`flex items-center gap-1 font-medium ${fCh.color}`}>
                          <fCh.icon size={9} />
                          {fCh.label}
                          {fb.followUpRequired ? ` · Follow-up: ${fb.nextContactDate || "Scheduled"}` : ""}
                        </span>
                        <span>{fb.counsellorName || "Counsellor"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2.5 sm:gap-3 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 truncate">
              {userRole === "ADMIN" || userRole === "SUPERADMIN" ? "Admin Inbox" : "Counsellor Inbox"}
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 shrink-0">
              {conversations.length} {conversations.length === 1 ? "Conversation" : "Conversations"}
            </span>
          </div>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-none">
            Real-time conversation stream, lead details, and structured interaction feedback.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadList(selectedId)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loadingList ? "animate-spin text-blue-600" : "text-slate-500"} />
            <span>Refresh</span>
          </button>
          {activeLead?.id && (
            <button
              onClick={() => {
                if (routerNavigate) routerNavigate(`/app/leads/students/${activeLead.id}`);
                else if (onNavigate) onNavigate("studentLeadDetails");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition cursor-pointer"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Full Lead Profile</span>
              <span className="sm:hidden">Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="relative flex min-h-0 flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* PANEL 1 (LEFT): Conversation List */}
        <section
          className={`flex-col border-r border-slate-200 bg-white min-h-0 overflow-hidden ${
            mobileView === "list" ? "flex w-full" : "hidden"
          } lg:flex lg:w-72 xl:w-80 lg:shrink-0`}
        >
          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="mt-2 flex items-center gap-1">
              {[
                { id: "all", label: "All" },
                { id: "open", label: "Open" },
                { id: "closed", label: "Closed" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setStatusFilter(t.id)}
                  className={`flex-1 rounded-lg py-1 text-[11px] font-semibold transition cursor-pointer ${statusFilter === t.id ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100/80">
            {loadingList ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Loading conversations...
              </div>
            ) : listError ? (
              <div className="p-4 text-center">
                <AlertCircle className="mx-auto h-5 w-5 text-rose-500" />
                <p className="mt-2 text-xs text-rose-600">{listError}</p>
                <button onClick={() => loadList()} className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                  Retry
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <Inbox size={24} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800">No conversations</h3>
                <p className="mt-1 text-xs text-slate-400 max-w-[200px]">
                  When assigned student leads converse, they appear here.
                </p>
              </div>
            ) : (
              conversations.map((item) => {
                const isSel =
                  String(item.id) === String(selectedId) ||
                  String(item.databaseId) === String(selectedId) ||
                  String(item.public_id) === String(selectedId);
                return (
                  <button
                    key={item.id}
                    ref={isSel ? selectedItemRef : null}
                    id={`inbox-conv-${item.id}`}
                    onClick={() => {
                      setSelectedId(item.id);
                      setMobileView("chat");
                      try {
                        sessionStorage.setItem("solmento:inbox_selected_id", item.id);
                      } catch { }
                      if (routerNavigate) {
                        routerNavigate(`/app/inbox?conversationId=${encodeURIComponent(item.id)}`, { replace: true });
                      }
                    }}
                    className={`w-full text-left p-3 flex items-start gap-2.5 hover:bg-slate-50/80 transition cursor-pointer ${isSel ? "bg-blue-50/80 border-l-[3px] border-l-blue-600" : "border-l-[3px] border-l-transparent"
                      }`}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white shadow-xs ${hashColor(
                        item.lead?.name || item.id
                      )}`}
                    >
                      {getInitials(item.lead?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-bold text-slate-900">{item.lead?.name || "Student"}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{fmtRel(item.lastActivityTime)}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{item.lastMessage}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {item.lead?.status && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${STATUS_STYLES[item.lead.status] || "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                          >
                            {item.lead.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* PANEL 2 (CENTER): Message Thread */}
        <section
          className={`flex-col bg-slate-50/40 min-h-0 overflow-hidden min-w-0 ${
            mobileView === "chat" ? "flex w-full" : "hidden"
          } lg:flex lg:flex-1 lg:border-r lg:border-slate-200`}
        >
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <MessageSquare size={26} />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-800">Select a conversation</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                Select a student on the left to read their chat history and view details.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs shrink-0 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button to List (< lg) */}
                  <button
                    type="button"
                    onClick={() => setMobileView("list")}
                    className="lg:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
                    aria-label="Back to conversations list"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span
                    className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-xs ${hashColor(
                      activeLead?.name || selectedId
                    )}`}
                  >
                    {getInitials(activeLead?.name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-xs sm:text-sm font-bold text-slate-950">{activeLead?.name || "Student"}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {activeLead?.status && (
                    <span
                      className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold border ${STATUS_STYLES[activeLead.status] || "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                    >
                      {activeLead.status}
                    </span>
                  )}

                  {/* Mobile Details Button (< lg) */}
                  <button
                    type="button"
                    onClick={() => setMobileView("details")}
                    className="lg:hidden flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                  >
                    <User size={13} className="text-blue-600" />
                    <span>Details</span>
                  </button>

                  {/* Tablet Details Drawer Toggle (lg to xl) */}
                  <button
                    type="button"
                    onClick={() => setShowTabletDetails(true)}
                    className="hidden lg:flex xl:hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                  >
                    <User size={13} className="text-blue-600" />
                    <span>Lead Details</span>
                  </button>
                </div>
              </div>

              {/* Date separator */}
              {activeConv?.createdAt && (
                <div className="flex justify-center py-2 shrink-0">
                  <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-slate-500">
                    {fmtDate(activeConv.createdAt)}
                  </span>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-2 space-y-3">
                {loadingDetail ? (
                  <div className="flex h-40 items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    Loading conversation...
                  </div>
                ) : detailError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs text-rose-700">
                    <AlertCircle className="mx-auto h-4 w-4" />
                    <p className="mt-1">{detailError}</p>
                  </div>
                ) : msgs.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-xs text-slate-400">
                    <MessageSquare size={20} className="text-slate-300" />
                    <p className="mt-2">No messages recorded in this conversation.</p>
                  </div>
                ) : (
                  msgs.map((msg, idx) => {
                    const isUser = msg.role === "USER" || msg.role === "LEAD";
                    return (
                      <div key={msg.id || idx} className={`flex items-end gap-2 ${isUser ? "justify-start" : "justify-end"}`}>
                        {isUser && (
                          <span
                            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white shadow-xs ${hashColor(
                              activeLead?.name
                            )}`}
                          >
                            {getInitials(activeLead?.name)}
                          </span>
                        )}
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${isUser
                            ? "rounded-bl-sm bg-white border border-slate-200/80 text-slate-800"
                            : "rounded-br-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                            }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div
                            className={`mt-1 flex items-center justify-end text-[9px] ${isUser ? "text-slate-400" : "text-blue-200/90"
                              }`}
                          >
                            {fmtTime(msg.timestamp)}
                          </div>
                        </div>
                        {!isUser && (
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xs">
                            <Bot size={12} />
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Footer Notice */}
              <div className="border-t border-slate-200 bg-white px-3 sm:px-4 py-2 text-center shrink-0">
                <p className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
                  <Sparkles size={12} className="text-blue-600 shrink-0" />
                  <span>Synchronized from admissions chatbot. Read-only message thread.</span>
                </p>
              </div>
            </>
          )}
        </section>

        {/* PANEL 3 (RIGHT): Desktop Lead Details (>= 1200px / xl) */}
        <aside className="hidden xl:flex w-80 xl:w-96 shrink-0 flex-col bg-white min-h-0 overflow-hidden">
          {renderLeadDetailsContent()}
        </aside>

        {/* MOBILE LEAD DETAILS PANEL (< 992px when mobileView === 'details') */}
        <section
          className={`flex-col bg-white min-h-0 overflow-hidden w-full ${
            mobileView === "details" ? "flex" : "hidden"
          } lg:hidden`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-3 py-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileView("chat")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
            >
              <ChevronLeft size={16} />
              <span>Back to Chat</span>
            </button>
            <span className="text-xs font-bold text-slate-800">Lead Details</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {renderLeadDetailsContent({ isMobile: true })}
          </div>
        </section>

        {/* TABLET LEAD DETAILS DRAWER (992px to 1199px) */}
        {showTabletDetails && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 xl:hidden animate-in fade-in duration-150"
              onClick={() => setShowTabletDetails(false)}
            />
            <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col min-h-0 animate-in slide-in-from-right duration-200 xl:hidden">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <User size={16} className="text-blue-600 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-900 truncate">Lead Details & Feedback</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTabletDetails(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {renderLeadDetailsContent({ isTabletDrawer: true })}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* FEEDBACK MODAL OVERLAY */}
      {isFeedbackModalOpen && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Conversation Feedback</h3>
                  <p className="text-xs text-slate-500">
                    {activeLead?.name || "Student"} · {ch.label} Conversation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {formError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Row 1: Date / Time / Channel */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.conversationDate}
                      onChange={(e) => upd("conversationDate", e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="02:15 PM"
                      value={form.conversationTime}
                      onChange={(e) => upd("conversationTime", e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Channel
                    </label>
                    <select
                      value={form.channel}
                      onChange={(e) => upd("channel", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {CHANNEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Lead Status / Outcome */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Lead Status / Outcome <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => upd("status", o.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${form.status === o.value
                          ? (STATUS_STYLES[o.value] || "bg-slate-100 text-slate-600 border-slate-200") +
                          " ring-2 ring-offset-1 ring-blue-500"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 3: Conversation Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Conversation Summary <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Contextual from chat</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Summarize what was discussed with the student..."
                    value={form.conversationSummary}
                    onChange={(e) => upd("conversationSummary", e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed resize-none"
                  />
                </div>

                {/* Row 4: Key Student Interests / Queries */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Key Student Interests / Queries
                  </label>
                  {(form.keyInterests || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.keyInterests.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-400 hover:text-rose-600 transition"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type interest or select below..."
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowTagDrop(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                        onFocus={() => setShowTagDrop(true)}
                        onBlur={() => setTimeout(() => setShowTagDrop(false), 180)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => addTag(tagInput)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>

                    {showTagDrop && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 max-h-36 overflow-y-auto">
                        {SUGGESTED_TAGS.filter(
                          (s) =>
                            !form.keyInterests?.includes(s) &&
                            (!tagInput || s.toLowerCase().includes(tagInput.toLowerCase()))
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onMouseDown={() => addTag(s)}
                            className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                          >
                            <Tag size={11} className="text-slate-400" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 5: Counsellor Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Counsellor Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Internal observations, student constraints, commitments..."
                    value={form.counsellorNotes}
                    onChange={(e) => upd("counsellorNotes", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 leading-relaxed resize-none"
                  />
                </div>

                {/* Row 6: Approach Again + Follow-up Required */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Approach Again?
                    </label>
                    <div className="flex gap-2">
                      {["yes", "no"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => upd("approachAgain", v)}
                          className={`flex-1 rounded-xl py-2 text-xs font-semibold border capitalize transition ${form.approachAgain === v
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Follow-up Required?
                    </label>
                    <div className="flex gap-2">
                      {["yes", "no"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => upd("followUpRequired", v)}
                          className={`flex-1 rounded-xl py-2 text-xs font-semibold border capitalize transition ${form.followUpRequired === v
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 7: Next Follow-up Date (if follow-up required) */}
                {form.followUpRequired === "yes" && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 animate-in fade-in duration-150">
                    <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1.5">
                      Next Follow-up Date
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarCheck size={16} className="text-emerald-600 shrink-0" />
                      <input
                        type="date"
                        value={form.nextFollowUpDate}
                        onChange={(e) => upd("nextFollowUpDate", e.target.value)}
                        className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200 bg-slate-50/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  id="btn-modal-save-feedback"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xl animate-in slide-in-from-bottom-3 duration-200 max-w-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="flex-1">{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-800">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
