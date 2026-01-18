// Time window helpers for medication scheduling

// ============================================
// Types
// ============================================

export type TimeOfDayKey = "morning" | "midday" | "evening" | "bedtime" | "any";

export interface TimeOfDayInfo {
  key: TimeOfDayKey;
  label: string;
}

// ============================================
// Parsing & Formatting
// ============================================

function parseTimeToDate(timeStr: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    Number.isFinite(h) ? h : 0,
    Number.isFinite(m) ? m : 0,
    0,
    0
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Given "08:00", returns "7:00 AM - 9:00 AM" (+/- 1 hour window)
 */
export function getTimeWindowLabel(timeStr: string): string {
  const center = parseTimeToDate(timeStr);
  const start = new Date(center.getTime() - 60 * 60 * 1000);
  const end = new Date(center.getTime() + 60 * 60 * 1000);

  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Given "08:00", returns "8:00 AM"
 */
export function formatClockTime(timeStr: string): string {
  return formatTime(parseTimeToDate(timeStr));
}

// ============================================
// Time of Day Classification
// ============================================

/**
 * Classify a time string into morning/midday/evening/bedtime
 */
export function getTimeOfDayInfo(timeStr: string | undefined): TimeOfDayInfo {
  if (!timeStr) {
    return { key: "any", label: "🕒 Any time" };
  }

  const [hStr] = timeStr.split(":");
  const hour = Number(hStr);

  if (!Number.isFinite(hour)) {
    return { key: "any", label: "🕒 Any time" };
  }

  if (hour >= 4 && hour < 11) {
    return { key: "morning", label: "☀️ Morning" };
  }
  if (hour >= 11 && hour < 15) {
    return { key: "midday", label: "🍽️ Lunch" };
  }
  if (hour >= 15 && hour < 19) {
    return { key: "evening", label: "🌆 Evening" };
  }
  return { key: "bedtime", label: "🌙 Bedtime" };
}

/**
 * Tailwind classes for time-of-day chips
 */
export function getTimeOfDayClasses(key: TimeOfDayKey): string {
  switch (key) {
    case "morning":
      return "bg-yellow-100 text-yellow-900 border-yellow-300";
    case "midday":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "evening":
      return "bg-indigo-100 text-indigo-900 border-indigo-300";
    case "bedtime":
      return "bg-slate-800 text-slate-100 border-slate-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
