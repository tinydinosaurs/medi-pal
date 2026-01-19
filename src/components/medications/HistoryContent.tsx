"use client";

import { useMedications } from "@/hooks/useMedications";
import { useDoseLog } from "@/hooks/useDoseLog";
import HistoryView from "@/components/medications/HistoryView";

export default function HistoryContent() {
  const { medications } = useMedications();
  const { doseLog } = useDoseLog();

  return <HistoryView medications={medications} takenLog={doseLog} />;
}
