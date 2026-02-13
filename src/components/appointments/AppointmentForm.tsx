/* Form shared between AppointmentReview and AppointmentCard (which has edit mode).
   Form should be pre-populated with existing data when available.
*/

import React, { useState } from "react";
import { Appointment, AppointmentFields } from "@/types";

interface AppointmentFormProps {
  appointments: Appointment[];
  initialData?: AppointmentFields;
  onSave?: (fields: AppointmentFields) => void;
  onCancel?: () => void;
}

// Validation errors - add fields as needed
interface FormErrors {
  date?: string;
  time?: string;
}

function createInitialFormState(data?: AppointmentFields): AppointmentFields {
  return {
    title: data?.title ?? null,
    doctor: data?.doctor ?? null,
    specialty: data?.specialty ?? null,
    location: data?.location ?? null,
    address: data?.address ?? null,
    phone: data?.phone ?? null,
    date: data?.date ?? null,
    time: data?.time ?? null,
    reason: data?.reason ?? null,
    notes: data?.notes ?? null,
  };
}

export default function AppointmentForm({
  appointments = [],
  initialData,
  onSave,
  onCancel,
}: AppointmentFormProps) {
  const [formState, setFormState] = useState<AppointmentFields>(
    createInitialFormState(initialData),
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Create new set of unique past locations for auto-complete suggestions, with falsy values removed
  const pastLocations = [
    ...new Set(
      appointments
        .map((appointment) => appointment.location)
        .filter(Boolean) as string[],
    ),
  ];

  // Update a single field
  function updateField<K extends keyof AppointmentFields>(
    field: K,
    value: AppointmentFields[K],
  ) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  // Validate form before saving
  function validateForm(): boolean {
    const newErrors: FormErrors = {};
    if (!formState.date) newErrors.date = "Date is required";
    if (!formState.time) newErrors.time = "Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateForm()) {
      onSave?.(formState);
    }
  }

  // TODO: Implement form fields UI
  // Consider react-datepicker or native <input type="date">/<input type="time">
  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm sm:text-base">
      {/* Title Field */}
      <div>
        <label className="mb-1 block font-medium">Title</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
          placeholder="Enter appointment title"
          value={formState.title ?? ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>
      {/* Day */}
      <div>
        <label className="mb-1 block font-medium">Day*</label>
        <input
          type="date"
          value={formState.date ?? ""}
          onChange={(e) => updateField("date", e.target.value)}
          className="w-full rounded-lg border p-3 text-lg"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>
      {/* Time */}
      <div>
        <label className="mb-1 block font-medium">Time*</label>
        <input
          type="time"
          value={formState.time ?? ""}
          onChange={(e) => updateField("time", e.target.value)}
          className="w-full rounded-lg border p-3 text-lg"
        />
        {errors.time && (
          <p className="mt-1 text-sm text-red-600">{errors.time}</p>
        )}
      </div>
      {/* Doctor */}
      <div>
        <label className="mb-1 block font-medium">Doctor</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
          placeholder="Enter doctor's name"
          value={formState.doctor ?? ""}
          onChange={(e) => updateField("doctor", e.target.value)}
        />
      </div>
      {/* Location */}

      <input
        type="text"
        list="locations"
        value={formState.location ?? ""}
        onChange={(e) => updateField("location", e.target.value)}
      />
      {/* Show as datalist for native autocomplete */}
      <datalist id="locations">
        {pastLocations.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
      {/* Reason */}
      <div>
        <label className="mb-1 block font-medium">Reason</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
          placeholder="Enter reason for appointment"
          value={formState.reason ?? ""}
          onChange={(e) => updateField("reason", e.target.value)}
        />
      </div>
      {/* Notes */}
      <div>
        <label className="mb-1 block font-medium">Notes</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
          placeholder="Additional notes"
          value={formState.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>
      {/* Save/Cancel Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
