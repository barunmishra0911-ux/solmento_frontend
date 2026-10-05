import { resolvePeriodDates } from "../datePeriodUtils";

export function getInitialFilterState() {
  const { startDate, endDate } = resolvePeriodDates("This Month");
  return {
    search: "",
    module: "ALL",
    action: "ALL",
    user: "ALL",
    role: "ALL",
    dateFrom: startDate,
    dateTo: endDate,
    period: "This Month",
  };
}

export const initialFilterState = getInitialFilterState();

export function getTodayDateString() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export const mockAuditLogs = [];

