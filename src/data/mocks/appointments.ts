import { Appointment } from "@/types";

/**
 * Build a fresh set of mock appointments anchored to `referenceDate`.
 *
 * Used as a factory (not a static array) so the local-dev seed always
 * shows a sensible mix of past and upcoming entries without manual
 * date bumping. Tests should call this with a fixed reference date
 * for deterministic output.
 */
export function buildMockAppointments(
  referenceDate: Date = new Date(),
): Appointment[] {
  // YYYY-MM-DD in the runtime's local timezone (matches AppointmentFields.date).
  const toDateKey = (offsetDays: number): string => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return [
    {
      id: 1,
      title: "Annual physical",
      doctor: "Dr. Patel",
      specialty: "Primary Care",
      location: "Riverside Family Practice",
      address: "456 Oak Street",
      phone: "(555) 234-5678",
      date: toDateKey(-12), // ~2 weeks ago
      time: "10:30",
      reason: "Annual checkup",
      notes: null,
      prepared: true,
    },
    {
      id: 2,
      title: "Heart checkup",
      doctor: "Dr. Chen",
      specialty: "Cardiology",
      location: "Memorial Hospital",
      address: "123 Medical Center Dr, Suite 400",
      phone: "(555) 123-4567",
      date: toDateKey(1), // Tomorrow
      time: "14:00",
      reason: "Follow-up on blood pressure medication",
      notes: "Bring recent blood pressure readings",
      prepared: false,
    },
    {
      id: 3,
      title: null,
      doctor: "Dr. Morrison",
      specialty: "Endocrinology",
      location: "Memorial Hospital",
      address: "123 Medical Center Dr, Suite 200",
      phone: "(555) 345-6789",
      date: toDateKey(45), // ~6 weeks out
      time: "15:15",
      reason: "Review thyroid levels",
      notes: "Fasting required - no food after midnight",
      prepared: false,
    },
  ];
}

/**
 * Default snapshot, anchored to module-load time. Used for local-dev
 * seeding via `useAppointments`. For tests, call `buildMockAppointments`
 * directly with a fixed `referenceDate`.
 */
export const MOCK_APPOINTMENTS: Appointment[] = buildMockAppointments();

