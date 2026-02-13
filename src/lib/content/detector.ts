/**
 * Content Type Detector
 *
 * Identifies the type of content from file extension, MIME type, or content analysis.
 * Used to route content to the appropriate parser (deterministic for .ics, AI for text).
 */

import type { ContentType } from "@/types";

export interface DetectedContent {
  type: ContentType;
  content: string;
  fileName?: string;
  mimeType?: string;
}

/**
 * Detect content type from a File object.
 */
export async function detectFromFile(file: File): Promise<DetectedContent> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  // .ics files - calendar format
  if (extension === "ics" || file.type === "text/calendar") {
    const content = await file.text();
    return { type: "ics", content, fileName: file.name, mimeType: file.type };
  }

  // .txt files - plain text, needs AI
  if (extension === "txt" || file.type === "text/plain") {
    const content = await file.text();
    return { type: "text", content, fileName: file.name, mimeType: file.type };
  }

  // Images - future OCR support
  if (file.type.startsWith("image/")) {
    return {
      type: "image",
      content: "",
      fileName: file.name,
      mimeType: file.type,
    };
  }

  // PDF - future support
  if (file.type === "application/pdf" || extension === "pdf") {
    return {
      type: "pdf",
      content: "",
      fileName: file.name,
      mimeType: file.type,
    };
  }

  // Fallback: try to read as text
  const content = await file.text();
  return { type: "text", content, fileName: file.name, mimeType: file.type };
}

/**
 * Detect content type from pasted/typed text.
 * Analyzes content patterns to determine if it's email, calendar, or plain text.
 */
export function detectFromText(text: string): DetectedContent {
  const trimmed = text.trim();

  // Check for .ics format (starts with BEGIN:VCALENDAR or has VEVENT)
  if (
    trimmed.startsWith("BEGIN:VCALENDAR") ||
    trimmed.includes("BEGIN:VEVENT")
  ) {
    return { type: "ics", content: trimmed };
  }

  // Check for email patterns (common headers)
  const emailPatterns = [
    /^From:/im,
    /^Subject:/im,
    /^Date:.*\d{4}/im,
    /^To:/im,
  ];
  const matchedPatterns = emailPatterns.filter((p) => p.test(trimmed));
  if (matchedPatterns.length >= 2) {
    return { type: "email", content: trimmed };
  }

  // Default to plain text
  return { type: "text", content: trimmed };
}

/**
 * Check if content type requires AI extraction (vs deterministic parsing).
 */
export function requiresAiExtraction(type: ContentType): boolean {
  return type === "text" || type === "email";
}

/**
 * Check if content type is currently supported.
 */
export function isSupported(type: ContentType): boolean {
  return type === "ics" || type === "text" || type === "email";
}
