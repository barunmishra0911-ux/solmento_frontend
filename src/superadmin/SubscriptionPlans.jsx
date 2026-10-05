import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  Building2,
  CheckCircle2,
  Edit3,
  Crown,
  Rocket,
  Send,
} from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import { listPlansRequest } from "@/lib/authApi";

/*
  Subscription plan data

  Later, when backend/API is connected,
  this array can be replaced with API data.
*/
const plans = [
  {
    id: 1,
    name: "Starter",
    description: "Perfect for startups",
    price: "₹8,299",
    interval: "month",
    tenantCount: "Up to 5 tenants",
    icon: Send,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderTopColor: "border-t-emerald-500",
    buttonColor:
      "border-emerald-500 bg-emerald-500 text-white hover:border-emerald-600 hover:bg-emerald-600",

    limits: [
      "10,000 AI Tokens / month",
      "1,000 Messages / month",
      "500 Voice Minutes / month",
      "5,000 Contacts",
      "10 GB Storage",
      "Email Support",
    ],
  },
  {
    id: 2,
    name: "Pro",
    description: "Great for growing teams",
    price: "₹24,999",
    interval: "month",
    tenantCount: "Up to 20 tenants",
    icon: Rocket,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    borderTopColor: "border-t-blue-500",
    buttonColor:
      "border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600",
    limits: [
      "50,000 AI Tokens / month",
      "5,000 Messages / month",
      "2,000 Voice Minutes / month",
      "20,000 Contacts",
      "100 GB Storage",
      "Priority Email Support",
    ],
  },
  {
    id: 3,
    name: "Business",
    description: "For established businesses",
    price: "₹49,999",
    interval: "month",
    tenantCount: "Up to 50 tenants",
    icon: Building2,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    borderTopColor: "border-t-violet-500",
    buttonColor:
      "border-violet-500 bg-violet-500 text-white hover:border-violet-600 hover:bg-violet-600",
    popular: true,
    limits: [
      "150,000 AI Tokens / month",
      "15,000 Messages / month",
      "5,000 Voice Minutes / month",
      "50,000 Contacts",
      "250 GB Storage",
      "Priority Support & SLAs",
    ],
  },
  {
    id: 4,
    name: "Enterprise",
    description: "For large organizations",
    price: "₹1,24,999",
    interval: "month",
    tenantCount: "Unlimited tenants",
    icon: Crown,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    borderTopColor: "border-t-orange-500",
    buttonColor:
      "border-orange-500 bg-orange-500 text-white hover:border-orange-600 hover:bg-orange-600",
    limits: [
      "500,000+ AI Tokens / month",
      "50,000+ Messages / month",
      "20,000+ Voice Minutes / month",
      "Unlimited Contacts",
      "1 TB+ Storage",
      "Dedicated Support & SLA",
    ],
  },
];

const PLAN_STORAGE_KEY = "super-admin-plan-edits";

