import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronRight,
  Clock,
  Crown,
  Eye,
  Headphones,
  LayoutDashboard,
  Loader2,
  MessagesSquare,
  PhoneCall,
  RotateCcw,
  Settings2,
  ShieldCheck,
  UserCheck,
  Users,
  UsersRound,
} from "lucide-react";

const ICON_OPTIONS = [
  { key: "users", label: "User", icon: UsersRound },
  { key: "crown", label: "Crown", icon: Crown },
  { key: "team", label: "Team", icon: Users },
  { key: "support", label: "Support", icon: Headphones },
  { key: "chat", label: "Chat", icon: MessagesSquare },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "shield", label: "Security", icon: ShieldCheck },
  { key: "settings", label: "Settings", icon: Settings2 },
];

const DEFAULT_MODULES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: MessagesSquare },
  { id: "myLeads", label: "My Leads", icon: UsersRound },
  { id: "followUps", label: "Follow-ups", icon: CalendarDays },
  { id: "calls", label: "Calls", icon: PhoneCall },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "availability", label: "Availability", icon: Clock },
];

const PERM_ACTIONS = ["view", "create", "update", "delete"];

export default function CreateEditCustomRole({
  mode = "create",
  initialRole = null,
  initialPermissions = null,
  modules = DEFAULT_MODULES,
  onSave,
  onCancel,
  onNavigate,
}) {
  const isEdit = mode === "edit";

  const [roleName, setRoleName] = useState(() => initialRole?.name || "");
  const [description, setDescription] = useState(
    () => initialRole?.description || ""
  );
  const [selectedIconKey, setSelectedIconKey] = useState(
    () => initialRole?.iconKey || "users"
  );
  const [validationError, setValidationError] = useState("");

  const [permissions, setPermissions] = useState(() => {
    if (initialPermissions) return JSON.parse(JSON.stringify(initialPermissions));
    return Object.fromEntries(
      modules.map(({ id }) => [
        id,
        { view: false, create: false, update: false, delete: false },
      ])
    );
  });

  // Calculate permission statistics
  const stats = useMemo(() => {
    let viewCount = 0;
    let createCount = 0;
    let updateCount = 0;
    let deleteCount = 0;
    let totalEnabled = 0;
    const activeModuleIds = new Set();

    modules.forEach(({ id }) => {
      const modulePerms = permissions[id] || {};
      const isView = Boolean(modulePerms.view || modulePerms.read);
      const isCreate = Boolean(modulePerms.create);
      const isUpdate = Boolean(modulePerms.update);
      const isDelete = Boolean(modulePerms.delete);

      if (isView) viewCount++;
      if (isCreate) createCount++;
      if (isUpdate) updateCount++;
      if (isDelete) deleteCount++;

      if (isView || isCreate || isUpdate || isDelete) {
        activeModuleIds.add(id);
      }

      if (isView) totalEnabled++;
      if (isCreate) totalEnabled++;
      if (isUpdate) totalEnabled++;
      if (isDelete) totalEnabled++;
    });

    const activeModules = modules.filter(({ id }) => activeModuleIds.has(id));

    return {
      viewCount,
      createCount,
      updateCount,
      deleteCount,
      totalEnabled,
      enabledModulesCount: activeModuleIds.size,
      activeModules,
    };
  }, [permissions, modules]);

  const handleTogglePermission = (moduleId, action) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || {
        view: false,
        create: false,
        update: false,
        delete: false,
      };
      const newValue = !Boolean(current[action] || (action === "view" && current.read));
      return {
        ...prev,
        [moduleId]: {
          ...current,
          [action]: newValue,
          ...(action === "view" ? { read: newValue } : {}),
        },
      };
    });
  };

  const handleToggleFullAccess = (moduleId) => {
    setPermissions((prev) => {
      const current = prev[moduleId] || {};
      const isFull =
        Boolean(current.view || current.read) &&
        Boolean(current.create) &&
        Boolean(current.update) &&
        Boolean(current.delete);

      const targetValue = !isFull;
      return {
        ...prev,
        [moduleId]: {
          view: targetValue,
          read: targetValue,
          create: targetValue,
          update: targetValue,
          delete: targetValue,
        },
      };
    });
  };

  const isFullAccessModule = (moduleId) => {
    const current = permissions[moduleId] || {};
    return (
      Boolean(current.view || current.read) &&
      Boolean(current.create) &&
      Boolean(current.update) &&
      Boolean(current.delete)
    );
  };

  const handleSelectAll = () => {
    setPermissions(
      Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: true, read: true, create: true, update: true, delete: true },
        ])
      )
    );
  };

  const handleClearAll = () => {
    setPermissions(
      Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: false, read: false, create: false, update: false, delete: false },
        ])
      )
    );
  };

  const handleReadOnly = () => {
    setPermissions(
      Object.fromEntries(
        modules.map(({ id }) => [
          id,
          { view: true, read: true, create: false, update: false, delete: false },
        ])
      )
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!roleName.trim()) {
      setValidationError("Role name is required.");
      return;
    }

    const permissionKeys = [];
    modules.forEach((mod) => {
      const m = permissions[mod.id] || {};
      PERM_ACTIONS.forEach((act) => {
        if (m[act]) {
          permissionKeys.push(`${mod.id}.${act}`);
        }
      });
    });

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSave(
        {
          name: roleName.trim(),
          description: description.trim(),
          iconKey: selectedIconKey,
        },
        permissionKeys
      );
    } catch (err) {
      setSubmitError(err.message || "Failed to save custom role.");
      setIsSubmitting(false);
    }
  };

  const allPermissionsSelected = useMemo(() => {
    return modules.every(({ id }) => isFullAccessModule(id));
  }, [permissions, modules]);

  const handleHeaderCheckboxToggle = () => {
    if (allPermissionsSelected) {
      handleClearAll();
    } else {
      handleSelectAll();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <header className="flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
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
            <button
              type="button"
              onClick={onCancel}
              className="hover:text-blue-700 transition cursor-pointer"
            >
              Roles & Permissions
            </button>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-500 font-normal">
              {isEdit ? "Edit Custom Role" : "Create Custom Role"}
            </span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {isEdit ? "Edit Custom Role" : "Create Custom Role"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Modify custom role information and permission configurations."
              : "Create a custom role and configure exactly what users assigned to this role can access."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer shadow-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Role"
            )}
          </button>
        </div>
      </header>

      {submitError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Role Details Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
            <UsersRound size={20} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-950">Role Details</h2>
            <p className="text-xs text-slate-500">
              Basic information about this role.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Role Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="role-name"
                className="text-xs font-semibold text-slate-700"
              >
                Role Name <span className="text-rose-500">*</span>
              </label>
            </div>
            <input
              id="role-name"
              type="text"
              value={roleName}
              maxLength={50}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (validationError) setValidationError("");
              }}
              placeholder="e.g. Admission Manager"
              className={`h-10 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                validationError
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>Choose a clear name that describes the responsibilities of this role.</span>
              <span>{roleName.length}/50</span>
            </div>
            {validationError && (
              <p className="mt-1 text-xs font-medium text-rose-500">
                {validationError}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="role-description"
                className="text-xs font-semibold text-slate-700"
              >
                Description
              </label>
            </div>
            <textarea
              id="role-description"
              rows={2}
              value={description}
              maxLength={200}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role is responsible for..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
            />
            <div className="mt-1 flex justify-end text-[11px] text-slate-500">
              <span>{description.length}/200</span>
            </div>
          </div>
        </div>

        {/* Role Icon Selector */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-3">
            Role Icon
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {ICON_OPTIONS.map(({ key, label, icon: Icon }) => {
              const isSelected = selectedIconKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedIconKey(key)}
                  title={label}
                  className={`group relative grid h-11 w-11 place-items-center rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-100 shadow-xs"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Permissions Matrix & Summaries Grid */}
      <div className="grid min-w-0 max-w-full gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        {/* Left: Permission Matrix Card */}
        <section className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-950">Permissions</h2>
                <p className="text-xs text-slate-500">
                  Select what this role can access and what actions they can perform.
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 cursor-pointer"
              >
                <CheckSquare size={13} /> Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw size={13} /> Clear All
              </button>
              <button
                type="button"
                onClick={handleReadOnly}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 cursor-pointer"
              >
                <Eye size={13} /> Read Only
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-700">
                <tr>
                  <th className="w-10 border-b border-slate-200 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allPermissionsSelected}
                      onChange={handleHeaderCheckboxToggle}
                      aria-label="Select all permissions across all modules"
                      className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                    />
                  </th>
                  <th className="sticky left-0 bg-slate-50 z-10 border-b border-slate-200 px-4 py-3 shadow-[1px_0_0_0_#e2e8f0]">Module</th>
                  <th className="w-28 border-b border-l border-slate-200 px-3 py-3 text-center">
                    Full Access
                  </th>
                  <th className="w-24 border-b border-l border-slate-200 px-3 py-3 text-center">
                    View
                  </th>
                  <th className="w-24 border-b border-l border-slate-200 px-3 py-3 text-center">
                    Create
                  </th>
                  <th className="w-24 border-b border-l border-slate-200 px-3 py-3 text-center">
                    Update
                  </th>
                  <th className="w-24 border-b border-l border-slate-200 px-3 py-3 text-center">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.map(({ id, label, icon: Icon }) => {
                  const modulePerms = permissions[id] || {};
                  const isFull = isFullAccessModule(id);
                  const isView = Boolean(modulePerms.view || modulePerms.read);
                  const isCreate = Boolean(modulePerms.create);
                  const isUpdate = Boolean(modulePerms.update);
                  const isDelete = Boolean(modulePerms.delete);

                  return (
                    <tr
                      key={id}
                      className="border-b border-slate-100 last:border-b-0 even:bg-slate-50/50 hover:bg-blue-50/20 transition"
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isFull}
                          onChange={() => handleToggleFullAccess(id)}
                          aria-label={`Full access for ${label}`}
                          className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="sticky left-0 bg-white even:bg-slate-50/50 z-10 px-4 py-3 shadow-[1px_0_0_0_#e2e8f0]">
                        <span className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                          <Icon size={18} className="text-slate-500 shrink-0" />
                          <span className="whitespace-nowrap">{label}</span>
                        </span>
                      </td>
                      <td className="border-l border-slate-100 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isFull}
                          onChange={() => handleToggleFullAccess(id)}
                          aria-label={`Full access for ${label}`}
                          className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="border-l border-slate-100 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isView}
                          onChange={() => handleTogglePermission(id, "view")}
                          aria-label={`View permission for ${label}`}
                          className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="border-l border-slate-100 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isCreate}
                          onChange={() => handleTogglePermission(id, "create")}
                          aria-label={`Create permission for ${label}`}
                          className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="border-l border-slate-100 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isUpdate}
                          onChange={() => handleTogglePermission(id, "update")}
                          aria-label={`Update permission for ${label}`}
                          className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                      <td className="border-l border-slate-100 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isDelete}
                          onChange={() => handleTogglePermission(id, "delete")}
                          aria-label={`Delete permission for ${label}`}
                          className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Column: Summaries */}
        <aside className="space-y-6">
          {/* Permission Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-600">
                <BarChart3 size={18} />
              </span>
              <div>
                <h3 className="font-bold text-slate-950 text-sm">
                  Permission Summary
                </h3>
                <p className="text-xs text-blue-600 font-semibold">
                  {stats.totalEnabled} Permissions Enabled
                  <span className="text-slate-400 font-normal"> Across {stats.enabledModulesCount} modules</span>
                </p>
              </div>
            </div>

            {/* Stat pills grid */}
            <div className="grid grid-cols-4 gap-2 text-center my-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2">
                <span className="block text-[10px] font-semibold text-blue-600 uppercase">
                  View
                </span>
                <span className="text-base font-bold text-blue-700">
                  {stats.viewCount}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-2">
                <span className="block text-[10px] font-semibold text-emerald-600 uppercase">
                  Create
                </span>
                <span className="text-base font-bold text-emerald-700">
                  {stats.createCount}
                </span>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-2">
                <span className="block text-[10px] font-semibold text-amber-600 uppercase">
                  Update
                </span>
                <span className="text-base font-bold text-amber-700">
                  {stats.updateCount}
                </span>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-2">
                <span className="block text-[10px] font-semibold text-rose-600 uppercase">
                  Delete
                </span>
                <span className="text-base font-bold text-rose-700">
                  {stats.deleteCount}
                </span>
              </div>
            </div>

            {/* Modules with Access */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-semibold text-slate-700 mb-2.5">
                Modules with Access
              </h4>
              {stats.activeModules.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {stats.activeModules.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600"
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No modules enabled yet.</p>
              )}
            </div>
          </div>

          {/* Role Access Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <UserCheck size={18} />
              </span>
              <div>
                <h3 className="font-bold text-slate-950 text-sm">
                  Role Access Summary
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Role Name</span>
                <span className="font-semibold text-slate-900 text-right max-w-[180px] truncate">
                  {roleName.trim() || "Untitled Role"}
                </span>
              </div>

              <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Description</span>
                <span className="font-normal text-slate-600 text-right max-w-[180px] line-clamp-2">
                  {description.trim() || "No description provided."}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Access Level</span>
                <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-100">
                  Custom
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-500 font-medium">Modules Selected</span>
                <span className="font-semibold text-slate-900">
                  {stats.enabledModulesCount} of {modules.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Permissions Enabled</span>
                <span className="font-semibold text-slate-900">
                  {stats.totalEnabled} of {modules.length * PERM_ACTIONS.length}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
