import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bold,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Globe2,
  GripVertical,
  Info,
  Italic,
  Link2,
  List,
  Loader2,
  Mic,
  Monitor,
  Phone,
  Plus,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  crawlChatbotWebsiteRequest,
  getChatbotCrawlStatusRequest,
} from "../../lib/authApi";
import {
  getWidgetPositionStyle,
  normalizeWidgetPosition,
  saveWidgetPosition,
  saveWidgetName,
  formatChatbotDisplayName,
} from "../../chatbot/widgetPosition";

const steps = [
  ["Language", "Select language"],
  ["Design & Styling", "Customize appearance"],
  ["Logo & Name", "Set identity"],
  ["Welcome Message", "Set initial message"],
  ["Lead Capture", "Collect user details"],
  ["Conversation Flow", "Set options & responses"],
];
const languages = [
  ["🇬🇧", "English"],
  ["🇮🇳", "Hindi"],
  ["🇪🇸", "Spanish"],
  ["🇫🇷", "French"],
  ["🇧🇩", "Bengali"],
  ["🇩🇪", "German"],
  ["🇮🇳", "Tamil"],
  ["🇦🇪", "Arabic"],
  ["🇮🇳", "Telugu"],
  ["🇨🇳", "Chinese"],
  ["🇮🇳", "Marathi"],
  ["🇯🇵", "Japanese"],
];
const newQuestionId = () =>
  `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const defaultSuggestedQuestions = [
  "What services do you provide?",
  "How can I get started?",
  "How do I contact support?",
];
const normalizeQuestion = (question) =>
  typeof question === "string"
    ? { id: newQuestionId(), text: question }
    : { id: question?.id || newQuestionId(), text: question?.text || "" };
const normalizeLeadField = (field, index) => ({
  id: field?.id || `field-${index}-${Date.now()}`,
  label: field?.label || "Custom Field",
  type: field?.type || "custom",
  required: Boolean(field?.required),
});
const questionText = (question) =>
  typeof question === "string" ? question : question?.text || "";
const normalizeSuggestedQuestions = (incoming) => {
  const current = Array.isArray(incoming)
    ? incoming.map(normalizeQuestion)
    : [];
  if (current.length >= 2) return current;
  return [
    ...current,
    ...defaultSuggestedQuestions.map(normalizeQuestion),
  ].slice(0, 2);
};
const chatTypeKeys = ["text", "voice", "call"];
const languageValidationMessage =
  "Please select at least one language to continue. The chatbot will use this language for initial messages and AI responses.";
const normalizeBorderRadius = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 12;
  return Math.min(48, Math.max(2, Math.round(numeric / 2) * 2));
};
const base = (incoming = {}) => ({
  ...incoming,
  id: incoming.id || "preview",
  name: incoming.name || "Website Assistant",
  status: incoming.status || "active",
  startMode: incoming.startMode || "template",
  languages: incoming.languages?.length
    ? incoming.languages
    : ["English", "Hindi"],
  theme: incoming.theme || "light",
  primaryColor: incoming.primaryColor || "#2563eb",
  position: normalizeWidgetPosition(incoming.position || "bottom-right"),
  widgetSize: incoming.widgetSize || "normal",
  borderRadius: normalizeBorderRadius(incoming.borderRadius ?? 12),
  shadow: incoming.shadow ?? true,
  logo: incoming.logo || "",
  tagline: incoming.tagline ?? "",
  onlineText: incoming.onlineText || "Online",
  welcomeMessage:
    incoming.welcomeMessage ||
    "Hi there! 👋\nWelcome to SolmentoAI.\nHow can I help you today?",
  showQuestions: incoming.showQuestions ?? true,
  suggestedQuestions: normalizeSuggestedQuestions(
    incoming.suggestedQuestions?.length
      ? incoming.suggestedQuestions
      : defaultSuggestedQuestions,
  ),
  leadCapture: {
    enabled: incoming.leadCapture?.enabled ?? true,
    fields: incoming.leadCapture?.fields?.length
      ? incoming.leadCapture.fields.map(normalizeLeadField)
      : [
          { id: "name", label: "Full Name", type: "name", required: true },
          {
            id: "phone",
            label: "Mobile Number",
            type: "phone",
            required: false,
          },
          {
            id: "email",
            label: "Email Address",
            type: "email",
            required: true,
          },
        ],
    afterMessage:
      incoming.leadCapture?.afterMessage ||
      "Great! How would you like to connect with us?",
  },
  chatTypes: (() => {
    const incomingChatTypes = incoming.chatTypes || {};
    const hasSelectedType = chatTypeKeys.some((key) => incomingChatTypes[key]);
    return {
      enabled: incomingChatTypes.enabled ?? true,
      text: hasSelectedType ? Boolean(incomingChatTypes.text) : true,
      voice: hasSelectedType ? Boolean(incomingChatTypes.voice) : false,
      call: hasSelectedType ? Boolean(incomingChatTypes.call) : false,
    };
  })(),
  websiteUrl: incoming.websiteUrl || "",
  crawlLimit: incoming.crawlLimit || incoming.maxPages || 50,
  crawled: incoming.crawled || false,
});
const cn = (...v) => v.filter(Boolean).join(" ");
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition",
        checked ? "bg-emerald-500" : "bg-slate-300",
      )}
    >
      <i
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}
function Button({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-800">
        {label}
      </span>
      {children}
      {hint && (
        <small className="mt-1 block text-xs text-slate-500">{hint}</small>
      )}
    </label>
  );
}

function sanitizeWelcomeHtml(value) {
  if (typeof document === "undefined") return value || "";
  const parsed = document.implementation.createHTMLDocument("");
  parsed.body.innerHTML = value || "";
  const allowed = new Set([
    "B",
    "STRONG",
    "I",
    "EM",
    "UL",
    "OL",
    "LI",
    "A",
    "BR",
    "DIV",
  ]);
  [...parsed.body.querySelectorAll("*")].reverse().forEach((element) => {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (element.tagName === "A") {
      const href = element.getAttribute("href") || "";
      [...element.attributes].forEach((attribute) =>
        element.removeAttribute(attribute.name),
      );
      if (/^(https?:|mailto:|tel:)/i.test(href)) {
        element.setAttribute("href", href);
      } else {
        element.replaceWith(...element.childNodes);
      }
      return;
    }
    [...element.attributes].forEach((attribute) =>
      element.removeAttribute(attribute.name),
    );
  });
  return parsed.body.innerHTML;
}

function RichTextToolbarButton({ label, icon, onRememberSelection, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onRememberSelection();
      }}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded text-slate-600 hover:bg-blue-50 hover:text-blue-600"
    >
      {icon}
    </button>
  );
}

function RichTextWelcomeEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const selectionRef = useRef(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    const next = sanitizeWelcomeHtml(value);
    if (editor.innerHTML !== next) editor.innerHTML = next;
  }, [value]);

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount)
      selectionRef.current = selection.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) return;
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };
  const syncValue = () =>
    onChange(sanitizeWelcomeHtml(editorRef.current?.innerHTML || ""));
  const runCommand = (command, commandValue = null) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    rememberSelection();
    syncValue();
  };
  const applyLink = (event) => {
    event.preventDefault();
    if (!/^https?:\/\/|^mailto:|^tel:/i.test(linkUrl.trim())) return;
    runCommand("createLink", linkUrl.trim());
    setLinkOpen(false);
  };
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-1 border-b border-slate-200 px-2 py-1">
        <RichTextToolbarButton
          label="Bold"
          icon={<Bold size={15} />}
          onRememberSelection={rememberSelection}
          onClick={() => runCommand("bold")}
        />
        <RichTextToolbarButton
          label="Italic"
          icon={<Italic size={15} />}
          onRememberSelection={rememberSelection}
          onClick={() => runCommand("italic")}
        />
        <RichTextToolbarButton
          label="List"
          icon={<List size={15} />}
          onRememberSelection={rememberSelection}
          onClick={() => runCommand("insertUnorderedList")}
        />
        <RichTextToolbarButton
          label="Link"
          icon={<Link2 size={15} />}
          onRememberSelection={rememberSelection}
          onClick={() => setLinkOpen(true)}
        />
      </div>
      {linkOpen && (
        <form
          onSubmit={applyLink}
          className="flex gap-2 border-b border-slate-200 bg-slate-50 p-2"
        >
          <input
            autoFocus
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            aria-label="Link URL"
            className="h-8 min-w-0 flex-1 rounded border border-slate-200 px-2 text-xs"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-3 text-xs font-semibold text-white"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen(false)}
            className="rounded px-2 text-xs text-slate-600"
          >
            Cancel
          </button>
        </form>
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Welcome Message"
        onInput={syncValue}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        className="min-h-36 whitespace-pre-wrap p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-100"
      />
    </div>
  );
}

function WidgetPreview({ config, step, mobile, onReset }) {
  const [messages, setMessages] = useState([]);
  const [device, setDevice] = useState(mobile ? "mobile" : "desktop");
  const dark = config.theme === "dark";
  const isLead = step === 4 && config.leadCapture.enabled;
  const isFlow = step === 5 && config.chatTypes.enabled;
  const accent = config.primaryColor;
  const accentSurface = /^#[0-9a-f]{6}$/i.test(accent)
    ? `${accent}18`
    : accent;
  const accentStrongSurface = /^#[0-9a-f]{6}$/i.test(accent)
    ? `${accent}33`
    : accent;
  const size =
    config.widgetSize === "large"
      ? "max-w-[390px]"
      : config.widgetSize === "compact"
        ? "max-w-[280px]"
        : "max-w-[330px]";
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-blue-50/60 to-slate-50 p-3 sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-slate-950">
            <i className="h-2 w-2 rounded-full bg-emerald-500" /> Live Preview
          </p>
          <p className="text-[11px] text-slate-500">
            See how your chatbot will look to users.
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg",
              device === "desktop"
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-500",
            )}
            aria-label="Desktop preview"
            aria-pressed={device === "desktop"}
          >
            <Monitor size={15} />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg",
              device === "mobile"
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-500",
            )}
            aria-label="Mobile preview"
            aria-pressed={device === "mobile"}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>
      <div className="relative min-h-[510px] overflow-hidden rounded-xl border border-slate-100 bg-white/40">
        {config.position.endsWith("-middle") && (
          <button
            type="button"
            aria-label={`Preview ${config.name || "chatbot"} trigger`}
            className={cn(
              "absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-1 bg-blue-600 px-1.5 py-2 text-white shadow-md",
              config.position === "left-middle"
                ? "left-0 rounded-r-lg"
                : "right-0 rounded-l-lg",
            )}
          >
            <Bot size={13} />
            <span
              className="max-h-24 max-w-24 truncate text-[9px] font-semibold"
              style={{
                writingMode: "vertical-rl",
                transform:
                  config.position === "left-middle"
                    ? "rotate(180deg)"
                    : undefined,
              }}
            >
              {formatChatbotDisplayName(config.name)}
            </span>
          </button>
        )}
        <div
          className={cn(
            "absolute w-full overflow-hidden border border-slate-100 bg-white shadow-xl transition-all duration-300",
            device === "mobile" ? "max-w-[280px]" : size,
            device === "mobile" ? "rounded-2xl" : "rounded-xl",
          )}
          style={{
            ...getWidgetPositionStyle(config.position, "1rem", "3.75rem"),
            borderRadius: `${config.borderRadius}px`,
            boxShadow: config.shadow ? undefined : "none",
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 text-white"
            style={{ backgroundColor: accent }}
          >
            {config.logo ? (
              <img
                src={config.logo}
                alt="Chatbot logo"
                className="block h-9 w-9 shrink-0 rounded-lg bg-white object-cover"
              />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-blue-600">
                <Sparkles size={20} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm">
                {formatChatbotDisplayName(config.name || "Website Assistant")}
              </strong>
              <small className="flex items-center gap-1 text-blue-50">
                <i className="h-2 w-2 rounded-full bg-emerald-400" />
                {config.tagline?.trim() || "Online"}
              </small>
            </div>
            <span className="text-xl font-light">—</span>
            <X size={17} />
          </div>
          <div
            className={cn(
              "min-h-[300px] space-y-3 p-4",
              dark ? "bg-slate-900 text-white" : "text-slate-800",
            )}
            style={{ backgroundColor: dark ? "#0f172a" : accentSurface }}
          >
            {isLead ? (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-800">
                  Welcome! Please share your details to get started.
                </p>
                {config.leadCapture.fields.map((field) => (
                  <label
                    key={field.id}
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {field.label}
                    {field.required && " *"}
                    <input
                      disabled
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 text-[11px] font-normal"
                    />
                  </label>
                ))}
                <button
                  className="h-8 w-full rounded-md text-xs font-semibold text-white"
                  style={{ backgroundColor: accent }}
                >
                  Next →
                </button>
              </div>
            ) : isFlow ? (
              <>
                <div className="flex gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Bot size={16} />
                  </span>
                  <p
                    className={cn(
                      "max-w-[82%] whitespace-pre-line rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-5",
                      dark
                        ? "text-white"
                        : "text-slate-800",
                    )}
                    style={{ backgroundColor: dark ? accentStrongSurface : "rgba(255,255,255,.7)" }}
                  >
                    {config.leadCapture.afterMessage}
                  </p>
                </div>
                <div className="space-y-2">
                  {config.chatTypes.text && (
                    <PreviewOption
                      icon={Bot}
                      title="Text Chat"
                      detail="Chat with us now"
                      accent={accent}
                    />
                  )}
                  {config.chatTypes.voice && (
                    <PreviewOption
                      icon={Mic}
                      title="Voice Chat"
                      detail="Talk with our AI assistant"
                      accent={accent}
                    />
                  )}
                  {config.chatTypes.call && (
                    <PreviewOption
                      icon={Phone}
                      title="Call Chat"
                      detail="Connect with our team"
                      accent={accent}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Bot size={16} />
                  </span>
                  <div
                    className={cn(
                      "max-w-[82%] whitespace-pre-line rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-5",
                      dark ? "text-white" : "text-slate-800",
                    )}
                    style={{ backgroundColor: dark ? accentStrongSurface : "rgba(255,255,255,.7)" }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeWelcomeHtml(config.welcomeMessage),
                    }}
                  />
                </div>
                {messages.map((message) => (
                  <p
                    key={message}
                    className="ml-auto max-w-[75%] rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {message}
                  </p>
                ))}
                {config.showQuestions && (
                  <div className="ml-10 space-y-1.5">
                    {config.suggestedQuestions.map((question) => (
                      <button
                        key={question.id}
                        onClick={() =>
                          setMessages((items) => [
                            ...items,
                            questionText(question),
                          ])
                        }
                      className="block rounded-full border px-3 py-1 text-[11px] font-medium"
                        style={{ borderColor: accent, color: accent, backgroundColor: dark ? accentStrongSurface : "rgba(255,255,255,.72)" }}
                      >
                        {questionText(question)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 p-3">
            <span className="text-slate-400">◉</span>
            <div className="h-8 flex-1 rounded-full border border-slate-200 px-3 pt-2 text-[11px] text-slate-400">
              Type your message...
            </div>
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-white"
              style={{ backgroundColor: accent }}
            >
              <Send size={14} />
            </span>
          </div>
          <p className="pb-3 text-center text-[10px] text-slate-400">
            Powered by <b>SolmentoAI</b>
          </p>
        </div>
      </div>
    </div>
  );
}
function PreviewOption({ icon: Icon, title, detail, accent }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm">
      <span
        className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50"
        style={{ color: accent }}
      >
        <Icon size={18} />
      </span>
      <span className="flex-1">
        <b className="block text-xs text-slate-800">{title}</b>
        <small className="text-[10px] text-slate-500">{detail}</small>
      </span>
      <ChevronRight size={15} className="text-slate-400" />
    </button>
  );
}

function StepContent({
  step,
  config,
  setConfig,
  go,
  onError,
  showLanguageValidation,
  onSaveAndReview,
}) {
  const [languageSearch, setLanguageSearch] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState(null);
  const [crawlError, setCrawlError] = useState("");
  const [crawlDetail, setCrawlDetail] = useState(null);
  const update = (patch) => setConfig((c) => ({ ...c, ...patch }));

  useEffect(() => {
    if (!config?.id) return;
    let isMounted = true;
    getChatbotCrawlStatusRequest(config.id)
      .then((data) => {
        if (isMounted && data) {
          setCrawlDetail(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [config?.id]);

  const handleCrawlWebsite = async () => {
    const url = (config.websiteUrl || "").trim();
    if (!url) {
      setCrawlError("Please enter a valid website URL or sitemap URL.");
      return;
    }
    const limit = Number(config.crawlLimit) || 50;
    setCrawlError("");
    setIsCrawling(true);
    setCrawlStatus(`Crawling website pages (limit: ${limit} pages)...`);

    try {
      const res = await crawlChatbotWebsiteRequest(config.id, {
        websiteUrl: url,
        crawlLimit: limit,
        maxPages: limit,
      });

      if (res.isAsync || res.status === "IN_PROGRESS" || res.status === "PENDING") {
        setCrawlStatus(`Background crawl in progress (${limit} max pages)...`);

        // Poll crawl-status endpoint until finished
        const pollInterval = setInterval(async () => {
          try {
            const data = await getChatbotCrawlStatusRequest(config.id);
            if (data) {
              setCrawlDetail(data);
              if (data.status !== "IN_PROGRESS" && data.status !== "PENDING") {
                clearInterval(pollInterval);
                setIsCrawling(false);
                const isPart = data.status === "PARTIAL";
                const disc = data.pagesDiscovered || data.totalPages || 0;
                const proc = data.pagesProcessed || data.totalPages || 0;
                const ind = data.totalPages || data.indexedCount || 0;
                const fail = data.pagesFailed || 0;
                setCrawlStatus(
                  `Crawl complete: ${ind} page(s) indexed of ${disc} discovered (${proc} processed, ${fail} failed, status: ${data.status}${isPart ? " - limit reached" : ""}).`,
                );
                update({
                  crawled: data.status !== "FAILED",
                  indexedPagesCount: data.totalPages,
                  lastCrawledAt: data.lastCrawledAt || new Date().toISOString(),
                });
              }
            }
          } catch { }
        }, 2000);
        return;
      }

      setIsCrawling(false);
      const isPart = res.status === "PARTIAL" || res.isPartial;
      const discovered = res.totalDiscoveredCount || res.discoveredCount || res.indexedCount || 0;
      const processed = res.processedCount || res.indexedCount || 0;
      const indexed = res.indexedCount || 0;
      const failed = res.failedCount || 0;
      setCrawlStatus(
        `Crawl complete: ${indexed} page(s) indexed of ${discovered} discovered (${processed} processed, ${failed} failed, ${res.changedCount || 0} changed, ${res.unchangedCount || 0} unchanged${isPart ? ", limit reached" : ""}).`,
      );
      setCrawlDetail({
        totalPages: res.indexedCount,
        lastCrawledAt: res.lastCrawledAt,
        nextCheckAt: res.nextCheckAt,
        status: res.status,
        pagesDiscovered: discovered,
        pagesProcessed: res.processedCount || res.indexedCount || 0,
        pagesNew: res.newCount,
        pagesChanged: res.changedCount,
        pagesUnchanged: res.unchangedCount,
        pagesRemoved: res.removedCount,
        pagesFailed: res.failedCount,
        lastErrorSummary: res.error,
      });
      update({
        crawled: res.status !== "FAILED",
        indexedPagesCount: res.indexedCount,
        lastCrawledAt: res.lastCrawledAt || new Date().toISOString(),
      });
    } catch (err) {
      setIsCrawling(false);
      setCrawlStatus(null);
      setCrawlError(err?.message || "Failed to crawl website. Please check the URL.");
    }
  };
  const filteredLanguages = languages.filter(([, language]) =>
    language.toLowerCase().includes(languageSearch.trim().toLowerCase()),
  );
  const toggleLanguage = (language) =>
    update({
      languages: config.languages.includes(language)
        ? config.languages.filter((item) => item !== language)
        : [...config.languages, language],
    });
  const move = (items, index, offset, key) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setConfig((c) => ({ ...c, [key]: next }));
  };
  const panel = (title, description, children) => (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h1 className="text-xl font-bold text-slate-950">
        {step + 1}. {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
  const footer = (
    <div className="mt-4 flex items-center justify-between gap-3">
      {step ? (
        <Button
          onClick={() => go(step - 1)}
          className="border border-slate-200 bg-white text-slate-700"
        >
          <ChevronLeft size={16} /> Back & Save
        </Button>
      ) : (
        <span />
      )}
      {step < 5 ? (
        <Button
          onClick={() => go(step + 1)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Save & Next: {steps[step + 1][0]} <ChevronRight size={16} />
        </Button>
      ) : (
        <Button onClick={onSaveAndReview} className="bg-blue-600 text-white">
          Save & Review all steps <Check size={16} />
        </Button>
      )}
    </div>
  );
  if (step === 0)
    return (
      <>
        {panel(
          "Language Selection",
          "Choose the language(s) your chatbot should understand and respond in.",
          <>
            {showLanguageValidation && !config.languages.length && (
              <div
                role="alert"
                className="rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-700"
              >
                <Info size={14} className="mr-1 inline" />
                {languageValidationMessage}
              </div>
            )}
            <label className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Globe2 size={16} />
              <input
                type="search"
                value={languageSearch}
                onChange={(event) => setLanguageSearch(event.target.value)}
                placeholder="Search language..."
                aria-label="Search languages"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filteredLanguages.map(([flag, language]) => (
                <label
                  key={language}
                  className="flex h-8 items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={config.languages.includes(language)}
                    onChange={() => toggleLanguage(language)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span>{flag}</span>
                  <b className="font-medium">{language}</b>
                  {language === "English" && (
                    <small className="text-xs text-slate-400">(Default)</small>
                  )}
                </label>
              ))}
              {!filteredLanguages.length && (
                <p className="col-span-full text-xs text-slate-500">
                  No matching language found.
                </p>
              )}
            </div>
            <div className="mt-5 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
              ⚙ AI will automatically detect the user's language and respond
              according to your selection.
            </div>
            <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <span>
                <b className="block text-xs">Auto Language Detection</b>
                <small className="mt-1 block text-xs leading-5 text-slate-500">
                  Automatically detect a visitor&apos;s language and respond
                  accordingly.
                </small>
              </span>
              <Toggle
                checked={config.autoLanguage ?? true}
                onChange={(value) => update({ autoLanguage: value })}
                label="Auto language detection"
              />
            </div>
          </>,
        )}
        {footer}
      </>
    );
  if (step === 1)
    return (
      <>
        {panel(
          "Design & Styling",
          "Customize the chatbot's look, position and behavior to match your brand.",
          <div className="space-y-5">
            <Field label="Theme">
              <div className="grid grid-cols-3 gap-2">
                {["light", "dark", "auto"].map((item) => (
                  <Button
                    key={item}
                    onClick={() => update({ theme: item })}
                    className={cn(
                      "border text-xs capitalize",
                      config.theme === item
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600",
                    )}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Primary Color">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-200 p-1"
              />
            </Field>
            <Field label="Widget Position">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["bottom-right", "Bottom Right"],
                  ["bottom-left", "Bottom Left"],
                  ["right-middle", "Right Middle"],
                  ["left-middle", "Left Middle"],
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    onClick={() => {
                      saveWidgetPosition(value);
                      update({ position: value });
                    }}
                    className={cn(
                      "h-16 border text-xs",
                      config.position === value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600",
                    )}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Widget Size">
              <div className="grid grid-cols-3 gap-2">
                {["normal", "large", "compact"].map((item) => (
                  <Button
                    key={item}
                    onClick={() => update({ widgetSize: item })}
                    className={cn(
                      "border text-xs",
                      config.widgetSize === item
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600",
                    )}
                  >
                    {item[0].toUpperCase() + item.slice(1)}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label={`Border Radius · ${config.borderRadius}px`}>
              <input
                type="range"
                min="2"
                max="48"
                step="2"
                value={normalizeBorderRadius(config.borderRadius)}
                onChange={(e) =>
                  update({ borderRadius: normalizeBorderRadius(e.target.value) })
                }
                className="w-full accent-blue-600"
              />
            </Field>
            <div className="flex items-center justify-between">
              <b className="text-xs">Show Shadow</b>
              <Toggle
                checked={config.shadow}
                onChange={(value) => update({ shadow: value })}
                label="Show widget shadow"
              />
            </div>
          </div>,
        )}
        {footer}
      </>
    );
  if (step === 2)
    return (
      <>
        {panel(
          "Logo & Name",
          "Set your chatbot's identity.",
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt="Chatbot logo"
                  className="block h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-white text-blue-600">
                  <Sparkles size={28} />
                </span>
              )}
              <div>
                <b className="text-sm">Upload Logo</b>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG (Max 2MB)
                </p>
                <label className="mt-2 inline-flex cursor-pointer rounded-md border border-blue-500 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600">
                  <Upload size={13} className="mr-1" />
                  Change Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () =>
                        update({ logo: String(reader.result) });
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {config.logo && (
                  <button
                    onClick={() => update({ logo: "" })}
                    className="ml-2 text-xs text-rose-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <Field label="Chatbot Name">
              <input
                maxLength="50"
                value={config.name}
                onChange={(e) => update({ name: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
              <small className="text-xs text-slate-400">
                {config.name.length}/50
              </small>
            </Field>
            <Field label="Tagline (Optional)">
              <input
                maxLength="100"
                value={config.tagline}
                onChange={(e) => update({ tagline: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
              <small className="text-xs text-slate-400">
                {config.tagline.length}/100
              </small>
            </Field>
            <Field label="Online Status Text">
              <input
                value={config.onlineText}
                onChange={(e) => update({ onlineText: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              />
            </Field>
          </div>,
        )}
        {footer}
      </>
    );
  if (step === 3)
    return (
      <>
        {panel(
          "Welcome Message",
          "Set the first message users will see after opening the chatbot.",
          <div className="space-y-4">
            <Field label="Welcome Message">
              <RichTextWelcomeEditor
                value={config.welcomeMessage}
                onChange={(welcomeMessage) => update({ welcomeMessage })}
              />
              <small className="text-right text-xs text-slate-400">
                {config.welcomeMessage.length}/500
              </small>
            </Field>
            <div className="flex items-center justify-between">
              <b className="text-xs">Show Suggested Questions</b>
              <Toggle
                checked={config.showQuestions}
                onChange={(value) => update({ showQuestions: value })}
                label="Show suggested questions"
              />
            </div>
            {config.showQuestions && (
              <div className="space-y-2">
                {config.suggestedQuestions.map((question, index) => (
                  <div key={question.id} className="flex items-center gap-2">
                    <GripVertical size={15} className="text-slate-400" />
                    <input
                      value={question.text}
                      onChange={(e) => {
                        update({
                          customizedSuggestedQuestions: true,
                          suggestedQuestions: config.suggestedQuestions.map(
                            (item) =>
                              item.id === question.id
                                ? { ...item, text: e.target.value }
                                : item,
                          ),
                        });
                      }}
                      className="h-9 flex-1 rounded-lg border border-slate-200 px-2 text-xs"
                    />
                    <button
                      onClick={() =>
                        move(
                          config.suggestedQuestions,
                          index,
                          -1,
                          "suggestedQuestions",
                        )
                      }
                      className="text-slate-400"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() =>
                        move(
                          config.suggestedQuestions,
                          index,
                          1,
                          "suggestedQuestions",
                        )
                      }
                      className="text-slate-400"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={config.suggestedQuestions.length <= 2}
                      onClick={() =>
                        config.suggestedQuestions.length > 2 &&
                        update({
                          customizedSuggestedQuestions: true,
                          suggestedQuestions: config.suggestedQuestions.filter(
                            (item) => item.id !== question.id,
                          ),
                        })
                      }
                      className="text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <Button
                  disabled={config.suggestedQuestions.length >= 5}
                  onClick={() =>
                    update({
                      customizedSuggestedQuestions: true,
                      suggestedQuestions: [
                        ...config.suggestedQuestions,
                        normalizeQuestion("New question"),
                      ],
                    })
                  }
                  className="w-full border border-blue-100 bg-blue-50 text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={15} />{" "}
                  {config.suggestedQuestions.length >= 5
                    ? "Maximum 5 questions"
                    : "Add Question"}
                </Button>
              </div>
            )}
          </div>,
        )}
        {footer}
      </>
    );
  if (step === 4)
    return (
      <>
        {panel(
          "Lead Capture",
          "Collect user details before or during a conversation.",
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <b className="text-sm">Enable Lead Capture</b>
              <Toggle
                checked={config.leadCapture.enabled}
                onChange={(value) =>
                  update({
                    leadCapture: { ...config.leadCapture, enabled: value },
                  })
                }
                label="Enable lead capture"
              />
            </div>
            {config.leadCapture.enabled && (
              <>
                <div className="space-y-2">
                  {config.leadCapture.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"
                    >
                      <GripVertical size={15} className="text-slate-400" />
                      <input
                        value={field.label}
                        onChange={(e) => {
                          const fields = [...config.leadCapture.fields];
                          fields[index] = { ...field, label: e.target.value };
                          update({
                            leadCapture: { ...config.leadCapture, fields },
                          });
                        }}
                        className="h-8 flex-1 text-xs outline-none"
                      />
                      <label className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                        <input
                          type="checkbox"
                          checked={Boolean(field.required)}
                          onChange={(event) => {
                            const required = event.target.checked;
                            const fields = config.leadCapture.fields.map(
                              (item) =>
                                item.id === field.id
                                  ? { ...item, required }
                                  : item,
                            );
                            update({
                              leadCapture: { ...config.leadCapture, fields },
                            });
                          }}
                          className="h-3.5 w-3.5 accent-blue-600"
                        />
                        Required
                      </label>
                      <button
                        onClick={() =>
                          move(
                            config.leadCapture.fields,
                            index,
                            -1,
                            "leadCapture",
                          )
                        }
                        className="hidden"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() =>
                          update({
                            leadCapture: {
                              ...config.leadCapture,
                              fields: config.leadCapture.fields.filter(
                                (_, item) => item !== index,
                              ),
                            },
                          })
                        }
                        className="text-rose-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  disabled={config.leadCapture.fields.length >= 5}
                  onClick={() =>
                    update({
                      leadCapture: {
                        ...config.leadCapture,
                        fields: [
                          ...config.leadCapture.fields,
                          {
                            id: `field-${Date.now()}`,
                            label: "Custom Field",
                            type: "custom",
                            required: false,
                          },
                        ],
                      },
                    })
                  }
                  className="w-full bg-blue-50 text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={15} />{" "}
                  {config.leadCapture.fields.length >= 5
                    ? "Maximum 5 fields"
                    : "Add Field"}
                </Button>
                <Field label="After Form Submission">
                  <textarea
                    value={config.leadCapture.afterMessage}
                    onChange={(e) =>
                      update({
                        leadCapture: {
                          ...config.leadCapture,
                          afterMessage: e.target.value,
                        },
                      })
                    }
                    className="min-h-20 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </Field>
              </>
            )}
          </div>,
        )}
        {footer}
      </>
    );
  return (
    <>
      {panel(
        "Conversation Flow",
        "Set chat type options and responses.",
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <b className="text-sm">Enable Chat Type Selection</b>
            <Toggle
              checked={config.chatTypes.enabled}
              onChange={(value) =>
                update({ chatTypes: { ...config.chatTypes, enabled: value } })
              }
              label="Enable chat type selection"
            />
          </div>
          {[
            ["text", Bot, "Text Chat", "Chat with AI any time"],
            ["voice", Mic, "Voice Chat", "Start a voice conversation"],
            ["call", Phone, "Call Chat", "Connect with our team"],
          ].map(([key, Icon, title, detail]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Icon size={16} />
              </span>
              <span className="flex-1">
                <b className="block text-xs">{title}</b>
                <small className="text-[11px] text-slate-500">{detail}</small>
              </span>
              <Toggle
                checked={config.chatTypes[key]}
                onChange={(value) => {
                  const selectedCount = chatTypeKeys.filter(
                    (item) => config.chatTypes[item],
                  ).length;
                  if (!value && selectedCount <= 1) {
                    onError?.(
                      "Enable at least one chat type before saving or publishing.",
                    );
                    return;
                  }
                  onError?.("");
                  update({
                    chatTypes: { ...config.chatTypes, [key]: value },
                  });
                }}
                label={title}
              />
            </div>
          ))}
          <section className="rounded-xl bg-violet-50 p-3.5 space-y-2.5 border border-violet-100">
            <p className="flex items-center gap-2 text-xs font-bold text-violet-800">
              <Globe2 size={16} /> AI Training from Website Content
            </p>
            <p className="text-xs leading-5 text-violet-700">
              Crawl your website pages so Gemini AI answers visitor questions grounded directly in your own content.
            </p>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-violet-900">Website or Sitemap URL</label>
              <input
                value={config.websiteUrl || ""}
                onChange={(e) => update({ websiteUrl: e.target.value })}
                placeholder="https://www.yourwebsite.com/sitemap.xml"
                disabled={isCrawling}
                className="h-9 w-full rounded-lg border border-violet-200 bg-white px-3 text-xs outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <label className="text-[11px] font-semibold text-violet-900">Crawl Page Limit:</label>
              <select
                value={config.crawlLimit || 50}
                onChange={(e) => update({ crawlLimit: Number(e.target.value) })}
                disabled={isCrawling}
                className="h-8 rounded-lg border border-violet-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-violet-500 font-medium"
              >
                <option value={25}>25 pages</option>
                <option value={50}>50 pages (Default)</option>
                <option value={100}>100 pages</option>
                <option value={250}>250 pages</option>
                <option value={500}>500 pages</option>
                <option value={1000}>1,000 pages (Max)</option>
              </select>
            </div>

            <Button
              type="button"
              disabled={isCrawling || !config.websiteUrl?.trim()}
              onClick={handleCrawlWebsite}
              className="w-full border border-blue-600 bg-white text-blue-600 hover:bg-blue-50 font-medium text-xs disabled:opacity-50 cursor-pointer"
            >
              {isCrawling ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin shrink-0" />
                  Crawling & Indexing Pages...
                </span>
              ) : (
                "Crawl Website Now"
              )}
            </Button>
            {crawlError && (
              <p className="text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
                ✕ {crawlError}
              </p>
            )}
            {crawlStatus && !crawlError && (
              <p className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                ✓ {crawlStatus}
              </p>
            )}

            {/* Persistent Crawl & Change Detection Status */}
            {(crawlDetail || config.crawled) && (
              <div className="mt-2 space-y-2 rounded-lg border border-violet-200 bg-white p-2.5 text-xs text-slate-700 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Knowledge Status:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      crawlDetail?.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : crawlDetail?.status === "UNCHANGED"
                          ? "bg-blue-100 text-blue-800"
                          : crawlDetail?.status === "PARTIAL"
                            ? "bg-amber-100 text-amber-800"
                            : crawlDetail?.status === "IN_PROGRESS" || isCrawling
                              ? "bg-indigo-100 text-indigo-800 animate-pulse"
                              : crawlDetail?.status === "RECONFIGURING"
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : crawlDetail?.status === "FAILED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    ● {isCrawling || crawlDetail?.status === "IN_PROGRESS" ? "Crawling..." : (crawlDetail?.status || "Indexed")}
                  </span>
                </div>

                {crawlDetail?.lastErrorSummary && crawlDetail?.status === "FAILED" && (
                  <p className="text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-200">
                    ✕ {crawlDetail.lastErrorSummary}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-slate-600">
                  <div className="rounded bg-slate-50 p-1.5">
                    <span className="text-slate-400 block text-[9px] uppercase">Active Pages</span>
                    <span className="font-bold text-slate-800">{crawlDetail?.totalPages ?? config.indexedPagesCount ?? 0} indexed</span>
                  </div>
                  <div className="rounded bg-slate-50 p-1.5">
                    <span className="text-slate-400 block text-[9px] uppercase">Discovered</span>
                    <span className="font-bold text-slate-800">{crawlDetail?.pagesDiscovered ?? crawlDetail?.totalPages ?? 0} found</span>
                  </div>
                  <div className="rounded bg-slate-50 p-1.5">
                    <span className="text-slate-400 block text-[9px] uppercase">Last Check</span>
                    <span className="font-medium text-slate-700">
                      {crawlDetail?.lastCheckedAt
                        ? new Date(crawlDetail.lastCheckedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Recently"}
                    </span>
                  </div>
                </div>

                {crawlDetail?.status === "PARTIAL" && (
                  <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 leading-4">
                    ⚠️ Partial crawl: {crawlDetail?.totalPages ?? 0} of {crawlDetail?.pagesDiscovered ?? 0} discovered URLs indexed within the {config.crawlLimit || 50}-page limit.
                  </p>
                )}

                {crawlDetail && (crawlDetail.pagesChanged > 0 || crawlDetail.pagesUnchanged > 0 || crawlDetail.pagesRemoved > 0 || crawlDetail.pagesFailed > 0) && (
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-0.5">
                    {crawlDetail.pagesChanged > 0 && (
                      <span className="text-amber-700 font-medium">⚡ {crawlDetail.pagesChanged} updated</span>
                    )}
                    {crawlDetail.pagesUnchanged > 0 && (
                      <span className="text-blue-700 font-medium">✓ {crawlDetail.pagesUnchanged} unchanged</span>
                    )}
                    {crawlDetail.pagesRemoved > 0 && (
                      <span className="text-slate-500 font-medium">✕ {crawlDetail.pagesRemoved} inactive</span>
                    )}
                    {crawlDetail.pagesFailed > 0 && (
                      <span className="text-rose-600 font-medium">⚠️ {crawlDetail.pagesFailed} failed</span>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Auto-Refresh:</span>
                  <span className="font-medium text-violet-700">Daily (~24h cycle)</span>
                </div>

                {crawlDetail?.lastErrorSummary && crawlDetail?.status !== "FAILED" && crawlDetail?.status !== "PARTIAL" && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                    Note: {crawlDetail.lastErrorSummary}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>,
      )}
      {footer}
    </>
  );
}

export default function StepChatbotBuilder({
  initialConfig,
  initialVersions = [],
  onSaveDraft,
  onPublish,
}) {
  const navigate = useNavigate();
  const [serverInitialConfig] = useState(() => base(initialConfig));
  const persistenceKey = `solmento:chatbot-builder:${serverInitialConfig.id}`;
  const stepPersistenceKey = `${persistenceKey}:step`;
  const [pendingSnapshot] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(persistenceKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [pendingStep] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored =
        window.localStorage.getItem(stepPersistenceKey) ??
        window.sessionStorage.getItem(stepPersistenceKey);
      return stored === null ? pendingSnapshot?.step : stored;
    } catch {
      return pendingSnapshot?.step;
    }
  });
  const [config, setConfig] = useState(() =>
    pendingSnapshot?.config && typeof pendingSnapshot.config === "object"
      ? { ...serverInitialConfig, ...pendingSnapshot.config }
      : serverInitialConfig,
  );
  const logoRef = useRef(serverInitialConfig.logo);
  const [lastSaved, setLastSaved] = useState(() => serverInitialConfig);
  const [step, setStep] = useState(() => {
    const restoredStep = Number(pendingStep);
    return Number.isInteger(restoredStep) &&
      restoredStep >= 0 &&
      restoredStep < steps.length
      ? restoredStep
      : 0;
  });
  const [versions, setVersions] = useState(initialVersions);
  const [saveState, setSaveState] = useState("saved");
  const [publishOpen, setPublishOpen] = useState(false);
  const [error, setError] = useState("");
  const [headerNameFocused, setHeaderNameFocused] = useState(false);
  const [languageValidationAttempted, setLanguageValidationAttempted] =
    useState(false);
  const [mobileTab, setMobileTab] = useState("configure");
  const timer = useRef(null);
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        persistenceKey,
        JSON.stringify({ config, step }),
      );
      window.localStorage.setItem(stepPersistenceKey, String(step));
      window.sessionStorage.setItem(stepPersistenceKey, String(step));
    } catch {
      // Session storage can be unavailable in privacy-restricted browsers.
    }
  }, [config, persistenceKey, step, stepPersistenceKey]);
  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(lastSaved),
    [config, lastSaved],
  );
  const validateConfig = useCallback(() => {
    if (!config.languages.length) return languageValidationMessage;
    const chatTypes = config.chatTypes || {};
    if (!chatTypeKeys.some((key) => chatTypes[key])) {
      return "Enable at least one chat type before saving or publishing.";
    }
    if (config.suggestedQuestions.length > 5) {
      return "A chatbot can have at most 5 suggested questions.";
    }
    if (config.leadCapture.fields.length > 5) {
      return "A chatbot can have at most 5 lead-capture fields.";
    }
    return "";
  }, [config]);
  const save = useCallback(async () => {
    const validationError = validateConfig();
    if (validationError) {
      if (validationError === languageValidationMessage) {
        setLanguageValidationAttempted(true);
        setStep(0);
      }
      setSaveState("error");
      setError(validationError);
      return;
    }
    setSaveState("saving");
    try {
      const result = await onSaveDraft(config);
      setLastSaved(config);
      try {
        window.sessionStorage.removeItem(persistenceKey);
      } catch {
        // Ignore storage cleanup failures; the server draft is already saved.
      }
      setVersions(result.versions || versions);
      setSaveState("saved");
      setError("");
      saveWidgetName(config.name);
      return true;
    } catch (cause) {
      setSaveState("error");
      setError(cause.message || "Unable to save draft.");
      return false;
    }
  }, [config, onSaveDraft, persistenceKey, validateConfig, versions]);
  const goToStep = useCallback(
    (nextStep) => {
      if (step === 0 && nextStep > 0 && !config.languages.length) {
        setLanguageValidationAttempted(true);
        setSaveState("error");
        setError(languageValidationMessage);
        return;
      }
      setLanguageValidationAttempted(false);
      setError("");
      setStep(nextStep);
    },
    [config.languages.length, step],
  );
  useEffect(() => {
    if (logoRef.current === config.logo) return;
    logoRef.current = config.logo;
    void save();
  }, [config.logo, save]);
  useEffect(() => {
    if (!dirty) return;
    timer.current = window.setTimeout(() => {
      void save();
    }, 30000);
    return () => clearTimeout(timer.current);
  }, [dirty, save]);
  const publish = async () => {
    const validationError = validateConfig();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const changes = ["Updated chatbot configuration"];
      const result = await onPublish(config, changes);
      setLastSaved(config);
      try {
        window.sessionStorage.removeItem(persistenceKey);
      } catch {
        // Ignore storage cleanup failures; the published version is persisted.
      }
      setVersions(result.versions || versions);
      setSaveState("saved");
      setPublishOpen(false);
      saveWidgetName(config.name);
    } catch (cause) {
      setError(cause.message || "Unable to publish chatbot.");
    }
  };
  const complete = (index) => index < step;
  return (
    <div className="mx-auto max-w-[1600px] text-slate-900">
      <header className="mb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/app/chatbots")}
            className="hover:text-blue-600"
          >
            Chatbots
          </button>
          <ChevronRight size={13} />
          <button
            type="button"
            onClick={() => navigate("/app/chatbots/create")}
            className="hover:text-blue-600"
          >
            Create Chatbot
          </button>
          <ChevronRight size={13} />
          <b className="text-slate-800">Builder</b>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            value={
              headerNameFocused
                ? config.name
                : formatChatbotDisplayName(config.name)
            }
            onFocus={() => setHeaderNameFocused(true)}
            onBlur={() => setHeaderNameFocused(false)}
            onChange={(e) => setConfig((c) => ({ ...c, name: e.target.value }))}
            className="min-w-[210px] flex-1 bg-transparent text-2xl font-bold tracking-tight outline-none"
            aria-label="Chatbot name"
          />
          <Toggle
            checked={config.status === "active"}
            onChange={(value) =>
              setConfig((c) => ({
                ...c,
                status: value ? "active" : "inactive",
              }))
            }
            label="Active status"
          />
          <span className="text-sm text-slate-500">
            {config.status === "active" ? "Active" : "Inactive"}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            ●{" "}
            {saveState === "saving"
              ? "Saving draft..."
              : saveState === "error"
                ? "Save failed"
                : "Draft saved just now"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {/* <div className="relative">
              <Button
                onClick={() => setVersionOpen((v) => !v)}
                className="border border-slate-200 bg-white text-slate-700"
              >
                v{versions[0]?.version || 1}.0 (Latest){" "}
                <ChevronDown size={15} />
              </Button>
              {versionOpen && (
                <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  {versions.length ? (
                    versions.map((v) => (
                      <p
                        key={v.version}
                        className="rounded p-2 text-xs hover:bg-slate-50"
                      >
                        v{v.version} · {v.date}
                        <br />
                        <span className="text-slate-500">{v.changes}</span>
                      </p>
                    ))
                  ) : (
                    <p className="p-2 text-xs text-slate-500">
                      No published version yet.
                    </p>
                  )}
                </div>
              )}
            </div> */}
            <Button
              onClick={() => void save()}
              className="border border-blue-500 bg-white text-blue-600"
            >
              <Save size={16} /> Save Draft
            </Button>
            <Button
              onClick={() => {
                if (!validateConfig()) setPublishOpen(true);
                else setError(validateConfig());
              }}
              className="bg-blue-600 text-white"
            >
              <Zap size={16} /> Publish
            </Button>
            <Button className="w-10 border border-slate-200 bg-white px-0 text-slate-600">
              <CircleEllipsis size={18} />
            </Button>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
          >
            <span className="min-w-0 flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded p-0.5 text-rose-500 hover:bg-rose-100"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </header>
      <nav className="mb-4 grid overflow-x-auto rounded-xl border border-slate-200 bg-white sm:grid-cols-3 lg:grid-cols-6">
        {steps.map(([title, subtitle], index) => (
          <button
            key={title}
            onClick={() => goToStep(index)}
            className={cn(
              "flex min-w-40 items-center gap-2 border-r border-slate-100 px-3 py-3 text-left last:border-0",
              step === index && "bg-blue-50",
              complete(index) && "bg-slate-50",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold",
                step === index
                  ? "border-blue-600 bg-blue-600 text-white"
                  : complete(index)
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 text-slate-600",
              )}
            >
              {complete(index) ? <Check size={16} /> : index + 1}
            </span>
            <span>
              <b className="block text-xs text-slate-900">{title}</b>
              <small className="block text-[10px] text-slate-500">
                {subtitle}
              </small>
            </span>
          </button>
        ))}
      </nav>
      <nav
        className="mb-4 grid grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 md:hidden"
        aria-label="Builder mobile panels"
      >
        {[
          ["configure", "Configure"],
          ["preview", "Preview"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={cn(
              "h-9 rounded-lg text-xs font-semibold",
              mobileTab === tab ? "bg-blue-600 text-white" : "text-slate-600",
            )}
          >
            {label}
          </button>
        ))}
      </nav>
      <main className="grid gap-4 lg:grid-cols-2">
        <div className={cn(mobileTab !== "configure" && "hidden md:block")}>
          <StepContent
            step={step}
            config={config}
            setConfig={setConfig}
            go={goToStep}
            showLanguageValidation={languageValidationAttempted}
            onError={(message) => {
              setError(message);
              if (message) setSaveState("error");
            }}
            onSaveAndReview={async () => {
              const saved = await save();
              if (saved) window.location.assign("/app/chatbots");
            }}
          />
        </div>
        <div className={cn(mobileTab !== "preview" && "hidden md:block")}>
          <WidgetPreview
            key={mobileTab}
            config={config}
            step={step}
            mobile={mobileTab === "preview"}
            onReset={() => setConfig((c) => ({ ...c }))}
          />
        </div>
      </main>
      {publishOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Publish Chatbot</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Version {(versions[0]?.version || 0) + 1} will become active
                  for visitors.
                </p>
              </div>
              <button onClick={() => setPublishOpen(false)}>
                <X size={19} />
              </button>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              • Updated chatbot configuration
              <br />• {config.languages.length} language(s) configured
              <br />• {config.leadCapture.fields.length} lead field(s)
              configured
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                onClick={() => setPublishOpen(false)}
                className="border border-slate-200 bg-white text-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void publish()}
                className="bg-blue-600 text-white"
              >
                Publish Version {(versions[0]?.version || 0) + 1}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