function getStoredPlanEdits() {
  try {
    return JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function formatPlanPrice(value, fallback) {
  if (value === undefined || value === "") {
    return fallback;
  }

  const numericPrice = Number(value);

  if (Number.isNaN(numericPrice)) {
    return fallback;
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();

  //   for opening sidebar in mobile and tablets
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // desktop sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [serverPlans, setServerPlans] = useState(null);

  useEffect(() => {
    listPlansRequest().then(({ plans: savedPlans }) => setServerPlans(savedPlans || [])).catch(() => setServerPlans([]));
  }, []);

  const displayedPlans = useMemo(() => {
    const storedPlanEdits = getStoredPlanEdits();
    const sourcePlans = serverPlans?.length ? serverPlans.map((saved) => {
      const template = plans.find((plan) => plan.name.toLowerCase() === saved.name.toLowerCase()) || plans[0];
      const savedLimits = Object.entries(saved.limits || {}).map(([key, value]) => `${key}: ${value}`).slice(0, 8);
      return { ...template, id: saved.id, name: saved.name, description: saved.description || template.description, price: formatPlanPrice(saved.price, template.price), interval: saved.interval === "yearly" ? "year" : "month", limits: savedLimits.length ? savedLimits : template.limits };
    }) : plans;

    return sourcePlans.map((plan) => {
      const savedPlan = storedPlanEdits[plan.id];
      const savedLimits = Array.isArray(savedPlan?.includedPoints)
        ? savedPlan.includedPoints.map((point) => point.trim()).filter(Boolean)
        : [];

      if (!savedPlan) {
        return plan;
      }

      return {
        ...plan,
        name: savedPlan.name || plan.name,
        description: savedPlan.description || plan.description,
        price: formatPlanPrice(savedPlan.price, plan.price),
        interval: savedPlan.interval === "yearly" ? "year" : plan.interval,
        limits: savedLimits.length > 0 ? savedLimits : plan.limits,
      };
    });
  }, [serverPlans]);

  const handleCreatePlan = () => {
    navigate("/super-admin/plans/new");
  };

  const handleEditPlan = (planId) => {
    navigate(`/super-admin/plans/${planId}/edit`);
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

      {/* main content */}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* sidebar */}

        <LeftSidebar
          isDesktopOpen={isSidebarOpen}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            {/* page header */}

            <section className="mb-6">
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-end
                  lg:justify-between
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
                    Subscription Plans
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Manage subscription plans, pricing, tenant counts and key
                    limits for all tenants.
                  </p>
                </div>

                {/* actions */}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCreatePlan}
                    className="
                      inline-flex
                      h-10
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-500
                      px-4
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-blue-600
                    "
                  >
                    <span className="text-lg leading-none">+</span>
                    Create New Plan
                  </button>
                </div>
              </div>
            </section>

            {/* plan cards */}

            <section
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              {displayedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={() => handleEditPlan(plan.id)}
                />
              ))}
            </section>

            {/* information card */}

            <section
              className="
                mt-6
                rounded-2xl
                border
                border-blue-100
                bg-white
                px-5
                py-4
                shadow-sm
                sm:px-6
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-50
                  "
                >
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Subscription plan management
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Plans are displayed to tenants in the order configured by
                    the Super Admin.
                  </p>
                </div>
              </div>
            </section>

            {/* mobile note */}

            <p className="mt-5 text-center text-xs text-slate-400">
              Plans are optimized for desktop, tablet and mobile screens.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/*
  Reusable plan card
*/

function PlanCard({ plan, onEdit }) {
  const Icon = plan.icon;

  return (
    <article
      className={`
        relative
        flex
        min-h-[540px]
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-t-4
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-lg
        ${plan.borderTopColor}
      `}
    >
      {/* popular label */}

      {plan.popular && (
        <div
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-violet-100
            px-3
            py-1
            text-[10px]
            font-bold
            text-violet-600
          "
        >
          Most Popular
        </div>
      )}

      {/* card content */}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* top section */}

        <div className="flex items-start justify-between gap-3">
          <div
            className={`
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              ${plan.iconBg}
            `}
          >
            <Icon className={`h-5 w-5 ${plan.iconColor}`} />
          </div>

          <span
            className="
              rounded-full
              bg-emerald-50
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-emerald-600
            "
          >
            Active
          </span>
        </div>

        {/* plan name */}

        <div className="mt-5">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {plan.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
        </div>

        {/* pricing */}

        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {plan.price}
            </span>

            <span className="text-sm text-slate-500">/ {plan.interval}</span>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {plan.tenantCount}
          </p>
        </div>

        {/* divider */}

        <div className="my-5 h-px bg-slate-100" />

        {/* limits */}

        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Includes
          </p>

          <div className="mt-4 space-y-3">
            {plan.limits.map((limit) => (
              <div key={limit} className="flex items-start gap-2">
                <CheckCircle2
                  className={`
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    ${plan.iconColor}
                  `}
                />

                <span className="text-xs leading-5 text-slate-600">
                  {limit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* edit button */}

        <button
          type="button"
          onClick={onEdit}
          className={`  mt-6
            inline-flex
            h-10
            w-full
            cursor-pointer
            items-center
            justify-center
            gap-2
            rounded-xl
            border
          
            text-sm
            font-medium
           shadow-sm
           transition
           ${plan.buttonColor} `}
        >
          <Edit3 className="h-4 w-4" />
          Edit Plan
        </button>
      </div>
    </article>
  );
}
