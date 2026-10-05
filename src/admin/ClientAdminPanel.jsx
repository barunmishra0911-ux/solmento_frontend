import { useEffect, useMemo, useRef, useState } from "react";
import NotificationBellDropdown from "../components/NotificationBellDropdown";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  BarChart3,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CircleUserRound,
  Check,
  Clock,
  ContactRound,
  Copy,
  Database,
  Globe2,
  Inbox,
  LayoutDashboard,
  LogOut,
  LoaderCircle,
  Loader2,
  Menu,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Settings2,
  Sparkles,
  Users,
  UsersRound,
  Workflow,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import {
  clientAdminNav,
  counsellorNav,
  getNavForRole,
  clientAdminRoutes,
  clientAdminScreens,
  resolveClientAdminRoute,
} from "./clientAdminScreens";
import CompanyProfile from "./settings/CompanyProfile";
import AdminProfile from "./settings/AdminProfile";
import AdminProfileEdit from "./settings/AdminProfileEdit";
import NotificationsPage from "./notifications/NotificationsPage";
import RolesPermissions from "./settings/RolesPermissions";
import AuditLogs from "./settings/AuditLogs";
import AddTeamMember from "./AddTeamMember";
import TeamManagement from "./TeamManagement";
import ChatbotList from "./chatbots/ChatbotList";
import ChatbotConversationsPage from "./chatbots/ChatbotConversationsPage";
import CreateChatbot from "./chatbots/CreateChatbot";
import ChatbotDraftBuilder from "./chatbots/ChatbotDraftBuilder";
import CounsellorManagement from "./CounsellorManagement";
import CreateCounsellor from "./CreateCounsellor";
import LeadDashboard from "./LeadDashboard";
import StudentLeads from "./StudentLeads";
import StudentLeadDetails from "./StudentLeadDetails";
import LeadManagement from "./LeadManagement";
import EditLeadPage from "./EditLeadPage";
import LeadDetailReadOnly from "./LeadDetailReadOnly";
import CounsellorInbox from "./inbox/CounsellorInbox";
import CounsellorDashboard from "./counsellors/CounsellorDashboard";
import FollowUps from "./counsellors/FollowUps";
import CreateFollowUp from "./counsellors/CreateFollowUp";
import Calls from "./counsellors/Calls";
import CreateCall from "./counsellors/CreateCall";
import CounsellorPerformance from "./counsellors/CounsellorPerformance";
import CounsellorAvailability from "./counsellors/CounsellorAvailability";
import AdminReports from "./reports/AdminReports";
import WhatsAppDashboard from "./whatsapp/WhatsAppDashboard";
import WhatsAppConfiguration from "./whatsapp/WhatsAppConfiguration";
import CampaignList from "./campaigns/CampaignList";
import CreateCampaign from "./campaigns/CreateCampaign";
import CampaignDetails from "./campaigns/CampaignDetails";
import {
  getChatbotBuilderRequest,
  listChatbotsRequest,
  logoutRequest,
  getAdminDashboardRequest,
  assignLeadRequest,
  getCompanyProfileRequest,
} from "@/lib/authApi";
import {
  formatDisplayDate,
  formatISODate,
  resolvePeriodDates,
} from "./datePeriodUtils";
import TwoMonthDateRangePicker from "./TwoMonthDateRangePicker";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const iconMap = {
  LayoutDashboard,
  Inbox,
  UsersRound,
  MessagesSquare,
  Bot,
  MessageCircle,
  Phone,
  Send,
  Workflow,
  ContactRound,
  BarChart3,
  Users,
  Settings2,
  CalendarDays,
};

const ADMIN_ONLY_SCREENS = new Set([
  "dashboard",
  "companyProfile",
  "rolesPermissions",
  "auditLogs",
  "settings",
  "chatbots",
  "createChatbot",
  "chatbotBuilder",
  "chatbotConversations",
  "chatbotPreview",
  "chatbotSettings",
  "knowledgeBase",
  "addKnowledgeSource",
  "widget",
  "widgetCustomize",
  "widgetEmbedCode",
  "aiAgents",
  "aiUsage",
  "conversationAnalytics",
  "callAnalytics",
  "whatsapp",
  "whatsappConfiguration",
  "whatsappConnection",
  "whatsappNumbers",
  "whatsappTemplates",
  "whatsappCreateTemplate",
  "leadManagement",
  "leadDashboard",
  "leadKanban",
  "leadSources",
  "leadTags",
  "leadAnalytics",
  "counsellors",
  "createCounsellor",
  "addCounsellor",
  "headCounsellorDashboard",
  "headCounsellorTeamPerformance",
  "campaigns",
  "campaignBuilder",
  "campaignDetails",
  "campaignAnalytics",
  "automation",
  "automationBuilder",
  "automationLogs",
  "workflowDetails",
  "contacts",
  "reports",
  "reportBuilder",
]);

const COUNSELLOR_ONLY_SCREENS = new Set([
  "counsellorDashboard",
]);

const kpis = [
  {
    title: "New Leads Today",
    value: "248",
    change: "12.5%",
    icon: UsersRound,
    bg: "bg-blue-100",
    color: "text-blue-600",
    border: "border-t-blue-500",
    line: "#3b82f6",
    data: [62, 81, 95, 122, 102, 116, 148],
  },
  {
    title: "Active Conversations",
    value: "186",
    change: "8.3%",
    icon: MessagesSquare,
    bg: "bg-sky-100",
    color: "text-sky-600",
    border: "border-t-sky-500",
    line: "#0ea5e9",
    data: [92, 112, 105, 130, 126, 148, 186],
  },
  {
    title: "AI Resolution Rate",
    value: "72%",
    change: "6.1%",
    icon: Sparkles,
    bg: "bg-violet-100",
    color: "text-violet-600",
    border: "border-t-violet-500",
    line: "#8b5cf6",
    data: [51, 55, 58, 62, 64, 68, 72],
  },
  {
    title: "WhatsApp Sent",
    value: "1,342",
    change: "15.2%",
    icon: MessageCircle,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
    border: "border-t-emerald-500",
    line: "#10b981",
    data: [650, 780, 740, 890, 940, 1100, 1342],
  },
  {
    title: "Calls Today",
    value: "96",
    change: "4.4%",
    icon: Phone,
    bg: "bg-blue-100",
    color: "text-blue-600",
    border: "border-t-blue-500",
    line: "#2563eb",
    data: [55, 62, 58, 72, 68, 88, 96],
  },
  {
    title: "Conversion Rate",
    value: "18.6%",
    change: "2.8%",
    icon: BarChart3,
    bg: "bg-purple-100",
    color: "text-purple-600",
    border: "border-t-purple-500",
    line: "#a855f7",
    data: [11, 12, 13, 15, 14, 17, 18.6],
  },
];

