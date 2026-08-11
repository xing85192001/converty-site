# Three-Layer Architecture: Converter / Component / Page

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Each calculator in Converty has three concerns: (1) the mathematical calculation logic, (2) the interactive UI with state management, and (3) the Next.js page wrapper with metadata and SEO. Early implementations mixed these concerns in single files, making calculations hard to test in isolation and UI logic hard to reason about.

How should calculator code be organized across files?

## Decision Drivers

- **Testability** — Calculation logic should be pure functions with no React dependency
- **Reusability** — Multiple UI components could potentially share a calculation function
- **Separation of concerns** — Math, UI, and routing are distinct responsibilities
- **Contributor clarity** — New contributors should immediately know where to find/add each concern
- **Next.js static export** — Pages must be server components for metadata generation; calculators must be client components for interactivity

## Considered Options

1. **Three-layer split (converter / component / page)** — One file per layer, strict boundaries
2. **Two-layer (logic in component)** — Calculation inside the React component
3. **Single-file calculator** — Everything in `page.tsx` (Pages Router style)
4. **Shared calculation library** — All calculators in one monolithic library file

## Decision Outcome

Chosen option: **"Three-layer split"** because it enforces pure function calculations (no React imports in logic files), allows the Next.js page to remain a server component for metadata, and provides a repeatable template that the `/new-calculator` skill automates.

### Layer Definitions

| Layer | Location | Type | Responsibility |
|-------|----------|------|----------------|
| **Converter** | `src/lib/converters/[category]/[name].ts` | Pure TypeScript | Calculation logic, input validation, type definitions |
| **Component** | `src/app/[locale]/[category]/[name]/[name]-calculator.tsx` | Client Component | Zustand store, UI rendering, user interaction |
| **Page** | `src/app/[locale]/[category]/[name]/page.tsx` | Server Component | Metadata, `generateStaticParams`, layout wrapper |

### Consequences

**Positive:**

- **Pure functions:** Converter files have zero React imports; calculations testable with plain `node`
- **Server component pages:** `page.tsx` can call `getTranslations()` for SEO metadata without JS bundle
- **Zustand stores in components:** State logic colocated with UI, not polluting the calculation layer
- **Automated scaffolding:** `/new-calculator` skill creates all three files + registry + translations
- **Predictable file locations:** Any developer can find a calculator's math at a glance

**Negative:**

- **3 files minimum per calculator:** Even simple calculators need all three files
- **Directory depth:** `src/app/[locale]/math/percentage/percentage-calculator.tsx` is verbose
- **Import discipline required:** Accidentally importing React into a converter file breaks the pattern

**Neutral:**

- **Registry required:** Each calculator must be registered in `src/lib/registry/converters.ts`
- **Locale routing duplication:** `generateStaticParams()` in every page (mitigated by identical boilerplate)

### Layer Boundaries

```
┌─────────────────────────────────────────────────┐
│  page.tsx (Server Component)                    │
│  - generateStaticParams()                       │
│  - generateMetadata()                           │
│  - Renders <NameCalculator /> (no props)        │
└───────────────┬─────────────────────────────────┘
                │ renders
┌───────────────▼─────────────────────────────────┐
│  name-calculator.tsx (Client Component)         │
│  - "use client" directive                       │
│  - useStore() from createCalculatorStore        │
│  - Form inputs, result display, export buttons  │
│  - Calls converter functions for calculation    │
└───────────────┬─────────────────────────────────┘
                │ calls (pure functions only)
┌───────────────▼─────────────────────────────────┐
│  name.ts (Pure TypeScript)                      │
│  - Input/Result type definitions                │
│  - calculateName(input: Input): Result          │
│  - validateName(input: Input): Errors           │
│  - No React, no side effects, no state          │
└─────────────────────────────────────────────────┘
```

## Links

- **Guide:** `docs/CALCULATOR_GUIDE.md` — step-by-step implementation guide
- **Skill:** `/new-calculator` — scaffolds all three layers automatically
- **Skill:** `/validate-calculator` — verifies all three layers are correctly wired
- **Example:** `src/lib/converters/math/percentage.ts` (converter)
- **Example:** `src/app/[locale]/math/percentage/percentage-calculator.tsx` (component)
- **Example:** `src/app/[locale]/math/percentage/page.tsx` (page)
