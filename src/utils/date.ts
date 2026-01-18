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
