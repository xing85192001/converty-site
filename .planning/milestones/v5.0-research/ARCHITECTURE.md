# Architecture Research: Infrastructure Upgrade

**Research Date:** 2026-01-17
**Focus:** How to structure infrastructure improvements for existing Next.js application

## PWA Service Worker Architecture

### Static Export Considerations

**Status:** ✓ Recommended Pattern
**Confidence:** High

**Key Constraint:** Next.js static export (`output: 'export'`)

- No server-side features allowed
- Service worker must be in `public/` directory
- Registration happens client-side only
- Static files generated at build time

**Recommended Structure:**

```
public/
├── service-worker.js           # Custom SW (no dependencies)
├── manifest.json               # PWA manifest
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
src/
├── app/
│   └── layout.tsx             # Register SW here (client-side)
```

**Service Worker Registration Pattern:**

```typescript
// src/app/layout.tsx
"use client";

useEffect(() => {
  if (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    process.env.NODE_ENV === "production"
  ) {
    navigator.serviceWorker.register("/service-worker.js").then(
      (registration) => console.log("SW registered:", registration.scope),
      (err) => console.log("SW registration failed:", err)
    );
  }
}, []);
```

**Cache Strategy:**

```javascript
// public/service-worker.js
// CacheFirst for static assets (CSS, JS, images)
// NetworkFirst for calculators (with offline fallback)
// Runtime caching - no precaching needed for static export
```

**Why NOT next-pwa:**

- Package deprecated as of 2025
- Serwist requires Webpack (conflicts with Next.js 16 Turbopack)
- Manual implementation provides full control
- Compatible with static export constraint

**References:**

