import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Mail,
  Settings2,
  UserPlus,
  UserRound,
  UsersRound,
  LockKeyhole,
} from "lucide-react";
import { createTeamMemberRequest, listRolesRequest } from "@/lib/authApi";

const initialForm = {
  fullName: "",
  email: "",
  role: "",
  roleId: "",
  headCounsellor: "",
  password: "",
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Field({ label, required, icon: Icon, children, helper }) {
  return (
    <label className="block min-w-0 text-sm font-semibold text-slate-800">
      <span>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      <span className="relative mt-2 block">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
        />
        {children}
      </span>
      {helper && (
        <span className="mt-2 block text-xs font-normal text-slate-500">
          {helper}
        </span>
      )}
    </label>
  );
}

export default function AddTeamMember({ onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [sendInvite, setSendInvite] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await listRolesRequest();
        // Filter out Admin (Admins are created via registration or superadmin)
        const selectableRoles = (res.roles || []).filter(
          (r) => r.name.toLowerCase() !== "admin"
        );
        setRoles(selectableRoles);
      } catch (err) {
        console.error("Failed to load roles for team member creation:", err);
      } finally {
        setIsLoadingRoles(false);
      }
    }
    loadRoles();
  }, []);

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "role" && value !== "Counsellor" ? { headCounsellor: "" } : {}),
    }));
    setNotice("");
    setError("");
  };

  const handleRoleChange = (e) => {
    const selectedId = e.target.value;
    const selectedRole = roles.find((r) => String(r.id) === String(selectedId));
    if (selectedRole) {
      setForm((current) => ({
        ...current,
        roleId: selectedRole.id,
        role: selectedRole.name,
        ...(selectedRole.name !== "Counsellor" ? { headCounsellor: "" } : {}),
      }));
    } else {
      setForm((current) => ({
        ...current,
        roleId: "",
        role: "",
      }));
    }
    setNotice("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.roleId && !form.role) {
      setError("Please select a role for the team member.");
      return;
    }

    if (form.password.length < 8) {
      setError("Team member password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTeamMemberRequest({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        roleId: form.roleId,
      });
      setNotice("Team member created successfully.");
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message || "Unable to create the team member account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const headCounsellorDisabled = form.role !== "Counsellor";

  return (
    <>
      <header className="mb-5 border-b border-blue-100 pb-5">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-sm font-medium text-blue-600"
        >
          <button
            type="button"
            onClick={() => onNavigate?.("team")}
            className="inline-flex items-center gap-1.5 hover:text-blue-700"
          >
            <Settings2 size={15} /> Team Management
          </button>
          <ChevronRight size={15} className="text-slate-400" />
          <span className="text-slate-500">Add Team Member</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Add Team Member
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Invite a new team member and assign their role and permissions.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600">
            <UserPlus size={25} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Team Member Details
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Fill in the information below to add a new team member.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <Field label="Full Name" required icon={UserRound}>
            <input
              required
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
              placeholder="Enter full name"
              className={`${inputClass} pl-10`}
            />
          </Field>
          <Field label="Email Address" required icon={Mail}>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="Enter email address"
              className={`${inputClass} pl-10`}
            />
          </Field>
          <Field label="Role" required icon={UsersRound}>
            <select
              required
              value={form.roleId}
              onChange={handleRoleChange}
              className={`${inputClass} appearance-none pl-10 pr-10`}
            >
              <option value="" disabled>
                {isLoadingRoles ? "Loading roles..." : "Select role"}
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {!r.isSystem && r.type !== "SYSTEM" ? "(Custom)" : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
            />
          </Field>
          <Field
            label="Password"
            required={Boolean(form.roleId || form.role)}
            icon={LockKeyhole}
            helper="Required for team member login."
          >
            <input
              required={Boolean(form.roleId || form.role)}
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="Set a secure password (min 8 chars)"
              className={`${inputClass} pl-10`}
            />
          </Field>
          <Field
            label="Head Counsellor"
            required={!headCounsellorDisabled}
            icon={UsersRound}
            helper="Required if the selected role is Counsellor."
          >
            <select
              required={!headCounsellorDisabled}
              disabled={headCounsellorDisabled}
              value={form.headCounsellor}
              onChange={(event) =>
                update("headCounsellor", event.target.value)
              }
              className={`${inputClass} appearance-none pl-10 pr-10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
            >
              <option value="" disabled>
                Select head counsellor
              </option>
              <option>Priya Sharma</option>
              <option>Aman Raj</option>
              <option>Vikram Patel</option>
            </select>
            <ChevronDown
              size={17}
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
                headCounsellorDisabled ? "text-slate-400" : "text-slate-600"
              }`}
            />
          </Field>
        </div>

        <section className="mt-9 flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
              <Mail size={23} />
            </span>
            <div>
              <h3 className="font-bold text-slate-950">Send Invite</h3>
              <p className="mt-0.5 text-sm text-slate-500">
                Send an invitation email to the team member to set up their account.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={sendInvite}
            onClick={() => setSendInvite((current) => !current)}
            className="inline-flex shrink-0 items-center gap-3 self-start text-sm text-slate-500 sm:self-auto"
          >
            <span
              className={`relative h-7 w-12 rounded-full transition ${
                sendInvite ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <i
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  sendInvite ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
            Send invite email
          </button>
        </section>

        <footer className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
          {notice && (
            <p
              role="status"
              className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600"
            >
              <CheckCircle2 size={16} /> {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="mr-auto text-sm font-medium text-rose-600">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => onNavigate?.("team")}
            className="h-11 rounded-lg border border-blue-300 px-6 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            <UserPlus size={17} />{" "}
            {isSubmitting ? "Creating..." : "Add Team Member"}
          </button>
        </footer>
      </form>
    </>
  );
}
