/**
 * Azure AI Foundry Provider
 *
 * Implements the ChatProvider interface against Azure AI Foundry's
 * OpenAI-compatible chat completions endpoint via fetch. No vendor SDK.
 */

import type {
  ChatMessage,
  ChatOptions,
  ChatProvider,
  ChatResponse,
} from "../provider";

interface AzureFoundryConfig {
  endpoint: string;
  apiKey: string;
  apiVersion?: string;
  model: string;
}

function getAzureConfig(): AzureFoundryConfig {
  const endpoint = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
  const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;

  if (!endpoint) {
    throw new Error(
      "AZURE_AI_FOUNDRY_ENDPOINT is not set. Add it to your environment variables.",
    );
  }
  if (!apiKey) {
    throw new Error(
      "AZURE_AI_FOUNDRY_API_KEY is not set. Add it to your environment variables.",
    );
  }

  return {
    endpoint,
    apiKey,
    apiVersion: process.env.AZURE_AI_FOUNDRY_API_VERSION,
    model: process.env.AZURE_AI_FOUNDRY_MODEL ?? "gpt-4.1-mini",
  };
}

export const azureFoundryProvider: ChatProvider = {
  name: "azure-foundry",

  async chat(
    messages: ChatMessage[],
    options: ChatOptions = {},
  ): Promise<ChatResponse> {
    const { maxTokens = 1024, temperature = 0.7, topP = 1.0 } = options;
    const config = getAzureConfig();

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
        model: config.model,
        messages,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Azure AI Foundry request failed: ${response.status} ${response.statusText}\n${errorText}`,
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
  },
};
