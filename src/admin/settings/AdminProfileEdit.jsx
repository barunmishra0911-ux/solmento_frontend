import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Camera,
  ChevronRight,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings2,
} from "lucide-react";
import {
  getCompanyProfileRequest,
  getMeRequest,
  updateCompanyProfileRequest,
  updateUserProfileRequest,
} from "../../lib/authApi";
import { showToast } from "../../lib/toast";

export default function AdminProfileEdit({ onNavigate, user: initialUser }) {
  const fileInputRef = useRef(null);
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
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Editable Form Fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
    companyName: "",
    logoUrl: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [meRes, companyRes] = await Promise.allSettled([
          getMeRequest(),
          getCompanyProfileRequest(),
        ]);

        let u = currentUser;
        if (meRes.status === "fulfilled" && meRes.value?.user) {
          u = meRes.value.user;
          if (isMounted) setCurrentUser(u);
        }

        let cp = null;
        if (companyRes.status === "fulfilled" && companyRes.value?.profile) {
          cp = companyRes.value.profile;
          if (isMounted) setCompanyProfile(cp);
        }

        if (isMounted) {
          setFormData({
            name: u?.name || "",
            email: u?.email || "",
            status: u?.status || "ACTIVE",
            companyName: cp?.companyName || u?.companyName || "",
            logoUrl: cp?.logoUrl || u?.profilePhoto || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile details for edit:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSuccessNotice("");
    setErrorMessage("");
  };

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image file size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange("logoUrl", event.target?.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    handleChange("logoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (isAdmin && !formData.companyName.trim()) {
      setErrorMessage("Company Name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessNotice("");

      // 1. Update User Profile in backend
      const userRes = await updateUserProfileRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        status: formData.status,
      });

      const updatedUser = userRes?.user || {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        status: formData.status,
      };

      // Update storage and notify components
      const currentStorageUser = JSON.parse(
        sessionStorage.getItem("user") || localStorage.getItem("user") || "{}"
      );
      const mergedUser = { ...currentStorageUser, ...updatedUser };
      if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(mergedUser));
      } else {
        localStorage.setItem("user", JSON.stringify(mergedUser));
      }
      window.dispatchEvent(new CustomEvent("solmento:user-updated", { detail: mergedUser }));

      // 2. If photo or company profile changed, sync company profile / logo
      let fullCompanyProfile = companyProfile || {};
      if (!companyProfile) {
        try {
          const cpRes = await getCompanyProfileRequest();
          fullCompanyProfile = cpRes?.profile || {};
        } catch {
          fullCompanyProfile = {};
        }
      }

      const updatedCompanyPayload = {
        ...fullCompanyProfile,
        companyName: isAdmin ? formData.companyName.trim() : (fullCompanyProfile.companyName || "BrightMind University"),
        logoUrl: formData.logoUrl || "",
        industry: fullCompanyProfile.industry || "Education",
        timezone: fullCompanyProfile.timezone || "(GMT+05:30) Asia/Kolkata",
        email: fullCompanyProfile.email || formData.email.trim(),
        phone: fullCompanyProfile.phone || "+91 98765 43210",
        addressLine1: fullCompanyProfile.addressLine1 || "Plot No. 123, Sector 62",
        city: fullCompanyProfile.city || "Noida",
        state: fullCompanyProfile.state || "Uttar Pradesh",
        pinCode: fullCompanyProfile.pinCode || "201309",
        country: fullCompanyProfile.country || "India",
      };

      const compRes = await updateCompanyProfileRequest(updatedCompanyPayload);
      const savedCompany = compRes?.profile || updatedCompanyPayload;
      setCompanyProfile(savedCompany);

      window.dispatchEvent(
        new CustomEvent("solmento:company-profile-updated", { detail: savedCompany })
      );

      setSuccessNotice("Profile updated successfully!");
      showToast.success("Profile updated successfully!");

      // Navigate back to profile after a brief moment so user sees success confirmation
      setTimeout(() => {
        onNavigate?.("profile");
      }, 600);
    } catch (err) {
      console.error("Failed to save profile:", err);
      const errMsg = err?.message || "Failed to update profile. Please try again.";
      setErrorMessage(errMsg);
      showToast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";

  const initials = (formData.name || "Admin")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Header */}
      <header className="flex flex-col gap-1 border-b border-blue-100 pb-5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-medium text-blue-600 mb-1">
          <button
            type="button"
            onClick={() => onNavigate?.("profile")}
            className="inline-flex items-center gap-1 hover:text-blue-700 cursor-pointer"
          >
            <User size={15} /> Profile
          </button>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-500 font-normal">Edit Profile</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Edit Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isAdmin
                ? "Update your personal account information and company affiliation."
                : "Update your personal account information."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.("profile")}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Profile
          </button>
        </div>
      </header>

      {/* Error Alerts */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 animate-in fade-in">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading profile details...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: PROFILE PHOTO */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <Camera size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isAdmin ? "Profile Photo & Organization Logo" : "Profile Photo"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? "Shared across your profile avatar, top-right navigation header, and company branding."
                    : "Your personal account profile avatar."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
              <div className="relative group">
                <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-slate-100 bg-white shadow-sm ring-4 ring-blue-50/80 overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Avatar"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-black tracking-wider text-blue-600">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleChooseImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
                >
                  <Upload size={14} /> Choose Image
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100/70 cursor-pointer"
                  >
                    <Trash2 size={14} /> Remove Photo
                  </button>
                )}
                <span className="text-[11px] text-slate-400 w-full sm:w-auto">
                  PNG, JPG or SVG (Max 2MB)
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 2: PERSONAL INFORMATION */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <User size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">
                  Update your identity and login credentials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="admin@example.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Status
                </label>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: ORGANIZATION (ADMIN ONLY) */}
          {isAdmin && (
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600">
                  <Building2 size={20} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Organization Information</h2>
                  <p className="text-xs text-slate-500">
                    Update the primary display name for your organization.
                  </p>
                </div>
              </div>

              <div className="max-w-xl">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="e.g. BrightMind University"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>
          )}

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate?.("profile")}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
