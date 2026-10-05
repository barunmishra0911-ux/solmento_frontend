import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, Plus, Search, Trash2 } from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { createSuperAdminRecordRequest, deleteSuperAdminRecordRequest, listAuditLogsRequest, listSuperAdminRecordsRequest } from "@/lib/authApi";

const MODULES = {
  invoices: ["Invoice List", "Review invoices stored by the platform."],
  "ai-provider-settings": ["AI Provider Settings", "Manage provider configuration. Secrets are never returned by the API."],
  "whatsapp-provider-settings": ["WhatsApp Provider Settings", "Manage WhatsApp provider configuration."],
  "voice-provider-settings": ["Voice Provider Settings", "Manage voice provider configuration."],
  "platform-users": ["System Users", "Manage platform users and invitations."],
  "platform-roles": ["Platform Roles", "Manage platform-level roles."],
  "platform-permissions": ["Platform Permissions", "Review platform permission assignments."],
  announcements: ["Platform Announcements", "Create and manage platform announcements."],
  "global-analytics": ["Global Analytics", "Review collected platform analytics."],
  "system-health": ["System Health Monitor", "Observed provider and processing health."],
  tickets: ["Support Tickets", "Review support tickets."],
  "ticket-details": ["Ticket Details", "Review support ticket records and updates."],
  "audit-logs": ["Platform Audit Logs", "Review auditable platform actions."],
  impersonation: ["Tenant Impersonation", "Track explicitly authorized support sessions."],
};

export default function SuperAdminModulePage({ module: moduleProp }) {
  const { module: routeModule = "system-health" } = useParams();
  const module = moduleProp || routeModule;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const meta = MODULES[module] || ["Platform Module", "Manage platform records."];

  const load = () => {
    setLoading(true);
    const request = module === "audit-logs" ? listAuditLogsRequest() : listSuperAdminRecordsRequest(module, search ? { search } : {});
    request
      .then((payload) => {
        const next = module === "audit-logs"
          ? (payload.logs || []).map((log) => ({ id: log.id, title: `${log.action} · ${log.targetType}`, status: "RECORDED", updatedAt: log.createdAt, payload: log.metadata }))
          : payload.records;
        setRecords(next || []); setError("");
      })
      .catch((requestError) => setError(requestError.message || "Unable to load module data."))
      .finally(() => setLoading(false));
  };
  useEffect(load, [module]);

  const exportRecords = () => {
    const csv = ["Title,Status,Updated", ...records.map((record) => `"${record.title.replaceAll('"', '""')}",${record.status},${record.updatedAt}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a"); link.href = url; link.download = `${module}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const create = async (event) => {
    event.preventDefault(); if (saving) return; setSaving(true); setError("");
    try { await createSuperAdminRecordRequest(module, { title, status, payload: { details } }); setTitle(""); setDetails(""); setShowCreate(false); load(); }
    catch (requestError) { setError(requestError.message || "Unable to save record."); }
    finally { setSaving(false); }
  };
  const remove = async (id) => { if (module === "audit-logs" || !window.confirm("Delete this record?")) return; try { await deleteSuperAdminRecordRequest(module, id); setRecords((current) => current.filter((record) => record.id !== id)); } catch (requestError) { setError(requestError.message || "Unable to delete record."); } };

  return <div className="flex h-screen flex-col overflow-hidden bg-slate-50"><SuperAdminHeader isSidebarOpen={sidebarOpen} isMobileSidebarOpen={mobileSidebarOpen} onSidebarToggle={() => setSidebarOpen((value) => !value)} onMobileSidebarToggle={() => setMobileSidebarOpen((value) => !value)} /><div className="flex min-h-0 flex-1 overflow-hidden"><LeftSidebar isDesktopOpen={sidebarOpen} isMobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} /><main className="min-h-0 min-w-0 flex-1 overflow-y-auto"><div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-7"><button type="button" onClick={() => navigate("/super-admin/dashboard")} className="text-xs font-semibold text-blue-600 hover:underline">← Platform overview</button><div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{meta[0]}</h1><p className="mt-1 text-sm text-slate-500">{meta[1]}</p></div><div className="flex gap-2"><button type="button" onClick={exportRecords} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"><Download className="h-4 w-4" />Export</button>{module !== "audit-logs" && <button type="button" onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add record</button>}</div></div><div className="mt-5 flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && load()} placeholder="Search records" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-300" /></div></div>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{showCreate && <form onSubmit={create} className="mt-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="grid gap-3 sm:grid-cols-3"><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Record title" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>ACTIVE</option><option>INACTIVE</option><option>DRAFT</option></select><input value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Details (optional)" className="h-10 rounded-lg border border-slate-200 px-3 text-sm" /></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-3 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white">{saving ? "Saving…" : "Save"}</button></div></form>}<section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{loading ? <div className="p-8 text-sm text-slate-500">Loading records…</div> : records.length ? <div className="divide-y divide-slate-100">{records.map((record) => <div key={record.id} className="flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-semibold text-slate-800">{record.title}</p><p className="mt-1 text-xs text-slate-500">{record.status} · Updated {new Date(record.updatedAt).toLocaleString()}</p></div>{module !== "audit-logs" && <button type="button" onClick={() => remove(record.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" aria-label={`Delete ${record.title}`}><Trash2 className="h-4 w-4" /></button>}</div>)}</div> : <div className="p-10 text-center"><p className="text-sm font-semibold text-slate-800">No configured records</p><p className="mt-1 text-xs text-slate-500">This module has no saved data yet. Add a record or configure the external integration.</p></div>}</section></div></main></div></div>;
}
