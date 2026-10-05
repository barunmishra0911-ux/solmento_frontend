import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flag,
  ListChecks,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";

import "./PlanWizard.css";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { listPlansRequest, updatePlanRequest } from "@/lib/authApi";

/*
  Default form state.

  Keep the structure API-friendly so the same object
  can later be sent to your backend API.
*/
const initialForm = {
  name: "",
  description: "",
  price: "",
  interval: "monthly",

  limits: {
    users: "",
    chatbots: "",
    aiMessages: "",
    aiTokens: "",
    voiceMinutes: "",
    calls: "",
    whatsappMessages: "",
    contacts: "",
    campaigns: "",
    storage: "",
    knowledgeBaseDocs: "",
  },

  features: {
    voiceCalling: false,
    workflows: false,
    apiAccess: false,
    whiteLabel: false,
  },

  includedPoints: [
    "10,000 AI Tokens / month",
    "1,000 Messages / month",
    "500 Voice Minutes / month",
    "5,000 Contacts",
    "10 GB Storage",
    "Email Support",
  ],
};

/*
  Demo plans.

  In the future, replace this object lookup with:
  GET /api/plans/:planId
*/
const existingPlans = {
  1: {
    name: "Starter",
    description: "Perfect for startups",
    price: "8299",
    interval: "monthly",
    limits: {
      users: "5",
      chatbots: "2",
      aiMessages: "1000",
      aiTokens: "10000",
      voiceMinutes: "500",
      calls: "100",
      whatsappMessages: "1000",
      contacts: "5000",
      campaigns: "10",
      storage: "10",
      knowledgeBaseDocs: "100",
    },
    features: {
      voiceCalling: false,
      workflows: false,
      apiAccess: false,
      whiteLabel: false,
    },
  },

  2: {
    name: "Pro",
    description: "Great for growing teams",
    price: "24999",
    interval: "monthly",
    limits: {
      users: "20",
      chatbots: "10",
      aiMessages: "5000",
      aiTokens: "50000",
      voiceMinutes: "2000",
      calls: "1000",
      whatsappMessages: "10000",
      contacts: "20000",
      campaigns: "50",
      storage: "100",
      knowledgeBaseDocs: "500",
    },
    features: {
      voiceCalling: true,
      workflows: true,
      apiAccess: true,
      whiteLabel: true,
    },
  },

  3: {
    name: "Business",
    description: "For established businesses",
    price: "49999",
    interval: "monthly",
    limits: {
      users: "50",
      chatbots: "25",
      aiMessages: "15000",
      aiTokens: "150000",
      voiceMinutes: "5000",
      calls: "2500",
      whatsappMessages: "25000",
      contacts: "50000",
      campaigns: "100",
      storage: "250",
      knowledgeBaseDocs: "1000",
    },
    features: {
      voiceCalling: true,
      workflows: true,
      apiAccess: true,
      whiteLabel: true,
    },
  },

  4: {
    name: "Enterprise",
    description: "For large organizations",
    price: "124999",
    interval: "monthly",
    limits: {
      users: "200",
      chatbots: "100",
      aiMessages: "50000",
      aiTokens: "500000",
      voiceMinutes: "20000",
      calls: "10000",
      whatsappMessages: "100000",
      contacts: "Unlimited",
      campaigns: "500",
      storage: "1000",
      knowledgeBaseDocs: "5000",
    },
    features: {
      voiceCalling: true,
      workflows: true,
      apiAccess: true,
      whiteLabel: true,
    },
  },
};

const PLAN_STORAGE_KEY = "super-admin-plan-edits";
const MAX_INCLUDED_POINTS = 15;

const defaultIncludedPoints = {
  1: [
    "10,000 AI Tokens / month",
    "1,000 Messages / month",
    "500 Voice Minutes / month",
    "5,000 Contacts",
    "10 GB Storage",
    "Email Support",
  ],
  2: [
    "50,000 AI Tokens / month",
    "5,000 Messages / month",
    "2,000 Voice Minutes / month",
    "20,000 Contacts",
    "100 GB Storage",
    "Priority Email Support",
  ],
  3: [
    "150,000 AI Tokens / month",
    "15,000 Messages / month",
    "5,000 Voice Minutes / month",
    "50,000 Contacts",
    "250 GB Storage",
    "Priority Support & SLAs",
  ],
  4: [
    "500,000+ AI Tokens / month",
    "50,000+ Messages / month",
    "20,000+ Voice Minutes / month",
    "Unlimited Contacts",
    "1 TB+ Storage",
    "Dedicated Support & SLA",
  ],
};

