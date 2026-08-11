# Use Biome as Primary Linter and Formatter

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty has 200+ TypeScript files that need consistent formatting and lint enforcement. The initial setup used ESLint for linting and Prettier for formatting — two separate tools with potential conflicts (Prettier vs ESLint formatting rules) and two separate configuration files. We need a fast, consistent code quality tool that integrates with pre-commit hooks.

## Decision Drivers

- **Single tool for lint + format** — Eliminate ESLint/Prettier conflicts
- **Fast execution** — Pre-commit hooks must run in <5s on typical hardware
- **TypeScript-first** — Full TypeScript support with strict rules
- **No `any` enforcement** — `noExplicitAny` must be enforced at error level
- **Auto-fixable** — `--write` flag should fix most violations automatically
- **Next.js compatibility** — Must support React, JSX, and import organization

## Considered Options

1. **Biome (primary) + ESLint (React hooks only)** — Biome for format/lint, ESLint for react-hooks plugin
2. **ESLint + Prettier** — Industry standard, maximum plugin ecosystem
3. **Biome only** — Single tool, no ESLint at all
4. **Oxlint** — New Rust-based linter, fast but less mature

## Decision Outcome

Chosen option: **"Biome (primary) + ESLint (React hooks only)"** because Biome handles all formatting and most linting in a single fast tool, while ESLint's `eslint-plugin-react-hooks` provides rules for `useEffect` dependency arrays that Biome does not currently implement.

### Consequences

**Positive:**

- **~100× faster than ESLint:** Biome runs in <1s on the full codebase (Rust-based)
- **Single config:** `biome.json` covers formatting and linting rules
- **No ESLint/Prettier conflicts:** One tool owns formatting decisions
- **`noExplicitAny` at error level:** TypeScript `any` types are compile-time errors
- **Auto-fix on commit:** `biome check --write` in pre-commit hook fixes violations before commit

**Negative:**

- **Dual-tool setup:** ESLint still needed for `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`
- **Next.js 16 removed `next lint`:** The `next lint` command no longer works; ESLint runs via `npx eslint`
- **Biome ecosystem smaller:** Fewer community plugins compared to ESLint
- **Configuration overlap risk:** Both tools configured; must ensure they don't conflict on same rules

**Neutral:**

- **`biome.json` is authoritative** for formatting (indentation, quotes, line length)
- **ESLint config minimal** — only react-hooks plugin, all other rules disabled or covered by Biome

## Configuration Summary

```json
// biome.json (key rules)
{
  "linter": {
    "rules": {
      "suspicious": { "noExplicitAny": "error" },
      "style": { "useConst": "error", "noVar": "error" }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

## Pre-commit Hook

```
# .husky/pre-commit
npx lint-staged
```

```json
// package.json lint-staged config
{
  "lint-staged": {
    "*.{ts,tsx}": ["biome check --write"]
  }
}
```

## Future Consideration

If Biome adds `react-hooks` rule support (tracked in Biome GitHub issues), ESLint can be removed entirely for a single-tool setup. The dual-tool setup is a temporary measure.

## Links

- **Configuration:** `biome.json`, `.eslintrc.json`
- **Pre-commit hooks:** `.husky/pre-commit`
- **ADR-0003:** TypeScript strict mode (Biome enforces `noExplicitAny` at error level)
- **Lint commands:** `npm run check:fix` (Biome auto-fix), `npm run lint` (ESLint)
