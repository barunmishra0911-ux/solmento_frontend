/* Standalone public widget. It intentionally uses a shadow root so host-site CSS cannot restyle it. */
let activeInstance = null;

function getFemaleVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const femaleKeywords = [
    "female", "woman", "girl",
    "zira", "samantha", "victoria", "karen", "jenny",
    "aria", "sonia", "libby", "eva", "ava", "allison",
    "susan", "serena", "heera", "neerja", "swara",
    "priya", "aditi", "raveena", "veena", "ananya",
    "natasha", "stephanie", "linda", "joanna", "salli",
    "ivy", "kendra", "kimberly", "nicole", "amy", "emma"
  ];

  const isFemaleName = (name) => {
    const lower = (name || "").toLowerCase();
    return femaleKeywords.some((k) => lower.includes(k));
  };

  const isEn = (v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    return lang.startsWith("en");
  };

  const isEnIn = (v) => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const name = (v.name || "").toLowerCase();
    return lang === "en-in" || lang.startsWith("en-in") || name.includes("india");
  };

  // Priority 1: Indian English Female Voice
  const inFemale = voices.find((v) => isEnIn(v) && isFemaleName(v.name));
  if (inFemale) return inFemale;

  // Priority 2: Any English Female Voice (en-US, en-GB, en-AU, etc.)
  const enFemale = voices.find((v) => isEn(v) && isFemaleName(v.name));
  if (enFemale) return enFemale;

  // Priority 3: Any Indian English Voice
  const anyIn = voices.find((v) => isEnIn(v));
  if (anyIn) return anyIn;

  // Priority 4: Any English Voice
  const anyEn = voices.find((v) => isEn(v));
  if (anyEn) return anyEn;

  // Priority 5: Fallback to first available voice
  return voices[0] || null;
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function textWithBreaks(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function formatMessageHtml(value) {
  if (!value) return "";
  let escaped = escapeHtml(value);
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
  escaped = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)\"'>]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="widget-link">$1</a>'
  );
  escaped = escaped.replace(
    /(^|[^"'<>\w])(https?:\/\/[^\s<"'>]+)/g,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="widget-link">$2</a>'
  );

  const lines = escaped.split(/\r?\n/);
  const output = [];
  let inList = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const bulletMatch = line.match(/^(?:[\*\-\•]\s+)(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        output.push('<ul class="widget-list">');
        inList = true;
      }
      output.push(`<li>${bulletMatch[1]}</li>`);
    } else {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
      output.push(line);
    }
  }
  if (inList) output.push("</ul>");

  let html = "";
  for (let i = 0; i < output.length; i++) {
    const item = output[i];
    if (item === '<ul class="widget-list">' || item === "</ul>" || item.startsWith("<li>")) {
      html += item;
    } else if (item) {
      if (html && !html.endsWith("<br>") && !html.endsWith("</ul>")) {
        html += "<br>";
      }
      html += item;
    } else {
      if (html && !html.endsWith("<br>") && !html.endsWith("</ul>")) {
        html += "<br>";
      }
    }
  }
  return html;
}

function normalizeSuggestions(values) {
  const unique = [];
  const seen = new Set();
  for (const value of Array.isArray(values) ? values : []) {
    const raw = typeof value === "string" ? value : value?.text;
    const suggestion = String(raw || "").trim();
    const key = suggestion.toLowerCase();
    if (suggestion && !seen.has(key)) {
      seen.add(key);
      unique.push(suggestion);
    }
  }
  return unique;
}

function getRelatedSuggestions(message, reply, configuredSuggestions) {
  const list = Array.isArray(configuredSuggestions) ? configuredSuggestions : [];
  const normalized = normalizeSuggestions(list);
  if (normalized.length > 0) {
    return normalized.slice(0, 4);
  }
  return [];
}

function renderSuggestions(values) {
  const items = normalizeSuggestions(values).slice(0, 3);
  if (!items.length) return "";
  return `<div class="suggestions">${items
    .map(
      (question) =>
        `<button type="button" class="suggestion" data-suggestion="${escapeHtml(question)}">${escapeHtml(question)}</button>`,
    )
    .join("")}</div>`;
}

function resolveWidgetScriptApiBase() {
  if (typeof document === "undefined") return "";
  const widgetScript = Array.from(document.scripts || []).find((script) =>
    /\/widget\/chatbot-widget(?:\.min)?\.js(?:[?#]|$)/i.test(script.src || ""),
  );
  if (!widgetScript?.src) return "";
  try {
    const scriptUrl = new URL(widgetScript.src, window.location.href);
    if (["localhost", "127.0.0.1"].includes(scriptUrl.hostname)) {
      return `${scriptUrl.protocol}//${scriptUrl.hostname}:5000/api`;
    }
    return `${scriptUrl.origin}/api`;
  } catch {
    return "";
  }
}

function resolveApiBase(options = {}) {
  if (typeof options.apiBaseUrl === "string" && options.apiBaseUrl.trim()) {
    return options.apiBaseUrl.trim().replace(/\/$/, "");
  }
  const widgetScriptApiBase = resolveWidgetScriptApiBase();
  if (widgetScriptApiBase) return widgetScriptApiBase;
  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }
  return `${window.location.origin}/api`;
}

function normalizePosition(value) {
  const aliases = { "top-left": "left-middle", "top-right": "right-middle" };
  const position = aliases[value] || value;
  return [
    "bottom-left",
    "bottom-right",
    "left-middle",
    "right-middle",
  ].includes(position)
    ? position
    : "bottom-right";
}

function iconSvg() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4Zm-2-3h2m10 0h2M8 13h.01M16 13h.01M9 16h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function createVisitorId(publicId) {
  const storageKey = `solmento:widget:visitor:${publicId}`;
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;
    const generated = window.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
    window.localStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    return window.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  }
}

function getStoredChatType(publicId) {
  try {
    return window.localStorage.getItem(`solmento:widget:chat-type:${publicId}`) || "";
  } catch {
    return "";
  }
}