function getStoredPlanEdits() {
  try {
    return JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/*
  Plan limit fields.
*/
const limitFields = [
  {
    key: "users",
    label: "Users",
    unit: "Users",
  },
  {
    key: "chatbots",
    label: "Chatbots",
    unit: "Chatbots",
  },
  {
    key: "aiMessages",
    label: "AI Messages (per month)",
    unit: "Messages",
  },
  {
    key: "aiTokens",
    label: "AI Tokens (per month)",
    unit: "Tokens",
  },
  {
    key: "voiceMinutes",
    label: "Voice Minutes (per month)",
    unit: "Minutes",
  },
  {
    key: "calls",
    label: "Calls (per month)",
    unit: "Calls",
  },
  {
    key: "whatsappMessages",
    label: "WhatsApp Messages (per month)",
    unit: "Messages",
  },
  {
    key: "contacts",
    label: "Contacts",
    unit: "Contacts",
  },
  {
    key: "campaigns",
    label: "Campaigns (per month)",
    unit: "Campaigns",
  },
  {
    key: "storage",
    label: "Storage",
    unit: "GB",
  },
  {
    key: "knowledgeBaseDocs",
    label: "Knowledge Base Docs",
    unit: "Documents",
  },
];

/*
  Internal form steps.

  The active step always shows its number.
  A completed step shows a check mark only when
  it is not the current/active step.
*/
const steps = [
  {
    id: 1,
    title: "Basic Info",
    description: "Plan details",
    icon: FileText,
  },
  {
    id: 2,
    title: "Limits",
    description: "Set plan limits",
    icon: BarChart3,
  },
  {
    id: 3,
    title: "Includes",
    description: "Edit plan points",
    icon: Flag,
  },
  {
    id: 4,
    title: "Review",
    description: "Review & update",
    icon: ListChecks,
  },
];

export default function EditPlan() {
  const navigate = useNavigate();
  const { planId } = useParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [planNotFound, setPlanNotFound] = useState(false);

  /*
    currentStep controls which step is currently selected.
    This is also what makes a completed step turn back
    into a number when the user returns to it.
  */
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [direction, setDirection] = useState("next");
  const [isSaving, setIsSaving] = useState(false);

  const goToStep = (stepId) => {
    setDirection(stepId < currentStep ? "prev" : "next");
    setStepError("");
    setCurrentStep(stepId);
  };

  /* Load the selected plan from the Super Admin plans API. */
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    const numericPlanId = Number(planId);
    const savedPlan = getStoredPlanEdits()[numericPlanId];

    listPlansRequest()
      .then(({ plans: serverPlans = [] }) => {
        if (!active) return;

        const serverPlan = serverPlans.find((item) => item.id === numericPlanId);
        const localPlan = existingPlans[numericPlanId];

        // The plans page uses database IDs. Load any server-created plan (such
        // as Enterprise ID 7) instead of assuming it is one of the four demo IDs.
        const selectedPlan = serverPlan
          ? {
              ...serverPlan,
              price: String(serverPlan.price ?? ""),
              interval: serverPlan.interval || "monthly",
              limits: Object.fromEntries(
                Object.entries(serverPlan.limits || {}).map(([key, value]) => [key, String(value)]),
              ),
            }
          : localPlan;

        if (!selectedPlan) {
          setPlanNotFound(true);
          setIsLoading(false);
          return;
        }

        const fallbackIncludedPoints =
          defaultIncludedPoints[numericPlanId] ||
          Object.entries(selectedPlan.limits || {})
            .filter(([, value]) => value !== "")
            .slice(0, MAX_INCLUDED_POINTS)
            .map(([key, value]) => `${key}: ${value}`);
        const planToEdit = {
          ...selectedPlan,
          ...savedPlan,
          limits: {
            ...selectedPlan.limits,
            ...savedPlan?.limits,
          },
        };

        setPlanNotFound(false);
        setForm({
          name: planToEdit.name,
          description: planToEdit.description || "",
          price: String(planToEdit.price ?? ""),
          interval: planToEdit.interval || "monthly",
          limits: {
            ...initialForm.limits,
            ...planToEdit.limits,
          },
          features: {
            ...initialForm.features,
            ...planToEdit.features,
          },
          includedPoints: Array.isArray(planToEdit.includedPoints)
            ? [...planToEdit.includedPoints]
            : fallbackIncludedPoints,
        });

        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        const localPlan = existingPlans[numericPlanId];
        if (!localPlan) {
          setPlanNotFound(true);
          setIsLoading(false);
          return;
        }
        setForm({
          ...initialForm,
          ...localPlan,
          limits: { ...initialForm.limits, ...localPlan.limits },
          features: { ...initialForm.features, ...localPlan.features },
          includedPoints: [...(defaultIncludedPoints[numericPlanId] || [])],
        });
        setPlanNotFound(false);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [planId]);

  /*
    Refs are used to scroll to the selected section.
  */
  const sectionRefs = useRef({});

  useEffect(() => {
    const section = sectionRefs.current[currentStep];
    section?.focus({ preventScroll: true });
    section?.scrollIntoView({ block: "nearest" });
  }, [currentStep]);

  const basicTextError = useMemo(() => {
    if (!/\p{L}/u.test(form.name) || /\p{N}/u.test(form.name)) {
      return "Plan name must contain letters and must not contain numbers.";
    }
    if (
      form.description.trim() &&
      (!/\p{L}/u.test(form.description) || /\p{N}/u.test(form.description))
    ) {
      return "Description must contain letters and must not contain numbers.";
    }
    return "";
  }, [form.name, form.description]);

  const isBasicInfoComplete = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      basicTextError === "" &&
      form.price !== "" &&
      Number.isFinite(Number(form.price)) &&
      Number(form.price) >= 0 &&
      ["monthly", "yearly"].includes(form.interval)
    );
  }, [form.name, form.price, form.interval, basicTextError]);

  const isLimitsComplete = useMemo(() => {
    return limitFields.every((field) => form.limits[field.key] !== "");
  }, [form.limits]);

  const cleanIncludedPoints = useMemo(() => {
    return form.includedPoints.map((point) => point.trim()).filter(Boolean);
  }, [form.includedPoints]);

  const isIncludedPointsComplete = cleanIncludedPoints.length > 0;

  /*
    Step 4 is intentionally kept incomplete until the
    plan is submitted. The review step is still selectable.
  */
  const completedSteps = useMemo(() => {
    const completed = [];

    if (currentStep > 1 && isBasicInfoComplete) {
      completed.push(1);
    }

    if (currentStep > 2 && isLimitsComplete) {
      completed.push(2);
    }

    if (currentStep > 3 && isIncludedPointsComplete) {
      completed.push(3);
    }

    return completed;
  }, [
    currentStep,
    isBasicInfoComplete,
    isLimitsComplete,
    isIncludedPointsComplete,
  ]);

  /*
    Select a step and scroll to its section.

    Notice that we DO NOT delete the step from completedSteps.
    Instead, the UI hides the check while the step is active.
    This gives the exact behavior you requested:
      completed -> check
      active -> number
  */
  const handleStepClick = (stepId) => {
    if (stepId > currentStep) return;
    goToStep(stepId);
  };

  const setSectionRef = (stepId, element) => {
    sectionRefs.current[stepId] = element;
  };

  const handleBasicChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLimitChange = (key, value) => {
    const numericValue = value.replace(/\D/g, "");

    setForm((current) => ({
      ...current,
      limits: {
        ...current.limits,
        [key]: numericValue,
      },
    }));
  };

  const handleIncludedPointChange = (index, value) => {
    setCurrentStep(3);

    setForm((current) => ({
      ...current,
      includedPoints: current.includedPoints.map((point, pointIndex) =>
        pointIndex === index ? value : point,
      ),
    }));
  };

  const handleAddIncludedPoint = () => {
    setCurrentStep(3);

    setForm((current) => {
      if (current.includedPoints.length >= MAX_INCLUDED_POINTS) {
        return current;
      }

      return {
        ...current,
        includedPoints: [...current.includedPoints, ""],
      };
    });
  };

  const handleRemoveIncludedPoint = (index) => {
    setCurrentStep(3);

    setForm((current) => {
      const includedPoints = current.includedPoints.filter(
        (_, pointIndex) => pointIndex !== index,
      );

      return {
        ...current,
        includedPoints: includedPoints.length > 0 ? includedPoints : [""],
      };
    });
  };

  const validateStep = (stepId) => {
    if (stepId === 1 && basicTextError) return basicTextError;
    if (stepId === 1 && !isBasicInfoComplete) {
      return "Enter a plan name, a valid non-negative price and a billing interval.";
    }
    if (stepId === 2 && !isLimitsComplete) {
      return "Fill in every plan limit. Enter 0 for resources that are not included.";
    }
    if (stepId === 3 && !isIncludedPointsComplete) {
      return "Add at least one non-empty included point.";
    }
    return "";
  };

  const validateBeforeSubmit = () => {
    for (let step = 1; step <= 3; step += 1) {
      const error = validateStep(step);
      if (error) {
        goToStep(step);
        setStepError(error);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }
    goToStep(Math.min(currentStep + 1, 4));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (currentStep < 4) {
      handleNext();
      return;
    }

    if (!validateBeforeSubmit()) {
      return;
    }

    const updatedPlan = {
      ...form,
      includedPoints: cleanIncludedPoints,
    };
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updatePlanRequest(planId, updatedPlan);
      const storedPlanEdits = getStoredPlanEdits();
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ ...storedPlanEdits, [Number(planId)]: updatedPlan }));
      navigate("/super-admin/plans");
    } catch (error) {
      setStepError(error.message || "Unable to update plan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-800">
            Loading plan...
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Please wait while the plan details are loaded.
          </p>
        </div>
      </div>
    );
  }

  if (planNotFound) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Plan not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The subscription plan you are trying to edit does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/super-admin/plans")}
            className="
              mt-5
              inline-flex
              h-10
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-500
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-600
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

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
        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            {/* breadcrumb */}

            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => navigate("/super-admin/plans")}
                className="cursor-pointer text-blue-500 transition hover:text-blue-600"
              >
                Subscriptions
              </button>

              <span className="text-slate-300">›</span>

              <button
                type="button"
                onClick={() => navigate("/super-admin/plans")}
                className="cursor-pointer text-blue-500 transition hover:text-blue-600"
              >
                Plans
              </button>

              <span className="text-slate-300">›</span>

              <span className="text-slate-600">Edit Plan</span>
            </div>

            {/* heading */}

            <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Edit Plan
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update plan details, limits and features for your tenants.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/super-admin/plans")}
                className="
                  inline-flex
                  h-10
                  w-fit
                  cursor-pointer
                  items-center
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
                Back to Plans
              </button>
            </section>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
                {/* ======================================= */}
                {/* INTERNAL STEP NAVIGATION                  */}
                {/* ======================================= */}

                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-5">
                  <div className="mb-4 flex items-center gap-2 px-2">
                    <Settings2 className="h-4 w-4 text-blue-500" />

                    <p className="text-sm font-semibold text-slate-800">
                      Plan Setup
                    </p>
                  </div>

                  <div className="relative">
                    {/* vertical line */}

                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-200" />

                    <div className="relative space-y-2">
                      {steps.map((step) => {
                        const isActive = currentStep === step.id;

                        const isCompleted =
                          completedSteps.includes(step.id) && !isActive;

                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => handleStepClick(step.id)}
                            disabled={step.id > currentStep}
                            aria-current={isActive ? "step" : undefined}
                            className={`
                              relative
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                              flex
                              w-full
                              cursor-pointer
                              items-start
                              gap-3
                              rounded-xl
                              p-2
                              text-left
                              transition
                              ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}
                            `}
                          >
                            {/* step circle */}

                            <span
                              className={`
                                relative
                                z-10
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                text-xs
                                font-semibold
                                transition
                                ${
                                  isCompleted
                                    ? "border-blue-500 bg-blue-500 text-white"
                                    : isActive
                                      ? "border-blue-500 bg-blue-500 text-white"
                                      : "border-slate-200 bg-white text-slate-500"
                                }
                              `}
                            >
                              {isCompleted ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                step.id
                              )}
                            </span>

                            <span className="min-w-0 pt-0.5">
                              <span
                                className={`
                                  block
                                  text-xs
                                  font-semibold
                                  ${
                                    isActive || isCompleted
                                      ? "text-blue-600"
                                      : "text-slate-600"
                                  }
                                `}
                              >
                                {step.title}
                              </span>

                              <span className="mt-1 block text-[10px] leading-4 text-slate-400">
                                {step.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* small progress summary */}

                  <div className="mt-5 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-500">
                        Progress
                      </span>

                      <span className="text-[10px] font-semibold text-blue-600">
                        {completedSteps.length}/3
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${(completedSteps.length / 3) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </aside>

                {/* ======================================= */}
                {/* FORM CONTENT                              */}
                {/* ======================================= */}

                <div className="min-w-0 space-y-5">
                  {/* ============================== */}
                  {/* Basic Information               */}
                  {/* ============================== */}

                  {currentStep === 1 && (
                    <section
                      key={1}
                      tabIndex={-1}
                      aria-label="Step 1 of 4"
                      ref={(element) => setSectionRef(1, element)}
                      className={`plan-wizard-panel plan-wizard-${direction} scroll-mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none`}
                    >
                      <SectionHeader
                        icon={FileText}
                        title="Basic Information"
                        description="Define the plan name, pricing and billing interval."
                        active={currentStep === 1}
                        complete={isBasicInfoComplete}
                      />

                      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
                        <FormField label="Plan Name" required>
                          <input
                            name="name"
                            value={form.name}
                            onChange={handleBasicChange}
                            onFocus={() => setCurrentStep(1)}
                            placeholder="e.g. Pro Plan"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            required
                          />
                        </FormField>

                        <FormField label="Short Description">
                          <input
                            name="description"
                            value={form.description}
                            onChange={handleBasicChange}
                            onFocus={() => setCurrentStep(1)}
                            placeholder="Brief description of the plan"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </FormField>

                        <FormField label="Price" required>
                          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
                              ₹
                            </span>

                            <input
                              name="price"
                              type="number"
                              min="0"
                              step="0.01"
                              value={form.price}
                              onChange={handleBasicChange}
                              onFocus={() => setCurrentStep(1)}
                              placeholder="0.00"
                              className="
                              min-w-0
                              flex-1
                              bg-transparent
                              px-4
                              py-3
                              text-sm
                              text-slate-900
                              outline-none
                              placeholder:text-slate-400
                            "
                              required
                            />
                          </div>
                        </FormField>

                        <FormField label="Billing Interval" required>
                          <SelectInput
                            value={form.interval}
                            onChange={(value) => {
                              setCurrentStep(1);

                              setForm((current) => ({
                                ...current,
                                interval: value,
                              }));
                            }}
                            options={[
                              {
                                value: "monthly",
                                label: "Monthly",
                              },
                              {
                                value: "yearly",
                                label: "Yearly",
                              },
                            ]}
                          />
                        </FormField>
                      </div>
                    </section>
                  )}

                  {/* ============================== */}
                  {/* Plan Limits                     */}
                  {/* ============================== */}

                  {currentStep === 2 && (
                    <section
                      key={2}
                      tabIndex={-1}
                      aria-label="Step 2 of 4"
                      ref={(element) => setSectionRef(2, element)}
                      className={`plan-wizard-panel plan-wizard-${direction} scroll-mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none`}
                    >
                      <SectionHeader
                        icon={BarChart3}
                        title="Plan Limits"
                        description="Set the maximum resources included with this plan."
                        active={currentStep === 2}
                        complete={isLimitsComplete}
                      />

                      <div className="p-5 sm:p-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {limitFields.map((field) => (
                            <div
                              key={field.key}
                              className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                            >
                              <label className="mb-2 block text-xs font-semibold text-slate-700">
                                {field.label}
                              </label>

                              <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={form.limits[field.key]}
                                  onChange={(event) =>
                                    handleLimitChange(
                                      field.key,
                                      event.target.value,
                                    )
                                  }
                                  onFocus={() => setCurrentStep(2)}
                                  placeholder="0"
                                  className="
                                  min-w-0
                                  flex-1
                                  bg-transparent
                                  px-3
                                  py-2.5
                                  text-sm
                                  text-slate-900
                                  outline-none
                                  placeholder:text-slate-400
                                "
                                />

                                <div className="flex min-w-[105px] items-center justify-between border-l border-slate-200 bg-slate-50 px-3">
                                  <span className="text-xs text-slate-500">
                                    {field.unit}
                                  </span>

                                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                          <p className="text-xs leading-5 text-slate-500">
                            Enter the included resource limit for each item. Use{" "}
                            <strong>0</strong> when a resource should not be
                            included.
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* ============================== */}
                  {/* Included Points                 */}
                  {/* ============================== */}

                  {currentStep === 3 && (
                    <section
                      key={3}
                      tabIndex={-1}
                      aria-label="Step 3 of 4"
                      ref={(element) => setSectionRef(3, element)}
                      className={`plan-wizard-panel plan-wizard-${direction} scroll-mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none`}
                    >
                      <SectionHeader
                        icon={Flag}
                        title="Included Points"
                        description={`Edit the bullets shown on the plan card. You can add up to ${MAX_INCLUDED_POINTS} points.`}
                        active={currentStep === 3}
                        complete={isIncludedPointsComplete}
                      />

                      <div className="space-y-4 p-5 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs font-medium text-slate-500">
                            {cleanIncludedPoints.length}/{MAX_INCLUDED_POINTS}{" "}
                            points
                          </p>

                          <button
                            type="button"
                            onClick={handleAddIncludedPoint}
                            disabled={
                              form.includedPoints.length >= MAX_INCLUDED_POINTS
                            }
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
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                          >
                            <Plus className="h-4 w-4" />
                            Add Point
                          </button>
                        </div>

                        <div className="space-y-3">
                          {form.includedPoints.map((point, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-600">
                                {index + 1}
                              </span>

                              <input
                                type="text"
                                value={point}
                                onChange={(event) =>
                                  handleIncludedPointChange(
                                    index,
                                    event.target.value,
                                  )
                                }
                                onFocus={() => setCurrentStep(3)}
                                placeholder="Enter a feaure or benefit included in this plan"
                                maxLength={80}
                                className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />

                              <button
                                type="button"
                                onClick={() => handleRemoveIncludedPoint(index)}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                aria-label={`Remove point ${index + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* ============================== */}
                  {/* Review                           */}
                  {/* ============================== */}

                  {currentStep === 4 && (
                    <section
                      key={4}
                      tabIndex={-1}
                      aria-label="Step 4 of 4"
                      ref={(element) => setSectionRef(4, element)}
                      className={`plan-wizard-panel plan-wizard-${direction} scroll-mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm outline-none`}
                    >
                      <SectionHeader
                        icon={ListChecks}
                        title="Review"
                        description="Review your changes before updating the plan."
                        active={currentStep === 4}
                        complete={false}
                      />

                      <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
                        <ReviewItem
                          label="Plan Name"
                          value={form.name.trim() || "Not provided"}
                        />

                        <ReviewItem
                          label="Price"
                          value={
                            form.price
                              ? `₹${Number(form.price).toLocaleString("en-IN")}`
                              : "₹0"
                          }
                        />

                        <ReviewItem
                          label="Billing Interval"
                          value={
                            form.interval === "monthly" ? "Monthly" : "Yearly"
                          }
                        />

                        <ReviewItem
                          label="Included Points"
                          value={`${cleanIncludedPoints.length} of ${MAX_INCLUDED_POINTS}`}
                        />
                      </div>
                    </section>
                  )}

                  {/* ============================== */}
                  {/* Actions                          */}
                  {/* ============================== */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    {stepError && (
                      <p role="alert" className="mb-4 text-sm text-red-600">
                        {stepError}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={currentStep === 1}
                        onClick={() => goToStep(Math.max(currentStep - 1, 1))}
                        className="cursor-pointer rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
                      >
                        {isSaving ? "Saving…" : currentStep === 4 ? "Update Plan" : "Save & Next"}
                      </button>
                    </div>
                  </div>

                  <p className="pb-3 text-center text-xs text-slate-400">
                    Your entries are kept while moving between steps. Submit the
                    plan on Review.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ========================================= */
/* Section header                             */
/* ========================================= */

function SectionHeader({ icon: Icon, title, description, active, complete }) {
  return (
    <div
      className={`
        flex
        items-start
        gap-3
        border-b
        border-slate-100
        px-5
        py-4
        transition
        sm:px-6
        ${active ? "bg-blue-50/40" : ""}
      `}
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          ${complete ? "bg-emerald-50" : "bg-blue-50"}
        `}
      >
        {complete ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Icon className="h-4 w-4 text-blue-500" />
        )}
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

/* ========================================= */
/* Form field                                */
/* ========================================= */

function FormField({ label, required = false, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

/* ========================================= */
/* Select                                    */
/* ========================================= */

function SelectInput({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-11
          w-full
          cursor-pointer
          appearance-none
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          pr-10
          text-sm
          text-slate-700
          outline-none
          transition
          hover:bg-slate-50
          focus:border-blue-400
          focus:ring-2
          focus:ring-blue-100
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* ========================================= */
/* Review item                               */

function ReviewItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
