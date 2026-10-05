import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Crown,
  Edit2,
  Eye,
  Headphones,
  Info,
  LayoutDashboard,
  Loader2,
  MessagesSquare,
  MoreVertical,
  PhoneCall,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import CreateEditCustomRole from "./CreateEditCustomRole";
import DeleteRoleModal from "./DeleteRoleModal";
import {
  listRolesRequest,
  getRolePermissionsRequest,
  updateRolePermissionsRequest,
  deleteRoleRequest,
  listPermissionsCatalogRequest,
  createRoleRequest,
  updateRoleRequest,
} from "@/lib/authApi";

const ICON_MAP = {
  users: UsersRound,
  crown: Crown,
  team: Users,
  support: Headphones,
  chat: MessagesSquare,
  calendar: CalendarDays,
  tasks: CheckSquare,
  reports: BarChart3,
  shield: ShieldCheck,
  settings: Settings2,
};

const MODULE_ICON_MAP = {
  dashboard: LayoutDashboard,
  inbox: MessagesSquare,
  my_leads: UsersRound,
  myLeads: UsersRound,
  follow_ups: CalendarDays,
  followUps: CalendarDays,
  calls: PhoneCall,
  performance: BarChart3,
  availability: Clock,
};

const DEFAULT_MODULES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: MessagesSquare },
  { id: "my_leads", label: "My Leads", icon: UsersRound },
  { id: "follow_ups", label: "Follow-ups", icon: CalendarDays },
  { id: "calls", label: "Calls", icon: PhoneCall },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "availability", label: "Availability", icon: Clock },
];

const PERMISSION_ACTIONS = ["view", "create", "update", "delete"];

