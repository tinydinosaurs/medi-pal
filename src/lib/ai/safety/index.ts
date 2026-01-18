/**
 * Safety Module Index
 *
 * Re-exports all safety utilities for convenient importing.
 */

export {
  validateAIResponse,
  getSafeSubstitute,
  containsEmergencyKeywords,
  getEmergencyResponse,
  type ValidationResult,
} from './output-validator';

export {
  sanitizeUserInput,
  containsPII,
  sanitizeMedicationContext,
  type SanitizedMedication,
} from './input-sanitizer';

export {
  logInteraction,
  getAuditLog,
  clearAuditLog,
  getAuditStats,
  hashString,
  simpleHash,
  type AIInteractionLog,
} from './audit-log';

export {
  safeChatWithAI,
  type CaretakerContext,
  type SafeChatResult,
} from './safe-chat';
