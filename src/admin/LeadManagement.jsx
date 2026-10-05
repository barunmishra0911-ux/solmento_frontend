import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ContactRound,
  Download,
  Eye,
  Funnel,
  Filter,
  Search,
  UsersRound,
  Loader2,
  AlertCircle,
  RotateCcw,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import leadDashboardData from "./leadDashboardData";
import studentLeadsData from "./studentLeadsData";
import { getDynamicPeriodOptions, resolvePeriodDates } from "./datePeriodUtils.js";
import TwoMonthDateRangePicker from "./TwoMonthDateRangePicker";
import {
  getLeadManagementMetricsRequest,
  listCounsellorsRequest,
  listStudentLeadsRequest,
  assignLeadRequest,
  assignBulkLeadsRequest,
  updateStudentLeadRequest,
  deleteStudentLeadRequest,
} from "../lib/authApi";
import { showToast } from "../lib/toast";

ChartJS.register(ArcElement, Tooltip, Legend);

const toneStyles = {
  blue: { icon: "bg-blue-50 text-blue-600", border: "border-t-blue-500", accent: "#2563eb" },
  sky: { icon: "bg-sky-50 text-sky-600", border: "border-t-sky-500", accent: "#0284c7" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", border: "border-t-emerald-500", accent: "#059669" },
  violet: { icon: "bg-violet-50 text-violet-600", border: "border-t-violet-500", accent: "#7c3aed" },
  amber: { icon: "bg-amber-50 text-amber-600", border: "border-t-amber-500", accent: "#d97706" },
  purple: { icon: "bg-purple-50 text-purple-600", border: "border-t-purple-500", accent: "#8b5cf6" },
  green: { icon: "bg-green-50 text-green-600", border: "border-t-green-500", accent: "#16a34a" },
  orange: { icon: "bg-orange-50 text-orange-600", border: "border-t-orange-500", accent: "#ea580c" },
};

const iconMap = {
  users: UsersRound,
  message: ContactRound,
  check: CheckCircle2,
  target: ContactRound,
  chart: Funnel,
  funnel: Funnel,
  bar: BarChart3,
};

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

function Sparkline({ values, color }) {
  if (!values || !values.length) return null;
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 100},${34 - (v / max) * 30}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 36" className="h-9 w-24" role="img" aria-label="Trend indicator">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KpiCard({ item }) {
  const Icon = iconMap[item.icon] || BarChart3;
  const tone = toneStyles[item.tone] || toneStyles.blue;
  const isDown = item.trend === "down" || String(item.change).startsWith("-");
  return (
    <article className={`${cardClass} flex min-h-[168px] flex-col border-t-4 ${tone.border} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone.icon}`}><Icon size={19} /></div>
        {item.change && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${isDown ? "text-rose-600" : "text-emerald-600"}`}>
            {isDown ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {item.change}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{item.label}</p>
      <div className="mt-auto flex items-end justify-between gap-2">
        <div>
          <strong className="text-2xl font-bold text-slate-950">{item.value}</strong>
          <span className="mt-1 block text-[11px] text-slate-400">{item.comparison}</span>
        </div>
        {item.sparkline && <Sparkline values={item.sparkline} color={tone.accent} />}
      </div>
    </article>
  );
}

function PageHeader({ period, options, onPeriodChange }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700"><ContactRound size={20} /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">Lead Management</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor, manage and assign leads to counsellors for follow-up and conversion.</p>
        </div>
      </div>
      <TwoMonthDateRangePicker
        value={period}
        onChange={onPeriodChange}
        align="right"
      />
    </div>
  );
}

function LeadPipelineFunnel({ pipeline }) {
  if (!pipeline?.length) return null;
  const maxValue = Math.max(...pipeline.map(i => i.value), 1);
  return (
    <div className="mt-5 flex flex-col sm:flex-row items-center gap-8">
      <div className="flex-1 w-full flex flex-col items-center gap-0">
        {pipeline.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100;
          return (
            <div key={item.stage} className="w-full flex justify-center mb-0.5">
              <div
                className="relative flex items-center justify-center text-white font-bold text-sm h-11 rounded-sm shadow-sm transition-all hover:opacity-90"
                style={{
                  width: `${Math.max(widthPercent, 35)}%`,
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}ee)`,
                  clipPath: index === 0 ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                    : index === pipeline.length - 1 ? "polygon(8% 0, 92% 0, 100% 100%, 0 100%)"
                      : "polygon(5% 0, 95% 0, 92% 100%, 8% 100%)"
                }}
              >
                <span className="drop-shadow-sm">{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 w-full sm:w-auto sm:min-w-[200px]">
        {pipeline.map((item) => (
          <div key={item.stage} className="flex items-center gap-3">
            <span className="h-4 w-4 shrink-0 rounded-md shadow-sm" style={{ backgroundColor: item.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{item.stage}</p>
              <p className="text-xs text-slate-500">{item.value} ({item.percent})</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadSourceChart({ sources }) {
  if (!sources?.length) return null;
  const total = sources.reduce((s, i) => s + i.value, 0);
  return (
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <Doughnut
          data={{
            labels: sources.map(i => i.source),
            datasets: [{
              data: sources.map(i => i.value),
              backgroundColor: sources.map(i => i.color),
              borderWidth: 3,
              borderColor: "#fff"
            }]
          }}
          options={{ responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false } } }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-2xl text-slate-950">{total}</strong>
          <span className="text-[11px] text-slate-400">Total Leads</span>
        </div>
      </div>
      <div className="grid w-full gap-2">
        {sources.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={item.source} className="flex items-center gap-2.5 text-xs py-0.5">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 truncate text-slate-600 font-medium">{item.source}</span>
              <span className="font-semibold text-slate-800 tabular-nums">{item.value}</span>
              <span className="w-14 text-right text-slate-500 font-medium tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const tableStyles = {
  headCells: { style: { backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", paddingLeft: "16px", paddingRight: "16px" } },
  cells: { style: { color: "#334155", fontSize: "13px", paddingLeft: "16px", paddingRight: "16px" } },
  rows: { style: { minHeight: "58px", borderBottomColor: "#e2e8f0" }, highlightOnHoverStyle: { backgroundColor: "#f8fbff", outline: "none" } },
  pagination: { style: { borderTopColor: "#e2e8f0", fontSize: "12px", color: "#64748b" } },
};

const statusStyles = {
  New: "bg-blue-50 text-blue-700 border border-blue-100",
  Contacted: "bg-purple-50 text-purple-700 border border-purple-100",
  Qualified: "bg-green-50 text-green-700 border border-green-100",
  Converted: "bg-orange-50 text-orange-700 border border-orange-100",
};

const avatarColors = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-sky-400 to-blue-600",
  "bg-gradient-to-br from-emerald-400 to-emerald-600",
  "bg-gradient-to-br from-fuchsia-400 to-purple-600",
  "bg-gradient-to-br from-green-500 to-emerald-700",
  "bg-gradient-to-br from-orange-500 to-amber-600",
  "bg-gradient-to-br from-blue-600 to-indigo-700",
];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(Number(d))) return String(value);
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
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
    email_campaign: "Email Campaign",
    others: "Others",
    unknown: "Website",
  };
  const key = String(value || "website").toLowerCase().replace(/[\s_-]+/g, "_");
  return map[key] || (value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : "Website");
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

function formatCourses(value) {
  if (!value) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export default function LeadManagement({
  data = leadDashboardData,
  _studentData = studentLeadsData,
  onNavigate,
  routerNavigate,
}) {
  const dynamicPeriodConfig = useMemo(() => getDynamicPeriodOptions(), []);
  const [period, setPeriod] = useState(data.period?.selected || dynamicPeriodConfig.selected);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [assignBulk, setAssignBulk] = useState("");
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [counsellorFilter, setCounsellorFilter] = useState("all");

  // Dynamic API state
  const [metrics, setMetrics] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local assignment map { [leadId]: counsellorId }
  const [assignMap, setAssignMap] = useState({});

  // Delete Lead Modal state
  const [deletingLead, setDeletingLead] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (leadId) => {
    if (routerNavigate) {
      routerNavigate(`/app/leads/management/edit/${leadId}`);
    } else if (onNavigate) {
      onNavigate(`leadManagementEdit:${leadId}`);
    }
  };

  const handleOpenDelete = (lead) => {
    setDeletingLead(lead);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    setIsDeleting(true);
    try {
      await deleteStudentLeadRequest(deletingLead.id);
      showToast.success("Lead deleted successfully.");
      setDeletingLead(null);
      await loadAllData(period);
    } catch (err) {
      showToast.error(err.message || "Failed to delete lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch metrics for period
  const refreshMetrics = async (targetPeriod = period) => {
    try {
      const dates = resolvePeriodDates(targetPeriod);
      const res = await getLeadManagementMetricsRequest(dates);
      if (res) setMetrics(res);
    } catch {
      // Keep existing metrics or fallback
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    loadAllData(newPeriod);
  };

  const loadAllData = async (targetPeriod = period) => {
    setLoading(true);
    setError(null);
    try {
      const dates = resolvePeriodDates(targetPeriod);
      const [metricsRes, counsellorsRes, leadsRes] = await Promise.all([
        getLeadManagementMetricsRequest(dates).catch(() => null),
        listCounsellorsRequest().catch(() => ({ counsellors: [] })),
        listStudentLeadsRequest({
          limit: 100,
          fromDate: dates.startDate,
          toDate: dates.endDate,
          startDate: dates.startDate,
          endDate: dates.endDate,
        }).catch(() => ({ records: [] })),
      ]);

      if (metricsRes) setMetrics(metricsRes);
      const rawCounsellors = (counsellorsRes?.counsellors || []).map((c) => ({
        ...c,
        id: c.id,
        name: c.name || c.fullName || "Counsellor",
        fullName: c.fullName || c.name || "Counsellor",
      }));
      setCounsellors(rawCounsellors);

      const rawRecords = leadsRes?.records || [];
      const transformed = rawRecords.map((r) => {
        const leadName = r.name || `Lead ${String(r.id).slice(0, 6)}`;
        return {
          id: r.id,
          initials: getInitials(leadName),
          avatarColorIdx: hashIndex(leadName, avatarColors.length),
          name: leadName,
          email: r.email || "—",
          phone: r.phone || "—",
          coursesInterested: formatCourses(r.coursesInterested),
          leadSource: formatSource(r.source),
          rawSource: String(r.source || "unknown").toLowerCase(),
          status: normalizeStatus(r.status),
          rawStatus: String(r.status || "NEW").toUpperCase(),
          assignToId: r.assignedTo?.id ? String(r.assignedTo.id) : "",
          assignToName: r.assignedTo?.id ? r.assignedTo.name : "Select Counsellor",
          addedOn: formatDate(r.createdAt),
          rawCreated: r.createdAt,
        };
      });

      setLeads(transformed);

      const m = {};
      transformed.forEach((l) => {
        m[l.id] = l.assignToId;
      });
      setAssignMap(m);
    } catch (err) {
      setError(err?.message || "Failed to load lead management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Single assign handler
  const handleSingleAssign = async (leadId, selectedCounsellorId) => {
    const val = selectedCounsellorId === "unassigned" ? "" : selectedCounsellorId;
    setAssignMap((prev) => ({ ...prev, [leadId]: val }));
    try {
      await assignLeadRequest({
        leadId,
        counsellorId: val ? Number(val) : null,
      });
      setActionMessage({ type: "success", text: "Counsellor assignment updated." });
      setTimeout(() => setActionMessage(null), 3000);
      refreshMetrics();
    } catch (err) {
      setActionMessage({ type: "error", text: err?.message || "Failed to assign counsellor." });
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  // Bulk assign handler
  const handleBulkAssign = async () => {
    if (!selectedRows.length) return;
    if (!assignBulk) {
      setActionMessage({ type: "error", text: "Please select a counsellor first." });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    setIsBulkAssigning(true);
    try {
      const leadIds = selectedRows.map((r) => r.id);
      const val = assignBulk === "unassigned" ? null : Number(assignBulk);
      await assignBulkLeadsRequest({
        leadIds,
        counsellorId: val,
      });

      setAssignMap((prev) => {
        const next = { ...prev };
        leadIds.forEach((id) => {
          next[id] = val ? String(val) : "";
        });
        return next;
      });

      // Update leads state
      setLeads((prev) =>
        prev.map((l) => {
          if (leadIds.includes(l.id)) {
            const foundC = counsellors.find((c) => String(c.id) === String(val));
            return {
              ...l,
              assignToId: val ? String(val) : "",
              assignToName: foundC ? (foundC.name || foundC.fullName) : "Select Counsellor",
            };
          }
          return l;
        })
      );

      setSelectedRows([]);
      setAssignBulk("");
      setActionMessage({ type: "success", text: `Assigned ${leadIds.length} lead(s) successfully.` });
      setTimeout(() => setActionMessage(null), 3000);
      refreshMetrics();
    } catch (err) {
      setActionMessage({ type: "error", text: err?.message || "Bulk assignment failed." });
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsBulkAssigning(false);
    }
  };

  // Filtered leads
  const filtered = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    return leads.filter((r) => {
      // Text search
      if (q) {
        const match =
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Status filter
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }
      // Source filter
      if (sourceFilter !== "all" && r.leadSource !== sourceFilter) {
        return false;
      }
      // Counsellor filter
      if (counsellorFilter !== "all") {
        const currentAssign = assignMap[r.id];
        if (counsellorFilter === "unassigned") {
          if (currentAssign && currentAssign !== "") return false;
        } else if (String(currentAssign) !== String(counsellorFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [leads, searchText, statusFilter, sourceFilter, counsellorFilter, assignMap]);

  // Export to CSV
  const handleExport = () => {
    if (!filtered.length) return;
    const headers = ["#", "Name", "Email", "Phone Number", "Courses Interested", "Lead Source", "Status", "Assign To", "Added On"];
    const rows = filtered.map((r, i) => {
      const assignedC = counsellors.find((c) => String(c.id) === String(assignMap[r.id]));
      return [
        i + 1,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.email.replace(/"/g, '""')}"`,
        `"${r.phone.replace(/"/g, '""')}"`,
        `"${r.coursesInterested.replace(/"/g, '""')}"`,
        `"${r.leadSource.replace(/"/g, '""')}"`,
        `"${r.status.replace(/"/g, '""')}"`,
        `"${(assignedC ? (assignedC.name || assignedC.fullName) : "Unassigned").replace(/"/g, '""')}"`,
        `"${r.addedOn.replace(/"/g, '""')}"`,
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lead_management_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (leadId) => {
    if (routerNavigate) {
      routerNavigate(`/app/leads/${leadId}`);
    } else if (onNavigate) {
      onNavigate("leadDetail");
    }
  };

  const columns = [
    {
      name: "#",
      width: "55px",
      cell: (_, i) => (<span className="text-sm font-medium text-slate-500 tabular-nums">{i + 1}</span>),
    },
    {
      name: "Name",
      selector: (r) => r.name,
      sortable: true,
      minWidth: "190px",
      grow: 1.5,
      cell: (r) => (
        <div className="flex items-center gap-3 py-1 min-w-0">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white text-[12px] font-bold shadow-sm ring-2 ring-white ${avatarColors[r.avatarColorIdx % avatarColors.length]}`}>
            {r.initials}
          </span>
          <span className="text-sm font-semibold text-slate-900 leading-snug break-normal">
            {r.name}
          </span>
        </div>
      ),
    },
    { name: "Email", selector: (r) => r.email, sortable: true, minWidth: "170px", cell: (r) => (<span className="text-sm text-slate-600 truncate">{r.email}</span>) },
    { name: "Phone Number", selector: (r) => r.phone, sortable: true, minWidth: "135px", cell: (r) => (<span className="text-sm text-slate-600 tabular-nums">{r.phone}</span>) },
    { name: "Courses Interested", selector: (r) => r.coursesInterested, sortable: true, minWidth: "160px", cell: (r) => (<span className="text-sm text-slate-700 font-medium">{r.coursesInterested}</span>) },
    { name: "Lead Source", selector: (r) => r.leadSource, sortable: true, minWidth: "120px", cell: (r) => (<span className="text-sm text-slate-600">{r.leadSource}</span>) },
    {
      name: "Status",
      selector: (r) => r.status,
      sortable: true,
      minWidth: "115px",
      cell: (r) => (
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[r.status] || "bg-slate-50 text-slate-700 border border-slate-100"}`}>
          {r.status}
        </span>
      ),
    },
    {
      name: "Assign To",
      selector: (r) => assignMap[r.id] || "",
      sortable: true,
      minWidth: "170px",
      cell: (r) => {
        const v = assignMap[r.id] || "";
        return (
          <div className="relative w-full max-w-[160px] min-w-0">
            <select
              value={v}
              onChange={(e) => handleSingleAssign(r.id, e.target.value)}
              className={`w-full appearance-none rounded-lg border pl-2.5 pr-7 py-1.5 text-xs font-medium outline-none cursor-pointer transition truncate ${v !== ""
                  ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  : "border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-400"
                }`}
            >
              <option value="">Select Counsellor</option>
              {counsellors.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name || c.fullName}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        );
      },
    },
    { name: "Added On", selector: (r) => r.addedOn, sortable: true, minWidth: "130px", cell: (r) => (<span className="text-sm text-slate-600 tabular-nums">{r.addedOn}</span>) },
    {
      name: "Action",
      width: "145px",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="View Lead"
            onClick={() => handleView(r.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
          >
            <Eye size={12} />
            <span>View</span>
          </button>
          <button
            type="button"
            title="Edit Lead"
            onClick={() => handleEditClick(r.id)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            title="Delete Lead"
            onClick={() => handleOpenDelete(r)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const displayKpis = metrics?.kpis?.length ? metrics.kpis : data.kpis;
  const displayPipeline = metrics?.pipeline?.length ? metrics.pipeline : data.pipeline;
  const displaySources = metrics?.sources?.length ? metrics.sources : data.sources;

  const hasActiveFilters = statusFilter !== "all" || sourceFilter !== "all" || counsellorFilter !== "all";

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSourceFilter("all");
    setCounsellorFilter("all");
    setSearchText("");
  };

  return (
    <div className="text-slate-900">
      <PageHeader period={period} options={data.period?.options || dynamicPeriodConfig.options} onPeriodChange={handlePeriodChange} />

      {actionMessage && (
        <div
          className={`mb-4 flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionMessage.text}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {displayKpis?.length ? displayKpis.map((it) => (<KpiCard key={it.key} item={it} />)) : null}
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className={`${cardClass} border-t-4 border-t-blue-500 min-w-0 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700"><Funnel size={16} /></div>
              <div>
                <h2 className="font-bold text-slate-950">Lead Pipeline Funnel</h2>
                <p className="mt-0.5 text-xs text-slate-500">Total leads across different stages</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("lead-table-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              View All Leads <ChevronRight size={13} />
            </button>
          </div>
          <LeadPipelineFunnel pipeline={displayPipeline} />
        </article>
        <article className={`${cardClass} border-t-4 border-t-emerald-500 min-w-0 p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><UsersRound size={16} /></div>
              <div>
                <h2 className="font-bold text-slate-950">Lead Source Breakdown</h2>
                <p className="mt-0.5 text-xs text-slate-500">Where your leads are coming from</p>
              </div>
            </div>
          </div>
          <LeadSourceChart sources={displaySources} />
        </article>
      </section>

      <section id="lead-table-section" className={`${cardClass} border-t-4 border-t-blue-500 mt-5 overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700"><ContactRound size={16} /></div>
            <div>
              <h2 className="font-bold text-slate-950">Lead Management</h2>
              <p className="mt-0.5 text-xs text-slate-500">Select leads and assign them to counsellors for follow-up.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400 hover:bg-white hover:border-blue-200 transition">
              <Search size={15} className="text-slate-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="bg-transparent min-w-[220px] text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${showFilters || hasActiveFilters
                  ? "border-blue-300 bg-blue-100/60 text-blue-800"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
            >
              <Filter size={15} /> Filter {hasActiveFilters && "•"}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700 transition"
            >
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none hover:border-blue-300 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none hover:border-blue-300 cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="Website">Website</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Counsellor:</span>
              <select
                value={counsellorFilter}
                onChange={(e) => setCounsellorFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 outline-none hover:border-blue-300 cursor-pointer"
              >
                <option value="all">All Counsellors</option>
                <option value="unassigned">Unassigned</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name || c.fullName}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>
        )}

        {selectedRows.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked readOnly className="accent-blue-600 h-4 w-4 rounded" />
              <span>{selectedRows.length} leads selected</span>
            </label>
            <div className="relative flex items-center gap-2 max-w-full min-w-0">
              <span className="sr-only">Assign to counsellor</span>
              <select
                value={assignBulk}
                onChange={(e) => setAssignBulk(e.target.value)}
                className="w-full max-w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-medium text-slate-700 cursor-pointer hover:border-blue-300 focus:outline-none focus:border-blue-400 truncate"
              >
                <option value="">Assign to Counsellor</option>
                <option value="unassigned">Unassign</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name || c.fullName}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              disabled={isBulkAssigning}
              onClick={handleBulkAssign}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isBulkAssigning ? <Loader2 size={13} className="animate-spin" /> : <UsersRound size={13} />}
              {isBulkAssigning ? "Assigning…" : "Assign Leads"}
            </button>
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setSelectedRows([])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
              >
                <CheckCircle2 size={12} strokeWidth={2.5} /> Clear Selection
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            Loading leads data…
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            selectableRows
            selectableRowsHighlight
            clearSelectedRows={selectedRows.length === 0}
            onSelectedRowsChange={({ selectedRows: rows }) => setSelectedRows(rows)}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            responsive
            customStyles={tableStyles}
            noDataComponent={
              <div className="p-8 text-center text-sm text-slate-500">
                No leads match your criteria.
              </div>
            }
          />
        )}
      </section>

      {/* Delete Lead Confirmation Modal */}
      {deletingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600">
                  <Trash2 size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Delete Lead</h3>
                  <p className="text-[11px] text-slate-500">Confirm soft deletion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-semibold">{deletingLead.name}</strong>? This lead will be removed from active lists.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
