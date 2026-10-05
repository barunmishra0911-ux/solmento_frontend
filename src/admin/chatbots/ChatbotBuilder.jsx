import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  GripVertical,
  Info,
  Languages,
  MessageCircle,
  Paperclip,
  Plus,
  RotateCcw,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { formatChatbotDisplayName } from "../../chatbot/widgetPosition";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const models = [
  {
    id: "gpt-5",
    label: "GPT-5",
    description: "Best quality for complex admissions conversations.",
  },
  {
    id: "gpt-5-mini",
    label: "GPT-5 Mini",
    description: "Fast, efficient responses for high volume.",
  },
  {
    id: "claude",
    label: "Claude",
    description: "Thoughtful responses with strong writing quality.",
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Helpful multimodal reasoning for broad questions.",
  },
  {
    id: "custom",
    label: "Custom Model",
    description: "Connect your own model later through the API.",
  },
];
const personalities = [
  "Professional",
  "Friendly",
  "Helpful",
  "Concise",
  "Empathetic",
  "Formal",
  "Conversational",
];
const availableLanguages = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
];
const fieldTypes = [
  "Full Name",
  "Email",
  "Phone",
  "Course/Program",
  "Country",
  "Message",
  "Custom Field",
];
const triggerTypes = [
  "User explicitly requests a human",
  "AI confidence below threshold",
  "Negative sentiment detected",
  "Specific keyword detected",
  "Conversation exceeds message limit",
  "Business hours condition",
];

