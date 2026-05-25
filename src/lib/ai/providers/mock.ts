/**
 * Mock AI Provider
 *
 * Returns canned responses loaded from `src/data/fixtures/ai-responses/`.
 * Dispatch is keyed by `ChatOptions.routeKey` — never by sniffing the
 * system prompt, since prompts change but route keys are stable.
 *
 * Use this provider for:
 *   - Local development without burning real API credits
 *   - Demos that should not depend on network
 *   - Vitest integration tests that need deterministic AI output
 *
 * Enable by setting `AI_PROVIDER=mock` in `.env.local`.
 *
 * To add a new fixture:
 *   1. Pick a stable route key (e.g. "bill-analysis").
 *   2. Drop a `<routeKey>.txt` file in `src/data/fixtures/ai-responses/`.
 *   3. Ensure the call site passes `{ routeKey: "<routeKey>" }` in ChatOptions.
 *
 * For JSON-returning routes (bill-analysis, appointment-extraction), the
 * fixture file must contain valid JSON as a string — the consuming code
 * will parse it just like a live response.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  ChatMessage,
  ChatOptions,
  ChatProvider,
  ChatResponse,
} from "../provider";

const FIXTURES_DIR = path.join(
  process.cwd(),
  "src",
  "data",
  "fixtures",
  "ai-responses",
);

async function loadFixture(routeKey: string): Promise<string | null> {
  const filePath = path.join(FIXTURES_DIR, `${routeKey}.txt`);
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export const mockProvider: ChatProvider = {
  name: "mock",

  async chat(
    _messages: ChatMessage[],
    options: ChatOptions = {},
  ): Promise<ChatResponse> {
    const { routeKey } = options;

    if (!routeKey) {
      throw new Error(
        "Mock AI provider requires `routeKey` in ChatOptions. Pass a stable identifier (e.g. \"bill-analysis\") so the mock can return a deterministic fixture.",
      );
    }

    const fixture = await loadFixture(routeKey);
    if (fixture === null) {
      throw new Error(
        `Mock AI provider: no fixture found for routeKey "${routeKey}". Add src/data/fixtures/ai-responses/${routeKey}.txt`,
      );
    }

    return {
      content: fixture,
      finishReason: "stop",
    };
  },
};
