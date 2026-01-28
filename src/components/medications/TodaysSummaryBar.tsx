"use client";

import { useCallback, useMemo, useState } from "react";
import { useMedications } from "@/hooks/useMedications";
import { useDoseLog } from "@/hooks/useDoseLog";
import { shouldTakeMedToday } from "@/utils/scheduling";
import { getDateKey } from "@/utils/date";
import {
  formatClockTime,
  getTimeOfDayInfo,
  getTimeOfDayClasses,
} from "@/utils/timeWindows";
import {
  getPriorityStyles,
  formatPriorityLabel,
  getFrequencyLabel,
} from "@/utils/medication-helpers";
import { Medication, ScheduleEntry } from "@/types";
import ProgressRing from "./ProgressRing";

// ============================================
// Main Component
// ============================================

export default function TodaysSummaryBar() {
  const { medications } = useMedications();
  const { recordDose, undoDose, isDoseTaken } = useDoseLog();
  const [isExpanded, setIsExpanded] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);

  // Build today's schedule
  const schedule = useMemo(() => {
    const entries: ScheduleEntry[] = [];
    medications.forEach((med) => {
      if (!shouldTakeMedToday(med, today)) return;
      (med.times || []).forEach((time) => {
        if (time) entries.push({ med, scheduledTime: time });
      });
    });
    // Sort by time
    entries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return entries;
  }, [medications, today]);

  const takenCount = schedule.filter((e) =>
    isDoseTaken(e.med.id, e.scheduledTime, todayKey),
  ).length;
  const totalCount = schedule.length;

  // Get remaining (not taken) entries
  const remaining = useMemo(() => {
    return schedule.filter(
      (e) => !isDoseTaken(e.med.id, e.scheduledTime, todayKey),
    );
  }, [schedule, isDoseTaken, todayKey]);

  const handleTake = useCallback(
    (med: Medication, time: string) => recordDose(med.id, time),
    [recordDose],
  );

  const handleUndo = useCallback(
    (med: Medication, time: string) => undoDose(med.id, time, todayKey),
    [undoDose, todayKey],
  );

  // Summary text for collapsed state
  const summaryText = useMemo(() => {
    if (remaining.length === 0) return "All done for today! 🎉";
    const names = remaining.slice(0, 3).map((e) => e.med.name);
    if (remaining.length > 3) {
      return `Remaining: ${names.join(", ")} +${remaining.length - 3} more`;
    }
    return `Remaining: ${names.join(", ")}`;
  }, [remaining]);

  if (totalCount === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-500">
          No medications scheduled for today
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-[#e4f6ef] bg-white overflow-hidden">
      {/* Collapsed Summary Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <ProgressRing taken={takenCount} total={totalCount} size="sm" />

          <div>
            <h2 className="font-semibold text-slate-900 text-xl">
              Today&apos;s Medications
            </h2>
            {!isExpanded && (
              <p className="text-sm text-slate-500 truncate max-w-[280px] sm:max-w-[400px]">
                {summaryText}
              </p>
            )}
          </div>
        </div>

        <span
          className="text-slate-400 transition-transform duration-200 text-sm"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Medication Cards */}
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {schedule.map((entry) => {
              const taken = isDoseTaken(
                entry.med.id,
                entry.scheduledTime,
                todayKey,
              );
              const timeOfDay = getTimeOfDayInfo(entry.scheduledTime);
              const timeOfDayClasses = getTimeOfDayClasses(timeOfDay.key);
              const priorityStyles = getPriorityStyles(entry.med.priority);

              return (
                <div
                  key={`${entry.med.id}-${entry.scheduledTime}`}
                  className={`flex items-center justify-between gap-3 px-4 py-4 ${
                    taken ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {/* Badges */}
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${timeOfDayClasses}`}
                      >
                        {timeOfDay.label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityStyles.badgeBg} ${priorityStyles.badgeText}`}
                      >
                        {formatPriorityLabel(entry.med.priority)}
                      </span>
                    </div>

                    {/* Name & dose */}
                    <p className="font-bold text-slate-800">{entry.med.name}</p>
                    <p className="text-sm font-medium text-slate-400">
                      {entry.med.dose}
                    </p>

                    {/* Frequency & time */}
                    <p className="mt-0.5 text-xs text-slate-500">
                      {getFrequencyLabel(entry.med)}
                      {getFrequencyLabel(entry.med) && " · "}
                      {formatClockTime(entry.scheduledTime)}
                    </p>

                    {/* Instructions */}
                    {entry.med.instructions && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        {entry.med.instructions}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1.5">
                    {taken ? (
                      <>
                        <span className="inline-flex items-center rounded-full bg-[#e9f7f2] px-3 py-1 text-xs font-bold text-[#4dbd91]">
                          ✓ Taken
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUndo(entry.med, entry.scheduledTime)
                          }
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-50"
                        >
                          Undo
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleTake(entry.med, entry.scheduledTime)
                        }
                        className="rounded-full bg-[#4a80f0] px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-200"
                      >
                        Take
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
