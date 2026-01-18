import React, { useMemo } from "react";
import { shouldTakeMedToday } from "@/utils/scheduling";
import { getDateKey } from "@/utils/date";
import { Medication, DoseRecord, ScheduleEntry, FontSize } from "@/types";
import ProgressRing from "./ProgressRing";
import MedCard from "./MedCard";

// ============================================
// Types
// ============================================

interface TodayViewProps {
  medications: Medication[];
  takenLog: DoseRecord[];
  onTake: (med: Medication, scheduledTime: string) => void;
  onUndo: (med: Medication, scheduledTime: string) => void;
  fontSize?: FontSize;
}

// ============================================
// Empty State
// ============================================

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center px-4 text-center text-gray-700">
      <div className="mb-4 h-16 w-16 rounded-full bg-blue-50 text-4xl leading-16 text-blue-500">
        ⏰
      </div>
      <p className="mb-1 text-xl font-semibold">
        No medications scheduled for today
      </p>
      <p className="max-w-xs text-base text-gray-600">
        Once you add medications, you will see a simple list of what to take and
        when.
      </p>
    </div>
  );
}

// ============================================
// Component
// ============================================

export default function TodayView({
  medications,
  takenLog,
  onTake,
  onUndo,
  fontSize = "normal",
}: TodayViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);

  // Build today's schedule
  const schedule = useMemo(() => {
    const entries: ScheduleEntry[] = [];

    medications.forEach((med) => {
      if (!shouldTakeMedToday(med, today)) return;

      (med.times || []).forEach((timeStr) => {
        if (!timeStr) return;
        entries.push({ med, scheduledTime: timeStr });
      });
    });

    // Sort by time
    entries.sort((a, b) => (a.scheduledTime > b.scheduledTime ? 1 : -1));
    return entries;
  }, [medications, today]);

  // Calculate progress
  const totalDoses = schedule.length;
  const takenCount = schedule.filter((entry) =>
    takenLog.some(
      (log) =>
        log.medId === entry.med.id &&
        log.scheduledTime === entry.scheduledTime &&
        log.date === todayKey
    )
  ).length;

  // Empty state
  if (schedule.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 pb-20">
      <ProgressRing taken={takenCount} total={totalDoses} date={today} />

      {schedule.map((entry, index) => (
        <MedCard
          key={`${entry.med.id}-${entry.scheduledTime}-${index}`}
          med={entry.med}
          scheduledTime={entry.scheduledTime}
          todayKey={todayKey}
          takenLog={takenLog}
          onTake={onTake}
          onUndo={onUndo}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
}