const leads = [
  {
    name: "Aarav Mehta",
    programme: "B.Tech Computer Science",
    source: "WhatsApp",
    status: "New",
    updated: "10 min ago",
  },
  {
    name: "Neha Kapoor",
    programme: "MBA",
    source: "Website",
    status: "Qualified",
    updated: "28 min ago",
  },
  {
    name: "Rohan Singh",
    programme: "BBA",
    source: "Call",
    status: "Follow-up",
    updated: "1 hour ago",
  },
  {
    name: "Isha Malhotra",
    programme: "MCA",
    source: "Instagram",
    status: "New",
    updated: "2 hours ago",
  },
  {
    name: "Kabir Shah",
    programme: "B.Com",
    source: "WhatsApp",
    status: "Counselling booked",
    updated: "Today, 9:12 AM",
  },
];

const attention = [
  [
    "New inquiry from Aarav Mehta",
    "Hi, I want to know about B.Tech admissions...",
    "10 min ago",
    "WhatsApp",
  ],
  [
    "Website lead from Neha Kapoor",
    "Interested in MBA program for 2026.",
    "28 min ago",
    "Website",
  ],
  [
    "New inquiry from Rohan Singh",
    "Can you share fee structure?",
    "1 hour ago",
    "WhatsApp",
  ],
  [
    "Missed call from +91 98765 43210",
    "No response yet",
    "2 hours ago",
    "Call",
  ],
];

const overdueAttention = [
  [
    "Follow-up for Ishita Verma",
    "Counselling request needs a response.",
    "35 min overdue",
    "Call",
  ],
  [
    "Reply to Kunal Gupta",
    "Asked for BBA programme fee details.",
    "1 hour overdue",
    "WhatsApp",
  ],
  [
    "Website lead from Simran Kaur",
    "Complete lead qualification before today.",
    "2 hours overdue",
    "Website",
  ],
  [
    "Follow-up for Dev Sharma",
    "Requested a callback from the admissions team.",
    "3 hours overdue",
    "Call",
  ],
];

const activities = [
  [
    "PS",
    "Priya Sharma",
    "Replied to a new lead via WhatsApp",
    "10 min ago",
    "bg-emerald-100 text-emerald-700",
  ],
  [
    "AR",
    "Aman Raj",
    "Booked a counselling for Neha Kapoor",
    "28 min ago",
    "bg-orange-100 text-orange-700",
  ],
  [
    "AI",
    "AI Agent",
    "Resolved 12 conversations automatically",
    "45 min ago",
    "bg-blue-100 text-blue-700",
  ],
  [
    "KS",
    "Karan Singh",
    "Updated lead status to Qualified",
    "1 hour ago",
    "bg-violet-100 text-violet-700",
  ],
  [
    "NT",
    "Neha Tiwari",
    "Added a note in Rohan's profile",
    "2 hours ago",
    "bg-teal-100 text-teal-700",
  ],
];

const dataTableStyles = {
  headCells: {
    style: {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      fontSize: "12px",
      fontWeight: 700,
      paddingLeft: "20px",
      paddingRight: "20px",
    },
  },
  cells: {
    style: {
      paddingLeft: "20px",
      paddingRight: "20px",
      color: "#334155",
      fontSize: "13px",
    },
  },
  rows: {
    style: { minHeight: "58px", borderBottomColor: "#e2e8f0" },
    highlightOnHoverStyle: { backgroundColor: "#f8fbff", outline: "none" },
  },
  pagination: {
    style: { borderTopColor: "#e2e8f0", fontSize: "12px", color: "#64748b" },
  },
};

