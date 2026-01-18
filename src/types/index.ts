// ============================================
// Medications
// ============================================

export type Priority = "critical" | "important" | "routine";
export type Frequency =
  | "daily"
  | "every-other-day"
  | "specific-days"
  | "custom";
export type FontSize = "normal" | "large" | "extra";

export interface Medication {
  id: number;
  name: string;
  dose: string;
  priority: Priority;
  frequency: Frequency;
  daysOfWeek?: string[]; // ['Mon', 'Tue', 'Wed']
  customFrequency?: string;
  times: string[]; // ['08:00', '20:00']
  instructions?: string; // "Take with food"
  purpose?: string;
  doctor?: string;
  pillsRemaining?: number;
  refillable?: boolean;
  notes?: string;
}

export interface DoseRecord {
  date: string; // '2026-01-16'
  medId: number;
  scheduledTime: string; // '08:00'
  takenAt: string; // ISO timestamp
}

export interface ScheduleEntry {
  med: Medication;
  scheduledTime: string;
}

export type GroupedHistory = [string, DoseRecord[]][];

// ============================================
// Appointments
// ============================================

export interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string; // ISO date
  time: string;
  prepared: boolean;
  notes?: string;
}

// ============================================
// Documents & Bills
// ============================================

export interface Document {
  id: number;
  type: string;
  date: string;
  name: string;
  reviewed: boolean;
}

export interface BillAnalysis {
  summary: string;
  potentialIssues: string[];
  vendorName: string | null;
  statementDate: string | null;
  dueDate: string | null;
  totalAmount: string | null;
  minimumDue: string | null;
  billingPeriod: string | null;
}

export type BillStatus = "paid" | "waiting" | "need-to-call";

export interface BillHistoryItem {
  id: string;
  date: string;
  vendorName: string | null;
  totalAmount: string | null;
  summary: string;
  status: BillStatus;
  notes?: string;
}

// ============================================
// Chat
// ============================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ============================================
// Family / Caregiver
// ============================================

export interface FamilyActivity {
  id: number;
  member: string;
  action: string;
  time: string;
}
