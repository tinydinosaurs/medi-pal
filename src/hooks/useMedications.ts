import { useCallback } from "react";
import { useStorageState } from "@/lib/useStorageState";
import type { Medication } from "@/types";

const STORAGE_KEY = "caretaker-medications";

export function useMedications() {
  const [medications, setMedications] = useStorageState<Medication[]>(
    STORAGE_KEY,
    []
  );

  const addMedication = useCallback((data: Omit<Medication, "id">) => {
    const newMed: Medication = {
      ...data,
      id: Date.now(),
    };
    setMedications((prev) => [...prev, newMed]);
    return newMed;
  }, [setMedications]);

  const updateMedication = useCallback(
    (id: number, updates: Partial<Omit<Medication, "id">>) => {
      setMedications((prev) =>
        prev.map((med) => (med.id === id ? { ...med, ...updates } : med)),
      );
    },
    [setMedications],
  );

  const deleteMedication = useCallback((id: number) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  }, [setMedications]);

  const getMedicationById = useCallback(
    (id: number): Medication | undefined => {
      return medications.find((med) => med.id === id);
    },
    [medications],
  );

  return {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    getMedicationById,
  };
}