function safeFormatDisplayDate(dateStr) {
  if (!dateStr) return "";
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${d} ${months[m - 1]} ${y}`;
  }
  return formatDisplayDate(dateStr);
}

function formatDateRange(range) {
  if (!range || !range.start || !range.end) return "";
  return `${safeFormatDisplayDate(range.start)} – ${safeFormatDisplayDate(range.end)}`;
}

function ShieldMark() {
  return (
    <svg
      width="19"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Sparkline({ color, data }) {
  return (
    <div className="mt-4 h-10">
      <Line
        data={{
          labels: data.map((_, index) => index),
          datasets: [
            {
              data,
              borderColor: color,
              borderWidth: 2,
              tension: 0.45,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
        }}
      />
    </div>
  );
}

function KpiCard({ item }) {
  const Icon = item.icon || UsersRound;
  const isDown =
    item.trend === "down" ||
    item.deltaType === "down" ||
    String(item.change || "").startsWith("-");
  return (
    <article
      className={`rounded-2xl border border-slate-200 border-t-4 ${item.border || "border-t-blue-500"} bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl ${item.bg || "bg-blue-100"} ${item.color || "text-blue-600"}`}
        >
          <Icon size={22} />
        </span>
        <p className="text-xs font-medium text-slate-600">{item.title}</p>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
        {item.value}
      </p>
      <p className="mt-2 text-xs text-slate-400">
        <span
          className={`font-semibold ${isDown ? "text-rose-600" : "text-emerald-600"}`}
        >
          {isDown ? "↓" : "↑"} {String(item.change || "").replace(/^[+-]/, "")}
        </span>
        <span className="ml-2">{item.comparison || "vs yesterday"}</span>
      </p>
      <Sparkline
        color={item.line || "#3b82f6"}
        data={item.sparkline || item.data || [0, 0, 0, 0, 0, 0, 0]}
      />
    </article>
  );
}

function DateRangePicker({ value, onChange }) {
  return <TwoMonthDateRangePicker value={value} onChange={onChange} align="right" />;
}

function ProfileMenu({ onNavigate, onLogout, user, companyProfile }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const userRole =
    user?.role === "HEAD_COUNSELLOR" ? "COUNSELLOR" : user?.role || "ADMIN";
  const initials = user?.name
    ? user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : userRole === "COUNSELLOR"
      ? "CO"
      : "CA";
  const roleLabel = userRole === "COUNSELLOR" ? "Counsellor" : "Client Admin";
  const orgLabel =
    companyProfile?.companyName || user?.companyName || user?.tenantName || "Solmento AI";
  const avatarUrl =
    companyProfile?.logoUrl ||
    companyProfile?.logo_url ||
    user?.profilePhoto ||
    user?.profile_photo ||
    null;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:bg-slate-50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.name || roleLabel}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 bg-white"
          />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {initials}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <b className="block text-sm text-slate-900">{user?.name || roleLabel}</b>
          <small className="block text-[10px] text-slate-500">
            {orgLabel}
          </small>
        </span>
        <ChevronDown size={15} className="hidden text-slate-500 sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <button
            onClick={() => {
              onNavigate("profile");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <CircleUserRound size={16} /> Profile
          </button>
          <button
            onClick={() => {
              onNavigate("notifications");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Bell size={16} /> Notifications
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

function HeaderSearch({ onNavigate, userRole = "ADMIN", permissions = [] }) {
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchNav = getNavForRole(userRole, permissions);
  const searchItems = [
    ...(userRole === "ADMIN"
      ? [{ id: "chatbots", label: "Chatbots", detail: "AI Agents" }]
      : []),
    ...searchNav.map(([id, label]) => ({
      id: id === "settings" ? "companyProfile" : id,
      label,
      detail: userRole === "COUNSELLOR" ? "Counsellor page" : "Admin page",
    })),
    ...leads.map((lead) => ({
      id: "counsellors",
      label: lead.name,
      detail: lead.programme,
    })),
  ];
  const results = searchItems.filter((item) =>
    `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase()),
  );
  const selectResult = (item) => {
    onNavigate(item.id);
    setQuery("");
    setMobileOpen(false);
  };
  const resultList = query.trim() ? (
    <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
      {results.length ? (
        results.slice(0, 7).map((item) => (
          <button
            key={`${item.id}-${item.label}`}
            type="button"
            onClick={() => selectResult(item)}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50"
          >
            <span className="block text-sm font-medium text-slate-800">
              {item.label}
            </span>
            <span className="block text-xs text-slate-500">{item.detail}</span>
          </button>
        ))
      ) : (
        <p className="px-3 py-3 text-sm text-slate-500">No matching results.</p>
      )}
    </div>
  ) : null;

  return (
    <>
      <div className="relative hidden max-w-3xl flex-1 lg:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search counsellors, conversations, contacts..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
        {query.trim() && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50">
            {resultList}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Search dashboard"
        className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:ml-0 lg:hidden"
      >
        <Search size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/35 p-3 sm:p-5 lg:hidden">
          <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
            <div className="relative flex items-center gap-2">
              <Search className="ml-2 shrink-0 text-slate-400" size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search counsellors, conversations, contacts..."
                className="min-w-0 flex-1 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close search"
              >
                <X size={19} />
              </button>
            </div>
            <div className="mt-2">
              {resultList || (
                <p className="px-3 py-4 text-sm text-slate-500">
                  Type a page, counsellor, or contact name to search.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ClientHeader({
  onMenu,
  onNavigate,
  onLogout,
  user,
  userRole = "ADMIN",
  permissions = [],
  companyProfile = null,
}) {
  return (
    <header className="z-30 flex h-[68px] shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:gap-3 sm:px-6">
      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <span className="hidden h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white lg:grid">
          <ShieldMark />
        </span>
        <strong className="whitespace-nowrap text-lg tracking-tight text-slate-950">
          Solmento <span className="text-blue-600">AI</span>
        </strong>
      </div>
      <span className="hidden h-8 border-l border-slate-200 lg:block" />
      <button
        onClick={onMenu}
        aria-label="Toggle sidebar"
        className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 lg:block"
      >
        <Menu size={19} />
      </button>
      <HeaderSearch
        onNavigate={onNavigate}
        userRole={userRole}
        permissions={permissions}
      />
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-auto">
        <NotificationBellDropdown onNavigate={onNavigate} />
        <ProfileMenu
          onNavigate={onNavigate}
          onLogout={onLogout}
          user={user}
          companyProfile={companyProfile}
        />
      </div>
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
      >
        <Menu size={19} />
      </button>
    </header>
  );
}

function ClientSidebar({
  open,
  mobileOpen,
  onClose,
  onNavigate,
  activeNav,
  activeScreen,
  userRole = "ADMIN",
  permissions = [],
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const settingsExpanded =
    settingsOpen ||
    activeScreen === "companyProfile" ||
    activeScreen === "rolesPermissions" ||
    activeScreen === "auditLogs" ||
    activeScreen === "profile" ||
    activeScreen === "profileEdit";
  const leadExpanded = leadOpen;

  const navItems = useMemo(
    () => getNavForRole(userRole, permissions),
    [userRole, permissions],
  );

  const content = (
    <>
      <nav className="space-y-1 px-3 py-5">
        {navItems.map(([id, label, iconName]) => {
          const Icon = iconMap[iconName] || UsersRound;
          const active =
            activeNav === id ||
            activeScreen === id ||
            (id === "studentLeads" &&
              (activeScreen === "studentLeads" ||
                activeScreen === "studentLeadDetails")) ||
            (id === "counsellorDashboard" &&
              activeScreen === "counsellorDashboard") ||
            (id === "counsellorPerformance" &&
              activeScreen === "counsellorPerformance") ||
            (id === "counsellorAvailability" &&
              activeScreen === "counsellorAvailability") ||
            (id === "followUps" &&
              (activeScreen === "followUps" ||
                activeScreen === "createFollowUp")) ||
            (id === "calls" &&
              (activeScreen === "calls" ||
                activeScreen === "logCall" ||
                activeScreen === "makeCall"));

          if (id === "leadDashboard") {
            const studentLeadsActive =
              activeScreen === "studentLeads" ||
              activeScreen === "studentLeadDetails";
            const leadMgmtActive = activeScreen === "leadManagement";
            return (
              <div key={id}>
                <button
                  type="button"
                  onClick={() => {
                    setLeadOpen((prev) => !prev);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${leadExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {leadExpanded && (
                  <div className="mt-1 space-y-1 border-l border-slate-200 py-1 pl-4 ml-5">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        onNavigate("studentLeads");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${studentLeadsActive ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <UsersRound size={15} /> Student Leads
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        onNavigate("leadManagement");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${leadMgmtActive ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <ContactRound size={15} /> Lead Management
                    </button>
                  </div>
                )}
              </div>
            );
          }

          if (id === "settings") {
            return (
              <div key={id}>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen((prev) => !prev);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${settingsExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {settingsExpanded && (
                  <div className="mt-1 space-y-1 border-l border-slate-200 py-1 pl-4 ml-5">
                    <button
                      type="button"
                      onClick={() => {
                        setLeadOpen(false);
                        onNavigate("companyProfile");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${activeScreen === "companyProfile" ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <Building2 size={15} /> Company Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLeadOpen(false);
                        onNavigate("rolesPermissions");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${activeScreen === "rolesPermissions" ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <ShieldCheck size={15} /> Roles & Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLeadOpen(false);
                        onNavigate("auditLogs");
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition ${activeScreen === "auditLogs" ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      <Clock size={15} /> Audit Logs
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={id}
              onClick={() => {
                setSettingsOpen(false);
                setLeadOpen(false);
                onNavigate(id);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
  return (
    <>
      <aside
        className={`${open ? "lg:flex" : "lg:hidden"} hidden h-full w-60 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white`}
      >
        <div className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col">{content}</div>
        </div>
      </aside>
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <button
          aria-label="Close menu"
          onClick={onClose}
          className={`absolute inset-0 bg-slate-900/35 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 flex h-dvh w-72 max-w-[82vw] flex-col overflow-hidden bg-white shadow-2xl transition-transform ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <strong className="text-lg tracking-tight text-slate-950">
              Solmento <span className="text-blue-600">AI</span>
            </strong>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <X size={18} />
            </button>
          </div>
          <div className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col">{content}</div>
          </div>
        </aside>
      </div>
    </>
  );
}

function CardHeading({ title, subtitle, children }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-bold text-slate-950">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function PeriodSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-blue-400"
    >
      <option value="Today">Today</option>
      <option value="Last 7 days">Last 7 days</option>
      <option value="Last 30 days">Last 30 days</option>
      <option value="This quarter">This quarter</option>
      {value === "Custom" && <option value="Custom">Custom Range</option>}
    </select>
  );
}

const DASHBOARD_KPI_ICONS = {
  newLeadsToday: UsersRound,
  activeConversations: MessagesSquare,
  aiResolutionRate: Sparkles,
  totalLeads: Database,
  callsToday: Phone,
  conversionRate: BarChart3,
};

function ClientDashboard({ onNavigate, user }) {
  const adminName = useMemo(() => {
    if (user?.name) return user.name;
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("user") || localStorage.getItem("user"),
      );
      return stored?.name || stored?.fullName || "Client Admin";
    } catch {
      return "Client Admin";
    }
  }, [user]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Good evening";
    if (hour >= 5 && hour < 12) {
      timeGreeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
    } else {
      timeGreeting = "Good evening";
    }
    return `${timeGreeting}, ${adminName}! 👋`;
  }, [adminName]);

  const initialDates = useMemo(() => {
    const resolved = resolvePeriodDates("Last 7 days");
    return {
      start: resolved.startDate,
      end: resolved.endDate,
      period: "Last 7 days",
    };
  }, []);

  const [dateRange, setDateRange] = useState(initialDates);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [attentionTab, setAttentionTab] = useState("unassigned");
  const [assignModalLead, setAssignModalLead] = useState(null);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handlePeriodChange = (preset) => {
    const resolved = resolvePeriodDates(preset);
    setDateRange({
      start: resolved.startDate,
      end: resolved.endDate,
      period: preset,
    });
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange({
      start: newRange.start,
      end: newRange.end,
      period: newRange.period || "Custom",
    });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getAdminDashboardRequest({
      startDate: dateRange.start,
      endDate: dateRange.end,
      period: dateRange.period,
    })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          setDashboardData(res.data);
        } else if (res && typeof res === "object") {
          setDashboardData(res);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard data",
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateRange.start, dateRange.end, dateRange.period, refreshTrigger]);

  const defaultKpis = useMemo(
    () => [
      {
        key: "newLeadsToday",
        title: "New Leads Today",
        value: "0",
        change: "0%",
        trend: "neutral",
        comparison: "vs yesterday",
        border: "border-t-blue-500",
        bg: "bg-blue-100",
        color: "text-blue-600",
        line: "#3b82f6",
        sparkline: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: "activeConversations",
        title: "Active Conversations",
        value: "0",
        change: "0%",
        trend: "neutral",
        comparison: "vs yesterday",
        border: "border-t-sky-500",
        bg: "bg-sky-100",
        color: "text-sky-600",
        line: "#0ea5e9",
        sparkline: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: "aiResolutionRate",
        title: "AI Resolution Rate",
        value: "0%",
        change: "0%",
        trend: "neutral",
        comparison: "vs yesterday",
        border: "border-t-violet-500",
        bg: "bg-violet-100",
        color: "text-violet-600",
        line: "#8b5cf6",
        sparkline: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: "totalLeads",
        title: "Total Leads",
        value: "0",
        change: "0%",
        trend: "neutral",
        comparison: "vs last week",
        border: "border-t-emerald-500",
        bg: "bg-emerald-100",
        color: "text-emerald-600",
        line: "#10b981",
        sparkline: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: "callsToday",
        title: "Calls Today",
        value: "0",
        change: "0%",
        trend: "neutral",
        comparison: "vs yesterday",
        border: "border-t-blue-500",
        bg: "bg-blue-100",
        color: "text-blue-600",
        line: "#2563eb",
        sparkline: [0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: "conversionRate",
        title: "Conversion Rate",
        value: "0%",
        change: "0%",
        trend: "neutral",
        comparison: "vs last week",
        border: "border-t-purple-500",
        bg: "bg-purple-100",
        color: "text-purple-600",
        line: "#a855f7",
        sparkline: [0, 0, 0, 0, 0, 0, 0],
      },
    ],
    [],
  );

  const kpis = useMemo(() => {
    const raw = dashboardData?.kpis?.length ? dashboardData.kpis : defaultKpis;
    return raw.map((item) => ({
      ...item,
      icon: DASHBOARD_KPI_ICONS[item.id || item.key] || UsersRound,
    }));
  }, [dashboardData?.kpis, defaultKpis]);

  const lineData = useMemo(() => {
    const labels = dashboardData?.leadsOverTime?.labels?.length
      ? dashboardData.leadsOverTime.labels
      : ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
    const data = dashboardData?.leadsOverTime?.data?.length
      ? dashboardData.leadsOverTime.data
      : [0, 0, 0, 0, 0, 0, 0];
    return {
      labels,
      datasets: [
        {
          label: "Leads",
          data,
          borderColor: "#1677ff",
          backgroundColor: "rgba(22,119,255,.12)",
          fill: true,
          tension: 0.38,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: "#1677ff",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [dashboardData?.leadsOverTime]);

  const maxLeadVal = Math.max(
    ...(dashboardData?.leadsOverTime?.data || [0]),
    5,
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 10,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: "#64748b", font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          suggestedMax: Math.ceil(maxLeadVal * 1.2),
          grid: { color: "#e2e8f0" },
          border: { display: false },
          ticks: {
            color: "#94a3b8",
            stepSize: maxLeadVal > 20 ? 10 : 1,
            font: { size: 11 },
          },
        },
      },
    }),
    [maxLeadVal],
  );

  const channels = useMemo(
    () => dashboardData?.conversationsByChannel?.channels || [],
    [dashboardData?.conversationsByChannel?.channels],
  );
  const totalChannelConvs = dashboardData?.conversationsByChannel?.total ?? 0;
  const hasChannelData = channels.some((c) => (c.count || 0) > 0);

  const channelChartData = useMemo(() => {
    if (!hasChannelData) {
      return {
        labels: ["No Conversations"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 0,
          },
        ],
      };
    }
    return {
      labels: channels.map((c) => c.name),
      datasets: [
        {
          data: channels.map((c) => c.count),
          backgroundColor: channels.map(
            (c) =>
              c.hex ||
              (c.name.toLowerCase().includes("whatsapp")
                ? "#25D366"
                : c.name.includes("Widget")
                  ? "#3b82f6"
                  : c.name.includes("Chatbot")
                    ? "#10b981"
                    : c.name.includes("Direct")
                      ? "#8b5cf6"
                      : "#f59e0b"),
          ),
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [channels, hasChannelData]);

  const funnelStages = useMemo(() => {
    const raw = dashboardData?.conversionFunnel || [];
    const totalItem = raw.find((s) => /total/i.test(s.label)) || raw[0];
    const totalCount = Number(totalItem?.count || 0);

    const stagesConfig = [
      {
        matchRegex: /total/i,
        label: "Total Leads",
        color: "bg-blue-500",
      },
      {
        matchRegex: /contacted|engaged/i,
        label: "Contacted / Engaged",
        color: "bg-emerald-500",
      },
      {
        matchRegex: /qualified/i,
        label: "Qualified",
        color: "bg-violet-500",
      },
      {
        matchRegex: /convert|enroll/i,
        label: "Converted / Enrolled",
        color: "bg-amber-500",
      },
    ];

    return stagesConfig.map((stage) => {
      const found = raw.find((r) => stage.matchRegex.test(r.label));
      const count = found ? Number(found.count || 0) : 0;
      const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
      const roundedPct = Math.round(pct);
      // Count = 0 -> 0% bar width (visually empty). Count > 0 -> proportional bar width.
      const barWidth = count === 0 ? "0%" : `${Math.min(100, Math.max(pct, 2))}%`;

      return {
        label: stage.label,
        count,
        percentage: `${roundedPct}%`,
        barWidth,
        color: stage.color,
      };
    });
  }, [dashboardData?.conversionFunnel]);

  const unassignedList = dashboardData?.needsAttention?.unassigned || [];
  const overdueList = dashboardData?.needsAttention?.overdue || [];
  const unassignedCount = dashboardData?.needsAttention?.unassignedCount ?? 0;
  const overdueCount = dashboardData?.needsAttention?.overdueCount ?? 0;
  const visibleAttention =
    attentionTab === "unassigned" ? unassignedList : overdueList;

  const teamActivities = dashboardData?.teamActivity || [];
  const counsellors = dashboardData?.counsellors || [];

  const handleOpenAssignModal = (leadItem) => {
    setAssignModalLead(leadItem);
    setSelectedCounsellorId(counsellors[0]?.id ? String(counsellors[0].id) : "");
  };

  const handleConfirmAssignment = async () => {
    if (!assignModalLead || !selectedCounsellorId) return;
    try {
      setAssignSubmitting(true);
      await assignLeadRequest({
        leadId: assignModalLead.id,
        counsellorId: Number(selectedCounsellorId),
      });
      setToastMessage("Lead assigned successfully!");
      setAssignModalLead(null);
      setRefreshTrigger((prev) => prev + 1);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Assignment failed");
    } finally {
      setAssignSubmitting(false);
    }
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Assign Modal */}
      {assignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Assign Lead</h3>
              <button
                type="button"
                onClick={() => setAssignModalLead(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">
                  {assignModalLead.title}
                </p>
                <p className="mt-0.5 text-slate-500">{assignModalLead.text}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Counsellor:
                </label>
                {counsellors.length === 0 ? (
                  <p className="text-xs text-rose-500">
                    No active counsellors found. Please add a counsellor first.
                  </p>
                ) : (
                  <select
                    value={selectedCounsellorId}
                    onChange={(e) => setSelectedCounsellorId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    {counsellors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModalLead(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assignSubmitting || !selectedCounsellorId}
                onClick={handleConfirmAssignment}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {assignSubmitting && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your admissions today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
              <Loader2 size={14} className="animate-spin text-blue-600" />
              <span>Updating...</span>
            </div>
          )}
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* TOP 6 KPI CARDS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpis.map((item) => (
          <KpiCard item={item} key={item.key || item.title} />
        ))}
      </section>

      {/* =========================================================
          MAIN CHART ROW: 3 Equal SaaS Cards
          ========================================================= */}
      <section className="mt-4 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Leads Over Time */}
        <article className="flex h-[360px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm xl:h-[360px]">
          <CardHeading
            title="Leads Over Time"
            subtitle="Total leads captured from all channels"
          >
            <PeriodSelect
              value={dateRange.period}
              onChange={handlePeriodChange}
            />
          </CardHeading>

          <div className="mt-2 min-h-0 flex-1">
            <Line data={lineData} options={lineOptions} />
          </div>
        </article>

        {/* Conversations by Channel */}
        <article className="flex h-[360px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-emerald-500 bg-white p-5 shadow-sm xl:h-[360px]">
          <CardHeading
            title="Conversations by Channel"
            subtitle="Total conversations across all channels"
          >
            <PeriodSelect
              value={dateRange.period}
              onChange={handlePeriodChange}
            />
          </CardHeading>

          <div
            className="mt-2 flex min-h-0 flex-1 items-center overflow-hidden"
            style={{ gap: 12 }}
          >
            <div
              className="relative shrink-0"
              style={{ width: 140, height: 140 }}
            >
              <Doughnut
                data={channelChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "67%",
                  layout: { padding: 0 },
                  plugins: { legend: { display: false } },
                }}
              />

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <strong className="text-xl font-bold leading-none text-slate-950">
                  {totalChannelConvs.toLocaleString()}
                </strong>
                <span className="mt-1 text-[10px] text-slate-500">
                  Conversations
                </span>
              </div>
            </div>

            <div className="min-w-0" style={{ width: "calc(100% - 152px)" }}>
              {channels.map((ch) => (
                <div
                  key={ch.name}
                  className="grid items-center gap-1.5 py-1.5 text-xs"
                  style={{
                    gridTemplateColumns: "12px minmax(0, 1fr) 34px 28px",
                  }}
                >
                  <i
                    className={`h-2.5 w-2.5 rounded-full ${ch.name.toLowerCase().includes("whatsapp")
                      ? "bg-emerald-500"
                      : ch.color || "bg-blue-500"
                      }`}
                    style={ch.hex ? { backgroundColor: ch.hex } : undefined}
                  />
                  <span className="truncate text-slate-600">{ch.name}</span>
                  <b className="text-right text-slate-900">{ch.percentage}</b>
                  <span className="text-right text-slate-400">{ch.count}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Conversion Funnel */}
        <article className="flex h-[360px] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-5 shadow-sm md:col-span-2 xl:col-span-1 xl:h-[360px]">
          <CardHeading title="Conversion Funnel">
            <PeriodSelect
              value={dateRange.period}
              onChange={handlePeriodChange}
            />
          </CardHeading>

          <div className="mt-3 min-h-0 flex-1 overflow-hidden">
            <div className="space-y-3.5">
              {funnelStages.map((stage) => (
                <div key={stage.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-600">{stage.label}</span>
                    <b className="text-slate-900">
                      {stage.count.toLocaleString()}
                    </b>
                  </div>

                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <i
                      className={`block h-2.5 rounded-full ${stage.color} transition-all duration-500`}
                      style={{
                        width: stage.barWidth,
                      }}
                    />
                  </div>

                  <span className="float-right mt-0.5 text-[10px] text-slate-400 font-medium">
                    {stage.percentage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* =========================================================
          MIDDLE ROW: Needs Attention, Team Activity, Quick Actions
          ========================================================= */}
      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Needs Attention */}
        <article className="flex flex-col h-[380px] overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-rose-500 bg-white shadow-sm xl:col-span-5">
          <div className="shrink-0 border-b border-slate-100 p-5">
            <CardHeading title="🔴 Needs Attention">
              <button
                type="button"
                onClick={() => onNavigate("studentLeads")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All →
              </button>
            </CardHeading>
            <div className="flex gap-5 text-xs">
              <button
                type="button"
                onClick={() => setAttentionTab("unassigned")}
                className={`border-b-2 pb-2 font-semibold transition-colors ${attentionTab === "unassigned"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
              >
                Unassigned ({unassignedCount})
              </button>
              <button
                type="button"
                onClick={() => setAttentionTab("overdue")}
                className={`border-b-2 pb-2 font-semibold transition-colors ${attentionTab === "overdue"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
              >
                Overdue Follow-ups ({overdueCount})
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 divide-y divide-slate-100 overflow-y-auto">
            {visibleAttention.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No {attentionTab === "unassigned" ? "unassigned leads" : "overdue follow-ups"} pending.
              </div>
            ) : (
              visibleAttention.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50/50"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.badge === "Overdue"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-emerald-100 text-emerald-600"
                      }`}
                  >
                    {item.channel === "Call" ? (
                      <Phone size={15} />
                    ) : item.channel === "Website" ? (
                      <Globe2 size={15} />
                    ) : (
                      <MessageCircle size={15} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {item.text}
                    </p>
                  </div>
                  <span className="hidden text-[10px] text-slate-400 sm:block">
                    {item.time}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-medium ${item.badge === "Overdue"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-rose-50 text-rose-600"
                      }`}
                  >
                    {item.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(item)}
                    className="rounded-md border border-blue-300 px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 transition"
                  >
                    Assign
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Team Activity */}
        <article className="flex flex-col h-[380px] rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm xl:col-span-4">
          <div className="shrink-0">
            <CardHeading title="👥 Team Activity">
              <button
                type="button"
                onClick={() => onNavigate("counsellorPerformance")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All →
              </button>
            </CardHeading>
          </div>

          <div className="flex-1 min-h-0 space-y-3.5 overflow-y-auto pr-1 mt-1">
            {teamActivities.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center text-center text-xs text-slate-400">
                <Users size={28} className="mb-2 text-slate-300" />
                <p>No recent team activity in this period.</p>
              </div>
            ) : (
              teamActivities.map((act) => (
                <div key={act.id} className="flex gap-2.5 items-start">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${act.tone || "bg-blue-100 text-blue-700"}`}
                  >
                    {act.initials || "SK"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {act.name}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {act.text}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-[10px] text-slate-400">
                    {act.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Quick Actions: 2x2 Clean Grid matching Reference 2 */}
        <article className="flex flex-col h-[380px] rounded-2xl border border-slate-200 border-t-4 border-t-amber-500 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="shrink-0">
            <CardHeading title="⚡ Quick Actions" />
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 items-stretch mt-3">
            {[
              {
                label: "Add New Lead",
                action: () => onNavigate("studentLeads"),
                Icon: Plus,
                cardBg: "bg-blue-50/70 hover:bg-blue-100/80 border-blue-200/80 hover:border-blue-300",
                textColor: "text-blue-700",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-100/90",
              },
              {
                label: "Manage Team",
                action: () => onNavigate("counsellors"),
                Icon: Users,
                cardBg: "bg-purple-50/70 hover:bg-purple-100/80 border-purple-200/80 hover:border-purple-300",
                textColor: "text-purple-700",
                iconColor: "text-purple-600",
                iconBg: "bg-purple-100/90",
              },
              {
                label: "View Reports",
                action: () => onNavigate("reports"),
                Icon: BarChart3,
                cardBg: "bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200/80 hover:border-emerald-300",
                textColor: "text-emerald-700",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-100/90",
              },
              {
                label: "Widget Settings",
                action: () => onNavigate("widgetEmbedCode"),
                Icon: Settings2,
                cardBg: "bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/80 hover:border-amber-300",
                textColor: "text-amber-700",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-100/90",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-[11px] font-semibold transition hover:shadow-sm ${item.cardBg} ${item.textColor}`}
              >
                <div className={`grid h-8 w-8 place-items-center rounded-lg ${item.iconBg}`}>
                  <item.Icon size={18} className={item.iconColor} />
                </div>
                <span className="text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      {/* =========================================================
          BOTTOM ROW: 3 Informational Action Cards matching Reference 2
          (WhatsApp card removed!)
          ========================================================= */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            title: "Turn your website visitors into leads",
            text: "Install the SolmentoAI widget on your website to capture inquiries 24/7 and engage students instantly.",
            cta: "Get Widget Code",
            action: () => onNavigate("widgetEmbedCode"),
            Icon: Globe2,
            border: "border-t-blue-500",
            iconColor: "text-blue-600",
            buttonBg: "bg-blue-600 hover:bg-blue-700",
          },
          {
            title: "Configure your AI Chatbot",
            text: "Set up AI agents to handle FAQs, qualify leads and support your counselling team automatically.",
            cta: "Configure AI",
            action: () => onNavigate("chatbots"),
            Icon: Bot,
            border: "border-t-violet-500",
            iconColor: "text-violet-600",
            buttonBg: "bg-violet-600 hover:bg-violet-700",
          },
          {
            title: "Monitor Team Performance",
            text: "Track your counsellors' activity, productivity and conversion performance in real-time.",
            cta: "View Team Reports",
            action: () => onNavigate("counsellorPerformance"),
            Icon: Users,
            border: "border-t-emerald-500",
            iconColor: "text-emerald-600",
            buttonBg: "bg-emerald-600 hover:bg-emerald-700",
          },
        ].map(
          ({
            title,
            text,
            cta,
            action,
            Icon,
            border,
            iconColor,
            buttonBg,
          }) => (
            <article
              key={title}
              className={`relative overflow-hidden rounded-2xl border border-slate-200 border-t-4 ${border} bg-white p-5 shadow-sm flex flex-col justify-between`}
            >
              <div>
                <Icon className={iconColor} size={24} />
                <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={action}
                  className={`rounded-lg ${buttonBg} px-3.5 py-2 text-xs font-semibold text-white transition shadow-sm`}
                >
                  {cta}
                </button>
              </div>
            </article>
          ),
        )}
      </section>
    </>
  );
}

function WorkspaceScreen({ screenId, routeInfo, onNavigate }) {
  const screen = routeInfo ?? clientAdminScreens[screenId];
  const isDetail =
    screen.detail === true || /Detail|Config|Builder|Member/.test(screenId);
  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <b className="text-slate-800">{row.name}</b>,
    },
    { name: "Programme", selector: (row) => row.programme, sortable: true },
    { name: "Source", selector: (row) => row.source },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {row.status}
        </span>
      ),
    },
    { name: "Last activity", selector: (row) => row.updated, sortable: true },
    {
      name: "Actions",
      cell: () => (
        <button className="text-blue-600">
          <MoreHorizontal size={18} />
        </button>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          {isDetail && (
            <button
              onClick={() => onNavigate("dashboard")}
              className="mb-2 flex items-center gap-1 text-sm font-semibold text-blue-600"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            {screen.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{screen.subtitle}</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} /> {isDetail ? "Save changes" : "Create new"}
        </button>
      </div>
      {isDetail ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="font-bold text-slate-900">{screen.title} details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {["Name", "Owner", "Status", "Channel"].map((label) => (
                <label
                  key={label}
                  className="text-xs font-semibold text-slate-600"
                >
                  {label}
                  <input
                    defaultValue={
                      label === "Name"
                        ? "BrightMind admission workflow"
                        : label === "Status"
                          ? "Active"
                          : "Client Admin"
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-blue-500"
                  />
                </label>
              ))}
            </div>
            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Notes
              <textarea
                defaultValue="Keep this workspace configuration ready for future API integration."
                className="mt-1.5 min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-blue-500"
              />
            </label>
          </article>
          <article className="rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Recent activity</h2>
            <div className="mt-4 space-y-4">
              {[
                "Created by Client Admin",
                "Last updated today",
                "Ready for review",
              ].map((item, index) => (
                <div key={item} className="flex gap-3">
                  <i className="mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-sm text-slate-600">
                    {item}
                    <span className="block text-xs text-slate-400">
                      {index + 1} hour ago
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <h2 className="font-bold text-slate-900">
              {screen.title} overview
            </h2>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400">
              <Search size={15} /> Search {screen.title.toLowerCase()}...
            </label>
          </div>
          <DataTable
            columns={columns}
            data={leads}
            pagination
            highlightOnHover
            responsive
            customStyles={dataTableStyles}
          />
        </section>
      )}
    </>
  );
}

function widgetBaseUrl() {
  const configuredWidgetUrl = import.meta.env.VITE_WIDGET_BASE_URL;
  if (configuredWidgetUrl) return configuredWidgetUrl.replace(/\/$/, "");
  const configuredApiUrl = import.meta.env.VITE_API_URL;
  if (configuredApiUrl) {
    try {
      return new URL(configuredApiUrl, window.location.origin).origin;
    } catch {
      // Fall back to the current origin when an invalid optional env value is supplied.
    }
  }
  return window.location.origin;
}

function WidgetEmbedCode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedChatbotId = searchParams.get("chatbotId") || "";
  const [chatbots, setChatbots] = useState([]);
  const [selectedId, setSelectedId] = useState(requestedChatbotId);
  const [state, setState] = useState({
    status: "loading",
    builder: null,
    error: "",
  });
  const [copyState, setCopyState] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", builder: null, error: "" });
    listChatbotsRequest()
      .then((result) => {
        if (cancelled) return;
        const records = Array.isArray(result?.chatbots) ? result.chatbots : [];
        setChatbots(records);
        const requested = records.find(
          (chatbot) => String(chatbot.id) === requestedChatbotId,
        );
        const fallback =
          requested ||
          records.find((chatbot) => chatbot.publicId) ||
          records[0];
        const nextId = fallback ? String(fallback.id) : "";
        setSelectedId(nextId);
        if (nextId && nextId !== requestedChatbotId) {
          setSearchParams({ chatbotId: nextId }, { replace: true });
        }
        if (!nextId)
          setState({
            status: "error",
            builder: null,
            error: "No chatbot is available in this workspace.",
          });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            status: "error",
            builder: null,
            error: error?.message || "We could not load your chatbots.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [requestedChatbotId, setSearchParams]);

  useEffect(() => {
    if (!selectedId) return undefined;
    let cancelled = false;
    setState({ status: "loading", builder: null, error: "" });
    getChatbotBuilderRequest(selectedId)
      .then((builder) => {
        if (!cancelled) setState({ status: "ready", builder, error: "" });
      })
      .catch((error) => {
        if (!cancelled)
          setState({
            status: "error",
            builder: null,
            error: error?.message || "We could not load this chatbot.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const builder = state.builder;
  const chatbot = builder?.chatbot;
  const publicId = chatbot?.publicId || "";
  const isPublished =
    Boolean(publicId && builder?.publishedConfig) &&
    chatbot?.status === "active";
  const snippet = isPublished
    ? `<script src="${widgetBaseUrl()}/widget/chatbot-widget.min.js"></script>\n<script>\nwindow.mainChatbotWidget.init({\n  publicId: "${publicId}"\n});\n</script>`
    : "";

  const copyCode = async () => {
    if (!snippet) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = snippet;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  };

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
          Embed Code
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Copy the code needed to add this published chatbot to your website.
        </p>
      </div>
      <article className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm sm:p-6">
        <label className="block text-sm font-semibold text-slate-700">
          Chatbot
          <select
            value={selectedId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedId(nextId);
              setSearchParams({ chatbotId: nextId }, { replace: true });
              setCopyState("idle");
            }}
            disabled={state.status === "loading" || !chatbots.length}
            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {chatbots.map((record) => (
              <option key={record.id} value={record.id}>
                {record.name}
              </option>
            ))}
          </select>
        </label>

        {state.status === "loading" && (
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={17} className="animate-spin text-blue-600" />{" "}
            Loading chatbot publish status...
          </div>
        )}
        {state.status === "error" && (
          <p className="mt-6 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </p>
        )}
        {state.status === "ready" && !isPublished && (
          <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Publish this active chatbot before copying an embed code.
          </p>
        )}
        {state.status === "ready" && isPublished && (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Website installation code
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add this snippet before the closing <code>&lt;/body&gt;</code>{" "}
                  tag.
                </p>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {copyState === "copied" ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
                {copyState === "copied" ? "Copied" : "Copy Code"}
              </button>
            </div>
            {copyState === "error" && (
              <p className="mt-2 text-xs text-rose-600">
                Copy was blocked by the browser. Select the code and copy it
                manually.
              </p>
            )}
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code>{snippet}</code>
            </pre>
            <p className="mt-3 text-xs text-slate-500">
              Public ID:{" "}
              <code className="break-all text-slate-700">{publicId}</code>
            </p>
          </>
        )}
      </article>
    </section>
  );
}

export default function ClientAdminPanel() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const currentRoute = resolveClientAdminRoute(location.pathname);
  const activeScreen = currentRoute?.screen ?? "dashboard";
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mainRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(
          sessionStorage.getItem("user") || localStorage.getItem("user"),
        ) || null
      );
    } catch {
      return null;
    }
  });

  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadOrg = async () => {
      try {
        const res = await getCompanyProfileRequest();
        const payload = res?.data?.profile || res?.data || res?.profile || res;
        if (isMounted && payload && typeof payload === "object") {
          setCompanyProfile(payload);
        }
      } catch {
        // graceful fallback
      }
    };
    loadOrg();

    const handleProfileUpdate = (e) => {
      if (e?.detail) {
        setCompanyProfile(e.detail);
      } else {
        loadOrg();
      }
    };
    window.addEventListener("solmento:company-profile-updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("solmento:company-profile-updated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const u = JSON.parse(
          sessionStorage.getItem("user") || localStorage.getItem("user"),
        );
        if (u) setUser(u);
      } catch { }
    };
    window.addEventListener("storage", handleUserUpdate);
    window.addEventListener("solmento:user-updated", handleUserUpdate);
    return () => {
      window.removeEventListener("storage", handleUserUpdate);
      window.removeEventListener("solmento:user-updated", handleUserUpdate);
    };
  }, []);
  const userRole =
    user?.role === "HEAD_COUNSELLOR" ? "COUNSELLOR" : user?.role || "ADMIN";
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  useEffect(() => {
    const handleExpiredTenantSession = () => {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("chatbotAuthenticated");
      sessionStorage.removeItem("textChatHistory");
      sessionStorage.removeItem("voiceChatHistory");
      Object.keys(localStorage)
        .filter((key) => key.startsWith("solmento:"))
        .forEach((key) => localStorage.removeItem(key));
      routerNavigate("/auth/login?reason=session-expired", { replace: true });
    };
    window.addEventListener(
      "solmento:tenant-auth-expired",
      handleExpiredTenantSession,
    );
    return () =>
      window.removeEventListener(
        "solmento:tenant-auth-expired",
        handleExpiredTenantSession,
      );
  }, [routerNavigate]);

  const navigate = (screen) => {
    const defaultScreen =
      userRole === "COUNSELLOR" ? "counsellorDashboard" : "dashboard";
    routerNavigate(
      clientAdminRoutes[screen] ?? clientAdminRoutes[defaultScreen],
    );
    setMobileSidebarOpen(false);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggleSidebar = () => {
    if (window.innerWidth < 1024) setMobileSidebarOpen(true);
    else setDesktopSidebarOpen((current) => !current);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await logoutRequest().catch(() => undefined);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("solmento_token");
    sessionStorage.removeItem("solmento_token");
    sessionStorage.removeItem("chatbotAuthenticated");
    sessionStorage.removeItem("textChatHistory");
    sessionStorage.removeItem("voiceChatHistory");
    Object.keys(localStorage)
      .filter((key) => key.startsWith("solmento:"))
      .forEach((key) => localStorage.removeItem(key));
    routerNavigate("/auth/login", { replace: true });
  };

  if (!currentRoute) {
    const fallbackPath =
      userRole === "COUNSELLOR"
        ? "/app/counsellors/dashboard"
        : "/app/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  // Route-level role guards
  if (userRole === "COUNSELLOR") {
    const isAllowedTeam =
      (activeScreen === "team" || activeScreen === "teamMember") &&
      permissions.includes("team");
    if (ADMIN_ONLY_SCREENS.has(activeScreen) && !isAllowedTeam) {
      return <Navigate to="/app/counsellors/dashboard" replace />;
    }
  }

  if (userRole === "ADMIN" && COUNSELLOR_ONLY_SCREENS.has(activeScreen)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <ClientHeader
        onMenu={toggleSidebar}
        onNavigate={navigate}
        onLogout={handleLogout}
        user={user}
        userRole={userRole}
        permissions={permissions}
        companyProfile={companyProfile}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ClientSidebar
          open={desktopSidebarOpen}
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onNavigate={navigate}
          activeNav={currentRoute.nav}
          activeScreen={activeScreen}
          userRole={userRole}
          permissions={permissions}
        />
        <main
          ref={mainRef}
          className={`relative min-h-0 min-w-0 flex-1 ${activeScreen === "inbox"
            ? "flex flex-col overflow-hidden"
            : "overflow-y-auto overflow-x-hidden"
            }`}
        >
          <div
            className={`mx-auto w-full ${activeScreen === "inbox"
              ? "flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2.5 sm:px-5 sm:py-4 lg:px-7 lg:py-4"
              : "max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6"
              }`}
          >
            {activeScreen === "dashboard" ? (
              <ClientDashboard onNavigate={navigate} user={user} />
            ) : activeScreen === "counsellorDashboard" ? (
              <CounsellorDashboard onNavigate={navigate} user={user} />
            ) : activeScreen === "profile" ? (
              <AdminProfile onNavigate={navigate} user={user} />
            ) : activeScreen === "profileEdit" ? (
              <AdminProfileEdit onNavigate={navigate} user={user} />
            ) : activeScreen === "notifications" ? (
              <NotificationsPage
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "companyProfile" ? (
              <CompanyProfile onNavigate={navigate} />
            ) : activeScreen === "rolesPermissions" ? (
              <RolesPermissions onNavigate={navigate} />
            ) : activeScreen === "auditLogs" ? (
              <AuditLogs onNavigate={navigate} />
            ) : activeScreen === "team" ? (
              <TeamManagement onNavigate={navigate} />
            ) : activeScreen === "teamMember" ? (
              <AddTeamMember onNavigate={navigate} />
            ) : activeScreen === "chatbots" ? (
              <ChatbotList />
            ) : activeScreen === "createChatbot" ? (
              <CreateChatbot
                onNavigate={navigate}
                onOpenBuilder={(chatbotId) =>
                  routerNavigate(`/app/chatbots/${chatbotId}/builder`)
                }
              />
            ) : activeScreen === "chatbotBuilder" ? (
              <ChatbotDraftBuilder />
            ) : activeScreen === "chatbotConversations" ? (
              <ChatbotConversationsPage
                chatbotId={
                  location.pathname.match(
                    /^\/app\/chatbots\/([^/?#]+)\/conversations/,
                  )?.[1]
                }
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "counsellors" ? (
              <CounsellorManagement onNavigate={navigate} />
            ) : activeScreen === "createCounsellor" ? (
              <CreateCounsellor onNavigate={navigate} />
            ) : activeScreen === "leadDashboard" ? (
              <LeadDashboard />
            ) : activeScreen === "studentLeads" ? (
              <StudentLeads
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "studentLeadDetails" ? (
              <StudentLeadDetails
                leadId={
                  location.pathname.match(
                    /^\/app\/leads\/students\/([^/?#]+)/,
                  )?.[1]
                }
                onNavigate={navigate}
              />
            ) : activeScreen === "leadManagementEdit" ? (
              <EditLeadPage
                leadId={
                  location.pathname.match(
                    /^\/app\/leads\/management\/edit\/([^/?#]+)/,
                  )?.[1]
                }
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "leadManagement" ? (
              <LeadManagement
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "leadDetail" ? (
              <LeadDetailReadOnly
                leadId={
                  location.pathname.match(
                    /^\/app\/leads\/([^/?#]+)/,
                  )?.[1]
                }
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "widgetEmbedCode" ? (
              <WidgetEmbedCode />
            ) : activeScreen === "inbox" ? (
              <CounsellorInbox
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
              />
            ) : activeScreen === "followUps" ? (
              <FollowUps
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
                permissions={permissions}
              />
            ) : activeScreen === "createFollowUp" ? (
              <CreateFollowUp
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
                permissions={permissions}
              />
            ) : activeScreen === "calls" ? (
              <Calls
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
                permissions={permissions}
              />
            ) : activeScreen === "logCall" || activeScreen === "makeCall" ? (
              <CreateCall
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
                permissions={permissions}
              />
            ) : activeScreen === "counsellorPerformance" ? (
              <CounsellorPerformance
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
              />
            ) : activeScreen === "counsellorAvailability" ? (
              <CounsellorAvailability
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
              />
            ) : activeScreen === "reports" ||
              activeScreen === "leadReports" ||
              activeScreen === "conversationReports" ||
              activeScreen === "callReports" ||
              activeScreen === "teamReports" ||
              activeScreen === "reportBuilder" ? (
              <AdminReports
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
                user={user}
              />
            ) : activeScreen === "whatsappConfiguration" ? (
              <WhatsAppConfiguration
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
              />
            ) : activeScreen === "whatsapp" ||
              activeScreen === "whatsappConnection" ||
              activeScreen === "whatsappNumbers" ||
              activeScreen === "whatsappTemplates" ||
              activeScreen === "whatsappCreateTemplate" ? (
              <WhatsAppDashboard
                onNavigate={navigate}
                routerNavigate={routerNavigate}
                userRole={userRole}
              />
            ) : activeScreen === "campaigns" ? (
              <CampaignList
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "campaignBuilder" ? (
              <CreateCampaign
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : activeScreen === "campaignDetails" || activeScreen === "campaignAnalytics" ? (
              <CampaignDetails
                onNavigate={navigate}
                routerNavigate={routerNavigate}
              />
            ) : (
              <WorkspaceScreen
                screenId={activeScreen}
                routeInfo={currentRoute}
                onNavigate={navigate}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


