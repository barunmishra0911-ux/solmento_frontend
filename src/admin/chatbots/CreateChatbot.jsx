import { useState } from "react";
import { Bot, Check, ChevronDown, ChevronRight, FileText, Globe2, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { createChatbotRequest } from "@/lib/authApi";
import { showToast } from "@/lib/toast";
import { formatChatbotDisplayName } from "../../chatbot/widgetPosition";

const inputClass = "mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function StepHeader({ number, title, subtitle, open, summary, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 text-left">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-base font-bold text-white">{number}</span>
      <span className="min-w-0 flex-1"><strong className="block text-lg text-slate-950">{title}</strong><small className="mt-0.5 block truncate text-sm text-slate-500">{open ? subtitle : (summary || subtitle)}</small></span>
      {open ? <ChevronDown size={19} className="shrink-0 text-slate-500" /> : <ChevronRight size={19} className="shrink-0 text-slate-500" />}
    </button>
  );
}

function ChoiceCard({ selected, icon: Icon, title, description, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`relative flex min-h-32 items-start gap-3 rounded-xl border p-4 text-left transition ${selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"}`}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-600"><Icon size={23} /></span>
      <span className="min-w-0"><strong className="block text-sm text-slate-950">{title}</strong><small className="mt-1 block text-sm leading-5 text-slate-500">{description}</small></span>
      <span className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-md border ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}>{selected && <Check size={14} strokeWidth={3} />}</span>
    </button>
  );
}

