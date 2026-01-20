import React from "react";
import { Medication, FontSize } from "@/types";
import MedListCard from "./MedListCard";

// ============================================
// Types
// ============================================

interface AllMedsViewProps {
  medications: Medication[];
  onEdit: (med: Medication) => void;
  onDelete: (med: Medication) => void;
  caregiverMode?: boolean;
  fontSize?: FontSize;
}

// ============================================
// Empty State
// ============================================

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center px-4 text-center text-gray-700">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-4xl">
        💊
      </div>
      <p className="mb-1 text-lg font-semibold">No medications added yet</p>
      <p className="max-w-xs text-sm text-gray-600">
        Tap the + button to add your first medication and build your schedule.
      </p>
    </div>
  );
}

// ============================================
// Component
// ============================================

export default function AllMedsView({
  medications,
  onEdit,
  onDelete,
  // caregiverMode = false,
  fontSize = "normal",
}: AllMedsViewProps) {
  if (!medications.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 pb-20">
      {medications.map((med) => (
        <MedListCard
          key={med.id}
          med={med}
          onEdit={onEdit}
          onDelete={onDelete}
          // caregiverMode={caregiverMode}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
}
