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

**Current status:** Working end-to-end for medications and bills. Appointments are scaffolded (~50%) and actively in progress.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) — see [ROADMAP.md](ROADMAP.md) for post-MVP migration to a shared design system |
| AI | Pluggable provider behind a `simpleChat` abstraction. Currently implemented: Azure AI Foundry (OpenAI-compatible chat completions) via a thin `fetch` wrapper in [src/lib/ai/azure-foundry.ts](src/lib/ai/azure-foundry.ts). Anthropic Claude is the next provider to add — see [documentation/tech-debt.md](documentation/tech-debt.md). |
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
│   │   ├── page.tsx        # Appointment list view (partially wired)
│   │   └── new/page.tsx    # Add appointment flow (incomplete)
│   ├── bills/page.tsx      # Bill analyzer (complete)
│   ├── medications/page.tsx # Medication tracker (complete)
│   ├── history/page.tsx    # Dose history (complete)
│   ├── settings/page.tsx   # App settings (complete)
│   └── documents/page.tsx  # Stub — not started
├── components/
│   ├── appointments/       # AppointmentForm, AppointmentCard, AppointmentList, AppointmentInput
│   ├── bills/              # BillInputForm, BillAnalysisCard, BillHistory, BillSubNav,
│   │                       # BillActionsTabs, NextStepsChecklist
│   ├── medications/        # TodaysSummaryBar, MedForm, MedListCard, AllMedsView,
│   │                       # MedicationsContent, HistoryView, HistoryContent,
│   │                       # ProgressRing, SettingsView
│   ├── shared/             # ContentInput, EmptyState, TopNav, BottomNav, Skeleton,
│   │                       # ClientOnlyWrapper, ExtractedDataReview (empty stub)
│   └── ui/                 # shadcn primitives (button, card, dialog, input, checkbox,
│                           # badge, separator)
├── data/
│   └── mocks/              # Seed/demo data: medications, dose-log, appointments,
│                           # documents, alerts
├── hooks/
│   ├── useAppointment.ts   # CRUD + upcoming/past filtering for appointments
│   ├── useBillHistory.ts   # CRUD for bill history
│   ├── useDoseLog.ts       # Record and query dose logs
│   └── useMedications.ts   # CRUD for medications
├── lib/
│   ├── ai/
│   │   ├── index.ts            # Barrel export
│   │   ├── azure-foundry.ts    # Azure AI Foundry fetch wrapper + simpleChat helper
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

### Appointments (in progress)
- `useAppointments` hook: full CRUD, `upcoming` and `past` computed lists — **done**
- `AppointmentForm`: all fields (title, doctor, specialty, location, address, phone, date, time, reason, notes), validation — **done**
- `ContentInput`: drag-and-drop + paste UI, routes ICS files to deterministic parser, text/email to AI — **done**
- ICS parser ([src/lib/content/ics-parser.ts](src/lib/content/ics-parser.ts)): parses `.ics` calendar files into `AppointmentFields` — **done**
- `APPOINTMENT_EXTRACTION_SYSTEM_PROMPT` in [src/lib/ai/prompts.ts](src/lib/ai/prompts.ts) — **done**
- `extractAppointment()` in [src/lib/content/extraction.ts](src/lib/content/extraction.ts): AI extraction function exists and calls `simpleChat` directly — **done** (but no API route wrapper yet)
- `AppointmentCard`, `AppointmentList`, `AppointmentInput`: files exist but are commented-out pseudocode — **not started** (only `AppointmentForm` is exported from the barrel)
- `ExtractedDataReview.tsx`: empty file — **not started**
- `/api/extract-appointment` route: **missing** (extraction currently has no HTTP entry point)
- [src/app/appointments/new/page.tsx](src/app/appointments/new/page.tsx): imports only, no render — **not started**
- [src/app/appointments/page.tsx](src/app/appointments/page.tsx): header + empty state only, "Add New" `onClick` commented out — **not started**

### Documents (not started)
- Page stub exists at `/documents`. Planned as a hub for lab results, referral letters, and other medical documents.

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

The app is **designed to be provider-agnostic**. All call-sites import a stable interface from [src/lib/ai/index.ts](src/lib/ai/index.ts) — they never reach into a specific provider's wrapper directly. Today only one provider is implemented (Azure AI Foundry); Anthropic Claude is planned next so local development and testing can switch between them via an env var. See the "AI Provider Abstraction" item in [documentation/tech-debt.md](documentation/tech-debt.md) for the planned refactor.

