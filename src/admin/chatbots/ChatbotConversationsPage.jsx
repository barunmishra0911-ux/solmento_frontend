import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  ExternalLink,
  Globe2,
  Inbox,
  LoaderCircle,
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  RotateCw,
  Search,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import {
  getChatbotBuilderRequest,
  getChatbotRequest,
  listInboxConversationsRequest,
} from "@/lib/authApi";
import { formatChatbotDisplayName } from "../../chatbot/widgetPosition";
import { showToast } from "../../lib/toast";

const numberFormat = new Intl.NumberFormat("en-IN");
const createdDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const avatarToneClasses = [
  "bg-purple-600 text-white",
  "bg-rose-500 text-white",
  "bg-blue-600 text-white",
  "bg-emerald-600 text-white",
  "bg-amber-500 text-white",
  "bg-indigo-600 text-white",
  "bg-pink-600 text-white",
  "bg-teal-600 text-white",
];

function getAvatarColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % avatarToneClasses.length;
  return avatarToneClasses[index];
}

function getInitials(name = "") {
  if (!name) return "VI";
  const clean = name.replace(/\(Deleted\)/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatActivityDate(dateString) {
  if (!dateString) return { date: "—", time: "—" };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { date: "—", time: "—" };

  const dateFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);

  const timeFormatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return { date: dateFormatted, time: timeFormatted };
}

function getDateRangeForPeriod(period) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (period === "today") {
    return { startDate: todayStr, endDate: todayStr };
  }
  if (period === "thisMonth") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    return { startDate: firstDay, endDate: lastDay };
  }
  if (period === "last7days") {
    const past = new Date(now);
    past.setDate(past.getDate() - 7);
    return { startDate: past.toISOString().slice(0, 10), endDate: todayStr };
  }
  if (period === "last30days") {
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    return { startDate: past.toISOString().slice(0, 10), endDate: todayStr };
  }
  return { startDate: undefined, endDate: undefined };
}

