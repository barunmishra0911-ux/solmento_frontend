import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminLogoutRequest } from "@/lib/authApi";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function SuperAdminHeader({
  isSidebarOpen = true,
  isMobileSidebarOpen = false,
  onSidebarToggle,
  onMobileSidebarToggle,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search admins, users, conversations...",
}) {
  const navigate = useNavigate();
  const [internalSearch, setInternalSearch] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const currentSearchValue = searchValue ?? internalSearch;

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const closeProfileMenuOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeProfileMenu);
    document.addEventListener("keydown", closeProfileMenuOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeProfileMenu);
      document.removeEventListener("keydown", closeProfileMenuOnEscape);
    };
  }, [isProfileMenuOpen]);

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;

    if (onSearchChange) {
      onSearchChange(nextValue);
      return;
    }

    setInternalSearch(nextValue);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearchSubmit?.(currentSearchValue.trim());
  };

  const navigateFromProfileMenu = (path) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await superAdminLogoutRequest().catch(() => undefined);
    localStorage.removeItem("superAdminUser");
    sessionStorage.removeItem("superAdminUser");
    setIsProfileMenuOpen(false);
    navigate("/auth/superadmin/login", { replace: true });
  };

  return (
    <header
      className="
        flex
        min-h-[76px]
        items-center
        justify-between
        gap-4
        border-b
        border-slate-200
        bg-white
        px-4
        relative
        z-40
        shadow-[0_1px_0_rgba(15,23,42,0.02)]
        sm:px-5
        lg:px-7
      "
    >
      <div className="flex min-w-0 items-center md:hidden">
        <p className="truncate text-lg font-bold tracking-tight text-slate-900">
          Solmento <span className="text-blue-500">AI</span>
        </p>
      </div>

      <div className="hidden min-w-0 items-center md:flex lg:hidden">
        <p className="truncate text-lg font-bold tracking-tight text-slate-900">
          Solmento <span className="text-blue-500">AI</span>
        </p>
      </div>

      <div className="hidden min-w-0 shrink-0 items-center gap-3 lg:flex">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-500
          "
        >
          <ShieldCheck className="h-5 w-5" />
        </div>

        <p className="truncate text-xl font-bold tracking-tight text-slate-900">
          Solmento <span className="text-blue-500">AI</span>
        </p>
      </div>

      <button
        type="button"
        aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        aria-pressed={!isSidebarOpen}
        onClick={onSidebarToggle}
        className="
          hidden
          h-11
          w-11
          shrink-0
          cursor-pointer
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-200
          bg-white
          text-slate-500
          shadow-sm
          transition
          hover:border-slate-300
          hover:bg-slate-50
          focus:outline-none
          focus:ring-4
          focus:ring-blue-100
          lg:flex
        "
      >
        <Menu className="h-5 w-5" />
      </button>

      <form
        onSubmit={handleSearchSubmit}
        className="relative hidden w-full max-w-2xl md:block md:min-w-0 md:flex-1 lg:flex-none"
      >
        <Search
          className="
            pointer-events-none
            absolute
            left-4
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-slate-400
          "
        />

        <input
          type="text"
          value={currentSearchValue}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="
            h-12
            w-full
            rounded-2xl
            border
            border-slate-200
            bg-white
            pl-11
            pr-4
            text-sm
            font-medium
            text-slate-700
            shadow-sm
            outline-none
            transition
            placeholder:text-slate-400
            hover:border-slate-300
            focus:border-blue-300
            focus:ring-4
            focus:ring-blue-100
          "
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Search"
          className="
            flex
            h-11
            w-11
            cursor-pointer
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:border-slate-300
            hover:bg-slate-50
            md:hidden
          "
        >
          <Search className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="
            relative
            flex
            h-11
            w-11
            cursor-pointer
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:border-slate-300
            hover:bg-slate-50
          "
        >
          <Bell className="h-4 w-4" />

          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              border-2
              border-white
              bg-blue-500
              px-1
              text-[10px]
              font-bold
              leading-none
              text-white
            "
          >
            12
          </span>
        </button>

        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            className="
              flex
              cursor-pointer
              items-center
              gap-2.5
              rounded-2xl
              border
              border-slate-200
              bg-white
              py-1.5
              pl-1.5
              pr-2.5
              shadow-sm
              transition
              hover:border-slate-300
              hover:bg-slate-50
              focus:outline-none
              focus:ring-4
              focus:ring-blue-100
            "
          >
            <span
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-100
                text-xs
                font-bold
                text-blue-600
              "
            >
              SA
            </span>

            <span className="hidden text-sm font-semibold text-slate-900 sm:block">
              Super Admin
            </span>

            <ChevronDown
              className={`hidden h-4 w-4 text-slate-400 transition-transform sm:block ${
                isProfileMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProfileMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => navigateFromProfileMenu("/super-admin/profile")}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <UserRound className="h-4 w-4 text-slate-400" />
                Profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => navigateFromProfileMenu("/super-admin/settings")}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
          aria-pressed={isMobileSidebarOpen}
          onClick={onMobileSidebarToggle}
          className="
            flex
            h-11
            w-11
            cursor-pointer
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:border-slate-300
            hover:bg-slate-50
            focus:outline-none
            focus:ring-4
            focus:ring-blue-100
            md:hidden
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
          aria-pressed={isMobileSidebarOpen}
          onClick={onMobileSidebarToggle}
          className="
            hidden
            h-11
            w-11
            cursor-pointer
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            text-slate-500
            shadow-sm
            transition
            hover:border-slate-300
            hover:bg-slate-50
            focus:outline-none
            focus:ring-4
            focus:ring-blue-100
            md:flex
            lg:hidden
          "
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
