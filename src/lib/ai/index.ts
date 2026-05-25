/**
 * AI Module Index
 *
 * Provider-agnostic entry point for all AI-related functionality. Call sites
 * import from here — never from a specific provider file under `./providers/`.
 *
 * The active provider is selected at runtime by the `AI_PROVIDER` env var:
 *   - "azure-foundry" (default) — Azure AI Foundry chat completions
 *   - "anthropic"               — Anthropic Claude messages API
 *   - "openai-compatible"       — any OpenAI chat-completions wire-format backend
 *                                 (OpenAI, OpenRouter, Groq, Together, Fireworks,
 *                                  Ollama, LM Studio, vLLM, ...)
 *   - "mock"                    — fixture-based responses for dev/tests
 *
 * Provider env vars (only the selected provider's are required):
 *   azure-foundry:     AZURE_AI_FOUNDRY_ENDPOINT, AZURE_AI_FOUNDRY_API_KEY,
 *                      AZURE_AI_FOUNDRY_API_VERSION?, AZURE_AI_FOUNDRY_MODEL?
 *   anthropic:         ANTHROPIC_API_KEY, ANTHROPIC_MODEL?
 *   openai-compatible: OPENAI_COMPATIBLE_BASE_URL, OPENAI_COMPATIBLE_API_KEY,
 *                      OPENAI_COMPATIBLE_MODEL
 *   mock:              (none) — reads src/data/fixtures/ai-responses/<routeKey>.txt
 */

import { azureFoundryProvider } from "./providers/azure-foundry";
import { anthropicProvider } from "./providers/anthropic";
import { openAiCompatibleProvider } from "./providers/openai-compatible";
import { mockProvider } from "./providers/mock";
import type {
  ChatMessage,
  ChatOptions,
  ChatProvider,
  ChatResponse,
} from "./provider";

export type { ChatMessage, ChatOptions, ChatResponse, ChatProvider };

export type AiProviderName =
  | "azure-foundry"
  | "anthropic"
  | "openai-compatible"
  | "mock";

const PROVIDERS: Record<AiProviderName, ChatProvider> = {
  "azure-foundry": azureFoundryProvider,
  anthropic: anthropicProvider,
  "openai-compatible": openAiCompatibleProvider,
  mock: mockProvider,
};

const DEFAULT_PROVIDER: AiProviderName = "azure-foundry";

function resolveProviderName(): AiProviderName {
  const raw = process.env.AI_PROVIDER?.trim();
  if (!raw) return DEFAULT_PROVIDER;
  if (raw in PROVIDERS) return raw as AiProviderName;
  throw new Error(
    `Unknown AI_PROVIDER "${raw}". Expected one of: ${Object.keys(PROVIDERS).join(", ")}.`,
  );
}

/**
 * Get the active ChatProvider. Resolved lazily on every call so tests and
 * dev workflows that mutate `process.env` mid-run behave predictably.
 */
export function getActiveProvider(): ChatProvider {
  return PROVIDERS[resolveProviderName()];
}

/**
 * Low-level: send a multi-message conversation to the active provider.
 * Prefer `simpleChat` for one-shot system+user calls.
 */
export function chatWithProvider(
  messages: ChatMessage[],
  options?: ChatOptions,
): Promise<ChatResponse> {
  return getActiveProvider().chat(messages, options);
}

/**
 * Convenience: one-shot system + user prompt, returns just the response text.
 * Pass `options.routeKey` so the mock provider can route deterministically.
 */
export async function simpleChat(
  systemPrompt: string,
  userMessage: string,
  options: ChatOptions = {},
): Promise<string> {
  const response = await chatWithProvider(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    options,
  );
  return response.content;
}

// Prompts
export {
  CARETAKER_SYSTEM_PROMPT,
  SAFETY_SCENARIO_PROMPT,
  BILL_ANALYSIS_SYSTEM_PROMPT,
  CONTACT_SCRIPT_SYSTEM_PROMPT,
  DOCTOR_QUESTIONS_SYSTEM_PROMPT,
  SCAM_CHECK_SYSTEM_PROMPT,
} from "./prompts";

// Safety utilities
export * from "./safety";

// Bill Analysis
export {
  analyzeBill,
  generateContactScript,
  generateDoctorQuestions,
  checkScam,
} from "./bill-analysis";
