# Phase 5: Documentation - Research

**Researched:** 2026-01-17
**Domain:** Technical documentation, changelog management, architecture decision records
**Confidence:** HIGH

## Summary

Phase 5 focuses on creating comprehensive contributor documentation following established open-source standards. The primary tasks involve creating a CHANGELOG.md file following Keep a Changelog 1.1.0 format, updating CONTRIBUTING.md to document the current Zustand store pattern (replacing the outdated useState example), creating Architecture Decision Records (ADRs) using MADR 4.0.0 format, and ensuring development setup guides are complete and tested.

The project already has a solid CONTRIBUTING.md foundation but needs updates to reflect the Phase 3 Zustand migration. No CHANGELOG.md exists, and ADRs need to be created to document key architectural decisions made during Phases 1-4.

**Primary recommendation:** Use Keep a Changelog 1.1.0 for CHANGELOG.md, MADR 4.0.0 for ADRs, and update CONTRIBUTING.md with working Zustand examples from the existing codebase (age-calculator.tsx is an excellent reference implementation).

## Standard Stack

The established tools and formats for technical documentation:

### Core

| Tool/Format       | Version    | Purpose                       | Why Standard                                                             |
| ----------------- | ---------- | ----------------------------- | ------------------------------------------------------------------------ |
| Keep a Changelog  | 1.1.0      | CHANGELOG.md structure        | De facto industry standard, human-readable, supports Semantic Versioning |
| MADR              | 4.0.0      | Architecture Decision Records | Lightweight, Markdown-based, minimal overhead, well-documented           |
| Markdown          | CommonMark | All documentation files       | Universal format, GitHub-rendered, version-controllable                  |
| GitHub Guidelines | 2026       | CONTRIBUTING.md structure     | Official recommendations, high visibility in GitHub UI                   |

### Supporting

| Tool                  | Version      | Purpose                      | When to Use                                     |
| --------------------- | ------------ | ---------------------------- | ----------------------------------------------- |
| markdownlint          | Latest       | Markdown consistency         | Optional, for enforcing formatting standards    |
| Node.js engines field | package.json | Specify version requirements | Already present, document in setup guide        |
| Conventional Commits  | 1.0.0        | Optional commit format       | Not required, but can structure commit messages |

### Alternatives Considered

| Instead of       | Could Use        | Tradeoff                                                            |
| ---------------- | ---------------- | ------------------------------------------------------------------- |
| Keep a Changelog | Common Changelog | Common Changelog is stricter subset, Keep a Changelog more flexible |
| MADR             | ADR Tools        | ADR Tools requires CLI tool, MADR is template-based (simpler)       |
| Markdown         | reStructuredText | Markdown has better GitHub integration                              |

**Installation:**
No installation needed - all formats use Markdown and standard text files.

## Architecture Patterns

### Recommended Directory Structure

```
converty/
├── CHANGELOG.md              # Keep a Changelog format
├── CONTRIBUTING.md           # Updated with Zustand pattern
├── README.md                 # Exists, links to CONTRIBUTING
├── .planning/
│   └── decisions/            # ADRs (NEW)
│       ├── 0001-zustand-migration.md
│       ├── 0002-pwa-service-worker.md
│       ├── 0003-typescript-strict.md
│       └── 0004-jspdf-upgrade.md
└── docs/                     # Future: ARCHITECTURE.md
```

### Pattern 1: Keep a Changelog Structure

**What:** Standardized changelog format with versioned sections and categorized changes
**When to use:** Every project maintaining version history

**Example:**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Feature description

### Changed

- Change description

### Fixed

- Bug fix description

## [1.0.0] - 2026-01-17

### Added

- Initial release with 60+ calculators
- PWA support with offline capability
- Internationalization (en, fr, de, it)
```

**Source:** <https://keepachangelog.com/en/1.1.0/>

**Key principles:**

- Six standard categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Reverse chronological order (newest first)
- ISO 8601 date format (YYYY-MM-DD)
- Include [Unreleased] section for tracking upcoming changes
- Link to Semantic Versioning for version numbering

### Pattern 2: MADR Template Structure

**What:** Markdown Architecture Decision Records with standardized sections
**When to use:** Documenting significant architectural choices that impact future development

**Example:**

```markdown
# Use Zustand for Calculator State Management

- Status: accepted
- Date: 2026-01-15
- Deciders: [team/individual]

## Context and Problem Statement

