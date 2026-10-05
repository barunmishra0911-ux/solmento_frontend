import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTenantAccountsRequest } from "@/lib/authApi";

import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Smartphone,
  Users,
  X,
} from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

export default function TenantList() {
  const navigate = useNavigate();

  /* tenant data */

  const seedTenants = useMemo(() => [
    {
      id: 1,
      name: "BrightMind University",
      domain: "brightmind.edu",
      plan: "Enterprise",
      status: "Active",
      mrr: "$2,450",
      users: 120,
      created: "May 1, 2026",
      lastActive: "2h ago",
      avatar: "B",
      avatarClass: "bg-slate-700 text-white",
    },
    {
      id: 2,
      name: "EduCore Institute",
      domain: "educore.in",
      plan: "Professional",
      status: "Active",
      mrr: "$980",
      users: 45,
      created: "Apr 28, 2026",
      lastActive: "1h ago",
      avatar: "E",
      avatarClass: "bg-slate-800 text-white",
    },
    {
      id: 3,
      name: "NextGen College",
      domain: "nextgencollege.edu",
      plan: "Starter",
      status: "Trial",
      mrr: "$0",
      users: 15,
      created: "Apr 25, 2026",
      lastActive: "1d ago",
      avatar: "N",
      avatarClass: "bg-slate-900 text-white",
    },
    {
      id: 4,
      name: "Global Learning Hub",
      domain: "globalhub.org",
      plan: "Professional",
      status: "Active",
      mrr: "$1,250",
      users: 60,
      created: "Apr 20, 2026",
      lastActive: "3h ago",
      avatar: "G",
      avatarClass: "bg-slate-100 text-slate-600 border border-slate-300",
    },
    {
      id: 5,
      name: "Future Skills Academy",
      domain: "futureskills.academy",
      plan: "Enterprise",
      status: "Suspended",
      mrr: "$0",
      users: 0,
      created: "Apr 15, 2026",
      lastActive: "5d ago",
      avatar: "F",
      avatarClass: "bg-emerald-500 text-white",
    },
    {
      id: 6,
      name: "TechLearn Pro",
      domain: "techlearnpro.com",
      plan: "Professional",
      status: "Active",
      mrr: "$750",
      users: 35,
      created: "Apr 10, 2026",
      lastActive: "2h ago",
      avatar: "T",
      avatarClass: "bg-slate-700 text-white",
    },
    {
      id: 7,
      name: "DataScience Hub",
      domain: "datasciencehub.io",
      plan: "Starter",
      status: "Active",
      mrr: "$320",
      users: 18,
      created: "Apr 5, 2026",
      lastActive: "6h ago",
      avatar: "D",
      avatarClass: "bg-cyan-500 text-white",
    },
    {
      id: 8,
      name: "SmartEdu Platform",
      domain: "smartedu.io",
      plan: "Enterprise",
      status: "Trial",
      mrr: "$0",
      users: 25,
      created: "Mar 30, 2026",
      lastActive: "12h ago",
      avatar: "S",
      avatarClass: "bg-orange-400 text-white",
    },
  ], []);

  /* states */

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("Created: Any Time");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [tenants, setTenants] = useState(seedTenants);

  useEffect(() => {
    let active = true;
    listTenantAccountsRequest()
      .then(({ tenants: apiTenants }) => {
        if (!active) return;
        const mapped = (apiTenants || []).map((tenant) => ({
          id: tenant.id,
          name: tenant.companyName,
          domain: tenant.domain || "—",
          plan: tenant.plan,
          status: tenant.status === "ACTIVE" ? "Active" : "Suspended",
          mrr: "—",
          users: Number(tenant.users || 0),
          created: new Date(tenant.createdAt).toLocaleDateString(),
          lastActive: "—",
          avatar: (tenant.companyName || "T").slice(0, 1).toUpperCase(),
          avatarClass: "bg-blue-600 text-white",
        }));
        setTenants(mapped);
      })
      .catch(() => {
        if (active) setTenants(seedTenants);
      });
    return () => { active = false; };
  }, [seedTenants]);

  /* filtered tenants */

  const filteredTenants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tenants.filter((tenant) => {
      const matchesSearch =
        !normalizedSearch ||
        tenant.name.toLowerCase().includes(normalizedSearch) ||
        tenant.domain.toLowerCase().includes(normalizedSearch);

      const matchesPlan =
        planFilter === "All Plans" || tenant.plan === planFilter;

      const matchesStatus =
        statusFilter === "All Status" || tenant.status === statusFilter;

      let matchesDate = true;

      if (dateFilter === "Created: Last 7 Days") {
        matchesDate = [1, 2, 3, 4, 5, 6, 7].includes(tenant.id);
      }

      if (dateFilter === "Created: Last 30 Days") {
        matchesDate = tenant.id <= 8;
      }

      return matchesSearch && matchesPlan && matchesStatus && matchesDate;
    });
  }, [dateFilter, planFilter, search, statusFilter, tenants]);

  const allVisibleSelected =
    filteredTenants.length > 0 &&
    filteredTenants.every((tenant) => selectedIds.includes(tenant.id));

  /* selection */

  const toggleTenant = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) => !filteredTenants.some((tenant) => tenant.id === id),
        ),
      );

      return;
    }

    const visibleIds = filteredTenants.map((tenant) => tenant.id);

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...visibleIds])),
    );
  };

  /* filters */

  const clearFilters = () => {
    setSearch("");
    setPlanFilter("All Plans");
    setStatusFilter("All Status");
    setDateFilter("Created: Any Time");
    setCurrentPage(1);
    setIsFilterSheetOpen(false);
  };

  /* export */

  const handleExport = () => {
    const rows = (
      selectedIds.length > 0
        ? tenants.filter((tenant) => selectedIds.includes(tenant.id))
        : filteredTenants
    ).map((tenant) => [
      tenant.name,
      tenant.domain,
      tenant.plan,
      tenant.status,
      tenant.mrr,
      tenant.users,
      tenant.created,
      tenant.lastActive,
    ]);

    const csv = [
      [
        "Company",
        "Domain",
        "Plan",
        "Status",
        "MRR",
        "Users",
        "Created",
        "Last Active",
      ],
      ...rows,
    ]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "solmento-admins.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const totalPages = 31;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
        onMobileSidebarToggle={() =>
          setIsMobileSidebarOpen((current) => !current)
        }
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search admins by name, domain, or email..."
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* sidebar */}

        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* page */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            {/* page heading */}

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Admin List
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage all admins on the platform. View usage, status, and
                  manage admin settings.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  className="
                    inline-flex
                    h-10
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-blue-200
                    bg-white
                    px-4
                    text-sm
                    font-medium
                    text-blue-500
                    transition
                    hover:bg-blue-50
                  "
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/super-admin/tenants/new")}
                  className="
                    inline-flex
                    h-10
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-500
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-blue-600
                  "
                >
                  <Plus className="h-4 w-4" />
                  Create Admin
                </button>
              </div>
            </div>

            {/* tenant table card */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* filters */}

              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(280px,1.3fr)_repeat(3,minmax(150px,1fr))]">
                  {/* search */}

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search admins by name, domain, or email..."
                      className="
                        h-10
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        pl-10
                        pr-4
                        text-sm
                        text-slate-700
                        outline-none
                        placeholder:text-slate-400
                        focus:border-blue-300
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />
                  </div>

                  <FilterSelect
                    value={planFilter}
                    onChange={(value) => {
                      setPlanFilter(value);
                      setCurrentPage(1);
                    }}
                    options={[
                      "All Plans",
                      "Starter",
                      "Professional",
                      "Enterprise",
                    ]}
                  />

                  <FilterSelect
                    value={statusFilter}
                    onChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                    options={["All Status", "Active", "Trial", "Suspended"]}
                  />

                  <FilterSelect
                    value={dateFilter}
                    onChange={(value) => {
                      setDateFilter(value);
                      setCurrentPage(1);
                    }}
                    options={[
                      "Created: Any Time",
                      "Created: Last 7 Days",
                      "Created: Last 30 Days",
                    ]}
                    icon={<CalendarDays className="h-4 w-4" />}
                  />
                </div>

                {/* mobile filter button */}

                <div className="mt-3 flex items-center justify-between lg:hidden">
                  <button
                    type="button"
                    onClick={() => setIsFilterSheetOpen(true)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-slate-600
                    "
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>

                  <span className="text-xs text-slate-400">
                    {filteredTenants.length} results
                  </span>
                </div>

                {/* bulk actions */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="
                        flex
                        h-5
                        w-5
                        cursor-pointer
                        items-center
                        justify-center
                        rounded
                        border
                        border-slate-300
                        bg-white
                      "
                    >
                      {allVisibleSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </button>

                    <span className="text-xs text-slate-500">
                      {selectedIds.length} selected
                    </span>

                    <button
                      type="button"
                      disabled={selectedIds.length === 0}
                      className="
                        rounded-xl
                        bg-red-50
                        px-4
                        py-2
                        text-xs
                        font-medium
                        text-red-500
                        transition
                        hover:bg-red-100
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      Suspend
                    </button>

                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={
                        selectedIds.length === 0 && filteredTenants.length === 0
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-2
                        text-xs
                        font-medium
                        text-blue-500
                        transition
                        hover:bg-blue-50
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      inline-flex
                      cursor-pointer
                      items-center
                      gap-1
                      text-xs
                      font-medium
                      text-blue-500
                      transition
                      hover:text-blue-600
                    "
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* desktop table */}

              <div className="hidden lg:block">
                {filteredTenants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px]">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-[11px] font-semibold text-slate-500">
                          <th className="w-14 px-5 py-3">
                            <button
                              type="button"
                              onClick={toggleSelectAll}
                              className="
                                flex
                                h-4
                                w-4
                                cursor-pointer
                                items-center
                                justify-center
                                rounded
                                border
                                border-slate-300
                                bg-white
                              "
                            >
                              {allVisibleSelected && (
                                <Check className="h-3 w-3 text-blue-500" />
                              )}
                            </button>
                          </th>

                          <th className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              Company
                              <span className="text-[9px]">↕</span>
                            </div>
                          </th>

                          <th className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              Plan
                              <span className="text-[9px]">↕</span>
                            </div>
                          </th>

                          <th className="px-3 py-3">Status</th>

                          <th className="px-3 py-3">MRR</th>

                          <th className="px-3 py-3">Users</th>

                          <th className="px-3 py-3">Created</th>

                          <th className="px-3 py-3">Last Active</th>

                          <th className="px-3 py-3 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredTenants.map((tenant) => (
                          <tr
                            key={tenant.id}
                            className="
                              border-t
                              border-slate-100
                              transition
                              hover:bg-slate-50/70
                            "
                          >
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => toggleTenant(tenant.id)}
                                className="
                                  flex
                                  h-4
                                  w-4
                                  cursor-pointer
                                  items-center
                                  justify-center
                                  rounded
                                  border
                                  border-slate-300
                                  bg-white
                                "
                              >
                                {selectedIds.includes(tenant.id) && (
                                  <Check className="h-3 w-3 text-blue-500" />
                                )}
                              </button>
                            </td>

                            <td className="px-3 py-4">
                              <div className="flex items-center gap-3">
                                {/* avatar */}

                                <div
                                  className={`
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        text-xs
        font-bold
        ${tenant.avatarClass}
      `}
                                >
                                  {tenant.avatar}
                                </div>

                                {/* company information */}

                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(
                                        `/super-admin/tenants/${tenant.id}`,
                                      )
                                    }
                                    className="
          block
          max-w-full
          cursor-pointer
          truncate
          text-left
          text-sm
          font-semibold
          text-slate-800
          transition-colors
          hover:text-blue-600
          hover:underline
        "
                                  >
                                    {tenant.name}
                                  </button>

                                  <p className="text-xs text-slate-400">
                                    {tenant.domain}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-4 text-xs font-medium text-slate-700">
                              {tenant.plan}
                            </td>

                            <td className="px-3 py-4">
                              <StatusBadge status={tenant.status} />
                            </td>

                            <td className="px-3 py-4 text-xs font-medium text-slate-700">
                              {tenant.mrr}
                            </td>

                            <td className="px-3 py-4 text-xs text-slate-700">
                              {tenant.users}
                            </td>

                            <td className="px-3 py-4 text-xs text-slate-700">
                              {tenant.created}
                            </td>

                            <td className="px-3 py-4 text-xs text-slate-500">
                              {tenant.lastActive}
                            </td>

                            <td className="px-3 py-4 text-right">
                              <button
                                type="button"
                                className="
                                  cursor-pointer
                                  rounded-lg
                                  p-2
                                  text-slate-400
                                  transition
                                  hover:bg-slate-100
                                  hover:text-slate-600
                                "
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState onClear={clearFilters} />
                )}
              </div>

              {/* mobile stacked cards */}

              <div className="space-y-3 p-4 lg:hidden">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTenant(tenant.id)}
                            className="
                              flex
                              h-5
                              w-5
                              shrink-0
                              cursor-pointer
                              items-center
                              justify-center
                              rounded
                              border
                              border-slate-300
                            "
                          >
                            {selectedIds.includes(tenant.id) && (
                              <Check className="h-3.5 w-3.5 text-blue-500" />
                            )}
                          </button>

                          <div
                            className={`
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              text-xs
                              font-bold
                              ${tenant.avatarClass}
                            `}
                          >
                            {tenant.avatar}
                          </div>

                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/super-admin/tenants/${tenant.id}`)
                              }
                              className="
                                block
                                max-w-full
                                cursor-pointer
                                truncate
                                text-left
                                text-sm
                                font-semibold
                                text-slate-800
                                transition-colors
                                hover:text-blue-600
                                hover:underline
                              "
                            >
                              {tenant.name}
                            </button>

                            <p className="truncate text-xs text-slate-400">
                              {tenant.domain}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-400"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <InfoItem label="Plan" value={tenant.plan} />

                        <InfoItem
                          label="Status"
                          value={<StatusBadge status={tenant.status} />}
                        />

                        <InfoItem label="MRR" value={tenant.mrr} />

                        <InfoItem label="Users" value={tenant.users} />

                        <InfoItem label="Created" value={tenant.created} />

                        <InfoItem
                          label="Last Active"
                          value={tenant.lastActive}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState onClear={clearFilters} />
                )}
              </div>

              {/* pagination */}

              <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing 1 to {filteredTenants.length} of 248 admins
                </p>

                <div className="flex items-center gap-1">
                  <PaginationButton
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PaginationButton>

                  {[1, 2, 3].map((page) => (
                    <PaginationButton
                      key={page}
                      active={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationButton>
                  ))}

                  <span className="px-1 text-xs text-slate-400">...</span>

                  <PaginationButton
                    active={currentPage === 31}
                    onClick={() => setCurrentPage(31)}
                  >
                    31
                  </PaginationButton>

                  <PaginationButton
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PaginationButton>
                </div>
              </div>
            </section>

            {/* responsive hint */}

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Smartphone className="h-4 w-4" />
              <span>
                Mobile: Table becomes stacked cards. Filters open in a bottom
                sheet.
              </span>
            </div>
          </div>
        </main>

        {/* mobile filter sheet */}

        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setIsFilterSheetOpen(false)}
              className="absolute inset-0 bg-slate-900/40"
            />

            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    Filters
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Narrow down your admin list.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <FilterField
                  label="Plan"
                  value={planFilter}
                  onChange={setPlanFilter}
                  options={[
                    "All Plans",
                    "Starter",
                    "Professional",
                    "Enterprise",
                  ]}
                />

                <FilterField
                  label="Status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={["All Status", "Active", "Trial", "Suspended"]}
                />

                <FilterField
                  label="Created"
                  value={dateFilter}
                  onChange={setDateFilter}
                  options={[
                    "Created: Any Time",
                    "Created: Last 7 Days",
                    "Created: Last 30 Days",
                  ]}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    h-11
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="
                    h-11
                    rounded-xl
                    bg-blue-500
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* filter select */

function FilterSelect({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      ) : null}

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`
          h-10
          w-full
          cursor-pointer
          appearance-none
          rounded-xl
          border
          border-slate-200
          bg-white
          pr-9
          text-sm
          text-slate-600
          outline-none
          transition
          focus:border-blue-300
          focus:ring-2
          focus:ring-blue-100
          ${icon ? "pl-10" : "pl-3"}
        `}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* mobile filter field */

function FilterField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-slate-600">
        {label}
      </span>

      <FilterSelect value={value} onChange={onChange} options={options} />
    </label>
  );
}

/* status badge */

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-emerald-100 text-emerald-600",
    Trial: "bg-blue-100 text-blue-500",
    Suspended: "bg-red-100 text-red-500",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${styles[status] || "bg-slate-100 text-slate-500"}
      `}
    >
      {status}
    </span>
  );
}

/* table info */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 text-xs font-medium text-slate-700">{value}</div>
    </div>
  );
}

/* empty state */

function EmptyState({ onClear }) {
  return (
    <div className="m-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <Search className="h-6 w-6 text-slate-300" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        No admins match your filters
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        Try adjusting your search or filter criteria.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="
          mt-4
          cursor-pointer
          rounded-xl
          border
          border-slate-200
          bg-white
          px-5
          py-2
          text-xs
          font-semibold
          text-slate-600
          shadow-sm
          transition
          hover:bg-slate-50
        "
      >
        Clear Filters
      </button>
    </div>
  );
}

/* pagination button */

function PaginationButton({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        h-9
        min-w-9
        cursor-pointer
        items-center
        justify-center
        rounded-lg
        border
        text-xs
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${
          active
            ? "border-blue-300 bg-blue-50 text-blue-500"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        }
      `}
    >
      {children}
    </button>
  );
}
