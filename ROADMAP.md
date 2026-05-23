# Medipal — Roadmap

## Definition of Terms

**POC (Proof of Concept):** All three core sections (medications, bills, appointments) work end-to-end in a browser. No auth, no backend, mock data acceptable. Goal: validate the idea and demo to stakeholders.

**MVP (Minimum Viable Product):** Real users can install, create an account, and use the app with their own data safely. Data persists across devices. App is stable enough to trust with real health information.

**Post-MVP:** Features that meaningfully expand capability or user base after the core is solid.

---

## POC

### Medications
- [x] Add / edit / delete medications
- [x] Daily dose checklist with per-dose checkboxes
- [x] Adherence percentage display
- [x] Dose history with date grouping
- [x] Multiple daily times per medication
- [x] Frequency types: daily, every-other-day, specific days, custom
- [x] Priority levels: critical / important / routine
- [x] Per-medication notes, doctor, and pill count fields
- [x] Settings view (font size, preferences)

### Bills
- [x] Paste or type bill text
- [x] AI analysis: summary, key fields, severity-tagged issues
- [x] Contact script generation (phone, email, letter)
- [x] Doctor questions generation
- [x] Scam / red flag detection
- [x] Bill history with status tracking (paid / waiting / need-to-call)

### Appointments
- [x] Data model and TypeScript types
- [x] `useAppointments` hook (CRUD, upcoming/past computed lists)
- [x] `AppointmentForm` component (all fields, validation)
- [x] `ContentInput` component (drag-drop + paste, file upload)
- [x] ICS calendar file parser (deterministic, no AI needed)
- [x] Content type detector (ics, email, text, pdf, image)
- [x] AI extraction prompt (`APPOINTMENT_EXTRACTION_SYSTEM_PROMPT`)

Ordered for execution — the non-AI items come first so progress isn't blocked by the AI provider situation. The final item is the only one that requires a working LLM provider.

- [ ] `AppointmentCard` — display + inline edit for a single appointment (file exists as pseudocode only)
- [ ] `AppointmentList` — render list with upcoming / past sections (file exists as pseudocode only)
- [ ] `AppointmentInput` — wrapper around `ContentInput` with "add manually" option (file exists as pseudocode only)
- [ ] `appointments/page.tsx` — wire "Add New" navigation, render appointment list
- [ ] `appointments/new/page.tsx` — assemble full add-appointment flow (testable end-to-end via the deterministic `.ics` path with no AI required)
- [ ] `ExtractedDataReview` component — confirm/edit extracted fields before saving (input-agnostic; works for both ICS-parsed and AI-extracted fields)
- [ ] `/api/extract-appointment` route — thin HTTP wrapper around the existing `extractAppointment()` function (requires working AI provider to smoke-test, but trivial to write)

### Unblockers (before POC release)

Non-blocking for the appointment build-out, but needs to land before POC is considered shippable — without it, no AI feature can be exercised locally.

- [ ] **Add Anthropic Claude as an alternate AI provider.** Users should be able to use whichever AI provider they choose, and the app is currently single-provider at runtime. The architecture is already provider-agnostic at the `simpleChat` seam — what's missing is a sibling Anthropic implementation and an `AI_PROVIDER` env-var selector. Full refactor spec lives in [documentation/tech-debt.md](documentation/tech-debt.md#ai-provider-abstraction-near-term).

---

## MVP

MVP is the first version real users can trust with real data. The focus is persistence, auth, and stability — not new features.

### Auth & Accounts
- [ ] User authentication (email + password or magic link via Supabase/Clerk)
- [ ] Single user per account (multi-profile is post-MVP)
- [ ] Session persistence across devices

### Backend & Storage
- [ ] Replace localStorage with a real database (Supabase recommended)
- [ ] All user data scoped to authenticated user
- [ ] Data survives browser wipe / device switch
- [ ] Basic data export (JSON download of all records)

### Security
- [ ] API key never exposed to browser (already true; ensure it stays that way)
- [ ] HTTPS enforced in production
- [ ] No sensitive data in logs or error messages