Calculators need shareable URLs and predictable state management. Previous implementation used useState with manual URL sync, leading to code duplication across 60+ calculators.

## Decision Drivers

- Need URL state synchronization for shareable calculator links
- Want to eliminate boilerplate in calculator components
- Must maintain type safety with TypeScript strict mode
- Prefer minimal bundle size impact

## Considered Options

1. Zustand with custom middleware
2. Redux Toolkit with RTK Query
3. Jotai with URL persistence
4. Continue with useState pattern

## Decision Outcome

Chosen option: "Zustand with custom middleware" because it provides the smallest bundle size (1.2KB), allows custom URL sync middleware, and integrates seamlessly with TypeScript.

### Consequences

- Good: Centralized state logic, type-safe, minimal boilerplate
- Good: Custom createCalculatorStore factory eliminates code duplication
- Good: URL sync middleware provides shareable links automatically
- Bad: Learning curve for contributors unfamiliar with Zustand
- Neutral: Requires migration of existing useState-based calculators

## Pros and Cons of the Options

### Zustand with custom middleware

- Good: Tiny bundle size (1.2KB)
- Good: No providers needed
- Good: Easy to test pure functions
- Bad: Less ecosystem tooling than Redux

### Redux Toolkit

- Good: Mature ecosystem, Redux DevTools
- Bad: Larger bundle size (~20KB)
- Bad: More boilerplate required

[Additional options detailed similarly...]
```

**Source:** <https://github.com/adr/madr>

**MADR 4.0.0 template variations:**

- `adr-template.md` - Full template with explanatory comments
- `adr-template-minimal.md` - Only mandatory sections with comments
- `adr-template-bare.md` - All sections, no comments
- `adr-template-bare-minimal.md` - Minimal sections, no comments

**Mandatory sections:**

- Title (brief noun phrase)
- Status (proposed, accepted, rejected, deprecated, superseded)
- Context and Problem Statement
- Decision Outcome

**Optional but recommended:**

- Decision Drivers
- Considered Options
- Pros and Cons of the Options
- Consequences

### Pattern 3: Zustand Calculator Store Documentation

**What:** Document the createCalculatorStore pattern for future calculators
**When to use:** When adding new calculators to the project

**Current implementation (src/stores/calculator-store.ts):**

```typescript
const useAgeStore = createCalculatorStore<AgeInput, AgeResult>({
  name: "age-calculator",
  initialValues: { birthDate: "" },
  calculate: calculateAge,
});
```

**Usage in component (src/app/[locale]/datetime/age/age-calculator.tsx):**

```typescript
"use client";

import { createCalculatorStore } from "@/stores/calculator-store";
import { calculateAge, type AgeInput, type AgeResult } from "@/lib/converters/datetime/age";

const useAgeStore = createCalculatorStore<AgeInput, AgeResult>({
  name: "age-calculator",
  initialValues: { birthDate: "" },
  calculate: calculateAge,
});

