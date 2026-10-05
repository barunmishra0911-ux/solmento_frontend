import { useState } from "react";
import DataTable from "react-data-table-component";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Edit3,
  Eye,
  Filter,
  Funnel,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Percent,
  Send,
  Star,
  Target,
  UsersRound,
  Bot,
  CalendarCheck2,
  Award,
} from "lucide-react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import leadDashboardData from "./leadDashboardData";
import { getDynamicPeriodOptions } from "./datePeriodUtils.js";
import TwoMonthDateRangePicker from "./TwoMonthDateRangePicker";

ChartJS.register(ArcElement, Tooltip, Legend);

const toneStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    border: "border-t-blue-500",
    accent: "#2563eb",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600",
    border: "border-t-sky-500",
    accent: "#0284c7",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    border: "border-t-emerald-500",
    accent: "#059669",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600",
    border: "border-t-violet-500",
    accent: "#7c3aed",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    border: "border-t-amber-500",
    accent: "#d97706",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    border: "border-t-purple-500",
    accent: "#8b5cf6",
  },
  green: {
    icon: "bg-green-50 text-green-600",
    border: "border-t-green-500",
    accent: "#16a34a",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    border: "border-t-orange-500",
    accent: "#ea580c",
  },
};

const iconMap = {
  users: UsersRound,
  message: MessageCircle,
  check: CheckCircle2,
  target: Target,
  chart: Percent,
  calendar: CalendarCheck2,
  bar: BarChart3,
  calendar2: CalendarDays,
  database: Database,
  funnel: Funnel,
};

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

function EmptyState({ message }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function Sparkline({ values, color }) {
  const max = Math.max(...values, 1);
  const points = values
    .map(
      (value, index) =>
        `${(index / Math.max(values.length - 1, 1)) * 100},${
          34 - (value / max) * 30
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

function PageHeader({ period, options, onPeriodChange }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700">
          <UsersRound size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Lead Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your leads performance and conversion metrics at a glance.
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

function KpiCard({ item }) {
  const Icon = iconMap[item.icon] || BarChart3;
  const tone = toneStyles[item.tone] || toneStyles.blue;
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
        <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
          <ArrowUpRight size={14} />
          {item.change}
        </span>
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

function VolumeCard({ item }) {
  const Icon = iconMap[item.icon] || BarChart3;
  const tone = toneStyles[item.tone] || toneStyles.blue;
  return (
    <article
      className={`${cardClass} min-h-[118px] border-t-4 ${tone.border} p-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone.icon}`}
          >
            <Icon size={16} />
          </div>
          <p className="text-sm text-slate-500">{item.label}</p>
        </div>
        {item.change && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={11} />
            {item.change}
          </span>
        )}
      </div>
      <strong className="mt-3 ml-10 block text-2xl font-bold text-slate-950">
        {item.value}
      </strong>
      <span className="mt-1 ml-10 block text-xs text-slate-400">
        {item.detail}
      </span>
    </article>
  );
}

function ConversationOverview({
  lead,
  messages,
  leadOptions,
  selectedLeadId,
  onLeadChange,
}) {
  return (
    <article
      className={`${cardClass} border-t-4 border-t-blue-500 flex min-h-[500px] min-w-0 flex-col overflow-hidden`}
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
        <div className="relative">
          <select
            value={selectedLeadId}
            onChange={(e) => onLeadChange(e.target.value)}
            className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:border-blue-300 focus:outline-none focus:border-blue-400"
          >
            {leadOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {lead.initials}
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm text-slate-900">
            {lead.name}
          </strong>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {lead.source} · {lead.lastActivity}
          </span>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          {lead.status}
        </span>
      </div>
      {messages?.length ? (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "lead" ? "justify-start" : "justify-end"
              } gap-2`}
            >
              {message.role === "lead" && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  {lead.initials}
                </span>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
                  message.role === "lead"
                    ? "rounded-tl-md bg-slate-100 text-slate-700"
                    : "rounded-tr-md bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-slate-700"
                }`}
              >
                <p>{message.text}</p>
                <span
                  className={`mt-1 block text-[10px] ${
                    message.role === "lead"
                      ? "text-slate-400"
                      : "text-purple-400"
                  }`}
                >
                  {message.time}
                </span>
              </div>
              {message.role === "assistant" && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  <Bot size={14} />
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 p-5">
          <EmptyState message="No conversation messages yet" />
        </div>
      )}
      <div className="border-t border-slate-100 bg-white p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
          <span className="min-w-0 flex-1 truncate">Type a message...</span>
          <button
            type="button"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white"
            aria-label="Send reply"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function LeadInformation({ lead }) {
  const fields = [
    {
      label: "Name",
      value: lead.name,
      icon: UsersRound,
      tone: "text-blue-500",
      bgTone: "bg-blue-50",
    },
    {
      label: "Email",
      value: lead.email,
      icon: Mail,
      tone: "text-blue-500",
      bgTone: "bg-blue-50",
    },
    {
      label: "Phone",
      value: lead.phone,
      icon: Phone,
      tone: "text-blue-500",
      bgTone: "bg-blue-50",
    },
    {
      label: "Interested Course",
      value: lead.interestedCourse,
      icon: Target,
      tone: "text-green-500",
      bgTone: "bg-green-50",
    },
    {
      label: "Fees Query",
      value: lead.feesQuery,
      icon: Filter,
      tone: "text-green-500",
      bgTone: "bg-green-50",
      badge: true,
    },
    {
      label: "Hostel Query",
      value: lead.hostelQuery,
      icon: Target,
      tone: "text-green-500",
      bgTone: "bg-green-50",
      badge: true,
    },
    {
      label: "Hostel Fees",
      value: lead.hostelFees,
      icon: BarChart3,
      tone: "text-blue-500",
      bgTone: "bg-blue-50",
    },
    {
      label: "Location",
      value: lead.location,
      icon: MapPin,
      tone: "text-red-500",
      bgTone: "bg-red-50",
    },
    {
      label: "Additional Notes",
      value: lead.additionalNotes,
      icon: Star,
      tone: "text-purple-500",
      bgTone: "bg-purple-50",
    },
  ];

  return (
    <article
      className={`${cardClass} border-t-4 border-t-violet-500 min-w-0 p-5`}
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
          <Edit3 size={13} />
          Edit Details
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {fields.map(({ label, value, icon: Icon, tone, bgTone, badge }) => (
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
              {badge && value === "Yes" ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  <CheckCircle2 size={10} className="mr-1" />
                  {value}
                </span>
              ) : (
                value || "Not provided"
              )}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function AnalyticsCard({ title, subtitle, children, className = "", action }) {
  return (
    <article className={`${cardClass} min-w-0 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </article>
  );
}

