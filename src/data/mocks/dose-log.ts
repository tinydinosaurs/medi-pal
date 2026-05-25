import { DoseRecord } from "@/types";

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Build a fresh dose log anchored to `referenceDate` (defaults to today).
 *
 * Used as a factory so the local-dev seed always shows recent dose
 * history relative to "now". Tests should call this with a fixed
 * `referenceDate` for deterministic output.
 */
export function buildMockDoseLog(
  referenceDate: Date = new Date(),
): DoseRecord[] {
  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(referenceDate);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return [
    // Two days ago - full compliance
    {
      date: formatDateKey(twoDaysAgo),
      medId: 1,
      scheduledTime: "08:00",
      takenAt: `${formatDateKey(twoDaysAgo)}T08:15:00.000Z`,
    },
    {
      date: formatDateKey(twoDaysAgo),
      medId: 2,
      scheduledTime: "08:00",
      takenAt: `${formatDateKey(twoDaysAgo)}T08:15:00.000Z`,
    },
    {
      date: formatDateKey(twoDaysAgo),
      medId: 2,
      scheduledTime: "20:00",
      takenAt: `${formatDateKey(twoDaysAgo)}T20:30:00.000Z`,
    },
    {
      date: formatDateKey(twoDaysAgo),
      medId: 3,
      scheduledTime: "20:00",
      takenAt: `${formatDateKey(twoDaysAgo)}T20:30:00.000Z`,
    },
    {
      date: formatDateKey(twoDaysAgo),
      medId: 4,
      scheduledTime: "08:00",
      takenAt: `${formatDateKey(twoDaysAgo)}T08:15:00.000Z`,
    },
    {
      date: formatDateKey(twoDaysAgo),
      medId: 5,
      scheduledTime: "06:00",
      takenAt: `${formatDateKey(twoDaysAgo)}T06:05:00.000Z`,
    },

    // Yesterday - missed evening doses
    {
      date: formatDateKey(yesterday),
      medId: 1,
      scheduledTime: "08:00",
      takenAt: `${formatDateKey(yesterday)}T08:20:00.000Z`,
    },
    {
      date: formatDateKey(yesterday),
      medId: 2,
      scheduledTime: "08:00",
      takenAt: `${formatDateKey(yesterday)}T08:20:00.000Z`,
    },
    {
      date: formatDateKey(yesterday),
      medId: 4,
      scheduledTime: "08:00",
      takenAt: `${formatDateKey(yesterday)}T08:20:00.000Z`,
    },
    {
      date: formatDateKey(yesterday),
      medId: 5,
      scheduledTime: "06:00",
      takenAt: `${formatDateKey(yesterday)}T06:10:00.000Z`,
    },
  ];
}

/**
 * Default snapshot, anchored to module-load time. Used for local-dev
 * seeding via `useDoseLog`. For tests, call `buildMockDoseLog` directly
 * with a fixed `referenceDate`.
 */
export const MOCK_DOSE_LOG: DoseRecord[] = buildMockDoseLog();

