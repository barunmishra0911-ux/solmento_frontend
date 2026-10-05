import { useState, useEffect } from "react";
import { ArrowLeft, Building2, CheckCircle2, ChevronDown, Eye, EyeOff, ImagePlus, LockKeyhole, Mail, Phone, UserPlus, UserRound, UsersRound, X } from "lucide-react";
import { createCounsellorRequest, updateCounsellorRequest, listRolesRequest } from "@/lib/authApi";
import { showToast } from "@/lib/toast";

const initialForm = { fullName: "", profilePhoto: "", email: "", phone: "", department: "", designation: "", password: "" };
const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Field({ label, required, children, error, helper }) {
  return (
    <label className="block min-w-0 text-sm font-semibold text-slate-800">
      <span>{label}{required && <span className="ml-1 text-rose-500">*</span>}</span>
      {children}
      {helper && <span className="mt-1.5 block text-xs font-normal text-slate-500">{helper}</span>}
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Please choose a valid image."));
      image.onload = () => {
        const maxSize = 600;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function CreateCounsellor({ onNavigate, counsellor = null }) {
  const isEditing = Boolean(counsellor);
  const [form, setForm] = useState(() => counsellor ? {
    fullName: counsellor.fullName || "",
    profilePhoto: counsellor.profilePhoto || "",
    email: counsellor.email || "",
    phone: counsellor.phone || "",
    department: counsellor.department || "",
    designation: counsellor.designation || "",
    password: "",
  } : initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoadingRoles(true);
    listRolesRequest()
      .then((res) => {
        if (!active) return;
        const allRoles = res?.roles || [];
        // Strictly filter to custom roles, matching Roles & Permissions UI filter
        const customRoles = allRoles.filter(
          (r) => !r.isSystem && r.type !== "SYSTEM"
        );
        setAvailableRoles(customRoles);
      })
      .catch((err) => {
        console.error("Failed to load roles for designation dropdown:", err);
      })
      .finally(() => {
        if (active) setIsLoadingRoles(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setApiError("");
    setNotice("");
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, profilePhoto: "Please choose an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, profilePhoto: "Image must be 5 MB or smaller." }));
      return;
    }
    try {
      update("profilePhoto", await compressImage(file));
    } catch (error) {
      setErrors((current) => ({ ...current, profilePhoto: error.message }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.department.trim()) next.department = "Department is required.";
    if (!form.designation) next.designation = "Designation is required.";
    if (!isEditing) {
      if (!form.password) next.password = "Password is required for counsellor login.";
      else if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    } else if (form.password && form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate() || isSaving) return;
    setIsSaving(true);
    setApiError("");
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        designation: form.designation,
        profilePhoto: form.profilePhoto || "",
      };
      if (form.password && form.password.trim()) {
        payload.password = form.password.trim();
      }
      let savedResponse = null;
      if (isEditing) {
        savedResponse = await updateCounsellorRequest(counsellor.id, payload);
      } else {
        savedResponse = await createCounsellorRequest(payload);
      }
      const assignedId = savedResponse?.counsellor?.employeeId;
      const msg = isEditing
        ? "Counsellor updated successfully."
        : (assignedId
            ? `Counsellor created successfully with Employee ID: ${assignedId}`
            : "Counsellor created successfully.");
      setNotice(msg);
      showToast.success(msg);
      if (!isEditing) setForm(initialForm);
      setTimeout(() => onNavigate("counsellors"), 700);
    } catch (error) {
      const errMsg = error.message || "Unable to save counsellor.";
      setApiError(errMsg);
      showToast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="mb-5 border-b border-blue-100 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm font-medium text-blue-600">
          <button type="button" onClick={() => onNavigate("counsellors")} className="inline-flex items-center gap-1.5 hover:text-blue-700"><UsersRound size={15} /> Counsellor</button>
          <ChevronDown size={15} className="-rotate-90 text-slate-400" />
           <span className="text-slate-500">{isEditing ? "Edit Counsellor" : "Create Counsellor"}</span>
        </nav>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{isEditing ? "Edit Counsellor" : "Create Counsellor"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isEditing ? "Update this counsellor's existing details." : "Add a counsellor to your admissions team."}</p>
          </div>
          <button type="button" onClick={() => onNavigate("counsellors")} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"><ArrowLeft size={16} /> Back</button>
        </div>
      </header>

      <form onSubmit={submit} className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {apiError && <p role="alert" className="mx-5 mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6 lg:mx-7">{apiError}</p>}
        {notice && <p role="status" className="mx-5 mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:mx-6 lg:mx-7"><CheckCircle2 size={17} /> {notice}</p>}
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2 lg:p-7">
          <Field label="Full Name" required error={errors.fullName}><div className="relative mt-2"><UserPlus size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={form.fullName} onChange={(event) => update("fullName", event.target.value)} placeholder="Enter full name" className={`${inputClass} pl-10`} /></div></Field>
          {isEditing ? (
            <Field label="Employee ID" helper="Employee ID is permanently assigned and cannot be modified.">
              <div className="relative mt-2">
                <UserRound size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={counsellor?.employeeId || "—"} readOnly disabled className={`${inputClass} cursor-not-allowed bg-slate-50 pl-10 font-mono font-medium text-slate-600 select-all`} />
              </div>
            </Field>
          ) : (
            <Field label="Employee ID" helper="A unique 12-character ID will be generated automatically after creation.">
              <div className="relative mt-2">
                <UserRound size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value="Auto-generated on creation (e.g. K7M2Q9X4B8P1)" readOnly disabled className={`${inputClass} cursor-not-allowed bg-slate-50 pl-10 text-slate-400 select-none`} />
              </div>
            </Field>
          )}
          <Field label="Email Address (Login Email)" required error={errors.email}><div className="relative mt-2"><Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="Enter email address" className={`${inputClass} pl-10`} /></div></Field>
          <Field label="Phone Number" required error={errors.phone}><div className="relative mt-2"><Phone size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="Enter phone number" className={`${inputClass} pl-10`} /></div></Field>
          <Field label="Department" required error={errors.department}><div className="relative mt-2"><Building2 size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={form.department} onChange={(event) => update("department", event.target.value)} placeholder="e.g. Admissions" className={`${inputClass} pl-10`} /></div></Field>
          <Field label="Designation" required error={errors.designation}>
            <div className="relative mt-2">
              <UsersRound size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={form.designation}
                onChange={(event) => update("designation", event.target.value)}
                className={`${inputClass} appearance-none pl-10 pr-10`}
              >
                <option value="" disabled>
                  {isLoadingRoles ? "Loading designations..." : "Select designation"}
                </option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
                {form.designation && !availableRoles.some((r) => r.name === form.designation) && (
                  <option value={form.designation}>{form.designation}</option>
                )}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </Field>
          <Field label="Login Password" required={!isEditing} error={errors.password} helper={isEditing ? "Leave blank to keep existing password." : "Required for Counsellor portal login (min 8 characters)."}>
            <div className="relative mt-2">
              <LockKeyhole size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder={isEditing ? "Leave blank to keep current password" : "Set a secure password"}
                className={`${inputClass} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Field>
          <Field label="Profile Photo" error={errors.profilePhoto} helper="JPG, PNG, WEBP or GIF up to 5 MB."><div className="mt-2 flex items-center gap-3"><label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><ImagePlus size={17} /> Choose image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhoto} className="sr-only" /></label>{form.profilePhoto && <div className="relative"><img src={form.profilePhoto} alt="Profile preview" className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-100" /><button type="button" onClick={() => update("profilePhoto", "")} className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-slate-500 shadow" aria-label="Remove profile photo"><X size={14} /></button></div>}</div></Field>
        </div>
        <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-7">
          <button type="button" onClick={() => onNavigate("counsellors")} className="h-11 rounded-lg border border-blue-300 px-6 text-sm font-semibold text-blue-600 hover:bg-blue-50">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"><UserPlus size={17} /> {isSaving ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Counsellor")}</button>
        </footer>
      </form>
    </>
  );
}
