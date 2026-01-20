import { Appointment } from "@/types";

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    doctor: "Dr. Chen",
    specialty: "Cardiology",
    date: "2026-01-20",
    time: "2:00 PM",
    prepared: false,
    notes: "Bring recent blood pressure readings",
  },
  {
    id: 2,
    doctor: "Dr. Patel",
    specialty: "Primary Care",
    date: "2026-01-22",
    time: "10:30 AM",
    prepared: false,
    notes: "Annual checkup",
  },
  {
    id: 3,
    doctor: "Dr. Morrison",
    specialty: "Endocrinology",
    date: "2026-01-27",
    time: "3:15 PM",
    prepared: false,
    notes: "Review thyroid levels",
  },
];
