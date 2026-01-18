// Medication display helpers

import { Medication, Priority, FontSize } from "@/types";

// Re-export for convenience
export type { FontSize };

export interface PriorityStyles {
  badgeBg: string;
  badgeText: string;
}

// ============================================
// Priority Styling
// ============================================

/**
 * Get Tailwind classes for priority badge
 */
export function getPriorityStyles(priority: Priority | undefined): PriorityStyles {
  switch (priority) {
    case "critical":
      return {
        badgeBg: "bg-red-600",
        badgeText: "text-white",
      };
    case "important":
      return {
        badgeBg: "bg-orange-500",
        badgeText: "text-white",
      };
    default:
      return {
        badgeBg: "bg-green-600",
        badgeText: "text-white",
      };
  }
}

/**
 * Format priority for display (capitalize first letter)
 */
export function formatPriorityLabel(priority: Priority | undefined): string {
  const p = priority || "routine";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

// ============================================
// Frequency
// ============================================

/**
 * Get human-readable frequency label
 */
export function getFrequencyLabel(med: Medication): string {
  if (!med) return "";

  switch (med.frequency) {
    case "daily":
      return "Daily";
    case "every-other-day":
      return "Every other day";
    case "specific-days":
      return Array.isArray(med.daysOfWeek) ? med.daysOfWeek.join(", ") : "";
    case "custom":
      return med.customFrequency || "Custom schedule";
    default:
      return "";
  }
}

// ============================================
// Font Size
// ============================================

/**
 * Get Tailwind text size class for medication name
 */
export function getNameClass(fontSize: FontSize): string {
  switch (fontSize) {
    case "extra":
      return "text-2xl";
    case "large":
      return "text-xl";
    default:
      return "text-lg";
  }
}

/**
 * Get Tailwind text size class for dose
 */
export function getDoseClass(fontSize: FontSize): string {
  switch (fontSize) {
    case "extra":
      return "text-2xl";
    case "large":
      return "text-xl";
    default:
      return "text-lg";
  }
}
