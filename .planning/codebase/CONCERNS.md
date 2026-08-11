# Codebase Concerns

**Analysis Date:** 2026-01-29 (updated from 2026-01-17 after v5.0)

## Tech Debt

**State Management Migration (Ongoing):**

- Issue: Legacy `useConverter` hook still used in some older calculators; all new calculators use Zustand stores
- Files: `src/hooks/use-converter.ts` (deprecated), `src/stores/calculator-store.ts` (standard)
- Impact: Two patterns coexist — inconsistency for contributors
- Fix approach: Gradually migrate remaining useConverter calculators to Zustand; do not add new useConverter usage
- Status: Partially resolved in v1.0 Phase 3, ongoing

**Accessibility Rules Disabled:**

- Issue: Biome a11y rules explicitly disabled
- Files: `biome.json`
- Impact: Accessibility issues may go undetected
- Fix approach: Enable a11y linting, audit existing components, fix violations

**Translation Key Consistency:**

- Issue: Translation keys must match registry IDs (kebab-case), validated only at build time by missing message warnings
- Files: `src/messages/*.json` (4 locale files), `src/lib/registry/*-converters.ts`
- Impact: Missing translations produce MISSING_MESSAGE in UI
- Fix approach: Add build-time validation script; @lingual/i18n-check is installed but not fully integrated

## Resolved Issues (from v1.0-v5.0)

The following concerns from the original v1.0 analysis have been resolved:

- **Shared Global Debounce Timer** — Fixed in v1.0 Phase 2: closure pattern isolates timers per store instance
- **Type Safety Weaknesses** — Fixed in v1.0 Phase 1: `noExplicitAny` enabled at error level
- **No Code Splitting** — Fixed in v3.0 Phase 21: dynamic imports for all 167+ calculator pages
- **No PWA Support** — Fixed in v1.0 Phase 4: Workbox service worker with offline capability
- **jsPDF Security Risk** — Resolved: jsPDF v4.0.0 IS the latest version (ADR 0004 correction; version progression was v1->v2->v3->v4)
- **URL Sync Logic Duplication** — Partially resolved in v1.0 Phase 8: consolidated `getUrlParams()` utility
- **CodeQL Vulnerabilities** — Fixed in v4.0 Phase 25: Map-based URL parameters eliminate prototype pollution

## Known Bugs

**Date Locale Dependency:**

- Symptoms: Date parsing may fail or return incorrect results for non-ISO formats
- Files: All datetime converters in `src/lib/converters/datetime/`
- Trigger: User inputs date in locale-specific format
- Workaround: Document ISO format requirement, add format hints in UI

**Basic Calculator Expression Parsing Edge Cases:**

- Symptoms: Complex expressions with nested parentheses or implicit multiplication may parse incorrectly
- Files: `src/lib/converters/math/basic-calculator.ts`
- Trigger: Edge case expressions like `2(3+4)(5)` or `--5`
- Workaround: Manual tokenization has limitations; consider expression parser library

## Security Considerations

**Expression Evaluation Without Sandboxing:**

- Risk: Basic calculator evaluates user expressions, potential for malicious input
- Files: `src/lib/converters/math/basic-calculator.ts` (evaluatePostfix function)
- Current mitigation: Custom tokenizer/parser, no direct `eval()` usage
- Recommendations: Add expression complexity limits, input length caps

**Build-Time API Keys:**

- Risk: Build-time scripts fetch from CoinGecko and blockchain.info without API keys
- Files: `scripts/fetch-crypto-prices.ts`, `scripts/fetch-mining-data.ts`
- Current mitigation: Free-tier APIs, no keys needed, fallback values if API unavailable
- Recommendations: Monitor rate limits, add fallback data freshness warnings (implemented: staleness warning for >24h)

**Static Export Exposes All Code:**

- Risk: All calculation logic visible in browser
- Files: All files in `src/lib/converters/`
- Current mitigation: Open-source project (MIT license)
- Recommendations: None needed for current architecture

## Performance Bottlenecks

**Large Translation Files:**

- Problem: All 4 locale files bundled; each file grows with every calculator added (now 167+)
- Files: `src/messages/*.json`
- Impact: Initial bundle size increases with calculator count
- Improvement path: Code-split locale files, load only active locale namespace

**Recharts Bundle Size:**

