# ADR-005: Biome as Single Linting and Formatting Tool

**Status:** Accepted
**Date:** 2024-06-01
**Deciders:** Project owner

---

## Context

The project originally used ESLint + Prettier, a common combination in the Next.js ecosystem. This setup has known pain points:
- Two separate tools with overlapping responsibilities
- Frequent version conflicts between ESLint plugins
- Slow lint performance on large codebases
- Complex configuration spread across `.eslintrc`, `.prettierrc`, and plugin configs

Biome (formerly Rome) reached production stability in 2023-2024 and positioned itself as a single Rust-based replacement for both ESLint and Prettier, with 10-100× faster execution.

## Decision

Replace ESLint + Prettier with **Biome 2** as the sole linting and formatting tool. ESLint is retained only for Next.js-specific rules that Biome does not yet cover (`eslint-config-next`).

Configuration at `biome.json`:
- `linter.rules.recommended: true`
- `formatter.indentStyle: "space"`, `indentWidth: 2`
- Custom overrides: `noExplicitAny` as error (with 4 whitelisted exceptions)
- `useConsoleLog` suppressed (calculators use `console.error` for clipboard failures)

**Pre-commit integration via Husky + lint-staged:**
```json
{
  "*.{ts,tsx,js,jsx,json}": ["biome check --write"]
}
```

This auto-fixes formatting and safe lint violations on every commit. Unfixable errors abort the commit.

## Consequences

**Positive:**
- Single tool, single configuration file
- Dramatically faster lint runs (milliseconds vs. seconds)
- Consistent formatting enforced automatically at commit time
- `no-any` rule prevents TypeScript quality degradation
- Security linting rules (no `dangerouslySetInnerHTML`, no `eval`)

**Negative / Constraints:**
- Biome's rule set is smaller than ESLint's ecosystem — some niche rules unavailable
- Team members unfamiliar with Biome may need orientation
- ESLint still required for Next.js-specific rules (`next/core-web-vitals`) creating partial dual-tool situation
- Occasional false positives require `biome-ignore` comments

**Commands:**
```bash
npm run check        # Read-only lint check
npm run check:fix    # Auto-fix safe issues
npm run format       # Format only (no lint)
npm run type-check   # TypeScript compiler (separate from Biome)
```
