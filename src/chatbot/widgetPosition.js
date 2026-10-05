export const CHATBOT_WIDGET_POSITION_KEY = "solmento:chatbot-widget-position";

export const DEFAULT_CHATBOT_WIDGET_POSITION = "bottom-right";
export const CHATBOT_WIDGET_NAME_KEY = "solmento:chatbot-widget-name";

export function formatChatbotDisplayName(name) {
  const value = String(name || "Chatbot AI").trim() || "Chatbot AI";
  return /\s+template$/i.test(value) ? value : `${value} Template`;
}

const validPositions = new Set([
  "bottom-right",
  "bottom-left",
  "right-middle",
  "left-middle",
]);
const positionAliases = {
  "top-right": "right-middle",
  "top-left": "left-middle",
};

export function normalizeWidgetPosition(position) {
  const normalized = positionAliases[position] || position;
  return validPositions.has(normalized)
    ? normalized
    : DEFAULT_CHATBOT_WIDGET_POSITION;
}

export function getStoredWidgetPosition() {
  if (typeof window === "undefined") return DEFAULT_CHATBOT_WIDGET_POSITION;

  const value = window.localStorage.getItem(CHATBOT_WIDGET_POSITION_KEY);
  return normalizeWidgetPosition(value);
}

export function saveWidgetPosition(position) {
  const nextPosition = normalizeWidgetPosition(position);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHATBOT_WIDGET_POSITION_KEY, nextPosition);
    window.dispatchEvent(
      new CustomEvent("solmento:widget-position-changed", {
        detail: nextPosition,
      }),
    );
  }

  return nextPosition;
}

export function getStoredWidgetName() {
  if (typeof window === "undefined") return "Chatbot AI";
  return window.localStorage.getItem(CHATBOT_WIDGET_NAME_KEY) || "Chatbot AI";
}

export function saveWidgetName(name) {
  const nextName = String(name || "Chatbot AI").trim() || "Chatbot AI";
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHATBOT_WIDGET_NAME_KEY, nextName);
    window.dispatchEvent(
      new CustomEvent("solmento:widget-name-changed", { detail: nextName }),
    );
  }
  return nextName;
}

export function getWidgetPositionStyle(
  position,
  spacing = "1.5rem",
  _topSpacing = spacing,
) {
  const nextPosition = normalizeWidgetPosition(position);
  const isMiddle = nextPosition.endsWith("-middle");
  const isLeft =
    nextPosition === "bottom-left" || nextPosition === "left-middle";

  return {
    top: isMiddle ? "50%" : "auto",
    bottom: isMiddle ? "auto" : spacing,
    left: isLeft ? spacing : "auto",
    right: isLeft ? "auto" : spacing,
    transform: isMiddle ? "translateY(-50%)" : "none",
  };
}
