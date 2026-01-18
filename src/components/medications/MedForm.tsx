import React, { useState } from "react";
import { Medication, Priority, Frequency } from "@/types";
import { PRIORITIES, FREQUENCIES, DAYS_OF_WEEK } from "@/lib/constants";

// ============================================
// Types
// ============================================

interface MedFormProps {
  initialMed?: Medication;
  onSave: (med: Medication) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  dose: string;
  priority: Priority;
  frequency: Frequency;
  daysOfWeek: string[];
  customFrequency: string;
  times: string[];
  instructions: string;
  doctor: string;
  pillsRemaining: string;
  refillable: boolean;
  notes: string;
}

interface FormErrors {
  name?: string;
  dose?: string;
  times?: string;
}

// ============================================
// Helpers
// ============================================

function createInitialFormState(med?: Medication): FormState {
  return {
    name: med?.name || "",
    dose: med?.dose || "",
    priority: med?.priority || "routine",
    frequency: med?.frequency || "daily",
    daysOfWeek: med?.daysOfWeek || [],
    customFrequency: med?.customFrequency || "",
    times: med?.times?.length ? med.times : [""],
    instructions: med?.instructions || "",
    doctor: med?.doctor || "",
    pillsRemaining:
      typeof med?.pillsRemaining === "number" ? String(med.pillsRemaining) : "",
    refillable: Boolean(med?.refillable),
    notes: med?.notes || "",
  };
}

// ============================================
// Component
// ============================================

export default function MedForm({
  initialMed,
  onSave,
  onCancel,
}: MedFormProps) {
  // Single form state object, initialized once from initialMed
  // Parent should use key={initialMed?.id ?? "new"} to remount on edit
  const [form, setForm] = useState<FormState>(() =>
    createInitialFormState(initialMed)
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Update a single field
  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  }

  function updateTime(index: number, value: string) {
    setForm((prev) => {
      const newTimes = [...prev.times];
      newTimes[index] = value;
      return { ...prev, times: newTimes };
    });
  }

  function addTimeField() {
    setForm((prev) => ({ ...prev, times: [...prev.times, ""] }));
  }

  function removeTimeField(index: number) {
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  }

  function handleLookupMedication() {
    // Future feature - med lookup via secure API
    alert(
      "🔍 Medication lookup coming soon! For now, please enter details manually."
    );
  }

  function validate(): { valid: boolean; cleanedTimes: string[] } {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Medication name is required.";
    }
    if (!form.dose.trim()) {
      nextErrors.dose = "Dose is required.";
    }

    const cleanedTimes = form.times.map((t) => t.trim()).filter(Boolean);
    if (cleanedTimes.length === 0) {
      nextErrors.times = "At least one time is required.";
    }

    setErrors(nextErrors);
    return { valid: Object.keys(nextErrors).length === 0, cleanedTimes };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { valid, cleanedTimes } = validate();
    if (!valid) return;

    const med: Medication = {
      id: initialMed?.id ?? Date.now(),
      name: form.name.trim(),
      dose: form.dose.trim(),
      priority: form.priority,
      frequency: form.frequency,
      times: cleanedTimes,
      daysOfWeek: form.frequency === "specific-days" ? form.daysOfWeek : [],
      customFrequency:
        form.frequency === "custom" ? form.customFrequency.trim() : "",
      doctor: form.doctor.trim(),
      instructions: form.instructions.trim(),
      pillsRemaining:
        form.pillsRemaining === "" || Number.isNaN(Number(form.pillsRemaining))
          ? 0
          : Number(form.pillsRemaining),
      refillable: form.refillable,
      notes: form.notes.trim(),
    };

    onSave(med);
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {initialMed ? "Edit Medication" : "Add Medication"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 text-sm sm:text-base"
        >
          {/* Medication Name + Lookup */}
          <div>
            <label className="mb-1 block font-medium">Medication Name *</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <button
                type="button"
                onClick={handleLookupMedication}
                className="rounded-lg border border-blue-500 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                🔍 Look up
              </button>
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Dose */}
          <div>
            <label className="mb-1 block font-medium">Dose *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              placeholder="500mg, 1 tablet, etc."
              value={form.dose}
              onChange={(e) => updateField("dose", e.target.value)}
            />
            {errors.dose && (
              <p className="mt-1 text-sm text-red-600">{errors.dose}</p>
            )}
          </div>

          {/* Priority & Frequency */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">Priority</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
                value={form.priority}
                onChange={(e) =>
                  updateField("priority", e.target.value as Priority)
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium">Frequency</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
                value={form.frequency}
                onChange={(e) =>
                  updateField("frequency", e.target.value as Frequency)
                }
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specific Days */}
          {form.frequency === "specific-days" && (
            <div>
              <label className="mb-1 block font-medium">Days of Week</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const active = form.daysOfWeek.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`min-w-11 rounded-full border px-3 py-2 text-sm font-medium ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-800"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Frequency */}
          {form.frequency === "custom" && (
            <div>
              <label className="mb-1 block font-medium">Custom Schedule</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
                placeholder="e.g., First Monday of each month"
                value={form.customFrequency}
                onChange={(e) => updateField("customFrequency", e.target.value)}
              />
            </div>
          )}

          {/* Times */}
          <div>
            <label className="mb-1 block font-medium">Times to Take *</label>
            <div className="space-y-2">
              {form.times.map((t, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base"
                    value={t}
                    onChange={(e) => updateTime(index, e.target.value)}
                  />
                  {form.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeField(index)}
                      className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeField}
                className="mt-1 rounded-full border border-dashed border-blue-500 px-3 py-2 text-sm font-medium text-blue-600"
              >
                + Add another time
              </button>
            </div>
            {errors.times && (
              <p className="mt-1 text-sm text-red-600">{errors.times}</p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <label className="mb-1 block font-medium">
              Special Instructions
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              rows={2}
              placeholder="Take with food, before bed, don't drive, etc."
              value={form.instructions}
              onChange={(e) => updateField("instructions", e.target.value)}
            />
          </div>

          {/* Doctor & Pills */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium">
                Doctor / Prescriber
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
                value={form.doctor}
                onChange={(e) => updateField("doctor", e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">Pills Remaining</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
                value={form.pillsRemaining}
                onChange={(e) => updateField("pillsRemaining", e.target.value)}
              />
            </div>
          </div>

          {/* Refillable */}
          <div className="flex items-center gap-2">
            <input
              id="refillable"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
              checked={form.refillable}
              onChange={(e) => updateField("refillable", e.target.checked)}
            />
            <label htmlFor="refillable" className="text-sm">
              This prescription is refillable
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block font-medium">Additional Notes</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              rows={2}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Save Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
