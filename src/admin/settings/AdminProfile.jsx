import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  Camera,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  GraduationCap,
  Hash,
  HelpCircle,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings2,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { getCompanyProfileRequest, getMeRequest } from "../../lib/authApi";

function formatMemberSince(dateStr) {
  if (!dateStr) return "12 Mar 2024";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "12 Mar 2024";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "12 Mar 2024";
  }
}

function SectionHeading({ icon: Icon, title, description, tone = "blue", action }) {
  const toneClass =
    tone === "purple"
      ? "bg-purple-100 text-purple-600"
      : "bg-blue-100 text-blue-600";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={20} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function ReadOnlyField({ label, icon: Icon, value, className = "", isStatus = false }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</span>
      <div className="relative flex h-11 w-full items-center rounded-lg border border-slate-200/90 bg-slate-50/60 px-3 text-sm text-slate-800 transition hover:border-slate-300">
        {Icon && <Icon size={16} className="shrink-0 text-slate-400 mr-2.5" />}
        {isStatus ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {value || "Active"}
          </span>
        ) : (
          <span className="truncate font-normal text-slate-800">{value || "—"}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminProfile({ onNavigate, user: initialUser }) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (initialUser) return initialUser;
    try {
      return (
        JSON.parse(
          sessionStorage.getItem("user") || localStorage.getItem("user")
        ) || null
      );
    } catch {
      return null;
    }
  });

  const [companyProfile, setCompanyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        // Load latest user details and company profile in parallel
        const [meRes, companyRes] = await Promise.allSettled([
          getMeRequest(),
          getCompanyProfileRequest(),
        ]);

        if (isMounted) {
          if (meRes.status === "fulfilled" && meRes.value?.user) {
            setCurrentUser(meRes.value.user);
          }
          if (companyRes.status === "fulfilled" && companyRes.value?.profile) {
            setCompanyProfile(companyRes.value.profile);
          }
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    const handleCompanyUpdate = (e) => {
      if (e?.detail) setCompanyProfile(e.detail);
      else getCompanyProfileRequest().then((res) => res?.profile && setCompanyProfile(res.profile)).catch(() => {});
    };

    window.addEventListener("solmento:company-profile-updated", handleCompanyUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("solmento:company-profile-updated", handleCompanyUpdate);
    };
  }, []);

  const userRole = currentUser?.role === "HEAD_COUNSELLOR"
    ? "HEAD COUNSELLOR"
    : currentUser?.role || "ADMIN";

  const roleDisplay = currentUser?.role === "ADMIN"
    ? "Administrator"
    : currentUser?.role === "HEAD_COUNSELLOR"
    ? "Head Counsellor"
    : currentUser?.role === "COUNSELLOR"
    ? "Counsellor"
    : currentUser?.roleName || "Administrator";

  const userName = currentUser?.name || "Suraj Kumar";
  const userEmail = currentUser?.email || "suraj.kumar@brightminduniversity.com";
  const companyName = companyProfile?.companyName || currentUser?.companyName || "BrightMind University";
  const logoUrl = companyProfile?.logoUrl || currentUser?.profilePhoto || "";

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SK";

  const memberSince = formatMemberSince(currentUser?.createdAt);

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex flex-col gap-1 border-b border-blue-100 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 mb-1">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate?.("companyProfile")}
                className="inline-flex items-center gap-1 hover:text-blue-700 cursor-pointer"
              >
                <Settings2 size={15} /> Settings
              </button>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-500 font-normal">Profile</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
              <User size={15} /> Profile
            </span>
          )}
        </nav>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {isAdmin
            ? "Manage your account and organization information."
            : "Manage your personal account information."}
        </p>
      </header>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading profile details...</span>
          </div>
        </div>
      ) : (
        <>
          {/* PROFILE SUMMARY HERO CARD */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm transition">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left Column: Avatar & User Identity */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative group cursor-pointer" onClick={() => onNavigate?.("profileEdit")}>
                  <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-slate-100 bg-white shadow-sm ring-4 ring-blue-50/80 overflow-hidden hover:ring-blue-100 transition">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={companyName}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-2xl font-black tracking-wider text-blue-600">
                        {initials}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate?.("profileEdit");
                    }}
                    title="Change profile photo"
                    className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white transition hover:bg-blue-700 cursor-pointer"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      {userName}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60 uppercase tracking-wide">
                      {userRole}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 pt-0.5">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={15} className="text-slate-400" />
                      {userEmail}
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={15} className="text-slate-400" />
                      {companyName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Quick Status & Account Badges */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">
                {/* Status */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-3 text-center">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-1.5">
                    <Shield size={16} />
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Account Status</span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-600">
                    {currentUser?.status === "INACTIVE" ? "Inactive" : "Active"}
                  </span>
                </div>

                {/* Member Since */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-3 text-center">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-600 mb-1.5">
                    <Calendar size={16} />
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Member Since</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{memberSince}</span>
                </div>

                {/* Role */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-3 text-center">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-purple-100 text-purple-600 mb-1.5">
                    <User size={16} />
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Role</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[90px]">
                    {roleDisplay}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* PERSONAL INFORMATION CARD */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <SectionHeading
              icon={User}
              title="Personal Information"
              description="Your account details and personal information."
              tone="blue"
              action={
                <button
                  type="button"
                  onClick={() => onNavigate?.("profileEdit")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer"
                >
                  <Pencil size={13} /> Edit Profile
                </button>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ReadOnlyField label="Full Name" icon={User} value={userName} />
              <ReadOnlyField label="Email Address" icon={Mail} value={userEmail} />
              <ReadOnlyField label="Role" icon={ShieldCheck} value={roleDisplay} />
              <ReadOnlyField label="Account Status" value={currentUser?.status === "INACTIVE" ? "Inactive" : "Active"} isStatus />
            </div>
          </section>

          {/* ADMIN ONLY: ORGANIZATION INFORMATION & BUSINESS ADDRESS */}
          {isAdmin && (
            <>
              {/* ORGANIZATION INFORMATION CARD */}
              <section className="rounded-2xl border border-blue-100 bg-white p-6 sm:p-7 shadow-sm space-y-6">
                <SectionHeading
                  icon={Building2}
                  title="Organization Information"
                  description="Your organization's basic information from company profile."
                  tone="blue"
                  action={
                    <button
                      type="button"
                      onClick={() => onNavigate?.("companyProfile")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 cursor-pointer"
                    >
                      <ExternalLink size={13} /> Go to Company Profile
                    </button>
                  }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Company Logo Preview Box */}
                  <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/50 p-5 text-center min-h-[160px]">
                    <div className="grid h-24 w-24 place-items-center rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-2">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={companyName}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <Building2 size={36} className="text-slate-300" />
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                      Company Logo <HelpCircle size={13} className="text-slate-400" />
                    </span>
                  </div>

                  {/* Right: Organization Information Fields Grid */}
                  <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ReadOnlyField
                      label="Company Name"
                      icon={Building2}
                      value={companyProfile?.companyName || companyName}
                    />
                    <ReadOnlyField
                      label="Industry"
                      icon={GraduationCap}
                      value={companyProfile?.industry || "Education"}
                    />
                    <ReadOnlyField
                      label="Timezone"
                      icon={Clock3}
                      value={companyProfile?.timezone || "(GMT+05:30) Asia/Kolkata"}
                    />
                    <ReadOnlyField
                      label="Email Address"
                      icon={Mail}
                      value={companyProfile?.email || "info@brightminduniversity.com"}
                    />
                    <ReadOnlyField
                      label="Phone Number"
                      icon={Phone}
                      value={companyProfile?.phone || "+91 98765 43210"}
                    />
                    <ReadOnlyField
                      label="Website"
                      icon={Globe2}
                      value={companyProfile?.website || "https://www.brightminduniversity.com"}
                    />
                    <ReadOnlyField
                      label="Support Email"
                      icon={Mail}
                      value={companyProfile?.supportEmail || "support@brightminduniversity.com"}
                      className="sm:col-span-2 lg:col-span-3"
                    />
                  </div>
                </div>
              </section>

              {/* BUSINESS ADDRESS CARD */}
              <section className="rounded-2xl border border-purple-100 bg-white p-6 sm:p-7 shadow-sm space-y-5">
                <SectionHeading
                  icon={MapPin}
                  title="Business Address"
                  description="Your registered business address from company profile."
                  tone="purple"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ReadOnlyField
                    label="Address Line 1"
                    icon={MapPin}
                    value={companyProfile?.addressLine1 || "Plot No. 123, Sector 62"}
                  />
                  <ReadOnlyField
                    label="Address Line 2 (Optional)"
                    icon={FileText}
                    value={companyProfile?.addressLine2 || "Building, Floor, Suite (Optional)"}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ReadOnlyField
                    label="City"
                    icon={Building2}
                    value={companyProfile?.city || "Noida"}
                  />
                  <ReadOnlyField
                    label="State"
                    icon={Landmark}
                    value={companyProfile?.state || "Uttar Pradesh"}
                  />
                  <ReadOnlyField
                    label="PIN Code"
                    icon={Hash}
                    value={companyProfile?.pinCode || "201309"}
                  />
                  <ReadOnlyField
                    label="Country"
                    icon={Globe2}
                    value={companyProfile?.country || "India"}
                  />
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
