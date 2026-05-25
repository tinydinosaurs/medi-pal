# Medipal — Roadmap

## Definition of Terms

**POC (Proof of Concept):** All three core sections (medications, bills, appointments) work end-to-end in a browser. No auth, no backend, mock data acceptable. Goal: validate the idea and demo to stakeholders.

**Private Alpha (Friends & Family Release):** Ship the POC to a small, invited group — friends, family, a handful of trusted caregivers. Still local-only (no auth, no shared backend), but onboarded enough that someone can open it cold without a guided tour. Goal: collect candid feedback from people who'll tolerate rough edges in exchange for genuinely useful tools. Not a public launch.

**MVP (Minimum Viable Product):** Real users — beyond the F&F circle — can install, create an account, and use the app with their own data safely. Data persists across devices. App is stable enough to trust with real health information. Goal: a product the broader sandwich-generation audience can sign up for without a personal introduction.

**Public Beta:** Open signups, still rough around the edges, no SLA. After MVP, before GA.

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

- [x] `AppointmentCard` — display + inline edit for a single appointment
- [x] `AppointmentList` — render list with upcoming / past sections
- [x] `AppointmentInput` — wrapper around `ContentInput` with "add manually" option and inline manual-entry escape on extraction error
- [x] `appointments/page.tsx` — wire "Add New" navigation, render appointment list
- [x] `appointments/new/page.tsx` — assemble full add-appointment flow (testable end-to-end via the deterministic `.ics` path with no AI required)
- [x] `ExtractedDataReview` component — confirm/edit extracted fields before saving (input-agnostic; works for both ICS-parsed and AI-extracted fields, with low-confidence warning banner)
- [x] `/api/extract-appointment` route — thin HTTP wrapper around the existing `extractAppointment()` function (input validation + 20k-char cap; requires working AI provider for the text/email path, but ICS path works without it)

**Added during the appointment build, not originally on the roadmap:**

- [x] Backfill `AppointmentForm` with `specialty`, `address`, `phone` fields (originally declared on `AppointmentFields` but not rendered)
- [x] Local-dev seed mechanism gated by `NEXT_PUBLIC_SEED_MOCKS` env var (`useMedications`, `useDoseLog`, `useAppointments` populate from `src/data/mocks/` on first load when enabled)
- [x] Dynamic mock factories — `buildMockAppointments(referenceDate?)` and `buildMockDoseLog(referenceDate?)` so the dev seed always shows fresh upcoming/past data relative to today, while tests can pass a fixed `referenceDate` for determinism
- [x] Test fixtures at `src/data/fixtures/appointments/` — two `.ics` files (single-event, all-day) and three `.txt` files (rich email, SMS reminder, vague SMS) for both manual UI testing and future Vitest consumption

### Unblockers (before POC release)

Non-blocking for the appointment build-out, but needs to land before POC is considered shippable — without it, no AI feature can be exercised locally.

