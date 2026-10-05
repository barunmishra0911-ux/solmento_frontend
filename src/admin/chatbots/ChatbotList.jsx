import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ChatbotCard from "./ChatbotCard";
import { useChatbots } from "./useChatbots";
import { showToast } from "../../lib/toast";

const perPage = 6;
const numberFormat = new Intl.NumberFormat("en-IN");
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const createButtonClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100";

function SelectControl({ label, value, onChange, children }) {
  return (
    <label className="relative block min-w-[145px] flex-1 sm:flex-none sm:w-40">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </label>
  );
}

function DeleteModal({ chatbot, isSaving, onCancel, onConfirm }) {
  if (!chatbot) return null;
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-chatbot-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
          <Trash2 size={21} />
        </span>
        <h2
          id="delete-chatbot-title"
          className="mt-4 text-lg font-bold text-slate-950"
        >
          Delete chatbot?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          This permanently deletes{" "}
          <strong className="text-slate-700">{chatbot.name}</strong> and its
          configuration from this workspace.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {isSaving && <LoaderCircle size={15} className="animate-spin" />}{" "}
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}

function ChatbotTable({
  chatbots,
  isSaving,
  onStatusChange,
  onDuplicate,
  onDelete,
  onViewConversations,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[880px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Chatbot</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Channels</th>
            <th className="px-4 py-3 font-semibold">Conversations</th>
            <th className="px-4 py-3 font-semibold">Last edited</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {chatbots.map((chatbot) => {
            const active = chatbot.status === "active";
            return (
              <tr key={chatbot.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <strong className="block text-slate-900">
                    {chatbot.name}
                  </strong>
                  <span className="mt-0.5 block max-w-sm truncate text-xs text-slate-500">
                    {chatbot.description}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    disabled={isSaving}
                    onClick={() =>
                      onStatusChange(chatbot, active ? "inactive" : "active")
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold disabled:opacity-50 ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    {active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {chatbot.channels
                    .map((channel) =>
                      channel === "website" ? "Website" : "WhatsApp",
                    )
                    .join(", ")}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onViewConversations?.(chatbot)}
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    title={`View ${numberFormat.format(chatbot.conversationsThisMonth)} conversations for ${chatbot.name}`}
                  >
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100 transition">
                      {numberFormat.format(chatbot.conversationsThisMonth)}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {dateFormat.format(new Date(chatbot.lastEditedAt))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => onDuplicate(chatbot)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => onDelete(chatbot)}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ChatbotList({ service }) {
  const {
    chatbots,
    isLoading,
    isSaving,
    error,
    errorStatus,
    retry,
    setStatus,
    duplicate,
    remove,
  } = useChatbots(service);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatusFilter] = useState("all");
  const [channel, setChannelFilter] = useState("all");
  const [sort, setSort] = useState("lastEdited");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState("");

  const matchingChatbots = useMemo(() => {
    const next = chatbots.filter(
      (chatbot) =>
        (status === "all" || chatbot.status === status) &&
        (channel === "all" || chatbot.channels.includes(channel)) &&
        chatbot.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    return next.sort((a, b) => {
      if (sort === "nameAsc") return a.name.localeCompare(b.name);
      if (sort === "nameDesc") return b.name.localeCompare(a.name);
      if (sort === "conversations")
        return b.conversationsThisMonth - a.conversationsThisMonth;
      return new Date(b.lastEditedAt) - new Date(a.lastEditedAt);
    });
  }, [channel, chatbots, query, sort, status]);

  const totalPages = Math.max(1, Math.ceil(matchingChatbots.length / perPage));
  const safePage = Math.min(page, totalPages);
  const visibleChatbots = matchingChatbots.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );
  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
    setOpenMenuId(null);
  };
  const updateStatus = async (chatbot, nextStatus) => {
    const result = await setStatus(chatbot.id, nextStatus);
    if (result) {
      setNotice(`${result.name} is now ${result.status}.`);
      showToast.success(`${result.name} is now ${result.status}.`);
    } else {
      showToast.error("Failed to update chatbot status.");
    }
  };
  const duplicateChatbot = async (chatbot) => {
    const result = await duplicate(chatbot.id);
    if (result) {
      setPage(1);
      setNotice(`${result.name} was created.`);
      showToast.success(`Chatbot "${result.name}" created successfully.`);
    } else {
      showToast.error("Failed to duplicate chatbot.");
    }
  };
  const deleteChatbot = async () => {
    const targetName = deleteTarget?.name || "Chatbot";
    const result = await remove(deleteTarget.id);
    if (result) {
      setDeleteTarget(null);
      setNotice(`${result.name} was deleted.`);
      showToast.success(`Chatbot "${targetName}" deleted successfully.`);
    } else {
      showToast.error("Failed to delete chatbot.");
    }
  };
  const rangeStart = matchingChatbots.length ? (safePage - 1) * perPage + 1 : 0;
  const rangeEnd = Math.min(safePage * perPage, matchingChatbots.length);

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-slate-400">
            CHATBOTS
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Chatbot List
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all your AI chatbots. Create, edit, duplicate or delete
            chatbots for your business.
          </p>
        </div>
        <Link to="/app/chatbots/create" className={createButtonClass}>
          <Plus size={18} /> Create Chatbot
        </Link>
      </header>
      <section
        aria-label="Chatbot controls"
        className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search chatbots by name</span>
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setFilter(setQuery)(event.target.value)}
            placeholder="Search chatbots by name..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <SelectControl
          label="Status"
          value={status}
          onChange={setFilter(setStatusFilter)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectControl>
        <SelectControl
          label="Channel"
          value={channel}
          onChange={setFilter(setChannelFilter)}
        >
          <option value="all">All Channels</option>
          <option value="website">Website</option>
          <option value="whatsapp">WhatsApp</option>
        </SelectControl>
        <SelectControl
          label="Sort chatbots"
          value={sort}
          onChange={setFilter(setSort)}
        >
          <option value="lastEdited">Last Edited</option>
          <option value="nameAsc">Name A–Z</option>
          <option value="nameDesc">Name Z–A</option>
          <option value="conversations">Most Conversations</option>
        </SelectControl>
        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
            className={`grid h-11 w-11 place-items-center ${view === "grid" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <Grid2X2 size={18} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
            className={`grid h-11 w-11 place-items-center ${view === "list" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <List size={18} />
          </button>
        </div>
      </section>
      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"
        >
          <AlertCircle size={17} />
          <p className="flex-1">
            {errorStatus === 403
              ? "You do not have permission to manage chatbots in this workspace."
              : error}
          </p>
          <button
            type="button"
            onClick={retry}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold hover:bg-rose-100"
          >
            <RotateCcw size={15} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div
          role="status"
          className="flex min-h-64 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500"
        >
          <LoaderCircle size={20} className="animate-spin text-blue-600" />{" "}
          Loading chatbots...
        </div>
      ) : matchingChatbots.length ? (
        <>
          {view === "grid" ? (
            <section
              aria-label="Chatbot list"
              aria-busy={isSaving}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
            >
              {visibleChatbots.map((chatbot, index) => (
                <ChatbotCard
                  key={chatbot.id}
                  chatbot={chatbot}
                  index={index}
                  disabled={isSaving}
                  menuOpen={openMenuId === chatbot.id}
                  onMenuChange={(open) =>
                    setOpenMenuId(open ? chatbot.id : null)
                  }
                  onStatusChange={(nextStatus) =>
                    updateStatus(chatbot, nextStatus)
                  }
                  onDuplicate={() => duplicateChatbot(chatbot)}
                  onDelete={() => setDeleteTarget(chatbot)}
                  onViewConversations={(cb) =>
                    navigate(`/app/chatbots/${cb.id}/conversations`)
                  }
                />
              ))}
            </section>
          ) : (
            <ChatbotTable
              chatbots={visibleChatbots}
              isSaving={isSaving}
              onStatusChange={updateStatus}
              onDuplicate={duplicateChatbot}
              onDelete={setDeleteTarget}
              onViewConversations={(cb) =>
                navigate(`/app/chatbots/${cb.id}/conversations`)
              }
            />
          )}
        </>
      ) : (
        !error && (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Bot size={28} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              {chatbots.length
                ? "No matching chatbots"
                : "Create your first chatbot"}
            </h2>
            <p className="mb-5 mt-1 max-w-sm text-sm text-slate-500">
              {chatbots.length
                ? "Try another name or clear the current filters."
                : "Start conversations with students on your website or WhatsApp."}
            </p>
            {chatbots.length ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setChannelFilter("all");
                  setPage(1);
                }}
                className="rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                Clear filters
              </button>
            ) : (
              <Link to="/app/chatbots/create" className={createButtonClass}>
                <Plus size={17} /> Create Chatbot
              </Link>
            )}
          </section>
        )
      )}
      {!isLoading && matchingChatbots.length > 0 && (
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            Showing {rangeStart}–{rangeEnd} of {matchingChatbots.length}{" "}
            chatbots
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="grid h-10 min-w-10 place-items-center rounded-lg bg-blue-600 px-2 font-semibold text-white">
              {safePage}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}
      <DeleteModal
        chatbot={deleteTarget}
        isSaving={isSaving}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteChatbot}
      />
    </>
  );
}
