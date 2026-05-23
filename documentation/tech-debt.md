# Caretaker App Tech Debt

## General / Shared

Debt related to parts of the app not specific to a particular area

- Add ability to include profiles for multiple family members, in case caretaker is managing multiple family members
- Conversation mode - ability to talk to agent about any parts of the app
- Accessibility audit for elderly users (font sizes, contrast, touch targets)
- Push notifications / reminders (requires service worker or native wrapper)
- Offline support / PWA enhancements
- Refactor for mobile device support

## Medications

Medication section tech debt

- Identify common notes (take with water, food, before bed, etc) and make selection option for them separate from notes field. Render details in UI with icon cards for clear UI
- Change color of medications progress indicator
- Dose amount should have formatting or be a dropdown for numbers and units
- How to handle custom frequency in today view? Calendar selector with ability to select multiple days?
- Refill tracking and low-supply warnings
- Medication interaction checker (AI-powered)
- Import medications from pharmacy / insurance portal

## Architecture / AI Strategy

Future direction for skills, MCP, and agent capabilities

### AI Provider Abstraction (near-term)

> **Status:** Currently blocking local development. Azure AI Foundry credentials may no longer be active; until an Anthropic provider is wired in, no AI feature (bill analysis, contact scripts, doctor questions, scam check, appointment extraction) can be exercised locally.

The app is **designed** to be LLM-provider-agnostic but is **currently locked to Azure AI Foundry** at the implementation layer. Call-sites already go through `simpleChat(systemPrompt, userMessage, options)` from `src/lib/ai`, so the abstraction seam exists — but the function lives in `src/lib/ai/azure-foundry.ts` and unconditionally calls Azure.

**Why this matters now:** local development and testing should be able to switch between Azure AI Foundry and Anthropic Claude (and eventually others) without code changes — only env-var changes.

**Refactor steps:**

1. Extract the abstract interface (`ChatMessage`, `ChatOptions`, `ChatResponse`, `simpleChat`) into a provider-neutral file — e.g. `src/lib/ai/provider.ts` or `src/lib/ai/types.ts`.
2. Move the Azure implementation into `src/lib/ai/providers/azure-foundry.ts` exporting a `simpleChat`-shaped function.
3. Add `src/lib/ai/providers/anthropic.ts` with the same signature, calling Anthropic's Messages API (no SDK required — `fetch` is fine, matching the Azure wrapper's style).
4. Add a selector in `src/lib/ai/index.ts` that picks the provider implementation based on `process.env.AI_PROVIDER` (`"azure-foundry"` default, `"anthropic"` alternate). The selector should validate the corresponding provider's env vars are present and throw a clear error if not.
5. Rename `chatWithAzureFoundry` exports to a neutral name (e.g. `chatWithProvider`) or keep both as aliases during transition.
6. Update API routes and `extractAppointment()` if they import anything provider-specific (today they only import `simpleChat` and `analyzeBill`/etc., so no changes expected).

**Env var shape (target):**

```bash
AI_PROVIDER=anthropic            # or "azure-foundry" (default)

# Azure AI Foundry (loaded only when AI_PROVIDER=azure-foundry)
AZURE_AI_FOUNDRY_ENDPOINT=...
AZURE_AI_FOUNDRY_API_KEY=...
AZURE_AI_FOUNDRY_API_VERSION=...
AZURE_AI_FOUNDRY_MODEL=gpt-4.1-mini

# Anthropic (loaded only when AI_PROVIDER=anthropic)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

**Acceptance criteria:**

- All API routes work identically under both providers
- Switching providers requires only an env-var change + server restart, never a code change
- Missing/malformed provider config produces a clear error at startup or first call, not a cryptic 500
- The safety layer in `src/lib/ai/safety/` continues to wrap calls regardless of provider

### Current State (broader AI strategy)

- Domain prompts in `prompts.ts` act as proto-skills (bill analysis, contact script, etc.)
- Storage abstraction in `lib/storage.ts` ready for IndexedDB migration
- Each prompt has safety constraints baked in

### Recommended Evolution

**Phase 1 (current):** Continue building with current prompt structure. Each domain prompt IS a skill.

**Phase 2:** Formalize skills with consistent interface:

```typescript
interface Skill {
  id: string;
  name: string;
  systemPrompt: string;
  safetyConstraints: string[];
  requiredContext?: string[]; // e.g., ["medications", "appointments"]
  tools?: string[]; // MCP tools this skill can invoke
}
```

**Phase 3:** Add MCP server for external integrations:

- `calendar/list`, `calendar/add` - Sync with user's calendar app
- `meddb/lookup`, `meddb/interactions` - Medication database API
- `speech/synthesize`, `speech/transcribe` - Voice input/output

**Phase 4:** Voice agent orchestration:

1. Transcribe speech → text
2. Route to appropriate skill(s) based on intent
3. Skill reasons + calls MCP tools as needed
4. Response → speech synthesis

### Feature-to-Approach Mapping

| Feature                      | Approach                                         |
| ---------------------------- | ------------------------------------------------ |
| Voice listen/speak           | MCP tool (speech services)                       |
| Medication reminders         | Skill (gentle language) + MCP (notification API) |
| Doctor notes explanation     | Skill (safety-bounded, plain language)           |
| Med database lookup          | MCP tool (API call)                              |
| Med documentation extraction | Skill (summarize) + MCP (fetch PDF/data)         |
| Calendar sync                | MCP tool (read/write calendar API)               |

### Why This Architecture

- **Safety isolation** - Each skill has explicit constraints
- **Testability** - Test skills independently with fixture inputs
- **Auditability** - Clear boundaries for "what can this skill do?"
- **Composability** - Skills can call MCP tools as needed
- **Incremental** - No big bang refactor, evolve as features demand

## Bills

Bill analysis section tech debt

- Loading spinner during initial bill analysis (currently no visual feedback while analyzing)
- Add "amount covered by insurance" field to analysis output
- Visual severity indicator for issues (color-coded by importance)
- Photo upload - snap a picture of a paper bill instead of typing/pasting text
- Voice dictation - speak bill details for hands-free input
- Export/share - save analysis as PDF or share with family member
- Bulk bill management - handle multiple bills in a single session
- Recurring bill detection - identify and track bills that come regularly
- Insurance EOB integration - link bills to Explanation of Benefits documents
- Bill dispute letter generation - auto-generate formal dispute letters
