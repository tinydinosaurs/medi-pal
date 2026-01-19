import { Document } from "@/types";

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 1,
    type: "Lab Results",
    date: "2026-01-15",
    name: "CBC Panel",
    reviewed: false,
  },
  {
    id: 2,
    type: "Bill",
    date: "2026-01-12",
    name: "St. Mary's Hospital",
    reviewed: false,
  },
  {
    id: 3,
    type: "Appointment Summary",
    date: "2026-01-10",
    name: "Dr. Chen Visit Notes",
    reviewed: true,
  },
];
