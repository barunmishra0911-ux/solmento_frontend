import { useState, useMemo, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CalendarDays,
  Database,
  Eye,
  Filter,
  Search,
  UsersRound,
} from "lucide-react";
import studentLeadsData from "./studentLeadsData";
import {
  getDynamicPeriodOptions,
  resolvePeriodDates,
} from "./datePeriodUtils.js";
import TwoMonthDateRangePicker from "./TwoMonthDateRangePicker";
import { getLeadKPIsRequest, listStudentLeadsRequest } from "../lib/authApi";

const toneStyles = {
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    border: "border-t-emerald-500",
    accent: "#059669",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600",
    border: "border-t-sky-500",
    accent: "#0284c7",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600",
    border: "border-t-violet-500",
    accent: "#7c3aed",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    border: "border-t-orange-500",
    accent: "#ea580c",
  },
};

const iconMap = {
  calendar: CalendarDays,
  bar: BarChart3,
  calendar2: CalendarDays,
  database: Database,
};

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

function Sparkline({ values, color }) {
  const safeValues = Array.isArray(values) && values.length > 0 ? values : [0, 0];
  const max = Math.max(...safeValues, 1);
  const points = safeValues
    .map(
      (value, index) =>
        `${(index / Math.max(safeValues.length - 1, 1)) * 100},${
          34 - (Math.max(0, Number(value) || 0) / max) * 30
        }`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 36"
      className="h-9 w-24"
      role="img"
      aria-label="Trend indicator"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCard({ item }) {
  const Icon = iconMap[item.icon] || BarChart3;
  const tone = toneStyles[item.tone] || toneStyles.sky;
  const changeUp = item.changeDirection === "up";
  return (
    <article
      className={`${cardClass} flex min-h-[168px] flex-col border-t-4 ${tone.border} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${tone.icon}`}
        >
          <Icon size={19} />
        </div>
        {item.change && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${changeUp ? "text-emerald-600" : "text-rose-600"}`}
          >
            {changeUp ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {item.change}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{item.label}</p>
      <div className="mt-auto flex items-end justify-between gap-2">
        <div>
          <strong className="text-2xl font-bold text-slate-950">
            {item.value}
          </strong>
          <span className="mt-1 block text-[11px] text-slate-400">
            {item.comparison}
          </span>
        </div>
        <Sparkline values={item.sparkline} color={tone.accent} />
      </div>
    </article>
  );
}

function PageHeader({ period, options, onPeriodChange }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
          <UsersRound size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Student Leads
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all student leads from different sources.
          </p>
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

const tableStyles = {
  headCells: {
    style: {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  cells: {
    style: {
      color: "#334155",
      fontSize: "13px",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  },
  rows: {
    style: { minHeight: "58px", borderBottomColor: "#e2e8f0" },
    highlightOnHoverStyle: {
      backgroundColor: "#f8fbff",
      outline: "none",
    },
  },
  pagination: {
    style: { borderTopColor: "#e2e8f0", fontSize: "12px", color: "#64748b" },
  },
};

export default function StudentLeads({
  data = studentLeadsData,
  routerNavigate,
}) {
  const [period, setPeriod] = useState(
    data.period?.selected || getDynamicPeriodOptions().selected,
  );
  const [searchText, setSearchText] = useState("");
  const searchTimeoutRef = useRef(null);
  const [liveSearch, setLiveSearch] = useState("");

  const [kpiData, setKpiData] = useState(null);
  const [kpiError, setKpiError] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState(null);
  const [tablePagination, setTablePagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    let cancelled = false;
    setKpiLoading(true);
    setKpiError(null);
    const dateParams = resolvePeriodDates(period);
    getLeadKPIsRequest({ ...dateParams, period })
      .then((payload) => {
        if (cancelled) return;
        setKpiData(payload || null);
      })
      .catch((error) => {
        if (cancelled) return;
        setKpiError(error?.message || "Unable to load KPIs.");
        setKpiData(null);
      })
      .finally(() => {
        if (!cancelled) setKpiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const loadTable = (params = {}) => {
    setTableLoading(true);
    setTableError(null);
    listStudentLeadsRequest(params)
      .then((payload) => {
        setTableData(payload?.records || []);
        if (payload?.pagination) {
          setTablePagination((prev) => ({ ...prev, ...payload.pagination }));
        }
      })
      .catch((error) => {
        setTableError(error?.message || "Unable to load leads.");
        setTableData([]);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  useEffect(() => {
    const dateParams = resolvePeriodDates(period);
    loadTable({
      search: liveSearch,
      fromDate: dateParams.startDate,
      toDate: dateParams.endDate,
      startDate: dateParams.startDate,
      endDate: dateParams.endDate,
      page: tablePagination.page,
      limit: tablePagination.limit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSearch, period, tablePagination.page]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setLiveSearch(searchText.trim());
    }, 350);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchText]);

  const avatarColors = data.avatarColors || [];

  function hashIndex(name) {
    const s = String(name || "U");
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % Math.max(avatarColors.length, 1);
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(Number(d))) return String(value);
    const day = String(d.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function formatCourses(value) {
    if (!value) return "—";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  }

  function formatSource(value) {
    const map = {
      website_widget: "Website Widget",
      website: "Website",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      facebook: "Facebook",
      direct: "Direct",
      referal: "Referral",
      referral: "Referral",
      unknown: "Unknown",
    };
    const key = String(value || "unknown")
      .toLowerCase()
      .replace(/[\s_-]+/g, "_");
    return (
      map[key] ||
      map[key.replace("_", "")] ||
      map[key.replace(/_/g, "")] ||
      (value
        ? String(value).charAt(0).toUpperCase() + String(value).slice(1)
        : "Unknown")
    );
  }

  function getInitials(name) {
    const s = String(name || "U").trim();
    if (!s) return "U";
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return s.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  const mappedLeads = useMemo(() => {
    if (tableError || !tableData.length) return [];
    return tableData.map((row, index) => ({
      ...row,
      name: row.name || `Lead ${String(row.id).slice(0, 6)}`,
      email: row.email || "—",
      phone: row.phone || "—",
      coursesInterested: formatCourses(row.coursesInterested),
      leadSource: formatSource(row.source),
      status: row.status || "NEW",
      addedOn: formatDate(row.createdAt),
      initials: getInitials(row.name || `L-${index + 1}`),
      avatarColorIdx: hashIndex(row.name || String(row.id || index)),
      _index: index,
    }));
  }, [tableData, tableError]);

  const fallbackKpis = data.kpis || [];

  const kpis = useMemo(() => {
    if (!kpiData?.leads) return fallbackKpis;
    const { leads, deltas, sparklines } = kpiData;
    const defaultSpark = [0, 0, 0, 0, 0, 0, 0];

    const fmt = (delta, defaultComp) => {
      if (!delta || delta.value === null || delta.value === undefined) {
        return { change: null, direction: "up", comparison: defaultComp || "" };
      }
      return {
        change: `${delta.prefix || (delta.sign === "down" ? "-" : "+")}${delta.value}%`,
        direction: delta.sign || "up",
        comparison: delta.comparison || defaultComp || "",
      };
    };

    const today = fmt(deltas?.today, `vs. yesterday (${deltas?.today?.previous ?? 0})`);
    const week = fmt(deltas?.week, `vs. previous week (${deltas?.week?.previous ?? 0})`);
    const month = fmt(deltas?.month, `vs. previous month (${deltas?.month?.previous ?? 0})`);
    const total = fmt(
      deltas?.total,
      deltas?.total?.previous !== undefined
        ? `vs. previous period (${deltas.total.previous})`
        : "All time leads",
    );

    return [
      {
        key: "todays-leads",
        tone: "emerald",
        icon: "calendar",
        label: "Today's Leads",
        value: leads.today ?? 0,
        change: today.change,
        changeDirection: today.direction,
        comparison: today.comparison,
        sparkline: Array.isArray(sparklines?.today) && sparklines.today.length > 0 ? sparklines.today : defaultSpark,
      },
      {
        key: "weekly-leads",
        tone: "sky",
        icon: "bar",
        label: "Weekly Leads",
        value: leads.week ?? 0,
        change: week.change,
        changeDirection: week.direction,
        comparison: week.comparison,
        sparkline: Array.isArray(sparklines?.week) && sparklines.week.length > 0 ? sparklines.week : defaultSpark,
      },
      {
        key: "monthly-leads",
        tone: "violet",
        icon: "calendar2",
        label: "Monthly Leads",
        value: leads.month ?? 0,
        change: month.change,
        changeDirection: month.direction,
        comparison: month.comparison,
        sparkline: Array.isArray(sparklines?.month) && sparklines.month.length > 0 ? sparklines.month : defaultSpark,
      },
      {
        key: "total-leads",
        tone: "orange",
        icon: "database",
        label: "Total Leads",
        value: leads.total ?? 0,
        change: total.change,
        changeDirection: total.direction,
        comparison: total.comparison,
        sparkline: Array.isArray(sparklines?.total) && sparklines.total.length > 0 ? sparklines.total : defaultSpark,
      },
    ];
  }, [kpiData, fallbackKpis]);

  const finalLeads = mappedLeads;

  const columns = [
    {
      name: "#",
      selector: (_, index) => index + 1,
      width: "52px",
      cell: (row, index) => (
        <span className="text-sm font-medium text-slate-500 tabular-nums">
          {((tablePagination.page || 1) - 1) * (tablePagination.limit || 10) +
            index +
            1}
        </span>
      ),
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-white text-[12px] font-bold shadow-sm ring-2 ring-white ${
              avatarColors[
                row.avatarColorIdx % Math.max(avatarColors.length, 1)
              ]
            }`}
          >
            {row.initials}
          </span>
          <b className="text-slate-800 font-semibold">{row.name}</b>
        </div>
      ),
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-slate-600">{row.email}</span>
      ),
    },
    {
      name: "Phone Number",
      selector: (row) => row.phone,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-slate-600 tabular-nums">{row.phone}</span>
      ),
    },
    {
      name: "Courses Interested",
      selector: (row) => row.coursesInterested,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-slate-700 font-medium">
          {row.coursesInterested}
        </span>
      ),
    },
    {
      name: "Lead Source",
      selector: (row) => row.leadSource,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-slate-600">{row.leadSource}</span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            data.statusStyles?.[row.status] ||
            "bg-slate-50 text-slate-700 border border-slate-100"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Added On",
      selector: (row) => row.addedOn,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-slate-600 tabular-nums">
          {row.addedOn}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          type="button"
          onClick={() => routerNavigate(`/app/leads/students/${row.id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
        >
          <Eye size={12} />
          View
        </button>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div className="text-slate-900">
      <PageHeader
        period={period}
        options={data.period?.options || getDynamicPeriodOptions().options}
        onPeriodChange={(newP) => {
          setPeriod(newP);
          setTablePagination((prev) => ({ ...prev, page: 1 }));
        }}
      />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiLoading && !kpiData && fallbackKpis.length ? (
          fallbackKpis.map((item) => <KpiCard key={item.key} item={item} />)
        ) : kpis.length ? (
          kpis.map((item) => <KpiCard key={item.key} item={item} />)
        ) : (
          <div className="sm:col-span-2 xl:col-span-4">
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
              {kpiError || "No leads yet"}
            </div>
          </div>
        )}
      </section>

      <section
        className={`${cardClass} border-t-4 border-t-blue-500 mt-5 overflow-hidden`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 className="font-bold text-slate-950 text-lg">
              All Student Leads
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View and track detailed information of each student lead.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400 hover:bg-white hover:border-blue-200 transition">
              <Search size={15} className="text-slate-400" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search leads by name, email or phone..."
                className="bg-transparent min-w-[240px] text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition"
            >
              <Filter size={15} />
              Filter
            </button>
          </div>
        </div>
        {tableError && (
          <div className="border-b border-slate-100 bg-rose-50 px-5 py-3 text-sm text-rose-700">
            {tableError}
          </div>
        )}

        <DataTable
          columns={columns}
          data={finalLeads}
          progressPending={tableLoading}
          pagination
          paginationServer
          paginationTotalRows={tablePagination.total || 0}
          paginationPerPage={tablePagination.limit || 10}
          paginationCurrentPage={tablePagination.page || 1}
          paginationRowsPerPageOptions={[10, 25, 50]}
          highlightOnHover
          responsive
          customStyles={tableStyles}
          onChangePage={(page) => {
            setTablePagination((prev) => ({ ...prev, page }));
            loadTable({
              page,
              limit: tablePagination.limit,
              search: liveSearch,
            });
          }}
          onChangeRowsPerPage={(limit) => {
            setTablePagination((prev) => ({ ...prev, limit, page: 1 }));
            loadTable({ page: 1, limit, search: liveSearch });
          }}
          noDataComponent={
            <div className="py-12 text-center text-sm text-slate-500">
              {tableError
                ? tableError
                : !tableLoading
                  ? "No student leads match the current filters."
                  : ""}
            </div>
          }
        />
      </section>
    </div>
  );
}
