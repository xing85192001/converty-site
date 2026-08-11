# Testing Patterns

**Analysis Date:** 2026-01-29 (updated from 2026-01-17 after v5.0)

## Test Framework

**Runner:**

- None currently configured
- No test files found in `src/`
- No test framework dependencies in `package.json`
- Vitest recommended for future implementation

**Run Commands:**

```bash
# No test commands available
# Quality checks use:
npm run type-check     # TypeScript type checking
npm run lint           # ESLint
npm run lint:biome     # Biome linting
npm run check          # Biome comprehensive check
npm run quality        # All quality checks (lint + biome + type-check)
```

## Current Quality Assurance

**Type Checking:**

- TypeScript compiler with strict mode
- Run: `npx tsc --noEmit`
- Configured in `tsconfig.json`
- Strict mode: enabled (no implicit any, strict null checks, etc.)

**Linting:**

- ESLint v9 with TypeScript support
- Biome v2.3.11 for additional checks and formatting
- Security rules enabled in Biome
- Run: `npm run lint` or `npm run check`

**Pre-commit Hooks:**

- Husky v9 + lint-staged
- Runs Biome on staged files before every commit
- Keeps pre-commit under 3 seconds

**CI Security Scanning:**

- CodeQL analysis (JavaScript/TypeScript) on every push
- Trivy container and filesystem scanning
- npm audit at moderate level
- Biome security linting
- Dependency review on PRs

**Build Verification:**

- Static export must succeed (`npm run build`)
- Build-time data fetching with fallback values
- Search index generation validates registry metadata
- Service worker generation validates static assets

**Manual Testing:**

- Development server: `npm run dev`
- Visual testing in browser
- Calculator outputs verified manually
- URL state persistence tested interactively

## Testing Approach (Current)

**Validation:**

- Input validation in calculator functions (return `null` for invalid)
- `safeParsePositive` / `safeParseNonNegative` preserve valid values during typing
- TypeScript ensures type safety at compile time
- Biome checks code quality and patterns

**Calculation Verification:**

- Manual testing with known inputs/outputs
- Visual verification in browser
- No automated test suite

**Regression Prevention:**

- Type checking catches many bugs
- Linting prevents common mistakes
- Pre-commit hooks enforce code quality
- Build process must succeed
- Security scanning catches vulnerabilities

## What Should Be Tested (Recommendations)

**Unit Tests (Calculation Functions) — Priority: Critical:**

```typescript
// src/lib/converters/health/bmi.test.ts
import { calculateBMI } from "./bmi";

describe("calculateBMI", () => {
  it("calculates BMI correctly", () => {
    const result = calculateBMI({
      weight: 70,
      weightUnit: "kg",
      height: 175,
      heightUnit: "cm",
    });
    expect(result?.bmi).toBeCloseTo(22.9, 1);
    expect(result?.category).toBe("normal");
  });

  it("returns null for invalid inputs", () => {
    const result = calculateBMI({
      weight: -10,
      weightUnit: "kg",
      height: 175,
      heightUnit: "cm",
    });
    expect(result).toBeNull();
  });
});
```

**Domain-Specific Tests — Priority: High:**

```typescript
// Chemistry: formula parser edge cases
describe("parseChemicalFormula", () => {
  it("parses parenthetical groups", () => {
    const result = parseChemicalFormula("Ca(OH)2");
    expect(result).toEqual({ Ca: 1, O: 2, H: 2 });
  });
});

// Engineering: structural calculations with known reference values
describe("calculateBeamDeflection", () => {
  it("matches AISC reference values", () => {
    // Test against published steel beam tables
  });
});

// Network: IPv4/IPv6 edge cases
describe("calculateSubnet", () => {
  it("handles /31 point-to-point links per RFC 3021", () => {
    const result = calculateSubnet("192.168.1.0/31");
    expect(result?.usableHosts).toBe(2);
  });
});
```

**Store Tests — Priority: High:**

```typescript
// src/stores/calculator-store.test.ts
describe("createCalculatorStore", () => {
  it("updates values and calculates result", () => {
    const useStore = createCalculatorStore({
      name: "test",
      initialValues: { a: 0, b: 0 },
      calculate: (vals) => ({ sum: vals.a + vals.b }),
    });
    const { setValue } = useStore.getState();
    setValue("a", 5);
    setValue("b", 3);
    expect(useStore.getState().result?.sum).toBe(8);
  });
});
```

## Test Framework Recommendations

**For Unit Tests:**

- Vitest (fast, Vite-based, modern, recommended)

**For Component Tests:**

- React Testing Library + Vitest
- @testing-library/react for React 19

**For E2E Tests:**

- Playwright (recommended for Next.js)

**Setup Example (Vitest):**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Config (`vitest.config.ts`):**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

## Coverage

**Requirements:** None enforced

**Target Areas for Coverage (by priority):**

1. Calculation functions in `src/lib/converters/` (highest value — 167+ calculators)
2. Chemical formula parser (`src/lib/converters/chemistry/formula-parser.ts`)
3. Network calculations with BigInt edge cases
4. Store logic in `src/stores/`
5. Utilities in `src/lib/utils/`
6. Component rendering (lower priority due to type safety)

## Quality Gates (Current)

**Pre-commit:**

1. Husky runs lint-staged
2. lint-staged runs Biome on staged files

**Build-time:**

1. TypeScript compilation must succeed (strict mode)
2. Biome linting must pass
3. ESLint checks must pass
4. Build-time data fetch (with fallback)
5. Search index generation
6. Static export generation must succeed
7. Service worker generation

**CI/CD:**

1. TypeScript type-check
2. ESLint
3. Biome check
4. Static export build
5. CodeQL security analysis
6. Trivy vulnerability scan
7. npm audit
8. Dependency review (PRs)

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
- Risk: Runtime MISSING_MESSAGE errors
- Priority: Medium
- Note: @lingual/i18n-check installed but not fully integrated

**Component Integration:**

- What's not tested: Calculator components render correctly
- Risk: UI bugs, broken layouts
- Priority: High

**Build-Time Scripts:**

- What's not tested: Data fetching scripts, search index generation
- Risk: Build failures from API changes
- Priority: Medium

---

_Testing analysis: 2026-01-29 (v5.0)_
