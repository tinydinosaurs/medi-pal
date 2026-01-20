"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useMedications } from "@/hooks/useMedications";
import { useDoseLog } from "@/hooks/useDoseLog";
import { shouldTakeMedToday } from "@/utils/scheduling";
import { getDateKey } from "@/utils/date";
import { Medication, ScheduleEntry } from "@/types";
import { formatClockTime } from "@/utils/timeWindows";
import { MOCK_APPOINTMENTS, MOCK_DOCUMENTS } from "@/data/mocks";

// ============================================
// Mock Data (placeholder for other sections)
// ============================================

const MOCK_ALERTS = [
  {
    id: 1,
    type: "refill",
    title: "Prescription Refill Due",
    message: "Lisinopril refill needed in 3 days",
  },
  {
    id: 2,
    type: "appointment",
    title: "Appointment Prep",
    message: "Dr. Chen visit on Monday - prep checklist available",
  },
];

// ============================================
// Dashboard Cards
// ============================================

function WelcomeCard() {
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-900">{greeting}! 👋</h2>
      <p className="text-slate-600">{dateStr}</p>
    </div>
  );
}

interface TodaysMedsCardProps {
  schedule: ScheduleEntry[];
  takenCount: number;
  totalCount: number;
  onTake: (med: Medication, time: string) => void;
  onUndo: (med: Medication, time: string) => void;
  isTaken: (medId: number, time: string) => boolean;
}

function TodaysMedsCard({
  schedule,
  takenCount,
  totalCount,
  onTake,
  onUndo,
  isTaken,
}: TodaysMedsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleSchedule = isExpanded ? schedule : schedule.slice(0, 5);
  const hiddenCount = schedule.length - 5;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h3 className="text-lg font-semibold text-slate-900">
            Today&apos;s Medications
          </h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          {takenCount}/{totalCount} taken
        </span>
      </div>

      <div className="divide-y divide-slate-50">
        {schedule.length === 0 ? (
          <p className="p-4 text-center text-slate-500">
            No medications scheduled for today
          </p>
        ) : (
          visibleSchedule.map((entry) => {
            const taken = isTaken(entry.med.id, entry.scheduledTime);
            return (
              <div
                key={`${entry.med.id}-${entry.scheduledTime}`}
                className={`flex items-center justify-between p-4 ${
                  taken ? "bg-emerald-50/50" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {entry.med.name}{" "}
                    <span className="font-normal text-slate-600">
                      {entry.med.dose}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatClockTime(entry.scheduledTime)}
                  </p>
                </div>
                {taken ? (
                  <button
                    type="button"
                    onClick={() => onUndo(entry.med, entry.scheduledTime)}
                    className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
                  >
                    ✓ Taken
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onTake(entry.med, entry.scheduledTime)}
                    className="rounded-full bg-[#4a80f0] px-4 py-2 text-sm font-semibold text-white shadow-md"
                  >
                    Mark taken
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {hiddenCount > 0 && (
        <div className="border-t border-slate-100 p-3 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-[#4a80f0] hover:underline"
          >
            {isExpanded ? "Show less ↑" : `show ${hiddenCount} more ↓`}
          </button>
        </div>
      )}

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/medications"
          className="text-sm font-semibold text-[#4a80f0] hover:underline"
        >
          View all medications →
        </Link>
      </div>
    </div>
  );
}

function AppointmentsCard() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <span className="text-xl">📅</span>
        <h3 className="text-lg font-semibold text-slate-900">
          Upcoming Appointments
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {MOCK_APPOINTMENTS.map((apt) => (
          <div key={apt.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-slate-900">{apt.doctor}</p>
              <p className="text-sm text-slate-600">{apt.specialty}</p>
              <p className="text-sm text-slate-500">
                {new Date(apt.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                at {apt.time}
              </p>
            </div>
            <span className="text-slate-400">›</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 p-3">
        <Link
          href="/appointments"
          className="text-sm font-semibold text-[#4a80f0] hover:underline"
        >
          View all appointments →
        </Link>
      </div>
    </div>
  );
}

function DocumentsCard() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <span className="text-xl">📄</span>
        <h3 className="text-lg font-semibold text-slate-900">
          Recent Documents
        </h3>
      </div>
      <div className="divide-y divide-slate-50">
        {MOCK_DOCUMENTS.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-slate-900">{doc.name}</p>
              <p className="text-sm text-slate-600">
                {doc.type} • {doc.date}
              </p>
            </div>
            {doc.isNew && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                New
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 p-3">
        <Link
          href="/documents"
          className="text-sm font-semibold text-[#4a80f0] hover:underline"
        >
          View all documents →
        </Link>
      </div>
    </div>
  );
}

function AlertsCard() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-white">
      <div className="flex items-center gap-2 border-b border-amber-100 p-4">
        <span className="text-xl">⚠️</span>
        <h3 className="text-lg font-semibold text-amber-700">
          Needs Attention
        </h3>
      </div>
      <div className="space-y-3 p-4">
        {MOCK_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl border-2 p-3 ${
              alert.type === "refill"
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                alert.type === "refill" ? "text-amber-900" : "text-blue-900"
              }`}
            >
              {alert.title}
            </p>
            <p
              className={`mt-1 text-sm ${
                alert.type === "refill" ? "text-amber-700" : "text-blue-700"
              }`}
            >
              {alert.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">
        Quick Actions
      </h3>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => alert("📄 Document upload coming soon!")}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
        >
          📤 Upload Document
        </button>
        <button
          type="button"
          onClick={() => alert("💬 AI Chat coming soon!")}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          💬 Ask Caretaker
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Page
// ============================================

export default function HomePage() {
  const { medications } = useMedications();
  const { doseLog, recordDose, undoDose, isDoseTaken } = useDoseLog();

  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);

  // Build today's schedule
  const schedule = useMemo(() => {
    const entries: ScheduleEntry[] = [];
    medications.forEach((med) => {
      if (!shouldTakeMedToday(med, today)) return;
      (med.times || []).forEach((time) => {
        entries.push({ med, scheduledTime: time });
      });
    });
    // Sort by time
    entries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return entries;
  }, [medications, today]);

  const takenCount = schedule.filter((entry) =>
    isDoseTaken(entry.med.id, entry.scheduledTime, todayKey)
  ).length;
  const totalCount = schedule.length;

  const handleTake = useCallback(
    (med: Medication, time: string) => {
      recordDose(med.id, time);
    },
    [recordDose]
  );

  const handleUndo = useCallback(
    (med: Medication, time: string) => {
      undoDose(med.id, time, todayKey);
    },
    [undoDose, todayKey]
  );

  const checkIsTaken = useCallback(
    (medId: number, time: string) => isDoseTaken(medId, time, todayKey),
    [isDoseTaken, todayKey]
  );

  return (
    <div className="space-y-6">
      <WelcomeCard />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <TodaysMedsCard
            schedule={schedule}
            takenCount={takenCount}
            totalCount={totalCount}
            onTake={handleTake}
            onUndo={handleUndo}
            isTaken={checkIsTaken}
          />
          <AppointmentsCard />
          <DocumentsCard />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <QuickActionsCard />
          <AlertsCard />
        </div>
      </div>
    </div>
  );
}