- [x] **Add Anthropic Claude as an alternate AI provider.** ✅ Landed alongside a fixture-based mock provider. Selected at runtime by `AI_PROVIDER=azure-foundry|anthropic|mock` (default `azure-foundry`). All call sites import `simpleChat` / `chatWithProvider` from `@/lib/ai` and pass a stable `routeKey` so the mock provider can return deterministic fixtures from `src/data/fixtures/ai-responses/`. See [AGENTS.md](AGENTS.md#ai-provider-configuration).

---

## Private Alpha

The Friends & Family release. POC is technically complete, but a cold open of the app shouldn't require a guided demo. This tier is everything between "works on my machine" and "hand it to your mom."

Still local-only — no auth, no shared backend, no public signups. The goal is to get the app in front of a small invited group, watch where they get stuck, and turn that feedback into the MVP backlog.

### Navigation & Information Architecture

Five-item top nav so the app reads clearly to a tired caregiver on first open. The dashboard absorbs cross-cutting status; per-section history lives inside each section rather than as a top-level destination. The eight-item nav reads as a prototype; the five-item nav reads as a product.

- [ ] Top-level nav: **Home (dashboard), Medications, Bills, Appointments, Settings** — five items, no more
- [ ] **Home dashboard** — today's medications (with quick-record dose), upcoming appointments (next 7 days), bills needing attention (status: waiting / need-to-call). Single screen, scannable in under 10 seconds.
- [ ] Remove **History** as a top-level destination — embed history view inside each section (medications already has it; mirror the pattern in bills and appointments)
- [ ] Remove **Documents** from the nav entirely (see deferral note in Post-MVP)
- [ ] **Getting Started** is not a nav item — it lives under Settings and is linked from the first-run flow

### Onboarding

No one on the F&F list should have to ask "what is this and what do I do first?" out loud.

- [ ] First-run experience: brief explanation of what the app does and doesn't do
- [ ] Persistent safety disclaimer (AI is not a doctor)
- [ ] Add first medication walkthrough
- [ ] **Getting Started guide** lives in Settings (not a top-level nav item) — walks a non-technical caregiver through obtaining and pasting their AI provider API key. Same destination linked from the first-run flow.

### Minimum Documentation

The full User Documentation & Support build-out is an MVP concern; for Private Alpha we just need the bare minimum so testers aren't confused or worried.

- [ ] **FAQ page** (in-app, linked from Settings and the first-run flow). What the app does, what it explicitly *won't* do (no diagnosis, no treatment, no replacement for a doctor), where data is stored, what to do if AI gives a confusing answer.
- [ ] **Provider setup guide** — step-by-step BYO-key instructions for at least one provider (whichever is cheapest for testers to sign up for). Written for someone who's never used an API key before. Other providers can come later.
- [ ] **Feedback form** — Tally.so form embedded behind Settings → Help & Feedback. Structured categories (bug / feature request / question / something else), no exposed email address, responses forward to a dedicated inbox. This is the primary channel for F&F feedback — it has to exist before the first invite goes out.

### F&F Launch Logistics

- [ ] Pick the invite list (5–15 people is plenty)
- [ ] Write a short "how to install and what to expect" email/message template
- [ ] Decide who fields feedback-form submissions (you, for now)
- [ ] Set a check-in cadence with testers — weekly is probably right for a small group

---

## MVP

MVP is the first version trustable for users *beyond* the F&F circle. The focus is persistence, auth, security, and stability — not new features. By this point the Private Alpha has surfaced the real usability problems; MVP is where the product earns the right to ask strangers to sign up.

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

### User Documentation & Support

MediPal's target users are elderly care partners and overwhelmed caregivers — exactly the audience least likely to know how to file a GitHub issue or interpret a stack trace. Until there's a hosted version with a fully managed AI backend, users will also need to bring their own provider credentials, which makes setup non-trivial. The bare minimum (FAQ, one provider setup guide, feedback form) ships in Private Alpha; everything below is the MVP expansion for a broader audience.

- [ ] **"How this works" page** — plain-language explanation of the AI features. Sets expectations: the app organizes and interprets, never prescribes; emergency symptoms always route to 911.
- [ ] **Provider setup guides for every supported provider** (Anthropic, Azure AI Foundry, OpenAI-compatible). Screenshots, links to where to sign up, what model to choose, where to paste the key. The Private Alpha version only had to cover one provider; MVP covers all.
- [ ] **Privacy & data handling page** — what stays local, what goes to the AI provider, what's never sent. Required for trust; arguably required for liability.
- [ ] **Expanded FAQ** — builds on the Private Alpha FAQ with answers to the questions testers actually asked. Driven by real F&F feedback, not guesses.
- [ ] **Glossary of medical terms** (optional for MVP, valuable post-MVP) — definitions of jargon that shows up in bills and appointment notes (e.g., "EOB," "deductible," "copay," "specialist referral").
- [ ] **Empty states with educational copy** — every empty section (no medications yet, no bills yet, no appointments yet) should explain what the section is for and link to the relevant FAQ entry. Already a partial pattern; formalize it.
- [ ] Tone audit on all documentation: written for someone tired, overwhelmed, possibly elderly. No jargon. Short paragraphs. Bold the action.

This is also the natural home for any future hosted-version messaging ("Want this configured for you? Sign up for the hosted plan") once that exists.

### Mobile & Accessibility
- [ ] Responsive layout tested on iOS Safari and Android Chrome
- [ ] Touch targets meet minimum size (48px)
- [ ] Font size preference applied app-wide (setting already exists in medications)
- [ ] Keyboard navigation works throughout

### Mobile-Specific Layout (design decision)

MediPal serves a span of caregivers and care partners whose comfort with small screens varies enough that a single responsive layout will serve nobody well. Device comfort doesn't track cleanly with age — it tracks with individual habit, eyesight, motor control, and cognitive load. There are three user surface profiles to design for:

- **Mobile-first / mobile-comfortable.** Reaches for the phone first for almost everything, including tasks others would do on a computer. Wants the mobile experience to have enough feature depth to actually manage care from a phone, not just glance at it.
- **Mobile-and-desktop hybrid.** Uses both, but prefers desktop for anything involving reading, typing, or close attention. Mobile is for quick check-ins (today's doses, next appointment). Desktop is for adding, editing, reviewing bills, configuring.
- **Desktop-only (or near-only).** Can't comfortably use a phone for the app at all. Reasons span the cohort — never got comfortable with smartphones, failing eyesight, hand tremor or weakness (Parkinson's, post-stroke, frailty), brain fog from illness or treatment, cognitive impairment. For this group the desktop experience isn't a fallback — it's the *only* path that works.

The practical implications:

- [ ] **Mobile is not a stripped-down desktop.** It needs its own feature scope — not the whole app, but more than a status dashboard. The mobile-first cohort should be able to run their day from their phone (record doses, add a new appointment from a forwarded email, check today's schedule, see alerts).
- [ ] **Desktop is not optional, ever.** Every workflow must work fully on desktop. Some workflows can exist *only* on desktop without breaking the product.
- [ ] **Mobile navigation pattern** — evaluate bottom tab bar vs. simplified top nav; whichever pattern best supports the mobile feature scope wins.
- [ ] **Routing strategy** — decide between (a) responsive components that render differently below a breakpoint, (b) parallel route tree (`/m/...`), or (c) middleware-driven component swap. The choice affects how cleanly the two layouts can diverge.
- [ ] **Content and entry points** — copy, empty states, and CTAs need to read well in both layouts independently. "Open this on your computer" is a legitimate mobile empty state for desktop-only features, but it should be rare.
- [ ] Usability validation with at least 2–3 users from each surface profile before committing to the split.

This is a layout *strategy* decision that gates the responsive-layout work above it. Worth resolving before serious mobile design work begins so the testing targets are clear.

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

### Native Google Gemini Provider

The `openai-compatible` provider already covers Gemini *indirectly* via OpenRouter (`anthropic/claude-3.5-sonnet`, `google/gemini-2.0-flash`, etc.), so users with an OpenRouter key can pick Gemini today. A native provider is still worth adding for users who already have Google AI Studio credentials and don't want a second account in the middle.

- [ ] Add `src/lib/ai/providers/gemini.ts` implementing the `ChatProvider` interface against the Generative Language API (`https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent`).
- [ ] Normalize message shape: collapse system messages into Gemini's top-level `systemInstruction`, map the rest into `contents: [{ role: "user" | "model", parts: [{ text }] }]`.
- [ ] Normalize response: pull `candidates[0].content.parts[].text`, map `usageMetadata.promptTokenCount` / `candidatesTokenCount` into the shared `usage` shape.
- [ ] Env vars: `GEMINI_API_KEY` required, `GEMINI_MODEL` optional (default `gemini-2.0-flash` or whatever's current).
- [ ] Wire into the `AI_PROVIDER` selector and document in [AGENTS.md](AGENTS.md#ai-provider-configuration).
- [ ] Add a `gemini` fixture set under `src/data/fixtures/ai-responses/` only if Gemini-specific quirks (e.g. safety filter triggers) need their own canned responses; otherwise the existing fixtures are provider-agnostic.

### Documents Section (deferred from MVP)

Originally scoped as an MVP section. Deferred to post-MVP after weighing scope: the section needs careful guardrails (no clinical interpretation, no AI advice on lab values) and is not required to validate the core POC thesis.

The longer-term vision is to redirect a behavior pattern — people pasting medical documents into general-purpose chat tools — into a place built for it: MediPal with proper safety guardrails, and eventually with skills authored by medical professionals rather than a generic LLM. That's a meaningful product direction but not a launch blocker.

- [ ] Basic document list (lab results, referral letters, appointment summaries)
- [ ] Paste or upload document text → AI plain-language summary
- [ ] Documents stored with date and type tag
- [ ] No clinical interpretation — summary only
- [ ] Future: skills/prompts authored by medical professionals for specific document types

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

### Platform Expansion (long-term vision)

The long-term goal is to remove "figure out how to install this on multiple devices" as a barrier for care partners and caregivers entirely. The intended path:

1. **Mobile-optimized web app (MVP-era).** The current track. Works on any device with a browser; no install friction.
2. **Native mobile app (post-MVP, near-term-ish).** iOS + Android, likely React Native or similar to share component logic with the web app. Enables push notifications, better offline behavior, and a real home-screen presence.
3. **Dedicated hardware (long-term).** A pair of tablet-like devices pre-loaded with MediPal — one for the caregiver, one for the care partner — already configured, paired, and ready to use out of the box. Removes the install / account-setup / device-pairing burden that excludes the least tech-comfortable users today.
4. **Native desktop apps (long-term).** macOS and Windows. For the desktop-primary cohort who would benefit from notifications, offline access, and tighter OS integration than a browser tab can provide.

Each step assumes the previous one is in use and informing the design of the next. The hardware step in particular is contingent on having enough real-world usage to know what the ideal pre-configured experience should look like.

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