- Problem: Recharts is heavy dependency (~400KB), used only in few calculators
- Files: `package.json`, chart-display components
- Improvement path: Consider lightweight alternative or ensure tree-shaking works effectively

**URL Updates on Every Keystroke:**

- Problem: URL history updated on each input change (debounced 150ms)
- Files: `src/stores/calculator-store.ts`
- Cause: Shareable links feature requires URL sync
- Improvement path: Increase debounce to 500ms, or sync only on blur/calculate

## Fragile Areas

**URL State Parsing:**

- Files: `src/stores/calculator-store.ts`, `src/hooks/use-url-state.ts`
- Why fragile: Type coercion from URL strings to numbers using heuristic `Number()` check
- Safe modification: Add schema validation with Zod; use Map-based params (v4.0 improvement)
- Test coverage: None (no tests)

**Next.js Router API Usage:**

- Files: `src/hooks/use-url-state.ts`
- Why fragile: Relies on Next.js 16 App Router API which is still evolving
- Safe modification: Isolate router logic in single hook/utility
- Test coverage: None

**Date Calculations Across Timezones:**

- Files: `src/lib/converters/datetime/*.ts`, `src/lib/converters/health/pregnancy-due-date.ts`
- Why fragile: Date objects use local timezone
- Safe modification: Explicitly use UTC for calculations, convert to local only for display
- Test coverage: None

**Chemical Formula Parser:**

- Files: `src/lib/converters/chemistry/formula-parser.ts`
- Why fragile: Custom recursive descent parser for chemical notation; edge cases with deeply nested parentheses or unusual notation
- Safe modification: Add comprehensive test suite for formula edge cases
- Test coverage: None

## Scaling Limits

**Client-Side Calculation Only:**

- Current capacity: Handles all calculations locally
- Limit: Complex calculations (large matrices, long simulations) may freeze browser
- Scaling path: Add Web Workers for heavy calculations

**Static Site Generation for 200+ Calculators:**

- Current capacity: 167+ calculators build successfully
- Limit: Build time grows linearly with calculator count
- Scaling path: Monitor build time; consider ISR if build exceeds 5 minutes

**Single Locale Bundle:**

- Current capacity: All 4 locale files bundled together
- Limit: Adding more locales increases initial bundle size
- Scaling path: Code-split locale files, load only active locale

## Dependencies at Risk

**React 19 & Next.js 16:**

- Risk: Cutting-edge versions, may have undiscovered bugs
- Impact: Breaking changes in future patch releases
- Migration plan: Pin exact versions, monitor release notes

**Workbox v7:**

- Risk: CDN-loaded via importScripts in service worker
- Impact: CDN downtime could affect offline functionality
- Migration plan: Consider bundling Workbox or using precache manifest approach

## Missing Critical Features

**Test Coverage:**

- Problem: Zero test files, no test framework configured
- Blocks: Confident refactoring, regression detection
- Priority: Critical
- Files needed: `*.test.ts` in `src/lib/converters/`, test runner config (Vitest recommended)

**Error Boundaries:**

- Problem: No React error boundaries around calculator components
- Blocks: Calculator crash takes down entire page
- Priority: High

**Input Validation Feedback:**

- Problem: Many calculators return `null` for invalid input without specific error messages
- Blocks: User doesn't know what's wrong with their input
- Priority: Medium

**Analytics/Telemetry:**

- Problem: No usage tracking, error monitoring, or performance metrics
- Blocks: Understanding which calculators are popular, identifying errors in production
- Priority: Low
- Consideration: Privacy-focused analytics (Plausible, Fathom)

## Test Coverage Gaps

**All Calculation Logic:**

- What's not tested: Every calculator in `src/lib/converters/**/*.ts` (167+ calculators)
- Risk: Mathematical errors, edge case bugs, regression during refactoring
- Priority: Critical

**State Management:**

- What's not tested: `createCalculatorStore` factory, URL sync middleware
- Risk: State corruption, URL sync failures
- Priority: High

**Translation Completeness:**

- What's not tested: All locale files have same keys, no missing translations
- Risk: Runtime errors from missing keys
- Priority: Medium

**Component Integration:**

- What's not tested: Calculator components render correctly
- Risk: UI bugs, broken layouts
- Priority: High

---

_Concerns audit: 2026-01-29 (v5.0)_
