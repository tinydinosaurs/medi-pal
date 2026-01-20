"use client";

import { useState, useCallback } from "react";
import { useMedications } from "@/hooks/useMedications";
import AllMedsView from "@/components/medications/AllMedsView";
import MedForm from "@/components/medications/MedForm";
import { Medication } from "@/types";

export default function MedicationsContent() {
  const { medications, addMedication, updateMedication, deleteMedication } =
    useMedications();

  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleAddClick = useCallback(() => {
    setEditingMed(null);
    setShowForm(true);
  }, []);

  const handleSearchClick = useCallback(() => {
    alert(
      "🔍 Medication Search\n\nThis feature will allow you to search a database of medications to quickly add common prescriptions with pre-filled information.\n\nComing soon!"
    );
  }, []);

  const handleEdit = useCallback((med: Medication) => {
    setEditingMed(med);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(
    (med: Medication) => {
      if (confirm(`Delete "${med.name}"?\n\nThis action cannot be undone.`)) {
        deleteMedication(med.id);
      }
    },
    [deleteMedication]
  );

  const handleFormSave = useCallback(
    (med: Medication) => {
      if (editingMed) {
        updateMedication(editingMed.id, med);
      } else {
        addMedication(med);
      }
      setShowForm(false);
      setEditingMed(null);
    },
    [editingMed, addMedication, updateMedication]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingMed(null);
  }, []);

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSearchClick}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          🔍 Search Meds
        </button>
        <button
          type="button"
          onClick={handleAddClick}
          className="rounded-full bg-[#4a80f0] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#3a70e0]"
        >
          + Add New
        </button>
      </div>

      {/* Medications List */}
      <AllMedsView
        medications={medications}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit/Add Form Modal */}
      {showForm && (
        <MedForm
          key={editingMed?.id ?? "new"}
          initialMed={editingMed ?? undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </>
  );
}
