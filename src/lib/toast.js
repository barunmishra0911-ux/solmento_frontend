// Global Action Toast Utility
const TOAST_EVENT = "solmento:toast";

export const showToast = {
  success(_message, _options = {}) {
    // Routine success toasts removed globally as per SaaS UI cleanup requirements
  },
  error(message, options = {}) {
    if (typeof window === "undefined" || !message) return;
    window.dispatchEvent(
      new CustomEvent(TOAST_EVENT, {
        detail: {
          id: options.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: "error",
          message: String(message),
          duration: options.duration !== undefined ? options.duration : 5000,
        },
      })
    );
  },
};

export default showToast;
