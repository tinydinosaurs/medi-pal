/**
 * Content Extraction Service
 *
 * Uses AI to extract structured data from unstructured text (emails, messages, etc.).
 */

import { simpleChat } from "@/lib/ai/azure-foundry";
import { APPOINTMENT_EXTRACTION_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { AppointmentFields } from "@/types";

/**
 * Extracted appointment data from AI.
 * Extends AppointmentFields with extraction confidence.
 */
export interface ExtractedAppointment extends AppointmentFields {
  confidence: "high" | "medium" | "low";
}

/**
 * Parse AI response as ExtractedAppointment JSON.
 */
function parseAppointmentResponse(rawContent: string): ExtractedAppointment {
  const fallback: ExtractedAppointment = {
    doctor: null,
    specialty: null,
    location: null,
    address: null,
    phone: null,
    date: null,
    time: null,
    reason: null,
    notes: null,
    confidence: "low",
  };

  if (!rawContent) return fallback;

  try {
    const parsed = JSON.parse(rawContent) as Partial<ExtractedAppointment>;

    return {
      doctor: parsed.doctor ?? null,
      specialty: parsed.specialty ?? null,
      location: parsed.location ?? null,
      address: parsed.address ?? null,
      phone: parsed.phone ?? null,
      date: parsed.date ?? null,
      time: parsed.time ?? null,
      reason: parsed.reason ?? null,
      notes: parsed.notes ?? null,
      confidence: parsed.confidence ?? "low",
    };
  } catch {
    return fallback;
  }
}

/**
 * Extract appointment data from unstructured text using AI.
 */
export async function extractAppointment(
  text: string,
): Promise<ExtractedAppointment> {
  const response = await simpleChat(
    APPOINTMENT_EXTRACTION_SYSTEM_PROMPT,
    text,
    {
      temperature: 0.1, // Low temperature for consistent extraction
      maxTokens: 512,
    },
  );

  return parseAppointmentResponse(response);
}
