"use client";

import dynamic from "next/dynamic";

const MedicationsContent = dynamic(
  () => import("@/components/medications/MedicationsContent"),
  { ssr: false }
);

export default function MedicationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">All Medications</h1>
      <MedicationsContent />
    </div>
  );
}
