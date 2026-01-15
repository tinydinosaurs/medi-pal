# AI Context Guide

> **Purpose**: Quick reference for AI coding assistants (Cursor, GitHub Copilot, etc.) to understand this project instantly.

## 🎯 Project Summary

**What**: Medical care assistant for families caring for aging parents
**Why**: Reduce caregiver burnout, prevent medication errors, catch billing mistakes
**How**: AI-powered document analysis + family coordination + medication tracking
**Status**: POC (not production-ready, no real PHI)

## 🚦 Quick Start for AI Assistants

### When helping with this project, you should:

✅ **DO:**

-   Use TypeScript with proper interfaces
-   Follow existing shadcn/ui patterns
-   Keep medical data handling secure (even in POC)
-   Add comments explaining medical/healthcare context
-   Maintain the warm, supportive tone (this is for stressed caregivers)
-   Use functional components with hooks
-   Follow Tailwind utility-first approach

❌ **DON'T:**

-   Give medical advice in code comments or UI
-   Use `any` types (this handles medical data)
-   Add new dependencies without discussion
-   Make assumptions about medical terminology
-   Create security vulnerabilities (even in POC)

## 📋 Common Tasks & How to Do Them

### Adding a New Feature Component

```typescript
// Example: Creating a new medication reminder component
// Location: src/components/MedicationReminder.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface MedicationReminderProps {
	medication: Medication; // Use existing interfaces
	onDismiss: () => void;
}

export function MedicationReminder({
	medication,
	onDismiss,
}: MedicationReminderProps) {
	return (
		<Card className="border-amber-200">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="w-5 h-5 text-amber-600" />
					Time for {medication.name}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-slate-600 mb-4">
					{medication.dosage} at {medication.schedule}
				</p>
				<Button onClick={onDismiss}>Mark as Taken</Button>
			</CardContent>
		</Card>
	);
}
```

### Adding a New shadcn Component

```bash
pnpm dlx shadcn@latest add [component-name]
```

Then import and use:

```typescript
import { Alert, AlertDescription } from '@/components/ui/alert';
```

### Modifying Mock Data

All mock data lives at the top of `src/App.tsx`:

-   `MOCK_MEDICATIONS` - Array of medications
-   `MOCK_APPOINTMENTS` - Array of appointments
-   `MOCK_DOCUMENTS` - Array of documents
-   `MOCK_FAMILY_ACTIVITY` - Array of family actions

To add a field: Update the interface AND all mock data instances.

### Adding API Integration

Current pattern (in App.tsx):

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		model: 'claude-sonnet-4-20250514',
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }],
	}),
});
```

**Important**: This exposes API key in browser (POC only). Production needs backend proxy.

## 🏗 Architecture Quick Reference

### Current State Management

```
useState → Component State
useRef → DOM References
Props → Parent → Child
```

### Data Flow

```
User Action → Event Handler → setState → Re-render
```

### Component Hierarchy

```
App.tsx (main container)
├── Header (view toggle)
├── WelcomeBanner
├── MedicationList (left column)
├── AppointmentList (left column)
├── DocumentList (left column)
├── QuickActions (right column)
├── Alerts (right column)
└── FamilyActivity (right column, conditional)
```

## 🎨 Styling Patterns

### shadcn Component Customization

```typescript
// Correct way to style shadcn components
<Button
	className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600"
	variant="default"
>
	Click Me
</Button>
```

### Conditional Classes

```typescript
// Use cn() utility from src/lib/utils.ts
import { cn } from '@/lib/utils';

<div
	className={cn(
		'base-classes',
		condition && 'conditional-classes',
		variant === 'primary' && 'variant-classes'
	)}
/>;
```

### Color Scheme

-   Primary: emerald-500/600, teal-500/600 (healthcare, calming)
-   Neutral: slate-50/600/900
-   Alert: amber-50/700 (warnings)
-   Info: blue-50/700

## 🔑 Key Interfaces

```typescript
interface Medication {
	id: number;
	name: string;
	dosage: string;
	schedule: string; // "8:00 AM" format
	purpose: string; // Brief description
	taken: boolean;
}

interface Appointment {
	id: number;
	doctor: string;
	specialty: string;
	date: string; // ISO 8601: "2026-01-13"
	time: string; // "2:00 PM" format
	prepared: boolean;
}

interface Document {
	id: number;
	type: string; // "Lab Results" | "Bill" | "Appointment Summary"
	date: string; // ISO 8601
	name: string;
	reviewed: boolean;
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}
```

## 🚨 Important Guardrails

### Medical Safety

```typescript
// ❌ NEVER do this:
const advice = 'You should stop taking ' + medication.name;

// ✅ ALWAYS do this:
const guidance = 'Discuss ' + medication.name + ' with your doctor';
```

### Privacy

```typescript
// ❌ NEVER log PHI:
console.log(patient.medications);