export default function ChatbotConversationsPage({
  chatbotId: propChatbotId,
  onNavigate,
  routerNavigate,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const chatbotId = propChatbotId || params.chatbotId || params.id;

  const [chatbot, setChatbot] = useState(null);
  const [logo, setLogo] = useState("");
  const [isLoadingChatbot, setIsLoadingChatbot] = useState(true);
  const [chatbotError, setChatbotError] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [allConversationsForMetrics, setAllConversationsForMetrics] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState(null);

  // Filters state
  const [datePeriod, setDatePeriod] = useState("thisMonth");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch Chatbot Details
  const fetchChatbotDetails = useCallback(async () => {
    if (!chatbotId) return;
    setIsLoadingChatbot(true);
    setChatbotError(null);
    try {
      const response = await getChatbotRequest(chatbotId);
      const data = response?.chatbot || response;
      setChatbot(data);

      try {
        const builder = await getChatbotBuilderRequest(chatbotId);
        const config = builder?.draftConfig?.logo
          ? builder.draftConfig
          : builder?.publishedConfig;
        if (typeof config?.logo === "string") setLogo(config.logo);
      } catch {
        // Logo fetch is optional
      }
    } catch (err) {
      setChatbotError(err?.message || "Failed to load chatbot details.");
    } finally {
      setIsLoadingChatbot(false);
    }
  }, [chatbotId]);

  // Fetch metrics data across the entire chatbot for the selected date period
  const fetchMetricsData = useCallback(async () => {
    if (!chatbotId) return;
    try {
      const { startDate, endDate } = getDateRangeForPeriod(datePeriod);
      const res = await listInboxConversationsRequest({
        chatbotId,
        startDate,
        endDate,
        limit: 500,
      });
      const list = Array.isArray(res?.conversations) ? res.conversations : [];
      setAllConversationsForMetrics(list);
    } catch {
      // Non-blocking for metrics
    }
  }, [chatbotId, datePeriod]);

  // Fetch Paginated Conversations List with Active Filters
  const fetchConversationsList = useCallback(async () => {
    if (!chatbotId) return;
    setIsLoadingList(true);
    setListError(null);
    try {
      const { startDate, endDate } = getDateRangeForPeriod(datePeriod);
      const res = await listInboxConversationsRequest({
        chatbotId,
        channel: channelFilter !== "all" ? channelFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        startDate,
        endDate,
        page,
        limit: perPage,
      });

      const list = Array.isArray(res?.conversations) ? res.conversations : [];
      setConversations(list);
      setTotalRecords(res?.pagination?.total ?? list.length);
    } catch (err) {
      setListError(err?.message || "Failed to load conversations.");
    } finally {
      setIsLoadingList(false);
    }
  }, [chatbotId, channelFilter, statusFilter, searchQuery, datePeriod, page, perPage]);

  // Initial Load
  useEffect(() => {
    fetchChatbotDetails();
  }, [fetchChatbotDetails]);

  // Load Conversations when filters/pagination change
  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  // Load Metrics
  useEffect(() => {
    fetchMetricsData();
  }, [fetchMetricsData]);

  // Handle Refresh Button
  const handleRefresh = () => {
    fetchChatbotDetails();
    fetchMetricsData();
    fetchConversationsList();
    showToast.success("Refreshed conversations.");
  };

  // KPI Calculations
  const kpiData = useMemo(() => {
    // When no search or sub-filters, use allConversationsForMetrics, fallback to conversations or chatbot count
    const pool =
      allConversationsForMetrics.length > 0
        ? allConversationsForMetrics
        : conversations;

    const total =
      allConversationsForMetrics.length > 0
        ? allConversationsForMetrics.length
        : totalRecords > 0
          ? totalRecords
          : chatbot?.conversationsThisMonth || 0;

    let activeCount = 0;
    let closedCount = 0;
    let anonCount = 0;

    if (pool.length > 0) {
      activeCount = pool.filter(
        (c) => String(c.status).toUpperCase() === "OPEN",
      ).length;
      closedCount = pool.filter(
        (c) => String(c.status).toUpperCase() === "CLOSED",
      ).length;
      anonCount = pool.filter(
        (c) => c.lead?.isAnonymous || !c.lead?.databaseId,
      ).length;
    } else if (total > 0) {
      activeCount = total;
    }

    const activePct =
      total > 0 ? ((activeCount / total) * 100).toFixed(1) : "0.0";
    const closedPct =
      total > 0 ? ((closedCount / total) * 100).toFixed(1) : "0.0";
    const anonPct =
      total > 0 ? ((anonCount / total) * 100).toFixed(1) : "0.0";

    return {
      total,
      activeCount,
      activePct,
      closedCount,
      closedPct,
      anonCount,
      anonPct,
    };
  }, [allConversationsForMetrics, conversations, totalRecords, chatbot]);

  const chatbotName = formatChatbotDisplayName(chatbot?.name || "Chatbot");
  const isActiveChatbot = chatbot?.status === "active";
  const createdDateStr = chatbot?.createdAt
    ? createdDateFormat.format(new Date(chatbot.createdAt))
    : "Recently";

  // Channel display for top summary card
  const primaryChannelName = useMemo(() => {
    if (!chatbot?.channels || chatbot.channels.length === 0)
      return "Website Widget";
    if (chatbot.channels.includes("website") && chatbot.channels.includes("whatsapp")) {
      return "Website & WhatsApp";
    }
    if (chatbot.channels.includes("whatsapp")) return "WhatsApp";
    return "Website Widget";
  }, [chatbot]);

  const handleOpenConversation = (convo) => {
    navigate(`/app/inbox?conversationId=${encodeURIComponent(convo.id)}`);
  };

  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const rangeStart = totalRecords > 0 ? (page - 1) * perPage + 1 : 0;
  const rangeEnd = Math.min(page * perPage, totalRecords);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Breadcrumb & Back button */}
      <div className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link
            to="/app/chatbots"
            className="hover:text-blue-600 transition-colors"
          >
            Chatbots
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600 font-semibold truncate max-w-[200px] sm:max-w-md">
            {chatbotName}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-bold">Conversations</span>
        </nav>

        <div>
          <Link
            to="/app/chatbots"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Chatbots
          </Link>
        </div>
      </div>

      {/* 2. Page Header & Chatbot Summary Card */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        {/* Chatbot Identity */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
            {logo ? (
              <img
                src={logo}
                alt=""
                className="h-full w-full object-cover rounded-2xl"
              />
            ) : (
              <Bot size={28} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              {chatbotName} — Conversations
            </h1>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">
              {numberFormat.format(kpiData.total)} conversations this month
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-2xl">
              View and manage all conversations for this chatbot. See visitor details, last messages and conversation status.
            </p>
          </div>
        </div>

        {/* Top-Right Chatbot Summary Card */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:px-4">
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isActiveChatbot
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActiveChatbot ? "bg-emerald-600" : "bg-slate-500"
                  }`}
                />
                {isActiveChatbot ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium text-slate-400">Channel:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                <Globe2 size={13} />
                {primaryChannelName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium text-slate-400">Created:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                <CalendarDays size={13} className="text-slate-400" />
                {createdDateStr}
              </span>
            </div>
          </div>

          <div className="sm:border-l sm:border-slate-200 sm:pl-4">
            <Link
              to={`/app/inbox?chatbotId=${encodeURIComponent(chatbotId)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 border border-blue-200/80 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
            >
              <span>View in Inbox</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Conversations */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessagesSquare size={22} />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              {numberFormat.format(kpiData.total)}
            </span>
            <h3 className="text-xs font-semibold text-slate-700">
              Total Conversations
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">This month</p>
          </div>
        </div>

        {/* Card 2: Active Conversations */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users size={22} />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              {numberFormat.format(kpiData.activeCount)}
            </span>
            <h3 className="text-xs font-semibold text-slate-700">
              Active Conversations
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {kpiData.activePct}% of total
            </p>
          </div>
        </div>

        {/* Card 3: Closed Conversations */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              {numberFormat.format(kpiData.closedCount)}
            </span>
            <h3 className="text-xs font-semibold text-slate-700">
              Closed Conversations
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {kpiData.closedPct}% of total
            </p>
          </div>
        </div>

        {/* Card 4: Anonymous Visitors */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <UserRound size={22} />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              {numberFormat.format(kpiData.anonCount)}
            </span>
            <h3 className="text-xs font-semibold text-slate-700">
              Anonymous Visitors
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {kpiData.anonPct}% of total
            </p>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Date Filter */}
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Calendar size={14} />
            </div>
            <select
              value={datePeriod}
              onChange={(e) => {
                setDatePeriod(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by date range"
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-xs"
            >
              <option value="thisMonth">This Month</option>
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="allTime">All Time</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Channel Filter */}
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Globe2 size={14} />
            </div>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by channel"
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-xs"
            >
              <option value="all">All Channels</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <CheckCircle2 size={14} />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-xs"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search conversations..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh conversations"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RotateCw size={14} />
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 5. Conversation Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoadingList ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle size={28} className="animate-spin text-blue-600" />
            <span className="font-medium text-xs text-slate-600">
              Loading conversations...
            </span>
          </div>
        ) : listError ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Failed to load conversations
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">{listError}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <RotateCw size={14} /> Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <MessagesSquare size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No conversations found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
              {searchQuery || channelFilter !== "all" || statusFilter !== "all"
                ? "No conversations match your current filters. Try changing or clearing your search criteria."
                : `No conversations have been recorded for ${chatbotName} in the selected time range.`}
            </p>
            {(searchQuery ||
              channelFilter !== "all" ||
              statusFilter !== "all" ||
              datePeriod !== "thisMonth") && (
              <button
                type="button"
                onClick={() => {
                  setDatePeriod("thisMonth");
                  setChannelFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="w-12 px-4 py-3.5 text-center">#</th>
                  <th className="min-w-[280px] px-4 py-3.5">Conversation / Visitor</th>
                  <th className="w-32 px-4 py-3.5">Channel</th>
                  <th className="w-28 px-4 py-3.5">Status</th>
                  <th className="min-w-[240px] px-4 py-3.5">Last Message</th>
                  <th className="w-36 px-4 py-3.5">Last Activity</th>
                  <th className="w-40 px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversations.map((convo, idx) => {
                  const rowNumber = (page - 1) * perPage + idx + 1;
                  const isLead = Boolean(convo.lead?.databaseId && !convo.lead?.isDeleted);
                  const isDeletedLead = Boolean(convo.lead?.isDeleted);
                  const isAnonymous = Boolean(convo.lead?.isAnonymous || (!convo.lead?.databaseId && !convo.lead?.isDeleted));

                  const leadName = convo.lead?.name || `Visitor ${String(convo.visitorId).slice(-6)}`;
                  const phone = convo.lead?.phone && convo.lead.phone !== "—" ? convo.lead.phone : null;
                  const email = convo.lead?.email && convo.lead.email !== "—" ? convo.lead.email : null;
                  const isWhatsApp = convo.channel === "whatsapp";
                  const isOpen = String(convo.status).toUpperCase() === "OPEN";

                  const { date: activityDate, time: activityTime } = formatActivityDate(
                    convo.lastActivityTime || convo.updatedAt || convo.createdAt,
                  );

                  const avatarColor = getAvatarColor(convo.visitorId || leadName);
                  const initials = getInitials(leadName);

                  // Extract last message preview lines
                  const rawLastMsg = convo.lastMessage?.trim() || "No messages yet";
                  const firstLine = rawLastMsg.split("\n")[0] || rawLastMsg;
                  const hasMoreLines = rawLastMsg.includes("\n") || rawLastMsg.length > 30;

                  return (
                    <tr
                      key={convo.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* # Row Number */}
                      <td className="px-4 py-3 text-center text-slate-400 font-semibold">
                        {rowNumber}
                      </td>

                      {/* Conversation / Visitor */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${avatarColor}`}
                          >
                            {initials}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <strong className="truncate font-bold text-slate-900 text-xs sm:text-[13px]">
                                {leadName}
                              </strong>

                              {isLead && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                                  <Sparkles size={10} /> Lead
                                </span>
                              )}

                              {isDeletedLead && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                                  Deleted
                                </span>
                              )}

                              {isAnonymous && (
                                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200/60">
                                  Anonymous
                                </span>
                              )}
                            </div>

                            {/* Contact Details */}
                            <div className="mt-0.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                              {phone || email ? (
                                <>
                                  {phone && (
                                    <span className="inline-flex items-center gap-1">
                                      <Phone size={10} className="text-slate-400" />
                                      {phone}
                                    </span>
                                  )}
                                  {email && (
                                    <span className="inline-flex items-center gap-1">
                                      <Mail size={10} className="text-slate-400" />
                                      {email}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-slate-400 italic">
                                  — No contact details
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td className="px-4 py-3">
                        {isWhatsApp ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                            <MessageCircle size={12} /> WhatsApp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
                            <Globe2 size={12} /> Website
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isOpen ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Closed
                          </span>
                        )}
                      </td>

                      {/* Last Message */}
                      <td className="px-4 py-3 max-w-xs">
                        <strong className="block truncate font-bold text-slate-900 text-xs">
                          {firstLine}
                        </strong>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                          {hasMoreLines ? rawLastMsg : `Last message: ${rawLastMsg}`}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="block font-semibold text-slate-800 text-xs">
                          {activityDate}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {activityTime}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenConversation(convo)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                        >
                          <Eye size={12} />
                          <span>View Conversation</span>
                          <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {!isLoadingList && conversations.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span>
                Showing <strong className="text-slate-900">{totalRecords}</strong> {totalRecords === 1 ? "conversation" : "conversations"}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Rows per page:</span>
                <div className="relative">
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    aria-label="Rows per page"
                    className="h-7 appearance-none rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 shadow-xs"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">
                {rangeStart}–{rangeEnd} of {totalRecords}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 shadow-xs transition"
                >
                  <ChevronLeft size={14} />
                </button>

                <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-blue-600 px-2 font-bold text-white shadow-xs">
                  {page}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 shadow-xs transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
