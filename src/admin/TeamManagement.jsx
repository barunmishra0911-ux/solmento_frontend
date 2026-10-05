import { useEffect, useMemo, useState } from "react";
import { listTeamMembersRequest } from "@/lib/authApi";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit3,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";

const initialMembers = [
  {
    id: 1,
    initials: "PS",
    name: "Priya Sharma",
    email: "priya.sharma@brightmind.com",
    role: "Admin",
    status: "Active",
    lastActive: "10 minutes ago",
    leads: 42,
    tone: "bg-fuchsia-100 text-fuchsia-600",
  },
  {
    id: 2,
    initials: "AR",
    name: "Aman Raj",
    email: "aman.raj@brightmind.com",
    role: "Head Consultant",
    status: "Active",
    lastActive: "28 minutes ago",
    leads: 38,
    tone: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    initials: "NK",
    name: "Neha Kapoor",
    email: "neha.kapoor@brightmind.com",
    role: "Consultant",
    status: "Active",
    lastActive: "1 hour ago",
    leads: 26,
    tone: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    initials: "RS",
    name: "Rohan Singh",
    email: "rohan.singh@brightmind.com",
    role: "Consultant",
    status: "Active",
    lastActive: "2 hours ago",
    leads: 31,
    tone: "bg-amber-100 text-amber-600",
  },
  {
    id: 5,
    initials: "KM",
    name: "Karan Mehta",
    email: "karan.mehta@brightmind.com",
    role: "Consultant",
    status: "Inactive",
    lastActive: "3 days ago",
    leads: 18,
    tone: "bg-violet-100 text-violet-600",
  },
  {
    id: 6,
    initials: "SV",
    name: "Sneha Verma",
    email: "sneha.verma@brightmind.com",
    role: "Consultant",
    status: "Active",
    lastActive: "45 minutes ago",
    leads: 29,
    tone: "bg-rose-100 text-rose-600",
  },
  {
    id: 7,
    initials: "AG",
    name: "Aditya Gupta",
    email: "aditya.gupta@brightmind.com",
    role: "Admin",
    status: "Active",
    lastActive: "1 hour ago",
    leads: 35,
    tone: "bg-blue-100 text-blue-600",
  },
  {
    id: 8,
    initials: "MJ",
    name: "Megha Jain",
    email: "megha.jain@brightmind.com",
    role: "Consultant",
    status: "Active",
    lastActive: "2 hours ago",
    leads: 21,
    tone: "bg-teal-100 text-teal-600",
  },
  {
    id: 9,
    initials: "VP",
    name: "Vikram Patel",
    email: "vikram.patel@brightmind.com",
    role: "Head Consultant",
    status: "Active",
    lastActive: "30 minutes ago",
    leads: 47,
    tone: "bg-pink-100 text-pink-600",
  },
  {
    id: 10,
    initials: "IM",
    name: "Isha Malhotra",
    email: "isha.malhotra@brightmind.com",
    role: "Consultant",
    status: "Inactive",
    lastActive: "5 days ago",
    leads: 12,
    tone: "bg-indigo-100 text-indigo-600",
  },
  {
    id: 11,
    initials: "AA",
    name: "Aarav Arora",
    email: "aarav.arora@brightmind.com",
    role: "Consultant",
    status: "Active",
    lastActive: "3 hours ago",
    leads: 24,
    tone: "bg-cyan-100 text-cyan-600",
  },
  {
    id: 12,
    initials: "ST",
    name: "Sonal Tiwari",
    email: "sonal.tiwari@brightmind.com",
    role: "Consultant",
    status: "Active",
    lastActive: "4 hours ago",
    leads: 19,
    tone: "bg-orange-100 text-orange-600",
  },
];

const roleClasses = {
  Admin: "bg-blue-100 text-blue-700",
  "Head Counsellor": "bg-violet-100 text-violet-700",
  "Head Consultant": "bg-violet-100 text-violet-700",
  Counsellor: "bg-emerald-50 text-emerald-700",
  Consultant: "bg-emerald-50 text-emerald-700",
};

function getRoleClass(roleName) {
  if (roleClasses[roleName]) return roleClasses[roleName];
  return "bg-purple-100 text-purple-700";
}

const statCards = [
  {
    label: "Total Team Members",
    icon: UsersRound,
    tone: "blue",
    value: (members) => members.length,
  },
  {
    label: "Active Members",
    icon: UserRoundCheck,
    tone: "emerald",
    value: (members) =>
      members.filter((member) => member.status === "Active").length,
  },
  {
    label: "Inactive Members",
    icon: UserRoundX,
    tone: "rose",
    value: (members) =>
      members.filter((member) => member.status === "Inactive").length,
  },
  {
    label: "Total Assigned Leads",
    icon: UsersRound,
    tone: "violet",
    value: () => 248,
  },
];

const toneClasses = {
  blue: "bg-blue-100 text-blue-600",
  emerald: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  violet: "bg-violet-100 text-violet-600",
};

