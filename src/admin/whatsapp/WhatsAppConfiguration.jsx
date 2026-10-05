import { useState, useEffect } from "react";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  Building2,
  Phone,
  Hash,
  Webhook,
  ExternalLink,
  KeyRound,
  Info,
} from "lucide-react";
import {
  getWhatsAppConfigRequest,
  saveWhatsAppConfigRequest,
} from "@/lib/authApi";
import { showToast } from "@/lib/toast";
import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppConfiguration({ onNavigate, routerNavigate }) {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedVerifyToken, setCopiedVerifyToken] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const [formData, setFormData] = useState({
    businessName: "",
    phoneNumber: "",
    phoneNumberId: "",
    wabaId: "",
    accessToken: "",
    webhookVerifyToken: "solmento_whatsapp_verify_token",
  });

  const handleBack = () => {
    if (typeof onNavigate === "function") {
      onNavigate("whatsapp");
    } else if (typeof routerNavigate === "function") {
      routerNavigate("/app/whatsapp");
    } else {
      window.location.href = "/app/whatsapp";
    }
  };

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const cfg = await getWhatsAppConfigRequest();
      setConfig(cfg);
      if (cfg) {
        setFormData({
          businessName: cfg.businessName || "",
          phoneNumber: cfg.phoneNumber || "",
          phoneNumberId: cfg.phoneNumberId || "",
          wabaId: cfg.wabaId || "",
          accessToken: "", // keep empty by default to prevent exposing token
          webhookVerifyToken:
            cfg.webhookVerifyToken || "solmento_whatsapp_verify_token",
        });
      }
    } catch (err) {
      console.error("Failed to load WhatsApp config:", err);
      setFeedback({
        type: "error",
        message: err.message || "Failed to load WhatsApp configuration.",
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !formData.phoneNumber.trim() || !formData.phoneNumberId.trim()) {
      setFeedback({
        type: "error",
        message: "Business Name, Phone Number, and Phone Number ID are required.",
      });
      return;
    }

    setSavingConfig(true);
    setFeedback({ type: null, message: "" });

    try {
      const updated = await saveWhatsAppConfigRequest(formData);
      setConfig(updated);
      setFormData((prev) => ({
        ...prev,
        businessName: updated.businessName || prev.businessName,
        phoneNumber: updated.phoneNumber || prev.phoneNumber,
        phoneNumberId: updated.phoneNumberId || prev.phoneNumberId,
        wabaId: updated.wabaId || prev.wabaId,
        accessToken: "", // reset input after save for credential safety
        webhookVerifyToken:
          updated.webhookVerifyToken || prev.webhookVerifyToken,
      }));
      setFeedback({
        type: "success",
        message: "WhatsApp configuration saved successfully!",
      });
      showToast.success("WhatsApp configuration saved successfully!");
      setTimeout(() => {
        handleBack();
      }, 500);
    } catch (err) {
      console.error("Failed to save WhatsApp config:", err);
      const errMsg = err.message || "Failed to update WhatsApp configuration.";
      setFeedback({
        type: "error",
        message: errMsg,
      });
      showToast.error(errMsg);
      setSavingConfig(false);
    }
  };

  const webhookCallbackUrl = `${window.location.origin}/api/public/whatsapp/webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookCallbackUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const copyVerifyToken = () => {
    navigator.clipboard.writeText(formData.webhookVerifyToken);
    setCopiedVerifyToken(true);
    setTimeout(() => setCopiedVerifyToken(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Back to WhatsApp
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <WhatsAppIcon size={20} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                WhatsApp Configuration
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage your WhatsApp Business API connection and integration credentials.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadConfig}
            disabled={loadingConfig || savingConfig}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loadingConfig ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Global Feedback Banner (Errors only) */}
      {feedback.message && feedback.type !== "success" && (
        <div className="flex items-start gap-3 rounded-2xl p-4 text-sm shadow-sm transition border border-rose-200 bg-rose-50 text-rose-900">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback({ type: null, message: "" })}
            className="text-slate-400 hover:text-slate-600"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* SECTION 1: Connection Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                config?.connected
                  ? "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <WhatsAppIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">
                  Connection Status
                </h2>
                {loadingConfig ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    <Loader2 size={12} className="animate-spin" /> Checking
                  </span>
                ) : config?.connected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    🟢 Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                    🔴 Disconnected / Not Configured
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {config?.connected
                  ? `Active connection with Meta Graph API for ${config.businessName || "WhatsApp Business"}`
                  : "Connect your Meta WhatsApp Cloud API credentials to activate messaging."}
              </p>
            </div>
          </div>
        </div>

        {/* Status details grid */}
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Business
            </span>
            <p className="mt-0.5 text-sm font-semibold text-slate-900 truncate">
              {config?.businessName || (loadingConfig ? "..." : "—")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Phone Number
            </span>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {config?.phoneNumber || (loadingConfig ? "..." : "—")}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Connection State
            </span>
            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-700">
              {config?.status || (config?.connected ? "CONNECTED" : "DISCONNECTED")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 2: Business Information Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <Building2 size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Business Information
              </h2>
              <p className="text-xs text-slate-500">
                Display name and phone number associated with your WhatsApp business profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="e.g. Test Number or Solmento University"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                The name of your organization or WhatsApp business profile.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Phone Number (Display) <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="e.g. +1 555-165-4987 or +91 91510 17315"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                The sender WhatsApp number visible to users and leads.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 3: Meta WhatsApp Configuration Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
              <Hash size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Meta WhatsApp Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Meta Graph API identifiers for your WhatsApp Business Account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Phone Number ID (Meta Graph API) <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  required
                  value={formData.phoneNumberId}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumberId: e.target.value })
                  }
                  placeholder="e.g. 1269538182917342"
                  className="h-11 w-full font-mono rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Used by Meta Graph API for WhatsApp messaging. Available in Meta App Dashboard → WhatsApp → API Setup.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                WABA ID (WhatsApp Business Account ID)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={formData.wabaId}
                  onChange={(e) =>
                    setFormData({ ...formData, wabaId: e.target.value })
                  }
                  placeholder="e.g. 29116575444615720"
                  className="h-11 w-full font-mono rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                WhatsApp Business Account identifier.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: API Credentials Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-600">
                <KeyRound size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  API Credentials
                </h2>
                <p className="text-xs text-slate-500">
                  Secure credentials for Meta Cloud API authentication and webhook verification.
                </p>
              </div>
            </div>

            {config?.hasToken && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                Token Configured & Encrypted
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Meta Permanent / System User Access Token {!config?.hasToken && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showToken ? "text" : "password"}
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  placeholder={
                    config?.hasToken
                      ? "Leave empty to keep existing token"
                      : "EAAG..."
                  }
                  autoComplete="new-password"
                  className="h-11 w-full font-mono rounded-xl border border-slate-200 bg-white pl-3.5 pr-11 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                System user token with <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code> permissions.
                {config?.hasToken && " Existing token is safely stored on server."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Webhook Verify Token
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={formData.webhookVerifyToken}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      webhookVerifyToken: e.target.value,
                    })
                  }
                  placeholder="solmento_whatsapp_verify_token"
                  className="h-11 w-full font-mono rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                The token configured in your Meta Developer App Webhook settings to verify endpoint authenticity.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: Webhook & Integration Status Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Webhook size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Webhook & Integration Details
              </h2>
              <p className="text-xs text-slate-500">
                Webhook callback URL and subscription parameters required in Meta Developer Portal.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Webhook Callback URL
                  </span>
                  <p className="mt-1 font-mono text-xs text-slate-800 break-all select-all font-medium">
                    {webhookCallbackUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  {copiedWebhook ? (
                    <>
                      <Check size={14} className="text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy URL
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Verify Token
                  </span>
                  <button
                    type="button"
                    onClick={copyVerifyToken}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    {copiedVerifyToken ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800 truncate">
                  {formData.webhookVerifyToken || "solmento_whatsapp_verify_token"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Subscribed Webhook Fields
                </span>
                <p className="mt-1 font-mono text-xs font-semibold text-slate-800">
                  messages
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-100">
              <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
              <span>
                In Meta Developer Dashboard: Navigate to <strong>WhatsApp → Configuration → Webhook</strong>. Paste the Callback URL above and Verify Token, then subscribe to the <strong>messages</strong> event.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 6: Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleBack}
            className="h-11 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Cancel / Back to WhatsApp
          </button>
          <button
            type="submit"
            disabled={savingConfig || loadingConfig}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {savingConfig ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving & Verifying...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
