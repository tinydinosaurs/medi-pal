"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { TodaysSummaryBar } from "@/components/medications";

const MedicationsContent = dynamic(
  () => import("@/components/medications/MedicationsContent"),
  { ssr: false },
);

export default function MedicationsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleSearchClick = useCallback(() => {
    alert(
      "🔍 Medication Search\n\nThis feature will allow you to search a database of medications to quickly add common prescriptions with pre-filled information.\n\nComing soon!",
    );
  }, []);

  const handleAddClick = useCallback(() => {
    setShowForm(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Medications</h1>
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
      </div>

      {/* Today's Medications (Collapsible) */}
      <TodaysSummaryBar />

      {/* All Medications List */}
      <MedicationsContent
        showFormExternal={showForm}
        onFormClose={() => setShowForm(false)}
      />
    </div>
  );
}
