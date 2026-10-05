import { useEffect, useState } from "react";

import {
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

export default function LeftSidebar({
  isDesktopOpen = true,
  isMobileOpen = false,
  onMobileClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  /*
    Subscription section automatically opens
    when user is inside Plans, Subscriptions, or Payments.
  */
  const [subscriptionsOpen, setSubscriptionsOpen] = useState(
    location.pathname === "/super-admin/plans" ||
      location.pathname === "/super-admin/subscriptions" ||
      location.pathname === "/super-admin/payments",
  );

  /*
    Keep subscription menu open when the route
    changes to a subscription management page.
  */
  useEffect(() => {
    if (
      location.pathname === "/super-admin/plans" ||
      location.pathname === "/super-admin/subscriptions" ||
      location.pathname === "/super-admin/payments"
    ) {
      setSubscriptionsOpen(true);
    }
  }, [location.pathname]);

  /*
    Main sidebar items.

    IMPORTANT:
    Subscriptions is intentionally placed
    at position #3.
  */
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/super-admin/dashboard",
    },
    {
      label: "Admin",
      icon: Building2,
      path: "/super-admin/tenants",
    },
    {
      label: "Subscriptions",
      icon: CreditCard,
      isSubscription: true,
    },
    {
      label: "Users",
      icon: Users,
      path: "/super-admin/users",
    },
    {
      label: "AI Usage",
      icon: BarChart3,
      path: "/super-admin/ai-usage",
    },
    {
      label: "Conversations",
      icon: MessageSquare,
      path: "/super-admin/conversations",
    },
    {
      label: "Tickets",
      icon: Ticket,
      path: "/super-admin/tickets",
    },
    {
      label: "Billing",
      icon: CreditCard,
      path: "/super-admin/billing",
    },
      {
        label: "Audit Logs",
        icon: FileText,
        path: "/super-admin/audit-logs",
      },
      {
        label: "Invoices",
        icon: FileText,
        path: "/super-admin/invoices",
      },
      {
        label: "Announcements",
        icon: Bell,
        path: "/super-admin/announcements",
      },
      {
        label: "System Health",
        icon: ShieldCheck,
        path: "/super-admin/system-health",
      },
      {
        label: "Provider Settings",
        icon: Settings,
        path: "/super-admin/provider/ai",
      },
      {
        label: "Platform Users",
        icon: Users,
        path: "/super-admin/platform-users",
      },
      {
        label: "Platform Roles",
        icon: ShieldCheck,
        path: "/super-admin/platform-roles",
      },
      {
        label: "Permissions",
        icon: ShieldCheck,
        path: "/super-admin/platform-permissions",
      },
      {
        label: "Global Analytics",
        icon: BarChart3,
        path: "/super-admin/global-analytics",
      },
      {
        label: "Impersonation",
        icon: Users,
        path: "/super-admin/impersonation",
      },
    {
      label: "Settings",
      icon: Settings,
      path: "/super-admin/settings",
    },
  ];

  /*
    Check active state for normal menu items.
  */
  const isMenuItemActive = (item) => {
    if (!item.path) {
      return false;
    }

    /*
      All tenant-related pages keep
      the Tenants item active.
    */
    if (item.path === "/super-admin/tenants") {
      return location.pathname.startsWith("/super-admin/tenants");
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  /*
    Subscription parent active state.
  */
  const isSubscriptionsActive =
    location.pathname === "/super-admin/plans" ||
    location.pathname === "/super-admin/subscriptions" ||
    location.pathname === "/super-admin/payments";

  /*
    Normal navigation.
  */
  const handleMenuItemClick = (item, closeAfterClick = false) => {
    if (item.path) {
      navigate(item.path);
    }

    if (closeAfterClick) {
      onMobileClose?.();
    }
  };

  /*
    Plans navigation.
  */
  const handlePlansClick = (closeAfterClick = false) => {
    navigate("/super-admin/plans");

    if (closeAfterClick) {
      onMobileClose?.();
    }
  };

  /*
    Subscription list navigation.
  */
  const handleSubscriptionsClick = (closeAfterClick = false) => {
    navigate("/super-admin/subscriptions");

    if (closeAfterClick) {
      onMobileClose?.();
    }
  };

  const handlePaymentsClick = (closeAfterClick = false) => {
    navigate("/super-admin/payments");

    if (closeAfterClick) {
      onMobileClose?.();
    }
  };

  /*
    Reusable menu renderer
    for both desktop and mobile.
  */
  const renderMenuItems = (closeAfterClick = false) => {
    return (
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          /*
            Special rendering for Subscriptions.
          */
          if (item.isSubscription) {
            return (
              <div key={item.label}>
                {/* subscriptions parent */}

                <button
                  type="button"
                  onClick={() => setSubscriptionsOpen((current) => !current)}
                  className={`
                    flex
                    w-full
                    cursor-pointer
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-left
                    text-sm
                    transition-all
                    duration-200
                    ${
                      isSubscriptionsActive
                        ? "font-semibold text-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />

                    <span>Subscriptions</span>
                  </div>

                  <ChevronDown
                    className={`
                      h-4
                      w-4
                      shrink-0
                      transition-transform
                      duration-200
                      ${subscriptionsOpen ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {/* subscription children */}

                {subscriptionsOpen && (
                  <div className="ml-7 mt-1 space-y-1">
                    {/* Plans */}

                    <button
                      type="button"
                      onClick={() => handlePlansClick(closeAfterClick)}
                      className={`
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-lg
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        transition-all
                        duration-200
                        ${
                          location.pathname === "/super-admin/plans"
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

                      <span>Plans</span>
                    </button>

                    {/* Subscriptions */}

                    <button
                      type="button"
                      onClick={() => handleSubscriptionsClick(closeAfterClick)}
                      className={`
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-lg
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        transition-all
                        duration-200
                        ${
                          location.pathname === "/super-admin/subscriptions"
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

                      <span>Subscriptions</span>
                    </button>

                    {/* Payments */}

                    <button
                      type="button"
                      onClick={() => handlePaymentsClick(closeAfterClick)}
                      className={`
                        flex
                        w-full
                        cursor-pointer
                        items-center
                        gap-3
                        rounded-lg
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        transition-all
                        duration-200
                        ${
                          location.pathname === "/super-admin/payments"
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

                      <span>Payments</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          /*
            Normal menu item.
          */
          const isActive = isMenuItemActive(item);

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleMenuItemClick(item, closeAfterClick)}
              className={`
                flex
                w-full
                cursor-pointer
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-left
                text-sm
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />

              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  /*
    Sidebar footer.
  */
  const sidebarFooter = (
    <div className="space-y-4 px-4 pb-5">
      {/* AI token card */}

      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            AI Tokens (Today)
          </p>

          <BarChart3 className="h-4 w-4 text-blue-500" />
        </div>

        <p className="mt-3 text-lg font-bold text-slate-900">245,820</p>

        <p className="text-[11px] text-slate-500">49% used</p>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[49%] rounded-full bg-blue-500" />
        </div>
      </div>

      {/* plan card */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-800">Enterprise Plan</p>

        <p className="mt-1 text-[11px] text-slate-500">Renews on Jun 1, 2026</p>

        <button
          type="button"
          className="
            mt-4
            w-full
            cursor-pointer
            rounded-lg
            bg-slate-50
            py-2
            text-xs
            font-semibold
            text-blue-500
            transition
            hover:bg-blue-50
          "
        >
          View Plan
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ================================================= */}
      {/* Desktop Sidebar */}
      {/* ================================================= */}

      {isDesktopOpen && (
        <aside
          className="
            hidden
            h-full
            w-60
            shrink-0
            overflow-hidden
            border-r
            border-slate-200
            bg-white
            lg:flex
            lg:flex-col
          "
        >
          <div className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col">
              {/* navigation */}

              <nav className="flex-1 px-3 pt-6">{renderMenuItems()}</nav>

              {/* footer */}

              {sidebarFooter}
            </div>
          </div>
        </aside>
      )}

      {/* ================================================= */}
      {/* Mobile Sidebar */}
      {/* ================================================= */}

      <div
        aria-hidden={!isMobileOpen}
        className={`
          fixed
          inset-0
          z-50
          lg:hidden
          ${isMobileOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
      >
        {/* overlay */}

        <button
          type="button"
          aria-label="Close menu"
          onClick={onMobileClose}
          className={`
            absolute
            inset-0
            cursor-default
            bg-slate-900/35
            transition-opacity
            duration-300
            ${isMobileOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* mobile drawer */}

        <aside
          className={`
            absolute
            right-0
            top-0
            flex
            h-dvh
            w-72
            max-w-[82vw]
            flex-col
            overflow-hidden
            border-l
            border-slate-200
            bg-white
            shadow-2xl
            transition-transform
            duration-300
            ease-out
            ${isMobileOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* mobile header */}

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <p className="text-lg font-bold tracking-tight text-slate-900">
              Solmento <span className="text-blue-500">AI</span>
            </p>

            <button
              type="button"
              aria-label="Close menu"
              onClick={onMobileClose}
              className="
                flex
                h-9
                w-9
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                text-slate-500
                transition
                hover:bg-slate-50
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* mobile content */}

          <div className="sidebar-scrollbar min-h-0 flex-1 overflow-y-auto">
            <div className="flex min-h-full flex-col">
              <nav className="flex-1 px-3 py-4">{renderMenuItems(true)}</nav>

              <div className="shrink-0">{sidebarFooter}</div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
