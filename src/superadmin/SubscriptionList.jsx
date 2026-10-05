import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { useTableExport } from "react-data-table-component";

import {
  ArrowLeftRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Filter,
  Search,
  X,
  XCircle,
} from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

const subscriptionSummary = [
  {
    label: "Total Subscriptions",
    value: "156",
    detail: "All tenant subscriptions",
    icon: Building2,
    iconClass: "bg-blue-50 text-blue-500",
    borderTopClass: "border-t-blue-500",
  },
  {
    label: "Active",
    value: "142",
    detail: "91.0% of total",
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-500",
    borderTopClass: "border-t-emerald-500",
  },
  {
    label: "Expiring Soon",
    value: "8",
    detail: "Within 7 days",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-500",
    borderTopClass: "border-t-amber-500",
  },
  {
    label: "Cancelled",
    value: "6",
    detail: "Inactive subscriptions",
    icon: XCircle,
    iconClass: "bg-violet-50 text-violet-500",
    borderTopClass: "border-t-violet-500",
  },
  {
    label: "Monthly Recurring Revenue",
    value: "$48,750",
    detail: "Total MRR",
    icon: BadgeDollarSign,
    iconClass: "bg-cyan-50 text-cyan-500",
    borderTopClass: "border-t-cyan-500",
  },
];

const initialSubscriptions = [
  {
    id: 1,
    tenantId: 1,
    tenantName: "BrightMind University",
    domain: "brightmind.edu",
    initial: "B",
    avatarClass: "bg-violet-600 text-white",
    plan: "Enterprise Plan",
    status: "Active",
    renewalDate: "2026-09-16",
    renewalLabel: "in 12 days",
    mrr: 5000,
    paymentBrand: "VISA",
    paymentLastFour: "4242",
    paymentStatus: "Paid",
  },
  {
    id: 2,
    tenantId: 2,
    tenantName: "TechNova Solutions",
    domain: "technova.com",
    initial: "T",
    avatarClass: "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500",
    plan: "Business Plan",
    status: "Active",
    renewalDate: "2026-09-29",
    renewalLabel: "in 25 days",
    mrr: 1200,
    paymentBrand: "Mastercard",
    paymentLastFour: "5555",
    paymentStatus: "Paid",
  },
  {
    id: 3,
    tenantId: 3,
    tenantName: "HealthCare Plus",
    domain: "healthcareplus.com",
    initial: "H",
    avatarClass:
      "bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-500",
    plan: "Pro Plan",
    status: "Active",
    renewalDate: "2026-10-04",
    renewalLabel: "in 30 days",
    mrr: 299,
    paymentBrand: "Amex",
    paymentLastFour: "1001",
    paymentStatus: "Paid",
  },
  {
    id: 4,
    tenantId: 4,
    tenantName: "EduSmart Academy",
    domain: "edusmart.edu",
    initial: "E",
    avatarClass:
      "bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-500",
    plan: "Business Plan",
    status: "Expiring Soon",
    renewalDate: "2026-09-09",
    renewalLabel: "in 5 days",
    mrr: 1200,
    paymentBrand: "VISA",
    paymentLastFour: "2211",
    paymentStatus: "Payment Failed",
  },
  {
    id: 5,
    tenantId: 5,
    tenantName: "GreenLeaf Organics",
    domain: "greenleaf.com",
    initial: "G",
    avatarClass: "bg-emerald-50 text-emerald-600",
    plan: "Pro Plan",
    status: "Active",
    renewalDate: "2026-09-11",
    renewalLabel: "in 7 days",
    mrr: 299,
    paymentBrand: "VISA",
    paymentLastFour: "4242",
    paymentStatus: "Paid",
  },
  {
    id: 6,
    tenantId: 6,
    tenantName: "InnovateX Labs",
    domain: "innovatex.com",
    initial: "I",
    avatarClass: "bg-pink-50 text-pink-600",
    plan: "Starter Plan",
    status: "Cancelled",
    renewalDate: "2026-08-22",
    renewalLabel: "ended",
    mrr: 0,
    paymentBrand: null,
    paymentLastFour: null,
    paymentStatus: null,
  },
  {
    id: 7,
    tenantId: 7,
    tenantName: "DataBridge Inc.",
    domain: "databridge.com",
    initial: "D",
    avatarClass: "bg-blue-50 text-blue-600",
    plan: "Business Plan",
    status: "Active",
    renewalDate: "2026-09-21",
    renewalLabel: "in 17 days",
    mrr: 1200,
    paymentBrand: "Mastercard",
    paymentLastFour: "8888",
    paymentStatus: "Paid",
  },
  {
    id: 8,
    tenantId: 8,
    tenantName: "Skyline Enterprises",
    domain: "skyline.com",
    initial: "S",
    avatarClass: "bg-amber-50 text-amber-600",
    plan: "Enterprise Plan",
    status: "Active",
    renewalDate: "2026-10-16",
    renewalLabel: "in 42 days",
    mrr: 5000,
    paymentBrand: "Amex",
    paymentLastFour: "3003",
    paymentStatus: "Paid",
  },
  {
    id: 9,
    tenantId: 9,
    tenantName: "NorthStar Media",
    domain: "northstarmedia.com",
    initial: "N",
    avatarClass: "bg-sky-50 text-sky-600",
    plan: "Pro Plan",
    status: "Active",
    renewalDate: "2026-10-23",
    renewalLabel: "in 49 days",
    mrr: 299,
    paymentBrand: "VISA",
    paymentLastFour: "6831",
    paymentStatus: "Paid",
  },
  {
    id: 10,
    tenantId: 10,
    tenantName: "Crestwood Consulting",
    domain: "crestwood.io",
    initial: "C",
    avatarClass: "bg-slate-100 text-slate-600",
    plan: "Starter Plan",
    status: "Expiring Soon",
    renewalDate: "2026-09-07",
    renewalLabel: "in 3 days",
    mrr: 99,
    paymentBrand: "Mastercard",
    paymentLastFour: "1974",
    paymentStatus: "Paid",
  },
  {
    id: 11,
    tenantId: 11,
    tenantName: "Apex Learning Hub",
    domain: "apexlearning.org",
    initial: "A",
    avatarClass: "bg-teal-50 text-teal-600",
    plan: "Business Plan",
    status: "Active",
    renewalDate: "2026-11-02",
    renewalLabel: "in 59 days",
    mrr: 1200,
    paymentBrand: "VISA",
    paymentLastFour: "9072",
    paymentStatus: "Paid",
  },
  {
    id: 12,
    tenantId: 12,
    tenantName: "Orbit Commerce",
    domain: "orbitcommerce.com",
    initial: "O",
    avatarClass: "bg-rose-50 text-rose-600",
    plan: "Enterprise Plan",
    status: "Cancelled",
    renewalDate: "2026-08-30",
    renewalLabel: "ended",
    mrr: 0,
    paymentBrand: null,
    paymentLastFour: null,
    paymentStatus: null,
  },
];

