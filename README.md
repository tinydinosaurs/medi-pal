# 🏥 Caretaker - Medical Care Assistant

A proof-of-concept application helping families manage medical care for aging parents. Built to reduce caregiver burnout by organizing medications, interpreting medical documents, and coordinating family support.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)

## 📋 Table of Contents

-   [Problem Statement](#problem-statement)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Development Guide](#development-guide)
-   [Architecture Overview](#architecture-overview)
-   [Roadmap](#roadmap)
-   [Contributing](#contributing)

## 🎯 Problem Statement

**The Challenge:**
Elder millennials and Gen X are increasingly caring for aging parents while raising children—the "sandwich generation." Medical care management is complex, stressful, and leads to:

-   **Medication errors**: Forgotten doses, lost bottles, dangerous interactions
-   **Information overload**: Multiple providers with conflicting instructions
-   **Billing mistakes**: Common errors that cost hundreds or thousands
-   **Caregiver exhaustion**: 24/7 mental load, memory issues from stress
-   **Privacy risks**: Desperate caregivers paste sensitive data into ChatGPT

**Our Solution:**
A purpose-built productivity assistant for medical care that:

-   Organizes information without replacing medical professionals
-   Provides AI-powered insights while respecting privacy
-   Enables family coordination without surveillance
-   Reduces cognitive load for overwhelmed caregivers
-   Doesn't compromises personal information
-   Has solid guardrails to prevent the agent from giving medical advice or interpretation

## ✨ Features

### Current (POC)

-   **📋 Medication Tracking**

    -   Daily medication checklist with adherence monitoring
    -   Visual confirmation with checkboxes
    -   Real-time adherence percentage

-   **📄 Document Intelligence**

    -   AI-powered analysis of lab results, bills, and appointment notes
    -   Plain-language explanations of medical jargon
    -   Automatic error detection in medical bills (duplicate charges, insurance mistakes)

-   **💬 Caretaker Agent**

    -   Conversational AI assistant using Claude API
    -   Answers questions about medications, appointments, test results
    -   Strict guardrails: NO medical advice, only organization & interpretation

-   **👨‍👩‍👧 Family Collaboration**

    -   Toggle between Patient and Family views
    -   Activity feed showing family member actions
    -   Permission-based access (future: configurable)

-   **⚠️ Smart Alerts**
    -   Proactive reminders for prescription refills
    -   Upcoming appointment notifications

### Planned

-   Persistent storage with encryption
-   Real PDF/image text extraction
-   Pharmacy integration for refills
-   Calendar sync for appointments
-   Mobile app (React Native)
-   Smart pill box hardware integration

## 🛠 Tech Stack

### Core

-   **React 18.3** - UI framework
-   **TypeScript 5.6** - Type safety
-   **Vite 6.0** - Build tool and dev server

### Styling

-   **Tailwind CSS 3.4** - Utility-first CSS
-   **shadcn/ui** - Accessible component library (Radix UI primitives)
-   **Lucide React** - Icon library

### AI

-   **Claude API (Sonnet 4)** - Document analysis and chat
-   **Anthropic SDK** - API integration

### State Management

-   **React Hooks** - useState, useEffect, useRef
-   Future: Zustand or Context API for complex state

### Future Additions

-   **PDF.js** - PDF text extraction
-   **Tesseract.js** - OCR for scanned documents
-   **React Native** - Mobile apps
-   **Supabase / Firebase** - Backend and auth

## 📁 Project Structure

```
medi-pal/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   │       ├── card.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── checkbox.tsx
│   │       └── badge.tsx
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn helper)
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles + Tailwind
├── public/                  # Static assets
├── .env.local               # Environment variables (not in git)
├── components.json          # shadcn/ui configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

### Key Files Explained

**`src/App.tsx`** (Main Component - ~800 lines)

-   Contains all application logic (currently monolithic)
-   Manages state for medications, documents, chat messages
-   Handles file uploads and AI processing
-   Renders all UI sections

**Future refactor**: Break into smaller components:

-   `components/MedicationList.tsx`
-   `components/AppointmentCard.tsx`
-   `components/DocumentUpload.tsx`
-   `components/ChatInterface.tsx`
-   `hooks/useMedications.ts`
-   `hooks/useChat.ts`

**`src/lib/utils.ts`**

-   `cn()` function: Merges Tailwind classes using clsx + tailwind-merge
-   Essential for conditional styling with shadcn components

**`components.json`**

-   shadcn/ui configuration
-   Defines component paths, styling approach, color scheme
-   Used by `shadcn` CLI to generate components

## 🚀 Getting Started

### Prerequisites

-   **Node.js 18+** (recommend 20+)
-   **pnpm** (recommended) or npm
-   **Claude API key** from [console.anthropic.com](https://console.anthropic.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/medi-pal.git
cd medi-pal

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Claude API key
```

### Environment Variables

Create `.env.local`:

```bash
# Claude API Configuration
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here

# Future: Add these when needed
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
```

**Important**: Never commit `.env.local` to git!

### Run Development Server

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
pnpm run build
pnpm run preview  # Test production build locally
```

## 👨‍💻 Development Guide

### Adding New Features

1. **Adding a new shadcn component:**

    ```bash
    pnpm dlx shadcn@latest add [component-name]
    # Example: pnpm dlx shadcn@latest add alert
    ```

2. **Installing new dependencies:**
    ```bash
    pnpm add [package-name]
    # Dev dependencies:
    pnpm add -D [package-name]
    ```

### Code Conventions

**TypeScript:**

-   Use interfaces for data models
-   Avoid `any` types
-   Use proper event types (`React.ChangeEvent`, etc.)

**Components:**

-   Functional components with hooks
-   Props should be typed with interfaces
-   Use `React.FC` sparingly (not required)

**Styling:**

-   Use Tailwind utility classes
-   shadcn components for complex UI
-   Custom classes in index.css only when necessary
-   Use `cn()` utility for conditional classes

**State Management:**

-   useState for component-local state
-   useRef for DOM references
-   Future: Context API for global state

### Mock Data Structure

All mock data is defined at the top of `App.tsx`:

```typescript
interface Medication {
	id: number;
	name: string;
	dosage: string;
	schedule: string;
	purpose: string;
	taken: boolean;
}

interface Appointment {
	id: number;
	doctor: string;
	specialty: string;
	date: string; // ISO 8601 format
	time: string;
	prepared: boolean;
}

interface Document {
	id: number;
	type: string; // "Lab Results" | "Bill" | "Appointment Summary"
	date: string; // ISO 8601 format
	name: string;
	reviewed: boolean;
}
```

**To replace with real data:**

1. Create a backend API or use Supabase
2. Replace mock constants with API calls
3. Add loading states and error handling
4. Implement proper data validation

## 🏗 Architecture Overview

### Current Architecture (POC)

```
User Interface (React)
    ↓
State Management (React Hooks)
    ↓
Business Logic (in App.tsx)
    ↓
Claude API (direct fetch calls)
```

**Pros**: Simple, fast to build
**Cons**: Not scalable, no separation of concerns

### Planned Architecture (Production)

```
┌─────────────────────────────────────┐
│   Mobile App (React Native)         │
│   Web App (React)                   │
└─────────────────┬───────────────────┘
                  │
        ┌─────────▼─────────┐
        │   API Layer       │
        │   (Backend)       │
        └─────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐  ┌────▼────┐  ┌────▼─────┐
│ Claude │  │Database │  │ External │
│  API   │  │(Supabase│  │ Services │
│        │  │/Firebase│  │(pharmacy)│
└────────┘  └─────────┘  └──────────┘
```

### Key Design Decisions

**1. Why shadcn/ui instead of Material UI or Chakra?**

-   Copy-paste components (we own the code)
-   Built on Radix UI (excellent accessibility)
-   Highly customizable (doesn't look generic)
-   Lightweight (only include what you use)

**2. Why Vite instead of Next.js?**

-   This is primarily a client-side app (no SSR needed)
-   Faster dev server
-   Simpler deployment (static files)
-   Next.js would be overkill for POC

**3. Why direct Claude API calls instead of a backend?**

-   POC speed (no backend setup)
-   **Security concern**: API key exposed in browser
-   **Production**: Move to backend proxy or Anthropic's client SDK

**4. Why TypeScript?**

-   Catch errors at compile time
-   Better IDE support
-   Self-documenting code
-   Required by shadcn/ui

### Data Flow: Document Upload

```
1. User selects file
   ↓
2. handleFileUpload() triggered
   ↓
3. File analyzed (mock: name-based routing)
   ↓
4. processLabResults() / processBill() / processAppointment()
   ↓
5. Mock response generated
   ↓
6. Documents state updated
   ↓
7. Chat messages updated with results
   ↓
8. UI re-renders
```

**Future**: Replace mock processing with actual PDF/image extraction + Claude API analysis

### Data Flow: Chat Message

```
1. User types message
   ↓
2. handleSendMessage() triggered
   ↓
3. Message added to chatMessages state
   ↓
4. fetch() call to Claude API
   ↓
5. Response parsed and added to chatMessages
   ↓
6. UI scrolls to new message
```

## 🗺 Roadmap

### Phase 1: MVP (Current POC) ✅

-   [x] Basic UI with medication tracking
-   [x] Document upload interface
-   [x] AI chat with Claude
-   [x] Family view toggle
-   [x] Mock document processing

### Phase 2: Core Features (Next 1-2 months)

-   [ ] Persistent storage (local or cloud)
-   [ ] Real PDF text extraction
-   [ ] User authentication
-   [ ] Component refactoring (break up App.tsx)
-   [ ] Custom hooks for business logic
-   [ ] TypeScript interfaces in separate files

### Phase 3: Enhanced Intelligence (2-3 months)

-   [ ] Medication interaction checking
-   [ ] Bill error detection (real algorithm)
-   [ ] Appointment preparation workflow
-   [ ] Medication reconciliation across providers
-   [ ] Export reports for doctors

### Phase 4: Integrations (3-6 months)

-   [ ] Pharmacy API integration
-   [ ] Calendar sync (Google Calendar, Apple Calendar)
-   [ ] Patient portal import (Epic, Cerner)
-   [ ] Insurance eligibility checks
-   [ ] SMS/email reminders

### Phase 5: Mobile & Hardware (6-12 months)

-   [ ] React Native mobile app
-   [ ] Smart pill box prototype
-   [ ] Voice interface (Alexa, Google Home)
-   [ ] Health device integration (BP monitors, glucose meters)

### Future Considerations

-   HIPAA compliance audit
-   Healthcare provider partnerships
-   Medicare Advantage integration
-   Multi-language support
-   Accessibility improvements (WCAG AAA)

## 🎨 Design System

### Color Palette

```css
/* Primary (Emerald/Teal) */
--emerald-50:  #ecfdf5
--emerald-500: #10b981
--emerald-600: #059669
--teal-500:    #14b8a6
--teal-600:    #0d9488

/* Neutrals (Slate) */
--slate-50:    #f8fafc
--slate-600:   #475569
--slate-900:   #0f172a

/* Alerts */
--amber-50:    #fffbeb
--amber-700:   #b45309
--blue-50:     #eff6ff
--blue-700:    #1d4ed8
```

### Typography

-   Font Family: System font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", etc.)
-   Headings: 700 weight
-   Body: 400 weight
-   Emphasis: 600 weight

### Spacing Scale

Following Tailwind's default: 4px base unit

-   xs: 0.5rem (8px)
-   sm: 0.75rem (12px)
-   md: 1rem (16px)
-   lg: 1.5rem (24px)
-   xl: 2rem (32px)

## 🔒 Security & Privacy

### Current Security Posture (POC)

⚠️ **Known Issues:**

-   Claude API key exposed in browser (client-side calls)
-   No authentication
-   No data encryption
-   Mock data only (no real PHI)

### Production Security Requirements

**Must Have:**

1. **Backend API** - Never expose API keys
2. **Authentication** - User accounts with secure auth (OAuth, magic links)
3. **Encryption** - All PHI encrypted at rest and in transit
4. **Access Control** - Role-based permissions (patient, caregiver, admin)
5. **Audit Logs** - Track all data access
6. **HIPAA Compliance** - If handling real medical data

**Privacy Principles:**

-   Patient controls all data sharing
-   Family members see only what patient permits
-   No data sold or used for training
-   Right to export and delete all data
-   Transparent about what AI sees

## 🧪 Testing

### Current Status

-   ⚠️ No tests yet (POC phase)

### Testing Strategy (Future)

```bash
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

**Priority testing areas:**

1. Medication adherence calculations
2. Document processing logic
3. AI response parsing
4. Permission/access control
5. Data encryption/decryption

## 📝 Contributing

### Development Workflow

1. **Create a feature branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make changes**

    - Follow code conventions
    - Add TypeScript types
    - Update this README if needed

3. **Test locally**

    ```bash
    pnpm run dev
    # Test your changes
    ```

4. **Commit with meaningful messages**

    ```bash
    git commit -m "feat: Add medication reminder notifications"
    # Use conventional commits: feat, fix, docs, style, refactor, test, chore
    ```

5. **Push and create PR**
    ```bash
    git push origin feature/your-feature-name
    ```

### Code Review Checklist

-   [ ] TypeScript types are correct
-   [ ] No console.errors or warnings
-   [ ] Responsive design works on mobile
-   [ ] Accessibility considerations (keyboard nav, ARIA labels)
-   [ ] No hardcoded sensitive data
-   [ ] Comments explain "why" not "what"

## 🐛 Known Issues

1. **API Key Security**: Claude API key is exposed in browser (POC only)
2. **No Persistence**: Data lost on refresh
3. **Mock Processing**: Document analysis is simulated, not real
4. **No Mobile Optimization**: UI works but not optimized for small screens
5. **Large App.tsx**: ~800 lines, needs refactoring

## 📚 Additional Documentation

See also:

-   `ARCHITECTURE.md` - Detailed architecture decisions (create this for deep dives)
-   `API.md` - API integration documentation (when backend exists)
-   `DEPLOYMENT.md` - Deployment guide for various platforms
-   `CONTRIBUTING.md` - Detailed contribution guidelines

## 💬 Support

-   **Issues**: [GitHub Issues](https://github.com/yourusername/medi-pal/issues)
-   **Discussions**: [GitHub Discussions](https://github.com/yourusername/medi-pal/discussions)
-   **Email**: your-email@example.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

-   Built with ❤️ for all the sandwich generation caregivers
-   Inspired by real stories of caregiver exhaustion and medical billing nightmares
-   Thanks to Anthropic for Claude API access
-   shadcn for the amazing component library

---

**Current Status**: Proof of Concept (POC)
**Last Updated**: January 2026
**Maintainer**: It's Dana!
