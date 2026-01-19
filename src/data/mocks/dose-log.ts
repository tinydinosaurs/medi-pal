import { DoseRecord } from "@/types";

// Generate some realistic dose history for the past few days
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const MOCK_DOSE_LOG: DoseRecord[] = [
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
