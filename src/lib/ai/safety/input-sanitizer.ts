/**
 * Input Sanitization
 *
 * Strips potentially sensitive PII from user input before sending to AI.
 * This is a defense-in-depth measure - we don't want PII in AI logs.
 */

const PII_REPLACEMENTS = {
  ssn: "[SSN REMOVED]",
  medicare: "[MEDICARE ID REMOVED]",
  card: "[CARD NUMBER REMOVED]",
  phone: "[PHONE REMOVED]",
  email: "[EMAIL REMOVED]",
  address: "[ADDRESS REMOVED]",
} as const;

/**
 * Remove potentially sensitive information from user input.
 */
export function sanitizeUserInput(input: string): string {
  let sanitized = input;

  // Social Security Numbers (XXX-XX-XXXX or XXXXXXXXX)
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, PII_REPLACEMENTS.ssn);
  sanitized = sanitized.replace(/\b\d{9}\b/g, PII_REPLACEMENTS.ssn);

  // Medicare IDs (1 letter + 10 digits, or older format)
  sanitized = sanitized.replace(/\b[A-Z]\d{10}\b/g, PII_REPLACEMENTS.medicare);
  sanitized = sanitized.replace(
    /\b\d{3}-\d{2}-\d{4}[A-Z]\b/g,
    PII_REPLACEMENTS.medicare
  );

  // Credit card numbers (various formats)
  sanitized = sanitized.replace(
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    PII_REPLACEMENTS.card
  );
  sanitized = sanitized.replace(/\b\d{15,16}\b/g, PII_REPLACEMENTS.card);

  // Phone numbers (various formats)
  sanitized = sanitized.replace(
    /\(\d{3}\)\s*\d{3}[-.]\d{4}/g,
    PII_REPLACEMENTS.phone
  );
  sanitized = sanitized.replace(
    /\b\d{3}[-.]\d{3}[-.]\d{4}\b/g,
    PII_REPLACEMENTS.phone
  );
  sanitized = sanitized.replace(/\b\d{10}\b/g, PII_REPLACEMENTS.phone);

  // Email addresses
  sanitized = sanitized.replace(
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    PII_REPLACEMENTS.email
  );

  return sanitized;
}

/**
 * Check if input appears to contain sensitive PII.
 * Returns true if PII was detected (even if sanitized).
 */
export function containsPII(input: string): boolean {
  const piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{9}\b/, // SSN no dashes
    /\b[A-Z]\d{10}\b/, // Medicare
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
    /\(\d{3}\)\s*\d{3}[-.]\d{4}/, // Phone
    /\b\d{3}[-.]\d{3}[-.]\d{4}\b/, // Phone
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
  ];

  return piiPatterns.some((pattern) => pattern.test(input));
}

/**
 * Medication context with PII stripped.
 */
export interface SanitizedMedication {
  name: string;
  dose: string;
  frequency?: string;
  // Doctor name and notes are stripped for privacy
}

/**
 * Strip PII from medication context before sending to AI.
 */
export function sanitizeMedicationContext(
  medications: Array<{
    name: string;
    dose: string;
    frequency?: string;
    doctor?: string;
    notes?: string;
  }>
): SanitizedMedication[] {
  return medications.map((med) => ({
    name: med.name,
    dose: med.dose,
    frequency: med.frequency,
    // Intentionally omit doctor and notes
  }));
}
