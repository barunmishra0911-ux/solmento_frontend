import React from "react";
import { Loader2, Trash2, X } from "lucide-react";

export default function DeleteRoleModal({
  isOpen,
  role,
  isLoading = false,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all">
        {/* close button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600 shadow-inner">
            <Trash2 size={26} />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-slate-950">
            Delete Custom Role?
          </h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete this custom role? This action cannot be undone.
          </p>

          {/* Role details box */}
          <div className="mt-4 w-full rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-semibold text-sm">
                {role.name?.charAt(0) || "R"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="truncate text-sm font-bold text-slate-900">
                    {role.name}
                  </h4>
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                    Custom
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500 mt-0.5">
                  {role.description || "Custom role permissions"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex w-full items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onConfirm(role.id)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} /> Delete Role
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