export function getInitialConfig() {
  return {
    id: "admissions-assistant",
    name: "Admissions Assistant",
    status: "active",
    model: "gpt-5",
    temperature: 0.35,
    tokenLimit: 900,
    personality: "Professional",
    personalityInstructions:
      "Be warm, accurate and reassuring. Guide prospective students one step at a time.",
    languages: ["English", "Hindi"],
    responseStyle: "Balanced",
    useBullets: true,
    useEmojis: false,
    askFollowUps: true,
    citeSources: true,
    fallback: {
      enabled: true,
      message:
        "I'm sorry, I couldn't find a confident answer. Would you like me to connect you with our admissions team?",
      retries: 2,
      escalate: true,
    },
    leadCapture: {
      enabled: true,
      timing: "During conversation",
      fields: [
        { id: "name", label: "Full Name", type: "Full Name", required: true },
        { id: "email", label: "Email Address", type: "Email", required: true },
        { id: "phone", label: "Phone Number", type: "Phone", required: false },
        {
          id: "program",
          label: "Program of Interest",
          type: "Course/Program",
          required: false,
        },
      ],
    },
    humanHandover: {
      enabled: true,
      rules: [
        {
          id: "human",
          type: "User explicitly requests a human",
          operator: "is",
          value: "true",
        },
        {
          id: "confidence",
          type: "AI confidence below threshold",
          operator: "below",
          value: "45%",
        },
      ],
    },
    businessHours: {
      enabled: true,
      reuseProfile: true,
      schedule: days.map((day, index) => ({
        day,
        open: index < 5,
        start: "09:00",
        end: "18:00",
      })),
    },
    welcomeMessage: "Hi! 👋 How can I help you today?",
    suggestedQuestions: [
      "What services do you provide?",
      "How can I get started?",
      "How do I contact support?",
    ],
    conversationRules: [
      { id: "clarify", label: "Ask clarifying questions", enabled: true },
      { id: "concise", label: "Keep answers concise", enabled: true },
      { id: "approved", label: "Stay within approved topics", enabled: true },
      { id: "honest", label: "Do not invent information", enabled: true },
      { id: "uncertain", label: "Escalate when uncertain", enabled: true },
      { id: "language", label: "Use configured language", enabled: true },
      { id: "context", label: "Remember conversation context", enabled: true },
    ],
    customRule: "",
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createBuilderConfig(chatbot, draftConfig = null) {
  const startMode = chatbot?.startMode || "template";
  const hasSavedBuilderConfig =
    draftConfig &&
    Object.keys(draftConfig).some((key) => key !== "websiteUrl");
  const base = {
    ...clone(getInitialConfig()),
    ...(draftConfig ? clone(draftConfig) : {}),
  };
  const blank = startMode === "blank" && !hasSavedBuilderConfig;
  return {
    ...base,
    id: String(chatbot?.id || base.id),
    name: chatbot?.name || base.name,
    status: chatbot?.status || base.status,
    startMode,
    ...(blank
      ? {
          languages: [],
          welcomeMessage: "",
          suggestedQuestions: [],
          fallback: { ...base.fallback, enabled: false, message: "", retries: 0, escalate: false },
          leadCapture: { ...base.leadCapture, enabled: false, fields: [] },
          humanHandover: { ...base.humanHandover, enabled: false, rules: [] },
          businessHours: { ...base.businessHours, enabled: false, reuseProfile: false },
        }
      : {}),
  };
}
function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex min-h-10 min-w-12 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
    >
      <span
        className={classNames(
          "relative block h-6 w-11 rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-slate-300",
        )}
      >
        <span
          className={classNames(
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

function Field({ label, children, hint, className = "" }) {
  return (
    <label className={classNames("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] leading-4 text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

function Select({ value, onChange, children, ariaLabel }) {
  return (
    <span className="relative block">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </span>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  summary,
  active,
  open,
  onToggle,
  children,
}) {
  return (
    <section
      className={classNames(
        "rounded-xl border bg-white",
        active ? "border-blue-200 shadow-sm" : "border-slate-200",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
      >
        <span
          className={classNames(
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
            active
              ? "bg-blue-100 text-blue-600"
              : "bg-slate-100 text-slate-500",
          )}
        >
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">
            {title}
          </span>
          {!open && (
            <span className="mt-0.5 block truncate text-[11px] text-slate-400">
              {summary}
            </span>
          )}
        </span>
        {open ? (
          <ChevronDown
            size={16}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
        ) : (
          <ChevronRight
            size={16}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
        )}
      </button>
      {open && (
        <div id={`${id}-content`} className="border-t border-slate-100 p-3.5">
          {children}
        </div>
      )}
    </section>
  );
}

function ModelConfig({ config, setConfig }) {
  const model = models.find((item) => item.id === config.model) || models[0];
  return (
    <div className="space-y-4">
      <Field label="Model">
        <Select
          value={config.model}
          onChange={(value) => setConfig((c) => ({ ...c, model: value }))}
          ariaLabel="AI model"
        >
          <option value="gpt-5">GPT-5</option>
          <option value="gpt-5-mini">GPT-5 Mini</option>
          <option value="claude">Claude</option>
          <option value="gemini">Gemini</option>
          <option value="custom">Custom Model</option>
        </Select>
      </Field>
      <p className="rounded-lg bg-blue-50 p-2.5 text-xs leading-5 text-blue-800">
        <Sparkles size={14} className="mr-1 inline" aria-hidden="true" />
        {model.description}
      </p>
      <Field
        label={
          <span className="flex justify-between">
            Temperature <output>{config.temperature.toFixed(2)}</output>
          </span>
        }
        hint="Lower values are focused; higher values are more creative."
      >
        <input
          aria-label="Temperature"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={config.temperature}
          onChange={(event) =>
            setConfig((c) => ({
              ...c,
              temperature: Number(event.target.value),
            }))
          }
          className="mt-1 w-full accent-blue-600"
        />
      </Field>
      <Field label="Output limit">
        <input
          type="number"
          min="100"
          max="4000"
          value={config.tokenLimit}
          onChange={(event) =>
            setConfig((c) => ({
              ...c,
              tokenLimit: Math.max(100, Number(event.target.value) || 100),
            }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </Field>
    </div>
  );
}

function PersonalityConfig({ config, setConfig }) {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap gap-2">
        {personalities.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setConfig((c) => ({ ...c, personality: item }))}
            className={classNames(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              config.personality === item
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <Field label="Additional instructions">
        <textarea
          value={config.personalityInstructions}
          onChange={(event) =>
            setConfig((c) => ({
              ...c,
              personalityInstructions: event.target.value,
            }))
          }
          rows={3}
          className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </Field>
    </div>
  );
}

function LanguageConfig({ config, setConfig }) {
  const add = (value) =>
    value &&
    !config.languages.includes(value) &&
    setConfig((c) => ({ ...c, languages: [...c.languages, value] }));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {config.languages.map((language) => (
          <span
            key={language}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
          >
            {language}
            <button
              type="button"
              aria-label={`Remove ${language}`}
              disabled={config.languages.length === 1}
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  languages: c.languages.filter((item) => item !== language),
                }))
              }
              className="rounded-full hover:bg-blue-100"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      <Select value="" onChange={add} ariaLabel="Add language">
        <option value="">Add language...</option>
        {availableLanguages
          .filter((item) => !config.languages.includes(item))
          .map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
      </Select>
      <p className="text-[11px] text-slate-400">
        At least one language is required for the chatbot.
      </p>
    </div>
  );
}

function ResponseStyleConfig({ config, setConfig }) {
  const toggle = (key) => setConfig((c) => ({ ...c, [key]: !c[key] }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
        {["Concise", "Balanced", "Detailed"].map((style) => (
          <button
            type="button"
            key={style}
            onClick={() => setConfig((c) => ({ ...c, responseStyle: style }))}
            className={classNames(
              "rounded-md px-2 py-2 text-xs font-semibold",
              config.responseStyle === style
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500",
            )}
          >
            {style}
          </button>
        ))}
      </div>
      {[
        ["useBullets", "Use bullet points"],
        ["useEmojis", "Use emojis"],
        ["askFollowUps", "Ask follow-up questions"],
        ["citeSources", "Cite sources when available"],
      ].map(([key, label]) => (
        <div key={key} className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-700">{label}</span>
          <Switch
            checked={config[key]}
            onChange={() => toggle(key)}
            label={label}
          />
        </div>
      ))}
    </div>
  );
}

function FallbackConfig({ config, setConfig }) {
  const fallback = config.fallback;
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Enable fallback
        </span>
        <Switch
          checked={fallback.enabled}
          onChange={(value) =>
            setConfig((c) => ({
              ...c,
              fallback: { ...c.fallback, enabled: value },
            }))
          }
          label="Enable fallback"
        />
      </div>
      <Field label="Fallback message">
        <textarea
          value={fallback.message}
          onChange={(event) =>
            setConfig((c) => ({
              ...c,
              fallback: { ...c.fallback, message: event.target.value },
            }))
          }
          rows={3}
          className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </Field>
      <Field label="Maximum retry attempts">
        <input
          type="number"
          min="0"
          max="5"
          value={fallback.retries}
          onChange={(event) =>
            setConfig((c) => ({
              ...c,
              fallback: { ...c.fallback, retries: Number(event.target.value) },
            }))
          }
          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />
      </Field>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700">Escalate to human</span>
        <Switch
          checked={fallback.escalate}
          onChange={(value) =>
            setConfig((c) => ({
              ...c,
              fallback: { ...c.fallback, escalate: value },
            }))
          }
          label="Escalate to human"
        />
      </div>
    </div>
  );
}

function LeadCaptureConfig({ config, setConfig }) {
  const lead = config.leadCapture;
  const update = (patch) =>
    setConfig((c) => ({ ...c, leadCapture: { ...c.leadCapture, ...patch } }));
  const addField = () =>
    update({
      fields: [
        ...lead.fields,
        {
          id: `field-${Date.now()}`,
          label: "Custom Field",
          type: "Custom Field",
          required: false,
        },
      ],
    });
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Enable lead capture
        </span>
        <Switch
          checked={lead.enabled}
          onChange={(value) => update({ enabled: value })}
          label="Enable lead capture"
        />
      </div>
      <Field label="Capture timing">
        <Select
          value={lead.timing}
          onChange={(value) => update({ timing: value })}
          ariaLabel="Lead capture timing"
        >
          <option>Before conversation</option>
          <option>During conversation</option>
          <option>After conversation</option>
        </Select>
      </Field>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Fields</p>
        <button
          type="button"
          onClick={addField}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <Plus size={14} /> Add field
        </button>
      </div>
      <div className="space-y-2">
        {lead.fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-slate-200 p-2.5"
          >
            <div className="flex items-center gap-2">
              <GripVertical
                size={15}
                className="shrink-0 text-slate-300"
                aria-hidden="true"
              />
              <input
                aria-label={`Field ${index + 1} label`}
                value={field.label}
                onChange={(event) =>
                  update({
                    fields: lead.fields.map((item) =>
                      item.id === field.id
                        ? { ...item, label: event.target.value }
                        : item,
                    ),
                  })
                }
                className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 px-2 text-xs"
              />
              <button
                type="button"
                aria-label={`Remove ${field.label}`}
                onClick={() =>
                  update({
                    fields: lead.fields.filter((item) => item.id !== field.id),
                  })
                }
                className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Select
                value={field.type}
                onChange={(value) =>
                  update({
                    fields: lead.fields.map((item) =>
                      item.id === field.id ? { ...item, type: value } : item,
                    ),
                  })
                }
                ariaLabel={`${field.label} field type`}
              >
                {fieldTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </Select>
              <label className="flex shrink-0 items-center gap-1.5 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) =>
                    update({
                      fields: lead.fields.map((item) =>
                        item.id === field.id
                          ? { ...item, required: event.target.checked }
                          : item,
                      ),
                    })
                  }
                  className="accent-blue-600"
                />{" "}
                Required
              </label>
            </div>
          </div>
        ))}
      </div>
      {!lead.fields.length && (
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          No fields yet. Add the information your admissions team needs.
        </p>
      )}
    </div>
  );
}

function HandoverConfig({ config, setConfig }) {
  const handover = config.humanHandover;
  const update = (patch) =>
    setConfig((c) => ({
      ...c,
      humanHandover: { ...c.humanHandover, ...patch },
    }));
  const addRule = () =>
    update({
      rules: [
        ...handover.rules,
        {
          id: `rule-${Date.now()}`,
          type: triggerTypes[0],
          operator: "is",
          value: "true",
        },
      ],
    });
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Enable human handover
        </span>
        <Switch
          checked={handover.enabled}
          onChange={(value) => update({ enabled: value })}
          label="Enable human handover"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Trigger rules</p>
        <button
          type="button"
          onClick={addRule}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
        >
          <Plus size={14} /> Add rule
        </button>
      </div>
      {handover.rules.map((rule) => (
        <div key={rule.id} className="rounded-lg border border-slate-200 p-2.5">
          <div className="flex items-center gap-2">
            <Select
              value={rule.type}
              onChange={(value) =>
                update({
                  rules: handover.rules.map((item) =>
                    item.id === rule.id ? { ...item, type: value } : item,
                  ),
                })
              }
              ariaLabel="Trigger type"
            >
              {triggerTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
            <button
              type="button"
              aria-label="Remove trigger rule"
              onClick={() =>
                update({
                  rules: handover.rules.filter((item) => item.id !== rule.id),
                })
              }
              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Select
              value={rule.operator}
              onChange={(value) =>
                update({
                  rules: handover.rules.map((item) =>
                    item.id === rule.id ? { ...item, operator: value } : item,
                  ),
                })
              }
              ariaLabel="Rule operator"
            >
              <option value="is">is</option>
              <option value="below">below</option>
              <option value="contains">contains</option>
              <option value="exceeds">exceeds</option>
            </Select>
            <input
              value={rule.value}
              onChange={(event) =>
                update({
                  rules: handover.rules.map((item) =>
                    item.id === rule.id
                      ? { ...item, value: event.target.value }
                      : item,
                  ),
                })
              }
              aria-label="Rule value"
              className="h-10 min-w-0 rounded-lg border border-slate-200 px-2 text-xs"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BusinessHoursConfig({ config, setConfig }) {
  const hours = config.businessHours;
  const updateSchedule = (day, patch) =>
    setConfig((c) => ({
      ...c,
      businessHours: {
        ...c.businessHours,
        schedule: c.businessHours.schedule.map((item) =>
          item.day === day ? { ...item, ...patch } : item,
        ),
      },
    }));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Use business hours
        </span>
        <Switch
          checked={hours.enabled}
          onChange={(value) =>
            setConfig((c) => ({
              ...c,
              businessHours: { ...c.businessHours, enabled: value },
            }))
          }
          label="Use business hours"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Reuse from Company Profile
        </span>
        <Switch
          checked={hours.reuseProfile}
          onChange={(value) =>
            setConfig((c) => ({
              ...c,
              businessHours: { ...c.businessHours, reuseProfile: value },
            }))
          }
          label="Reuse from profile"
        />
      </div>
      {!hours.reuseProfile && (
        <div className="space-y-2">
          {hours.schedule.map((item) => (
            <div
              key={item.day}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs"
            >
              <span className="text-slate-600">{item.day.slice(0, 3)}</span>
              <input
                type="time"
                disabled={!item.open}
                value={item.start}
                onChange={(event) =>
                  updateSchedule(item.day, { start: event.target.value })
                }
                className="h-8 min-w-0 rounded border border-slate-200 px-1"
              />
              <input
                type="time"
                disabled={!item.open}
                value={item.end}
                onChange={(event) =>
                  updateSchedule(item.day, { end: event.target.value })
                }
                className="h-8 min-w-0 rounded border border-slate-200 px-1"
              />
              <label className="col-span-3 flex items-center gap-1 text-[11px] text-slate-500">
                <input
                  type="checkbox"
                  checked={item.open}
                  onChange={(event) =>
                    updateSchedule(item.day, { open: event.target.checked })
                  }
                  className="accent-blue-600"
                />{" "}
                Open
              </label>
            </div>
          ))}
        </div>
      )}
      <p className="rounded-lg bg-slate-50 p-2.5 text-[11px] leading-4 text-slate-500">
        Outside these hours, the bot can use the fallback or handover rule.
      </p>
    </div>
  );
}

function WelcomeConfig({ config, setConfig }) {
  return (
    <Field
      label={
        <span className="flex justify-between">
          Welcome message <output>{config.welcomeMessage.length}/240</output>
        </span>
      }
    >
      <textarea
        maxLength={240}
        rows={4}
        value={config.welcomeMessage}
        onChange={(event) =>
          setConfig((c) => ({ ...c, welcomeMessage: event.target.value }))
        }
        className="w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </Field>
  );
}

function QuestionsConfig({ config, setConfig }) {
  const update = (questions) =>
    setConfig((c) => ({ ...c, suggestedQuestions: questions }));
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">
          Suggested questions
        </p>
        <button
          type="button"
          disabled={config.suggestedQuestions.length >= 6}
          onClick={() => update([...config.suggestedQuestions, "New question"])}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 disabled:opacity-40"
        >
          <Plus size={14} /> Add question
        </button>
      </div>
      {config.suggestedQuestions.map((question, index) => (
        <div key={`${question}-${index}`} className="flex items-center gap-2">
          <input
            aria-label={`Suggested question ${index + 1}`}
            value={question}
            onChange={(event) =>
              update(
                config.suggestedQuestions.map((item, itemIndex) =>
                  itemIndex === index ? event.target.value : item,
                ),
              )
            }
            className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 text-xs"
          />
          <button
            type="button"
            aria-label={`Delete question ${index + 1}`}
            onClick={() =>
              update(
                config.suggestedQuestions.filter(
                  (_, itemIndex) => itemIndex !== index,
                ),
              )
            }
            className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      {!config.suggestedQuestions.length && (
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Add a question to give visitors a helpful starting point.
        </p>
      )}
    </div>
  );
}

function RulesConfig({ config, setConfig }) {
  const updateRules = (rules) =>
    setConfig((c) => ({ ...c, conversationRules: rules }));
  return (
    <div className="space-y-2.5">
      {config.conversationRules.map((rule) => (
        <div key={rule.id} className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-700">{rule.label}</span>
          <Switch
            checked={rule.enabled}
            onChange={(value) =>
              updateRules(
                config.conversationRules.map((item) =>
                  item.id === rule.id ? { ...item, enabled: value } : item,
                ),
              )
            }
            label={rule.label}
          />
        </div>
      ))}
      <Field label="Custom rule">
        <textarea
          value={config.customRule}
          onChange={(event) =>
            setConfig((c) => ({ ...c, customRule: event.target.value }))
          }
          rows={2}
          placeholder="Example: Always mention the official application portal."
          className="w-full resize-y rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </Field>
    </div>
  );
}

const sectionMeta = [
  ["model", "Model", "GPT-5 · temperature 0.35", Sparkles],
  ["personality", "Personality", "Professional", UserRound],
  ["language", "Language", "English, Hindi", Languages],
  ["style", "Response Style", "Balanced", Zap],
  ["fallback", "Fallback", "Enabled · 2 retries", RotateCcw],
  ["lead", "Lead Capture", "4 fields · during chat", UsersRound],
  ["handover", "Human Handover", "2 trigger rules", ShieldCheck],
  ["hours", "Business Hours", "Reusing profile hours", Clock3],
  ["welcome", "Welcome Message", "Personalized greeting", MessageCircle],
  ["questions", "Suggested Questions", "4 questions", Copy],
  ["rules", "Conversation Rules", "6 enabled", Settings2],
];

function getSectionSummary(id, config, fallback) {
  if (id === "model") return `${models.find((model) => model.id === config.model)?.label || "Model"} · temperature ${config.temperature.toFixed(2)}`;
  if (id === "personality") return config.personality;
  if (id === "language") return config.languages.length ? config.languages.join(", ") : "No language selected";
  if (id === "style") return config.responseStyle;
  if (id === "fallback") return config.fallback.enabled ? `Enabled · ${config.fallback.retries} retries` : "Disabled";
  if (id === "lead") return config.leadCapture.enabled ? `${config.leadCapture.fields.length} fields · ${config.leadCapture.timing}` : "Disabled";
  if (id === "handover") return config.humanHandover.enabled ? `${config.humanHandover.rules.length} trigger rules` : "Disabled";
  if (id === "hours") return config.businessHours.enabled ? (config.businessHours.reuseProfile ? "Reusing profile hours" : "Custom schedule") : "Disabled";
  if (id === "welcome") return config.welcomeMessage.trim() ? "Personalized greeting" : "Not configured";
  if (id === "questions") return `${config.suggestedQuestions.length} questions`;
  if (id === "rules") return `${config.conversationRules.filter((rule) => rule.enabled).length} enabled`;
  return fallback;
}

function ConfigPanel({
  config,
  setConfig,
  openSections,
  setOpenSections,
  activeSection,
  setActiveSection,
}) {
  const content = {
    model: <ModelConfig config={config} setConfig={setConfig} />,
    personality: <PersonalityConfig config={config} setConfig={setConfig} />,
    language: <LanguageConfig config={config} setConfig={setConfig} />,
    style: <ResponseStyleConfig config={config} setConfig={setConfig} />,
    fallback: <FallbackConfig config={config} setConfig={setConfig} />,
    lead: <LeadCaptureConfig config={config} setConfig={setConfig} />,
    handover: <HandoverConfig config={config} setConfig={setConfig} />,
    hours: <BusinessHoursConfig config={config} setConfig={setConfig} />,
    welcome: <WelcomeConfig config={config} setConfig={setConfig} />,
    questions: <QuestionsConfig config={config} setConfig={setConfig} />,
    rules: <RulesConfig config={config} setConfig={setConfig} />,
  };
  return (
    <div className="space-y-2.5">
      {sectionMeta.map(([id, title, summary, Icon]) => (
        <Section
          key={id}
          id={id}
          icon={Icon}
          title={title}
          summary={getSectionSummary(id, config, summary)}
          active={activeSection === id}
          open={openSections.includes(id)}
          onToggle={() => {
            setActiveSection(id);
            setOpenSections((items) =>
              items.includes(id)
                ? items.filter((item) => item !== id)
                : [...items, id],
            );
          }}
        >
          {content[id]}
        </Section>
      ))}
    </div>
  );
}

function ChatPreview({ config, messages, onSend, onReset, typing }) {
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);
  const isBlank = config.startMode === "blank" && !config.welcomeMessage.trim() && !config.suggestedQuestions.length;
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);
  const send = (text = draft) => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setDraft("");
  };
  return (
    <div className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 p-4">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
          <Bot size={22} />
          <span
            className={classNames(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
              config.status === "active" ? "bg-emerald-500" : "bg-slate-400",
            )}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {formatChatbotDisplayName(config.name || "Unnamed chatbot")}
          </p>
          <p className="text-xs text-slate-500">{isBlank ? "Draft" : config.status === "active" ? "Online now" : "Currently inactive"}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-700"
          aria-label="Reset conversation"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto bg-white p-4"
      >
        <div className="mb-4 text-center text-[11px] text-slate-400">
          Live preview · changes appear instantly
        </div>
        {isBlank ? (
          <div className="grid min-h-72 place-items-center px-6 text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-600 shadow-sm"><Bot size={32} /></span>
              <p className="mt-4 text-sm font-bold text-slate-800">Your chatbot is ready to be configured</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">No welcome message, replies, or actions have been added yet. Configure this chatbot to start creating its experience.</p>
            </div>
          </div>
        ) : messages.filter((message) => message.text.trim()).map((message) => (
          <div
            key={message.id}
            className={classNames(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={classNames(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-5",
                message.role === "user"
                  ? "rounded-br-md bg-blue-600 text-white"
                  : "rounded-bl-md bg-slate-100 text-slate-700",
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-slate-400">
              <span className="inline-flex gap-1">
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
        {!isBlank && !typing && config.suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {config.suggestedQuestions.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => send(question)}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                {question}
              </button>
            ))}
          </div>
        )}
        {!isBlank && config.leadCapture.enabled && config.leadCapture.fields.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">Share your details</p>
            <div className="mt-2 space-y-2">
              {config.leadCapture.fields.slice(0, 3).map((field) => (
                <div key={field.id} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-400">
                  {field.label}{field.required ? " *" : ""}
                </div>
              ))}
            </div>
          </div>
        )}
        {!isBlank && config.humanHandover.enabled && (
          <button type="button" className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
            Talk to a team member
          </button>
        )}
        {!isBlank && config.fallback.enabled && config.fallback.message.trim() && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Fallback: {config.fallback.message}</p>
        )}
      </div>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
          <button
            type="button"
            aria-label="Attach file"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
          >
            <Paperclip size={17} />
          </button>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") send();
            }}
            placeholder={isBlank ? "Configure your chatbot to continue" : config.status === "active" ? "Type a message..." : "Chatbot is inactive"}
            disabled={isBlank || config.status !== "active" || typing}
            className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            aria-label="Send message"
            onClick={() => send()}
            disabled={isBlank || !draft.trim() || config.status !== "active" || typing}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContextPanel({ config, activeSection }) {
  const details = {
    model: [
      "Model information",
      "GPT-5 is optimized for accurate, nuanced admissions guidance.",
      "Recommended for: complex student questions",
      `Temperature ${config.temperature.toFixed(2)} · ${config.tokenLimit} output tokens`,
    ],
    personality: [
      "Personality guidance",
      `${config.personality} responses keep the conversation aligned with your brand voice.`,
      "The preview uses this tone in mock replies.",
      config.personalityInstructions,
    ],
    language: [
      "Language coverage",
      "The chatbot can reply in each selected language and follows the visitor's preference.",
      `${config.languages.length} language${config.languages.length === 1 ? "" : "s"} configured`,
      config.languages.join(" · "),
    ],
    lead: [
      "Lead capture summary",
      "Collect only the details your admissions team needs to follow up.",
      `${config.leadCapture.fields.length} fields · ${config.leadCapture.timing}`,
      `${config.leadCapture.fields.filter((field) => field.required).length} required · ${config.leadCapture.fields.length} total`,
    ],
    handover: [
      "Handover guidance",
      "Rules transfer conversations to a human when automation should stop.",
      `${config.humanHandover.rules.length} trigger rules`,
      config.humanHandover.enabled
        ? "Handover is enabled"
        : "Handover is disabled",
    ],
  };
  const detail = details[activeSection] || [
    "Chatbot configuration",
    "Tune your assistant from the configuration panel and review the result in the live preview.",
    "Changes are saved securely to your workspace.",
    "Tip: start with the welcome message and suggested questions.",
  ];
  return (
    <aside className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Info size={18} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{detail[0]}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{detail[1]}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-3.5">
          <p className="text-xs font-semibold text-slate-700">
            Current setting
          </p>
          <p className="mt-1 text-sm text-slate-600">{detail[2]}</p>
          <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
            {detail[3]}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
          <Sparkles size={15} /> Recommendation
        </div>
        <p className="mt-2 text-xs leading-5 text-blue-800">
          Keep the assistant transparent about admissions deadlines and offer a
          human handover whenever confidence is low.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold text-slate-700">
          Configuration health
        </p>
        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Languages</span>
            <span className="font-semibold text-emerald-700">
              {config.languages.length ? "Ready" : "Missing"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Welcome message</span>
            <span className="font-semibold text-emerald-700">
              {config.welcomeMessage.trim() ? "Ready" : "Missing"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lead fields</span>
            <span className="font-semibold text-emerald-700">
              {config.leadCapture.fields.length ? "Ready" : "Optional"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PublishModal({ changes, nextVersion, previousVersion, onCancel, onPublish, publishing }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="publish-title" className="text-xl font-bold text-slate-950">
              Publish changes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Version {nextVersion} will become the active configuration for visitors.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close publish dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {previousVersion ? `Changes since version ${previousVersion}` : "Initial published version"}
          </p>
          {changes.length ? (
            <ul className="mt-3 space-y-2">
              {changes.map((change) => (
                <li
                  key={change}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  {change}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No configuration changes detected.
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={publishing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {publishing ? "Publishing..." : `Publish Version ${nextVersion}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatbotBuilder({
  initialConfig,
  initialPublishedConfig,
  initialVersions = [],
  onSaveDraft,
  onPublish,
  previewMode = false,
}) {
  const initialBuilderConfig = initialConfig || getInitialConfig();
  const [config, setConfig] = useState(() =>
    clone(initialBuilderConfig),
  );
  const [lastSaved, setLastSaved] = useState(() =>
    clone(initialBuilderConfig),
  );
  const [lastPublished, setLastPublished] = useState(() =>
    clone(initialPublishedConfig || initialBuilderConfig),
  );
  const [openSections, setOpenSections] = useState(["model", "personality"]);
  const [activeSection, setActiveSection] = useState("model");
  const [mobileTab, setMobileTab] = useState("configure");
  const [saveState, setSaveState] = useState("saved");
  const [error, setError] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [headerNameFocused, setHeaderNameFocused] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versions, setVersions] = useState(initialVersions);
  const [messages, setMessages] = useState(() => initialBuilderConfig.welcomeMessage ? [
    { id: "welcome", role: "bot", text: initialBuilderConfig.welcomeMessage },
  ] : []);
  const [typing, setTyping] = useState(false);
  const autosaveTimer = useRef(null);
  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(lastSaved),
    [config, lastSaved],
  );

  useEffect(() => {
    setSaveState(dirty ? "unsaved" : "saved");
  }, [dirty]);
  useEffect(() => {
    setMessages((items) => {
      const welcomeIndex = items.findIndex((item) => item.id === "welcome");
      if (welcomeIndex === -1) {
        return config.welcomeMessage.trim()
          ? [{ id: "welcome", role: "bot", text: config.welcomeMessage }, ...items]
          : items;
      }
      return config.welcomeMessage.trim()
        ? items.map((item) => item.id === "welcome" ? { ...item, text: config.welcomeMessage } : item)
        : items.filter((item) => item.id !== "welcome");
    });
  }, [config.welcomeMessage]);

  const validate = useCallback(() => {
    if (!config.name.trim()) return "Chatbot name is required.";
    if (config.startMode !== "blank" && !config.languages.length) return "Select at least one language.";
    if (config.leadCapture.fields.some((field) => !field.label.trim()))
      return "Every lead field needs a label.";
    if (config.suggestedQuestions.some((question) => !question.trim()))
      return "Suggested questions cannot be empty.";
    if (
      config.businessHours.schedule.some(
        (item) => item.open && item.start >= item.end,
      )
    )
      return "Business-hour closing time must be after opening time.";
    return "";
  }, [config]);
  const saveDraft = useCallback(
    async () => {
      const validationError = validate();
      if (validationError) {
        setError(validationError);
        setSaveState("error");
        return false;
      }
      setSaveState("saving");
      try {
        const saved = await onSaveDraft(config);
        const savedConfig = saved.draftConfig || config;
        setConfig(clone(savedConfig));
        setLastSaved(clone(savedConfig));
        setVersions(saved.versions || []);
        setSaveState("saved");
        setError("");
        return true;
      } catch (cause) {
        setError(cause.message || "Unable to save this chatbot draft.");
        setSaveState("error");
        return false;
      }
    },
    [config, onSaveDraft, validate],
  );
  useEffect(() => {
    if (!dirty) return undefined;
    autosaveTimer.current = window.setTimeout(() => { void saveDraft(); }, 30_000);
    return () => window.clearTimeout(autosaveTimer.current);
  }, [dirty, saveDraft]);
  const sendMessage = (text) => {
    setMessages((items) => [
      ...items,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      const response =
        config.personality === "Concise"
          ? "I can help with that. Which program are you interested in?"
          : `Thanks for your question. I can help you with ${text.toLowerCase()}. Would you like to share the program you are considering?`;
      setMessages((items) => [
        ...items,
        { id: `bot-${Date.now()}`, role: "bot", text: response },
      ]);
    }, 650);
  };
  const changes = useMemo(() => {
    const list = [];
    if (config.personality !== lastPublished.personality)
      list.push("Personality updated");
    if (config.welcomeMessage !== lastPublished.welcomeMessage)
      list.push("Welcome message updated");
    if (
      config.leadCapture.fields.length !==
      lastPublished.leadCapture.fields.length
    )
      list.push("Lead capture fields changed");
    if (
      config.suggestedQuestions.length !==
      lastPublished.suggestedQuestions.length
    )
      list.push(
        `${Math.abs(config.suggestedQuestions.length - lastPublished.suggestedQuestions.length)} suggested questions changed`,
      );
    if (
      config.businessHours.reuseProfile !==
      lastPublished.businessHours.reuseProfile
    )
      list.push("Business hours updated");
    return list;
  }, [config, lastPublished]);
  const nextVersion = (versions[0]?.version || 0) + 1;
  const publish = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSaveState("error");
      return;
    }
    setPublishing(true);
    setSaveState("saving");
    try {
      const published = await onPublish(config, changes);
      const publishedConfig = published.publishedConfig || config;
      setConfig(clone(published.draftConfig || publishedConfig));
      setLastSaved(clone(published.draftConfig || publishedConfig));
      setLastPublished(clone(publishedConfig));
      setVersions(published.versions || []);
      setPublishing(false);
      setShowPublish(false);
      setSaveState("saved");
      setError("");
    } catch (cause) {
      setPublishing(false);
      setSaveState("error");
      setError(cause.message || "Unable to publish this chatbot.");
    }
  };
  const headerName = (event) =>
    setConfig((current) => ({ ...current, name: event.target.value }));

  return (
    <div className="flex min-h-0 flex-col gap-4 text-slate-900">
      <header className="sticky top-0 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[180px] flex-1">
            <div className="flex items-center gap-2">
              <Bot size={19} className="text-blue-600" aria-hidden="true" />
              <input
                aria-label="Chatbot name"
                value={
                  headerNameFocused
                    ? config.name
                    : formatChatbotDisplayName(config.name)
                }
                onFocus={() => setHeaderNameFocused(true)}
                onBlur={() => setHeaderNameFocused(false)}
                onChange={headerName}
                className="min-w-0 max-w-xs border-b border-transparent bg-transparent text-lg font-bold tracking-tight text-slate-950 outline-none focus:border-blue-400"
              />
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span
                className={classNames(
                  "h-2 w-2 rounded-full",
                  config.status === "active"
                    ? "bg-emerald-500"
                    : "bg-slate-400",
                )}
              />
              {config.status === "active" ? "Active" : "Inactive"}
              <span className="text-slate-300">·</span>
              <span>
                {saveState === "saving"
                  ? "Saving..."
                  : saveState === "unsaved"
                    ? "Unsaved changes"
                    : saveState === "error"
                      ? "Save failed"
                      : "Saved"}
              </span>
              {previewMode && <><span className="text-slate-300">·</span><span className="font-medium text-violet-600">Preview mode</span></>}
            </div>
          </div>
          <Switch
            checked={config.status === "active"}
            onChange={(value) =>
              setConfig((c) => ({
                ...c,
                status: value ? "active" : "inactive",
              }))
            }
            label="Chatbot active status"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setVersionOpen((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Clock3 size={15} /> Versions <ChevronDown size={15} />
            </button>
            {versionOpen && (
              <div className="absolute right-0 top-12 z-30 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {versions.length ? (
                  versions.map((version) => (
                    <button
                      type="button"
                      key={version.version}
                      onClick={() => {
                        setSelectedVersion(version);
                        setVersionOpen(false);
                      }}
                      className="block w-full rounded-lg p-3 text-left hover:bg-blue-50"
                    >
                      <span className="block text-sm font-semibold text-slate-800">
                        Version {version.version}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {version.date} · {version.publisher}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-400">
                        {version.changes}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-xs text-slate-500">
                    No published versions yet.
                  </p>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => { void saveDraft(); }}
            disabled={saveState === "saving"}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            <Save size={16} />{" "}
            {saveState === "saving" ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => setShowPublish(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Zap size={16} /> Publish
          </button>
        </div>
        {error && (
          <div
            role="alert"
            className="mt-3 flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 p-2.5 text-xs text-rose-700"
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}
      </header>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1 md:hidden">
        <button
          type="button"
          onClick={() => setMobileTab("configure")}
          className={classNames(
            "rounded-lg py-2 text-xs font-semibold",
            mobileTab === "configure"
              ? "bg-blue-600 text-white"
              : "text-slate-500",
          )}
        >
          Configure
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={classNames(
            "rounded-lg py-2 text-xs font-semibold",
            mobileTab === "preview"
              ? "bg-blue-600 text-white"
              : "text-slate-500",
          )}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("settings")}
          className={classNames(
            "rounded-lg py-2 text-xs font-semibold",
            mobileTab === "settings"
              ? "bg-blue-600 text-white"
              : "text-slate-500",
          )}
        >
          Settings
        </button>
      </div>
      <main className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,28fr)_minmax(340px,44fr)_minmax(260px,28fr)]">
        <section
          className={classNames(
            "min-h-0 lg:block",
            mobileTab === "configure" ? "block" : "hidden",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-sm font-bold text-slate-900">Configuration</h1>
            <span className="text-[11px] text-slate-400">11 sections</span>
          </div>
          <div className="max-h-[calc(100vh-190px)] space-y-2.5 overflow-y-auto pr-1">
            <ConfigPanel
              config={config}
              setConfig={setConfig}
              openSections={openSections}
              setOpenSections={setOpenSections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>
        </section>
        <section
          className={classNames(
            "min-h-0 lg:block",
            mobileTab === "preview" ? "block" : "hidden",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-sm font-bold text-slate-900">Live Preview</h1>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
              Updates live
            </span>
          </div>
          <ChatPreview
            config={config}
            messages={messages}
            onSend={sendMessage}
            onReset={() =>
              setMessages([
                { id: "welcome", role: "bot", text: config.welcomeMessage },
              ])
            }
            typing={typing}
          />
        </section>
        <section
          className={classNames(
            "min-h-0 lg:block",
            mobileTab === "settings" ? "block" : "hidden",
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-sm font-bold text-slate-900">
              Contextual Details
            </h1>
            <span className="text-[11px] text-slate-400">
              {sectionMeta.find(([id]) => id === activeSection)?.[1] ||
                "Overview"}
            </span>
          </div>
          <div className="max-h-[calc(100vh-190px)] overflow-y-auto pr-1">
            <ContextPanel config={config} activeSection={activeSection} />
            {selectedVersion && (
              <div className="mt-3 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-xs font-bold text-violet-800">
                  Viewing Version {selectedVersion.version}
                </p>
                <p className="mt-1 text-xs leading-5 text-violet-700">
                  Published {selectedVersion.date} by{" "}
                  {selectedVersion.publisher}. Your current draft remains
                  unchanged.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      {showPublish && (
        <PublishModal
          changes={changes}
          nextVersion={nextVersion}
          previousVersion={versions[0]?.version || 0}
          onCancel={() => setShowPublish(false)}
          onPublish={publish}
          publishing={publishing}
        />
      )}
    </div>
  );
}
