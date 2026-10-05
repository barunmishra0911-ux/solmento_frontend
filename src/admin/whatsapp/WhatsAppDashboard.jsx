import { useState, useEffect, useMemo } from "react";
import {
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  ShieldCheck,
  Link2,
  Unlink,
  ExternalLink,
  Users,
  Clock,
  Check,
  Loader2,
  Copy,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getWhatsAppConfigRequest,
  disconnectWhatsAppRequest,
  getWhatsAppLeadsRequest,
  sendWhatsAppMessageRequest,
  getWhatsAppBroadcastsRequest,
} from "@/lib/authApi";
import { showToast } from "@/lib/toast";
import WhatsAppIcon from "./WhatsAppIcon";

const normalizePhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) {
    return digits.slice(-10);
  }
  return digits;
};

export default function WhatsAppDashboard({ onNavigate, routerNavigate }) {
  // State for configuration
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // State for leads & messaging
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientMode, setRecipientMode] = useState("SELECTED"); // "SELECTED" | "ALL"
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
  const [messageText, setMessageText] = useState(
    "10% OFF on B.Tech Admissions. Contact us for details.",
  );

  // State for sending & confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  // State for delivery status & history
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [activeTab, setActiveTab] = useState("compose"); // "compose" | "history"
  const [expandedBroadcastId, setExpandedBroadcastId] = useState(null);

  // Load initial data
  const loadData = async () => {
    try {
      setLoadingConfig(true);
      const cfg = await getWhatsAppConfigRequest();
      setConfig(cfg);
    } catch (err) {
      console.error("Failed to load WhatsApp config:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to load WhatsApp configuration.",
      });
    } finally {
      setLoadingConfig(false);
    }

    try {
      setLoadingLeads(true);
      const leadList = await getWhatsAppLeadsRequest();
      const loadedLeads = leadList || [];
      setLeads(loadedLeads);
      // Pre-select Barun Kumar Mishra (6205001632) by default
      const targetLead = loadedLeads.find((l) => {
        const norm = normalizePhone(l.phone || l.whatsapp);
        return norm === "6205001632";
      });
      if (targetLead) {
        setSelectedLeadIds(new Set([targetLead.id]));
      } else {
        setSelectedLeadIds(new Set());
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoadingLeads(false);
    }

    loadBroadcasts();
  };

  const loadBroadcasts = async () => {
    try {
      setLoadingBroadcasts(true);
      const list = await getWhatsAppBroadcastsRequest(20);
      setBroadcasts(list || []);
      if (list && list.length > 0 && !expandedBroadcastId) {
        setExpandedBroadcastId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load broadcasts:", err);
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter leads based on search query
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.courses && l.courses.some((c) => c.toLowerCase().includes(q))),
    );
  }, [leads, searchQuery]);

  const validFilteredLeads = useMemo(() => {
    return filteredLeads.filter((l) => l.hasValidPhone);
  }, [filteredLeads]);

  // Handle lead selection
  const handleToggleLead = (id) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.size === validFilteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(validFilteredLeads.map((l) => l.id)));
    }
  };

  const handleNavigateToConfiguration = () => {
    if (typeof onNavigate === "function") {
      onNavigate("whatsappConfiguration");
    } else if (typeof routerNavigate === "function") {
      routerNavigate("/app/whatsapp/configuration");
    } else {
      window.location.href = "/app/whatsapp/configuration";
    }
  };

  // Disconnect WhatsApp handler
  const handleConfirmDisconnect = async () => {
    setShowDisconnectModal(false);
    setDisconnecting(true);
    try {
      await disconnectWhatsAppRequest();
      setConfig((prev) => (prev ? { ...prev, connected: false, status: "DISCONNECTED" } : null));
      setFeedback({
        type: "success",
        message: "WhatsApp account disconnected successfully.",
      });
      showToast.success("WhatsApp account disconnected successfully.");
    } catch (err) {
      const errMsg = err.message || "Failed to disconnect WhatsApp account.";
      setFeedback({
        type: "error",
        message: errMsg,
      });
      showToast.error(errMsg);
    } finally {
      setDisconnecting(false);
    }
  };

  // Send message flow
  const handleInitiateSend = () => {
    if (!config?.connected) {
      setFeedback({
        type: "error",
        message: "Please connect your WhatsApp Business account first.",
      });
      return;
    }
    if (!messageText.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter a message to send.",
      });
      return;
    }

    const targetCount =
      recipientMode === "ALL"
        ? leads.filter((l) => l.hasValidPhone).length
        : selectedLeadIds.size;

    if (targetCount === 0) {
      setFeedback({
        type: "error",
        message: "Please select at least one lead with a valid phone number.",
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setSendingMessage(true);
    setFeedback({ type: null, message: "" });

    try {
      const payload = {
        messageText: messageText.trim(),
        recipientMode,
        leadIds: Array.from(selectedLeadIds),
      };

      const result = await sendWhatsAppMessageRequest(payload);
      setLatestResult(result);
      loadBroadcasts();

      if (result.sentCount > 0) {
        setFeedback({
          type: "success",
          message: `Successfully dispatched WhatsApp message to ${result.sentCount} recipient(s)! (Failed: ${result.failedCount})`,
        });
      } else {
        setFeedback({
          type: "error",
          message: `Failed to deliver messages. Meta API reported errors for all ${result.totalRecipients} recipient(s). Check delivery logs below.`,
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to send WhatsApp message via Meta Cloud API.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Target recipients list for modal confirmation
  const targetLeadsList = useMemo(() => {
    if (recipientMode === "ALL") {
      return leads.filter((l) => l.hasValidPhone);
    }
    return leads.filter((l) => selectedLeadIds.has(l.id) && l.hasValidPhone);
  }, [leads, recipientMode, selectedLeadIds]);

  const webhookCallbackUrl = `${window.location.origin}/api/public/whatsapp/webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookCallbackUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <WhatsAppIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                WhatsApp Business Integration
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Connect your Meta WhatsApp Cloud API and send promotional messages to verified student leads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loadingConfig || loadingLeads || loadingBroadcasts}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loadingConfig || loadingBroadcasts ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {feedback.message && feedback.type !== "success" && (
        <div className="flex items-start gap-3 rounded-2xl p-4 text-sm border border-rose-200 bg-rose-50 text-rose-900">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback({ type: null, message: "" })}
            className="text-slate-400 hover:text-slate-600"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Section 1: WhatsApp Connection Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                config?.connected
                  ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <WhatsAppIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">
                  Meta WhatsApp Cloud API
                </h2>
                {loadingConfig ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    <Loader2 size={12} className="animate-spin" /> Checking
                  </span>
                ) : config?.connected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {config?.connected
                  ? `Connected as ${config.businessName || "WhatsApp Business"} (${config.phoneNumber})`
                  : "Connect your WhatsApp Business account to enable direct message delivery."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {config?.connected ? (
              <>
                <button
                  type="button"
                  onClick={handleNavigateToConfiguration}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Link2 size={14} /> Edit Configuration
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisconnectModal(true)}
                  disabled={disconnecting}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                >
                  {disconnecting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Unlink size={14} />
                  )}
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNavigateToConfiguration}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Link2 size={14} /> Connect WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* Connected Details Grid */}
        {config?.connected && (
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="text-[11px] font-medium uppercase text-slate-400">
                Business Name
              </span>
              <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                {config.businessName || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="text-[11px] font-medium uppercase text-slate-400">
                Phone Number
              </span>
              <p className="mt-0.5 text-xs font-bold text-slate-900">
                {config.phoneNumber || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="text-[11px] font-medium uppercase text-slate-400">
                Phone Number ID
              </span>
              <p className="mt-0.5 font-mono text-xs font-semibold text-slate-700 truncate">
                {config.phoneNumberId || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <span className="text-[11px] font-medium uppercase text-slate-400">
                WABA ID
              </span>
              <p className="mt-0.5 font-mono text-xs font-semibold text-slate-700 truncate">
                {config.wabaId || "—"}
              </p>
            </div>
          </div>
        )}

        {/* Webhook Info Section */}
        <div className="mt-4 flex flex-col gap-2.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2 sm:items-center">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600 sm:mt-0" />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 sm:flex-nowrap">
              <span className="shrink-0 font-medium text-slate-700">Webhook URL:</span>
              <code className="min-w-0 max-w-full break-all select-all rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-800">
                {webhookCallbackUrl}
              </code>
            </div>
          </div>
          <button
            type="button"
            onClick={copyWebhookUrl}
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800 self-start sm:self-auto"
          >
            {copiedWebhook ? <Check size={13} /> : <Copy size={13} />}
            {copiedWebhook ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>

      {/* Tabs: Compose Message vs Delivery History */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("compose")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "compose"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Send size={16} /> Compose & Send Message
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock size={16} /> Delivery Status & History
          {broadcasts.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
              {broadcasts.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Compose & Send */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Message Compose Box */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-base font-bold text-slate-900">
                1. Compose Promotional Message
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Enter the real WhatsApp text message you want to deliver to prospective student leads.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Message Content
                </label>
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="e.g. 10% OFF on B.Tech Admissions. Contact us for details."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
                  <span>Characters: {messageText.length}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setMessageText(
                        "10% OFF on B.Tech Admissions. Contact us for details.",
                      )
                    }
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Reset to Example
                  </button>
                </div>
              </div>

              {/* Live WhatsApp Bubble Preview */}
              <div className="mt-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4">
                <span className="text-[11px] font-bold uppercase text-emerald-800">
                  WhatsApp Preview Mockup
                </span>
                <div className="mt-2.5 flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#D9FDD3] p-3 shadow-sm text-slate-900 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {messageText || "Your message will appear here..."}
                    <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                      <span>Now</span>
                      <Check size={12} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Summary & Send CTA */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span>Target Recipients:</span>
                  <span className="font-bold text-slate-900">
                    {recipientMode === "ALL"
                      ? `${leads.filter((l) => l.hasValidPhone).length} (All Valid Leads)`
                      : `${selectedLeadIds.size} Selected`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleInitiateSend}
                  disabled={
                    sendingMessage ||
                    !config?.connected ||
                    !messageText.trim() ||
                    (recipientMode === "SELECTED" && selectedLeadIds.size === 0)
                  }
                  className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending real message via Meta API...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send WhatsApp Message
                    </>
                  )}
                </button>

                {!config?.connected && (
                  <p className="mt-2 text-center text-xs text-amber-700">
                    ⚠️ Connect WhatsApp Business account above to enable sending.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Lead Selection & Targeting */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    2. Select Target Leads
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Choose verified leads with phone numbers to receive the promotional message.
                  </p>
                </div>

                {/* Mode Selector Toggle */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setRecipientMode("SELECTED")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      recipientMode === "SELECTED"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Selected Leads ({selectedLeadIds.size})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientMode("ALL")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      recipientMode === "ALL"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    All Leads ({leads.filter((l) => l.hasValidPhone).length})
                  </button>
                </div>
              </div>

              {/* Search & Bulk Selection Bar */}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, course..."
                    className="h-9 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {recipientMode === "SELECTED" && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {selectedLeadIds.size === validFilteredLeads.length &&
                    validFilteredLeads.length > 0 ? (
                      <>
                        <Square size={14} className="text-slate-400" /> Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare size={14} className="text-emerald-600" /> Select All Filtered
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Leads Table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        {recipientMode === "SELECTED" && (
                          <th className="w-10 px-3 py-2.5 text-center"></th>
                        )}
                        <th className="px-3 py-2.5">Lead Name</th>
                        <th className="px-3 py-2.5">WhatsApp / Phone</th>
                        <th className="px-3 py-2.5">Courses</th>
                        <th className="px-3 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingLeads ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-6 text-center text-slate-400"
                          >
                            <Loader2
                              size={18}
                              className="mx-auto mb-2 animate-spin text-emerald-600"
                            />
                            Loading real leads from database...
                          </td>
                        </tr>
                      ) : filteredLeads.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-6 text-center text-slate-400"
                          >
                            No matching student leads found.
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => {
                          const isSelected = selectedLeadIds.has(lead.id);
                          return (
                            <tr
                              key={lead.id}
                              onClick={() => {
                                if (recipientMode === "SELECTED" && lead.hasValidPhone) {
                                  handleToggleLead(lead.id);
                                }
                              }}
                              className={`transition ${
                                !lead.hasValidPhone
                                  ? "opacity-50 cursor-not-allowed bg-slate-50/50"
                                  : recipientMode === "SELECTED"
                                    ? isSelected
                                      ? "bg-emerald-50/60 cursor-pointer"
                                      : "hover:bg-slate-50 cursor-pointer"
                                    : "hover:bg-slate-50"
                              }`}
                            >
                              {recipientMode === "SELECTED" && (
                                <td className="px-3 py-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!lead.hasValidPhone}
                                    onChange={() => handleToggleLead(lead.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </td>
                              )}
                              <td className="px-3 py-2.5 font-semibold text-slate-900">
                                {lead.name}
                              </td>
                              <td className="px-3 py-2.5 font-mono text-slate-700">
                                {lead.phone ? (
                                  <span className="inline-flex items-center gap-1">
                                    <MessageCircle
                                      size={12}
                                      className={
                                        lead.hasValidPhone
                                          ? "text-emerald-600"
                                          : "text-slate-300"
                                      }
                                    />
                                    {lead.phone}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">No phone</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-slate-600">
                                {lead.courses && lead.courses.length > 0
                                  ? lead.courses.join(", ")
                                  : "—"}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                  {lead.status || "NEW"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Delivery Status & Past Broadcasts */}
      {(activeTab === "history" || latestResult) && (
        <div className="space-y-6">
          {/* Latest Result Banner if just sent */}
          {latestResult && activeTab === "compose" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Latest Dispatch Delivery Status
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  View Full History
                </button>
              </div>

              {/* Metrics Cards */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-3 text-center">
                  <span className="text-xs text-slate-500 font-medium">Total</span>
                  <div className="text-xl font-bold text-slate-900">
                    {latestResult.totalRecipients}
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center">
                  <span className="text-xs text-emerald-700 font-medium">Sent (Meta wamid)</span>
                  <div className="text-xl font-bold text-emerald-700">
                    {latestResult.sentCount}
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-center">
                  <span className="text-xs text-blue-700 font-medium">Delivered</span>
                  <div className="text-xl font-bold text-blue-700">
                    {latestResult.deliveredCount || 0}
                  </div>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-center">
                  <span className="text-xs text-rose-700 font-medium">Failed</span>
                  <div className="text-xl font-bold text-rose-700">
                    {latestResult.failedCount}
                  </div>
                </div>
              </div>

              {/* Per-Lead Status Table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Recipient</th>
                      <th className="px-3 py-2.5">Phone</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Provider Message ID (Meta)</th>
                      <th className="px-3 py-2.5">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {latestResult.recipients?.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2.5 font-semibold text-slate-900">
                          {r.name}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-700">
                          {r.phone}
                        </td>
                        <td className="px-3 py-2.5">
                          {r.status === "SENT" || r.status === "DELIVERED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              <CheckCircle2 size={12} /> {r.status}
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700"
                              title={r.errorMessage || "Delivery failed"}
                            >
                              <XCircle size={12} /> FAILED
                            </span>
                          )}
                          {r.errorMessage && (
                            <div className="mt-0.5 text-[10px] text-rose-600 max-w-xs truncate" title={r.errorMessage}>
                              {r.errorMessage.includes("131030") || r.errorMessage.toLowerCase().includes("not in allowed list")
                                ? "(#131030) Recipient not in Meta test allowed list"
                                : r.errorMessage}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                          {r.providerMessageId || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                          {r.sentAt
                            ? new Date(r.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Broadcasts History List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Broadcasts & Delivery History
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Past messages dispatched via Meta WhatsApp Cloud API with persisted delivery receipts.
                </p>
              </div>
              <button
                type="button"
                onClick={loadBroadcasts}
                disabled={loadingBroadcasts}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw
                  size={12}
                  className={loadingBroadcasts ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {loadingBroadcasts && broadcasts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={22} className="mx-auto mb-2 animate-spin text-emerald-600" />
                Loading dispatch history...
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <MessageCircle size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-700">No broadcasts yet</p>
                <p className="text-xs">
                  Compose a message above and send it to your first batch of leads.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {broadcasts.map((b) => {
                  const isExpanded = expandedBroadcastId === b.id;
                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50"
                    >
                      <div
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                        onClick={() =>
                          setExpandedBroadcastId(isExpanded ? null : b.id)
                        }
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              Broadcast #{b.id}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">
                              {new Date(b.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium line-clamp-1">
                            "{b.messageText}"
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2">
                            <span className="rounded-md bg-slate-200/80 px-2 py-0.5 font-bold text-slate-700">
                              Total: {b.totalRecipients}
                            </span>
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                              Sent: {b.sentCount}
                            </span>
                            {b.deliveredCount > 0 && (
                              <span className="rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-800">
                                Delivered: {b.deliveredCount}
                              </span>
                            )}
                            {b.failedCount > 0 && (
                              <span className="rounded-md bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                                Failed: {b.failedCount}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600 shrink-0"
                            aria-label={isExpanded ? "Collapse broadcast details" : "Expand broadcast details"}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Recipient Logs */}
                      {isExpanded && (
                        <div className="mt-4 border-t border-slate-200 pt-3">
                          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="w-full min-w-[680px] text-left text-xs">
                              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                                <tr>
                                  <th className="px-3.5 py-2.5">Lead Name</th>
                                  <th className="px-3.5 py-2.5">Phone</th>
                                  <th className="px-3.5 py-2.5">Status</th>
                                  <th className="px-3.5 py-2.5">Meta Message ID (wamid)</th>
                                  <th className="px-3.5 py-2.5">Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {b.recipients?.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="p-4 text-center text-slate-400"
                                    >
                                      No recipient logs available.
                                    </td>
                                  </tr>
                                ) : (
                                  b.recipients?.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                                      <td className="whitespace-nowrap px-3.5 py-2.5 font-medium text-slate-900">
                                        {r.recipientName || "Lead"}
                                      </td>
                                      <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-slate-700">
                                        {r.recipientPhone}
                                      </td>
                                      <td className="px-3.5 py-2.5 min-w-[140px]">
                                        {r.status === "SENT" || r.status === "DELIVERED" || r.status === "READ" ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                            <CheckCircle2 size={11} /> {r.status}
                                          </span>
                                        ) : (
                                          <span
                                            className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800"
                                            title={r.errorMessage || "Failed"}
                                          >
                                            <XCircle size={11} /> FAILED
                                          </span>
                                        )}
                                        {r.errorMessage && (
                                          <span className="mt-1 block max-w-xs break-words text-[10px] text-rose-600" title={r.errorMessage}>
                                            {r.errorMessage.includes("131030") || r.errorMessage.toLowerCase().includes("not in allowed list")
                                              ? "(#131030) Recipient not in Meta test allowed list"
                                              : r.errorMessage}
                                          </span>
                                        )}
                                      </td>
                                      <td className="max-w-[220px] break-all px-3.5 py-2.5 font-mono text-[11px] text-slate-600">
                                        {r.providerMessageId || "—"}
                                      </td>
                                      <td className="whitespace-nowrap px-3.5 py-2.5 text-[11px] text-slate-500">
                                        {r.sentAt
                                          ? new Date(r.sentAt).toLocaleTimeString()
                                          : "—"}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Modal: Professional Custom Disconnect Confirmation */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 ring-8 ring-rose-50 mb-4">
                <Unlink size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Disconnect WhatsApp?
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Are you sure you want to disconnect this WhatsApp Business account? You will no longer be able to send or receive WhatsApp messages through this integration until it is connected again.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                disabled={disconnecting}
                className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnect}
                disabled={disconnecting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                {disconnecting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink size={14} /> Disconnect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmation Before Sending Real Message */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Message Dispatch
                </h3>
                <p className="text-xs text-slate-500">
                  REAL WhatsApp message will be sent via Meta Cloud API.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-3 text-xs">
                <span className="font-semibold text-slate-700">Message Preview:</span>
                <p className="mt-1 text-slate-900 italic font-medium">
                  "{messageText}"
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-xs">
                <div className="flex items-center justify-between text-slate-700 mb-2">
                  <span className="font-semibold">Recipients ({targetLeadsList.length}):</span>
                  <span className="text-[11px] text-slate-400">Real WhatsApp Numbers</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {targetLeadsList.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-[11px]"
                    >
                      <span className="font-medium text-slate-900 truncate">
                        {lead.name}
                      </span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        {lead.phone}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-700" />
                <span>
                  Please ensure your Meta test numbers or real business phone numbers are valid to receive delivery receipts.
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                <Send size={14} /> Confirm & Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
