/**
 * OpenAI-Compatible Provider
 *
 * One provider for every backend that speaks OpenAI's chat-completions wire
 * format. That includes:
 *   - OpenAI (ChatGPT API)            base URL: https://api.openai.com/v1
 *   - OpenRouter                       https://openrouter.ai/api/v1
 *   - Groq                             https://api.groq.com/openai/v1
 *   - Together                         https://api.together.xyz/v1
 *   - Fireworks                        https://api.fireworks.ai/inference/v1
 *   - Ollama (local)                   http://localhost:11434/v1
 *   - LM Studio (local)                http://localhost:1234/v1
 *   - vLLM, llama.cpp server, etc.
 *
 * Configure via env vars:
 *   OPENAI_COMPATIBLE_BASE_URL   required — base URL ending at /v1 (no /chat/completions)
 *   OPENAI_COMPATIBLE_API_KEY    required for hosted services; pass any non-empty
 *                                string for local runners that ignore auth (e.g. "ollama")
 *   OPENAI_COMPATIBLE_MODEL      required — model name as the backend expects it
 *                                (e.g. "gpt-4o-mini", "llama3.1:8b", "claude-3.5-sonnet")
 *
 * Note: Azure AI Foundry has its own provider (`azure-foundry`) because its
 * endpoint shape differs (deployment-specific URL + ?api-version=). Use that
 * provider for Azure, this one for everyone else OpenAI-compatible.
 */

import type {
	ChatMessage,
	ChatOptions,
	ChatProvider,
	ChatResponse,
} from '../provider';

interface OpenAiCompatibleConfig {
	baseUrl: string;
	apiKey: string;
	model: string;
}

function getOpenAiCompatibleConfig(): OpenAiCompatibleConfig {
	const baseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL;
	const apiKey = process.env.OPENAI_COMPATIBLE_API_KEY;
	const model = process.env.OPENAI_COMPATIBLE_MODEL;

	if (!baseUrl) {
		throw new Error(
			'OPENAI_COMPATIBLE_BASE_URL is not set. Example: https://api.openai.com/v1',
		);
	}
	if (!apiKey) {
		throw new Error(
			'OPENAI_COMPATIBLE_API_KEY is not set. For local runners that ignore auth (Ollama, LM Studio), set any non-empty value.',
		);
	}
	if (!model) {
		throw new Error(
			'OPENAI_COMPATIBLE_MODEL is not set. Example: gpt-4o-mini, llama3.1:8b',
		);
	}

	// Strip trailing slash so we can append /chat/completions cleanly.
	return {
		baseUrl: baseUrl.replace(/\/+$/, ''),
		apiKey,
		model,
	};
}

export const openAiCompatibleProvider: ChatProvider = {
	name: 'openai-compatible',

	async chat(
		messages: ChatMessage[],
		options: ChatOptions = {},
	): Promise<ChatResponse> {
		const { maxTokens = 1024, temperature = 0.7, topP = 1.0 } = options;
		const config = getOpenAiCompatibleConfig();

		const response = await fetch(`${config.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
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
				`OpenAI-compatible request to ${config.baseUrl} failed: ${response.status} ${response.statusText}\n${errorText}`,
			);
		}

		const data = await response.json();

		return {
			content: data.choices?.[0]?.message?.content ?? '',
			finishReason: data.choices?.[0]?.finish_reason ?? null,
			usage: data.usage
				? {
						promptTokens: data.usage.prompt_tokens ?? 0,
						completionTokens: data.usage.completion_tokens ?? 0,
						totalTokens: data.usage.total_tokens ?? 0,
					}
				: undefined,
		};
	},
};
