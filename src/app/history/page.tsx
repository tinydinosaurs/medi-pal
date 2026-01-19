"use client";

import dynamic from "next/dynamic";

const HistoryContent = dynamic(
  () => import("@/components/medications/HistoryContent"),
  { ssr: false }
);

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Dose History</h1>
      <HistoryContent />
    </div>
  );
}
