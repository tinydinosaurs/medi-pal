/**
 * Azure AI Foundry API Wrapper
 *
 * Provides a unified interface for calling Azure AI Foundry models.
 * Uses the OpenAI-compatible API format.
 */

export interface AzureFoundryConfig {
  endpoint: string;
  apiKey: string;
  apiVersion?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
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
 * Get Azure AI Foundry configuration from environment variables.
 * Throws if required variables are missing.
 */
export function getAzureConfig(): AzureFoundryConfig {
  const endpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
  const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;

  if (!endpoint) {
    throw new Error(
      "AZURE_AI_FOUNDRY_ENDPOINT is not set. Add it to your environment variables."
    );
  }

  if (!apiKey) {
    throw new Error(
      "AZURE_AI_FOUNDRY_API_KEY is not set. Add it to your environment variables."
    );
  }

  return {
    endpoint,
    apiKey,
    apiVersion: process.env.AZURE_AI_FOUNDRY_API_VERSION,
  };
}

/**
 * Send a chat completion request to Azure AI Foundry.
 */
export async function chatWithAzureFoundry(
  messages: ChatMessage[],
  config: AzureFoundryConfig,
  options: ChatOptions = {}
): Promise<ChatResponse> {
  const { maxTokens = 1024, temperature = 0.7, topP = 1.0 } = options;

  // Build the URL with API version if provided
  let url = config.endpoint;
  if (config.apiVersion && !url.includes("api-version")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}api-version=${config.apiVersion}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.AZURE_AI_FOUNDRY_MODEL ?? "gpt-4.1-mini",
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Azure AI Foundry request failed: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const data = await response.json();

  return {
    content: data.choices?.[0]?.message?.content ?? "",
    finishReason: data.choices?.[0]?.finish_reason ?? null,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * Convenience function for simple system + user prompt calls.
 */
export async function simpleChat(
  systemPrompt: string,
  userMessage: string,
  options: ChatOptions = {}
): Promise<string> {
  const config = getAzureConfig();

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const response = await chatWithAzureFoundry(messages, config, options);
  return response.content;
}
