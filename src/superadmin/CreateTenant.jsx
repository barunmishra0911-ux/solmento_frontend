import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminRequest } from "@/lib/authApi";

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

export default function CreateTenant() {
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyHeight = document.body.style.height;
    const previousBodyPosition = document.body.style.position;
    const previousBodyInset = document.body.style.inset;
    const previousBodyWidth = document.body.style.width;

    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    html.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.position = "fixed";
    document.body.style.inset = "0";
    document.body.style.width = "100%";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.height = previousBodyHeight;
      document.body.style.position = previousBodyPosition;
      document.body.style.inset = previousBodyInset;
      document.body.style.width = previousBodyWidth;
    };
  }, []);

  /* form state */

  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [plan, setPlan] = useState("");
  const [trialLength, setTrialLength] = useState("14 days");

  const [featureFlags, setFeatureFlags] = useState({
    aiConversations: true,
    documentAI: true,
    summarization: true,
    translation: false,
    advancedAnalytics: true,
    customIntegrations: false,
    billingInvoices: true,
    auditLogs: true,
  });

  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  const [errors, setErrors] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    if (adminPassword.length < 8) {
      nextErrors.adminPassword = "Admin password must be at least 8 characters.";
    }

    if (!plan) {
      nextErrors.plan = "Please select a plan.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* create tenant */

  const handleCreateTenant = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setApiError("");
    setIsSaving(true);
    try {
      await createAdminRequest({ name: adminName.trim(), email: adminEmail.trim(), password: adminPassword, companyName: companyName.trim() });
      navigate("/super-admin/tenants");
    } catch (error) {
      setApiError(error.message || "Unable to create the admin account.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-slate-50">
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

        {/* scrollable main content */}

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-slate-50">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
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

              <span className="text-slate-700">Create Admin</span>
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
                  Create Admin
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new admin account and its company workspace to your platform.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/super-admin/tenants")}
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
                Back to Admins
              </button>
            </div>

            {/* main form */}

            <form
              onSubmit={handleCreateTenant}
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
              {apiError && <p className="mx-5 mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 sm:mx-6 lg:mx-7" role="alert">{apiError}</p>}
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
                  {/* company name */}

                  <FormField
                    label="Company Name"
                    required
                    error={errors.companyName}
                    hint="This will be the company/organization name."
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

                  {/* company domain */}

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
                  {/* admin name */}

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

                  {/* admin email */}

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

                  <FormField
                    label="Admin Password"
                    required
                    error={errors.adminPassword}
                    hint="The admin can change this after signing in."
                  >
                    <FormInput
                      type="password"
                      value={adminPassword}
                      onChange={(event) => {
                        setAdminPassword(event.target.value);
                        if (errors.adminPassword) setErrors((current) => ({ ...current, adminPassword: "" }));
                      }}
                      placeholder="Set a secure password"
                      hasError={!!errors.adminPassword}
                    />
                  </FormField>
                </div>
              </section>

              {/* plan and feature flags */}

              <section
                className="
                  grid
                  lg:grid-cols-[0.82fr_1.18fr]
                "
              >
                {/* plan */}

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
                  <SectionTitle
                    icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                    title="3. Plan & Trial"
                  />

                  <div className="mt-6 space-y-5">
                    {/* select plan */}

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
                        placeholder="Choose a plan"
                        options={["Starter", "Professional", "Enterprise"]}
                        hasError={!!errors.plan}
                      />
                    </FormField>

                    {/* trial length */}

                    <FormField
                      label={
                        <span className="inline-flex items-center gap-2">
                          Trial Length
                          <Info className="h-3.5 w-3.5 text-slate-400" />
                        </span>
                      }
                      hint="Trial access will be provided to the admin account."
                    >
                      <FormSelect
                        value={trialLength}
                        onChange={setTrialLength}
                        options={["7 days", "14 days", "30 days", "No trial"]}
                      />
                    </FormField>
                  </div>
                </div>

                {/* feature flags */}

                <div className="p-5 sm:p-6 lg:p-7">
                  <SectionTitle
                    icon={<Flag className="h-5 w-5 text-blue-500" />}
                    title="4. Initial Feature Flags"
                    titleClassName="text-blue-600"
                    description="Enable or disable features for this admin."
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

              {/* bottom action section */}

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
                    gap-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
                >
                  {/* welcome email */}

                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={sendWelcomeEmail}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() =>
                      setSendWelcomeEmail((current) => !current)
                    }
                    className="
                      flex
                      cursor-pointer
                      items-start
                      gap-3
                      text-left
                      focus:outline-none
                    "
                  >
                    <span
                      className={`
                        mt-0.5
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        border
                        transition
                        ${
                          sendWelcomeEmail
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-300 bg-white"
                        }
                      `}
                    >
                      {sendWelcomeEmail && (
                        <Check className="h-3.5 w-3.5 text-white" />
                      )}
                    </span>

                    <span>
                      <span className="block text-sm font-medium text-slate-700">
                        Send welcome email to admin
                      </span>

                      <span className="mt-0.5 block text-xs text-slate-400">
                        An email with login credentials and onboarding info will
                        be sent.
                      </span>
                    </span>
                  </button>

                  {/* buttons */}

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
                      onClick={() => navigate("/super-admin/tenants")}
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
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-200
                      "
                    >
                      <Users className="h-4 w-4" />
                      {isSaving ? "Creating..." : "Create Admin"}
                    </button>
                  </div>
                </div>
              </section>
            </form>

            {/* responsive note */}

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Smartphone className="h-4 w-4" />

              <span>
                Mobile: Form becomes a multi-step flow for better experience.
              </span>
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

function FormSelect({ value, onChange, placeholder, options, hasError }) {
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
        {placeholder && <option value="">{placeholder}</option>}

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
