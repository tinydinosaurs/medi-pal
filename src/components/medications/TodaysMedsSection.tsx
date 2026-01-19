"use client";

import { useCallback } from "react";
import { useMedications } from "@/hooks/useMedications";
import { useDoseLog } from "@/hooks/useDoseLog";
import { Medication } from "@/types";
import TodayView from "./TodayView";

export default function TodaysMedsSection() {
  const { medications } = useMedications();
  const { doseLog, recordDose, undoDose } = useDoseLog();

  const handleTake = useCallback(
    (med: Medication, scheduledTime: string) => {
      recordDose(med.id, scheduledTime);
    },
    [recordDose]
  );

  const handleUndo = useCallback(
    (med: Medication, scheduledTime: string) => {
      const todayKey = new Date().toISOString().split("T")[0];
      undoDose(med.id, scheduledTime, todayKey);
    },
    [undoDose]
  );

  return (
    <TodayView
      medications={medications}
      takenLog={doseLog}
      onTake={handleTake}
      onUndo={handleUndo}
    />
  );
}