### Stable interface (use these everywhere)

Exported from [src/lib/ai/index.ts](src/lib/ai/index.ts):

- `simpleChat(systemPrompt, userMessage, options?)` — one-shot completion, returns the response string. **Prefer this for new code.**
- `safeChatWithAI(...)` — `simpleChat` wrapped with the safety guardrails (see Safety section)
- `chatWithAzureFoundry(messages, config, options?)` — currently provider-specific; will be renamed/abstracted as part of the provider refactor. Avoid using directly in new code.

### Current provider: Azure AI Foundry

Implementation lives in [src/lib/ai/azure-foundry.ts](src/lib/ai/azure-foundry.ts) — wraps the OpenAI-compatible chat completions endpoint via `fetch`. No vendor SDK.

Required environment variables (in `.env.local`, never exposed to the browser):

- `AZURE_AI_FOUNDRY_ENDPOINT` — full endpoint URL for the deployed model
- `AZURE_AI_FOUNDRY_API_KEY` — API key
- `AZURE_AI_FOUNDRY_API_VERSION` — optional; appended as `?api-version=` if the endpoint doesn't already include one
- `AZURE_AI_FOUNDRY_MODEL` — optional; defaults to `gpt-4.1-mini`

### Planned provider: Anthropic Claude

Not yet implemented. When added, the planned shape is:

- A sibling file `src/lib/ai/anthropic.ts` exporting the same `simpleChat` signature
- A selector in [src/lib/ai/index.ts](src/lib/ai/index.ts) driven by `AI_PROVIDER=anthropic|azure-foundry`
- Anthropic-specific env vars (`ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`) loaded only when that provider is selected

Until the refactor lands, `simpleChat` is the safe boundary — swapping providers will not require changes to API routes, `extractAppointment`, `bill-analysis.ts`, or any UI code.

---

## API Routes

All AI calls are server-side (Next.js API routes). The configured provider's API key is read from environment variables and never sent to the browser.

| Route | Method | Input | Output |
|---|---|---|---|
| [/api/analyze-bill](src/app/api/analyze-bill/route.ts) | POST | `{ text: string }` | `BillAnalysis` JSON |
| [/api/contact-script](src/app/api/contact-script/route.ts) | POST | `{ text, analysis? }` | Plain text script |
| [/api/doctor-questions](src/app/api/doctor-questions/route.ts) | POST | `{ text, analysis? }` | Plain text questions |
| [/api/scam-check](src/app/api/scam-check/route.ts) | POST | `{ text, analysis? }` | Plain text assessment |
| [/api](src/app/api/route.ts) | GET | — | Health-check; pings the AI provider and returns success/error |
| `/api/extract-appointment` | POST | `{ text: string }` | `AppointmentFields` JSON (**not yet built**) |

---

## Active Work Item

The appointments feature needs these pieces to be usable:

1. **`/api/extract-appointment` route** — POST handler that calls `extractAppointment()` from [src/lib/content/extraction.ts](src/lib/content/extraction.ts) and returns the result as JSON. Pattern to follow: [src/app/api/analyze-bill/route.ts](src/app/api/analyze-bill/route.ts).

2. **`ExtractedDataReview.tsx`** — Component that receives `AppointmentFields` (from ICS parse or AI extraction) and renders a pre-filled `AppointmentForm` for the user to confirm/edit before saving. On confirm, calls `useAppointments().addAppointment()`.

3. **[src/app/appointments/new/page.tsx](src/app/appointments/new/page.tsx)** — Assemble the add-appointment flow: `ContentInput` → detect type → parse/extract → `ExtractedDataReview` (or go straight to blank `AppointmentForm` if user skips). Wire save to navigate back to `/appointments`.

4. **[src/app/appointments/page.tsx](src/app/appointments/page.tsx)** — Wire the "Add New" button to route to `/appointments/new`. Render `AppointmentList` (which already exists) with the hook data.

---

## What This App Is Not

- Not a medical records system (no lab result storage, no clinical data)
- Not HIPAA-compliant (no encryption at rest, no audit logs persisted to disk, no access controls)
- Not a communication tool (no messaging, no provider integration)
- Not a medication interaction checker (deferred — requires a drug database)
- Not a family collaboration platform (multi-user support is deferred)

These are deliberate POC scope decisions, not oversights.
