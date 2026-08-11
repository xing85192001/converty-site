# Features Research: Infrastructure Upgrade

**Research Date:** 2026-01-17
**Focus:** Expected infrastructure features for modern web applications

## Progressive Web App Features

### Table Stakes (Must Have)

#### Offline Calculator Functionality

**Description:** Calculators work without internet connection after first visit
**Complexity:** Medium
**Dependencies:** Service worker registration
**User Impact:** High - mobile users often have spotty connectivity
**Developer Impact:** Medium - requires service worker setup

**Implementation:**

- Service worker with CacheFirst for static assets
- NetworkFirst for calculator pages with offline fallback
- Offline indicator UI

#### Install Prompt

**Description:** Users can install app to home screen (iOS/Android)
**Complexity:** Simple
**Dependencies:** Web app manifest
**User Impact:** High - native app-like experience
**Developer Impact:** Low - just manifest.json

#### Mobile-Optimized UI

**Description:** Calculator inputs and results work well on phone screens
**Complexity:** Simple (already exists)
**Dependencies:** Responsive CSS (Tailwind)
**User Impact:** High - 50%+ mobile traffic expected
**Developer Impact:** Low - verify existing responsive design

### Differentiators (Nice to Have)

#### Calculation History (Out of Scope)

**Description:** Recent calculations saved locally for quick access
**Complexity:** Medium
**Reason Deferred:** Not critical for infrastructure phase

#### Share Results (Out of Scope)

**Description:** Share calculation results via social media/messaging
**Complexity:** Simple
**Reason Deferred:** URL state already enables sharing

---

## Developer Documentation

### Table Stakes (Must Have)

#### CHANGELOG

**Description:** Version history of changes following Keep a Changelog format
**Complexity:** Simple
**Dependencies:** git-cliff or conventional-changelog
**User Impact:** Low (mainly for contributors)
**Developer Impact:** High - essential for tracking evolution

#### CONTRIBUTING.md

**Description:** How to contribute code, coding standards, PR process
**Complexity:** Simple
**Dependencies:** None
**User Impact:** Low
**Developer Impact:** High - lowers barrier to contribution

#### Development Setup Guide

**Description:** Prerequisites, installation, running dev server, building
**Complexity:** Simple
**Dependencies:** None
**User Impact:** Low
**Developer Impact:** High - onboarding new developers

### Differentiators (Nice to Have)

#### Architecture Decision Records (ADRs)

**Description:** Document major technical decisions and rationale
**Complexity:** Simple
**Dependencies:** None
**User Impact:** None
**Developer Impact:** High - understand why choices were made

#### Calculator Pattern Documentation

**Description:** How to add a new calculator (Zustand store pattern)
**Complexity:** Simple
**Dependencies:** None
**User Impact:** None
**Developer Impact:** High - ensures consistency

---

## Type Safety

### Table Stakes (Must Have)

#### Strict TypeScript

**Description:** noImplicitAny, strictNullChecks enabled - zero any types
**Complexity:** High (74 calculators to fix)
**Dependencies:** None
**User Impact:** None (prevents bugs)
**Developer Impact:** High - catches errors at compile time

#### Type-Safe URL Parsing

**Description:** URL parameter parsing with validation (no unsafe coercion)
**Complexity:** Medium
**Dependencies:** Zod or similar validation library (optional)
**User Impact:** Low (prevents crashes from malformed URLs)
**Developer Impact:** Medium - better developer experience

### Differentiators (Nice to Have)

#### Runtime Type Validation (Out of Scope)

**Description:** Validate calculator inputs at runtime with Zod schemas
**Complexity:** Medium
**Reason Deferred:** TypeScript compile-time checks sufficient for now

---

## State Management

### Table Stakes (Must Have)

#### Consistent State Pattern

**Description:** All calculators use Zustand (remove useConverter dual pattern)
**Complexity:** High (74 calculators)
**Dependencies:** Zustand (already installed)
**User Impact:** None (internal improvement)
**Developer Impact:** High - single pattern to learn/maintain

#### URL Persistence

**Description:** Calculator state syncs to URL for shareable links
**Complexity:** Medium
**Dependencies:** Zustand persist middleware
**User Impact:** High - sharing calculations is core value
**Developer Impact:** Medium - consolidate existing implementation

#### Per-Store Debounce

**Description:** Each calculator has own debounce timer (fix global timer bug)
**Complexity:** Simple
**Dependencies:** None
**User Impact:** High (fixes concurrent calculator bug)
**Developer Impact:** Low - cleaner architecture

### Differentiators (Nice to Have)

#### State Debugging Tools (Out of Scope)