function LeadPipelineFunnel({ pipeline }) {
  if (!pipeline?.length) return <EmptyState message="Not enough data yet" />;
  const maxValue = pipeline[0]?.value || 1;

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
                  clipPath:
                    index === 0
                      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                      : index === pipeline.length - 1
                        ? "polygon(8% 0, 92% 0, 100% 100%, 0 100%)"
                        : "polygon(5% 0, 95% 0, 92% 100%, 8% 100%)",
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
            <span
              className="h-4 w-4 shrink-0 rounded-md shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">
                {item.stage}
              </p>
              <p className="text-xs text-slate-500">
                {item.value} ({item.percent})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadSourceChart({ sources }) {
  if (!sources?.length) return <EmptyState message="Not enough data yet" />;
  const total = sources.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <Doughnut
          data={{
            labels: sources.map((item) => item.source),
            datasets: [
              {
                data: sources.map((item) => item.value),
                backgroundColor: sources.map((item) => item.color),
                borderWidth: 3,
                borderColor: "#fff",
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            plugins: { legend: { display: false } },
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-2xl text-slate-950">{total}</strong>
          <span className="text-[11px] text-slate-400">Total Leads</span>
        </div>
      </div>
      <div className="grid w-full gap-2">
        {sources.map((item) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={item.source}
              className="flex items-center gap-2.5 text-xs py-0.5"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-600 font-medium">
                {item.source}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {item.value}
              </span>
              <span className="w-14 text-right text-slate-500 font-medium tabular-nums">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
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

const rankBadgeColors = {
  1: "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-amber-200 shadow-sm",
  2: "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-200 shadow-sm",
  3: "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-200 shadow-sm",
};

const avatarColors = [
  "bg-gradient-to-br from-pink-400 to-rose-500",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-emerald-400 to-emerald-600",
  "bg-gradient-to-br from-amber-400 to-orange-500",
];

function TopCounsellors({ counsellors }) {
  if (!counsellors?.length)
    return <EmptyState message="No counsellor performance data yet" />;
  const columns = [
    {
      name: "Rank",
      selector: (row) => row.rank,
      sortable: true,
      width: "72px",
      cell: (row) => (
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold shadow ${
            rankBadgeColors[row.rank] ||
            "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {row.rank <= 3 ? <Award size={13} /> : row.rank}
        </span>
      ),
    },
    {
      name: "Counsellor",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`grid h-9 w-9 place-items-center rounded-full text-white text-[12px] font-bold shadow-sm ring-2 ring-white ${
              avatarColors[(row.rank - 1) % avatarColors.length]
            }`}
          >
            {row.initials}
          </span>
          <b className="text-slate-800 font-semibold">{row.name}</b>
        </div>
      ),
    },
    { name: "Total Leads", selector: (row) => row.totalLeads, sortable: true },
    { name: "Contacted", selector: (row) => row.contacted, sortable: true },
    { name: "Qualified", selector: (row) => row.qualified, sortable: true },
    { name: "Converted", selector: (row) => row.converted, sortable: true },
    {
      name: "Conversion Rate",
      selector: (row) => row.conversionRate,
      sortable: true,
      cell: (row) => (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
          {row.conversionRate}
        </span>
      ),
    },
    {
      name: "Action",
      cell: () => (
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
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
    <DataTable
      columns={columns}
      data={counsellors}
      pagination
      paginationPerPage={5}
      highlightOnHover
      responsive
      customStyles={tableStyles}
    />
  );
}

export default function LeadDashboard({ data = leadDashboardData }) {
  const dynamicPeriods = getDynamicPeriodOptions();
  const [period, setPeriod] = useState(
    data.period?.selected || dynamicPeriods.selected,
  );
  const [selectedLeadId, setSelectedLeadId] = useState(data.selectedLead?.id);
  if (!data) return <EmptyState message="Unable to load lead dashboard data" />;
  return (
    <div className="text-slate-900">
      <PageHeader
        period={period}
        options={data.period?.options || dynamicPeriods.options}
        onPeriodChange={setPeriod}
      />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {data.kpis?.length ? (
          data.kpis.map((item) => <KpiCard key={item.key} item={item} />)
        ) : (
          <div className="sm:col-span-2 xl:col-span-5">
            <EmptyState message="No leads yet" />
          </div>
        )}
      </section>
      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.volume?.length ? (
          data.volume.map((item) => <VolumeCard key={item.key} item={item} />)
        ) : (
          <div className="sm:col-span-2 xl:col-span-4">
            <EmptyState message="No leads yet" />
          </div>
        )}
      </section>
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <ConversationOverview
          lead={data.selectedLead}
          messages={data.conversation}
          leadOptions={data.leadOptions || []}
          selectedLeadId={selectedLeadId}
          onLeadChange={setSelectedLeadId}
        />
        <LeadInformation lead={data.selectedLead} />
      </section>
      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AnalyticsCard
          title="Lead Pipeline Funnel"
          subtitle="Total leads across different stages"
          className="border-t-4 border-t-blue-500"
          action={
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              View All Leads
              <ChevronRight size={13} />
            </button>
          }
        >
          <LeadPipelineFunnel pipeline={data.pipeline} />
        </AnalyticsCard>
        <AnalyticsCard
          title="Lead Source Breakdown"
          subtitle="Where your leads are coming from"
          className="border-t-4 border-t-emerald-500"
        >
          <LeadSourceChart sources={data.sources} />
        </AnalyticsCard>
      </section>
      <section
        className={`${cardClass} border-t-4 border-t-amber-500 mt-5 overflow-hidden`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100 text-blue-700">
              <Award size={16} />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">
                Top Performing Counsellor
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Based on total conversions in this period
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            View All Counsellors
            <ChevronRight size={13} />
          </button>
        </div>
        <TopCounsellors counsellors={data.counsellors} />
      </section>
    </div>
  );
}