function EditMemberDialog({ member, onClose, onSave }) {
  const [draft, setDraft] = useState(member);

  const update = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Edit Team Member
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Update this member's role and access status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close edit member dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">
            Name
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={draft.email}
              onChange={(event) => update("email", event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Role
            <select
              value={draft.role}
              onChange={(event) => update("role", event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>Admin</option>
              <option>Head Consultant</option>
              <option>Consultant</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Status
            <select
              value={draft.status}
              onChange={(event) => update("status", event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TeamManagement({ onNavigate }) {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [editingMember, setEditingMember] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    listTeamMembersRequest()
      .then(({ members }) => {
        if (!active) return;
        setMembers((members || []).map((member, index) => ({
          id: member.id,
          initials: member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
          name: member.name,
          email: member.email,
          role: member.roleName || (member.role === "HEAD_COUNSELLOR" ? "Head Counsellor" : "Counsellor"),
          status: member.status === "ACTIVE" ? "Active" : "Inactive",
          lastActive: "—",
          leads: 0,
          tone: ["bg-cyan-100 text-cyan-600", "bg-blue-100 text-blue-600", "bg-violet-100 text-violet-600"][index % 3],
        })));
      })
      .catch(() => {
        if (active) setMembers([]);
      });
    return () => { active = false; };
  }, []);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        !search ||
        `${member.name} ${member.email}`.toLowerCase().includes(search);
      const matchesRole = role === "All Roles" || member.role === role;
      const matchesStatus = status === "All Status" || member.status === status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, query, role, status]);

  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetFilters = () => {
    setQuery("");
    setRole("All Roles");
    setStatus("All Status");
    setPage(1);
  };

  const saveMember = (updatedMember) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === updatedMember.id ? updatedMember : member,
      ),
    );
    setEditingMember(null);
  };

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm font-medium text-blue-600"
          >
            <button
              type="button"
              onClick={() => onNavigate?.("team")}
              className="inline-flex items-center gap-1.5 hover:text-blue-700"
            >
              <Settings2 size={15} /> Team
            </button>
            <ChevronRight size={15} className="text-slate-400" />
            <span className="text-slate-500">Team Management</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your team members, roles, and access. Add, edit or deactivate
            team members as needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("teamMember")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <Plus size={17} /> Add Team Member
        </button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {statCards.map(({ label, icon: Icon, tone, value }) => (
            <article key={label} className="flex items-center gap-4 px-4 py-4">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`}
              >
                <Icon size={25} />
              </span>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <strong className="mt-1 block text-2xl font-bold text-slate-950">
                  {value(members)}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="relative min-w-0 lg:w-56">
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Head Consultant</option>
              <option>Consultant</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </label>
          <label className="relative min-w-0 lg:w-52">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[1040px] w-full border-collapse text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-700">
              <tr>
                <th className="w-16 border-b border-slate-200 px-4 py-3">
                  S.No.
                </th>
                <th className="border-b border-l border-slate-200 px-4 py-3">
                  Name
                </th>
                <th className="w-44 border-b border-l border-slate-200 px-4 py-3">
                  Role
                </th>
                <th className="w-40 border-b border-l border-slate-200 px-4 py-3">
                  Status
                </th>
                <th className="w-48 border-b border-l border-slate-200 px-4 py-3">
                  Last Active
                </th>
                <th className="w-40 border-b border-l border-slate-200 px-4 py-3">
                  Assigned Leads
                </th>
                <th className="w-44 border-b border-l border-slate-200 px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleMembers.map((member, index) => {
                const inactive = member.status === "Inactive";
                return (
                  <tr
                    key={member.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-2.5 text-sm text-slate-700">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="border-l border-slate-100 px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${member.tone}`}
                        >
                          {member.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {member.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border-l border-slate-100 px-4 py-2.5">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getRoleClass(member.role)}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="border-l border-slate-100 px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${inactive ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        <i
                          className={`h-2 w-2 rounded-full ${inactive ? "bg-rose-500" : "bg-green-500"}`}
                        />
                        {member.status}
                      </span>
                    </td>
                    <td className="border-l border-slate-100 px-4 py-2.5">
                      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <i
                          className={`h-2 w-2 rounded-full ${inactive ? "bg-rose-500" : "bg-green-600"}`}
                        />
                        {member.lastActive}
                      </span>
                    </td>
                    <td className="border-l border-slate-100 px-4 py-2.5 text-sm font-medium text-slate-800">
                      {member.leads}
                    </td>
                    <td className="border-l border-slate-100 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          aria-label={`Edit ${member.name}`}
                          title="Edit team member"
                          className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          aria-label={`Manage ${member.name} access`}
                          title="Manage role and access"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingMember(member)}
                          aria-label={`Open actions for ${member.name}`}
                          title="Edit team member"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <MoreVertical size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!visibleMembers.length && (
          <div className="py-12 text-center text-sm text-slate-500">
            No team members match the selected filters.
          </div>
        )}

        <footer className="mt-5 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            {filteredMembers.length ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, filteredMembers.length)} of{" "}
            {filteredMembers.length} members
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`grid h-10 w-10 place-items-center rounded-lg border text-sm font-semibold ${currentPage === pageNumber ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={currentPage === pageCount}
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>

      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={saveMember}
        />
      )}
    </>
  );
}
