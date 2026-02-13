import { useCallback } from "react";
import { useStorageState } from "@/lib/useStorageState";
import { storage } from "@/lib/storage";
import type { DoseRecord } from "@/types";

const STORAGE_KEY = "caretaker-dose-log";

export function useDoseLog() {
  const [doseLog, setDoseLog] = useStorageState<DoseRecord[]>(
    STORAGE_KEY,
    []
  );

  const logDose = useCallback(
    (medId: number, scheduledTime: string, date?: string) => {
      const record: DoseRecord = {
        date: date ?? new Date().toISOString().split("T")[0],
        medId,
        scheduledTime,
        takenAt: new Date().toISOString(),
      };

      setDoseLog((prev) => [...prev, record]);
      return record;
    },
    [setDoseLog],
  );

  const removeDose = useCallback(
    (medId: number, scheduledTime: string, date: string) => {
      setDoseLog((prev) =>
        prev.filter(
          (record) =>
            !(
              record.medId === medId &&
              record.scheduledTime === scheduledTime &&
              record.date === date
            ),
        ),
      );
    },
    [setDoseLog],
  );

  const isDoseTaken = useCallback(
    (medId: number, scheduledTime: string, date: string): boolean => {
      return doseLog.some(
        (record) =>
          record.medId === medId &&
          record.scheduledTime === scheduledTime &&
          record.date === date,
      );
    },
    [doseLog],
  );

  const getDosesForDate = useCallback(
    (date: string): DoseRecord[] => {
      return doseLog.filter((record) => record.date === date);
    },
    [doseLog],
  );

  const getDosesForMed = useCallback(
    (medId: number): DoseRecord[] => {
      return doseLog.filter((record) => record.medId === medId);
    },
    [doseLog],
  );

  const clearLog = useCallback(() => {
    setDoseLog([]);
    storage.remove(STORAGE_KEY);
  }, [setDoseLog]);

  return {
    doseLog,
    logDose,
    removeDose,
    isDoseTaken,
    getDosesForDate,
    getDosesForMed,
    clearLog,
  };
}
