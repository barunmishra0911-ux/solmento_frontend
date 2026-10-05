import { useState } from "react";
import {
  Check,
  ChevronRight,
  Lightbulb,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import { MOCK_AUDIENCE_GROUPS, MOCK_TEMPLATES } from "./campaignsMockData";

export default function CreateCampaign({ onNavigate, routerNavigate }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State
  const [campaignName, setCampaignName] = useState("B.Tech Admissions October 2026");
  const [campaignDescription, setCampaignDescription] = useState(
    "Promotional campaign for upcoming B.Tech admissions with special offer."
  );

  // Step 2 State
  const [audienceTab, setAudienceTab] = useState("Saved Groups");
  const [audienceSearch, setAudienceSearch] = useState("");
  const [groups, setGroups] = useState(MOCK_AUDIENCE_GROUPS);

  // Step 3 State
  const [selectedTemplateId, setSelectedTemplateId] = useState("admission_offer");
  const [var1, setVar1] = useState("John");
  const [var2, setVar2] = useState("B.Tech");
  const [var3, setVar3] = useState("10% OFF");

  // Step 4 State
  const [scheduleType, setScheduleType] = useState("now"); // 'now' or 'later'
  const [scheduleDate, setScheduleDate] = useState("2026-09-25");
  const [scheduleTime, setScheduleTime] = useState("18:00");

  // Toast / Demo Success State
  const [showDemoToast, setShowDemoToast] = useState(false);

  const selectedAudience = groups.find((g) => g.checked);
  const selectedTemplate =
    MOCK_TEMPLATES.find((t) => t.id === selectedTemplateId) || MOCK_TEMPLATES[0];

  const handleGroupToggle = (id) => {
    setGroups(
      groups.map((g) => ({
        ...g,
        checked: g.id === id,
      }))
    );
  };

  const handleCancel = () => {
    if (routerNavigate) routerNavigate("/app/campaigns");
    else if (onNavigate) onNavigate("campaigns");
  };

  const handleSendCampaign = () => {
    setShowDemoToast(true);
    setTimeout(() => {
      if (routerNavigate) routerNavigate("/app/campaigns/campaign-1");
      else if (onNavigate) onNavigate("campaignDetails");
    }, 1500);
  };

  const selectedRecipientsCount = selectedAudience
    ? selectedAudience.count.toLocaleString()
    : "2,850";

  return (
    <div className="flex flex-col gap-6 text-slate-900 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {showDemoToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg animate-bounce">
          <CheckCircle2 size={18} />
          Campaign created successfully (Demo)
        </div>
      )}

      {/* Step Header Banner */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-md">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-xs font-bold text-xl">
          {currentStep}
        </div>
        <div>
          <h1 className="text-xl font-bold">
            {currentStep === 1 && "Step 1: Campaign Basics"}
            {currentStep === 2 && "Step 2: Select Audience"}
            {currentStep === 3 && "Step 3: Create Message"}
            {currentStep === 4 && "Step 4: Schedule Campaign"}
            {currentStep === 5 && "Step 5: Review & Confirm"}
          </h1>
          <p className="mt-0.5 text-xs text-blue-100">
            {currentStep === 1 && "Set the basic details for your campaign."}
            {currentStep === 2 && "Choose the recipients for your campaign."}
            {currentStep === 3 && "Select an approved template and customize it."}
            {currentStep === 4 && "Choose when to send your campaign."}
            {currentStep === 5 && "Review all details before sending."}
          </p>
        </div>
      </div>

      {/* Main Stepper Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Vertical Stepper Navigation */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <nav className="flex flex-col gap-1">
            {[
              { num: 1, label: "Basics" },
              { num: 2, label: "Audience" },
              { num: 3, label: "Message" },
              { num: 4, label: "Schedule" },
              { num: 5, label: "Review" },
            ].map((s) => {
              const isCurrent = currentStep === s.num;
              const isCompleted = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isCurrent
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <Check size={13} /> : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Step Content Container */}
        <div className="md:col-span-3 flex flex-col gap-5">
          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Blue to Violet Top Gradient Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                <div className="p-6 flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                    Campaign Details
                  </h2>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Campaign Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. B.Tech Admissions October 2026"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Campaign Description (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={campaignDescription}
                      onChange={(e) => setCampaignDescription(e.target.value)}
                      placeholder="Brief description of this campaign..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <button
                      onClick={handleCancel}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Callout Tip Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-800">
                <Lightbulb size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Give a clear name and description so you can easily identify this campaign later.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Blue to Violet Top Gradient Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                <div className="p-6 flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                    Select Recipients
                  </h2>

                  {/* Audience Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    {["Saved Groups", "Filters", "Upload CSV"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAudienceTab(tab)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          audienceTab === tab
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Group Selection */}
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={audienceSearch}
                      onChange={(e) => setAudienceSearch(e.target.value)}
                      placeholder="Search groups..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />

                    <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
                      {groups.map((group) => (
                        <label
                          key={group.id}
                          className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={group.checked}
                            onChange={() => handleGroupToggle(group.id)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-800 flex-1">
                            {group.name}
                          </span>
                          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            ({group.count.toLocaleString()})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Callout Tip Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-800">
                <Users size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  You can select a saved group, use filters or upload a CSV file to choose your target audience.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: MESSAGE */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Blue to Violet Top Gradient Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                <div className="p-6 flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                    Message Template
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Controls */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Select Approved Template <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                          >
                            {MOCK_TEMPLATES.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            Approved
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Template Variables
                        </h3>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-slate-600">
                            1. Student Name <span className="font-mono text-slate-400">{"{{1}}"}</span>
                          </label>
                          <input
                            type="text"
                            value={var1}
                            onChange={(e) => setVar1(e.target.value)}
                            placeholder="e.g. John"
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-slate-600">
                            2. Course Name <span className="font-mono text-slate-400">{"{{2}}"}</span>
                          </label>
                          <input
                            type="text"
                            value={var2}
                            onChange={(e) => setVar2(e.target.value)}
                            placeholder="e.g. B.Tech"
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold text-slate-600">
                            3. Offer Details <span className="font-mono text-slate-400">{"{{3}}"}</span>
                          </label>
                          <input
                            type="text"
                            value={var3}
                            onChange={(e) => setVar3(e.target.value)}
                            placeholder="e.g. 10% OFF"
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right WhatsApp Preview */}
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-700">Message Preview</span>
                      <div className="rounded-2xl border border-slate-200 bg-[#efeae2] p-4 min-h-[220px] flex flex-col justify-between shadow-inner">
                        <div className="rounded-xl bg-white p-3.5 shadow-sm text-xs text-slate-800 leading-relaxed whitespace-pre-line border border-slate-100">
                          Hi {var1 || "John"},
                          {"\n\n"}
                          Exciting news! 🎉
                          {"\n"}
                          Get {var3 || "10% OFF"} on {var2 || "B.Tech"} admissions for the upcoming session.
                          {"\n\n"}
                          Click below to know more or reply for counselling.
                          <div className="mt-2 text-right text-[10px] font-medium text-slate-400 flex items-center justify-end gap-1">
                            11:30 AM <span className="text-blue-500 font-bold">✓✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Callout Tip Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-xs text-purple-800">
                <MessageSquare size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Only approved WhatsApp templates can be used. Fill the variables to personalize the message for each recipient.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Blue to Violet Top Gradient Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                <div className="p-6 flex flex-col gap-5">
                  <h2 className="text-base font-bold text-slate-950 border-b border-slate-100 pb-3">
                    Schedule Options
                  </h2>

                  <div className="flex flex-col gap-3">
                    <label
                      onClick={() => setScheduleType("now")}
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                        scheduleType === "now"
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="schedule"
                        checked={scheduleType === "now"}
                        onChange={() => setScheduleType("now")}
                        className="mt-0.5 h-4 w-4 text-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Send Now</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          Start sending immediately after confirmation.
                        </div>
                      </div>
                    </label>

                    <label
                      onClick={() => setScheduleType("later")}
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                        scheduleType === "later"
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="schedule"
                        checked={scheduleType === "later"}
                        onChange={() => setScheduleType("later")}
                        className="mt-0.5 h-4 w-4 text-blue-600"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Schedule for Later</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          Choose a specific date and time to start this campaign.
                        </div>
                      </div>
                    </label>
                  </div>

                  {scheduleType === "later" && (
                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 mt-1">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Date</label>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Time</label>
                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Callout Tip Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-xs text-amber-800">
                <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <span>Send the campaign now or schedule it for a later date and time.</span>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                {/* Blue to Violet Top Gradient Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                <div className="p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-950">Campaign Summary</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100 text-xs">
                    <div className="grid grid-cols-3 py-2.5">
                      <span className="font-semibold text-slate-500">Campaign Name:</span>
                      <span className="col-span-2 font-bold text-slate-900">{campaignName}</span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5">
                      <span className="font-semibold text-slate-500">Description:</span>
                      <span className="col-span-2 text-slate-700">{campaignDescription}</span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5">
                      <span className="font-semibold text-slate-500">Audience:</span>
                      <span className="col-span-2 font-medium text-slate-800">
                        {selectedAudience ? selectedAudience.name : "B.Tech Interested"} ({selectedRecipientsCount} leads)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5">
                      <span className="font-semibold text-slate-500">Template:</span>
                      <span className="col-span-2 font-mono text-slate-800">
                        {selectedTemplate.name} (Approved)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5">
                      <span className="font-semibold text-slate-500">Schedule:</span>
                      <span className="col-span-2 text-slate-800">
                        {scheduleType === "now" ? (
                          "Send Now"
                        ) : (
                          `Scheduled (${scheduleDate}, ${scheduleTime})`
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-2.5">
                      <span className="font-semibold text-slate-500">Estimated Recipients:</span>
                      <span className="col-span-2 font-bold text-blue-600 text-sm">
                        {selectedRecipientsCount}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSendCampaign}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <Send size={15} />
                      Send Campaign
                    </button>
                  </div>
                </div>
              </div>

              {/* Callout Tip Box */}
              <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-xs text-rose-800">
                <CheckCircle2 size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Review all the details carefully. Click 'Send Campaign' to start.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