- [Build Next.js 16 PWA with offline support](https://blog.logrocket.com/nextjs-16-pwa-offline-support)
- [Next.js PWA in 10 Minutes](https://www.buildwithmatija.com/blog/turn-nextjs-16-app-into-pwa)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)

---

## State Management Migration Architecture

### Big Bang vs. Incremental Migration

**Decision:** Big Bang Migration
**Confidence:** Medium (higher risk, but justified for this project)

**Why Big Bang for Converty:**

1. **Dual patterns create confusion** - 74 calculators with useConverter, rest with Zustand
2. **Shared debounce bug** - Global timer affects all useConverter instances
3. **URL sync duplication** - Two implementations drift over time
4. **Small surface area** - Calculators are independent (no shared state between calculators)
5. **User-requested** - Explicit requirement to "remove useConverter entirely"

**Incremental Migration (Industry Standard):**

The recommended approach for large codebases is incremental migration:

- Migrate small portions at a time
- Old and new code coexist during transition
- Feature flags to switch between implementations
- Lower deployment risk

**Why Incremental Doesn't Fit Here:**

- Calculators are isolated (no cross-dependencies)
- useConverter is calculator-only (not used in shared components)
- Two patterns already coexist (it's the problem, not the solution)
- Migration can be done in parallel by category

**Migration Architecture:**

```
Phase 1: Create URL Sync Middleware
├── src/lib/middleware/url-sync.ts
└── Per-store debounce (fix global timer bug)

Phase 2: Migrate Calculators by Category
├── Math (42 calculators)
├── Finance (72 calculators)
├── Health (29 calculators)
└── DateTime (8 calculators)

Phase 3: Remove Legacy Hook
├── Delete src/hooks/use-converter.ts
└── Delete src/hooks/use-url-state.ts
```

**Per-Category Approach:**

Each category migration is atomic:

1. Migrate all calculators in category
2. Test category thoroughly
3. Commit category as single unit
4. Move to next category

**This combines big bang benefits (complete removal) with incremental safety (category-by-category testing).**

**References:**

- [Migrating to Modern Redux](https://redux.js.org/usage/migrating-to-modern-redux)
- [Zustand Migration Patterns](https://www.zignuts.com/blog/react-state-management-2025)
- [State Management in 2025](https://medium.com/@mernstackdevbykevin/state-management-in-2025-why-developers-are-ditching-redux-for-zustand-and-react-query-b5ecad4ff497)

---

## TypeScript Strict Mode Rollout

### Incremental Enablement Strategy

**Status:** ✓ Recommended
**Confidence:** High

**Critical Path:** Enable strictness incrementally (NOT all at once)

**Phase 1: Enable noImplicitAny**

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

This catches ~80% of type safety issues with minimal effort.

**Phase 2: Fix Core Infrastructure**

Priority order:

1. `src/hooks/use-converter.ts` (has eslint-disable comments)
2. `src/hooks/use-url-state.ts` (type coercion from URL strings)
3. URL sync middleware (new code, fix immediately)
4. Zustand store generics

**Phase 3: Fix Calculator Files**

Systematic file-by-file approach:

1. Run `npx tsc --noEmit` to see all errors
2. Fix calculators by category (same as state migration)
3. Track progress: compliant files list

**Phase 4: Enable Full Strict Mode**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

Only enable after fixing all noImplicitAny errors.

**Tools:**

- `typescript-strict-plugin` - Exempt existing code, strict for new code
- VS Code diagnostics - Real-time error feedback
- `npx tsc --noEmit` - Full project type check
- File list tracking - Generate compliant file list, prevent regressions

**Performance Optimization:**

```json
// tsconfig.json (for large codebases)
{
  "compilerOptions": {
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Why Incremental:**

TypeScript 7 (mid-2026) will enable strict-by-default as a breaking change. Teams that attempt whole-project strict mode migration get overwhelmed by hundreds of errors and abandon the effort. Incremental migration prevents this.

**References:**

- [Incremental Migration](https://kevinwil.de/incremental-migration/)
- [TypeScript Strict Option Guide](https://betterstack.com/community/guides/scaling-nodejs/typescript-strict-option/)
- [Migrating to Strict Mode at Early-Stage Startup](https://preetmishra.com/blog/migrating-to-typescript-strict-mode-at-an-early-stage-startup)
- [TypeScript 7 Progress](https://www.infoq.com/news/2026/01/typescript-7-progress/)

---

## Documentation Structure

### ADR (Architecture Decision Records) Organization

**Recommended:** `.planning/decisions/` directory
**Format:** Markdown ADRs with MADR template

```
.planning/
├── decisions/
│   ├── 001-zustand-migration.md
│   ├── 002-pwa-service-worker.md
│   ├── 003-typescript-strict.md
│   └── 004-jspdf-upgrade.md
```

**ADR Template:**

```markdown
# ADR-001: Migrate to Zustand State Management

## Status

Accepted

## Context

74 calculators use legacy useConverter hook with global debounce timer bug.
URL sync logic duplicated between useConverter and Zustand stores.

## Decision

Big bang migration by category: migrate all 74 calculators, remove useConverter entirely.

## Consequences

**Positive:**

- Single state management pattern
- Fixes concurrent calculator bug
- No dual patterns to maintain

**Negative:**

- Higher migration risk (mitigated by category-level testing)
- All calculators changed at once

## Alternatives Considered

- Incremental migration (keep useConverter for some calculators)
- Rejected: Dual patterns ARE the problem
```

### CHANGELOG Structure

**Format:** Keep a Changelog standard
**Location:** `CHANGELOG.md` in project root

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- PWA support with offline calculator functionality
- Service worker for static asset caching
- Web manifest for install prompt

### Changed

- Migrated 74 calculators from useConverter to Zustand
- Consolidated URL sync middleware
- Upgraded jsPDF from v4.0.0 to v2.5.2

### Fixed

- Global debounce timer bug (now per-store instance)
- Type safety with strict TypeScript enabled

### Removed

- useConverter hook (replaced by Zustand stores)

## [Previous versions...]
```

**Backfilling:**

Recent commits to include:

- "feat: add duration converter and fix biome lint errors"
- "fix: translate age calculator results to all locales"
- "refactor: split converters.ts into per-category registry files"
- "refactor: migrate 60 calculators from useConverter hook to Zustand stores"

### CONTRIBUTING.md Structure

**Sections:**

1. **Development Setup** - Prerequisites, installation, running dev server
2. **Coding Standards** - TypeScript, Biome linting, Tailwind CSS
3. **Calculator Pattern** - How to add a new calculator (Zustand store pattern)
4. **Pull Request Process** - Branch naming, commit messages, review guidelines
5. **Code Review Guidelines** - What reviewers look for

**Calculator Pattern Documentation:**

````markdown
## Adding a Calculator

### 1. Create Zustand Store

```typescript
// src/stores/[category]/[name]-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { urlSync } from "@/lib/middleware/url-sync";

export const useMyCalculatorStore = create(
  urlSync(
    persist(
      immer((set) => ({
        // state
        input: 0,
        result: 0,

        // actions
        setInput: (value: number) =>
          set((state) => {
            state.input = value;
            state.result = calculate(value);
          }),
      })),
      { name: "my-calculator" }
    )
  )
);
```
````

### 2. Create Calculator Component

Use the store in your component...

```

---

## Build Order Dependencies

**Critical Path:**

```

1. TypeScript strict mode (blocks everything else)
   ├─> Fix use-converter.ts first
   ├─> Fix use-url-state.ts
   └─> Create url-sync middleware (type-safe)

2. State migration (touches all calculators)
   ├─> Create url-sync middleware
   ├─> Migrate calculators by category
   └─> Remove use-converter.ts

3. PWA (independent, can run in parallel)
   ├─> Create service-worker.js
   ├─> Create manifest.json
   └─> Register SW in layout.tsx

4. Documentation (can run in parallel)
   ├─> CHANGELOG.md (backfill recent changes)
   ├─> CONTRIBUTING.md
   ├─> ADRs for key decisions
   └─> Development setup guide

5. jsPDF upgrade (isolated change)
   ├─> npm install jspdf@latest
   ├─> Update pdf-export.ts
   └─> Test PDF generation

```

**Parallelization Opportunities:**

- PWA implementation can happen while state migration is in progress
- Documentation can be written while code changes are being made
- jsPDF upgrade can happen independently

**Integration Points:**

- URL sync middleware must exist before any calculator migration starts
- TypeScript strict mode should be enabled before creating new middleware
- ADRs should be written as decisions are made (not after)

---

## Component Boundaries

**What Changes:**

- `src/hooks/use-converter.ts` → Delete
- `src/hooks/use-url-state.ts` → Delete
- `src/stores/` → Add stores for 74 calculators
- `src/lib/middleware/url-sync.ts` → Create
- All calculator components → Update to use Zustand stores
- `public/service-worker.js` → Create
- `public/manifest.json` → Create
- Root `CHANGELOG.md` → Create
- Root `CONTRIBUTING.md` → Create
- `.planning/decisions/` → Create with ADRs

**What Stays the Same:**

- `src/components/ui/` → No changes to base components
- `src/components/converter/` → InputField, OutputDisplay, ResultGrid unchanged
- `src/lib/converters/` → Pure calculation functions unchanged
- `src/lib/registry/` → Calculator metadata unchanged
- `src/i18n/` → Internationalization unchanged
- `next.config.ts` → Static export unchanged

**Critical Constraint:**

ALL changes must preserve static export compatibility. No server-side features can be added.

---

## Summary

| Dimension | Approach | Rationale |
|-----------|----------|-----------|
| PWA | Manual service worker in public/ | next-pwa deprecated, Turbopack compatibility |
| State Migration | Big bang by category | Remove dual patterns, isolated calculators |
| TypeScript | Incremental strict enablement | noImplicitAny first, prevent overwhelm |
| Documentation | ADRs + CHANGELOG + CONTRIBUTING | Standard industry practices |
| Build Order | TypeScript → State → PWA/Docs | Dependencies require sequence |

**Key Insight:**

This is a **brownfield refactor** of an existing application, not a greenfield build. The architecture must preserve all 200+ existing calculators while eliminating technical debt. The big bang state migration is justified because calculators are isolated and dual patterns are the problem.
```
