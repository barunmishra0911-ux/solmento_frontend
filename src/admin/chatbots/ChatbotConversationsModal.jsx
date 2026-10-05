import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import { listInboxConversationsRequest } from "@/lib/authApi";
import { formatChatbotDisplayName } from "../../chatbot/widgetPosition";

const numberFormat = new Intl.NumberFormat("en-IN");
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function ChatbotConversationsModal({
  chatbot,
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !chatbot?.id) {
      setConversations([]);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    listInboxConversationsRequest({
      chatbotId: chatbot.id,
      limit: 100,
    })
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data?.conversations) ? data.conversations : [];
        setConversations(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load chatbot conversations.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, chatbot?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !chatbot) return null;

  const displayName = formatChatbotDisplayName(chatbot.name);
  const totalCount = conversations.length || chatbot.conversationsThisMonth || 0;

  const handleOpenConversation = (conversation) => {
    onClose();
    navigate(`/app/inbox?conversationId=${encodeURIComponent(conversation.id)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chatbot-conversations-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 md:p-6 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
              <MessagesSquare size={20} />
            </div>
            <div>
              <h2
                id="chatbot-conversations-title"
                className="text-base font-bold text-slate-950 sm:text-lg"
              >
                {displayName} — Conversations
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                This Month •{" "}
                <span className="font-semibold text-blue-600">
                  {numberFormat.format(totalCount)}{" "}
                  {totalCount === 1 ? "conversation" : "conversations"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={19} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3 text-sm text-slate-500">
              <LoaderCircle size={24} className="animate-spin text-blue-600" />
              <span>Loading conversations...</span>
            </div>
          ) : error ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700">
              <AlertCircle size={28} className="text-rose-500 mb-2" />
              <p className="font-semibold text-slate-900">Unable to load conversations</p>
              <p className="mt-1 text-xs text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  listInboxConversationsRequest({
                    chatbotId: chatbot.id,
                    limit: 100,
                  })
                    .then((data) => {
                      setConversations(data?.conversations || []);
                    })
                    .catch((err) => {
                      setError(err?.message || "Failed to load chatbot conversations.");
                    })
                    .finally(() => setIsLoading(false));
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs hover:bg-slate-50"
              >
                <RotateCcw size={14} /> Retry
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-slate-400 mb-3">
                <MessagesSquare size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No conversations found
              </h3>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                No conversations have been recorded for {displayName} this month yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((convo) => {
                const leadName = convo.lead?.name || `Visitor ${convo.visitorId?.slice(-6)}`;
                const leadEmail = convo.lead?.email && convo.lead.email !== "—" ? convo.lead.email : null;
                const leadPhone = convo.lead?.phone && convo.lead.phone !== "—" ? convo.lead.phone : null;
                const isWhatsApp = convo.channel === "whatsapp";
                const isClosed = convo.status === "CLOSED";
                const dateStr = convo.createdAt
                  ? dateTimeFormat.format(new Date(convo.createdAt))
                  : "Recently";

                return (
                  <div
                    key={convo.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs">
                          <UserRound size={14} />
                        </span>
                        <strong className="truncate text-sm font-bold text-slate-900">
                          {leadName}
                        </strong>

                        {/* Channel Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isWhatsApp
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isWhatsApp ? (
                            <MessageCircle size={11} />
                          ) : (
                            <Globe2 size={11} />
                          )}
                          {isWhatsApp ? "WhatsApp" : "Website"}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isClosed
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {convo.status || "OPEN"}
                        </span>
                      </div>

                      {/* Contact Info */}
                      {(leadPhone || leadEmail) && (
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {leadPhone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={11} className="text-slate-400" />
                              {leadPhone}
                            </span>
                          )}
                          {leadEmail && (
                            <span className="inline-flex items-center gap-1">
                              <Mail size={11} className="text-slate-400" />
                              {leadEmail}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Last Message Snippet */}
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <span className="font-semibold text-slate-500">Last message:</span>{" "}
                        {convo.lastMessage || "No messages yet"}
                      </p>

                      {/* Time */}
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={11} />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* View Conversation Action */}
                    <div className="flex shrink-0 items-center sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenConversation(convo)}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                      >
                        <span>View Conversation</span>
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 rounded-b-2xl">
          <p className="text-xs text-slate-500">
            Showing {conversations.length} {conversations.length === 1 ? "record" : "records"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
