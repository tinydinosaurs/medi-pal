/**
 * Safe Chat
 *
 * The main entry point for AI chat interactions.
 * Combines all safety layers: sanitization, prompts, validation, and logging.
 */

import { chatWithProvider, type ChatOptions } from '..';
import { CARETAKER_SYSTEM_PROMPT, SAFETY_SCENARIO_PROMPT } from '../prompts';
import {
	validateAIResponse,
	getSafeSubstitute,
	containsEmergencyKeywords,
	getEmergencyResponse,
} from './output-validator';
import {
	sanitizeUserInput,
	sanitizeMedicationContext,
} from './input-sanitizer';
import { logInteraction, simpleHash } from './audit-log';

/**
 * Context that can be provided to the AI for more relevant responses.
 */
export interface CaretakerContext {
	medications?: Array<{
		name: string;
		dose: string;
		frequency?: string;
		doctor?: string;
		notes?: string;
	}>;
	recentBillSummary?: string;
	userName?: string; // Will be stripped, only used for greeting
}

export interface SafeChatResult {
	response: string;
	wasSubstituted: boolean;
	hadEmergency: boolean;
}

/**
 * Send a message to the AI with full safety wrapping.
 *
 * This function:
 * 1. Checks for emergency keywords (responds immediately if found)
 * 2. Sanitizes user input to remove PII
 * 3. Builds a context-aware system prompt
 * 4. Calls the active AI provider (selected by AI_PROVIDER env var)
 * 5. Validates the response for dangerous content
 * 6. Logs the interaction for debugging
 * 7. Substitutes a safe response if validation fails
 */
export async function safeChatWithAI(
	userMessage: string,
	context?: CaretakerContext,
	options?: ChatOptions,
): Promise<SafeChatResult> {
	// 1. Check for emergency keywords first
	if (containsEmergencyKeywords(userMessage)) {
		return {
			response: getEmergencyResponse(),
			wasSubstituted: false,
			hadEmergency: true,
		};
	}

	// 2. Sanitize user input
	const sanitizedMessage = sanitizeUserInput(userMessage);

	// 3. Build full system prompt with context
	const systemPromptParts = [CARETAKER_SYSTEM_PROMPT, SAFETY_SCENARIO_PROMPT];

	if (context?.medications && context.medications.length > 0) {
		const safeMeds = sanitizeMedicationContext(context.medications);
		systemPromptParts.push(
			`\nThe user's current medications (for context only, not for medical advice):\n${JSON.stringify(
				safeMeds,
				null,
				2,
			)}`,
		);
	}

	const fullSystemPrompt = systemPromptParts.join('\n');

	// 4. Call the active AI provider
	let rawResponse: string;
	try {
		const result = await chatWithProvider(
			[
				{ role: 'system', content: fullSystemPrompt },
				{ role: 'user', content: sanitizedMessage },
			],
			{ ...options, routeKey: options?.routeKey ?? 'safe-chat' },
		);
		rawResponse = result.content;
	} catch (error) {
		console.error('[SafeChat] AI call failed:', error);
		return {
			response:
				"I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
			wasSubstituted: true,
			hadEmergency: false,
		};
	}

	// 5. Validate the response
	const validation = validateAIResponse(rawResponse);

	// 6. Log the interaction
	logInteraction({
		timestamp: new Date().toISOString(),
		userMessageHash: simpleHash(sanitizedMessage),
		responsePreview: rawResponse.slice(0, 100),
		safetyFlags: validation.flags,
		severity: validation.severity,
		wasSubstituted: !validation.safe,
	});

	// 7. Return safe response
	if (!validation.safe) {
		return {
			response: getSafeSubstitute(rawResponse, validation.flags),
			wasSubstituted: true,
			hadEmergency: false,
		};
	}

	return {
		response: rawResponse,
		wasSubstituted: false,
		hadEmergency: false,
	};
}
