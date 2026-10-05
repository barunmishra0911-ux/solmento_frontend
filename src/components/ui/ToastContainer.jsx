import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { id, type, message, duration } = event.detail || {};
      if (!message || type === "success") return;

      const newToast = {
        id: id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: type || "error",
        message,
        duration: duration || 5000,
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, newToast.duration);
      }
    };

    window.addEventListener("solmento:toast", handleToast);
    return () => {
      window.removeEventListener("solmento:toast", handleToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${isSuccess
              ? "bg-emerald-600 text-white shadow-emerald-950/20 border border-emerald-500"
              : "bg-rose-600 text-white shadow-rose-950/20 border border-rose-500"
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess ? (
                <CheckCircle2 size={18} className="shrink-0 text-white" />
              ) : (
                <AlertCircle size={18} className="shrink-0 text-white" />
              )}
              <span className="text-sm font-medium leading-snug break-words">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition shrink-0 cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}