const tableStyles = {
  table: {
    style: {
      backgroundColor: "#ffffff",
    },
  },
  headRow: {
    style: {
      minHeight: "48px",
      backgroundColor: "#3b82f6",
      borderBottom: "1px solid #3b82f6",
      transition: "background-color 200ms ease",
    },
  },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: 700,
      paddingLeft: "18px",
      paddingRight: "18px",
    },
  },
  rows: {
    style: {
      minHeight: "72px",
      color: "#334155",
      fontSize: "13px",
      borderBottom: "1px solid #eef2f7",
    },
    selectedHighlightStyle: {
      backgroundColor: "#eff6ff",
    },
  },
  cells: {
    style: {
      paddingLeft: "18px",
      paddingRight: "18px",
    },
  },
  pagination: {
    style: {
      minHeight: "64px",
      color: "#64748b",
      borderTop: "1px solid #e2e8f0",
    },
  },
  noData: {
    style: {
      minHeight: "220px",
    },
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

export default function SubscriptionList() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [planFilter, setPlanFilter] = useState("All plans");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [paymentFilter, setPaymentFilter] = useState("All payments");
  const [selectedRows, setSelectedRows] = useState([]);
  const [resetPagination, setResetPagination] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return initialSubscriptions.filter((subscription) => {
      const matchesSearch =
        !query ||
        subscription.tenantName.toLowerCase().includes(query) ||
        subscription.domain.toLowerCase().includes(query) ||
        subscription.plan.toLowerCase().includes(query) ||
        subscription.status.toLowerCase().includes(query);

      const matchesPlan =
        planFilter === "All plans" || subscription.plan === planFilter;
      const matchesStatus =
        statusFilter === "All statuses" || subscription.status === statusFilter;
      const matchesPayment =
        paymentFilter === "All payments" ||
        (paymentFilter === "No payment method"
          ? !subscription.paymentStatus
          : subscription.paymentStatus === paymentFilter);

      return matchesSearch && matchesPlan && matchesStatus && matchesPayment;
    });
  }, [paymentFilter, planFilter, searchQuery, statusFilter]);

  const columns = useMemo(
    () => [
      {
        id: "tenant",
        name: "Tenant",
        selector: (row) => row.tenantName,
        sortable: true,
        minWidth: "245px",
        grow: 1.45,
        cell: (row) => <TenantCell subscription={row} />,
      },
      {
        id: "plan",
        name: "Plan",
        selector: (row) => row.plan,
        sortable: true,
        minWidth: "145px",
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "130px",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "renewal",
        name: "Renewal Date",
        selector: (row) => row.renewalDate,
        sortable: true,
        minWidth: "165px",
        format: (row) => `${formatDate(row.renewalDate)} (${row.renewalLabel})`,
        cell: (row) => <RenewalCell subscription={row} />,
      },
      {
        id: "mrr",
        name: "MRR",
        selector: (row) => row.mrr,
        sortable: true,
        minWidth: "120px",
        format: (row) => formatCurrency(row.mrr),
      },
      {
        id: "payment",
        name: "Payment Method Status",
        selector: (row) =>
          row.paymentBrand
            ? `${row.paymentBrand} ${row.paymentLastFour} ${row.paymentStatus}`
            : "No payment method",
        minWidth: "250px",
        grow: 1.2,
        cell: (row) => <PaymentCell subscription={row} />,
      },
    ],
    [],
  );

  const exportRows = selectedRows.length ? selectedRows : filteredSubscriptions;
  const { download } = useTableExport({
    columns,
    rows: exportRows,
    valueSource: "format",
    columnOrder: ["tenant", "plan", "status", "renewal", "mrr", "payment"],
  });

  const hasActiveFilters =
    searchQuery.trim() ||
    planFilter !== "All plans" ||
    statusFilter !== "All statuses" ||
    paymentFilter !== "All payments";

  const resetPages = () => {
    setResetPagination((current) => !current);
    setMobilePage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    resetPages();
  };

  const handlePlanFilterChange = (value) => {
    setPlanFilter(value);
    resetPages();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    resetPages();
  };

  const handlePaymentFilterChange = (value) => {
    setPaymentFilter(value);
    resetPages();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPlanFilter("All plans");
    setStatusFilter("All statuses");
    setPaymentFilter("All payments");
    resetPages();
  };

  const handleRowAction = (action, context) => {
    if (context.type !== "row") {
      return;
    }

    if (action.id === "view-tenant") {
      navigate(`/super-admin/tenants/${context.row.tenantId}`);
    }

    if (action.id === "change-plan") {
      navigate("/super-admin/plans");
    }
  };

  const mobilePageSize = 5;
  const mobilePageCount = Math.max(
    1,
    Math.ceil(filteredSubscriptions.length / mobilePageSize),
  );
  const mobileRows = filteredSubscriptions.slice(
    (mobilePage - 1) * mobilePageSize,
    mobilePage * mobilePageSize,
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
        onMobileSidebarToggle={() =>
          setIsMobileSidebarOpen((current) => !current)
        }
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search subscriptions, tenants, or plans..."
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Subscription List
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  View and manage tenant subscriptions and billing details.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => download("subscription-list.csv", "csv")}
                  className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  type="button"
                  aria-expanded={filtersOpen}
                  onClick={() => setFiltersOpen((current) => !current)}
                  className={`inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm transition sm:flex-none ${
                    filtersOpen || hasActiveFilters
                      ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {subscriptionSummary.map((item) => (
                <SummaryCard key={item.label} item={item} />
              ))}
            </section>

            {filtersOpen && (
              <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="relative block">
                    <span className="sr-only">Search subscriptions</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      placeholder="Search tenant or plan"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <FilterSelect
                    label="Filter by plan"
                    value={planFilter}
                    onChange={handlePlanFilterChange}
                    options={[
                      "All plans",
                      "Starter Plan",
                      "Pro Plan",
                      "Business Plan",
                      "Enterprise Plan",
                    ]}
                  />
                  <FilterSelect
                    label="Filter by status"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    options={[
                      "All statuses",
                      "Active",
                      "Expiring Soon",
                      "Cancelled",
                    ]}
                  />
                  <FilterSelect
                    label="Filter by payment status"
                    value={paymentFilter}
                    onChange={handlePaymentFilterChange}
                    options={[
                      "All payments",
                      "Paid",
                      "Payment Failed",
                      "No payment method",
                    ]}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    {filteredSubscriptions.length} matching subscriptions
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear filters
                    </button>
                  )}
                </div>
              </section>
            )}

            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden md:block">
                <DataTable
                  className="subscription-data-table"
                  ariaLabel="Tenant subscriptions"
                  columns={columns}
                  data={filteredSubscriptions}
                  customStyles={tableStyles}
                  keyField="id"
                  selectableRows
                  selectableRowsHighlight
                  selectableRowsVisibleOnly
                  onSelectedRowsChange={({ selectedRows: rows }) =>
                    setSelectedRows(rows)
                  }
                  pagination
                  paginationPerPage={8}
                  paginationRowsPerPageOptions={[8, 16, 24]}
                  paginationResetDefaultPage={resetPagination}
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                  }}
                  persistTableHead
                  responsive
                  highlightOnHover
                  pointerOnHover
                  onRowClicked={(row) =>
                    navigate(`/super-admin/tenants/${row.tenantId}`)
                  }
                  contextMenu={{
                    row: true,
                    header: false,
                    trigger: "menu-button",
                    menuPosition: "end",
                  }}
                  contextMenuActions={{
                    row: () => [
                      {
                        id: "view-tenant",
                        label: "View tenant",
                        icon: <Eye className="h-4 w-4" />,
                      },
                      {
                        id: "change-plan",
                        label: "Change plan",
                        icon: <ArrowLeftRight className="h-4 w-4" />,
                      },
                    ],
                  }}
                  onContextMenuAction={handleRowAction}
                  noDataComponent={<EmptyState onClear={clearFilters} />}
                />
              </div>

              <div className="md:hidden">
                {mobileRows.length ? (
                  <div className="divide-y divide-slate-100">
                    {mobileRows.map((subscription) => (
                      <MobileSubscriptionCard
                        key={subscription.id}
                        subscription={subscription}
                        onOpen={() =>
                          navigate(
                            `/super-admin/tenants/${subscription.tenantId}`,
                          )
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState onClear={clearFilters} />
                )}

                {filteredSubscriptions.length > mobilePageSize && (
                  <div className="flex min-h-16 items-center justify-between border-t border-slate-200 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Page {mobilePage} of {mobilePageCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous page"
                        disabled={mobilePage === 1}
                        onClick={() =>
                          setMobilePage((page) => Math.max(1, page - 1))
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next page"
                        disabled={mobilePage === mobilePageCount}
                        onClick={() =>
                          setMobilePage((page) =>
                            Math.min(mobilePageCount, page + 1),
                          )
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ item }) {
  const Icon = item.icon;

  return (
    <article
      className={`flex min-h-24 items-center gap-3 rounded-2xl border border-t-4 border-slate-200 bg-white p-4 shadow-sm ${item.borderTopClass}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="whitespace-nowrap text-xs font-medium text-slate-500">
          {item.label}
        </p>
        <p className="mt-0.5 text-xl font-bold text-slate-900">{item.value}</p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">
          {item.detail}
        </p>
      </div>
    </article>
  );
}

