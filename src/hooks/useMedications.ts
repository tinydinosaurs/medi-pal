import { useState, useEffect, useCallback } from "react";
import { Medication } from "@/types";
import { loadMedications, saveMedications } from "@/utils/storage";

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>(() => {
    if (typeof window === "undefined") return [];
    return loadMedications() as Medication[];
  });

  // Derived: we're loaded if we're on the client
  const isLoaded = typeof window !== "undefined";

  // Persist whenever medications change
  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  const addMedication = useCallback((med: Omit<Medication, "id">) => {
    // we omit id since we're creating the id here
    const newMed: Medication = {
      ...med,
      id: Date.now(), // Easy unique ID for now - replace with better ID generation after POC
    };
    setMedications((prev) => [...prev, newMed]);
    return newMed;
  }, []);

  const updateMedication = useCallback(
    (id: number, updates: Partial<Medication>) => {
      setMedications((prev) =>
        prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
      );
    },
    []
  );

  const deleteMedication = useCallback((id: number) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  }, []);

  const getMedication = useCallback(
    (id: number) => medications.find((med) => med.id === id),
    [medications]
  );

  return {
    medications,
    isLoaded,
    addMedication,
    updateMedication,
    deleteMedication,
    getMedication,
  };
}