// ✅ Log without PHI:
console.log('Medication count:', medications.length);
```

### AI Agent Prompts

```typescript
// Always include these instructions in AI prompts:
const systemPrompt = `You are a medical care assistant.
CRITICAL RULES:
- NEVER provide medical diagnoses or treatment advice
- NEVER tell someone to start, stop, or change medications
- Always suggest consulting their doctor for medical decisions
- Focus on organizing and explaining information`;
```

## 📦 Dependencies Explained

### Core Dependencies

-   **react** / **react-dom** - UI framework
-   **typescript** - Type safety
-   **vite** - Build tool
-   **tailwindcss** - Styling
-   **lucide-react** - Icons

### UI Dependencies

-   **@radix-ui/\*** - Accessible primitives (via shadcn)
-   **class-variance-authority** - Component variants
-   **clsx** + **tailwind-merge** - Class merging utility

### Future Dependencies (when needed)

-   **zustand** - State management (when App.tsx gets too big)
-   **react-hook-form** - Forms (for user input)
-   **zod** - Schema validation
-   **pdf-lib** / **pdf.js** - PDF parsing
-   **tesseract.js** - OCR for images

## 🔧 Common Fixes

### "Cannot find module '@/components/ui/...'"

```bash
# Make sure shadcn components are installed:
pnpm dlx shadcn@latest add card button dialog input checkbox badge

# Check tsconfig.json has:
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }

# Check vite.config.ts has:
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```

### "Tailwind classes not applying"

```bash
# Check tailwind.config.js content includes:
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]

# Restart dev server:
pnpm run dev
```

### "Type errors with shadcn components"

```bash
# Make sure you have:
pnpm add class-variance-authority clsx tailwind-merge
pnpm add -D @types/node
```

## 🎯 Feature Request Templates

### Adding New Mock Data Type

```typescript
// 1. Define interface
interface Insurance {
	id: number;
	provider: string;
	policyNumber: string;
	copay: number;
}

// 2. Create mock data
const MOCK_INSURANCE: Insurance[] = [
	{ id: 1, provider: 'Aetna', policyNumber: 'ABC123', copay: 30 },
];

// 3. Add to component state
const [insurance, setInsurance] = useState<Insurance[]>(MOCK_INSURANCE);

// 4. Create UI component
// See "Adding a New Feature Component" above
```

### Adding New AI Analysis Feature

```typescript
// 1. Create processing function
const processInsuranceCard = async (file: File) => {
	return {
		type: 'Insurance Card',
		message: `📋 Insurance card processed...`,
	};
};

// 2. Add to document upload handler
if (fileName.includes('insurance')) {
	response = await processInsuranceCard(file);
}

// 3. Update Document interface if needed
type: 'Lab Results' | 'Bill' | 'Appointment Summary' | 'Insurance Card';
```

## 📚 Learning Resources

If you need to understand:

-   **shadcn/ui**: https://ui.shadcn.com/docs
-   **Tailwind CSS**: https://tailwindcss.com/docs
-   **Radix UI**: https://www.radix-ui.com/docs
-   **Claude API**: https://docs.anthropic.com/claude/reference
-   **TypeScript**: https://www.typescriptlang.org/docs

## 🤖 Prompts for AI Assistants

### When starting a task:

"I'm working on the Caretaker medical care assistant. Check AI_CONTEXT.md and README.md. [Your specific task]"

### When stuck:

"This project uses shadcn/ui + Tailwind + TypeScript. The main code is in src/App.tsx. [Your issue]"

### When adding features:

"Follow the patterns in App.tsx. Use existing interfaces. Maintain medical safety guardrails. [Your feature]"

## ⚡ Quick Commands

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run preview          # Preview production build

# Dependencies
pnpm add [package]        # Add dependency
pnpm add -D [package]     # Add dev dependency
pnpm dlx shadcn@latest add [component]  # Add shadcn component

# Git
git checkout -b feature/[name]  # New feature branch
git commit -m "feat: [description]"  # Commit with conventional format
```

## 🎭 Project Tone & Voice

This app is for **stressed, exhausted caregivers**. The tone should be:

-   Warm and supportive (not clinical)
-   Clear and simple (not jargon-heavy)
-   Confident but humble (not overconfident about medical things)
-   Empathetic (acknowledge their burden)

**Examples:**

-   ✅ "I can help you understand these results, but your doctor should interpret them"
-   ❌ "This diagnosis indicates..."
-   ✅ "Looks like there might be a billing error. Want me to help you dispute it?"
-   ❌ "Error detected in billing system."

---

**Remember**: This handles sensitive medical data. Be extra careful with:

-   Security (even in POC)
-   Privacy (no logging PHI)
-   Medical disclaimers (never give medical advice)
-   Accessibility (keyboard nav, screen readers)

**When in doubt**: Ask before making architectural changes or adding dependencies.
