# ADR-010: No Automated Test Framework (Current State)

**Status:** Superseded by [ADR-011](ADR-011-vitest-test-strategy.md)
**Date:** 2024-01-01
**Supersedes:** Nothing
**Superseded by:** ADR-011 (2026-02-26)

---

## Context

The project has grown to 193+ calculators without a formal automated test suite. Validation relies on:
- TypeScript strict mode catching type errors at compile time
- Biome linting catching code quality issues at commit time
- Manual testing during development
- URL state sharing enabling easy reproduction of reported issues

This was a pragmatic early decision: shipping calculators quickly was prioritized over setting up test infrastructure. The pure function pattern (ADR-007) was chosen partly with future testability in mind.

## Decision

Accept the current state of no automated tests while acknowledging the risk. Validation is exclusively:
1. `npm run type-check` — TypeScript compiler
2. `npm run check:fix` — Biome linting
3. Manual browser testing during development

## Consequences

**Positive:**
- No test maintenance overhead
- Faster feature iteration (no tests to update)
- Zero CI time spent on test execution

**Negative / Risks:**
- Calculation regressions are not caught automatically
- Formula changes in converters can silently break results
- Refactoring pure functions carries undetected regression risk
- Growing codebase makes manual testing increasingly incomplete

## Path Forward

The pure function architecture (ADR-007) makes adding tests straightforward — no DOM rendering required for unit tests. A future ADR-011 will formalize the test strategy, likely:

**Recommended stack:**
- **Vitest** — fast, Vite-native test runner (compatible with Next.js toolchain)
- **Unit tests** for all `src/lib/converters/` functions
- **Smoke tests** for critical calculation correctness (verified reference values)

**Priority calculators for initial test coverage:**
1. Fibre Channel BB credit calculator (physics formula)
2. Subnet calculator (IP math with BigInt)
3. BMI / BMR (health — widely used)
4. Compound interest (finance — precision-critical)
5. Molar mass calculator (chemistry — formula parsing)

**Target:** ≥80% coverage of `src/lib/converters/` pure functions.
