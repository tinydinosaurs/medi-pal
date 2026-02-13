// Date formatting utilities

/**
 * Returns date as 'YYYY-MM-DD' string for use as keys
 */
export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns human-readable date like "January 17, 2026"
 */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateLabelShort(dateKey: string): string {
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;

  const [year, month, day] = parts.map((p) => Number(p));
  const jsDate = new Date(year, month - 1, day);

  if (Number.isNaN(jsDate.getTime())) return dateKey;

  return jsDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Converts 24hr time string to 12hr format with AM/PM
 * @param time24 - Time in "HH:MM" format (e.g., "14:00")
 * @returns Time in "H:MM AM/PM" format (e.g., "2:00 PM")
 */
export function formatTime12hr(time24: string | null): string {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
