# MediPal — Agent & Developer Guide

## What This Is

MediPal is a web app for the sandwich generation: adults managing medical care for aging parents while raising their own families. The app reduces caregiver cognitive load by organizing medications, demystifying medical bills, and managing appointments — without replacing doctors or compromising privacy.

MediPal does not leave the recipients of care out of the equation.

**Two audiences, one app.** MediPal is designed for both the caregiver *and* their care partner (the aging parent). A care partner who is physically and cognitively capable can use the app directly to manage their own medications, get dose reminders, and see upcoming appointments — the caregiver acts as a safety net rather than a sole operator. This dual-audience design has real UI consequences:

- The app must accommodate elderly users: larger and adjustable font sizes (`FontSize` type: `"normal" | "large" | "extra"`), generous tap targets, high-contrast text, and plain language over jargon.
- Flows should not assume the caregiver is the one looking at the screen. Copy, empty states, and confirmation messages should make sense to either audience.
- Features that exist primarily for the caregiver (bill analysis, scam check, contact scripts) and features that exist primarily for the care partner (today's doses, upcoming appointments) coexist in the same navigation. Neither audience should feel like an afterthought.

When in doubt about UI decisions, default to the more accessible option — it serves the care partner without harming the caregiver.

**The core tension the app navigates:** Caregivers and care partners desperately need help making sense of medical information, but AI giving medical advice is dangerous. Every AI feature in this app is scoped to *organization and interpretation*, never diagnosis or treatment. This is not a rule to be loosened.

**Current status:** All three POC sections (medications, bills, appointments) work end-to-end in the browser. AI provider abstraction has landed — the app now supports Azure AI Foundry, Anthropic Claude, and a fixture-based mock provider, selected at runtime by `AI_PROVIDER`. See [ROADMAP.md](ROADMAP.md) for what's next.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) — see [ROADMAP.md](ROADMAP.md) for post-MVP migration to a shared design system |
| AI | Pluggable provider behind a `simpleChat` abstraction. Selected at runtime by `AI_PROVIDER` env var (`azure-foundry` \| `anthropic` \| `mock`, default `azure-foundry`). Implementations under [src/lib/ai/providers/](src/lib/ai/providers/), all `fetch`-based with no vendor SDK. |
| Storage | localStorage via `useStorageState` hook (no backend yet) |
| Calendar parsing | `ical.js` (deterministic ICS parser) |
| File uploads | `react-dropzone` |
| Icons | Lucide React |

> Note: The README describes an older Vite architecture. The project was migrated to Next.js. Ignore the README's project structure and tech stack sections — this document is authoritative.

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/                # Server-side API routes (all AI calls live here)
│   │   ├── analyze-bill/   # POST: analyze bill text → BillAnalysis JSON
│   │   ├── contact-script/ # POST: generate phone/email/letter scripts
│   │   ├── doctor-questions/ # POST: generate questions to ask a doctor
│   │   ├── scam-check/     # POST: flag potential bill scam indicators
│   │   └── route.ts        # GET: health-check that pings the AI provider
│   ├── appointments/
│   │   ├── page.tsx        # Appointment list view (complete)
│   │   └── new/page.tsx    # Add appointment flow (complete)
│   ├── bills/page.tsx      # Bill analyzer (complete)
│   ├── medications/page.tsx # Medication tracker (complete)
│   ├── history/page.tsx    # Dose history (complete; to be embedded per-section for MVP — see ROADMAP)
│   ├── settings/page.tsx   # App settings (complete)
│   └── documents/page.tsx  # Stub — deferred to post-MVP
├── components/
│   ├── appointments/       # AppointmentForm, AppointmentCard, AppointmentList, AppointmentInput
│   ├── bills/              # BillInputForm, BillAnalysisCard, BillHistory, BillSubNav,
│   │                       # BillActionsTabs, NextStepsChecklist
│   ├── medications/        # TodaysSummaryBar, MedForm, MedListCard, AllMedsView,
│   │                       # MedicationsContent, HistoryView, HistoryContent,
│   │                       # ProgressRing, SettingsView
│   ├── shared/             # ContentInput, EmptyState, TopNav, BottomNav, Skeleton,
│   │                       # ClientOnlyWrapper, ExtractedDataReview
│   └── ui/                 # shadcn primitives (button, card, dialog, input, checkbox,
│                           # badge, separator)
├── data/
│   ├── mocks/              # Seed/demo data gated by NEXT_PUBLIC_SEED_MOCKS=true.
│   │                       # Dynamic factories (buildMockAppointments, buildMockDoseLog)
│   │                       # accept a referenceDate so dev seed stays fresh and tests
│   │                       # can pass a fixed date for determinism.
│   └── fixtures/           # Test fixtures (e.g. appointments/*.ics, *.txt) for manual
│                           # UI testing and future Vitest consumption.
├── hooks/
│   ├── useAppointment.ts   # CRUD + upcoming/past filtering for appointments
│   ├── useBillHistory.ts   # CRUD for bill history
│   ├── useDoseLog.ts       # Record and query dose logs
│   └── useMedications.ts   # CRUD for medications
├── lib/
│   ├── ai/
│   │   ├── index.ts            # Provider selector + neutral simpleChat / chatWithProvider
│   │   ├── provider.ts         # ChatProvider interface + ChatMessage/Options/Response types
│   │   ├── providers/
│   │   │   ├── azure-foundry.ts # Azure AI Foundry (OpenAI-compatible) impl
│   │   │   ├── anthropic.ts     # Anthropic Claude Messages API impl
│   │   │   └── mock.ts          # Fixture-based provider for dev/tests (routeKey dispatch)
│   │   ├── bill-analysis.ts    # analyzeBill, generateContactScript,
│   │   │                       # generateDoctorQuestions, checkScam
│   │   ├── prompts.ts          # All system prompts (see Safety section)
│   │   └── safety/             # Guardrails layer
│   │       ├── output-validator.ts # Detects diagnostic/treatment language in AI output
│   │       ├── input-sanitizer.ts  # Strips PII / sanitizes user input
│   │       ├── audit-log.ts        # In-memory log of AI interactions
│   │       └── safe-chat.ts        # safeChatWithAI: wraps simpleChat with all guards
│   ├── constants/          # disclaimers, medications, appointments, bills constants
│   ├── content/
│   │   ├── detector.ts     # Identifies content type (ics, email, text, pdf, image)
│   │   ├── extraction.ts   # extractAppointment(): AI-based extraction via simpleChat
│   │   └── ics-parser.ts   # Deterministic ICS/calendar file parser (uses ical.js)
│   ├── storage.ts          # Low-level localStorage helpers
│   ├── useStorageState.ts  # localStorage-backed useState with SSR safety
│   └── utils.ts            # `cn` Tailwind class merge helper
├── types/index.ts          # All TypeScript interfaces
└── utils/
    ├── date.ts                # Date formatting helpers
    ├── medication-helpers.ts  # Dose scheduling helpers
    ├── scheduling.ts          # Medication schedule logic
    ├── storage.js             # Legacy storage helpers (JS)
    └── timeWindows.ts         # Time window calculations for dose adherence
```

---

## Feature Status

### Medications (complete)
- Add/edit/delete medications with name, dose, frequency, times, priority, instructions, doctor, pills remaining
- Today view with per-dose checkboxes and adherence percentage (`TodaysSummaryBar`, `ProgressRing`)
- Dose history with calendar grouping
- Frequency types: daily, every-other-day, specific-days, custom
- Priority levels: critical / important / routine

### Bills (complete)
- Paste or type bill text → AI analysis via `/api/analyze-bill`
- Returns structured `BillAnalysis`: summary, `potentialIssues` with severity tags `[HIGH]`/`[MEDIUM]`/`[LOW]`, key fields, next steps
- Sub-tools: contact script, doctor questions, scam check (all via separate API routes)
- Bill history persisted with status tracking (paid / waiting / need-to-call)

### Appointments (complete)
- `useAppointments` hook: full CRUD, `upcoming` and `past` computed lists
- `AppointmentForm`: all fields (title, doctor, specialty, location, address, phone, date, time, reason, notes), validation, native `<datalist>` location autocomplete from past appointments
- `AppointmentCard`: display + inline edit, parses YYYY-MM-DD without UTC shift
- `AppointmentList`: upcoming / past sections, empty state, past section hidden when empty
- `AppointmentInput`: wraps `ContentInput`. ICS → deterministic `parseIcsFile` + `icsEventToAppointment` (client-side). Text/email → POST `/api/extract-appointment`. Inline manual-entry escape and dismiss in the error banner.
- `ExtractedDataReview`: wraps `AppointmentForm` with optional source label and low-confidence amber banner. Input-agnostic — same component for ICS-parsed and AI-extracted fields.
- `/api/extract-appointment` route: thin HTTP wrapper around `extractAppointment()` with input validation and a 20k-char cap.
- `appointments/new/page.tsx`: two-step state machine (input → review → save).
- `appointments/page.tsx`: renders `AppointmentList` from the hook, "+ Add New" links to `/appointments/new`.

### Documents (deferred to post-MVP)
- Page stub exists at `/documents` but is intentionally not built for MVP. Vision: redirect the "paste medical documents into general-purpose chat" behavior into a place with proper guardrails, eventually with skills authored by medical professionals. See [ROADMAP.md](ROADMAP.md).

---

## Safety Constraints (Do Not Remove or Relax)

All AI interactions are governed by prompts in [src/lib/ai/prompts.ts](src/lib/ai/prompts.ts) and runtime guards in [src/lib/ai/safety/](src/lib/ai/safety/). The `CARETAKER_SYSTEM_PROMPT` defines hard rules that must be preserved across all AI calls:

- Never diagnose, never recommend treatment, never interpret lab results clinically
- Never suggest starting, stopping, or changing medications
- Always redirect medical questions to "prepare questions for your doctor"
- Emergency indicators (chest pain, breathing difficulty, self-harm) → always direct to 911

These constraints exist because the target users are elderly adults and overwhelmed caregivers. A well-intentioned but medically incorrect AI response could cause real harm.

The `SAFETY_SCENARIO_PROMPT` contains scripted responses for specific high-risk scenarios. These should be appended to the system prompt for any conversational (chat) interface.

The safety module provides defense-in-depth on top of prompts:

- `output-validator.ts` — scans AI output for diagnostic/treatment language and emergency keywords; provides safe substitute responses
- `input-sanitizer.ts` — sanitizes user input and strips/flags PII before sending to the model
- `audit-log.ts` — in-memory log of AI interactions with hashed identifiers
- `safe-chat.ts` — `safeChatWithAI()` orchestrates input sanitization → `simpleChat` call → output validation → audit logging. Prefer this over raw `simpleChat` for any conversational/free-form interface.

---

## Data Model

Key types from [src/types/index.ts](src/types/index.ts):

```typescript
// Medication with scheduling
interface Medication {
  id: number; name: string; dose: string;
  priority: "critical" | "important" | "routine";
  frequency: "daily" | "every-other-day" | "specific-days" | "custom";
  times: string[];       // ["08:00", "20:00"]
  daysOfWeek?: string[]; // ["Mon", "Wed", "Fri"]
  pillsRemaining?: number;
}

// Appointment (all fields nullable for partial extraction)
interface AppointmentFields {
  title?: string | null; doctor: string | null; specialty: string | null;
  location: string | null; address: string | null; phone: string | null;
  date: string | null;   // YYYY-MM-DD
  time: string | null;   // HH:MM (24h)
  reason: string | null; notes: string | null;
}
interface Appointment extends AppointmentFields { id: number; prepared: boolean; }

// Bill analysis output shape
interface BillAnalysis {
  summary: string; potentialIssues: string[]; vendorName: string | null;
  statementDate: string | null; dueDate: string | null;
  totalAmount: string | null; minimumDue: string | null;
  billingPeriod: string | null; insuranceCoverage: string | null;
  nextSteps: string[];
}
```

---

## Storage Pattern

All persistent state uses `useStorageState` from [src/lib/useStorageState.ts](src/lib/useStorageState.ts). This is a localStorage-backed `useState` drop-in that handles SSR hydration safely (Next.js compatibility). Keys:

- `caretaker-medications`
- `caretaker-dose-log`
- `caretaker-appointments`
- `caretaker-bill-history`

There is no backend database. All data lives in the user's browser. This is intentional for the POC — no server, no auth, no data leakage risk. Migration to a real backend is a post-MVP concern.

---

## AI Provider Configuration

The app is provider-agnostic. Call sites import a stable interface from [src/lib/ai/index.ts](src/lib/ai/index.ts) — they never reach into a specific provider's wrapper directly. The active provider is selected at runtime by the `AI_PROVIDER` env var (default `azure-foundry`).

### Stable interface (use these everywhere)

Exported from [src/lib/ai/index.ts](src/lib/ai/index.ts):

- `simpleChat(systemPrompt, userMessage, options?)` — one-shot completion, returns the response string. **Prefer this for new code.** Always pass `options.routeKey` so the mock provider can route deterministically.
- `safeChatWithAI(...)` — `chatWithProvider` wrapped with the safety guardrails (see Safety section)
- `chatWithProvider(messages, options?)` — multi-message conversations against the active provider
- `getActiveProvider()` — returns the currently selected `ChatProvider`

The shared types (`ChatMessage`, `ChatOptions`, `ChatResponse`, `ChatProvider`) live in [src/lib/ai/provider.ts](src/lib/ai/provider.ts).

### routeKey convention

Every non-trivial call site passes a stable `routeKey` in `ChatOptions` (e.g. `"bill-analysis"`, `"appointment-extraction"`, `"contact-script"`, `"doctor-questions"`, `"scam-check"`, `"health-check"`, `"safe-chat"`). Live providers ignore it; the mock provider uses it to load `src/data/fixtures/ai-responses/<routeKey>.txt`. Never dispatch mock responses by sniffing the system prompt — prompts evolve, route keys don't.

### Providers

| Name | File | Required env vars | Optional env vars |
|---|---|---|---|
| `azure-foundry` (default) | [src/lib/ai/providers/azure-foundry.ts](src/lib/ai/providers/azure-foundry.ts) | `AZURE_AI_FOUNDRY_ENDPOINT`, `AZURE_AI_FOUNDRY_API_KEY` | `AZURE_AI_FOUNDRY_API_VERSION`, `AZURE_AI_FOUNDRY_MODEL` (default `gpt-4.1-mini`) |
| `anthropic` | [src/lib/ai/providers/anthropic.ts](src/lib/ai/providers/anthropic.ts) | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`) |
| `openai-compatible` | [src/lib/ai/providers/openai-compatible.ts](src/lib/ai/providers/openai-compatible.ts) | `OPENAI_COMPATIBLE_BASE_URL`, `OPENAI_COMPATIBLE_API_KEY`, `OPENAI_COMPATIBLE_MODEL` | — |
| `mock` | [src/lib/ai/providers/mock.ts](src/lib/ai/providers/mock.ts) | — | reads fixtures from `src/data/fixtures/ai-responses/<routeKey>.txt` |