export function AgeCalculator() {
  const { values, setValue, result } = useAgeStore();

  return (
    <InputField
      value={values.birthDate}
      onChange={(value) => setValue("birthDate", value)}
    />
  );
}
```

**Key features:**

- Automatic URL synchronization (debounced, 150ms default)
- Type-safe with generics
- Built-in validation support
- No Provider wrapper needed
- Automatic result calculation on value changes

### Pattern 4: Development Setup Documentation

**What:** Step-by-step guide for new contributors
**When to use:** In CONTRIBUTING.md or README.md

**Current setup (package.json):**

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Recommended structure:**

````markdown
## Development Setup

### Prerequisites

- Node.js 18+ (check: `node --version`)
- npm 9+ (check: `npm --version`)
- Git (check: `git --version`)

### Setup Steps

1. Fork and clone:
   ```bash
   git clone https://github.com/YOUR_USERNAME/converty.git
   cd converty
   ```
````

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>

3. Verify setup:

   ```bash
   npm run type-check  # Should pass
   npm run lint        # Should pass
   npm run build       # Should complete
   ```

### Available Commands

| Command              | Purpose                                        |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Start dev server (<http://localhost:3000>)       |
| `npm run build`      | Build for production + generate service worker |
| `npm run type-check` | Run TypeScript compiler (no emit)              |
| `npm run lint`       | Run Biome linter                               |
| `npm run format`     | Auto-format code with Biome                    |

````

**Source:** https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors

### Anti-Patterns to Avoid

- **Don't use vague changelog entries:** "Fixed bugs" should be "Fixed BMI calculator rounding error"
- **Don't skip ADR consequences:** Always document both positive and negative impacts
- **Don't use outdated code examples:** CONTRIBUTING.md currently shows useState pattern, not Zustand
- **Don't assume prerequisites:** Always list Node.js version, npm version, OS compatibility

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Changelog format | Custom changelog structure | Keep a Changelog 1.1.0 | Standardized, recognized by tooling, well-documented |
| ADR format | Custom decision log | MADR 4.0.0 templates | Proven structure, minimal overhead, GitHub-friendly |
| Markdown linting | Manual style enforcement | markdownlint (optional) | Catches formatting issues, configurable rules |
| Version numbering | Custom versioning | Semantic Versioning 2.0.0 | Industry standard, tooling support, clear upgrade paths |
| Commit messages | Freeform messages | Keep existing style or adopt Conventional Commits | Consistency, potential for automation |

**Key insight:** Documentation formats benefit from standardization. Custom formats create maintenance burden and reduce discoverability. Use established formats that contributors recognize from other projects.

## Common Pitfalls

### Pitfall 1: Changelog Maintenance Lag
**What goes wrong:** Changelog only updated during releases, missing intermediate changes
**Why it happens:** No process for updating [Unreleased] section during development
**How to avoid:**
- Maintain [Unreleased] section at top of CHANGELOG.md
- Add entries when merging PRs, not just at release time
- Use git log to backfill missing entries
**Warning signs:** Large gaps between changelog entries, "various fixes" entries

### Pitfall 2: Outdated Code Examples in Documentation
**What goes wrong:** Documentation shows deprecated patterns (useState) instead of current patterns (Zustand)
**Why it happens:** Documentation updated separately from code refactoring
**How to avoid:**
- Review CONTRIBUTING.md when major refactoring occurs
- Use actual file paths in examples (e.g., "See src/app/[locale]/datetime/age/age-calculator.tsx")
- Test documented setup steps on fresh machine/container
**Warning signs:** Contributors asking why their code doesn't match examples

### Pitfall 3: ADR Versioning Confusion
**What goes wrong:** ADRs numbered inconsistently (0001 vs 1 vs 001)
**Why it happens:** No established naming convention
**How to avoid:**
- Use 4-digit zero-padded numbers: 0001, 0002, etc.
- MADR recommendation: "NNNN-title-with-dashes.md"
- Keep ADRs in chronological order by number
**Warning signs:** Sorting issues, gaps in numbering, conflicts

### Pitfall 4: Missing Node.js Version Specification
**What goes wrong:** Contributors use wrong Node.js version, encounter errors
**Why it happens:** Version only documented in README, not enforced
**How to avoid:**
- Specify in package.json `engines` field (already done: `"node": ">=18.0.0"`)
- Document in CONTRIBUTING.md prerequisites
- Consider .nvmrc file for nvm users
- Note in error messages when building with wrong version
**Warning signs:** Issues with "module not found" on different Node versions

### Pitfall 5: Untested Setup Instructions
**What goes wrong:** Setup guide has missing steps, incorrect commands, or outdated prerequisites
**Why it happens:** Instructions written by experienced developers who have undocumented environment setup
**How to avoid:**
- Test setup on fresh machine (VM, Docker, GitHub Codespaces)
- Document ALL prerequisites, including OS-specific notes
- Include verification steps after each setup stage
- Have new contributors test and report issues
**Warning signs:** Multiple setup-related issues filed, instructions skip implicit steps

## Code Examples

Verified patterns from official sources and project codebase:

### Keep a Changelog - Complete Example
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Salary calculator with tax calculations
- Period calculator for health tracking

### Changed
- Improved PWA install prompt with iOS-specific instructions

### Fixed
- Translation keys for sleep calculator in all locales
- Hard-coded English labels in BMI calculator

## [1.0.0] - 2026-01-17

### Added
- Initial release with 60+ calculators across 9 categories
- Progressive Web App support with offline capability
- Internationalization support (English, French, German, Italian)
- Zustand-based state management with URL synchronization
- Dark/light theme with system preference detection
- PDF export for calculator results

### Changed
- Migrated from useState to Zustand for calculator state (breaking change for API)
- Upgraded to Next.js 16 with App Router
- Switched to Biome for linting (from ESLint)

### Fixed
- TypeScript strict mode violations across codebase
- URL parameter parsing edge cases

### Security
- Upgraded jsPDF to v4.0.0 (addresses CVE-XXXX-YYYY)
````

**Source:** <https://keepachangelog.com/en/1.1.0/>

### MADR - Minimal Template Example

```markdown
# [ADR-0001] Use Zustand for Calculator State Management

