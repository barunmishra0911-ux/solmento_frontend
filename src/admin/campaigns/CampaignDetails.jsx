import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, Send, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import { MOCK_CAMPAIGNS, MOCK_RECIPIENT_STATUSES } from "./campaignsMockData";

const RECIPIENT_STATUS_STYLES = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Read: "bg-blue-50 text-blue-700 border-blue-200",
  Replied: "bg-purple-50 text-purple-700 border-purple-200",
  Failed: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function CampaignDetails({ onNavigate, routerNavigate }) {
  const campaign = MOCK_CAMPAIGNS[0]; // B.Tech Admissions October 2026

  const handleBack = () => {
    if (routerNavigate) routerNavigate("/app/campaigns");
    else if (onNavigate) onNavigate("campaigns");
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900 max-w-6xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                {campaign.name}
              </h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                {campaign.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{campaign.description}</p>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
        >
          View Details / Back
        </button>
      </div>

      {/* 6 Stat Cards Grid with Distinct Top Border Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total — Blue Top Border & Light Blue Background */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-2xs flex flex-col justify-between overflow-hidden border-t-4 border-t-blue-600">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Total
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-700">
            {campaign.sent.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-blue-500 font-semibold">Total Recipients</div>
        </div>

        {/* Sent — Distinct Cyan/Sky Blue Top Border */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 shadow-2xs flex flex-col justify-between overflow-hidden border-t-4 border-t-sky-500">
          <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
            Sent
          </div>
          <div className="mt-2 text-2xl font-extrabold text-sky-700">
            {campaign.sent.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] text-sky-500">100% Outbound</div>
        </div>

        {/* Delivered — Emerald Green Top Border */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs flex flex-col justify-between overflow-hidden border-t-4 border-t-emerald-500">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Delivered
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">
            {campaign.delivered.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-emerald-600">
            93% Success
          </div>
        </div>

        {/* Read — Indigo/Purple Top Border */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-2xs flex flex-col justify-between overflow-hidden border-t-4 border-t-indigo-600">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Read
          </div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-700">
            {campaign.read.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-indigo-600">
            74% Read Rate
          </div>
        </div>

        {/* Replied — Magenta/Purple Top Border */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-2xs flex flex-col justify-between overflow-hidden border-t-4 border-t-purple-600">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
            Replied
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-700">
            {campaign.replied.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-purple-600">
            12% Response
          </div>
        </div>

        {/* Failed — Red Top Border */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 shadow-2xs flex flex-col justify-between overflow-hidden border-t-4 border-t-rose-500">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Failed
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700">
            {campaign.failed}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-rose-600">
            1% Bounce Rate
          </div>
        </div>
      </div>

      {/* Recipient Status Table Card with Blue to Violet Top Accent */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Blue to Violet Top Gradient Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-bold text-slate-950">Recipient Status</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Live delivery status for individual target contacts.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {MOCK_RECIPIENT_STATUSES.length} Sample Recipients
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            {/* Professional Blue Background + White Text Header */}
            <thead className="bg-blue-600 text-white text-[11px] font-semibold tracking-wider uppercase">
              <tr>
                <th className="px-5 py-3.5">NAME</th>
                <th className="px-4 py-3.5">PHONE NUMBER</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5">SENT AT</th>
                <th className="px-4 py-3.5">DELIVERED AT</th>
                <th className="px-4 py-3.5">READ AT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_RECIPIENT_STATUSES.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-semibold text-slate-950">
                    {r.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600">{r.phone}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                        RECIPIENT_STATUS_STYLES[r.status] ||
                        "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{r.sentAt}</td>
                  <td className="px-4 py-3.5 text-slate-500">{r.deliveredAt}</td>
                  <td className="px-4 py-3.5 text-slate-500">{r.readAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
