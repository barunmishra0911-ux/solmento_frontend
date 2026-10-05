import { useState } from "react";

import { Activity, ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";

import LeftSidebar from "./LeftSidebar";
import SuperAdminHeader from "./SuperAdminHeader";

const sectionRows = [
  {
    name: "BrightMind University",
    status: "Active",
    detail: "Last updated 2h ago",
  },
  {
    name: "EduCore Institute",
    status: "Active",
    detail: "Last updated 5h ago",
  },
  {
    name: "NextGen College",
    status: "Review",
    detail: "Last updated 1d ago",
  },
];

export default function SuperAdminBasicPage({
  title,
  description = "Manage this section from the super admin workspace.",
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
          <div className="mx-auto max-w-[1800px] px-4 py-5 sm:px-5 lg:px-7 lg:py-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>

              <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
                {description}
              </p>
            </div>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">Ready</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">Records</p>
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">248</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Last Sync
                  </p>
                  <Clock3 className="h-5 w-5 text-violet-500" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">Today</p>
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Items
                </h2>

                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>

              <div className="divide-y divide-slate-100">
                {sectionRows.map((row) => (
                  <div
                    key={row.name}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {row.name}
                      </p>
                      <p className="text-sm text-slate-500">{row.detail}</p>
                    </div>

                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
