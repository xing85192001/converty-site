# ADR-011: Vitest Test Strategy for Converter Functions

**Status:** Accepted
**Date:** 2026-02-26
**Supersedes:** ADR-010 (No Automated Test Framework)
**Proposed by:** v7.0 Framework Migration

---

## Context

The project grew to 190+ calculators with zero automated test coverage of the converter
(pure function) layer. All 169+ calculators delegate their math to functions in
`src/lib/converters/`. These functions are:

- Framework-agnostic pure TypeScript (no React, no DOM)
- The sole source of correctness for all calculation results
- Increasingly complex (recursive formula parsers, physics simulations, financial models)
- Invisible to TypeScript strict mode when the *logic* is wrong but the *types* are correct

Calculation regressions were undetectable: a refactored Euler formula or an updated
atomic weight could silently produce wrong results across all affected calculators.

ADR-010 explicitly deferred this decision and named Vitest as the recommended tool when
a test strategy was formalized.

## Decision

Adopt **Vitest** as the test runner for all `src/lib/converters/` pure functions.

### Environment

- **node** environment (not jsdom) — converters have no DOM dependencies, node is faster
  and more deterministic for pure math
- `vitest.config.ts` at project root, separate from Next.js build config

### Coverage strategy

| Phase | Approach | Outcome |
|-------|----------|---------|
| Phase 40 (foundation) | Per-file thresholds on 5 priority converters | 66 tests, baseline CI green |
| Phase 41 (full coverage) | Global threshold 75% after all 19 categories covered | 2281 tests, 86% line, 91% branch |

Priority converters for Phase 40 (highest regression risk):
1. Fibre Channel BB credit calculator (physics formula, vendor CLI generation)
2. Subnet calculator (IP math with BigInt, RFC 3021 edge cases)
3. BMI / BMR (health — widely used, formula sourced from WHO)
4. Compound interest (finance — precision-critical over multi-year terms)
5. Molar mass calculator (chemistry — custom recursive descent formula parser)

### CI gate

Coverage reporting added to `static.yml` GitHub Actions workflow:
- `vitest run --coverage` runs before `next build`
- Build fails if coverage drops below global threshold
- Prevents regressions from shipping to GitHub Pages

### Out of scope

- React component tests (no jsdom, no React Testing Library) — components tested
  manually and via TypeScript; UI regressions are lower priority than math regressions
- End-to-end browser tests — incompatible with static export constraints and zero
  operational cost goal

## Consequences

**Positive:**

- 2281 tests covering all 19 converter categories
- 86% line coverage, 91% branch coverage across `src/lib/converters/`
- CI gate (`static.yml`) prevents calculation regressions from merging to `main`
- Pure function architecture (ADR-007) made test authoring straightforward — no mocks,
  no fixtures, no async setup
- Test files colocated with converters for discoverability

**Negative / Trade-offs:**

- Test maintenance overhead: formula changes require updating test expectations
- ~2300 tests add ~15–30 seconds to CI pipeline
- Coverage gaps remain in UI components and store integration paths (accepted)

## Implementation Details

- `vitest.config.ts` — node environment, coverage via v8, global threshold 75%
- `src/lib/converters/**/*.test.ts` — test files colocated with converters
- 196 test files across 19 categories
- `package.json` scripts: `test`, `test:coverage`, `test:watch`

## Related ADRs

- [ADR-007](ADR-007-pure-functions-converters.md) — Pure functions pattern enables
  test-without-DOM strategy
- [ADR-010](ADR-010-no-test-framework.md) — Superseded decision; documented the
  no-test rationale and named this ADR as the planned successor
