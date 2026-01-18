import { useState, useEffect, useCallback } from "react";
import { DoseRecord } from "@/types";
import { loadTakenLog, saveTakenLog } from "@/utils/storage";

export function useDoseLog() {
  const [doseLog, setDoseLog] = useState<DoseRecord[]>(() => {
    if (typeof window === "undefined") return []; // SSR guard
    return loadTakenLog() as DoseRecord[];
  });

  // Derived: we're loaded if we're on the client
  const isLoaded = typeof window !== "undefined";

  // Persist whenever log changes
  useEffect(() => {
    saveTakenLog(doseLog);
  }, [doseLog]);

  const recordDose = useCallback(
    (medId: number, scheduledTime: string, date?: string) => {
      const record: DoseRecord = {
        date: date || new Date().toISOString().split("T")[0], // '2026-01-16'
        medId,
        scheduledTime,
        takenAt: new Date().toISOString(),
      };
      setDoseLog((prev) => [...prev, record]);
      return record;
    },
    []
  );

  const undoDose = useCallback(
    (medId: number, scheduledTime: string, date: string) => {
      setDoseLog((prev) =>
        prev.filter(
          (record) =>
            !(
              record.medId === medId &&
              record.scheduledTime === scheduledTime &&
              record.date === date
            )
        )
      );
    },
    []
  );

  const isDoseTaken = useCallback(
    (medId: number, scheduledTime: string, date: string): boolean => {
      return doseLog.some(
        (record) =>
          record.medId === medId &&
          record.scheduledTime === scheduledTime &&
          record.date === date
      );
    },
    [doseLog]
  );

  const getDosesForDate = useCallback(
    (date: string): DoseRecord[] => {
      return doseLog.filter((record) => record.date === date);
    },
    [doseLog]
  );

  const getDosesForMedication = useCallback(
    (medId: number): DoseRecord[] => {
      return doseLog.filter((record) => record.medId === medId);
    },
    [doseLog]
  );

  return {
    doseLog,
    isLoaded,
    recordDose,
    undoDose,
    isDoseTaken,
    getDosesForDate,
    getDosesForMedication,
  };
}