### Onboarding
- [ ] First-run experience: brief explanation of what the app does and doesn't do
- [ ] Persistent safety disclaimer (AI is not a doctor)
- [ ] Add first medication walkthrough

### Documents Section
- [ ] Basic document list (lab results, referral letters, appointment summaries)
- [ ] Paste or upload document text → AI plain-language summary
- [ ] Documents stored with date and type tag
- [ ] No clinical interpretation — summary only

### Mobile & Accessibility
- [ ] Responsive layout tested on iOS Safari and Android Chrome
- [ ] Touch targets meet minimum size (48px)
- [ ] Font size preference applied app-wide (setting already exists in medications)
- [ ] Keyboard navigation works throughout

### Stability
- [ ] Error boundaries on all pages (no white screens)
- [ ] Loading states on all AI calls
- [ ] Graceful degradation when API is unavailable
- [ ] Basic input validation on all forms

### Testing

No automated test suite exists today. Worth introducing before MVP so refactors and new features don't silently break existing behavior. Broken into phases by ROI — each phase is independently shippable and provides value without requiring the next.

- [ ] **Phase 1: Toolchain bootstrap.** Add Vitest + co-located `*.test.ts` convention. One trivial passing test in `src/utils/` to validate the runner, path aliases, and CI integration. No production code changes.
- [ ] **Phase 2: Domain logic tests (highest ROI).** Cover the pure functions where a silent regression would matter most:
  - [ ] `src/utils/scheduling.ts` — `shouldTakeMedToday()` and helpers, including every-other-day boundaries, specific-days-of-week, DST transitions
  - [ ] `src/utils/timeWindows.ts` — adherence window math
  - [ ] `src/lib/content/ics-parser.ts` — feed real-world ICS samples from Google Calendar, Outlook, Apple Calendar; assert parsed `AppointmentFields` shape
  - [ ] `src/lib/bill-analysis-coerce.ts` — confirm malformed, malicious, and missing-field inputs all produce safe output
- [ ] **Phase 3: AI safety layer tests.** Lock in the behavior of the guardrails — these tests *are* the proof that the safety claims hold.
  - [ ] `src/lib/ai/safety/output-validator.ts` — corpus of "should be flagged" / "should pass" strings covering diagnostic language, treatment recommendations, emergency keywords
  - [ ] `src/lib/ai/safety/input-sanitizer.ts` — PII detection, sanitization edge cases
  - [ ] `src/lib/ai/safety/safe-chat.ts` — integration test that input → sanitize → (mocked) `simpleChat` → validate → audit-log path executes in order
- [ ] **Phase 4 (deferred to post-MVP): Component and route tests.** Hold until UI is stable. At that point: testing-library coverage of the high-traffic flows (record dose, save appointment, analyze bill) and integration tests for the API routes with mocked providers.

Decisions:
- Vitest over Jest (better Next 16 / ESM / TS ergonomics; Jest API-compatible if migration ever needed)
- Co-located tests (`foo.ts` + `foo.test.ts`) over a separate `__tests__/` tree
- No coverage threshold gates — they reward padding over signal

---

## Post-MVP (Near-Term)

Features worth building after users are in the app with real data. Ordered roughly by value.

### Multi-Profile Support
- [ ] Add multiple family member profiles (e.g., "Mom", "Dad")
- [ ] Switch active profile from nav
- [ ] All data (meds, bills, appointments) scoped to a profile

### Conversational Agent
- [ ] Surfaced chat interface available on any page
- [ ] Agent has read access to current profile's medications, appointments, and bill history
- [ ] Can answer questions like "what medications does mom take in the morning?" or "when is the next appointment?"
- [ ] Governed by existing `CARETAKER_SYSTEM_PROMPT` safety rules

### Appointments: AI-Assisted Preparation
- [ ] "Prepare for this appointment" flow: generate a list of questions to bring
- [ ] Pre-appointment checklist (bring insurance card, fast beforehand, arrive early)
- [ ] Mark appointment as prepared

