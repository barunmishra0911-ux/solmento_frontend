import { useEffect, useMemo, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Wallet,
  CircleCheck,
  Clock3,
  CircleX,
  Search,
  RotateCcw,
  Download,
  Trash2,
  X,
} from "lucide-react";
import BillingRowActions from "./BillingRowActions";
import "./BillingDashboard.css";
import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

// STEP 1: Demo records. Amount is a number; dates use YYYY-MM-DD.
const BILLINGS = [
  {
    id: 1,
    tenant: "BrightMind University",
    plan: "Enterprise",
    subscription: "Active",
    renewal: "2026-06-15",
    amount: 500000,
    method: "Mastercard",
    payment: "Paid",
    reason: "Payment successful",
  },
  {
    id: 2,
    tenant: "EduCore Institute",
    plan: "Business",
    subscription: "Active",
    renewal: "2026-06-28",
    amount: 120000,
    method: "Visa",
    payment: "Paid",
    reason: "Invoice settled",
  },
  {
    id: 3,
    tenant: "NextGen College",
    plan: "Pro",
    subscription: "Active",
    renewal: "2026-07-03",
    amount: 75000,
    method: "UPI",
    payment: "Paid",
    reason: "Auto-renewal successful",
  },
  {
    id: 4,
    tenant: "Global Learning Hub",
    plan: "Business",
    subscription: "Upcoming",
    renewal: "2026-07-20",
    amount: 120000,
    method: "Visa",
    payment: "Pending",
    reason: "Awaiting payment",
  },
  {
    id: 5,
    tenant: "Future Skills Academy",
    plan: "Starter",
    subscription: "Active",
    renewal: "2026-08-10",
    amount: 29000,
    method: "Amex",
    payment: "Paid",
    reason: "Payment successful",
  },
  {
    id: 6,
    tenant: "TechLearn Pro",
    plan: "Pro",
    subscription: "Past Due",
    renewal: "2026-04-29",
    amount: 38000,
    method: "Mastercard",
    payment: "Failed",
    reason: "Card declined",
  },
  {
    id: 7,
    tenant: "InnovateX Labs",
    plan: "Business",
    subscription: "Active",
    renewal: "2026-05-12",
    amount: 120000,
    method: "Bank Transfer",
    payment: "Paid",
    reason: "Payment successful",
  },
  {
    id: 8,
    tenant: "EduSmart Academy",
    plan: "Pro",
    subscription: "Active",
    renewal: "2026-06-01",
    amount: 75000,
    method: "UPI",
    payment: "Paid",
    reason: "Invoice settled",
  },
  {
    id: 9,
    tenant: "GreenLeaf Organics",
    plan: "Starter",
    subscription: "Active",
    renewal: "2026-05-18",
    amount: 29000,
    method: "Visa",
    payment: "Failed",
    reason: "Insufficient funds",
  },
  {
    id: 10,
    tenant: "SkillCraft Institute",
    plan: "Business",
    subscription: "Active",
    renewal: "2026-07-25",
    amount: 120000,
    method: "Mastercard",
    payment: "Paid",
    reason: "Subscription renewal paid",
  },
  {
    id: 11,
    tenant: "Pixel Studio",
    plan: "Starter",
    subscription: "Upcoming",
    renewal: "2026-08-15",
    amount: 29000,
    method: "UPI",
    payment: "Pending",
    reason: "Awaiting payment",
  },
  {
    id: 12,
    tenant: "CloudBridge",
    plan: "Pro",
    subscription: "Active",
    renewal: "2026-08-22",
    amount: 75000,
    method: "Bank Transfer",
    payment: "Paid",
    reason: "Invoice settled",
  },
];

