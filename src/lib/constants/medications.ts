import { Priority, Frequency } from "@/types";

// ============================================
// Dropdown Options
// ============================================

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "important", label: "Important" },
  { value: "routine", label: "Routine" },
];

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "every-other-day", label: "Every other day" },
  { value: "specific-days", label: "Specific days" },
  { value: "custom", label: "Custom" },
];

// ============================================
// Days of Week
// ============================================

export const DAYS_OF_WEEK = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// ============================================
// Thresholds
// ============================================

/** Show low stock warning when pills remaining is below this */
export const LOW_STOCK_THRESHOLD = 10;
