/**
 * Bill Analysis Service
 *
 * Functions for analyzing bills using Azure AI Foundry.
 * Uses the simpleChat wrapper and prompts from this module.
 */

import type { BillAnalysis } from "@/types";
import { simpleChat } from "./azure-foundry";
import {
  BILL_ANALYSIS_SYSTEM_PROMPT,
  CONTACT_SCRIPT_SYSTEM_PROMPT,
  DOCTOR_QUESTIONS_SYSTEM_PROMPT,
  SCAM_CHECK_SYSTEM_PROMPT,
} from "./prompts";

/**
 * Helper to build user message with bill text and optional analysis context.
 */
function buildBillMessage(billText: string, analysis?: BillAnalysis): string {
  const parts = ["Here is the full text of the bill:", billText];

  if (analysis) {
    parts.push(
      "",
      "Here is a structured analysis of the bill in JSON format:",
      JSON.stringify(analysis, null, 2),
    );
  }

  return parts.join("\n\n");
}

/**
 * Parse AI response as BillAnalysis JSON, with fallback handling.
 */
function parseBillAnalysisResponse(rawContent: string): BillAnalysis {
  if (!rawContent) {
    return {
      summary: "Bill analysis is unavailable. The model did not return text.",
      potentialIssues: [],
      vendorName: null,
      statementDate: null,
      dueDate: null,
      totalAmount: null,
      minimumDue: null,
      billingPeriod: null,
      insuranceCoverage: null,
      nextSteps: [],
    };
  }

  try {
    const parsed = JSON.parse(rawContent) as Partial<BillAnalysis>;

    if (
      typeof parsed.summary === "string" &&
      Array.isArray(parsed.potentialIssues)
    ) {
      return {
        summary: parsed.summary,
        potentialIssues: parsed.potentialIssues.map(String),
        vendorName: parsed.vendorName ?? null,
        statementDate: parsed.statementDate ?? null,
        dueDate: parsed.dueDate ?? null,
        totalAmount: parsed.totalAmount ?? null,
        minimumDue: parsed.minimumDue ?? null,
        billingPeriod: parsed.billingPeriod ?? null,
        insuranceCoverage: parsed.insuranceCoverage ?? null,
        nextSteps: Array.isArray(parsed.nextSteps)
          ? parsed.nextSteps.map(String)
          : [],
      };
    }
  } catch {
    // JSON parsing failed, fall through to fallback
  }

  // Fallback: treat raw content as summary
  return {
    summary: rawContent,
    potentialIssues: [],
    vendorName: null,
    statementDate: null,
    dueDate: null,
    totalAmount: null,
    minimumDue: null,
    billingPeriod: null,
    insuranceCoverage: null,
    nextSteps: [],
  };
}

/**
 * Analyze a bill and extract key details.
 */
export async function analyzeBill(billText: string): Promise<BillAnalysis> {
  const response = await simpleChat(BILL_ANALYSIS_SYSTEM_PROMPT, billText, {
    temperature: 0.2,
    maxTokens: 1024,
  });

  return parseBillAnalysisResponse(response);
}

/**
 * Generate a contact script (phone, email, letter) for disputing or questioning a bill.
 */
export async function generateContactScript(
  billText: string,
  analysis: BillAnalysis,
): Promise<string> {
  const message = buildBillMessage(billText, analysis);

  const response = await simpleChat(CONTACT_SCRIPT_SYSTEM_PROMPT, message, {
    temperature: 0.2,
    maxTokens: 1024,
  });

  return (
    response.trim() ||
    "Sorry, I could not prepare a contact script based on this bill."
  );
}

/**
 * Generate questions to ask a doctor about a medical bill.
 */
export async function generateDoctorQuestions(
  billText: string,
  analysis: BillAnalysis,
): Promise<string> {
  const message = buildBillMessage(billText, analysis);

  const response = await simpleChat(DOCTOR_QUESTIONS_SYSTEM_PROMPT, message, {
    temperature: 0.2,
    maxTokens: 1024,
  });

  return (
    response.trim() ||
    "Sorry, I could not prepare doctor questions based on this bill."
  );
}

/**
 * Check a bill for potential scam warning signs.
 */
export async function checkScam(
  billText: string,
  analysis: BillAnalysis,
): Promise<string> {
  const message = buildBillMessage(billText, analysis);

  const response = await simpleChat(SCAM_CHECK_SYSTEM_PROMPT, message, {
    temperature: 0.2,
    maxTokens: 768,
  });

  return (
    response.trim() ||
    "Sorry, I could not check this bill for scam warning signs."
  );
}
