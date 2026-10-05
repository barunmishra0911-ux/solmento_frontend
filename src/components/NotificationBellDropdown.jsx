import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import {
  getNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from "../lib/authApi";

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function PriorityIcon({ priority }) {
  switch (priority) {
    case "URGENT":
      return <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />;
    case "WARNING":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />;
    case "SUCCESS":
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />;
    case "INFO":
    default:
      return <Info className="h-4 w-4 shrink-0 text-blue-500" />;
  }
}

export default function NotificationBellDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const containerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotificationsRequest({
        unreadOnly: filter === "unread",
        limit: 15,
      });
      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      // Quiet fail on background polling error
    }
  }, [filter]);

  // Initial fetch and 20s polling interval
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(() => {
      fetchNotifications();
    }, 20000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  };

  const handleMarkRead = async (e, notif) => {
    e.stopPropagation();
    if (notif.isRead) return;
    try {
      await markNotificationReadRequest(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Quiet error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsReadRequest();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Quiet error
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      handleMarkRead({ stopPropagation: () => {} }, notif);
    }
    setOpen(false);

    if (onNavigate) {
      switch (notif.module) {
        case "Leads":
          onNavigate("/app/leads");
          break;
        case "Follow-ups":
          onNavigate("/app/followups");
          break;
        case "Calls":
          onNavigate("/app/calls");
          break;
        case "Counsellors":
          onNavigate("/app/counsellors");
          break;
        case "WhatsApp":
          onNavigate("/app/whatsapp");
          break;
        default:
          break;
      }
    }
  };

  const displayedNotifications = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const recentNotifications = displayedNotifications.slice(0, 5);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-label="View notifications"
        className={`relative rounded-xl border p-2.5 transition-all shadow-sm ${
          open
            ? "border-blue-500 bg-blue-50/50 text-blue-600 ring-2 ring-blue-500/20"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-4 h-4 px-1 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop for tap-outside to close */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-100"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2.5 sm:w-96 max-w-full sm:max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-950/10 z-50 overflow-hidden flex flex-col max-h-[75dvh] sm:max-h-[32rem] animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {markingAll ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3.5 w-3.5" />
                    )}
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-slate-100 px-3 py-1.5 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  filter === "all"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  filter === "unread"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* List (Max 5 items, scrollable if rendered content overflows) */}
            <div className="flex-1 min-h-0 max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400 mb-2">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-slate-700">No notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filter === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "Important alerts and activity will appear here."}
                </p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-slate-50/80 ${
                    !notif.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    <PriorityIcon priority={notif.priority} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !notif.isRead
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] whitespace-nowrap text-slate-400">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {notif.module}
                      </span>

                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkRead(e, notif)}
                          title="Mark as read"
                          className="text-[10px] font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <span className="absolute left-1.5 top-3.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* View More Footer */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-2 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (typeof onNavigate === "function") {
                  onNavigate("notifications");
                }
              }}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
            >
              View More <ChevronRight size={14} />
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