### Appointments: Reminders
- [ ] Reminder N days before an appointment (configurable)
- [ ] Reminder format: in-app notification (push/SMS deferred)

### Bills: Enhancements
- [ ] Photo upload — snap a picture of a paper bill (requires OCR)
- [ ] Export bill analysis as PDF
- [ ] Recurring bill detection and tracking

### Medications: Enhancements
- [ ] Refill tracking: alert when pills remaining falls below threshold
- [ ] Common instruction shortcuts (take with food, take on empty stomach, take before bed)
- [ ] Dose amount formatting: number + unit selector instead of free text

### Family Collaboration (lightweight)
- [ ] Share a read-only view of medications or upcoming appointments via link
- [ ] No account required for read-only access
- [ ] Sharing is profile-scoped and revocable

### Design System Migration
- [ ] Refactor all UI from Tailwind + shadcn primitives to the shared cross-app design system (in development separately)
- [ ] Migration happens **after** MediPal is feature-complete and user-tested — do not start until the current UI surface is stable
- [ ] Replace component imports incrementally, section by section (medications → bills → appointments → documents)
- [ ] Preserve dual-audience accessibility requirements (font scaling, tap targets, contrast) — the design system must support these or be extended to
- [ ] Until migration begins, continue building new UI with Tailwind + shadcn; do not pre-emptively pattern code around the future system

### Deterministic Fallback Parsers for AI Features

Before GA. Resilience layer for when the AI provider is unavailable, rate-limited, or returns garbage — and a free, fast pre-pass that can short-circuit AI calls when the deterministic answer is good enough. Also enables a zero-network demo mode.

- [ ] **Appointment extraction fallback** — deterministic parser that pulls common fields (date, time, doctor/provider name, specialty, phone, address) from unstructured text using regex and heuristic patterns. Run *before* the AI call: if confidence is high, skip the AI; if low, pass partial fields to the AI as a hint.
- [ ] **Bill analysis fallback** — rule-based checker for the most common issues: duplicate line items, totals that don't match line-item sums, unusually round amounts, known scam phrases / collection-style language, balance-due exceeding insurance coverage. Returns the same `BillAnalysis` shape so the UI doesn't care which path produced it.
- [ ] **Graceful degradation orchestration** — when the AI provider call fails or times out, fall back to the deterministic parser and surface a clear "AI unavailable, showing partial results" notice rather than an error.
- [ ] **Shared confidence/severity model** — both parsers should tag their output with the same confidence/severity vocabulary the AI output uses (`[HIGH]` / `[MEDIUM]` / `[LOW]`), so downstream UI doesn't need to branch on source.
- [ ] Document which fields/issues the fallback parsers cover vs. which require the AI — so users know what they're getting in degraded mode.

---

## Deferred (Real But Not Near-Term)

These are legitimate product directions that require significant infrastructure or external dependencies. Not in scope until post-MVP is stable.

- **Pharmacy integration** — import medications from pharmacy portal; refill requests
- **Patient portal import** — pull appointments/records from Epic/Cerner via FHIR API
- **Calendar sync** — two-way sync with Google Calendar, Apple Calendar
- **PDF/image text extraction** — OCR for scanned documents (Tesseract.js or cloud OCR)
- **Medication interaction checker** — requires a drug database API (e.g., OpenFDA, DrugBank)
- **HIPAA compliance** — encryption at rest, audit logs, BAA with cloud providers; required before any enterprise/provider use
- **SMS / email reminders** — requires Twilio or similar; notification infrastructure
- **Multi-language support** — particularly Spanish; high value for the target demographic
- **Voice interface** — speak to the app; especially useful for elderly users
- **React Native mobile app** — after web MVP is stable
- **Smart pill box integration** — hardware prototype; very long-term
- **Design system migration** — remove Tailwind and shadcn/ui; replace with a homegrown design system currently in development. The app's component structure (shadcn components in `src/components/ui/`, Tailwind utility classes throughout) is already well-encapsulated, which will make the swap cleaner. Target: do this after MVP is stable and the design system itself is mature.
