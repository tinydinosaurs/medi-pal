// this page will list all appointments and include a button to add appointments
// button click will route users to src/app/appointments/new/page.tsx
"use client";

import { Appointment } from "@/types";
import { useAppointments } from "@/hooks/useAppointment";
import { EmptyState } from "@/components/shared";
interface AppointmentPageProps {
  appointments: Appointment[];
}

export default function AppointmentsPage({
  appointments = [],
}: AppointmentPageProps) {
  return (
    <>
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
        <div className="flex gap-2">
          <button
            type="button"
            // onClick={handleAddClick}
            className="rounded-full bg-[#4a80f0] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3a70e0]"
          >
            + Add New
          </button>
        </div>
      </div>
      {!appointments.length && (
        <EmptyState
          icon="📅"
          title="No Appointments"
          description="You have no upcoming appointments. Click the button in the top right to add one now."
        />
      )}
    </>
  );
}
