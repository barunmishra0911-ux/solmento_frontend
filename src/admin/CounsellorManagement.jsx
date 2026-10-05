import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DataTable from "react-data-table-component";
import { LoaderCircle, MoreVertical, Pencil, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { deleteCounsellorRequest, listCounsellorsRequest } from "@/lib/authApi";
import { showToast } from "@/lib/toast";
import CreateCounsellor from "./CreateCounsellor";

const tableStyles = {
  headCells: { style: { backgroundColor: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: 700, paddingLeft: "20px", paddingRight: "20px" } },
  cells: { style: { paddingLeft: "20px", paddingRight: "20px", color: "#334155", fontSize: "13px" } },
  rows: { style: { minHeight: "64px", borderBottomColor: "#e2e8f0" }, highlightOnHoverStyle: { backgroundColor: "#f8fbff", outline: "none" } },
  pagination: { style: { borderTopColor: "#e2e8f0", fontSize: "12px", color: "#64748b" } },
};

function ProfileCell({ row }) {
  const initials = row.fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return row.profilePhoto ? (
    <img src={row.profilePhoto} alt="" className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials || "C"}</span>
  );
}

function ActionsCell({ row, onEdit, onDelete }) {
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const close = () => {
    setPosition(null);
  };

  const handleToggle = () => {
    if (position) {
      close();
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 128; // w-32
      const menuHeight = 88;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < menuHeight + 10;
      setPosition({
        left: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)),
        top: openUp ? Math.max(8, rect.top - menuHeight - 4) : rect.bottom + 4,
      });
    }
  };

  useEffect(() => {
    if (!position) return undefined;
    const dismiss = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        close();
      }
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    };
    const reposition = () => {
      close();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [position]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${row.fullName}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(position)}
        onClick={handleToggle}
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        <MoreVertical size={19} />
      </button>
      {position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            className="z-[9999] w-32 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onEdit(row);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Pencil size={15} /> Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onDelete(row);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}

export default function CounsellorManagement({ onNavigate }) {
  const [counsellors, setCounsellors] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCounsellor, setEditingCounsellor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    listCounsellorsRequest()
      .then(({ counsellors: savedCounsellors = [] }) => {
        if (active) {
          setCounsellors(savedCounsellors);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load counsellors.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredCounsellors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return counsellors;
    return counsellors.filter((item) =>
      [item.fullName, item.employeeId, item.email, item.phone, item.department, item.designation]
        .some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [counsellors, search]);

  const deleteCounsellor = async () => {
    if (!deleteTarget || isDeleting) return;
    const targetName = deleteTarget.fullName || "Counsellor";
    setIsDeleting(true);
    setError("");
    try {
      await deleteCounsellorRequest(deleteTarget.id);
      setCounsellors((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast.success(`Counsellor "${targetName}" deleted successfully.`);
    } catch (requestError) {
      const errMsg = requestError.message || "Unable to delete counsellor.";
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (editingCounsellor) {
    return (
      <CreateCounsellor
        counsellor={editingCounsellor}
        onNavigate={(screen) => {
          setEditingCounsellor(null);
          onNavigate(screen);
        }}
      />
    );
  }

  const columns = [
    { name: "Profile Photo", cell: (row) => <ProfileCell row={row} />, width: "120px" },
    { name: "Full Name", selector: (row) => row.fullName, sortable: true, cell: (row) => <span className="font-semibold text-slate-800">{row.fullName}</span>, minWidth: "170px" },
    { name: "Employee ID", selector: (row) => row.employeeId, sortable: true },
    { name: "Email Address", selector: (row) => row.email, sortable: true, minWidth: "210px" },
    { name: "Phone Number", selector: (row) => row.phone, minWidth: "145px" },
    { name: "Department", selector: (row) => row.department, sortable: true },
    { name: "Designation", selector: (row) => row.designation, sortable: true, cell: (row) => <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{row.designation}</span>, minWidth: "155px" },
    { name: "Actions", cell: (row) => <ActionsCell row={row} onEdit={setEditingCounsellor} onDelete={setDeleteTarget} />, ignoreRowClick: true, button: true, width: "100px" },
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Counsellor</h1>
          <p className="mt-1 text-sm text-slate-500">Manage counsellors, departments and team designations.</p>
        </div>
        <button type="button" onClick={() => onNavigate("createCounsellor")} className="inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          <Plus size={17} /> Create Counsellor
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-900">Counsellor List</h2>
          </div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400 sm:max-w-xs">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search counsellors..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-slate-400 hover:text-slate-700"><X size={15} /></button>}
          </label>
        </div>

        {error && <p role="alert" className="m-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {!isLoading && !error && filteredCounsellors.length === 0 && (
          <div className="px-5 py-14 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-800">No counsellors found</h3>
            <p className="mt-1 text-xs text-slate-500">Create a counsellor to see them in this list.</p>
          </div>
        )}
        {(isLoading || filteredCounsellors.length > 0) && (
          <DataTable columns={columns} data={filteredCounsellors} progressPending={isLoading} progressComponent={<p className="p-8 text-sm text-slate-500">Loading counsellors...</p>} pagination highlightOnHover responsive customStyles={tableStyles} paginationPerPage={10} />
        )}
      </section>
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-counsellor-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={21} /></span>
            <h2 id="delete-counsellor-title" className="mt-4 text-lg font-bold text-slate-950">Delete counsellor?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete <strong className="text-slate-700">{deleteTarget.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={isDeleting} onClick={() => setDeleteTarget(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
              <button type="button" disabled={isDeleting} onClick={deleteCounsellor} className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                {isDeleting && <LoaderCircle size={15} className="animate-spin" />} Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
