import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  getNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from "../../lib/authApi";

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
    year: "numeric",
  });
}

function PriorityIcon({ priority }) {
  switch (priority) {
    case "URGENT":
      return <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />;
    case "WARNING":
      return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />;
    case "SUCCESS":
      return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />;
    case "INFO":
    default:
      return <Info className="h-5 w-5 shrink-0 text-blue-500" />;
  }
}

export default function NotificationsPage({ onNavigate, routerNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchNotifications = useCallback(
    async (isRefresh = false, pageNumber = 1) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await getNotificationsRequest({
          unreadOnly: filter === "unread",
          page: pageNumber,
          limit: 20,
        });

        setNotifications(data.notifications || []);
        setUnreadCount(Number(data.unreadCount || 0));
        if (data.pagination) {
          setPagination(data.pagination);
          setPage(data.pagination.page || pageNumber);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchNotifications(false, 1);
  }, [fetchNotifications]);

  const handleMarkRead = async (e, notif) => {
    e?.stopPropagation?.();
    if (notif.isRead) return;
    try {
      await markNotificationReadRequest(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    try {
      setMarkingAll(true);
      await markAllNotificationsReadRequest();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      handleMarkRead({ stopPropagation: () => {} }, notif);
    }

    const navFunc = routerNavigate || onNavigate;
    if (navFunc && notif.module) {
      switch (notif.module) {
        case "Leads":
          navFunc("/app/leads/students");
          break;
        case "Follow-ups":
          navFunc("/app/followups");
          break;
        case "Calls":
          navFunc("/app/calls");
          break;
        case "Counsellors":
          navFunc("/app/counsellors");
          break;
        case "WhatsApp":
          navFunc("/app/whatsapp");
          break;
        case "Chatbots":
          navFunc("/app/chatbots");
          break;
        case "Campaigns":
          navFunc("/app/campaigns");
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Stay updated with important activity, admissions alerts, and system events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchNotifications(true, page)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* Filter Tabs & Content Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Notifications
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter("unread");
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Showing {notifications.length} of {pagination.total || notifications.length}
          </span>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Bell size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No notifications found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {filter === "unread"
                ? "You have caught up with all your notifications! Great job."
                : "You don't have any notifications right now. System updates and lead activities will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative flex items-start gap-4 p-5 text-left transition-colors cursor-pointer hover:bg-slate-50/80 ${
                  !notif.isRead ? "bg-blue-50/20" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-white border border-slate-100 shadow-2xs">
                    <PriorityIcon priority={notif.priority} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm ${
                          !notif.isRead
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-800"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {notif.module}
                      </span>
                      {notif.priority && notif.priority !== "INFO" && (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            notif.priority === "URGENT"
                              ? "bg-rose-100 text-rose-700"
                              : notif.priority === "WARNING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {notif.priority}
                        </span>
                      )}
                    </div>

                    {!notif.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkRead(e, notif)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchNotifications(false, page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => fetchNotifications(false, page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
