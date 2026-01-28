# Medi-Pal Implementation

## Files Created

```
src/lib/
├── ai/
│   ├── index.ts              # Main export for all AI utilities
│   ├── azure-foundry.ts      # Azure AI Foundry API wrapper
│   ├── prompts.ts            # All system prompts (caretaker, bills, safety)
│   └── safety/
│       ├── index.ts          # Safety module exports
│       ├── output-validator.ts   # Validates AI responses for dangerous content
│       ├── input-sanitizer.ts    # Strips PII before sending to AI
│       ├── safe-chat.ts          # Main entry point combining all safety layers
│       └── audit-log.ts          # Local-only interaction logging
├── constants/
│   └── disclaimers.ts        # Legal disclaimer text
.env.example                  # Template for Azure credentials
```

---

## Next Steps Checklist

### Immediate (Before Coding Features)

- [x] **Copy `.env.example` to `.env.local`** and add your Azure AI Foundry endpoint + API key
- [x] **Test AI connection** - create a simple API route to verify Azure calls work
- [x] **Add `.env.local` to `.gitignore`** (should be there by default, but verify)

### Phase 1: Medication Management (from medtracker)

- [x] Create `src/types/index.ts` with TypeScript interfaces
- [x] Port `scheduling.ts` utility (from scheduling.js)
- [x] Port `timeWindows.ts` utility (from timeWindows.js)
- [x] Port `storage.ts` utility (from storage.js)
- [x] Create `useMedications` hook
- [x] Create `useDoseLog` hook
- [x] Port `TodayView` component
- [x] Port `MedForm` component
- [x] Port `MedCard` component
- [x] Port `AllMedsView` component
- [x] Port `HistoryView` component
- [x] Create `MedListCard` component (serves different purpose than MedCard)

### Phase 2: Bill Analysis (from bill-helper)

- [ ] Create route.ts - general chat endpoint
- [ ] Create route.ts - bill analysis endpoint
- [ ] Create route.ts - script generation
- [ ] Create route.ts - question generation
- [ ] Create route.ts - scam detection
- [ ] Create bill analysis UI components

### Phase 3: UI & Integration

- [ ] Create main layout with navigation
- [ ] Create onboarding/consent flow
- [ ] Add persistent safety banner component
- [ ] Add emergency resources component
- [ ] Create chat interface component
- [ ] Wire up all views together

### Phase 4: PWA & Polish

- [ ] Add `public/manifest.json`
- [ ] Add app icons
- [ ] Configure next-pwa for offline support
- [ ] Add text size adjustment
- [ ] Add caregiver PIN mode
- [ ] Test offline functionality
