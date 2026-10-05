import { useRef, useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileImage,
  Globe2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings2,
  Trash2,
  Upload,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { getCompanyProfileRequest, updateCompanyProfileRequest } from "../../lib/authApi";
import { showToast } from "../../lib/toast";

// Settings-specific Company Profile screen.

const initialProfile = {
  companyName: "BrightMind University",
  industry: "Education",
  timezone: "(GMT+05:30) Asia/Kolkata",
  email: "info@brightminduniversity.com",
  phone: "+91 98765 43210",
  website: "https://www.brightminduniversity.com",
  supportEmail: "support@brightminduniversity.com",
  addressLine1: "Plot No. 123, Sector 62",
  addressLine2: "",
  city: "Noida",
  state: "Uttar Pradesh",
  pinCode: "201309",
  country: "India",
  logoUrl: "",
};

function SectionHeading({ icon: Icon, title, description, tone = "blue" }) {
  const toneClass = tone === "violet" ? "bg-violet-100 text-violet-600" : "bg-blue-100 text-blue-600";

  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
        <Icon size={21} />
      </span>
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function FormField({ label, required, icon: Icon, children, className = "" }) {
  return (
    <label className={`block min-w-0 text-xs font-semibold text-slate-700 ${className}`}>
      <span>
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <span className="relative mt-1.5 block">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
        {children}
      </span>
    </label>
  );
}

const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const inputWithIconClass = `${inputClass} pl-10`;

export default function CompanyProfile({ onNavigate }) {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(initialProfile);
  const [logoName, setLogoName] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const res = await getCompanyProfileRequest();
        if (res && res.profile) {
          setProfile(res.profile);
          if (res.profile.logoUrl) {
            const extracted = res.profile.logoUrl.startsWith("data:")
              ? "Company Logo"
              : res.profile.logoUrl.split("/").pop() || "Company Logo";
            setLogoName(extracted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch company profile:", err);
        setError(err?.message || "Failed to load company profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const updateProfile = (key, value) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setNotice("");
    setError("");
  };

  const chooseLogo = () => fileInputRef.current?.click();

  const onLogoChange = (event) => {
    const [file] = event.target.files;
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo file size must be less than 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!validTypes.includes(file.type) && !/\.(png|jpe?g|svg)$/i.test(file.name)) {
      setError("Please select a valid PNG, JPG, or SVG image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLogoName(file.name);
    setNotice("");
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      updateProfile("logoUrl", e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoName("");
    updateProfile("logoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveProfile = async () => {
    if (saving) return;

    // Validate required fields
    if (!profile.companyName.trim()) { setError("Company Name is required."); return; }
    if (!profile.industry.trim()) { setError("Industry is required."); return; }
    if (!profile.timezone.trim()) { setError("Timezone is required."); return; }
    if (!profile.email.trim()) { setError("Email Address is required."); return; }
    if (!profile.phone.trim()) { setError("Phone Number is required."); return; }
    if (!profile.addressLine1.trim()) { setError("Address Line 1 is required."); return; }
    if (!profile.city.trim()) { setError("City is required."); return; }
    if (!profile.state.trim()) { setError("State is required."); return; }
    if (!profile.pinCode.trim()) { setError("PIN Code is required."); return; }
    if (!profile.country.trim()) { setError("Country is required."); return; }

    try {
      setSaving(true);
      setNotice("");
      setError("");
      const res = await updateCompanyProfileRequest(profile);
      if (res && res.profile) {
        setProfile(res.profile);
        window.dispatchEvent(
          new CustomEvent("solmento:company-profile-updated", { detail: res.profile })
        );
      }
    } catch (err) {
      console.error("Failed to save company profile:", err);
      const errMsg = err?.message || "Failed to save company profile. Please try again.";
      setError(errMsg);
      showToast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="mb-5 flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm font-medium text-blue-600">
            <button type="button" onClick={() => onNavigate?.("settings")} className="hover:text-blue-700 cursor-pointer">
              <span className="inline-flex items-center gap-1.5"><Settings2 size={15} /> Settings</span>
            </button>
            <ChevronRight size={15} className="text-slate-400" />
            <span className="text-slate-500">Company Profile</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Company Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your organization's basic information, branding, and contact details.</p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving || loading}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
          {error && <p role="status" className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600"><AlertCircle size={14} /> {error}</p>}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
          <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading company profile...</p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm">
        <SectionHeading icon={Building2} title="Basic Information" description="Add your company's basic details and industry information." />

        <div className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
          <div>
            <p className="text-xs font-semibold text-slate-700">Company Logo</p>
            <div className="mt-1.5 flex min-h-[175px] flex-col items-center justify-center rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 text-center">
              {profile.logoUrl ? (
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  <img
                    src={profile.logoUrl}
                    alt="Company Logo Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600">
                  <Building2 size={27} />
                </span>
              )}
              <p className="mt-2.5 max-w-[280px] truncate text-xs font-semibold text-slate-800" title={logoName || "Upload Logo"}>
                {logoName || "Upload Logo"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">PNG, JPG or SVG (Max 2MB)</p>
              <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" onChange={onLogoChange} className="hidden" />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={chooseLogo} className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200 cursor-pointer">
                  <Upload size={14} /> Choose File
                </button>
                <button type="button" onClick={removeLogo} disabled={!profile.logoUrl && !logoName} className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>

          <div className="grid content-start gap-4 sm:grid-cols-2">
            <FormField label="Company Name" required icon={Building2} className="sm:col-span-2">
              <input value={profile.companyName} onChange={(event) => updateProfile("companyName", event.target.value)} className={inputWithIconClass} />
            </FormField>
            <FormField label="Industry" required icon={GraduationCap}>
              <select value={profile.industry} onChange={(event) => updateProfile("industry", event.target.value)} className={inputWithIconClass}>
                <option>Education</option>
                <option>Healthcare</option>
                <option>Technology</option>
                <option>Retail</option>
                <option>Other</option>
              </select>
            </FormField>
            <FormField label="Timezone" required icon={Clock3}>
              <select value={profile.timezone} onChange={(event) => updateProfile("timezone", event.target.value)} className={inputWithIconClass}>
                <option>(GMT+05:30) Asia/Kolkata</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+04:00) Asia/Dubai</option>
                <option>(GMT-05:00) America/New_York</option>
              </select>
            </FormField>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 border-t-4 border-t-blue-500 bg-white p-5 shadow-sm">
        <SectionHeading icon={Phone} title="Contact Information" description="Add your official contact details." />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Email Address" required icon={Mail}>
            <input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} className={inputWithIconClass} />
          </FormField>
          <FormField label="Phone Number" required icon={Phone}>
            <input type="tel" value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} className={inputWithIconClass} />
          </FormField>
          <FormField label="Website" icon={Globe2}>
            <input type="url" value={profile.website} onChange={(event) => updateProfile("website", event.target.value)} className={inputWithIconClass} />
          </FormField>
          <FormField label="Support Email" icon={Mail}>
            <input type="email" value={profile.supportEmail} onChange={(event) => updateProfile("supportEmail", event.target.value)} className={inputWithIconClass} />
          </FormField>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-200 border-t-4 border-t-violet-500 bg-white p-5 shadow-sm">
        <SectionHeading icon={MapPin} title="Address" description="Set your registered business address." tone="violet" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormField label="Address Line 1" required className="lg:col-span-2">
            <input value={profile.addressLine1} onChange={(event) => updateProfile("addressLine1", event.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Address Line 2 (Optional)" className="lg:col-span-2">
            <input value={profile.addressLine2} onChange={(event) => updateProfile("addressLine2", event.target.value)} placeholder="Building, Floor, Suite (Optional)" className={inputClass} />
          </FormField>
          <FormField label="City" required>
            <input value={profile.city} onChange={(event) => updateProfile("city", event.target.value)} className={inputClass} />
          </FormField>
          <FormField label="State" required>
            <input value={profile.state} onChange={(event) => updateProfile("state", event.target.value)} className={inputClass} />
          </FormField>
          <FormField label="PIN Code" required>
            <input inputMode="numeric" value={profile.pinCode} onChange={(event) => updateProfile("pinCode", event.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Country" required>
            <select value={profile.country} onChange={(event) => updateProfile("country", event.target.value)} className={inputClass}>
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>United Arab Emirates</option>
            </select>
          </FormField>
        </div>
      </section>
      </>
      )}
    </>
  );
}
