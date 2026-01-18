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
