import { useMemo, useState } from "react";
import {
  ChevronDown,
  Info,
  Save,
  Search,
  Settings2,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

const permissionActions = ["create", "read", "update", "delete"];

const roleDefinitions = [
  {
    key: "admin",
    label: "Admin",
    icon: UserRound,
    iconClass: "text-blue-600",
  },
  {
    key: "headConsultant",
    label: "Head Consultant",
    icon: UsersRound,
    iconClass: "text-violet-600",
  },
  {
    key: "consultant",
    label: "Consultant",
    icon: Users,
    iconClass: "text-emerald-600",
  },
];

const permissionPages = [
  {
    id: "dashboard",
    name: "Home / Dashboard",
    module: "Core",
    admin: ["create", "read", "update", "delete"],
    headConsultant: ["read"],
    consultant: ["read"],
  },
  {
    id: "tenants",
    name: "Tenants",
    module: "Core",
    admin: ["create", "read", "update", "delete"],
    headConsultant: ["read"],
    consultant: [],
  },
  {
    id: "users",
    name: "Users",
    module: "Core",
    admin: ["create", "read", "update", "delete"],
    headConsultant: ["read"],
    consultant: [],
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    module: "Subscriptions",
    admin: ["create", "read", "update"],
    headConsultant: ["read"],
    consultant: [],
  },
  {
    id: "plans",
    name: "Plans",
    module: "Subscriptions",
    admin: ["create", "read", "update"],
    headConsultant: [],
    consultant: [],
  },
  {
    id: "payments",
    name: "Payments",
    module: "Subscriptions",
    admin: ["create", "read", "update"],
    headConsultant: [],
    consultant: [],
  },
  {
    id: "billing",
    name: "Billing",
    module: "Billing",
    admin: ["create", "read", "update"],
    headConsultant: ["read"],
    consultant: [],
  },
  {
    id: "invoices",
    name: "Invoices",
    module: "Billing",
    admin: ["create", "read", "update"],
    headConsultant: ["read"],
    consultant: [],
  },
  {
    id: "aiUsage",
    name: "AI Usage",
    module: "Operations",
    admin: ["create", "read", "update"],
    headConsultant: ["read"],
    consultant: [],
  },
  {
    id: "conversations",
    name: "Conversations",
    module: "Operations",
    admin: ["create", "read", "update", "delete"],
    headConsultant: ["read", "update"],
    consultant: ["read"],
  },
  {
    id: "tickets",
    name: "Tickets",
    module: "Operations",
    admin: ["create", "read", "update", "delete"],
    headConsultant: ["read", "update"],
    consultant: ["read"],
  },
  {
    id: "auditLogs",
    name: "Audit Logs",
    module: "Admin",
    admin: ["create", "read", "update"],
    headConsultant: [],
    consultant: [],
  },
  {
    id: "settings",
    name: "Settings",
    module: "Admin",
    admin: ["create", "read", "update"],
    headConsultant: [],
    consultant: [],
  },
];

const moduleOptions = ["All Modules", "Core", "Subscriptions", "Billing", "Operations", "Admin"];

function createPermissionState() {
  return permissionPages.reduce((allPermissions, page) => {
    allPermissions[page.id] = roleDefinitions.reduce((pagePermissions, role) => {
      pagePermissions[role.key] = permissionActions.reduce((rolePermissions, action) => {
        rolePermissions[action] = page[role.key].includes(action);
        return rolePermissions;
      }, {});
      return pagePermissions;
    }, {});
    return allPermissions;
  }, {});
}

function PermissionCheckbox({ checked, label, onChange, caption }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center ${
        caption
          ? "flex-col gap-1 rounded-md py-1.5 text-[10px] font-semibold uppercase text-slate-500 hover:bg-slate-50"
          : "p-1.5"
      }`}
    >
      {caption ? <span>{caption}</span> : <span className="sr-only">{label}</span>}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600 focus:ring-2 focus:ring-blue-200"
      />
    </label>
  );
}

export default function SettingSuperAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [pageQuery, setPageQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [permissions, setPermissions] = useState(createPermissionState);
  const [saveMessage, setSaveMessage] = useState("");

  const visiblePages = useMemo(() => {
    const query = pageQuery.trim().toLowerCase();

    return permissionPages.filter((page) => {
      const matchesQuery = page.name.toLowerCase().includes(query);
      const matchesModule = moduleFilter === "All Modules" || page.module === moduleFilter;
      return matchesQuery && matchesModule;
    });
  }, [moduleFilter, pageQuery]);

  const updatePermission = (pageId, roleKey, action) => {
    setPermissions((current) => ({
      ...current,
      [pageId]: {
        ...current[pageId],
        [roleKey]: {
          ...current[pageId][roleKey],
          [action]: !current[pageId][roleKey][action],
        },
      },
    }));
    setSaveMessage("");
  };

  const savePermissions = () => {
    setSaveMessage("Permission changes saved successfully.");
  };

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#f7faff]">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
        onMobileSidebarToggle={() => setIsMobileSidebarOpen((current) => !current)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Keep absolute screen-reader labels inside this scroll area. */}
        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
            <header className="flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Manage page access permissions for Admin, Head Consultant and Consultant roles.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={savePermissions}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                {saveMessage && (
                  <p role="status" className="text-xs font-medium text-emerald-600">
                    {saveMessage}
                  </p>
                )}
              </div>
            </header>

            <section className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_10px_30px_rgba(37,99,235,0.05)] sm:p-5">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_310px_160px]">
                <div className="flex min-h-11 items-center gap-3 rounded-lg bg-blue-50 px-4 text-sm text-blue-700">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                    <Info className="h-4 w-4" />
                  </span>
                  <p>
                    Enable or disable permissions for each role. Changes will be applied after saving.
                  </p>
                </div>

                <label className="relative block">
                  <span className="sr-only">Search pages</span>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={pageQuery}
                    onChange={(event) => setPageQuery(event.target.value)}
                    placeholder="Search pages..."
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">Filter modules</span>
                  <select
                    value={moduleFilter}
                    onChange={(event) => setModuleFilter(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {moduleOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </label>
              </div>

              <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 lg:block">
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    <col style={{ width: "5%" }} />
                    <col style={{ width: "20%" }} />
                    {roleDefinitions.flatMap((role) => permissionActions.map((action) => (
                      <col key={`${role.key}-${action}`} style={{ width: "6.25%" }} />
                    )))}
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-900">
                      <th rowSpan="2" className="border-b border-r border-slate-200 px-2 py-4 text-center text-xs font-bold">S.No.</th>
                      <th rowSpan="2" className="border-b border-r border-slate-200 px-3 py-4 text-xs font-bold">Page Name</th>
                      {roleDefinitions.map(({ key, label, icon: Icon, iconClass }) => (
                        <th key={key} colSpan="4" className="overflow-hidden border-b border-r border-slate-200 px-1 py-3 text-center text-xs font-bold last:border-r-0">
                          <span className="inline-flex max-w-full items-center gap-1.5 truncate">
                            <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                            <span className="hidden 2xl:inline">{label}</span>
                            <span className="2xl:hidden">
                              {key === "headConsultant" ? "Head" : label}
                            </span>
                          </span>
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-slate-50/90 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {roleDefinitions.flatMap((role) => permissionActions.map((action) => (
                        <th key={`${role.key}-${action}`} className="overflow-hidden border-b border-r border-slate-200 px-1 py-3 text-center last:border-r-0">
                          <span className="hidden 2xl:inline">{action}</span>
                          <span className="2xl:hidden">{action.charAt(0)}</span>
                        </th>
                      )))}
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePages.map((page, index) => (
                      <tr key={page.id} className="bg-white transition hover:bg-blue-50/35">
                        <td className="border-b border-r border-slate-100 px-2 py-3 text-center text-sm font-medium text-slate-700">
                          {index + 1}
                        </td>
                        <td className="truncate border-b border-r border-slate-100 px-3 py-3 text-sm font-medium text-slate-800" title={page.name}>
                          {page.name}
                        </td>
                        {roleDefinitions.flatMap((role) => permissionActions.map((action) => (
                          <td key={`${page.id}-${role.key}-${action}`} className="border-b border-r border-slate-100 p-0 text-center last:border-r-0">
                            <PermissionCheckbox
                              checked={permissions[page.id][role.key][action]}
                              label={`${action} ${page.name} for ${role.label}`}
                              onChange={() => updatePermission(page.id, role.key, action)}
                            />
                          </td>
                        )))}
                      </tr>
                    ))}
                    {!visiblePages.length && (
                      <tr>
                        <td colSpan="14" className="px-5 py-12 text-center">
                          <p className="font-semibold text-slate-700">No pages found</p>
                          <p className="mt-1 text-sm text-slate-500">Try another page name or module filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 space-y-3 lg:hidden">
                {visiblePages.map((page, index) => (
                  <article key={page.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-600">{index + 1}. {page.module}</p>
                      <h2 className="truncate text-sm font-bold text-slate-900">{page.name}</h2>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {roleDefinitions.map(({ key, label, icon: Icon, iconClass }) => (
                        <div key={key} className="rounded-lg border border-slate-100 bg-slate-50/70 p-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                            <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
                            {label}
                          </div>
                          <div className="mt-1.5 grid grid-cols-4 divide-x divide-slate-200">
                            {permissionActions.map((action) => (
                              <PermissionCheckbox
                                key={`${page.id}-${key}-${action}`}
                                checked={permissions[page.id][key][action]}
                                label={`${action} ${page.name} for ${label}`}
                                caption={action.charAt(0)}
                                onChange={() => updatePermission(page.id, key, action)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}

                {!visiblePages.length && (
                  <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                    <p className="font-semibold text-slate-700">No pages found</p>
                    <p className="mt-1 text-sm text-slate-500">Try another page name or module filter.</p>
                  </div>
                )}
              </div>

              <footer className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing {visiblePages.length ? 1 : 0} to {visiblePages.length} of {permissionPages.length} pages
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" disabled className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-lg text-slate-300">‹</button>
                  <button type="button" className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">1</button>
                  <button type="button" disabled className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-lg text-slate-300">›</button>
                </div>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
