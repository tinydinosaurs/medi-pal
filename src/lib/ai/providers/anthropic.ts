/**
 * Anthropic Claude Provider
 *
 * Implements the ChatProvider interface against Anthropic's Messages API
 * via fetch. No vendor SDK.
 *
 * Anthropic's API differs from OpenAI-style in two ways we normalize here:
 *   - The system prompt is a top-level field, not a message with role:"system".
 *   - Token usage is reported as `input_tokens` / `output_tokens`.
 *
 * Docs: https://docs.anthropic.com/en/api/messages
 */

import type {
  ChatMessage,
  ChatOptions,
  ChatProvider,
  ChatResponse,
} from "../provider";

const DEFAULT_MODEL = "claude-3-5-haiku-latest";
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface AnthropicConfig {
  apiKey: string;
  model: string;
}

function getAnthropicConfig(): AnthropicConfig {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment variables.",
    );
  }
  return {
    apiKey,
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
  };
}

/**
 * Split out system messages (Anthropic puts them in a top-level field)
 * and collapse them into a single string if there are several.
 */
function splitSystemMessages(messages: ChatMessage[]): {
  system: string | undefined;
  conversation: { role: "user" | "assistant"; content: string }[];
} {
  const systemParts: string[] = [];
  const conversation: { role: "user" | "assistant"; content: string }[] = [];

  for (const message of messages) {
    if (message.role === "system") {
      systemParts.push(message.content);
    } else {
      conversation.push({ role: message.role, content: message.content });
    }
  }

  return {
    system: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    conversation,
  };
}

export const anthropicProvider: ChatProvider = {
  name: "anthropic",

  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {},
  ): Promise<ChatResponse> {
    const { maxTokens = 1024, temperature = 0.7, topP = 1.0 } = options;
    const config = getAnthropicConfig();
    const { system, conversation } = splitSystemMessages(messages);

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        system,
        messages: conversation,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Anthropic request failed: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    const data = await response.json();

    // Anthropic returns `content: [{ type: "text", text: "..." }, ...]`.
    // We join any text blocks; non-text blocks are ignored for now.
    const content = Array.isArray(data.content)
      ? data.content
          .filter(
            (block: { type?: string }) =>
              block && typeof block === "object" && block.type === "text",
          )
          .map((block: { text?: string }) => block.text ?? "")
          .join("")
      : "";

    return {
      content,
      finishReason: data.stop_reason ?? null,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens ?? 0,
            completionTokens: data.usage.output_tokens ?? 0,
            totalTokens:
              (data.usage.input_tokens ?? 0) +
              (data.usage.output_tokens ?? 0),
          }
        : undefined,
    };
  },
};