function storeChatType(publicId, chatType) {
  try {
    window.localStorage.setItem(`solmento:widget:chat-type:${publicId}`, chatType);
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
}

function getStoredConversationId(publicId) {
  try {
    return window.localStorage.getItem(`solmento:widget:conversation:${publicId}`) || "";
  } catch {
    return "";
  }
}

function storeConversationId(publicId, conversationId) {
  try {
    if (conversationId) {
      window.localStorage.setItem(`solmento:widget:conversation:${publicId}`, String(conversationId).trim());
    } else {
      window.localStorage.removeItem(`solmento:widget:conversation:${publicId}`);
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
}

function getStoredWidgetOpen(publicId) {
  try {
    return window.localStorage.getItem(`solmento:widget:open:${publicId}`) === "true";
  } catch {
    return false;
  }
}

function storeWidgetOpen(publicId, isOpen) {
  try {
    window.localStorage.setItem(`solmento:widget:open:${publicId}`, isOpen ? "true" : "false");
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }
}

function micIconSvg() {
  return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
}

function micOffIconSvg() {
  return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
}

function volumeIconSvg() {
  return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
}

function backIconSvg() {
  return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
}

function phoneIconSvg() {
  return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
}

function checkCircleIconSvg() {
  return '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
}

function getEnabledChatTypes(config) {
  const saved = config?.chatTypes;
  if (!saved || typeof saved !== "object") {
    return [{ key: "text", title: "Text Chat", detail: "Chat with us now" }];
  }
  return [
    { key: "text", title: "Text Chat", detail: "Chat with us now", enabled: saved.text === true },
    { key: "voice", title: "Voice Chat", detail: "Talk with our AI assistant", enabled: saved.voice === true },
    { key: "call", title: "Call Chat", detail: "Connect with our team", enabled: saved.call === true },
  ].filter((item) => item.enabled);
}

function getInitialView(config, leadCaptured, storedChatType, hasHistory = false) {
  const leadCapture = config?.leadCapture;
  if (leadCapture?.enabled !== false && leadCapture?.fields?.length && !leadCaptured) {
    return "lead";
  }
  const enabledTypes = getEnabledChatTypes(config);
  if (storedChatType === "text" && enabledTypes.some((item) => item.key === "text")) {
    return "chat";
  }
  if (storedChatType === "voice" && enabledTypes.some((item) => item.key === "voice")) {
    return "voice";
  }
  if (hasHistory && enabledTypes.some((item) => item.key === "text")) {
    return "chat";
  }
  if (config?.chatTypes?.enabled === true) return "types";
  return enabledTypes.some((item) => item.key === "text") ? "chat" : "types";
}

function getInputType(field) {
  if (field?.type === "email") return "email";
  if (field?.type === "phone") return "tel";
  if (field?.type === "number") return "number";
  return "text";
}

function getInputPattern(field) {
  return field?.type === "phone" ? ' pattern="\\+?[0-9()\\-\\s]{7,24}"' : "";
}

function cssFor(position, accent, dark) {
  const body = dark ? "#172033" : "#ffffff";
  const text = dark ? "#f8fafc" : "#0f172a";
  const surface = dark ? "#24324a" : "#eff6ff";
  const isLeft = position === "bottom-left" || position === "left-middle";
  const isMiddle = position.endsWith("-middle");
  const edge = isLeft ? "left:0" : "right:0";
  const launcherRadius = isMiddle
    ? isLeft
      ? "0 12px 12px 0"
      : "12px 0 0 12px"
    : "50%";
  const launcherPosition = isMiddle
    ? `top:50%;transform:translateY(-50%)`
    : "bottom:24px";
  const panelPosition = isMiddle
    ? `top:96px;bottom:96px;${isLeft ? "left:72px" : "right:72px"}`
    : `bottom:92px;${isLeft ? "left:24px" : "right:24px"}`;
  return `
    :host{all:initial;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:${text}}
    .root{all:initial;position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:inherit;color:${text}}
    button{font:inherit}
    .launcher{position:fixed;${edge};${launcherPosition};pointer-events:auto;border:0;background:${accent};color:#fff;box-shadow:0 8px 22px rgba(15,23,42,.2);cursor:pointer;border-radius:${launcherRadius};transition:transform .25s ease,box-shadow .25s ease;}
    .launcher:hover{box-shadow:0 10px 28px rgba(15,23,42,.3)}
    .launcher.circular{width:60px;height:60px;display:grid;place-items:center}
    .launcher.circular svg{width:29px;height:29px}
    .launcher.middle{height:fit-content;min-height:0;max-width:48px;padding:12px 7px;display:flex;flex-direction:column;align-items:center;gap:7px}
    .launcher.middle svg{width:20px;height:20px;flex:none}
    .launcher.middle span{display:inline-block;width:fit-content;max-width:100%;writing-mode:vertical-rl;transform:rotate(180deg);font-size:14px;font-weight:700;line-height:1.1;color:#fff;background:transparent;max-height:102px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .panel{position:fixed;${panelPosition};width:min(360px,calc(100vw - 32px));height:min(560px,calc(100vh - 128px));display:flex;flex-direction:column;pointer-events:auto;overflow:hidden;border-radius:16px;background:${body};box-shadow:0 16px 40px rgba(15,23,42,.25);opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .25s ease,transform .25s ease,visibility .25s ease}
    .panel.open{opacity:1;visibility:visible;transform:translateY(0)}
    .header{display:flex;align-items:center;gap:10px;padding:14px 16px;background:${accent};color:#fff;flex:none}
    .back-btn{display:grid;place-items:center;border:0;background:rgba(255,255,255,.2);color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;padding:0;flex:none;transition:background .2s ease}
    .back-btn:hover{background:rgba(255,255,255,.32)}
    .logo{width:38px;height:38px;flex:none;object-fit:cover;border-radius:10px;background:#fff}.logo.fallback{padding:8px;color:${accent};object-fit:contain}
    .heading{min-width:0;flex:1}.heading strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}.heading small{display:flex;align-items:center;gap:5px;font-size:12px}.online{width:7px;height:7px;border-radius:50%;background:#34d399}
    .close{border:0;background:transparent;color:#fff;font-size:23px;line-height:1;cursor:pointer;padding:3px}
    .messages{flex:1;overflow:auto;padding:18px 16px;background:${body};color:${text};overflow-anchor:auto}
    .flow-screen{min-height:100%;display:flex;align-items:flex-start;justify-content:center;padding:2px 0}.flow-card{width:100%;box-sizing:border-box;padding:14px;border:1px solid rgba(148,163,184,.24);border-radius:14px;background:${dark ? "#24324a" : "#ffffff"};box-shadow:0 2px 8px rgba(15,23,42,.06)}.flow-title{margin:0 0 12px;font-size:14px;font-weight:700;line-height:1.45}.flow-form{display:grid;gap:10px}.flow-field{display:grid;gap:5px;font-size:12px;font-weight:600}.flow-field span{overflow-wrap:anywhere}.flow-required{color:#dc2626}.flow-field input{width:100%;height:38px;box-sizing:border-box;border:1px solid #d8dee9;border-radius:8px;background:${dark ? "#172033" : "#fff"};color:${text};padding:8px 10px;outline:0;font:inherit;font-weight:400}.flow-field input:focus{border-color:${accent};box-shadow:0 0 0 3px ${accent}22}.flow-button{min-height:38px;border:0;border-radius:9px;background:${accent};color:#fff;padding:8px 12px;cursor:pointer;font-size:13px;font-weight:600}.flow-button:disabled{opacity:.55;cursor:not-allowed}.flow-options{display:grid;gap:9px}.flow-option{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;border:1px solid rgba(148,163,184,.3);border-radius:12px;background:${dark ? "#172033" : "#fff"};color:${text};padding:11px 12px;text-align:left;cursor:pointer}.flow-option:hover{border-color:${accent}}.flow-option-icon{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:9px;background:${accent}18;color:${accent};font-size:15px}.flow-option-copy{min-width:0;flex:1}.flow-option-title{display:block;font-size:13px;font-weight:700}.flow-option-detail{display:block;margin-top:2px;color:${dark ? "#cbd5e1" : "#64748b"};font-size:11px}.flow-error{margin-top:10px;border-radius:8px;background:#fee2e2;color:#991b1b;padding:8px 10px;font-size:12px;line-height:1.4}
    .call-avatar-wrap{display:grid;place-items:center;width:56px;height:56px;margin:4px auto 12px;border-radius:50%;background:${accent}18;color:${accent}}
    .call-avatar-wrap.success{background:#dcfce7;color:#10b981}
    .call-status-badge{display:inline-block;padding:3px 8px;border-radius:999px;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px}
    .call-status-box{margin:10px 0 14px;padding:12px;border-radius:10px;background:${surface};font-size:13px;line-height:1.5}
    .flow-button-secondary{background:transparent;border:1px solid ${accent};color:${accent};margin-top:6px}
    .flow-button-secondary:hover{background:${surface}}
    .back-link{display:block;margin-top:12px;border:0;background:transparent;color:${dark ? "#94a3b8" : "#64748b"};cursor:pointer;font-size:12px;text-align:center;text-decoration:underline;width:100%}
    .welcome{width:fit-content;max-width:88%;padding:12px 14px;border-radius:16px;background:${surface};font-size:14px;line-height:1.55;overflow-wrap:anywhere}
    .message{display:block;width:fit-content;max-width:88%;box-sizing:border-box;margin-top:10px;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.45;overflow-wrap:anywhere}.message.user{margin-left:auto;background:${accent};color:#fff}.message.bot{background:${surface}}
    .message a,.widget-link{color:${accent};text-decoration:underline;word-break:break-all;font-weight:600}
    .message a:hover,.widget-link:hover{opacity:.8}
    .message.user a,.message.user .widget-link{color:#fff;text-decoration:underline}
    .message code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:0.88em;padding:2px 5px;border-radius:4px;background:${dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.06)"}}
    .message-followup{margin-top:10px;font-weight:500;line-height:1.45}
    .widget-list{margin:6px 0;padding-left:18px;list-style-type:disc}
    .widget-list li{margin:3px 0;line-height:1.45}
    .message strong{font-weight:700}
    .suggestions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.suggestion{border:1px solid ${accent};border-radius:999px;background:transparent;color:${accent};padding:6px 10px;font-size:12px;line-height:1.2;cursor:pointer}.suggestion:hover{background:${surface}}
    .message.status-message{display:flex;align-items:center;gap:4px;color:${text};min-height:20px}.typing-dot{width:5px;height:5px;border-radius:50%;background:${accent};animation:solmento-widget-bounce 1s infinite ease-in-out}.typing-dot:nth-child(2){animation-delay:.15s}.typing-dot:nth-child(3){animation-delay:.3s}@keyframes solmento-widget-bounce{0%,80%,100%{opacity:.35;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
    .voice-live-bubble{display:block;width:fit-content;max-width:88%;box-sizing:border-box;margin-top:10px;margin-left:auto;padding:10px 12px;border-radius:14px;border-bottom-right-radius:4px;background:${accent};color:#fff;font-size:14px;line-height:1.45;overflow-wrap:anywhere}
    .voice-live-indicator{display:flex;align-items:center;gap:5px;margin-top:4px;font-size:10px;opacity:.9}.voice-live-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;animation:solmento-widget-pulse 1.2s infinite ease-in-out}@keyframes solmento-widget-pulse{0%,100%{opacity:.4;transform:scale(.9)}50%{opacity:1;transform:scale(1.2)}}
    .error{margin:0 16px 8px;padding:8px 10px;border-radius:8px;background:#fee2e2;color:#991b1b;font-size:12px}.retry{margin-top:6px;border:0;background:transparent;color:#991b1b;text-decoration:underline;cursor:pointer;padding:0;font:inherit}
    .composer{display:flex;align-items:center;gap:8px;padding:10px 12px;border-top:1px solid rgba(148,163,184,.25);background:${body};flex:none}.composer input{min-width:0;flex:1;height:44px;box-sizing:border-box;border:1px solid #d8dee9;border-radius:999px;background:${dark ? "#24324a" : "#fff"};box-shadow:0 1px 3px rgba(15,23,42,.08);color:${text};padding:11px 14px;outline:0;font:inherit;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:clip}.composer input:focus{border-color:${accent};box-shadow:0 0 0 3px ${accent}22}.composer button{display:grid;place-items:center;flex:none;width:42px;height:42px;border:0;border-radius:50%;background:${accent};color:#fff;cursor:pointer;font-size:18px;box-shadow:0 2px 5px rgba(15,23,42,.16)}.composer button:disabled{opacity:.5;cursor:not-allowed}
    .voice-panel{display:flex;flex-direction:column;align-items:center;padding:12px 16px 14px;border-top:1px solid rgba(148,163,184,.25);background:${body};flex:none;gap:8px}
    .voice-status-text{font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:${dark ? "#94a3b8" : "#64748b"}}
    .voice-status-text.active{color:#ef4444}
    .voice-status-text.thinking{color:${accent}}
    .voice-status-text.speaking{color:#10b981}
    .voice-visualizer{display:flex;align-items:center;justify-content:center;gap:2px;width:100%;height:32px;background:${dark ? "#1e293b" : "#f8fafc"};border-radius:8px;padding:2px 8px;box-sizing:border-box;overflow:hidden}
    .voice-bar{width:3px;height:4px;border-radius:2px;background:${accent};opacity:.35;transition:height .08s ease,opacity .08s ease}
    .voice-mic-btn{display:grid;place-items:center;width:56px;height:56px;border:0;border-radius:50%;background:${accent};color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(15,23,42,.2);transition:transform .2s ease,background .2s ease,box-shadow .2s ease}
    .voice-mic-btn:hover{transform:scale(1.05)}
    .voice-mic-btn.listening{background:#ef4444;box-shadow:0 0 0 0 rgba(239,68,68,.5);animation:solmento-mic-pulse 1.5s infinite}
    @keyframes solmento-mic-pulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.6)}70%{box-shadow:0 0 0 12px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
    .voice-footer{display:flex;align-items:center;gap:5px;font-size:11px;color:${dark ? "#94a3b8" : "#64748b"}}
    @media(max-width:600px){.launcher.circular{width:54px;height:54px;bottom:16px}.launcher.middle{min-height:0}.panel{width:calc(100vw - 24px);height:min(560px,calc(100vh - 32px));${isMiddle ? "top:16px;bottom:16px;" : "bottom:80px;"}${isLeft ? "left:12px" : "right:12px"}}}
  `;
}


function createWidget(options) {
  if (
    !options ||
    typeof options.publicId !== "string" ||
    !options.publicId.trim()
  ) {
    throw new Error("mainChatbotWidget.init requires a publicId.");
  }
  if (activeInstance) activeInstance.destroy();
  const trimmedPublicId = options.publicId.trim();
  const host = document.createElement("div");
  host.dataset.solmentoPublicWidget = "";
  const shadow = host.attachShadow({ mode: "open" });
  document.body.appendChild(host);
  let config = null;
  let activeConversationId = getStoredConversationId(trimmedPublicId);
  let open = getStoredWidgetOpen(trimmedPublicId);
  let loading = false;
  let messages = [];
  let error = "";
  let voiceError = "";
  let responsePhase = "";
  let lastFailedMessage = "";
  let draft = "";
  let flow = "loading";
  let flowError = "";
  let flowSubmitting = false;
  let leadValues = {};
  let leadInfo = null;
  let callPhone = "";
  let callName = "";
  let callSubmitting = false;
  let callError = "";
  let activeCallSession = null;
  let isVoiceListening = false;
  let liveVoiceTranscript = "";
  let isSpeakingTTS = false;
  let recognitionInstance = null;
  let audioContext = null;
  let analyser = null;
  let microphoneStream = null;
  let visualizerAnimFrame = null;
  let scrollAnimTimer = null;
  let activeSourceGenerationId = null;
  const BAR_COUNT = 36;
  const visitorId = createVisitorId(trimmedPublicId);
  const storedChatType = getStoredChatType(trimmedPublicId);
  const apiBase = resolveApiBase(options);

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  const instance = {
    destroy() {
      stopVoiceRecognition();
      stopAudioVisualizer();
      if (scrollAnimTimer) clearTimeout(scrollAnimTimer);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      host.remove();
      if (activeInstance === instance) activeInstance = null;
    },
    open() {
      open = true;
      storeWidgetOpen(trimmedPublicId, true);
      render({ scrollToLatest: true });
    },
    close() {
      open = false;
      storeWidgetOpen(trimmedPublicId, false);
      stopVoiceRecognition();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      render();
    },
    toggle() {
      open = !open;
      storeWidgetOpen(trimmedPublicId, open);
      if (!open) {
        stopVoiceRecognition();
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
      render({ scrollToLatest: open });
    },
  };
  activeInstance = instance;

  function stopAudioVisualizer() {
    if (visualizerAnimFrame) {
      cancelAnimationFrame(visualizerAnimFrame);
      visualizerAnimFrame = null;
    }
    if (microphoneStream) {
      microphoneStream.getTracks().forEach((track) => track.stop());
      microphoneStream = null;
    }
    if (audioContext) {
      if (audioContext.state !== "closed") {
        void audioContext.close().catch(() => { });
      }
      audioContext = null;
    }
    analyser = null;
    const bars = shadow.querySelectorAll(".voice-bar");
    bars.forEach((bar) => {
      bar.style.height = "4px";
      bar.style.opacity = "0.35";
    });
  }

  async function startAudioVisualizer() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStream = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);

      const updateBars = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(frequencyData);
        const bars = shadow.querySelectorAll(".voice-bar");
        const total = bars.length;
        for (let i = 0; i < total; i++) {
          const index = Math.floor((i / total) * frequencyData.length);
          const value = frequencyData[index] || 0;
          const height = Math.max(4, Math.min(28, 4 + value * 0.35));
          const bar = bars[i];
          if (bar) {
            bar.style.height = `${height}px`;
            bar.style.opacity = value > 15 ? "1" : "0.35";
          }
        }
        visualizerAnimFrame = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch {
      // Visualizer is optional; recognition will continue
    }
  }

  function updateLiveTranscript(text) {
    liveVoiceTranscript = text;
    const messagesContainer = shadow.querySelector(".messages");
    if (!messagesContainer) return;
    let bubble = shadow.querySelector(".voice-live-bubble");
    if (text) {
      if (!bubble) {
        bubble = document.createElement("div");
        bubble.className = "voice-live-bubble";
        const statusMsg = messagesContainer.querySelector(".status-message");
        if (statusMsg) {
          messagesContainer.insertBefore(bubble, statusMsg);
        } else {
          messagesContainer.appendChild(bubble);
        }
      }
      bubble.innerHTML = `${escapeHtml(text)}<div class="voice-live-indicator"><span class="voice-live-dot"></span> Listening…</div>`;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else if (bubble) {
      bubble.remove();
    }
  }

  function startVoiceRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceError = "Speech recognition is not supported in your browser.";
      render();
      return;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      isSpeakingTTS = false;
    }
    voiceError = "";
    liveVoiceTranscript = "";
    try {
      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch { }
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";
      recognition.maxAlternatives = 1;
      recognitionInstance = recognition;

      recognition.onstart = () => {
        isVoiceListening = true;
        voiceError = "";
        render({ scrollToLatest: true });
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        if (finalTranscript.trim()) {
          const spokenText = finalTranscript.trim();
          updateLiveTranscript("");
          stopVoiceRecognition();
          void sendVoiceMessage(spokenText);
        } else {
          updateLiveTranscript(interimTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        isVoiceListening = false;
        stopAudioVisualizer();
        if (event.error === "not-allowed") {
          voiceError = "Microphone access denied. Please allow microphone permissions.";
        } else if (event.error === "no-speech") {
          voiceError = "No speech detected. Please tap mic and try again.";
        } else {
          voiceError = "Voice recognition encountered an issue.";
        }
        render();
      };

      recognition.onend = () => {
        isVoiceListening = false;
        stopAudioVisualizer();
        render();
      };

      void startAudioVisualizer();
      recognition.start();
    } catch (err) {
      voiceError = "Unable to access microphone.";
      isVoiceListening = false;
      stopAudioVisualizer();
      render();
    }
  }

  function stopVoiceRecognition() {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch { }
      recognitionInstance = null;
    }
    isVoiceListening = false;
    stopAudioVisualizer();
  }

  async function sendVoiceMessage(value) {
    const message = String(value || "").trim();
    if (!message || loading || !config) return;
    voiceError = "";
    error = "";
    liveVoiceTranscript = "";
    messages = [...messages, { role: "user", text: message }];
    loading = true;
    responsePhase = "thinking";
    render({ scrollToLatest: true });

    let thinkingTimer;
    const requestSourceGen = activeSourceGenerationId;
    try {
      const responseRequest = fetch(
        `${apiBase}/public/widget/${encodeURIComponent(trimmedPublicId)}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            message,
            visitorId,
            ...(activeConversationId ? { conversationId: activeConversationId } : {}),
          }),
        },
      );
      const thinkingComplete = new Promise((resolve) => {
        thinkingTimer = setTimeout(() => {
          resolve();
        }, 2000);
      });

      const [response] = await Promise.all([responseRequest, thinkingComplete]);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to send message.");
      const result = payload.data || {};
      if (typeof result.reply !== "string" || !result.reply.trim())
        throw new Error("The chatbot did not return a response.");

      if (result.conversationId) {
        activeConversationId = result.conversationId;
        storeConversationId(trimmedPublicId, result.conversationId);
      }

      const resSourceGen = result.sourceGenerationId || null;
      if (activeSourceGenerationId && resSourceGen && resSourceGen !== activeSourceGenerationId) {
        console.warn("[Widget] Ignoring voice response from different source generation:", resSourceGen, "Current:", activeSourceGenerationId);
        return;
      }
      if (requestSourceGen && activeSourceGenerationId && requestSourceGen !== activeSourceGenerationId) {
        console.warn("[Widget] Active generation changed during voice request, ignoring response.");
        return;
      }
      if (activeSourceGenerationId === null && resSourceGen) {
        activeSourceGenerationId = resSourceGen;
      }

      const followUps = Array.isArray(result.followUpQuestions) && result.followUpQuestions.length > 0
        ? result.followUpQuestions
        : (Array.isArray(result.suggestions) ? result.suggestions : []);

      const relatedSuggestions = normalizeSuggestions(followUps).slice(0, 3);

      messages = [
        ...messages,
        {
          role: "bot",
          text: result.reply,
          answer: result.answer || result.reply,
          followUpPrompt: result.followUpPrompt || "",
          suggestions: relatedSuggestions,
          turnId: result.turnId || null,
          sourceGenerationId: resSourceGen,
        },
      ];

      loading = false;
      responsePhase = "";
      render({ scrollToLatest: true });

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result.reply);
        const femaleVoice = getFemaleVoice();
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          utterance.lang = femaleVoice.lang || "en-IN";
        } else {
          utterance.lang = "en-IN";
        }
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
        utterance.onstart = () => {
          isSpeakingTTS = true;
          render({ scrollToLatest: true });
        };
        utterance.onend = () => {
          isSpeakingTTS = false;
          render({ scrollToLatest: true });
        };
        utterance.onerror = () => {
          isSpeakingTTS = false;
          render({ scrollToLatest: true });
        };
        window.speechSynthesis.speak(utterance);
      }
    } catch (sendError) {
      voiceError = sendError.message || "Unable to process voice message.";
    } finally {
      clearTimeout(thinkingTimer);
      responsePhase = "";
      loading = false;
      render({ scrollToLatest: true });
    }
  }

  async function submitCallRequest() {
    if (callSubmitting || !config) return;
    const trimmedPhone = String(callPhone || "").trim();
    if (!trimmedPhone) {
      callError = "Please enter your phone number.";
      render({ scrollToLatest: true });
      return;
    }
    if (!/^\+?[0-9()\-\s]{7,24}$/.test(trimmedPhone)) {
      callError = "Please enter a valid phone number.";
      render({ scrollToLatest: true });
      return;
    }
    callSubmitting = true;
    callError = "";
    render({ scrollToLatest: true });
    try {
      const response = await fetch(
        `${apiBase}/public/widget/${encodeURIComponent(options.publicId.trim())}/call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ visitorId, phone: trimmedPhone, name: callName }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to register call request.");
      }
      activeCallSession = payload.data || {};
      leadInfo = { ...(leadInfo || {}), phone: trimmedPhone, ...(callName ? { name: callName } : {}) };
      flow = "call-status";
    } catch (err) {
      callError = err.message || "Unable to register call request.";
    } finally {
      callSubmitting = false;
      render({ scrollToLatest: true });
    }
  }

  function render({ scrollToLatest = false } = {}) {
    if (!config) {
      shadow.innerHTML = "";
      const style = document.createElement("style");
      style.textContent =
        ":host{all:initial}.loading{position:fixed;right:24px;bottom:24px;color:#64748b;font:13px system-ui}.loading.error{color:#b91c1c}";
      shadow.append(style);
      const loadingText = document.createElement("span");
      loadingText.className = `loading${error ? " error" : ""}`;
      loadingText.textContent = error || "Loading chatbot…";
      shadow.append(loadingText);
      return;
    }
    const position = normalizePosition(config.position);
    const dark =
      config.theme === "dark" ||
      (config.theme === "auto" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches);
    const accent = /^#[0-9a-f]{6}$/i.test(config.primaryColor)
      ? config.primaryColor
      : "#2563eb";
    const displayName = escapeHtml(config.name || "Chatbot AI");
    const isMiddle = position.endsWith("-middle");
    const launcherLabel = isMiddle ? `<span>${displayName}</span>` : "";
    const logoSource = config.logo ? escapeHtml(config.logo) : "";
    const logo = logoSource
      ? `<img class="logo" src="${logoSource}" alt="">`
      : `<span class="logo fallback">${iconSvg()}</span>`;

    const showBackButton = (flow === "chat" || flow === "voice" || flow === "call" || flow === "call-status") && config?.chatTypes?.enabled === true;
    const backButtonMarkup = showBackButton
      ? `<button type="button" class="back-btn" aria-label="Back to options">${backIconSvg()}</button>`
      : "";

    let lastBotIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "bot") {
        lastBotIndex = i;
        break;
      }
    }

    const renderedMessages = messages
      .map((item, index) => {
        let contentHtml = "";
        if (item.role === "bot") {
          const answerText = item.answer || item.text;
          const answerHtml = formatMessageHtml(answerText);
          const followUpHtml = item.followUpPrompt
            ? `<div class="message-followup">${formatMessageHtml(item.followUpPrompt)}</div>`
            : "";
          contentHtml = `${answerHtml}${followUpHtml}`;
        } else {
          contentHtml = formatMessageHtml(item.text);
        }

        const messageMarkup = `<div class="message ${item.role === "user" ? "user" : "bot"}">${contentHtml}</div>`;
        if (item.role !== "bot" || config.showQuestions === false || loading) return messageMarkup;
        // Only show suggestions under the latest bot message so chips are fresh and context-aware
        if (index !== lastBotIndex) return messageMarkup;

        const suggestionsToShow = Array.isArray(item.suggestions)
          ? item.suggestions
          : [];
        return `${messageMarkup}${renderSuggestions(suggestionsToShow)}`;
      })
      .join("");

    const responseIndicator = loading
      ? responsePhase === "thinking"
        ? '<div class="message bot status-message" aria-live="polite">Thinking…</div>'
        : '<div class="message bot status-message" aria-live="polite"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>'
      : "";

    const liveVoiceMarkup = liveVoiceTranscript
      ? `<div class="voice-live-bubble">${escapeHtml(liveVoiceTranscript)}<div class="voice-live-indicator"><span class="voice-live-dot"></span> Listening…</div></div>`
      : "";

    const welcomeText = config.welcomeMessage || "Hi there! How can I help you today?";
    const welcomeSuggestions = (config.showQuestions === false || loading || messages.length > 0)
      ? ""
      : renderSuggestions(config.suggestedQuestions);

    const leadFields = config.leadCapture?.fields || [];
    const leadForm = `<div class="flow-screen"><div class="flow-card"><p class="flow-title">Welcome! Please share your details to get started.</p><form class="lead-form flow-form">${leadFields.map((field) => `<label class="flow-field"><span>${escapeHtml(field.label)}${field.required ? ' <i class="flow-required">*</i>' : ""}</span><input class="lead-input" data-field-id="${escapeHtml(field.id)}" type="${getInputType(field)}"${getInputPattern(field)} value="${escapeHtml(leadValues[field.id] || "")}" ${field.required ? "required" : ""} autocomplete="off" /></label>`).join("")}<button class="flow-button" type="submit" ${flowSubmitting ? "disabled" : ""}>${flowSubmitting ? "Saving…" : "Next →"}</button>${flowError ? `<div class="flow-error">${escapeHtml(flowError)}</div>` : ""}</form></div></div>`;
    const enabledChatTypes = getEnabledChatTypes(config);
    const chatTypeOptions = enabledChatTypes.map((item) => `<button type="button" class="flow-option" data-chat-type="${item.key}"><span class="flow-option-icon">${item.key === "voice" ? "◉" : item.key === "call" ? "☎" : "▣"}</span><span class="flow-option-copy"><span class="flow-option-title">${item.title}</span><span class="flow-option-detail">${item.detail}</span></span><span aria-hidden="true">›</span></button>`).join("");
    const typeSelection = `<div class="flow-screen"><div class="flow-card"><p class="flow-title">${textWithBreaks(config.leadCapture?.afterMessage || "How would you like to connect with us?")}</p>${enabledChatTypes.length ? `<div class="flow-options">${chatTypeOptions}</div>` : "<div class=\"flow-error\">No chat type is currently available. Please contact the site administrator.</div>"}${flowError ? `<div class="flow-error">${escapeHtml(flowError)}</div>` : ""}</div></div>`;

    const textConversation = `<div class="messages"><div class="welcome">${textWithBreaks(welcomeText)}</div>${welcomeSuggestions}${renderedMessages}${responseIndicator}</div>${error ? `<div class="error">${escapeHtml(error)}${lastFailedMessage ? '<br><button type="button" class="retry">Try again</button>' : ""}</div>` : ""}<form class="composer"><input type="text" aria-label="Message" placeholder="Type your message..." maxlength="2000" value="${escapeHtml(draft)}" /><button class="send-button" type="submit" aria-label="Send" ${loading || !draft.trim() ? "disabled" : ""}>➤</button></form>`;

    const voiceStatusText = isVoiceListening
      ? '<span class="voice-status-text active">LISTENING</span>'
      : loading
        ? '<span class="voice-status-text thinking">THINKING…</span>'
        : isSpeakingTTS
          ? '<span class="voice-status-text speaking">SPEAKING…</span>'
          : '<span class="voice-status-text">Tap microphone and start speaking</span>';

    const voiceVisualizerBars = Array.from({ length: BAR_COUNT })
      .map(() => '<span class="voice-bar"></span>')
      .join("");

    const voiceConversation = `<div class="messages"><div class="welcome">${textWithBreaks(welcomeText)}</div>${welcomeSuggestions}${renderedMessages}${liveVoiceMarkup}${responseIndicator}</div>${voiceError ? `<div class="error">${escapeHtml(voiceError)}</div>` : ""}<div class="voice-panel">${voiceStatusText}<div class="voice-visualizer">${voiceVisualizerBars}</div><button type="button" class="voice-mic-btn ${isVoiceListening ? "listening" : ""}" aria-label="${isVoiceListening ? "Stop listening" : "Start speaking"}">${isVoiceListening ? micOffIconSvg() : micIconSvg()}</button><div class="voice-footer">${volumeIconSvg()}<span>${isVoiceListening ? "Voice recognition active" : isSpeakingTTS ? "AI is speaking…" : "Ready to listen"}</span></div></div>`;

    const callCard = `<div class="flow-screen"><div class="flow-card"><div class="call-avatar-wrap">${phoneIconSvg()}</div><p class="flow-title" style="text-align:center;margin-bottom:6px">Connect via Phone Call</p><p style="text-align:center;font-size:12px;color:${dark ? "#cbd5e1" : "#64748b"};margin:0 0 14px;line-height:1.4">Enter your phone number to receive a call from our AI admission assistant.</p><form class="call-form flow-form"><label class="flow-field"><span>Your Name (Optional)</span><input class="call-name-input" type="text" placeholder="e.g. John Doe" value="${escapeHtml(callName)}" autocomplete="name" /></label><label class="flow-field"><span>Phone Number <i class="flow-required">*</i></span><input class="call-phone-input" type="tel" placeholder="e.g. +91 98765 43210" pattern="\\+?[0-9()\\-\\s]{7,24}" value="${escapeHtml(callPhone)}" required autocomplete="tel" /></label><button class="flow-button call-submit-btn" type="submit" ${callSubmitting ? "disabled" : ""}>${callSubmitting ? "Initiating Call Request…" : "Request Call Now ☎"}</button>${callError ? `<div class="flow-error">${escapeHtml(callError)}</div>` : ""}</form></div></div>`;

    const callStatusCard = `<div class="flow-screen"><div class="flow-card" style="text-align:center"><div class="call-avatar-wrap success">${checkCircleIconSvg()}</div><span class="call-status-badge">${escapeHtml(activeCallSession?.status || "INITIATED")}</span><p class="flow-title" style="margin-bottom:6px">Call Request Registered</p><div class="call-status-box"><p style="margin:0 0 4px;font-weight:600">${escapeHtml(activeCallSession?.message || "Our AI counsellor will connect with you shortly.")}</p><p style="margin:0;font-size:12px;color:${dark ? "#94a3b8" : "#64748b"}">Destination: <strong>${escapeHtml(activeCallSession?.phone || callPhone)}</strong></p></div><button type="button" class="flow-button flow-button-secondary" data-switch-flow="chat" style="width:100%">Continue in Text Chat</button><button type="button" class="flow-button flow-button-secondary" data-switch-flow="voice" style="width:100%">Try Voice Chat</button><button type="button" class="back-link" data-switch-flow="types">Back to Main Options</button></div></div>`;

    let content = textConversation;
    if (flow === "lead") content = `<div class="messages">${leadForm}</div>`;
    else if (flow === "types") content = `<div class="messages">${typeSelection}</div>`;
    else if (flow === "voice") content = voiceConversation;
    else if (flow === "call") content = `<div class="messages">${callCard}</div>`;
    else if (flow === "call-status") content = `<div class="messages">${callStatusCard}</div>`;

    shadow.innerHTML = `<style>${cssFor(position, accent, dark)}</style><div class="root"><button type="button" class="launcher ${isMiddle ? "middle" : "circular"}" aria-label="Open ${displayName}">${isMiddle ? launcherLabel : iconSvg()}</button><section class="panel ${open ? "open" : ""}" role="dialog" aria-label="${displayName}"><header class="header">${backButtonMarkup}${logo}<div class="heading"><strong>${displayName}</strong><small><i class="online"></i>${escapeHtml(config.onlineText || "Online")}</small></div><button type="button" class="close" aria-label="Close chatbot">×</button></header>${content}</section></div>`;

    shadow
      .querySelector(".launcher")
      ?.addEventListener("click", instance.toggle);
    shadow.querySelector(".close")?.addEventListener("click", instance.close);
    shadow.querySelector(".back-btn")?.addEventListener("click", () => {
      stopVoiceRecognition();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      flow = "types";
      render({ scrollToLatest: true });
    });
    shadow.querySelector(".retry")?.addEventListener("click", () => {
      const retryMessage = lastFailedMessage;
      if (retryMessage) void sendMessage(retryMessage);
    });
    shadow.querySelector(".lead-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      void submitLead();
    });
    shadow.querySelectorAll(".lead-input").forEach((input) => {
      input.addEventListener("input", (event) => {
        leadValues[event.currentTarget.dataset.fieldId] = event.currentTarget.value;
      });
    });
    shadow.querySelectorAll("[data-chat-type]").forEach((button) => {
      button.addEventListener("click", () => selectChatType(button.dataset.chatType));
    });
    shadow
      .querySelectorAll("[data-suggestion]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          const sug = button.dataset.suggestion;
          if (flow === "voice") {
            void sendVoiceMessage(sug);
          } else {
            void sendMessage(sug);
          }
        }),
      );
    shadow.querySelector(".voice-mic-btn")?.addEventListener("click", () => {
      if (isVoiceListening) {
        stopVoiceRecognition();
      } else {
        startVoiceRecognition();
      }
    });
    shadow.querySelector(".composer")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = shadow.querySelector(".composer input");
      void sendMessage(input?.value || "");
    });
    shadow.querySelector(".composer input")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
      }
    });
    const composerInput = shadow.querySelector(".composer input");
    composerInput?.addEventListener("input", (event) => {
      draft = event.currentTarget.value;
      const sendButton = shadow.querySelector(".send-button");
      if (sendButton) sendButton.disabled = loading || !draft.trim();
    });

    // Call form event listeners
    shadow.querySelector(".call-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      void submitCallRequest();
    });
    shadow.querySelector(".call-phone-input")?.addEventListener("input", (event) => {
      callPhone = event.currentTarget.value;
    });
    shadow.querySelector(".call-name-input")?.addEventListener("input", (event) => {
      callName = event.currentTarget.value;
    });
    shadow.querySelectorAll("[data-switch-flow]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetFlow = btn.dataset.switchFlow;
        if (targetFlow === "chat" || targetFlow === "voice") {
          storeChatType(trimmedPublicId, targetFlow);
        }
        flow = targetFlow;
        render({ scrollToLatest: true });
      });
    });

    if (scrollToLatest) {
      const messagesContainer = shadow.querySelector(".messages");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        if (scrollAnimTimer) clearTimeout(scrollAnimTimer);
        scrollAnimTimer = setTimeout(() => {
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 50);
      }
    }
  }

  async function loadConfig() {
    try {
      const convParam = activeConversationId
        ? `&conversationId=${encodeURIComponent(activeConversationId)}`
        : "";
      const response = await fetch(
        `${apiBase}/public/widget/${encodeURIComponent(trimmedPublicId)}/config?visitorId=${encodeURIComponent(visitorId)}${convParam}`,
        { headers: { Accept: "application/json" } },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "This chatbot is unavailable.");
      config = payload.data?.config || null;
      if (!config) throw new Error("This chatbot is unavailable.");
      leadInfo = payload.data?.leadInfo || null;
      if (leadInfo?.phone && !callPhone) callPhone = leadInfo.phone;
      if (leadInfo?.name && !callName) callName = leadInfo.name;

      const returnedConvId = payload.data?.conversationId || null;
      if (returnedConvId) {
        activeConversationId = returnedConvId;
        storeConversationId(trimmedPublicId, returnedConvId);
      }

      const incomingSourceGen = payload.data?.sourceGenerationId || null;
      if (activeSourceGenerationId !== null && incomingSourceGen && activeSourceGenerationId !== incomingSourceGen) {
        messages = [];
      }
      activeSourceGenerationId = incomingSourceGen;
      messages = Array.isArray(payload.data?.history)
        ? payload.data.history
          .filter((item) => (item?.role === "user" || item?.role === "bot") && typeof item?.text === "string")
          .map((item) => ({
            role: item.role,
            text: item.text,
            answer: item.answer || null,
            followUpPrompt: item.followUpPrompt || null,
            suggestions: item.suggestions || null,
          }))
        : [];
      flow = getInitialView(config, payload.data?.leadCaptured === true, storedChatType, messages.length > 0);
    } catch (loadError) {
      error = loadError.message || "This chatbot is unavailable.";
    }
    render({ scrollToLatest: true });
  }

  async function submitLead() {
    if (flowSubmitting || !config) return;
    flowSubmitting = true;
    flowError = "";
    render();
    try {
      const response = await fetch(
        `${apiBase}/public/widget/${encodeURIComponent(trimmedPublicId)}/lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ fields: leadValues, visitorId }),
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to save your details.");
      }
      flow = getInitialView(config, true, storedChatType, messages.length > 0);
    } catch (submitError) {
      flowError = submitError.message || "Unable to save your details.";
    } finally {
      flowSubmitting = false;
      render({ scrollToLatest: true });
    }
  }

  function selectChatType(chatType) {
    flowError = "";
    if (chatType === "text") {
      storeChatType(trimmedPublicId, chatType);
      flow = "chat";
    } else if (chatType === "voice") {
      storeChatType(trimmedPublicId, chatType);
      flow = "voice";
    } else if (chatType === "call") {
      flow = "call";
      callError = "";
      if (leadInfo?.phone && !callPhone) callPhone = leadInfo.phone;
      if (leadInfo?.name && !callName) callName = leadInfo.name;
    }
    render({ scrollToLatest: true });
  }

  async function sendMessage(value) {
    const message = String(value || "");
    if (!message.trim() || loading || !config || flow !== "chat") return;
    error = "";
    lastFailedMessage = "";
    messages = [...messages, { role: "user", text: message }];
    loading = true;
    responsePhase = "thinking";
    draft = "";
    const input = shadow.querySelector(".composer input");
    if (input) input.value = "";
    render({ scrollToLatest: true });
    let thinkingTimer;
    const requestSourceGen = activeSourceGenerationId;
    try {
      const responseRequest = fetch(
        `${apiBase}/public/widget/${encodeURIComponent(trimmedPublicId)}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            message,
            visitorId,
            ...(activeConversationId ? { conversationId: activeConversationId } : {}),
          }),
        },
      );
      const thinkingComplete = new Promise((resolve) => {
        thinkingTimer = setTimeout(() => {
          responsePhase = "typing";
          render({ scrollToLatest: true });
          resolve();
        }, 950);
      });
      const [response] = await Promise.all([responseRequest, thinkingComplete]);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Unable to send message.");
      const result = payload.data || {};
      if (typeof result.reply !== "string" || !result.reply.trim())
        throw new Error("The chatbot did not return a response.");

      if (result.conversationId) {
        activeConversationId = result.conversationId;
        storeConversationId(trimmedPublicId, result.conversationId);
      }

      const resSourceGen = result.sourceGenerationId || null;
      if (activeSourceGenerationId && resSourceGen && resSourceGen !== activeSourceGenerationId) {
        console.warn("[Widget] Ignoring response from different source generation:", resSourceGen, "Current:", activeSourceGenerationId);
        return;
      }
      if (requestSourceGen && activeSourceGenerationId && requestSourceGen !== activeSourceGenerationId) {
        console.warn("[Widget] Active generation changed during request, ignoring response.");
        return;
      }
      if (activeSourceGenerationId === null && resSourceGen) {
        activeSourceGenerationId = resSourceGen;
      }

      const followUps = Array.isArray(result.followUpQuestions) && result.followUpQuestions.length > 0
        ? result.followUpQuestions
        : (Array.isArray(result.suggestions) ? result.suggestions : []);

      const relatedSuggestions = normalizeSuggestions(followUps).slice(0, 3);

      messages = [
        ...messages,
        {
          role: "bot",
          text: result.reply,
          answer: result.answer || result.reply,
          followUpPrompt: result.followUpPrompt || "",
          suggestions: relatedSuggestions,
          turnId: result.turnId || null,
          sourceGenerationId: resSourceGen,
        },
      ];
    } catch (sendError) {
      error = sendError.message || "Unable to send message.";
      lastFailedMessage = message;
    } finally {
      clearTimeout(thinkingTimer);
      responsePhase = "";
      loading = false;
      render({ scrollToLatest: true });
    }
  }

  render();
  void loadConfig();
  return instance;
}


if (typeof window !== "undefined") {
  window.mainChatbotWidget = {
    init(options) {
      return createWidget(options);
    },
    destroy() {
      activeInstance?.destroy();
    },
  };
}

