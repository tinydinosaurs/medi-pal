import React, { useState } from "react";
import { Medication, DoseRecord } from "@/types";
import {
  getTimeOfDayInfo,
  getTimeOfDayClasses,
  formatClockTime,
} from "@/utils/timeWindows";
import {
  getPriorityStyles,
  formatPriorityLabel,
  getFrequencyLabel,
  getNameClass,
  getDoseClass,
  FontSize,
} from "@/utils/medication-helpers";

// ============================================
// Types
// ============================================

interface MedCardProps {
  med: Medication;
  scheduledTime: string;
  todayKey: string;
  takenLog: DoseRecord[];
  onTake: (med: Medication, scheduledTime: string) => void;
  onUndo: (med: Medication, scheduledTime: string) => void;
  fontSize?: FontSize;
}

// ============================================
// Component
// ============================================

export default function MedCard({
  med,
  scheduledTime,
  todayKey,
  takenLog,
  onTake,
  onUndo,
  fontSize = "normal",
}: MedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this dose was taken
  const takenEntry = takenLog.find(
    (log) =>
      log.medId === med.id &&
      log.scheduledTime === scheduledTime &&
      log.date === todayKey
  );
  const isTaken = !!takenEntry;

  // Styling
  const timeOfDay = getTimeOfDayInfo(scheduledTime);
  const timeOfDayClasses = getTimeOfDayClasses(timeOfDay.key);
  const priorityStyles = getPriorityStyles(med.priority);
  const lowStock =
    typeof med.pillsRemaining === "number" && med.pillsRemaining < 10;

  return (
    <div
      className={`rounded-[10px] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-2 ${
        isTaken ? "border-gray-300" : "border-[#e4f6ef]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Medication info */}
        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span
              className={`rounded-full border px-2 py-1 text-[11px] font-medium ${timeOfDayClasses}`}
            >
              {timeOfDay.label}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityStyles.badgeBg} ${priorityStyles.badgeText}`}
            >
              {formatPriorityLabel(med.priority)}
            </span>
          </div>

          {/* Name & dose */}
          <div className={`${getNameClass(fontSize)} font-bold text-slate-800`}>
            {med.name}
          </div>
          <div
            className={`${getDoseClass(fontSize)} font-semibold text-slate-400`}
          >
            {med.dose}
          </div>

          {/* Frequency & time */}
          <p className="mt-1 text-sm font-medium text-slate-400">
            {getFrequencyLabel(med)}
            {getFrequencyLabel(med) && " · "}
            {formatClockTime(scheduledTime)}
          </p>

          {/* Instructions */}
          {med.instructions && (
            <p className="mt-1 text-xs text-slate-500">{med.instructions}</p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-2 self-stretch justify-center text-right">
          {isTaken ? (
            <>
              <span className="inline-flex min-h-8 items-center rounded-full bg-[#e9f7f2] px-4 py-1 text-xs font-bold text-[#4dbd91]">
                Taken ·{" "}
                {takenEntry?.takenAt
                  ? new Date(takenEntry.takenAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
              <button
                type="button"
                onClick={() => onUndo(med, scheduledTime)}
                className="min-h-8 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
              >
                Undo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onTake(med, scheduledTime)}
              className="min-h-10 rounded-full bg-[#4a80f0] px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-200"
            >
              Mark as taken
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium text-[#4a80f0]"
          >
            {isExpanded ? "Hide details" : "More info"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-2 rounded-xl bg-white/70 p-3 text-sm text-gray-800">
          {med.doctor && (
            <p className="mb-1">
              <span className="font-semibold">Doctor: </span>
              {med.doctor}
            </p>
          )}
          <p className="mb-1">
            <span className="font-semibold">Frequency: </span>
            {getFrequencyLabel(med)}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Pills remaining: </span>
            {typeof med.pillsRemaining === "number"
              ? med.pillsRemaining
              : "N/A"}
          </p>
          {med.refillable && (
            <p className="mb-1 text-xs text-gray-700">
              Prescription is refillable.
            </p>
          )}
          {med.notes && (
            <p className="mt-1 text-xs text-gray-700">
              <span className="font-semibold">Notes: </span>
              {med.notes}
            </p>
          )}
          {lowStock && (
            <p className="mt-2 rounded-lg bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-900">
              ⚠ Only {med.pillsRemaining} pills remaining - consider refill
            </p>
          )}
        </div>
      )}
    </div>
  );
}