The `openai-compatible` provider works with anything speaking the OpenAI chat-completions wire format: OpenAI itself (`https://api.openai.com/v1`), OpenRouter, Groq, Together, Fireworks, Ollama (`http://localhost:11434/v1`), LM Studio (`http://localhost:1234/v1`), vLLM, llama.cpp server, etc. For local runners that ignore auth, pass any non-empty string as the API key. Azure AI Foundry has its own provider because of its deployment-specific URL + `?api-version=` shape.

Env vars are validated lazily on first call. Switching providers requires no code changes — set `AI_PROVIDER` in `.env.local` and restart.

---

## API Routes

All AI calls are server-side (Next.js API routes). The configured provider's API key is read from environment variables and never sent to the browser.

| Route | Method | Input | Output |
|---|---|---|---|
| [/api/analyze-bill](src/app/api/analyze-bill/route.ts) | POST | `{ text: string }` | `BillAnalysis` JSON |
| [/api/contact-script](src/app/api/contact-script/route.ts) | POST | `{ text, analysis? }` | Plain text script |
| [/api/doctor-questions](src/app/api/doctor-questions/route.ts) | POST | `{ text, analysis? }` | Plain text questions |
| [/api/scam-check](src/app/api/scam-check/route.ts) | POST | `{ text, analysis? }` | Plain text assessment |
| [/api/extract-appointment](src/app/api/extract-appointment/route.ts) | POST | `{ text: string }` (max 20k chars) | `AppointmentFields` JSON |
| [/api](src/app/api/route.ts) | GET | — | Health-check; pings the AI provider and returns success/error |

---

## Active Work Item

With the AI provider abstraction landed, the next priorities track the MVP roadmap: navigation consolidation (5-item top nav + Home dashboard), Tally-based feedback form, first-run onboarding, and user documentation (FAQ + BYO-key setup guide). See [ROADMAP.md](ROADMAP.md).

---

## What This App Is Not

- Not a medical records system (no lab result storage, no clinical data)
- Not HIPAA-compliant (no encryption at rest, no audit logs persisted to disk, no access controls)
- Not a communication tool (no messaging, no provider integration)
- Not a medication interaction checker (deferred — requires a drug database)
- Not a family collaboration platform (multi-user support is deferred)

These are deliberate POC scope decisions, not oversights.
