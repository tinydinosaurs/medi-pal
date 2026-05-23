# MediPal — Medical Care Assistant

MediPal is a care coordination tool for caregivers and the people they care for — an aging parent, a spouse navigating chronic illness, or anyone managing complex medical needs alongside someone who loves them.

It's built for both sides of that relationship. Caregivers — adult children, partners, siblings, close friends — get a single place to track medications, decode bills, and manage appointments. Care partners get the same tools to manage their own care directly, with reminders for doses and upcoming visits. The goal is supported independence: less friction for the caregiver, more autonomy for the care partner.

**Current status:** POC nearing completion. Medications and bills work end-to-end. Appointments are in progress.

---

## The Problem

The Baby Boom generation is aging, and the people who care for them — adult children, spouses, siblings, nieces and nephews — are stretched thin, often raising kids of their own at the same time. Medical care management is complex and exhausting:

- Medications are hard to track across multiple providers and schedules
- Medical bills are opaque, error-prone, and intimidating
- Caregivers paste sensitive health data into general-purpose AI tools with no guardrails
- The cognitive load is relentless — missed doses, forgotten appointments, billing disputes all fall on one person

## The Solution

A purpose-built assistant that organizes medical information using AI — with strict guardrails that prevent it from giving medical advice. The app helps you *understand and organize* health information; it never diagnoses, never recommends treatment changes, and always redirects clinical questions to a real provider.

---

## Features

### Medications
- Add medications with dose, frequency, schedule times, priority, doctor, and pill count
- Daily checklist with per-dose checkboxes and adherence percentage
- Dose history grouped by date
- Supports complex schedules: multiple daily times, specific days of the week, custom frequencies

### Bills
- Paste or type any medical bill text for AI-powered analysis
- Identifies duplicate charges, vague line items, collection red flags, and billing entity mismatches — severity-tagged as `[HIGH]`, `[MEDIUM]`, or `[LOW]`
- Generates a contact script (phone, email, and letter versions) for disputing issues
- Generates a question list to bring to a doctor's office
- Scam and red flag detection for suspicious bills
- Bill history with status tracking (paid / waiting / need to call)

### Appointments *(in progress)*
- Add appointments manually or by pasting confirmation text / uploading a `.ics` calendar file
- AI extracts structured appointment details from unstructured text
- Calendar files parsed deterministically (no AI needed for `.ics`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| AI | Pluggable LLM provider behind a `simpleChat` abstraction. Currently implemented: Azure AI Foundry (OpenAI-compatible). Anthropic Claude planned. |
| Storage | localStorage (no backend yet) |
| Icons | Lucide React |
| Calendar parsing | ical.js |
| File upload | react-dropzone |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Credentials for at least one supported AI provider (currently Azure AI Foundry; Anthropic Claude support is planned)

### Install

```bash
git clone https://github.com/yourusername/medi-pal.git
cd medi-pal
npm install
```

### Configure

Create `.env.local` in the project root with credentials for your chosen provider.

**Azure AI Foundry (current default):**

```bash
AZURE_AI_FOUNDRY_ENDPOINT=https://your-resource.services.ai.azure.com/...
AZURE_AI_FOUNDRY_API_KEY=your-key-here
# Optional — only needed if your endpoint doesn't already include ?api-version=
AZURE_AI_FOUNDRY_API_VERSION=2024-08-01-preview
# Optional — defaults to gpt-4.1-mini
AZURE_AI_FOUNDRY_MODEL=gpt-4.1-mini
```

**Anthropic Claude** support is planned. Once implemented, an `AI_PROVIDER=anthropic` env var will switch providers; until then the app is Azure-only at runtime. See [documentation/tech-debt.md](documentation/tech-debt.md) for the planned refactor.

Never commit `.env.local`. It's already in `.gitignore`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

---

## Project Structure

```
src/
├── app/                        # Next.js pages and API routes
│   ├── api/                    # Server-side AI calls (provider-agnostic via simpleChat)
│   │   ├── analyze-bill/       # Bill analysis
│   │   ├── contact-script/     # Dispute script generation
│   │   ├── doctor-questions/   # Question list generation
│   │   ├── scam-check/         # Red flag detection
│   │   └── route.ts            # Health-check (GET)
│   ├── appointments/           # Appointment pages (in progress)
│   ├── bills/                  # Bill analyzer
│   ├── history/                # Dose history
│   ├── medications/            # Medication tracker
│   └── settings/               # App settings
├── components/
│   ├── appointments/           # Appointment UI components
│   ├── bills/                  # Bill UI components
│   ├── medications/            # Medication UI components
│   ├── shared/                 # Navigation, empty states, shared inputs
│   └── ui/                     # shadcn/ui primitives
├── hooks/                      # useAppointments, useMedications, useDoseLog, useBillHistory
├── lib/
│   ├── ai/                     # Prompts, provider wrappers, safety guardrails
│   ├── content/                # Content detection, extraction, ICS parsing
│   ├── constants/              # Disclaimers and domain constants
│   └── useStorageState.ts      # localStorage-backed useState (SSR-safe)
├── types/index.ts              # All TypeScript interfaces
└── utils/                      # Date, scheduling, and medication helpers
```

---

## AI Safety

Every AI call in this app is governed by a strict system prompt plus a runtime guardrail layer. The rules are non-negotiable:

- Never diagnose conditions or suggest diagnoses
- Never recommend starting, stopping, or changing medications
- Never interpret lab results as good or bad
- Never provide dosing recommendations
- Always redirect clinical questions to a real healthcare provider
- For emergencies: direct to 911 immediately

These guardrails exist because the users are elderly adults and stressed caregivers. Relaxing them is not a refactoring opportunity — it's a safety risk.

Prompts live in `src/lib/ai/prompts.ts`. Defense-in-depth (input sanitization, output validation, audit logging) lives in `src/lib/ai/safety/`. All AI calls are server-side; the API key is never exposed to the browser.

---

## Architecture Notes

**No backend yet.** All data lives in the user's browser via localStorage. This is intentional for the POC — no server setup, no auth complexity, no data at risk. Migration to a real backend (Supabase is the leading candidate) is the first MVP milestone.

**AI calls are server-side and provider-agnostic.** Next.js API routes call a stable `simpleChat` interface from `src/lib/ai`; the concrete provider (currently Azure AI Foundry, with Anthropic Claude planned) is selected by environment configuration. API keys never leave the server.

**Content type routing.** The `src/lib/content/detector.ts` module identifies whether input is a calendar file, email, or plain text and routes it accordingly — `.ics` files are parsed deterministically with ical.js; everything else goes to the configured AI provider for extraction.

For a full architectural breakdown and current development status, see [AGENTS.md](./AGENTS.md).  
For the feature roadmap, see [ROADMAP.md](./ROADMAP.md).

---

## Known Limitations (POC)

- Data is stored in the browser only — lost on wipe, not synced across devices
- No user authentication
- Appointments section is not yet complete
- No PDF or image text extraction (paste/type only)
- Not HIPAA-compliant — do not use with real patient data in a clinical context

---

## License

**All Rights Reserved.**

Copyright © 2026. This source code is made publicly visible for transparency and portfolio purposes only. No license is granted to use, copy, modify, distribute, or create derivative works from this code, in whole or in part, without prior written permission from the copyright holder.

If you're interested in collaborating, contributing, or licensing this work, please reach out.

---

*Built for all the sandwich generation caregivers doing their best.*
