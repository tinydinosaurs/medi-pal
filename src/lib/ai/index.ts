/**
 * AI Module Index
 *
 * Main entry point for all AI-related functionality.
 */

// Azure AI Foundry
export {
  chatWithAzureFoundry,
  simpleChat,
  getAzureConfig,
  type AzureFoundryConfig,
  type ChatMessage,
  type ChatOptions,
  type ChatResponse,
} from './azure-foundry';

// Prompts
export {
  CARETAKER_SYSTEM_PROMPT,
  SAFETY_SCENARIO_PROMPT,
  BILL_ANALYSIS_SYSTEM_PROMPT,
  CONTACT_SCRIPT_SYSTEM_PROMPT,
  DOCTOR_QUESTIONS_SYSTEM_PROMPT,
  SCAM_CHECK_SYSTEM_PROMPT,
} from './prompts';

// Safety utilities
export * from './safety';
