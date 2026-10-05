import { useState } from "react";
import { Plus, Search, Filter, Eye, Send, CheckCircle2, Clock, XCircle, AlertCircle, FileText } from "lucide-react";
import { MOCK_CAMPAIGNS } from "./campaignsMockData";

const STATUS_STYLES = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Sending: "bg-blue-50 text-blue-700 border-blue-200",
  Scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function CampaignList({ onNavigate, routerNavigate }) {
  const [activeTab, setActiveTab] = useState("All Campaigns");
  const [searchText, setSearchText] = useState("");

  const handleCreateNew = () => {
    if (routerNavigate) routerNavigate("/app/campaigns/create");
    else if (onNavigate) onNavigate("campaignBuilder");
  };

  const handleViewDetails = (id) => {
    if (routerNavigate) routerNavigate(`/app/campaigns/${id}`);
    else if (onNavigate) onNavigate("campaignDetails");
  };

  const filteredCampaigns = MOCK_CAMPAIGNS.filter((item) => {
    const matchesTab =
      activeTab === "All Campaigns" ? true : item.status === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.audience.toLowerCase().includes(searchText.toLowerCase()) ||
      item.template.toLowerCase().includes(searchText.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-slate-900 w-full min-w-0">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, manage and track your marketing campaigns.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition shrink-0"
        >
          <Plus size={16} />
          Create Campaign
        </button>
      </div>

      {/* Main Table Card Container with Blue -> Violet Top Gradient Accent */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Blue to Violet Top Gradient Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        {/* Tabs and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-3.5 sm:p-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1">
            {["All Campaigns", "Draft", "Scheduled", "Sending", "Completed", "Cancelled"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Campaign Table - Optimized for Desktop without Horizontal Scroll */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible">
          <table className="w-full text-left text-xs text-slate-700 table-fixed min-w-[900px] lg:min-w-0">
            {/* Header with Professional Blue Background and White Text */}
            <thead className="bg-blue-600 text-white text-[11px] font-semibold tracking-wider uppercase">
              <tr>
                <th className="px-3 py-3 w-[22%]">CAMPAIGN NAME</th>
                <th className="px-2.5 py-3 w-[15%]">AUDIENCE</th>
                <th className="px-2.5 py-3 w-[12%]">TEMPLATE</th>
                <th className="px-2.5 py-3 w-[10%]">STATUS</th>
                <th className="px-2 py-3 text-right w-[6%]">SENT</th>
                <th className="px-2 py-3 text-right w-[7%]">DELIVERED</th>
                <th className="px-2 py-3 text-right w-[6%]">READ</th>
                <th className="px-2 py-3 text-right w-[6%]">REPLIED</th>
                <th className="px-2.5 py-3 text-center w-[9%]">CREATED ON</th>
                <th className="px-3 py-3 text-center w-[7%]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No campaigns found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="px-3 py-3.5 font-semibold text-slate-950 truncate">
                      <div className="truncate font-bold text-slate-900" title={item.name}>{item.name}</div>
                      <div className="mt-0.5 text-[11px] font-normal text-slate-500 truncate" title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td className="px-2.5 py-3.5 text-slate-700 truncate" title={item.audience}>
                      {item.audience}
                    </td>
                    <td className="px-2.5 py-3.5 truncate">
                      <span className="inline-block truncate max-w-full rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 border border-slate-200" title={item.template}>
                        {item.template}
                      </span>
                    </td>
                    <td className="px-2.5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          STATUS_STYLES[item.status] || "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-3.5 text-right font-medium">
                      {item.sent ? item.sent.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-3.5 text-right font-medium text-emerald-600">
                      {item.delivered ? item.delivered.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-3.5 text-right font-medium text-blue-600">
                      {item.read ? item.read.toLocaleString() : "—"}
                    </td>
                    <td className="px-2 py-3.5 text-right font-medium text-purple-600">
                      {item.replied ? item.replied.toLocaleString() : "—"}
                    </td>
                    <td className="px-2.5 py-3.5 text-center text-slate-500 whitespace-nowrap text-[11px]">
                      {item.createdOn}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <button
                        onClick={() => handleViewDetails(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 transition"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
