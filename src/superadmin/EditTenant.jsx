import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Flag,
  Info,
  Smartphone,
  UserRound,
  Users,
} from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import {
  getTenantRequest,
  listPlansRequest,
  updateTenantRequest,
} from "@/lib/authApi";

/* available plans */

// Keep these values aligned with the active plan names returned by the
// Super Admin plans API. The API persists plan names exactly as stored in
// MySQL, so sending display-only aliases makes the tenant update fail.
const FALLBACK_PLAN_OPTIONS = ["Starter", "Pro", "Business"];

/* available trial options */

const TRIAL_OPTIONS = ["7 days", "14 days", "30 days", "No trial"];

export default function EditTenant() {
  const navigate = useNavigate();
  // The route uses :id; keep the local name tenantId for the API payloads.
  const { id: tenantId } = useParams();

  /* form state */
  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [plan, setPlan] = useState("");
  const [planOptions, setPlanOptions] = useState(FALLBACK_PLAN_OPTIONS);
  const [trialLength, setTrialLength] = useState("No trial");
  const [featureFlags, setFeatureFlags] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [errors, setErrors] = useState({});

  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getTenantRequest(tenantId)
      .then(({ tenant: savedTenant }) => {
        if (!active) return;
        setCompanyName(savedTenant.companyName || "");
        setCompanyDomain(savedTenant.companyDomain || "");
        setAdminName(savedTenant.admin?.name || "");
        setAdminEmail(savedTenant.admin?.email || "");
        setPlan(savedTenant.plan === "Unassigned" ? "" : savedTenant.plan || "");
        setTrialLength(savedTenant.trialLength || "No trial");
        setFeatureFlags(savedTenant.featureFlags || {});
        setLoadError("");
      })
      .catch((error) => { if (active) setLoadError(error.message || "Unable to load this admin."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [tenantId]);

  useEffect(() => {
    let active = true;
    listPlansRequest()
      .then(({ plans }) => {
        const activePlanNames = (plans || [])
          .filter((item) => item.status === "ACTIVE")
          .map((item) => item.name)
          .filter(Boolean);
        if (active && activePlanNames.length) setPlanOptions(activePlanNames);
      })
      .catch(() => {
        // Keep the known plan names available if the plans request is briefly unavailable.
      });
    return () => { active = false; };
  }, []);

  /* toggle feature */

  const handleFeatureToggle = (feature) => {
    setFeatureFlags((current) => ({
      ...current,
      [feature]: !current[feature],
    }));
  };

  /* validate form */

  const validateForm = () => {
    const nextErrors = {};

    if (!companyName.trim()) {
      nextErrors.companyName = "Company name is required.";
    }

    if (!adminName.trim()) {
      nextErrors.adminName = "Admin name is required.";
    }

    if (!adminEmail.trim()) {
      nextErrors.adminEmail = "Admin email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      nextErrors.adminEmail = "Please enter a valid email address.";
    }

    if (!plan) {
      nextErrors.plan = "Please select a plan.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* save changes */

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    const updatedTenant = {
      companyName: companyName.trim(),
      companyDomain: companyDomain.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      plan,
      trialLength,
      featureFlags,
    };

    try {
      await updateTenantRequest(tenantId, updatedTenant);
      navigate(`/super-admin/tenants/${tenantId}`);
    } catch (error) {
      setErrors({ form: error.message || "Unable to save admin changes." });
    } finally {
      setIsSaving(false);
    }
  };

  /* cancel */

  const handleCancel = () => {
    navigate(`/super-admin/tenants/${tenantId}`);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <SuperAdminHeader
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
        onMobileSidebarToggle={() =>
          setIsMobileSidebarOpen((current) => !current)
        }
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* sidebar */}

        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* scrollable content */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            {isLoading && <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">Loading admin data…</div>}
            {loadError && <div role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}
            {errors.form && <div role="alert" className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</div>}
            {/* breadcrumb */}

            <div className="mb-3 flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => navigate("/super-admin/tenants")}
                className="
                  cursor-pointer
                  text-blue-500
                  transition
                  hover:text-blue-600
                "
              >
                Admins
              </button>

              <span className="text-slate-300">/</span>

              <button
                type="button"
                onClick={() => navigate(`/super-admin/tenants/${tenantId}`)}
                className="
                  max-w-[220px]
                  truncate
                  cursor-pointer
                  text-blue-500
                  transition
                  hover:text-blue-600
                "
              >
                {companyName}
              </button>

              <span className="text-slate-300">/</span>

              <span className="text-slate-700">Edit Admin</span>
            </div>

            {/* page heading */}

            <div
              className="
                mb-5
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <h1
                  className="
                    text-2xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  Edit Admin
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update admin information, subscription and feature access.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="
                  inline-flex
                  h-10
                  w-fit
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-slate-600
                  shadow-sm
                  transition
                  hover:bg-slate-50
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </button>
            </div>

            {/* tenant summary */}

            <div
              className="
                mb-5
                flex
                flex-col
                gap-3
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/60
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {companyName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {companyName}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {companyDomain}
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                Active Admin
              </span>
            </div>

            {/* edit form */}

            <form
              onSubmit={handleSaveChanges}
              className="
                w-full
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
              "
            >
              {/* company information */}

              <section
                className="
                  border-b
                  border-slate-100
                  p-5
                  sm:p-6
                  lg:p-7
                "
              >
                <SectionTitle
                  icon={<Building2 className="h-5 w-5 text-blue-500" />}
                  title="1. Company Information"
                />

                <div
                  className="
                    mt-6
                    grid
                    gap-5
                    lg:grid-cols-2
                  "
                >
                  <FormField
                    label="Company Name"
                    required
                    error={errors.companyName}
                    hint="This is the company/organization name."
                  >
                    <FormInput
                      value={companyName}
                      onChange={(event) => {
                        setCompanyName(event.target.value);

                        if (errors.companyName) {
                          setErrors((current) => ({
                            ...current,
                            companyName: "",
                          }));
                        }
                      }}
                      placeholder="Enter company name"
                      hasError={!!errors.companyName}
                    />
                  </FormField>

                  <FormField
                    label="Company Domain"
                    optional
                    hint="Used for identification and email links."
                  >
                    <FormInput
                      value={companyDomain}
                      onChange={(event) => setCompanyDomain(event.target.value)}
                      placeholder="Enter domain (e.g., acme.com)"
                    />
                  </FormField>
                </div>
              </section>

              {/* admin information */}

              <section
                className="
                  border-b
                  border-slate-100
                  p-5
                  sm:p-6
                  lg:p-7
                "
              >
                <SectionTitle
                  icon={<UserRound className="h-5 w-5 text-blue-500" />}
                  title="2. Admin Information"
                />

                <div
                  className="
                    mt-6
                    grid
                    gap-5
                    lg:grid-cols-2
                  "
                >
                  <FormField
                    label="Admin Name"
                    required
                    error={errors.adminName}
                  >
                    <FormInput
                      value={adminName}
                      onChange={(event) => {
                        setAdminName(event.target.value);

                        if (errors.adminName) {
                          setErrors((current) => ({
                            ...current,
                            adminName: "",
                          }));
                        }
                      }}
                      placeholder="Enter admin full name"
                      hasError={!!errors.adminName}
                    />
                  </FormField>

                  <FormField
                    label="Admin Email Address"
                    required
                    error={errors.adminEmail}
                    hint="This admin will be the primary admin account."
                  >
                    <FormInput
                      type="email"
                      value={adminEmail}
                      onChange={(event) => {
                        setAdminEmail(event.target.value);

                        if (errors.adminEmail) {
                          setErrors((current) => ({
                            ...current,
                            adminEmail: "",
                          }));
                        }
                      }}
                      placeholder="Enter admin email address"
                      hasError={!!errors.adminEmail}
                    />
                  </FormField>
                </div>
              </section>

              {/* plan + feature flags */}

              <section
                className="
                  grid
                  lg:grid-cols-[0.82fr_1.18fr]
                "
              >
                {/* plan override */}

                <div
                  className="
                    border-b
                    border-slate-100
                    p-5
                    sm:p-6
                    lg:border-b-0
                    lg:border-r
                    lg:p-7
                  "
                >
                  <div className="flex items-start gap-3">
                    <SectionIcon>
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </SectionIcon>

                    <div>
                      <h2 className="text-base font-semibold text-slate-800">
                        3. Plan Override & Trial
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Update the current plan or trial period for this admin.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <FormField label="Select Plan" required error={errors.plan}>
                      <FormSelect
                        value={plan}
                        onChange={(value) => {
                          setPlan(value);

                          if (errors.plan) {
                            setErrors((current) => ({
                              ...current,
                              plan: "",
                            }));
                          }
                        }}
                        options={planOptions}
                        hasError={!!errors.plan}
                      />
                    </FormField>

                    <FormField
                      label={
                        <span className="inline-flex items-center gap-2">
                          Trial Length
                          <Info className="h-3.5 w-3.5 text-slate-400" />
                        </span>
                      }
                      hint="Changing the trial length will affect the admin's current trial configuration."
                    >
                      <FormSelect
                        value={trialLength}
                        onChange={setTrialLength}
                        options={TRIAL_OPTIONS}
                      />
                    </FormField>
                  </div>
                </div>

                {/* feature flags */}

                <div className="p-5 sm:p-6 lg:p-7">
                  <SectionTitle
                    icon={<Flag className="h-5 w-5 text-blue-500" />}
                    title="4. Feature Flags"
                    titleClassName="text-blue-600"
                    description="Enable or disable feature access for this admin."
                  />

                  <div
                    className="
                      mt-7
                      grid
                      gap-x-10
                      gap-y-6
                      sm:grid-cols-2
                    "
                  >
                    <FeatureToggle
                      label="AI Conversations"
                      checked={featureFlags.aiConversations}
                      onChange={() => handleFeatureToggle("aiConversations")}
                    />

                    <FeatureToggle
                      label="Advanced Analytics"
                      checked={featureFlags.advancedAnalytics}
                      onChange={() => handleFeatureToggle("advancedAnalytics")}
                    />

                    <FeatureToggle
                      label="Document AI"
                      checked={featureFlags.documentAI}
                      onChange={() => handleFeatureToggle("documentAI")}
                    />

                    <FeatureToggle
                      label="Custom Integrations"
                      checked={featureFlags.customIntegrations}
                      onChange={() => handleFeatureToggle("customIntegrations")}
                    />

                    <FeatureToggle
                      label="Summarization"
                      checked={featureFlags.summarization}
                      onChange={() => handleFeatureToggle("summarization")}
                    />

                    <FeatureToggle
                      label="Billing & Invoices"
                      checked={featureFlags.billingInvoices}
                      onChange={() => handleFeatureToggle("billingInvoices")}
                    />

                    <FeatureToggle
                      label="Translation"
                      checked={featureFlags.translation}
                      onChange={() => handleFeatureToggle("translation")}
                    />

                    <FeatureToggle
                      label="Audit Logs"
                      checked={featureFlags.auditLogs}
                      onChange={() => handleFeatureToggle("auditLogs")}
                    />
                  </div>
                </div>
              </section>

              {/* save section */}

              <section
                className="
                  border-t
                  border-slate-100
                  px-5
                  py-5
                  sm:px-6
                  lg:px-7
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Save admin changes
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Changes will be applied to this admin.
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      flex-col-reverse
                      gap-3
                      sm:flex-row
                    "
                  >
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="
                        h-11
                        cursor-pointer
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-6
                        text-sm
                        font-medium
                        text-slate-600
                        transition
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="
                        inline-flex
                        h-11
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-blue-500
                        px-6
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-blue-600
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {isSaving ? (
                        <>
                          <span
                            className="
                              h-4
                              w-4
                              animate-spin
                              rounded-full
                              border-2
                              border-white/40
                              border-t-white
                            "
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </form>

            {/* mobile note */}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Smartphone className="h-4 w-4" />

              <span>Mobile: Form sections stack for easier editing.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* section title */

function SectionTitle({
  icon,
  title,
  titleClassName = "text-slate-800",
  description,
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-blue-50
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h2
          className={`
            text-base
            font-semibold
            ${titleClassName}
          `}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

/* section icon */

function SectionIcon({ children }) {
  return (
    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-blue-50
      "
    >
      {children}
    </div>
  );
}

/* form field */

function FormField({ label, required, optional, error, hint, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}

        {optional && (
          <span className="ml-1 font-normal text-slate-400">(Optional)</span>
        )}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-5 text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

/* input */

function FormInput({ type = "text", value, onChange, placeholder, hasError }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        block
        h-11
        w-full
        rounded-xl
        border
        bg-white
        px-4
        text-sm
        text-slate-700
        outline-none
        transition
        placeholder:text-slate-400
        focus:ring-2
        ${
          hasError
            ? "border-red-400 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
        }
      `}
    />
  );
}

/* select */

function FormSelect({ value, onChange, options, hasError }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`
          block
          h-11
          w-full
          cursor-pointer
          appearance-none
          rounded-xl
          border
          bg-white
          px-4
          pr-10
          text-sm
          outline-none
          transition
          focus:ring-2
          ${
            hasError
              ? "border-red-400 text-slate-600 focus:border-red-400 focus:ring-red-100"
              : "border-slate-200 text-slate-600 focus:border-blue-300 focus:ring-blue-100"
          }
        `}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-slate-400
        "
      />
    </div>
  );
}

/* feature toggle */

function FeatureToggle({ label, checked, onChange }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-5">
      <span className="min-w-0 text-xs font-medium text-slate-700">
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
        onClick={onChange}
        className={`
          relative
          h-6
          w-11
          shrink-0
          cursor-pointer
          rounded-full
          p-0.5
          transition-colors
          duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-blue-200
          ${checked ? "bg-blue-500" : "bg-slate-200"}
        `}
      >
        <span
          className={`
            block
            h-5
            w-5
            rounded-full
            bg-white
            shadow-sm
            transition-transform
            duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}