- **Status:** accepted
- **Date:** 2026-01-15

## Context and Problem Statement

How should we manage state for 60+ calculators with URL synchronization requirements?

## Decision Drivers

- Need shareable URLs with calculator state
- Want minimal boilerplate per calculator
- Must maintain TypeScript strict mode compatibility
- Prefer small bundle size impact

## Considered Options

1. Zustand with custom middleware
2. Redux Toolkit
3. Jotai
4. Continue with useState

## Decision Outcome

Chosen option: "Zustand with custom middleware"

### Consequences

- Good: Minimal bundle size (1.2KB), no providers needed
- Good: Custom createCalculatorStore() eliminates boilerplate
- Good: URL sync middleware provides automatic shareable links
- Bad: Learning curve for contributors new to Zustand
- Neutral: Requires migration of existing calculators
```

**Source:** <https://github.com/adr/madr> (MADR 4.0.0 minimal template)

### Zustand Calculator Store - Complete Pattern

```typescript
// 1. Define types in src/lib/converters/category/name.ts
export interface AgeInput {
  birthDate: string;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  // ... other fields
}

export function calculateAge(input: AgeInput): AgeResult | null {
  // Validation
  if (!input.birthDate) return null;

  // Calculation logic
  // ...

  return result;
}

// 2. Create store in component file
// src/app/[locale]/category/name/name-calculator.tsx
"use client";

import { createCalculatorStore } from "@/stores/calculator-store";
import { calculateAge, type AgeInput, type AgeResult } from "@/lib/converters/datetime/age";

const useAgeStore = createCalculatorStore<AgeInput, AgeResult>({
  name: "age-calculator",        // Unique name for URL params
  initialValues: { birthDate: "" },
  calculate: calculateAge,
});

