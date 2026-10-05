import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function BillingRowActions({ row, onSwitch, onDelete }) {
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const closeTimer = useRef(null);
  const pinned = useRef(false);
  const focusOnOpen = useRef(false);
  const active = row.subscription === "Active";

  const cancelClose = () => clearTimeout(closeTimer.current);
  const close = () => {
    cancelClose();
    pinned.current = false;
    setPosition(null);
  };
  const open = (pin = false) => {
    cancelClose();
    pinned.current = pin || pinned.current;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      left: Math.max(8, Math.min(rect.right - 208, window.innerWidth - 216)),
      top: rect.bottom + 126 < window.innerHeight ? rect.bottom + 4 : Math.max(8, rect.top - 120),
    });
  };
  const scheduleClose = () => {
    if (!pinned.current) closeTimer.current = setTimeout(close, 180);
  };

  useEffect(() => {
    if (!position) return;
    if (focusOnOpen.current) {
      menuRef.current?.querySelector("button")?.focus();
      focusOnOpen.current = false;
    }
    const dismiss = (event) => {
      if (!triggerRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setPosition(null);
        pinned.current = false;
      }
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setPosition(null);
        pinned.current = false;
        triggerRef.current?.focus();
      }
    };
    const reposition = () => { setPosition(null); pinned.current = false; };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [position]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const choose = (callback) => {
    close();
    triggerRef.current?.focus();
    callback(row);
  };
  const itemClass = "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none";

  return (
    <>
      <button ref={triggerRef} type="button" aria-label={`Actions for ${row.tenant}`}
        aria-expanded={Boolean(position)} aria-controls={position ? `billing-actions-${row.id}` : undefined}
        onMouseEnter={() => open()} onMouseLeave={scheduleClose}
        onClick={(event) => { focusOnOpen.current = event.detail === 0; open(true); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); focusOnOpen.current = true; open(true); }
        }}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-500">
        <MoreHorizontal size={20} />
      </button>
      {position && createPortal(
        <div ref={menuRef} id={`billing-actions-${row.id}`} aria-label={`Actions for ${row.tenant}`}
          style={position} className="fixed z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          onMouseEnter={cancelClose} onMouseLeave={scheduleClose}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== triggerRef.current) close();
          }}>
          <button type="button" role="switch" aria-checked={active} aria-label={`Active subscription for ${row.tenant}`}
            className={itemClass} onClick={() => choose(onSwitch)}>
            <span aria-hidden="true" className={`relative h-5 w-9 shrink-0 rounded-full ${active ? "bg-blue-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${active ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </span>
            <span>Switch <span className="block text-[11px] text-slate-400">{active ? "Set inactive" : "Set active"}</span></span>
          </button>
          <button type="button" className={`${itemClass} text-red-600 hover:bg-red-50`} onClick={() => choose(onDelete)}><Trash2 size={16} /> Soft Delete</button>
        </div>, document.body,
      )}
    </>
  );
}
