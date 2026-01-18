import React, { useState } from "react";
import { Medication, FontSize } from "@/types";
import { formatClockTime } from "@/utils/timeWindows";
import {
  getPriorityStyles,
  formatPriorityLabel,
  getFrequencyLabel,
  getNameClass,
  getDoseClass,
} from "@/utils/medication-helpers";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

// ============================================
// Types
// ============================================

interface MedListCardProps {
  med: Medication;
  onEdit?: (med: Medication) => void;
  onDelete?: (med: Medication) => void;
  caregiverMode?: boolean;
  fontSize?: FontSize;
}

// ============================================
// Component
// ============================================

export default function MedListCard({
  med,
  onEdit,
  onDelete,
  caregiverMode = false,
  fontSize = "normal",
}: MedListCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityStyles = getPriorityStyles(med.priority);
  const lowStock =
    typeof med.pillsRemaining === "number" &&
    med.pillsRemaining < LOW_STOCK_THRESHOLD;

  const canEdit = Boolean(caregiverMode && onEdit);
  const canDelete = Boolean(caregiverMode && onDelete);

  return (
    <div className="rounded-[10px] border border-slate-50 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Medication info */}
        <div>
          {/* Priority badge */}
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${priorityStyles.badgeBg} ${priorityStyles.badgeText}`}
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

          {/* Frequency */}
          <div className="mt-1 text-sm font-medium text-slate-400">
            {getFrequencyLabel(med)}
          </div>

          {/* Times */}
          {Array.isArray(med.times) && med.times.length > 0 && (
            <div className="mt-1 text-sm text-slate-400">
              Times: {med.times.map((t) => formatClockTime(t)).join(", ")}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => canEdit && onEdit?.(med)}
              disabled={!canEdit}
              className={`min-h-9 rounded-full border px-3 py-1 text-xs font-medium ${
                canEdit
                  ? "border-gray-300 text-gray-800"
                  : "cursor-not-allowed border-gray-200 text-gray-400 opacity-60"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => canDelete && onDelete?.(med)}
              disabled={!canDelete}
              className={`min-h-9 rounded-full border px-3 py-1 text-xs font-semibold ${
                canDelete
                  ? "border-red-500 text-red-600"
                  : "cursor-not-allowed border-gray-200 text-gray-400 opacity-60"
              }`}
            >
              Delete
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-blue-700"
          >
            {isExpanded ? "Hide details" : "More info"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-2 rounded-xl bg-white/70 p-3 text-sm text-gray-800">
          {med.instructions && (
            <p className="mb-1">
              <span className="font-semibold">Instructions: </span>
              {med.instructions}
            </p>
          )}
          {med.doctor && (
            <p className="mb-1">
              <span className="font-semibold">Doctor: </span>
              {med.doctor}
            </p>
          )}
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
