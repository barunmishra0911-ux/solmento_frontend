// Dynamic date period utilities for Lead Management and Student Leads
// Dynamically generates periods based on current system date (new Date())

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDisplayDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDisplayDate(dateStr) {
  if (!dateStr) return null;
  const match = String(dateStr).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) {
    const fallback = new Date(dateStr);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const day = parseInt(match[1], 10);
  const monthIdx = MONTH_NAMES.findIndex(
    (m) => m.toLowerCase() === match[2].toLowerCase()
  );
  const year = parseInt(match[3], 10);
  if (monthIdx === -1) return null;
  return new Date(year, monthIdx, day);
}

export function getDynamicPeriodOptions(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();

  // Current Month: 1st of this month to last day of this month
  const curMonthStart = new Date(year, month, 1);
  const curMonthEnd = new Date(year, month + 1, 0);
  const curMonthLabel = `${formatDisplayDate(curMonthStart)} – ${formatDisplayDate(curMonthEnd)}`;

  // Previous Month: 1st of last month to last day of last month
  const prevMonthStart = new Date(year, month - 1, 1);
  const prevMonthEnd = new Date(year, month, 0);
  const prevMonthLabel = `${formatDisplayDate(prevMonthStart)} – ${formatDisplayDate(prevMonthEnd)}`;

  // Two Months Ago (for secondary selection if needed)
  const prev2MonthStart = new Date(year, month - 2, 1);
  const prev2MonthEnd = new Date(year, month - 1, 0);
  const prev2MonthLabel = `${formatDisplayDate(prev2MonthStart)} – ${formatDisplayDate(prev2MonthEnd)}`;

  return {
    selected: curMonthLabel,
    options: [
      curMonthLabel,
      prevMonthLabel,
      "Today",
      "Last 7 days",
      "Last 30 days",
      "This quarter",
    ],
    studentOptions: [
      curMonthLabel,
      prevMonthLabel,
      prev2MonthLabel,
      "Last 7 days",
      "Last 30 days",
    ],
  };
}

export function resolvePeriodDates(periodString, now = new Date()) {
  if (!periodString) {
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const curEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate: formatISODate(curStart), endDate: formatISODate(curEnd) };
  }

  const s = String(periodString).trim().toLowerCase();

  if (s === "today") {
    const iso = formatISODate(now);
    return { startDate: iso, endDate: iso };
  }

  if (s === "last 7 days") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { startDate: formatISODate(start), endDate: formatISODate(now) };
  }

  if (s === "last 30 days") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { startDate: formatISODate(start), endDate: formatISODate(now) };
  }

  if (s === "this quarter") {
    const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const qStart = new Date(now.getFullYear(), qStartMonth, 1);
    const qEnd = new Date(now.getFullYear(), qStartMonth + 3, 0);
    return { startDate: formatISODate(qStart), endDate: formatISODate(qEnd) };
  }

  // Check for "DD Mon YYYY – DD Mon YYYY" or "DD Mon YYYY - DD Mon YYYY"
  const parts = periodString.split(/[–—\-]/).map((p) => p.trim());
  if (parts.length >= 2) {
    const d1 = parseDisplayDate(parts[0]);
    const d2 = parseDisplayDate(parts[1]);
    if (d1 && d2) {
      return { startDate: formatISODate(d1), endDate: formatISODate(d2) };
    }
  }

  // Fallback to current month
  const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const curEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDate: formatISODate(curStart), endDate: formatISODate(curEnd) };
}