function RoleItem({
  role,
  active,
  onSelect,
  onEdit,
  onDelete,
  openMenuId,
  setOpenMenuId,
}) {
  const Icon = ICON_MAP[role.iconKey] || UsersRound;
  const isMenuOpen = openMenuId === role.id;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-2.5 sm:gap-3 rounded-xl border px-3 sm:px-3.5 py-3 text-left transition cursor-pointer ${
        active
          ? "border-blue-200 bg-blue-50/70 shadow-xs"
          : "border-slate-100 bg-white hover:border-blue-100 hover:bg-slate-50/80"
      }`}
    >
      {active && (
        <i className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-blue-600" />
      )}
      <span className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl font-medium transition bg-purple-100 text-purple-700">
        <Icon size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-xs sm:text-sm font-semibold ${
            active ? "text-blue-900" : "text-slate-900"
          }`}
        >
          {role.name}
        </span>
        <span className="mt-0.5 block truncate text-[11px] sm:text-xs text-slate-500">
          {role.description || "Custom role permissions"}
        </span>
      </span>

      <span className="rounded-md px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold shrink-0 border bg-purple-50 text-purple-700 border-purple-100">
        Custom
      </span>

      {/* Three-dot action menu for custom roles */}
      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isMenuOpen ? null : role.id);
          }}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          aria-label={`Options for role ${role.name}`}
        >
          <MoreVertical size={16} />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-9 z-40 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-xl ring-1 ring-slate-900/5 animate-in fade-in duration-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(null);
                onEdit(role);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
            >
              <Edit2 size={14} /> Edit Role
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(null);
                onDelete(role);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <Trash2 size={14} /> Delete Role
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RolesPermissions({ onNavigate }) {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState(DEFAULT_MODULES);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [permissionByRole, setPermissionByRole] = useState({});
  const [roleSearch, setRoleSearch] = useState("");
  const [roleNameInput, setRoleNameInput] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Navigation mode: "list" | "create" | "edit"
  const [viewMode, setViewMode] = useState("list");
  const [editingRole, setEditingRole] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [openMenuId]);

  // Load initial data (custom roles only and permission catalog) from API
  const loadData = useCallback(async (selectTargetRoleId = null) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [rolesRes, permsRes] = await Promise.all([
        listRolesRequest(),
        listPermissionsCatalogRequest().catch(() => ({ modules: [] })),
      ]);

      const allRoles = rolesRes.roles || [];
      // Strictly filter to only custom roles for this UI
      const customRoles = allRoles.filter(
        (r) => !r.isSystem && r.type !== "SYSTEM"
      );
      setRoles(customRoles);

      if (permsRes.modules && permsRes.modules.length > 0) {
        const mappedModules = permsRes.modules.map((m) => ({
          id: m.id,
          label: m.label,
          icon: MODULE_ICON_MAP[m.id] || LayoutDashboard,
        }));
        setModules(mappedModules);
      }

      let activeId = selectTargetRoleId;
      if (!activeId || !customRoles.some((r) => r.id === activeId)) {
        activeId = customRoles.length > 0 ? customRoles[0].id : null;
      }

      setSelectedRoleId(activeId);
      if (activeId) {
        await loadRolePermissions(activeId, customRoles);
      } else {
        setRoleNameInput("");
      }
    } catch (err) {
      setErrorMessage(
        err.message || "Unable to load roles & permissions from the server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch permissions for a given role from backend
  const loadRolePermissions = async (roleId, currentRoles = roles) => {
    try {
      const targetRole = currentRoles.find((r) => r.id === roleId);
      if (targetRole) {
        setRoleNameInput(targetRole.name);
      }

      const res = await getRolePermissionsRequest(roleId);
      const keys = new Set(res.permissionKeys || []);

      // Build module state map
      const matrix = {};
      modules.forEach((mod) => {
        matrix[mod.id] = {
          view: keys.has(`${mod.id}.view`),
          create: keys.has(`${mod.id}.create`),
          update: keys.has(`${mod.id}.update`),
          delete: keys.has(`${mod.id}.delete`),
        };
      });

      setPermissionByRole((prev) => ({
        ...prev,
        [roleId]: matrix,
      }));
    } catch (err) {
      console.error("Failed to load role permissions:", err);
    }
  };

  // Selected role object
  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;

  const selectedPermissions = useMemo(() => {
    if (!selectedRole || !permissionByRole[selectedRole.id]) {
      return Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: false, create: false, update: false, delete: false },
        ])
      );
    }
    return permissionByRole[selectedRole.id];
  }, [selectedRole, permissionByRole, modules]);

  // Filter custom roles dynamically by search
  const visibleRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) =>
      `${role.name} ${role.description || ""}`.toLowerCase().includes(q)
    );
  }, [roleSearch, roles]);

  const selectRole = async (role) => {
    setSelectedRoleId(role.id);
    setRoleNameInput(role.name);
    setNotice("");
    setErrorMessage("");
    await loadRolePermissions(role.id);
  };

  const handleOpenCreateView = () => {
    setViewMode("create");
    setEditingRole(null);
    setNotice("");
    setErrorMessage("");
  };

  const handleOpenEditView = (role) => {
    setEditingRole(role);
    setViewMode("edit");
    setNotice("");
    setErrorMessage("");
  };

  const handleOpenDeleteModal = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteRole = async (roleId) => {
    setIsDeleting(true);
    try {
      await deleteRoleRequest(roleId);
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      setNotice("Custom role deleted successfully.");
      await loadData();
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete custom role.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveCustomRole = async (roleForm, permissionKeys) => {
    try {
      if (viewMode === "create") {
        const res = await createRoleRequest({
          name: roleForm.name,
          description: roleForm.description,
          iconKey: roleForm.iconKey,
          permissionKeys,
        });

        const createdRole = res.role;
        setNotice(`Role "${createdRole.name}" created successfully.`);
        setViewMode("list");
        setEditingRole(null);
        await loadData(createdRole.id);
      } else if (viewMode === "edit" && editingRole) {
        const res = await updateRoleRequest(editingRole.id, {
          name: roleForm.name,
          description: roleForm.description,
          iconKey: roleForm.iconKey,
          permissionKeys,
        });

        const updatedRole = res.role;
        setNotice(`Role "${updatedRole.name}" updated successfully.`);
        setViewMode("list");
        setEditingRole(null);
        await loadData(updatedRole.id);
      }
    } catch (err) {
      throw err;
    }
  };

  const updatePermission = (moduleId, permissionKey, checked) => {
    if (!selectedRole) return;
    setPermissionByRole((current) => {
      const rolePerms = current[selectedRole.id] || {};
      const modulePerms = rolePerms[moduleId] || {};
      return {
        ...current,
        [selectedRole.id]: {
          ...rolePerms,
          [moduleId]: {
            ...modulePerms,
            [permissionKey]: checked,
          },
        },
      };
    });
    setNotice("");
  };

  const toggleFullAccessModule = (moduleId) => {
    if (!selectedRole) return;
    const currentModule = selectedPermissions[moduleId] || {};
    const isFull =
      Boolean(currentModule.view) &&
      Boolean(currentModule.create) &&
      Boolean(currentModule.update) &&
      Boolean(currentModule.delete);

    const targetValue = !isFull;
    setPermissionByRole((current) => {
      const rolePerms = current[selectedRole.id] || {};
      return {
        ...current,
        [selectedRole.id]: {
          ...rolePerms,
          [moduleId]: {
            view: targetValue,
            create: targetValue,
            update: targetValue,
            delete: targetValue,
          },
        },
      };
    });
    setNotice("");
  };

  const handleSelectAllMain = () => {
    if (!selectedRole) return;
    setPermissionByRole((current) => ({
      ...current,
      [selectedRole.id]: Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: true, create: true, update: true, delete: true },
        ])
      ),
    }));
    setNotice("");
  };

  const handleClearAllMain = () => {
    if (!selectedRole) return;
    setPermissionByRole((current) => ({
      ...current,
      [selectedRole.id]: Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: false, create: false, update: false, delete: false },
        ])
      ),
    }));
    setNotice("");
  };

  const handleReadOnlyMain = () => {
    if (!selectedRole) return;
    setPermissionByRole((current) => ({
      ...current,
      [selectedRole.id]: Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: true, create: false, update: false, delete: false },
        ])
      ),
    }));
    setNotice("");
  };

  const savePermissionsMain = async () => {
    if (!selectedRole) return;

    setIsSaving(true);
    setNotice("");
    setErrorMessage("");

    try {
      const keys = [];
      const currentRoleMatrix = permissionByRole[selectedRole.id] || {};
      modules.forEach((mod) => {
        const m = currentRoleMatrix[mod.id] || {};
        PERMISSION_ACTIONS.forEach((act) => {
          if (m[act]) keys.push(`${mod.id}.${act}`);
        });
      });

      await updateRolePermissionsRequest(selectedRole.id, {
        name: roleNameInput.trim() || selectedRole.name,
        permissionKeys: keys,
      });

      setNotice(`Permissions for "${selectedRole.name}" saved successfully.`);
      await loadData(selectedRole.id);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelChangesMain = () => {
    if (!selectedRole) return;
    loadRolePermissions(selectedRole.id);
    setNotice("");
  };

  // Render Create / Edit View if active
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <CreateEditCustomRole
        mode={viewMode}
        initialRole={viewMode === "edit" ? editingRole : null}
        initialPermissions={
          viewMode === "edit" ? permissionByRole[editingRole?.id] : null
        }
        modules={modules}
        onSave={handleSaveCustomRole}
        onCancel={() => {
          setViewMode("list");
          setEditingRole(null);
        }}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <DeleteRoleModal
        isOpen={deleteModalOpen}
        role={roleToDelete}
        isLoading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setRoleToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteRole}
      />

      {/* Main Header */}
      <header className="mb-5 flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600"
          >
            <button
              type="button"
              onClick={() => onNavigate?.("settings")}
              className="inline-flex items-center gap-1.5 hover:text-blue-700 transition cursor-pointer"
            >
              <Settings2 size={15} /> Settings
            </button>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-500 font-normal">Roles & Permissions</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage custom roles and configure permissions for each Counsellor module.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateView}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer"
        >
          <Plus size={18} /> Create Custom Role
        </button>
      </header>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <section className="grid min-w-0 max-w-full gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* Left Sidebar: Roles List */}
        <aside className="min-w-0 max-w-full rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs flex flex-col">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-600">
              <UsersRound size={22} />
            </span>
            <div>
              <h2 className="font-bold text-slate-950">Roles</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Select a role to view or edit its permissions.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <label className="relative mt-4 block">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search roles..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            />
          </label>

          {/* Roles Container */}
          <div className="mt-4 space-y-2 flex-1">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 size={24} className="mx-auto animate-spin text-blue-600 mb-2" />
                <p className="text-xs">Loading roles...</p>
              </div>
            ) : visibleRoles.length > 0 ? (
              visibleRoles.map((role) => (
                <RoleItem
                  key={role.id}
                  role={role}
                  active={role.id === selectedRole?.id}
                  onSelect={() => selectRole(role)}
                  onEdit={handleOpenEditView}
                  onDelete={handleOpenDeleteModal}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                />
              ))
            ) : roles.length === 0 ? (
              /* Empty state when 0 custom roles exist */
              <div className="my-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-600">
                  <UsersRound size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  No Custom Roles Yet
                </h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">
                  Create a custom role to configure access and permissions.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateView}
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
                >
                  <Plus size={15} /> Create Custom Role
                </button>
              </div>
            ) : (
              /* Search result empty */
              <div className="my-6 text-center text-slate-500 py-6">
                <Search size={20} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-medium">No roles match &quot;{roleSearch}&quot;</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Section: Permissions View for Selected Custom Role */}
        <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 size={28} className="mx-auto animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium">Loading permissions...</p>
            </div>
          ) : selectedRole ? (
            <>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                    <ShieldCheck size={23} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-slate-950">
                        Permissions for {selectedRole.name}
                      </h2>
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-100">
                        Custom
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Configure what this role can access and do across Counsellor modules.
                    </p>
                  </div>
                </div>

                <div className="w-full xl:w-64">
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Info size={13} /> Role Name
                  </span>
                  <input
                    type="text"
                    value={roleNameInput}
                    onChange={(e) => {
                      setRoleNameInput(e.target.value);
                      setNotice("");
                    }}
                    className="h-9 w-full rounded-lg border px-3 text-sm transition outline-none bg-white text-slate-800 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Quick Action bar above table */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleSelectAllMain}
                  className="inline-flex h-7.5 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                >
                  <CheckSquare size={13} /> Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllMain}
                  className="inline-flex h-7.5 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <RotateCcw size={13} /> Clear All
                </button>
                <button
                  type="button"
                  onClick={handleReadOnlyMain}
                  className="inline-flex h-7.5 items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition cursor-pointer"
                >
                  <Eye size={13} /> Read Only
                </button>
              </div>

              {/* Table */}
              <div className="mt-4 w-full max-w-full overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-700">
                    <tr>
                      <th className="sticky left-0 bg-slate-50 z-10 border-b border-slate-200 px-4 py-3 shadow-[1px_0_0_0_#e2e8f0]">
                        Module
                      </th>
                      <th className="w-24 sm:w-28 border-b border-l border-slate-200 px-3 py-3 text-center">
                        Full Access
                      </th>
                      {PERMISSION_ACTIONS.map((permissionKey) => (
                        <th
                          key={permissionKey}
                          className="w-20 sm:w-28 border-b border-l border-slate-200 px-3 sm:px-4 py-3 text-center capitalize"
                        >
                          {permissionKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(({ id, label, icon: Icon }) => {
                      const modulePerms = selectedPermissions[id] || {};
                      const isView = Boolean(modulePerms.view);
                      const isCreate = Boolean(modulePerms.create);
                      const isUpdate = Boolean(modulePerms.update);
                      const isDelete = Boolean(modulePerms.delete);
                      const isFull = isView && isCreate && isUpdate && isDelete;

                      return (
                        <tr
                          key={id}
                          className="border-b border-slate-100 last:border-b-0 even:bg-slate-50/50 hover:bg-blue-50/20 transition"
                        >
                          <td className="sticky left-0 bg-white even:bg-slate-50/50 z-10 px-4 py-3 shadow-[1px_0_0_0_#e2e8f0]">
                            <span className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-slate-800">
                              <Icon size={18} className="text-slate-600 shrink-0" />
                              <span className="whitespace-nowrap">{label}</span>
                            </span>
                          </td>
                          <td className="border-l border-slate-100 px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isFull}
                              onChange={() => toggleFullAccessModule(id)}
                              aria-label={`Full access for ${label}`}
                              className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                            />
                          </td>
                          {PERMISSION_ACTIONS.map((permissionKey) => {
                            const isChecked = Boolean(modulePerms[permissionKey]);
                            return (
                              <td
                                key={permissionKey}
                                className="border-l border-slate-100 px-3 sm:px-4 py-3 text-center"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) =>
                                    updatePermission(
                                      id,
                                      permissionKey,
                                      e.target.checked
                                    )
                                  }
                                  aria-label={`${permissionKey} ${label}`}
                                  className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <footer className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
                {notice && (
                  <p
                    role="status"
                    className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600"
                  >
                    <CheckCircle2 size={16} /> {notice}
                  </p>
                )}

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={cancelChangesMain}
                  className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={savePermissionsMain}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Permissions
                    </>
                  )}
                </button>
              </footer>
            </>
          ) : (
            /* Empty state when 0 custom roles exist */
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center p-6">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-950">
                Select a Custom Role to View Its Permissions
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 max-w-sm leading-relaxed">
                Create a custom role to configure access and permissions for your team across Counsellor modules.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateView}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 cursor-pointer"
              >
                <Plus size={16} /> Create Custom Role
              </button>
            </div>
          )}
        </section>
      </section>
    </>
  );
}
