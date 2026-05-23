import type { BillAnalysis } from "@/types";

/** Returns the value if it's a string, otherwise null. Normalizes missing/wrong-type → null. */
function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Validate an untrusted value against the `BillAnalysis` shape.
 * Returns a fully-populated `BillAnalysis` if the input is structurally valid,
 * or `null` if required fields are missing or wrong-typed.
 *
 * Used by API routes that accept an optional pre-computed analysis from the
 * client to avoid re-running `analyzeBill` server-side.
 */
export function coerceBillAnalysis(value: unknown): BillAnalysis | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const maybe = value as Partial<BillAnalysis>;

  if (
    typeof maybe.summary !== "string" ||
    !Array.isArray(maybe.potentialIssues)
  ) {
    return null;
  }

  return {
    summary: maybe.summary,
    potentialIssues: maybe.potentialIssues.map(String),
    vendorName: nullableString(maybe.vendorName),
    statementDate: nullableString(maybe.statementDate),
    dueDate: nullableString(maybe.dueDate),
    totalAmount: nullableString(maybe.totalAmount),
    minimumDue: nullableString(maybe.minimumDue),
    billingPeriod: nullableString(maybe.billingPeriod),
    insuranceCoverage: nullableString(maybe.insuranceCoverage),
    nextSteps: Array.isArray(maybe.nextSteps)
      ? maybe.nextSteps.map(String)
      : [],
  };
}
