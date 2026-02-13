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

/**
 * Shared appointment fields used by forms, extraction, and display.
 * All fields nullable to support partial data during input/extraction.
 */
export interface AppointmentFields {
  title?: string | null; // Optional title field for user-defined appointment names
  doctor: string | null;
  specialty: string | null;
  location: string | null;
  address: string | null;
  phone: string | null;
  date: string | null;
  time: string | null;
  reason: string | null;
  notes: string | null;
}

/**
 * Full appointment record with ID and status.
 */
export interface Appointment extends AppointmentFields {
  id: number;
  prepared: boolean;
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

export interface BillSubNavItem {
  id: string;
  label: string;
  icon: string;
  requiresAnalysis?: boolean;
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
  insuranceCoverage: string | null;
  nextSteps: string[];
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
  billText: string;
  analysis: BillAnalysis;
  contactScript?: string;
  doctorQuestions?: string;
  scamCheck?: string;
}

export type TabId = "script" | "questions" | "scam";

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

// ============================================
// Shared Types
// ============================================

export type ContentType =
  | "ics" // Calendar file - parse deterministically
  | "text" // Plain text - needs AI extraction
  | "email" // Email content - needs AI extraction
  | "image" // Image file - needs OCR + AI (future)
  | "pdf" // PDF file - needs extraction + AI (future)
  | "unknown";
