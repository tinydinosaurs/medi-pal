/**
 * AI Output Validation
 *
 * Validates AI responses to catch potentially dangerous medical advice
 * that may slip through despite system prompts.
 */

export interface ValidationResult {
  safe: boolean;
  severity: "blocked" | "warning" | "clean";
  flags: string[];
  originalResponse: string;
}

/**
 * Patterns that should BLOCK the response entirely.
 * These indicate the AI is attempting to give medical advice.
 */
const FORBIDDEN_PATTERNS: RegExp[] = [
  // Medical advice patterns
  /you (should|must|need to) (take|stop|increase|decrease|skip)/i,
  /I (recommend|suggest|advise) (taking|stopping|changing)/i,
  /(start|stop|change) (taking|your) (medication|medicine|dose)/i,
  /take \d+ (mg|milligrams|pills|tablets)/i,

  // Diagnostic patterns
  /this (indicates|suggests|means you have|shows you have)/i,
  /you (probably|likely|might|may) have/i,
  /sounds like (you have|a case of)/i,
  /I (think|believe) you have/i,
  /you('re| are) (suffering from|experiencing)/i,

  // False reassurance patterns (also dangerous)
  /don't worry about/i,
  /nothing to worry about/i,
  /you('ll| will) be fine/i,
  /it's (probably )?nothing/i,

  // Safety claims
  /safe to (take|stop|mix|combine)/i,
  /won't (hurt|harm|affect)/i,
  /no (risk|danger|harm) in/i,
];

/**
 * Patterns that trigger a WARNING but don't block.
 * May be okay in context, but should be logged for review.
 */
const WARNING_PATTERNS: RegExp[] = [
  /normal range/i,
  /side effect/i,
  /interact/i,
  /overdose/i,
  /withdrawal/i,
];

/**
 * Validate an AI response for potentially dangerous content.
 */
export function validateAIResponse(response: string): ValidationResult {
  const blockedFlags = FORBIDDEN_PATTERNS.filter((pattern) =>
    pattern.test(response)
  ).map((pattern) => pattern.source);

  const warningFlags = WARNING_PATTERNS.filter((pattern) =>
    pattern.test(response)
  ).map((pattern) => pattern.source);

  if (blockedFlags.length > 0) {
    return {
      safe: false,
      severity: "blocked",
      flags: blockedFlags,
      originalResponse: response,
    };
  }

  if (warningFlags.length > 0) {
    return {
      safe: true, // Allow but log
      severity: "warning",
      flags: warningFlags,
      originalResponse: response,
    };
  }

  return {
    safe: true,
    severity: "clean",
    flags: [],
    originalResponse: response,
  };
}

/**
 * Get a safe substitute response when validation fails.
 */
export function getSafeSubstitute(
  _originalResponse: string,
  flags: string[]
): string {
  console.warn("[AI Safety] Response blocked:", {
    flags,
    preview: _originalResponse.slice(0, 100),
  });

  return `I want to be careful here. This sounds like something to discuss with your healthcare provider, as I'm not qualified to give medical advice.

Would you like help preparing questions for your doctor or pharmacist?`;
}

/**
 * Check if a message contains emergency keywords that need immediate handling.
 */
export function containsEmergencyKeywords(message: string): boolean {
  const emergencyPatterns = [
    /chest pain/i,
    /can't breathe/i,
    /difficulty breathing/i,
    /heart attack/i,
    /stroke/i,
    /suicide/i,
    /kill myself/i,
    /want to die/i,
    /overdose/i,
    /took too (much|many)/i,
    /bleeding (heavily|won't stop)/i,
    /unconscious/i,
    /passed out/i,
    /seizure/i,
  ];

  return emergencyPatterns.some((pattern) => pattern.test(message));
}

/**
 * Get an emergency response message.
 */
export function getEmergencyResponse(): string {
  return `🚨 This sounds like it may need immediate medical attention.

**If this is an emergency, please:**
- Call **911** immediately
- Go to your nearest emergency room
- Call Poison Control at **1-800-222-1222** if related to medication

**For mental health crisis:**
- Call or text **988** (Suicide & Crisis Lifeline)

Your health and safety come first. I'm here to help with organization tasks once you've gotten the care you need.`;
}
