// Alert type for dashboard notifications
export interface Alert {
  id: number;
  type: "refill" | "appointment" | "document" | "general";
  title: string;
  message: string;
}

export const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    type: "refill",
    title: "Prescription Refill Due",
    message: "Lisinopril refill needed in 3 days",
  },
  {
    id: 2,
    type: "appointment",
    title: "Appointment Prep",
    message: "Dr. Chen visit on Monday - prep checklist available",
  },
];