function TenantCell({ subscription }) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-2">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${subscription.avatarClass}`}
      >
        {subscription.initial}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-800">
          {subscription.tenantName}
        </p>
        <p className="truncate text-xs text-slate-400">{subscription.domain}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusClasses = {
    Active: "bg-emerald-50 text-emerald-600",
    "Expiring Soon": "bg-amber-50 text-amber-600",
    Cancelled: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

function RenewalCell({ subscription }) {
  const isUrgent = subscription.status === "Expiring Soon";

  return (
    <div className="py-2">
      <p className="font-medium text-slate-700">
        {formatDate(subscription.renewalDate)}
      </p>
      <p className={`text-xs ${isUrgent ? "text-rose-500" : "text-slate-400"}`}>
        ({subscription.renewalLabel})
      </p>
    </div>
  );
}

function PaymentCell({ subscription }) {
  if (!subscription.paymentBrand) {
    return <span className="text-sm text-slate-400">No payment method</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2 py-2">
      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-1 text-[9px] font-bold text-slate-600">
        {subscription.paymentBrand}
      </span>
      <span className="whitespace-nowrap text-xs text-slate-500">
        **** {subscription.paymentLastFour}
      </span>
      <PaymentBadge status={subscription.paymentStatus} />
    </div>
  );
}

function PaymentBadge({ status }) {
  const isPaid = status === "Paid";

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
        isPaid ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      }`}
    >
      {status}
    </span>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ onClear }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Search className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">
        No subscriptions found
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Try changing or clearing your current filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Clear filters
      </button>
    </div>
  );
}

function MobileSubscriptionCard({ subscription, onOpen }) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <TenantCell subscription={subscription} />
        <button
          type="button"
          aria-label={`View ${subscription.tenantName}`}
          title="View tenant"
          onClick={onOpen}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <MobileDetail label="Plan" value={subscription.plan} />
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={subscription.status} />
          </div>
        </div>
        <MobileDetail
          label="Renewal"
          value={formatDate(subscription.renewalDate)}
          detail={subscription.renewalLabel}
        />
        <MobileDetail label="MRR" value={formatCurrency(subscription.mrr)} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase text-slate-400">
          Payment method
        </p>
        <PaymentCell subscription={subscription} />
      </div>
    </article>
  );
}

function MobileDetail({ label, value, detail }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-slate-700">
        {value}
      </p>
      {detail && <p className="text-[10px] text-slate-400">{detail}</p>}
    </div>
  );
}
