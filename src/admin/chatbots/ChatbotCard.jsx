import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  Code2,
  Copy,
  Globe2,
  MessageCircle,
  MessagesSquare,
  MoreVertical,
  PencilLine,
  Trash2,
} from "lucide-react";
import { getChatbotBuilderRequest } from "@/lib/authApi";
import { formatChatbotDisplayName } from "../../chatbot/widgetPosition";

const channelStyles = {
  website: {
    label: "Website",
    icon: Globe2,
    className: "bg-blue-50 text-blue-700",
  },
  whatsapp: {
    label: "WhatsApp",
    icon: MessageCircle,
    className: "bg-emerald-50 text-emerald-700",
  },
};
const avatarStyles = [
  "bg-blue-100 text-blue-600",
  "bg-rose-100 text-rose-500",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
];
const numberFormat = new Intl.NumberFormat("en-IN");
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const fallbackDescription =
  "A ready-to-customize AI assistant template for helpful conversations.";

function ActionsMenu({
  chatbot,
  open,
  disabled,
  onOpenChange,
  onDuplicate,
  onDelete,
}) {
  const wrapperRef = useRef(null);
  const menuId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!wrapperRef.current?.contains(event.target)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open, onOpenChange]);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        aria-label={`Actions for ${chatbot.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-50"
      >
        <MoreVertical size={19} />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-10 z-30 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <Link
            to={`/app/chatbots/${chatbot.id}/builder`}
            role="menuitem"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <PencilLine size={15} /> Open Builder
          </Link>
          <Link
            to={`/app/widget/embed-code?chatbotId=${encodeURIComponent(chatbot.id)}`}
            role="menuitem"
            onClick={() => onOpenChange(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-blue-50"
          >
            <Code2 size={15} /> View Code
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onDuplicate();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"
          >
            <Copy size={15} /> Duplicate
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatbotCard({
  chatbot,
  index = 0,
  menuOpen,
  onMenuChange,
  onStatusChange,
  onDuplicate,
  onDelete,
  onViewConversations,
  disabled,
}) {
  const active = chatbot.status === "active";
  const [logo, setLogo] = useState("");
  const avatarTone = avatarStyles[index % avatarStyles.length];
  const description = chatbot.description?.trim() || fallbackDescription;
  useEffect(() => {
    let mounted = true;
    getChatbotBuilderRequest(chatbot.id)
      .then((builder) => {
        const config = builder?.draftConfig?.logo
          ? builder.draftConfig
          : builder?.publishedConfig;
        if (mounted && typeof config?.logo === "string") setLogo(config.logo);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [chatbot.id]);
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-3">
        <span
          className={`relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full ${avatarTone}`}
        >
          {logo ? (
            <img src={logo} alt="" className="block h-full w-full rounded-full object-cover" />
          ) : (
            <Bot size={29} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-slate-950">
                {formatChatbotDisplayName(chatbot.name)}
              </h2>
              <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                {description}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              aria-label={`${chatbot.name} active status`}
              title={active ? "Active" : "Inactive"}
              disabled={disabled}
              onClick={() => onStatusChange(active ? "inactive" : "active")}
              className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-wait disabled:opacity-50 ${active ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${active ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <ActionsMenu
              chatbot={chatbot}
              open={menuOpen}
              disabled={disabled}
              onOpenChange={onMenuChange}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
          <div className="mt-0.5 flex flex-wrap gap-2">
            {chatbot.channels.map((channel) => {
              const style = channelStyles[channel];
              if (!style) return null;
              const Icon = style.icon;
              return (
                <span
                  key={channel}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
                >
                  <Icon size={14} />
                  {style.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onViewConversations?.(chatbot)}
          className="flex items-start gap-2 border-r border-slate-100 pr-3 text-left transition-colors hover:bg-blue-50/60 -my-1 py-1 -ml-1 pl-1 rounded-lg group/conv focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
          title={`View ${numberFormat.format(chatbot.conversationsThisMonth)} conversations for ${chatbot.name}`}
        >
          <MessagesSquare
            size={19}
            className="mt-0.5 shrink-0 text-slate-500 group-hover/conv:text-blue-600 transition-colors"
          />
          <div>
            <strong className="block text-sm text-slate-950 group-hover/conv:text-blue-600 transition-colors">
              {numberFormat.format(chatbot.conversationsThisMonth)}
            </strong>
            <span className="block text-xs leading-4 text-slate-500 group-hover/conv:text-blue-700 transition-colors">
              Conversations
              <br />
              this month
            </span>
          </div>
        </button>
        <div className="flex items-start gap-2 pl-3">
          <CalendarDays size={19} className="mt-0.5 shrink-0 text-slate-500" />
          <div>
            <strong className="block whitespace-nowrap text-sm text-slate-950">
              {dateFormat.format(new Date(chatbot.lastEditedAt))}
            </strong>
            <span className="block text-xs leading-4 text-slate-500">
              Last edited
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
