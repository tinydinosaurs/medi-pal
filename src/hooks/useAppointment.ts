/**
 * useAppointments Hook
 *
 * Manages appointments in local storage with CRUD operations.
 */

import { useCallback, useMemo } from "react";
import { useStorageState } from "@/lib/useStorageState";
import type { Appointment } from "@/types";

const STORAGE_KEY = "caretaker-appointments";

export function useAppointments() {
  const [appointments, setAppointments] = useStorageState<Appointment[]>(
    STORAGE_KEY,
    []
  );

  const addAppointment = useCallback(
    (data: Omit<Appointment, "id" | "prepared">) => {
      const newAppointment: Appointment = {
        ...data,
        id: Date.now(),
        prepared: false,
      };
      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    },
    [setAppointments],
  );

  const updateAppointment = useCallback(
    (id: number, updates: Partial<Omit<Appointment, "id">>) => {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt)),
      );
    },
    [setAppointments],
  );

  const deleteAppointment = useCallback((id: number) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  }, [setAppointments]);

  const togglePrepared = useCallback((id: number) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, prepared: !apt.prepared } : apt,
      ),
    );
  }, [setAppointments]);

  // Get upcoming appointments (sorted by date/time)
  const upcoming = useMemo(
    () =>
      appointments
        .filter((apt) => {
          const aptDate = new Date(`${apt.date}T${apt.time || "00:00"}`);
          return aptDate >= new Date();
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
          const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
          return dateA.getTime() - dateB.getTime();
        }),
    [appointments]
  );

  // Get past appointments (sorted most recent first)
  const past = useMemo(
    () =>
      appointments
        .filter((apt) => {
          const aptDate = new Date(`${apt.date}T${apt.time || "00:00"}`);
          return aptDate < new Date();
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
          const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
          return dateB.getTime() - dateA.getTime();
        }),
    [appointments]
  );

  return {
    appointments,
    upcoming,
    past,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    togglePrepared,
  };
}
