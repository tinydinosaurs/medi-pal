"use client";

import { useState, useCallback, useEffect } from "react";
import { useMedications } from "@/hooks/useMedications";
import AllMedsView from "@/components/medications/AllMedsView";
import MedForm from "@/components/medications/MedForm";
import { Medication } from "@/types";

interface MedicationsContentProps {
  /** External trigger to show the add form */
  showFormExternal?: boolean;
  /** Callback when form is closed */
  onFormClose?: () => void;
}

export default function MedicationsContent({
  showFormExternal = false,
  onFormClose,
}: MedicationsContentProps) {
  const { medications, addMedication, updateMedication, deleteMedication } =
    useMedications();

  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Sync with external form trigger
  useEffect(() => {
    if (showFormExternal) {
      setEditingMed(null);
      setShowForm(true);
    }
  }, [showFormExternal]);

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
    [deleteMedication],
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
      onFormClose?.();
    },
    [editingMed, addMedication, updateMedication, onFormClose],
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingMed(null);
    onFormClose?.();
  }, [onFormClose]);

  return (
    <>
      {/* Section Header */}
      <h2 className="font-semibold text-slate-900 text-2xl">All Medications</h2>

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
