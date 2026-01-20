import React, { useMemo } from "react";
import { Medication, DoseRecord } from "@/types";
import { formatDateLabelShort } from "@/utils/date";
import { groupDosesByDate } from "@/utils/medication-helpers";

// ============================================
// Types
// ============================================

interface HistoryViewProps {
  medications: Medication[];
  takenLog: DoseRecord[];
}

// ============================================
// Empty State
// ============================================

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center px-4 text-center text-gray-700">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-4xl">
        📅
      </div>
      <p className="mb-1 text-xl font-semibold">No history yet</p>
      <p className="max-w-xs text-base text-gray-600">
        As you mark medications as taken, your recent days will appear here.
      </p>
    </div>
  );
}

// ============================================
// Summary Card
// ============================================

interface SummaryCardProps {
  totalDoses: number;
}

function SummaryCard({ totalDoses }: SummaryCardProps) {
  return (
    <div className="relative mb-2 overflow-hidden rounded-[40px] bg-gradient-to-r from-[#52B79A] to-[#4A80F0] p-8 text-white shadow-xl shadow-blue-100">
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">
            History
          </p>
          <h2 className="text-2xl font-black tracking-tight">Recent doses</h2>
          <p className="max-w-[220px] pt-2 text-sm leading-snug opacity-90">
            A quick view of doses you have marked as taken over the last few
            days.
          </p>
        </div>

        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white/10 text-center text-[11px] font-bold">
          <span className="uppercase tracking-[0.16em] opacity-80">Total</span>
          <span className="text-2xl font-black leading-tight">
            {totalDoses}
          </span>
          <span className="opacity-80">doses</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Day Card
// ============================================

interface DayCardProps {
  dateKey: string;
  entries: DoseRecord[];
  medMap: Map<number, Medication>;
}

function DayCard({ dateKey, entries, medMap }: DayCardProps) {
  const label = formatDateLabelShort(dateKey);
  const uniqueMeds = new Set(entries.map((e) => e.medId));

  // Build compact description of a few meds for this day
  const sampleDescriptions = entries.slice(0, 3).map((entry) => {
    const med = medMap.get(entry.medId);
    const medName = med?.name || "Medication";
    const timeText = entry.scheduledTime || "";
    return `${medName}${timeText ? ` • ${timeText}` : ""}`;
  });

  const remainingCount = entries.length - sampleDescriptions.length;

  function handleViewDay() {
    // TODO: Navigate to day detail view
    console.log("View day:", dateKey);
  }

  function handleMoreDetails() {
    // TODO: Show expanded details
    console.log("More details:", dateKey);
  }

  return (
    <div className="mb-4 flex items-center justify-between rounded-[40px] border border-slate-50 bg-white p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
      <div className="max-w-[65%] space-y-1">
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-50 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">
          📅 {label}
        </p>
        <h3 className="text-[22px] font-black leading-tight text-slate-800">
          {entries.length} dose{entries.length === 1 ? "" : "s"} taken
        </h3>
        <p className="mb-1 text-[13px] font-bold text-slate-400">
          {uniqueMeds.size} medication{uniqueMeds.size === 1 ? "" : "s"}
        </p>
        {sampleDescriptions.length > 0 && (
          <p className="mt-1 max-w-[240px] text-[12px] font-medium leading-relaxed text-slate-400">
            {sampleDescriptions.join(" • ")}
            {remainingCount > 0 && ` • +${remainingCount} more`}
          </p>
        )}
      </div>

      {/* TODO Uncomment when these actually go somewhere
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleViewDay}
          className="whitespace-nowrap rounded-[20px] bg-[#4A80F0] px-8 py-4 text-[15px] font-black text-white shadow-lg shadow-blue-100 transition-transform active:scale-95"
        >
          View day
        </button>
        <button
          type="button"
          onClick={handleMoreDetails}
          className="text-sm font-extrabold text-[#4A80F0] hover:underline"
        >
          More details
        </button>
      </div> */}
    </div>
  );
}

// ============================================
// Component
// ============================================

export default function HistoryView({
  medications,
  takenLog,
}: HistoryViewProps) {
  const grouped = useMemo(() => groupDosesByDate(takenLog), [takenLog]);

  // Quick lookup from medId to medication details
  const medMap = useMemo(() => {
    const map = new Map<number, Medication>();
    medications.forEach((med) => {
      map.set(med.id, med);
    });
    return map;
  }, [medications]);

  const totalDoses = takenLog.length;

  if (!grouped.length) {
    return <EmptyState />;
  }

  // Show last 7 days
  const recent = grouped.slice(0, 7);

  return (
    <div className="space-y-6 pb-20">
      <SummaryCard totalDoses={totalDoses} />

      {recent.map(([dateKey, entries]) => (
        <DayCard
          key={dateKey}
          dateKey={dateKey}
          entries={entries}
          medMap={medMap}
        />
      ))}
    </div>
  );
}