export function AgeCalculator() {
  const { values, setValue, result } = useAgeStore();

  return (
    <div className="space-y-6">
      <InputField
        id="birthDate"
        label="Birth Date"
        type="date"
        value={values.birthDate}
        onChange={(value) => setValue("birthDate", value)}
      />

      {result && (
        <ResultGrid
          results={[
            { label: "Years", value: result.years },
            { label: "Months", value: result.months },
            { label: "Days", value: result.days },
          ]}
        />
      )}
    </div>
  );
}
```

**Source:** /Users/fjacquet/Projects/converty/src/app/[locale]/datetime/age/age-calculator.tsx

**Key points:**

- Store created with `createCalculatorStore<InputType, ResultType>()`
- Automatic URL sync (shareable links)
- Type-safe setValue with field names
- Result automatically recalculated when values change
- No Provider wrapper needed

### Package.json Engines Field

```json
{
  "name": "converty",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Source:** <https://docs.npmjs.com/cli/v7/configuring-npm/package-json/>

**Best practices:**

- Use range syntax: `>=18.0.0` (not exact version)
- Include both node and npm
- Document in CONTRIBUTING.md prerequisites
- Consider adding .nvmrc for nvm users: `18.0.0`

## State of the Art

| Old Approach                  | Current Approach               | When Changed       | Impact                                        |
| ----------------------------- | ------------------------------ | ------------------ | --------------------------------------------- |
| useState with manual URL sync | Zustand with middleware        | Phase 3 (Jan 2026) | Reduces boilerplate, centralizes URL logic    |
| Keep a Changelog 1.0.0        | Keep a Changelog 1.1.0         | Sept 2017          | Minor format updates, backward compatible     |
| ADR Tools (CLI-based)         | MADR 4.0.0 (template-based)    | Sept 2024          | Simpler workflow, no tool installation needed |
| Static manifest.json          | Next.js App Router manifest.ts | Next.js 15+        | Better TypeScript support, dynamic generation |
| ESLint + Prettier             | Biome                          | Project setup      | Faster linting, single tool                   |

**Deprecated/outdated:**

- **Keep a Changelog 1.0.0**: Use 1.1.0 (adds "Security" category, clarifies version linking)
- **MADR 3.x templates**: Use 4.0.0 templates (released Sept 2024, improved structure)
- **useState pattern for calculators**: Use Zustand (deprecated in Phase 3)
- **useConverter hook**: Removed in Phase 3, replaced by createCalculatorStore

## Open Questions

Things that couldn't be fully resolved:

1. **ARCHITECTURE.md file location and content**

   - What we know: CLAUDE.md mentions "docs/ARCHITECTURE.md" but file doesn't exist
   - What's unclear: Whether to create it now or defer to future phase
   - Recommendation: Not listed in Phase 5 requirements, defer to future work. Focus on CHANGELOG, CONTRIBUTING, and ADRs.

2. **Specific jsPDF upgrade details for ADR-0004**

   - What we know: Requirement mentions "jsPDF upgrade" as needing ADR
   - What's unclear: Specific version numbers, vulnerability details, migration challenges
   - Recommendation: Research git history for jsPDF upgrade commits, check package.json for version, review any related issues/PRs

3. **Testing setup instructions on fresh machine**

   - What we know: DOC-04 requires "tested on fresh machine"
   - What's unclear: How to automate or systematize this testing
   - Recommendation: Use Docker container or GitHub Codespaces to verify setup steps, document process

4. **Conventional Commits adoption**
   - What we know: Current commits use descriptive messages but no standard format
   - What's unclear: Whether to adopt Conventional Commits or keep current style
   - Recommendation: Keep current commit style (clear, descriptive), don't force Conventional Commits unless team wants automation tooling

## Sources

### Primary (HIGH confidence)

- [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) - Official specification
- [MADR 4.0.0](https://github.com/adr/madr) - GitHub repository with templates
- [MADR Documentation](https://adr.github.io/madr/) - Official documentation site
- [GitHub Contributing Guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) - Official GitHub docs
- Converty codebase:
  - `/Users/fjacquet/Projects/converty/src/stores/calculator-store.ts` - Zustand pattern implementation
  - `/Users/fjacquet/Projects/converty/src/app/[locale]/datetime/age/age-calculator.tsx` - Working example
  - `/Users/fjacquet/Projects/converty/CONTRIBUTING.md` - Existing (needs update)
  - `/Users/fjacquet/Projects/converty/package.json` - Engines field

### Secondary (MEDIUM confidence)

- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist) - Official Zustand docs
- [Zustand URL State Guide](https://zustand.docs.pmnd.rs/guides/connect-to-state-with-url-hash) - URL synchronization patterns
- [npm package.json documentation](https://docs.npmjs.com/cli/v7/configuring-npm/package-json/) - Engines field spec
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) - Referenced by Keep a Changelog

### Tertiary (LOW confidence)

- WebSearch results for code documentation best practices (2025-2026 articles)
- WebSearch results for CI/CD testing strategies
- Community blog posts on Zustand patterns

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Keep a Changelog and MADR are official, well-documented standards
- Architecture: HIGH - Zustand pattern verified in working codebase
- Pitfalls: MEDIUM - Based on common open-source project issues and best practices
- Code examples: HIGH - All examples from official sources or verified codebase

**Research date:** 2026-01-17
**Valid until:** 30 days (standards stable, but Zustand evolving)

**Key files requiring updates:**

1. Create: `CHANGELOG.md` (root)
2. Create: `.planning/decisions/` directory
3. Create: `.planning/decisions/0001-zustand-migration.md`
4. Create: `.planning/decisions/0002-pwa-service-worker.md`
5. Create: `.planning/decisions/0003-typescript-strict.md`
6. Create: `.planning/decisions/0004-jspdf-upgrade.md`
7. Update: `CONTRIBUTING.md` (replace useState example with Zustand pattern)
8. Verify: `README.md` (ensure links to CONTRIBUTING.md)

**Git log for backfill (last 30 commits):**

```
8cfeaa2 fix(03-02): add salary calculator translation keys
2276e46 docs(04): complete Progressive Web App phase
fd4fee4 fix(health): add period calculator phase translations
[... Phase 4 PWA work ...]
481efbe fix(i18n): add Army Body Fat calculator translations
f00ba28 fix(i18n): complete Age Calculator translations
c71fb4d docs(04): research Progressive Web App implementation
[Earlier: Phase 1-3 work: TypeScript strict, URL parsing, Zustand migration]
```

**ADR Topics Identified:**

1. **Zustand Migration** - Why switch from useState to Zustand (Phase 3)
2. **PWA Service Worker** - Workbox, production-only registration, caching strategy (Phase 4)
3. **TypeScript Strict Mode** - noExplicitAny enforcement, type-safe URL parsing (Phase 1)
4. **jsPDF Upgrade** - Version upgrade, breaking changes (needs research)