const EMPTY_FILTERS = {
  search: "",
  plan: "",
  subscription: "",
  payment: "",
  from: "",
  to: "",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const displayDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const inputClass =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const buttonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

// STEP 2: Small reusable display components.
function Badge({ value }) {
  const colors = {
    Active: "bg-emerald-50 text-emerald-600",
    Inactive: "bg-slate-100 text-slate-500",
    Paid: "bg-emerald-50 text-emerald-600",
    Upcoming: "bg-blue-50 text-blue-600",
    Pending: "bg-amber-50 text-amber-600",
    "Past Due": "bg-red-50 text-red-600",
    Failed: "bg-red-50 text-red-600",
    Enterprise: "bg-blue-50 text-orange-600",
    Business: "bg-blue-50 text-violet-600",
    Pro: "bg-orange-50 text-blue-600",
    Starter: "bg-rose-50 text-green-600",
  };
  const isStatus = [
    "Active",
    "Inactive",
    "Upcoming",
    "Past Due",
    "Paid",
    "Pending",
    "Failed",
  ].includes(value);
  return (
    <span
      className={`billing-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${colors[value] || "bg-slate-100 text-slate-600"}`}
    >
      {isStatus && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {value}
    </span>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function StatCard({ title, amount, count, icon: Icon, color, borderColor }) {
  return (
    <article style={{ borderTopColor: borderColor }} className="flex min-w-0 items-center gap-3 rounded-2xl border border-t-4 border-slate-200 bg-white p-4 shadow-sm">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-600">{title}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {money(amount)}
        </p>
        <p className="mt-2 text-xs text-slate-400">{count} matching invoices</p>
      </div>
    </article>
  );
}

// STEP 3: Table columns. selector supplies sortable data; cell controls appearance.
const baseColumns = [
  {
    name: "Tenant",
    selector: (row) => row.tenant,
    sortable: true,
    minWidth: "0px",
    grow: 1.7,
    wrap: true,
    cell: (row) => (
      <div className="billing-tenant flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
          {row.tenant
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </span>
        <span className="billing-tenant-name text-xs font-medium text-slate-700">{row.tenant}</span>
      </div>
    ),
  },
  {
    name: "Plan",
    selector: (row) => row.plan,
    sortable: true,
    minWidth: "0px",
    grow: 1,
    wrap: true,
    cell: (row) => <Badge value={row.plan} />,
  },
  {
    name: "Subscription Status",
    selector: (row) => row.subscription,
    sortable: true,
    minWidth: "0px",
    grow: 1.15,
    wrap: true,
    cell: (row) => <Badge value={row.subscription} />,
  },
  {
    name: "Renewal Date",
    selector: (row) => row.renewal,
    sortable: true,
    minWidth: "0px",
    grow: 1.1,
    wrap: true,
    cell: (row) => displayDate(row.renewal),
  },
  {
    name: "Amount",
    selector: (row) => row.amount,
    sortable: true,
    minWidth: "0px",
    grow: 1.1,
    wrap: true,
    cell: (row) => money(row.amount),
  },
  {
    name: "Payment Method",
    selector: (row) => row.method,
    sortable: true,
    minWidth: "0px",
    grow: 1.1,
    wrap: true,
  },
  {
    name: "Payment Status",
    selector: (row) => row.payment,
    sortable: true,
    minWidth: "0px",
    grow: 1.1,
    wrap: true,
    cell: (row) => <Badge value={row.payment} />,
  },
  {
    name: "Reason",
    selector: (row) => row.reason,
    sortable: true,
    minWidth: "0px",
    grow: 1.5,
    wrap: true,
    cell: (row) => (
      <span
        className={row.payment === "Failed" ? "text-red-500" : "text-slate-500"}
      >
        {row.reason}
      </span>
    ),
  },
];

const tableStyles = {
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      minHeight: "48px",
      borderBottomColor: "#e2e8f0",
    },
  },
  headCells: {
    style: {
      color: "#334155",
      fontSize: "12px",
      fontWeight: 600,
      whiteSpace: "normal",
      overflowWrap: "anywhere",
      paddingLeft: "8px",
      paddingRight: "8px",
    },
  },
  cells: {
    style: {
      color: "#475569",
      fontSize: "12px",
      paddingLeft: "8px",
      paddingRight: "8px",
    },
  },
  rows: { style: { minHeight: "56px", borderBottomColor: "#f1f5f9" } },
  pagination: {
    style: { minHeight: "72px", borderTopColor: "#e2e8f0", color: "#64748b" },
  },
};

// STEP 4: Browser downloads. These are demo exports, not payment-provider invoices.
function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCsv(rows) {
  const headers = [
    "ID",
    "Tenant",
    "Plan",
    "Subscription Status",
    "Renewal Date",
    "Amount INR",
    "Payment Method",
    "Payment Status",
    "Reason",
  ];
  const values = rows.map((row) => [
    row.id,
    row.tenant,
    row.plan,
    row.subscription,
    row.renewal,
    row.amount,
    row.method,
    row.payment,
    row.reason,
  ]);
  const escapeCell = (value) => {
    let text = String(value ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [headers, ...values]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");
  downloadFile("billing-report.csv", `\uFEFF${csv}`, "text/csv;charset=utf-8");
}

export default function BillingDashboard() {
  // STEP 5: Page state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedRows, setSelectedRows] = useState([]);
  const [resetTable, setResetTable] = useState(false);
  const [billings, setBillings] = useState(BILLINGS);
  const [rowDialog, setRowDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const dialogRef = useRef(null);

  const changeFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch }));
    setSelectedRows([]);
    setResetTable((current) => !current);
  };
  const invalidRange = Boolean(
    filters.from && filters.to && filters.from > filters.to,
  );

  // STEP 6: AND combines filters. ISO dates can be compared directly.
  const filteredRows = useMemo(() => {
    if (invalidRange) return [];
    const query = filters.search.trim().toLowerCase();
    return billings.filter(
      (row) =>
        `${row.tenant} ${row.plan}`.toLowerCase().includes(query) &&
        (!filters.plan || row.plan === filters.plan) &&
        (!filters.subscription || row.subscription === filters.subscription) &&
        (!filters.payment || row.payment === filters.payment) &&
        (!filters.from || row.renewal >= filters.from) &&
        (!filters.to || row.renewal <= filters.to),
    );
  }, [billings, filters, invalidRange]);

  // STEP 7: Cards use the same filtered data as the table.
  const cards = [
    {
      title: "Total Revenue",
      status: "",
      icon: Wallet,
      color: "bg-blue-50 text-blue-500",
      borderColor: "#3b82f6",
    },
    {
      title: "Paid Revenue",
      status: "Paid",
      icon: CircleCheck,
      color: "bg-emerald-50 text-emerald-500",
      borderColor: "#10b981",
    },
    {
      title: "Pending Revenue",
      status: "Pending",
      icon: Clock3,
      color: "bg-orange-50 text-orange-500",
      borderColor: "#f97316",
    },
    {
      title: "Failed Revenue",
      status: "Failed",
      icon: CircleX,
      color: "bg-red-50 text-red-500",
      borderColor: "#ef4444",
    },
  ];

  useEffect(() => {
    if (rowDialog && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [rowDialog]);

  const resetSelection = () => {
    setSelectedRows([]);
    setResetTable((value) => !value);
  };
  const closeDialog = () => {
    dialogRef.current?.close();
    setRowDialog(null);
  };
  const openDialog = (row) => {
    setRowDialog({ row });
  };
  const switchSubscription = (row) => {
    const subscription = row.subscription === "Active" ? "Inactive" : "Active";
    setBillings((current) => current.map((item) => item.id === row.id ? { ...item, subscription } : item));
    resetSelection();
    setNotice(`${row.tenant} is now ${subscription.toLowerCase()}.`);
  };
  const deleteRow = () => {
    const row = rowDialog.row;
    setBillings((current) => current.filter((item) => item.id !== row.id));
    resetSelection();
    setNotice(`${row.tenant}'s billing record was removed from the billing list.`);
    closeDialog();
  };
  const columns = [
    ...baseColumns,
    {
      id: "actions", name: "Actions", minWidth: "0px", grow: 0.65,
      center: true, ignoreRowClick: true,
      cell: (row) => <BillingRowActions row={row} onSwitch={switchSubscription}
        onDelete={openDialog} />,
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((value) => !value)}
        onMobileSidebarToggle={() => setIsMobileSidebarOpen((value) => !value)}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[1700px] space-y-5 p-4 sm:p-6">
            <section className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Billing Dashboard (Platform)
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Track and manage subscription billing across all tenants.
                </p>
              </div>
              <button
                type="button"
                disabled={!filteredRows.length}
                onClick={() => exportCsv(filteredRows)}
                className={buttonClass}
              >
                <Download size={16} /> Export Report
              </button>
            </section>

            <p className="text-xs text-slate-500">
              Demo data · Totals include paid, pending and failed invoice
              amounts. Date filters use renewal dates.
            </p>

            {notice && <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</p>}

            <section
              aria-label="Revenue overview"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {cards.map((card) => {
                const rows = filteredRows.filter(
                  (row) => !card.status || row.payment === card.status,
                );
                return (
                  <StatCard
                    key={card.title}
                    {...card}
                    count={rows.length}
                    amount={rows.reduce((total, row) => total + row.amount, 0)}
                  />
                );
              })}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-4 border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Billing Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    View and manage subscription payments across tenants.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[200px] flex-1">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      aria-label="Search tenants or plans"
                      placeholder="Search tenants, plans..."
                      value={filters.search}
                      onChange={(event) =>
                        changeFilters({ search: event.target.value })
                      }
                      className={`${inputClass} w-full pl-9`}
                    />
                  </div>
                  <FilterSelect
                    label="All Plans"
                    value={filters.plan}
                    options={["Starter", "Pro", "Business", "Enterprise"]}
                    onChange={(value) => changeFilters({ plan: value })}
                  />
                  <FilterSelect
                    label="All Statuses"
                    value={filters.subscription}
                    options={["Active", "Inactive", "Upcoming", "Past Due"]}
                    onChange={(value) => changeFilters({ subscription: value })}
                  />
                  <FilterSelect
                    label="All Payments"
                    value={filters.payment}
                    options={["Paid", "Pending", "Failed"]}
                    onChange={(value) => changeFilters({ payment: value })}
                  />
                  <button
                    type="button"
                    onClick={() => changeFilters(EMPTY_FILTERS)}
                    className={`${buttonClass} text-blue-600`}
                  >
                    <RotateCcw size={16} /> Clear Filters
                  </button>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="grid gap-1 text-xs text-slate-500">
                    Renewal from
                    <input
                      type="date"
                      value={filters.from}
                      max={filters.to || undefined}
                      onChange={(event) =>
                        changeFilters({ from: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="grid gap-1 text-xs text-slate-500">
                    Renewal to
                    <input
                      type="date"
                      value={filters.to}
                      min={filters.from || undefined}
                      onChange={(event) =>
                        changeFilters({ to: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <span className="py-3 text-xs text-slate-400">
                    Leave dates empty to show all dates.
                  </span>
                  {selectedRows.length > 0 && (
                    <button
                      type="button"
                      className={buttonClass}
                      onClick={() => exportCsv(selectedRows)}
                    >
                      <Download size={16} /> Export Selected (
                      {selectedRows.length})
                    </button>
                  )}
                </div>
                {invalidRange && (
                  <p role="alert" className="text-sm text-red-600">
                    Start date must be on or before end date.
                  </p>
                )}
              </div>

              {/* STEP 8: The library renders the table, checkboxes and pagination. */}
              <div className="billing-table">
                <DataTable
                  ariaLabel="Tenant billing records"
                  columns={columns}
                  data={filteredRows}
                  keyField="id"
                  customStyles={tableStyles}
                  responsive
                  highlightOnHover
                  persistTableHead
                  selectableRows
                  selectableRowsHighlight
                  selectableRowsVisibleOnly
                  clearSelectedRows={resetTable}
                  onSelectedRowsChange={({ selectedRows: rows }) =>
                    setSelectedRows(rows)
                  }
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 20, 50]}
                  paginationResetDefaultPage={resetTable}
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                  }}
                  noDataComponent={
                    <p className="p-10 text-sm text-slate-500">
                      No billing records match these filters.
                    </p>
                  }
                />
              </div>
            </section>
          </div>
        </main>
      </div>

      <dialog ref={dialogRef} aria-labelledby="billing-dialog-title"
        onClose={() => setRowDialog(null)}
        className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-900/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="billing-dialog-title" className="text-lg font-semibold text-slate-900">
            Soft Delete billing record?
          </h2>
          <button type="button" aria-label="Close dialog" onClick={closeDialog} className={buttonClass}><X size={16} /></button>
        </div>
        {rowDialog && (
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"><Trash2 size={24} /></div>
            <p className="text-sm leading-6 text-slate-600">Are you sure you want to soft delete the billing record for <strong>{rowDialog.row.tenant}</strong>?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" autoFocus onClick={closeDialog} className={buttonClass}>Cancel</button>
              <button type="button" onClick={deleteRow} className="cursor-pointer rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600">Soft Delete</button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
