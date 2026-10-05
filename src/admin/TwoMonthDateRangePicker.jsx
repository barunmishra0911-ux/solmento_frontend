import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  formatDisplayDate,
  formatISODate,
  parseDisplayDate,
  resolvePeriodDates,
} from "./datePeriodUtils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const PRESETS = [
  { id: "Today", label: "Today" },
  { id: "Yesterday", label: "Yesterday" },
  { id: "Last 7 Days", label: "Last 7 Days" },
  { id: "Last 30 Days", label: "Last 30 Days" },
  { id: "This Month", label: "This Month" },
  { id: "Last Month", label: "Last Month" },
  { id: "Custom Range", label: "Custom Range" },
];

function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  // 1. Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month - 1, day),
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      isCurrentMonth: true,
      date: new Date(year, month, d),
    });
  }

  // 3. Next month leading days (fill grid to 35 or 42 cells)
  const total = cells.length > 35 ? 42 : 35;
  const remaining = total - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      day: d,
      isCurrentMonth: false,
      date: new Date(year, month + 1, d),
    });
  }

  return cells;
}

function normalizeDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function formatDDMMYYYY(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function parseAnyDate(val) {
  if (!val) return null;
  if (val instanceof Date) return normalizeDate(val);
  const str = String(val).trim();
  if (!str) return null;

  // Try ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Try DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [d, m, y] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // Try Display Date "DD Mon YYYY"
  const parsed = parseDisplayDate(str);
  if (parsed) return normalizeDate(parsed);

  // Fallback native
  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : normalizeDate(fallback);
}

export default function TwoMonthDateRangePicker({
  value,
  onChange,
  align = "right",
  className = "",
  dateFormat = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse incoming value (supports object {start, end, period} or string "DD Mon – DD Mon" or preset "Today")
  const initialParsed = useMemo(() => {
    let s = null;
    let e = null;
    let p = "Custom Range";

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const rawStart = value.start || value.startDate;
      const rawEnd = value.end || value.endDate;
      s = parseAnyDate(rawStart);
      e = parseAnyDate(rawEnd);
      if (value.period) {
        p = value.period;
      }
    } else if (typeof value === "string" && value.trim()) {
      const trimmed = value.trim();
      if (trimmed.includes("–") || trimmed.includes("-")) {
        const parts = trimmed.split(/[–—\-]/).map((x) => x.trim());
        if (parts.length >= 2) {
          s = parseAnyDate(parts[0]);
          e = parseAnyDate(parts[1]);
        }
      } else {
        // Preset name string (e.g., "Today", "Last 7 days")
        const resolved = resolvePeriodDates(trimmed);
        s = parseAnyDate(resolved.startDate);
        e = parseAnyDate(resolved.endDate);
        p = trimmed;
      }
    }

    if (!s || !e) {
      const now = new Date();
      s = new Date(now.getFullYear(), now.getMonth(), 1);
      e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Match preset name case-insensitively with PRESETS
    const matchedPreset = PRESETS.find(
      (pr) => pr.id.toLowerCase() === (p || "").toLowerCase(),
    );

    return {
      start: normalizeDate(s),
      end: normalizeDate(e),
      preset: matchedPreset ? matchedPreset.id : "Custom Range",
    };
  }, [value]);

  const [startDate, setStartDate] = useState(initialParsed.start);
  const [endDate, setEndDate] = useState(initialParsed.end);
  const [hoverDate, setHoverDate] = useState(null);
  const [activePreset, setActivePreset] = useState(initialParsed.preset);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // View month controls (Left month)
  const [viewYear, setViewYear] = useState(() =>
    initialParsed.start ? initialParsed.start.getFullYear() : new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    initialParsed.start ? initialParsed.start.getMonth() : new Date().getMonth(),
  );

  useEffect(() => {
    if (initialParsed.start && initialParsed.end) {
      setStartDate(initialParsed.start);
      setEndDate(initialParsed.end);
      setActivePreset(initialParsed.preset);
      setViewYear(initialParsed.start.getFullYear());
      setViewMonth(initialParsed.start.getMonth());
    }
  }, [initialParsed]);

  // Viewport-aware dynamic positioning
  useLayoutEffect(() => {
    if (!open || !containerRef.current) return undefined;

    const updatePosition = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const sideMargin = 16;

      if (viewportWidth < 640) {
        // Mobile view (< 640px): Constrain to viewport with guaranteed side gutters
        const targetWidth = Math.min(380, viewportWidth - sideMargin * 2);
        const idealScreenLeft = Math.max(sideMargin, (viewportWidth - targetWidth) / 2);
        const offsetLeft = idealScreenLeft - rect.left;

        setDropdownStyle({
          left: `${offsetLeft}px`,
          right: "auto",
          width: `${targetWidth}px`,
          maxWidth: `calc(100vw - ${sideMargin * 2}px)`,
        });
      } else {
        // Tablet / Desktop view (>= 640px)
        const targetWidth = viewportWidth >= 1280 ? 810 : 540;
        const availableWidth = Math.min(targetWidth, viewportWidth - sideMargin * 2);

        let leftOffset = align === "left" ? 0 : rect.width - availableWidth;

        // Check right boundary
        const screenRight = rect.left + leftOffset + availableWidth;
        if (screenRight > viewportWidth - sideMargin) {
          leftOffset = viewportWidth - sideMargin - rect.left - availableWidth;
        }

        // Check left boundary
        const screenLeft = rect.left + leftOffset;
        if (screenLeft < sideMargin) {
          leftOffset = sideMargin - rect.left;
        }

        setDropdownStyle({
          left: `${leftOffset}px`,
          right: "auto",
          width: `${availableWidth}px`,
          maxWidth: `calc(100vw - ${sideMargin * 2}px)`,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align]);

  // Outside click and Escape key listener
  useEffect(() => {
    if (!open) return undefined;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Month 2 (Right month)
  const rightYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const rightMonth = (viewMonth + 1) % 12;

  const leftCells = useMemo(
    () => getCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );
  const rightCells = useMemo(
    () => getCalendarGrid(rightYear, rightMonth),
    [rightYear, rightMonth],
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const applyPreset = (presetId) => {
    const now = new Date();
    const today = normalizeDate(now);
    let s = today;
    let e = today;

    if (presetId === "Today") {
      s = today;
      e = today;
    } else if (presetId === "Yesterday") {
      s = normalizeDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
      e = s;
    } else if (presetId === "Last 7 Days") {
      s = normalizeDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
      e = today;
    } else if (presetId === "Last 30 Days") {
      s = normalizeDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
      e = today;
    } else if (presetId === "This Month") {
      s = normalizeDate(new Date(now.getFullYear(), now.getMonth(), 1));
      e = normalizeDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (presetId === "Last Month") {
      s = normalizeDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      e = normalizeDate(new Date(now.getFullYear(), now.getMonth(), 0));
    } else {
      setActivePreset("Custom Range");
      return;
    }

    setStartDate(s);
    setEndDate(e);
    setActivePreset(presetId);
    setViewYear(s.getFullYear());
    setViewMonth(s.getMonth());
  };

  const handleDateClick = (clickedDate) => {
    const norm = normalizeDate(clickedDate);
    setActivePreset("Custom Range");

    if (!startDate || (startDate && endDate)) {
      // First click: select new start date
      setStartDate(norm);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Second click
      if (norm.getTime() < startDate.getTime()) {
        setStartDate(norm);
        setEndDate(null);
      } else {
        setEndDate(norm);
      }
    }
  };

  const handleApply = () => {
    if (!startDate) return;
    const finalEnd = endDate || startDate;

    if (onChange) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        onChange({
          start: formatISODate(startDate),
          end: formatISODate(finalEnd),
          startDate: formatISODate(startDate),
          endDate: formatISODate(finalEnd),
          period: activePreset || "Custom Range",
        });
      } else {
        const formatted = `${formatDisplayDate(startDate)} – ${formatDisplayDate(finalEnd)}`;
        onChange(formatted);
      }
    }
    setOpen(false);
  };

  const handleCancel = () => {
    if (initialParsed.start && initialParsed.end) {
      setStartDate(initialParsed.start);
      setEndDate(initialParsed.end);
      setActivePreset(initialParsed.preset);
      setViewYear(initialParsed.start.getFullYear());
      setViewMonth(initialParsed.start.getMonth());
    }
    setOpen(false);
  };

  // Range count calculation
  const totalDays = useMemo(() => {
    if (!startDate) return 0;
    const effectiveEnd = endDate || hoverDate || startDate;
    if (effectiveEnd.getTime() < startDate.getTime()) return 1;
    const diff = Math.round(
      (effectiveEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff + 1;
  }, [startDate, endDate, hoverDate]);

  const selectedRangeLabel = useMemo(() => {
    if (!startDate) return "Select a date range";
    const effectiveEnd = endDate || startDate;
    return `${formatDisplayDate(startDate)} – ${formatDisplayDate(effectiveEnd)} (${totalDays} day${totalDays > 1 ? "s" : ""})`;
  }, [startDate, endDate, totalDays]);

  const triggerDisplayLabel = useMemo(() => {
    // Show applied dates (from initialParsed computed from value prop) on the collapsed trigger
    const appliedStart = initialParsed.start;
    const appliedEnd = initialParsed.end;

    if (dateFormat === "DD-MM-YYYY") {
      if (appliedStart && appliedEnd) {
        return `${formatDDMMYYYY(appliedStart)} ~ ${formatDDMMYYYY(appliedEnd)}`;
      }
    }

    if (appliedStart && appliedEnd) {
      return `${formatDisplayDate(appliedStart)} – ${formatDisplayDate(appliedEnd)}`;
    }

    if (value && typeof value === "string" && (value.includes("–") || value.includes("-") || value.includes("~"))) {
      return value;
    }

    const now = new Date();
    const curStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const curEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (dateFormat === "DD-MM-YYYY") {
      return `${formatDDMMYYYY(curStart)} ~ ${formatDDMMYYYY(curEnd)}`;
    }
    return `${formatDisplayDate(curStart)} – ${formatDisplayDate(curEnd)}`;
  }, [value, initialParsed, dateFormat]);

  const renderCell = (cell) => {
    const normCell = normalizeDate(cell.date);
    const time = normCell.getTime();

    const isStart = startDate && time === startDate.getTime();
    const isEnd = endDate && time === endDate.getTime();
    const effectiveEnd =
      endDate ||
      (hoverDate && hoverDate.getTime() >= (startDate?.getTime() || 0)
        ? hoverDate
        : null);

    const isInRange =
      startDate &&
      effectiveEnd &&
      time > startDate.getTime() &&
      time < effectiveEnd.getTime();

    let bgClass = "bg-transparent text-slate-800 hover:bg-slate-100";
    if (!cell.isCurrentMonth) {
      bgClass = "text-slate-300 hover:bg-slate-50";
    }

    if (isStart && isEnd) {
      bgClass = "bg-blue-600 text-white font-bold rounded-lg shadow-xs";
    } else if (isStart) {
      bgClass = "bg-blue-600 text-white font-bold rounded-l-lg shadow-xs";
    } else if (isEnd) {
      bgClass = "bg-blue-600 text-white font-bold rounded-r-lg shadow-xs";
    } else if (isInRange) {
      bgClass = "bg-blue-50/90 text-slate-900 font-medium rounded-none";
    }

    return (
      <button
        key={time + cell.day}
        type="button"
        onClick={() => handleDateClick(cell.date)}
        onMouseEnter={() => {
          if (startDate && !endDate) setHoverDate(normCell);
        }}
        className={`h-9 w-full text-center text-xs transition-colors flex items-center justify-center select-none ${bgClass}`}
      >
        {cell.day}
      </button>
    );
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* =========================================================================
          TRIGGER BUTTON
          Matches reference image top preview (Same as Reports)
          ========================================================================= */}
      {dateFormat === "DD-MM-YYYY" ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
        >
          <Calendar size={14} className="text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-800">{triggerDisplayLabel}</span>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group flex items-center gap-3 rounded-2xl border border-blue-200 bg-white px-4 py-2 shadow-xs transition hover:border-blue-400 hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-blue-400/20 cursor-pointer"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100/70 shrink-0">
            <Calendar size={17} />
          </div>
          <div className="text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Date Range
            </span>
            <span className="block text-xs font-bold text-slate-900 truncate max-w-[190px] sm:max-w-none">
              {triggerDisplayLabel}
            </span>
          </div>
          <ChevronDown
            size={15}
            className={`ml-1 text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}

      {/* =========================================================================
          TWO-MONTH CALENDAR DROPDOWN DIALOG
          Exact replica of the Reports reference image (Large, 2-Month, Unclipped)
          ========================================================================= */}
      {open && (
        <div
          style={dropdownStyle}
          className="absolute top-[calc(100%+8px)] z-50 max-h-[88vh] overflow-x-hidden overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex flex-col sm:flex-row">
            {/* 1. LEFT SIDEBAR: PRESETS */}
            <aside className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-slate-100 p-3.5 sm:p-4 space-y-1 shrink-0 bg-white">
              {PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={`block w-full rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition cursor-pointer ${isSelected
                        ? "bg-blue-600 font-semibold text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </aside>

            {/* 2. CENTER & RIGHT: TWO-MONTH CALENDAR VIEW */}
            <div className="flex-1 p-4 sm:p-5 min-w-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-7">
                {/* Month 1 (Left) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-bold text-slate-900">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="xl:hidden grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="hidden xl:block w-8" />
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-1.5 text-center text-xs font-semibold text-slate-600">
                    {WEEKDAY_HEADERS.map((h) => (
                      <div key={h} className="py-1">
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {leftCells.map(renderCell)}
                  </div>
                </div>

                {/* Month 2 (Right - Desktop Only) */}
                <div className="hidden xl:block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8" />
                    <span className="text-sm font-bold text-slate-900">
                      {MONTH_NAMES[rightMonth]} {rightYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-1.5 text-center text-xs font-semibold text-slate-600">
                    {WEEKDAY_HEADERS.map((h) => (
                      <div key={h} className="py-1">
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {rightCells.map(renderCell)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. BOTTOM ACTION BAR */}
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3.5">
            {/* Selected Range Badge */}
            <div className="flex w-full sm:w-auto items-center gap-2.5 rounded-xl border border-blue-100/70 bg-blue-50/60 px-3.5 py-2 text-xs">
              <Calendar size={16} className="text-blue-600 shrink-0" />
              <div>
                <span className="block text-[10px] font-medium text-slate-400">
                  Selected Range:
                </span>
                <span className="block font-bold text-slate-900">
                  {selectedRangeLabel}
                </span>
              </div>
            </div>

            {/* Cancel and Apply Buttons */}
            <div className="flex w-full sm:w-auto items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!startDate}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
              >
                Apply
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
