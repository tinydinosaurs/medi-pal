/**
 * AI Provider Interface
 *
 * Neutral, provider-agnostic types and contract shared by every AI backend
 * (Azure AI Foundry, Anthropic, Mock, ...). Call sites depend on this module
 * — never on a specific provider's wrapper.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  /**
   * Stable identifier for the call site (e.g. "bill-analysis",
   * "appointment-extraction"). Live providers ignore this; the mock provider
   * uses it to look up a fixture response. Always pass it for new code so the
   * mock provider can route deterministically.
   */
  routeKey?: string;
}

export interface ChatResponse {
  content: string;
  finishReason: string | null;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Every provider implements this contract. The selector in `./index.ts`
 * picks one at runtime based on the `AI_PROVIDER` env var.
 */
export interface ChatProvider {
  readonly name: string;
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
}