**Description:** Zustand DevTools for inspecting state
**Complexity:** Simple
**Reason Deferred:** Nice for development but not critical

---

## Code Quality

### Table Stakes (Must Have)

#### Zero Lint Errors

**Description:** Biome and ESLint pass with no errors
**Complexity:** Simple
**Dependencies:** Biome 2.3.11 (already installed)
**User Impact:** None
**Developer Impact:** Medium - cleaner codebase

#### Zero Format Errors

**Description:** Biome formatter produces consistent code style
**Complexity:** Simple
**Dependencies:** Biome 2.3.11
**User Impact:** None
**Developer Impact:** Low - automated formatting

#### Zero Security Warnings

**Description:** npm audit shows no vulnerabilities
**Complexity:** Medium (jsPDF upgrade)
**Dependencies:** Updated dependencies
**User Impact:** High (security)
**Developer Impact:** Medium - dependency management

### Differentiators (Nice to Have)

#### A11y Linting (Out of Scope - Future)

**Description:** Biome a11y rules enabled and passing
**Complexity:** Medium
**Reason Deferred:** Separate accessibility phase

#### Test Coverage (Out of Scope - Future)

**Description:** Vitest with calculator tests
**Complexity:** High
**Reason Deferred:** Separate testing phase

---

## Dependency Management

### Table Stakes (Must Have)

#### Updated jsPDF

**Description:** jsPDF upgraded from v4.0.0 (2018) to v2.5.2 (latest)
**Complexity:** Medium (API changes)
**Dependencies:** None
**User Impact:** Low (PDF export still works)
**Developer Impact:** Medium - security and maintenance

#### Locked Dependencies

**Description:** package-lock.json committed, npm ci in CI/CD
**Complexity:** Simple
**Dependencies:** None
**User Impact:** None
**Developer Impact:** Low - deterministic builds

### Differentiators (Nice to Have)

#### Automated Dependency Updates (Out of Scope)

**Description:** Dependabot or Renovate for automatic updates
**Complexity:** Simple
**Reason Deferred:** Manual review preferred for now

---

## Anti-Features (Deliberately NOT Building)

### Real-Time Collaboration

**Reason:** Adds massive complexity, not core value
**Alternative:** URL sharing already enables collaboration

### Analytics/Telemetry

**Reason:** Privacy-focused, static site ethos
**Alternative:** Consider privacy-respecting analytics in future (Plausible/Fathom)

### Server-Side Rendering

**Reason:** Static export constraint, all calculations client-side
**Alternative:** N/A - architecture decision

### External API Calls

**Reason:** Calculators are pure client-side
**Alternative:** N/A - core constraint

### Heavy Performance Optimizations

**Reason:** Beyond debounce fix, defer to separate phase
**Examples:** Code splitting, lazy loading, virtualization
**Alternative:** Address if performance becomes issue

---

## Feature Categories Summary

| Category     | Table Stakes                                  | Differentiators     | Anti-Features    |
| ------------ | --------------------------------------------- | ------------------- | ---------------- |
| PWA          | Offline, Install, Mobile                      | History, Share      | Real-time collab |
| Docs         | CHANGELOG, CONTRIBUTING, Setup                | ADRs, Pattern docs  | Auto-generated   |
| Type Safety  | Strict TS, Type-safe URLs                     | Runtime validation  | -                |
| State        | Zustand pattern, URL sync, Per-store debounce | DevTools            | Server state     |
| Code Quality | Zero lint/format/security errors              | A11y linting, Tests | -                |
| Dependencies | Updated jsPDF, Locked deps                    | Auto-updates        | -                |

---

## Prioritization

**P0 (Critical - Blocks Everything):**

- Strict TypeScript
- Consistent state pattern
- Zero lint/format errors

**P1 (High - Core Value):**

- PWA offline functionality
- URL persistence (consolidate)
- Per-store debounce fix
- Updated jsPDF

**P2 (Medium - Quality of Life):**

- CHANGELOG
- CONTRIBUTING.md
- Development setup guide
- Zero security warnings

**P3 (Nice to Have):**

- ADRs
- Calculator pattern docs
- Install prompt optimization

---

## Dependencies Between Features

```
TypeScript Strict
  ├─> State Migration (types must be correct first)
  ├─> URL Parsing (type-safe)
  └─> jsPDF Upgrade (type-safe usage)

State Migration
  ├─> URL Persistence Consolidation
  └─> Per-Store Debounce

PWA
  └─> Independent (can develop in parallel)

Documentation
  └─> Independent (can develop in parallel)
```

**Critical Path:** TypeScript → State Migration → Everything Else