function ChatPreview({ chatbotName, startMode }) {
  const name = formatChatbotDisplayName(chatbotName);
  const isBlank = startMode === "blank";
  return (
    <aside className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4 shadow-sm lg:sticky lg:top-4">
      <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm"><Sparkles size={16} /> Preview</span>
      <div className="mx-auto mt-20 max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-400 px-5 py-4 text-white"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-600"><Bot size={23} /></span><span className="min-w-0 flex-1"><strong className="block truncate text-base">{name}</strong><small className="flex items-center gap-1 text-blue-50"><i className="h-2 w-2 rounded-full bg-emerald-400" /> {isBlank ? "Draft" : "Online"}</small></span><X size={18} /></div>
        {isBlank ? <div className="flex min-h-[268px] flex-col"><div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center"><span className="grid h-20 w-20 place-items-center rounded-full bg-blue-50 text-blue-600"><Bot size={38} /></span><h2 className="mt-5 text-sm font-bold text-slate-900">Your chatbot is ready to be configured</h2><p className="mt-2 max-w-[255px] text-xs leading-5 text-slate-500">No welcome message, replies, or actions have been added yet. Open the Builder to start creating your chatbot.</p></div><div className="flex items-center gap-2 border-t border-slate-100 p-4"><input disabled placeholder="Configure your chatbot in the Builder" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 placeholder:text-slate-400" /><button type="button" disabled aria-label="Send disabled" className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-400"><Send size={17} /></button></div></div> : <div className="space-y-5 p-5"><div className="flex gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><Bot size={18} /></span><p className="max-w-[210px] rounded-2xl rounded-tl-md bg-blue-50 px-4 py-3 text-sm leading-5 text-slate-800">Hi there! 👋<br />I&apos;m your AI assistant.<br />How can I help you today?</p></div><div className="ml-14 space-y-2"><span className="block w-fit rounded-full border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600">Get Information</span><span className="block w-fit rounded-full border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600">Check Pricing</span><span className="block w-fit rounded-full border border-blue-500 px-3 py-1.5 text-xs font-medium text-blue-600">Talk to Support</span></div><div className="flex items-center gap-2 border-t border-slate-100 pt-4"><span className="text-xl text-slate-500">♧</span><span className="flex h-10 flex-1 items-center rounded-full border border-slate-200 px-3 text-sm text-slate-400">Type your message...</span><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white"><Send size={17} /></span></div></div>}
      </div>
      <div className="mt-6 rounded-xl bg-white/70 p-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-600"><Sparkles size={22} /></span><p><strong className="block text-sm text-slate-900">{isBlank ? "Build from Scratch." : "Create. Customize. Launch."}</strong><span className="mt-1 block text-xs leading-5 text-slate-600">{isBlank ? "Create your chatbot flow, messages, replies, and actions from a blank canvas." : "Set it up now and fine-tune everything in the builder to match your brand and business needs."}</span></p></div></div>
    </aside>
  );
}

export default function CreateChatbot({ onNavigate, onOpenBuilder }) {
  const [form, setForm] = useState({ name: "", description: "", sitemapUrl: "", channels: ["website"], startMode: "template" });
  const [openStep, setOpenStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateDescription = (value) => {
    const words = value.trim() ? value.trim().split(/\s+/) : [];
    if (words.length <= 50) update("description", value);
  };
  const validateStep = (step) => {
    if (step === 1 && (form.name.trim().length < 2 || !/^https?:\/\/[^\s]+$/i.test(form.sitemapUrl.trim()))) return "Enter a chatbot name and a valid sitemap URL.";
    if (step === 2 && !form.startMode) return "Choose how to start the chatbot.";
    return "";
  };
  const moveToStep = (step) => {
    setError("");
    setOpenStep(step);
  };
  const submit = async () => {
    const validation = validateStep(1) || validateStep(2);
    if (validation) { setError(validation); setOpenStep(validation.includes("start") ? 2 : 1); return; }
    setSaving(true);
    setError("");
    try {
      const { chatbot } = await createChatbotRequest({ name: form.name.trim(), description: form.description.trim(), sitemapUrl: form.sitemapUrl.trim(), channels: ["website"], startMode: form.startMode, status: "inactive" });
      showToast.success(`Chatbot "${form.name.trim()}" created successfully.`);
      onOpenBuilder(chatbot.id);
    } catch (cause) {
      const msg = cause.message || "Unable to save this chatbot draft.";
      setError(msg);
      showToast.error(msg);
      setSaving(false);
    }
  };
  const nameSummary = form.name.trim() ? `${form.name.trim()} · ${form.sitemapUrl.trim() || "Add sitemap URL"}` : "Add a name and sitemap URL";
  return (
    <div className="mx-auto max-w-[1260px]">
      <header className="mb-4"><nav className="flex items-center gap-2 text-sm text-slate-500"><button type="button" onClick={() => onNavigate("chatbots")} className="hover:text-blue-600">Chatbots</button><ChevronRight size={15} /><span className="text-slate-800">Create Chatbot</span></nav><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create Chatbot</h1><p className="mt-1 text-sm text-slate-500">Set up your AI chatbot in a few simple steps and start engaging with your users.</p></header>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,.95fr)]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div><StepHeader number="1" title="Basic Information" subtitle="Give your chatbot a name, description, sitemap URL and channel." open={openStep === 1} summary={nameSummary} onOpen={() => moveToStep(1)} />{openStep === 1 && <div className="ml-0 mt-5 space-y-5 sm:ml-12"><label className="block text-sm font-semibold text-slate-900">Chatbot Template Name <span className="text-rose-500">*</span><input value={form.name} maxLength={50} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Admission Assistant" className={`${inputClass} h-11`} /></label><p className="-mt-3 text-right text-xs text-slate-500">{form.name.length}/50</p><label className="block text-sm font-semibold text-slate-900">Description <span className="font-normal text-slate-400">(Optional)</span><textarea value={form.description} maxLength={200} onChange={(event) => updateDescription(event.target.value)} placeholder="Briefly describe what this chatbot template helps users with..." rows={3} className={`${inputClass} py-3`} /></label><p className="-mt-3 text-right text-xs text-slate-500">{form.description.trim() ? form.description.trim().split(/\s+/).length : 0}/50 words</p><label className="block text-sm font-semibold text-slate-900">Sitemap URL <span className="text-rose-500">*</span><input value={form.sitemapUrl} onChange={(event) => update("sitemapUrl", event.target.value)} placeholder="https://www.yourwebsite.com/sitemap.xml" className={`${inputClass} h-11`} /></label><div><p className="text-sm font-semibold text-slate-900">Select Channel <span className="text-rose-500">*</span></p><div className="mt-3"><ChoiceCard selected icon={Globe2} title="Website" description="Embed on your website as a chat widget." onClick={() => update("channels", ["website"])} /></div></div></div>}</div>
          <div className="mt-6 border-t border-slate-100 pt-6"><StepHeader number="2" title="Choose How to Start" subtitle="Start from a template or create a chatbot from scratch." open={openStep === 2} summary={form.startMode === "template" ? "Start from template" : "Blank chatbot"} onOpen={() => moveToStep(2)} />{openStep === 2 && <div className="ml-0 mt-5 grid gap-3 sm:ml-12 sm:grid-cols-2"><ChoiceCard selected={form.startMode === "template"} icon={Sparkles} title="Start from template" description="Use a ready-made template and customize it." onClick={() => update("startMode", "template")} /><ChoiceCard selected={form.startMode === "blank"} icon={FileText} title="Blank chatbot" description="Start with a clean canvas and build from scratch." onClick={() => update("startMode", "blank")} /></div>}</div>
          {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"><span className="min-w-0 flex-1">{error}</span><button type="button" onClick={() => setError("")} className="shrink-0 rounded p-0.5 text-rose-500 hover:bg-rose-100" aria-label="Dismiss error"><X size={16} /></button></div>}
        </section>
        <ChatPreview chatbotName={form.name} startMode={form.startMode} />
      </div>
      <footer className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm"><button type="button" disabled={saving} onClick={() => onNavigate("chatbots")} className="h-11 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="button" disabled={saving} onClick={submit} className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">{saving && <LoaderCircle size={17} className="animate-spin" />}{saving ? "Saving draft..." : "Next: Open Builder"}<ChevronRight size={17} /></button></footer>
    </div>
  );
}
