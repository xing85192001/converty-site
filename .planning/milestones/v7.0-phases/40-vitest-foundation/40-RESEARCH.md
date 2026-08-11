# Phase 40: Vitest Foundation - Research

**Researched:** 2026-02-26
**Domain:** Vitest + Next.js 16 App Router — unit testing pure TypeScript functions
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R1.1 | Vitest configured and running in the Next.js project (no framework change needed) | Standard stack section: official Next.js docs confirm Vitest works alongside Next.js without framework changes |
| R1.2 | `vitest.config.ts` with jsdom environment, `@testing-library/react`, path aliases matching Next.js | Architecture Patterns: full config provided with `vite-tsconfig-paths` for `@/*` → `src/*` |
| R1.3 | Coverage thresholds: 75% lines/functions/branches/statements on `src/lib/converters/**` | Code Examples: coverage threshold config with `include: ['src/lib/converters/**']` |
| R1.4 | `npm test` and `npm run test:coverage` commands added to `package.json` | Architecture Patterns: scripts block example |
| R1.5 | Unit tests for 5 priority converters: BB Credit, Subnet, BMI, Compound Interest, Molecular Weight | Converter signatures and edge cases documented in Code Examples |
</phase_requirements>

---

## Summary

Vitest is the official testing framework recommended by Next.js for unit testing in App Router projects. The [Next.js documentation](https://nextjs.org/docs/app/guides/testing/vitest) explicitly supports this configuration. Adding Vitest to an existing Next.js 16 project is non-breaking: it runs independently of the Next.js build pipeline.

The 5 priority converters (`bb-credit-calculator.ts`, `subnet-calculator.ts`, `bmi.ts`, `compound-interest.ts`, `molecular-weight.ts`) are pure TypeScript functions with zero React dependencies. They require no mocking of Next.js internals, no jsdom, and no provider wrapping — just TypeScript + Vitest's Node environment. The only special concern is the `molecular-weight.ts` converter, which imports `@/data/chemistry/periodic-table.json` using the project's path alias, requiring `vite-tsconfig-paths` to resolve.

The subnet-calculator uses `ipaddr.js` (already installed in `package.json`), which runs fine in Node environment. BigInt arithmetic is natively supported by Vitest's Node/V8 environment. The compound-interest converter is numerically sensitive — tests must use `toBeCloseTo` rather than strict equality.

**Primary recommendation:** Install 5 packages (`vitest @vitejs/plugin-react jsdom @testing-library/react vite-tsconfig-paths @vitest/coverage-v8 @testing-library/dom`), create `vitest.config.ts` using `vite-tsconfig-paths` plugin, and write pure function tests using `describe`/`it`/`expect` — no mocking required for the 5 priority converters.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vitest` | latest | Test runner + assertion library | Official Next.js docs recommend it; Jest-compatible API |
| `@vitejs/plugin-react` | latest | React transform for Vitest | Required by Next.js guide for JSX support in tests |
| `vite-tsconfig-paths` | latest | Resolves `@/*` → `src/*` aliases | Reads tsconfig.json paths directly; avoids manual alias duplication |
| `@vitest/coverage-v8` | latest | Code coverage via V8 | Native V8 engine, fast, no instrumentation needed |
| `jsdom` | latest | Browser DOM simulation | Required for any React component tests |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/react` | latest | React component rendering utilities | Component tests (Phase 40 scoped to pure functions — needed for future phases) |
| `@testing-library/dom` | latest | DOM query utilities | Required peer of @testing-library/react |
| `@testing-library/jest-dom` | latest | Custom matchers (`.toBeInTheDocument()`) | Component test assertions — install now, configure in setup file |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `vite-tsconfig-paths` | `resolve.alias` in vitest.config.ts | Manual alias list diverges from tsconfig — don't hand-roll |
| `@vitest/coverage-v8` | `@vitest/coverage-istanbul` | Istanbul is slower; V8 is default since Vitest 3.2 with AST remapping that matches Istanbul accuracy |
| `jsdom` | `happy-dom` | happy-dom is faster but less complete; jsdom is the official Next.js recommendation |

**Installation:**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @vitest/coverage-v8
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── converters/
│       ├── network/
│       │   ├── bb-credit-calculator.ts
│       │   └── subnet-calculator.ts
│       ├── health/
│       │   └── bmi.ts
│       ├── finance/
│       │   └── compound-interest.ts
│       └── chemistry/
│           └── molecular-weight.ts
src/__tests__/                   # Test files mirror converters/ structure
├── lib/
│   └── converters/
│       ├── network/
│       │   ├── bb-credit-calculator.test.ts
│       │   └── subnet-calculator.test.ts
│       ├── health/
│       │   └── bmi.test.ts
│       ├── finance/
│       │   └── compound-interest.test.ts
│       └── chemistry/
│           └── molecular-weight.test.ts
vitest.config.ts                 # Root-level Vitest config
```

**Alternative:** co-locate test files as `bb-credit-calculator.test.ts` next to the source file. Either approach is valid — mirrored structure keeps source clean.

### Pattern 1: vitest.config.ts for Next.js 16

**What:** Single configuration file at project root that wires Vitest to the Next.js TypeScript path aliases.
**When to use:** All Next.js projects with `@/*` path aliases.

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest (verified 2026-02-24)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',         // Use 'node' for pure function tests (faster)
                                 // Use 'jsdom' for component tests
    globals: true,               // Enable describe/it/expect without imports
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/converters/**/*.ts'],
      exclude: [
        'src/lib/converters/**/*.d.ts',
        'src/lib/converters/**/types.ts',
        'src/lib/converters/**/index.ts',  // Re-export barrels — no logic
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
})
```

**Note on environment:** Pure function converters don't need `jsdom`. Set `environment: 'node'` for speed. When component tests are added later, use per-file `// @vitest-environment jsdom` or switch to `jsdom` globally.

### Pattern 2: package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

`npm test` → watch mode (development). `npm run test:run` → CI single pass. `npm run test:coverage` → generate coverage report.

### Pattern 3: Pure Function Test Structure (Table-Driven)

**What:** Parameterized test cases that cover normal inputs, boundary values, and invalid inputs.
**When to use:** Any converter function with a known mathematical formula.

```typescript
// Source: Vitest docs pattern + project conventions
import { describe, it, expect } from 'vitest'
import { calculateBMI } from '@/lib/converters/health/bmi'

describe('calculateBMI', () => {
  describe('valid inputs', () => {
    it.each([
      // [description, input, expected_bmi, expected_category]
      ['normal BMI metric', { weight: 70, weightUnit: 'kg', height: 175, heightUnit: 'cm' }, 22.9, 'normal'],
      ['overweight imperial', { weight: 200, weightUnit: 'lb', height: 70, heightUnit: 'in' }, 28.7, 'overweight'],
      ['underweight', { weight: 45, weightUnit: 'kg', height: 175, heightUnit: 'cm' }, 14.7, 'underweight'],
    ])('%s', (_, input, expectedBmi, expectedCategory) => {
      const result = calculateBMI(input)
      expect(result).not.toBeNull()
      expect(result!.bmi).toBeCloseTo(expectedBmi, 1)
      expect(result!.category).toBe(expectedCategory)
    })
  })

  describe('null returns for invalid input', () => {
    it('returns null for zero weight', () => {
      expect(calculateBMI({ weight: 0, weightUnit: 'kg', height: 175, heightUnit: 'cm' })).toBeNull()
    })
    it('returns null for zero height', () => {
      expect(calculateBMI({ weight: 70, weightUnit: 'kg', height: 0, heightUnit: 'cm' })).toBeNull()
    })
    it('returns null for negative values', () => {
      expect(calculateBMI({ weight: -1, weightUnit: 'kg', height: 175, heightUnit: 'cm' })).toBeNull()
    })
  })
})
```

### Pattern 4: Test Setup File

```typescript
// src/test-setup.ts
import '@testing-library/jest-dom'  // Extend expect with DOM matchers
// Add any global mocks here for future component tests
```

### Anti-Patterns to Avoid

- **Using `environment: 'jsdom'` for pure function tests:** Adds ~200ms startup overhead per test file. Pure TypeScript functions don't need a DOM.
- **Using strict equality on floating point:** `expect(result.bmi).toBe(22.857...)` — use `toBeCloseTo(22.9, 1)` instead.
- **Importing `@vitejs/plugin-react` but not including it in `plugins`:** The config crashes silently. Always put `tsconfigPaths()` first.
- **Setting coverage `include` to `src/**`:** Pulls in React components, stores, and registry files that are not the test target. Scope to `src/lib/converters/**`.
- **Forgetting to exclude `node_modules` from coverage:** Vitest does this automatically only if `include` patterns are set.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Path alias resolution | Manual `resolve.alias` object in vitest.config.ts | `vite-tsconfig-paths` plugin | Reads tsconfig.json paths directly; stays in sync automatically; handles complex mappings |
| Coverage thresholds | Custom shell scripts checking coverage JSON | Vitest `coverage.thresholds` config | Built-in, CI-integrated, supports per-file and per-pattern thresholds |
| Test utilities for `T | null` | Custom null-checking helpers | `expect(result).not.toBeNull(); result!.property` | Vitest's narrowing works after null check |
| Global test setup | Repeated imports in every test file | `globals: true` in vitest.config.ts | Eliminates boilerplate; `describe`/`it`/`expect` available everywhere |

**Key insight:** The converters are the simplest possible test targets — no mocking, no providers, no async. The only complexity is the `@/` path alias for `molecular-weight.ts`, solved by `vite-tsconfig-paths`.

---

## Common Pitfalls

### Pitfall 1: `@/*` Path Alias Not Resolving in Tests

**What goes wrong:** Tests importing `@/lib/converters/...` or the `molecular-weight.ts` file importing `@/data/chemistry/periodic-table.json` throw `Cannot find module '@/...'`.
**Why it happens:** Vitest uses Vite's resolver, not Next.js's. The `@/*` alias is defined only in `tsconfig.json` unless explicitly wired.
**How to avoid:** Use `vite-tsconfig-paths` plugin (NOT `resolve.alias`). Place `tsconfigPaths()` before `react()` in the plugins array.
**Warning signs:** `Error: Cannot find module '@/data/chemistry/periodic-table.json'` in the molecular-weight tests.

### Pitfall 2: BigInt Serialization in Assertions

**What goes wrong:** `expect(result.usableHosts).toBe(254)` fails because `result.usableHosts` is `254n` (BigInt) and `254` is `Number`.
**Why it happens:** `subnet-calculator.ts` uses `BigInt` for `usableHosts` and `totalHosts`. Strict equality fails across types.
**How to avoid:** Use `toBe(BigInt(254))` or `toBe(254n)` for BigInt assertions.
**Warning signs:** `Expected 254 to deeply equal 254n`.

### Pitfall 3: Floating Point Precision in Finance/Health Tests

**What goes wrong:** `calculateCompoundInterest` or `calculateBMI` assertions fail with "expected 22.857142857142858 to equal 22.9".
**Why it happens:** Month-by-month loops in `compound-interest.ts` accumulate floating-point errors. BMI division produces irrational numbers.
**How to avoid:** Use `toBeCloseTo(expectedValue, decimalPlaces)` for financial/health results. Use 2 decimal places for finance, 1 for BMI.
**Warning signs:** Tests pass locally with one JS engine, fail in CI with another.

### Pitfall 4: `molecular-weight.ts` Requires Real JSON Data

**What goes wrong:** Tests for `calculateMolecularWeight` fail if `@/data/chemistry/periodic-table.json` can't be resolved.
**Why it happens:** This converter does a real JSON import (periodic table data). Unlike other converters, it has a data dependency.
**How to avoid:** This is NOT a problem — the JSON file is a static asset at `src/data/chemistry/periodic-table.json`. With `vite-tsconfig-paths`, `@/data/chemistry/periodic-table.json` resolves correctly. No mocking needed.
**Warning signs:** Only occurs if `vite-tsconfig-paths` is misconfigured.

### Pitfall 5: `subnet-calculator.ts` Throws on Invalid IP

**What goes wrong:** `calculateSubnet("invalid", 24)` throws an Error (from `ipaddr.js`) rather than returning `null`.
**Why it happens:** The function signature says it throws for invalid IPs (`@throws Error if IP address is invalid`). Unlike other converters that return `null` for bad input, this one throws.
**How to avoid:** Test invalid IP inputs with `expect(() => calculateSubnet('invalid', 24)).toThrow()` rather than `expect(result).toBeNull()`.
**Warning signs:** Tests written expecting `null` return will fail.

### Pitfall 6: `vitest.config.ts` Conflicts with `next.config.ts`

**What goes wrong:** TypeScript errors about conflicting module declarations, or Vitest picking up Next.js-specific plugins.
**Why it happens:** `next.config.ts` imports `next-intl/plugin` and `@next/bundle-analyzer`. These are Node scripts that run at build time, not at test time.
**How to avoid:** Keep `vitest.config.ts` completely independent of `next.config.ts`. Do not import any Next.js config into Vitest config.
**Warning signs:** `Cannot find module 'next-intl/plugin'` in Vitest run.

### Pitfall 7: Coverage Includes React Components (Wrong Include Pattern)

**What goes wrong:** Coverage report shows 0% on hundreds of React components, dragging the aggregate below 75%.
**Why it happens:** Setting `include: ['src/**']` captures everything including components, stores, and registry.
**How to avoid:** Set `include: ['src/lib/converters/**/*.ts']` to scope coverage exactly to the converter functions.
**Warning signs:** Coverage report shows files like `src/app/[locale]/.../page.tsx` with 0% coverage.

---

## Code Examples

Verified patterns from official sources:

### vitest.config.ts (complete, production-ready)

```typescript
// Source: https://nextjs.org/docs/app/guides/testing/vitest (verified 2026-02-24)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/converters/**/*.ts'],
      exclude: [
        'src/lib/converters/**/*.d.ts',
        'src/lib/converters/**/types.ts',
        'src/lib/converters/**/index.ts',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },
  },
})
```

### BB Credit Calculator Tests

```typescript
// File: src/__tests__/lib/converters/network/bb-credit-calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateBBCredits } from '@/lib/converters/network/bb-credit-calculator'

describe('calculateBBCredits', () => {
  it('returns null for zero distance', () => {
    expect(calculateBBCredits({ distanceKm: 0, speedGbps: 8, portId: '1/1' })).toBeNull()
  })

  it('returns null for negative distance', () => {
    expect(calculateBBCredits({ distanceKm: -10, speedGbps: 8, portId: '1/1' })).toBeNull()
  })

  it('calculates correct min credits for 10km 8Gbps', () => {
    const result = calculateBBCredits({ distanceKm: 10, speedGbps: 8, portId: '1/1' })
    expect(result).not.toBeNull()
    expect(result!.minCredits).toBe(47)              // ceil(10 * 8 * 1250 / 2148)
    expect(result!.recommendedCredits).toBe(57)      // ceil(47 * 1.2)
  })

  it('includes Brocade portcfgex CLI string', () => {
    const result = calculateBBCredits({ distanceKm: 10, speedGbps: 8, portId: '1/1' })
    expect(result!.brocadePortcfgex).toContain('portcfgex')
    expect(result!.brocadePortcfgex).toContain('1/1')
  })

  it('generates Cisco MDS fcrxbbcredit config', () => {
    const result = calculateBBCredits({ distanceKm: 10, speedGbps: 8, portId: '1/1' })
    expect(result!.mdsFcrxbbcredit).toContain('switchport fcrxbbcredit')
  })

  it.each([
    [100, 32, '3/1'],
    [500, 64, '2'],
    [1, 4, '0/1'],
  ])('handles distance=%dkm speed=%dGbps portId=%s without error', (distanceKm, speedGbps, portId) => {
    const result = calculateBBCredits({ distanceKm, speedGbps: speedGbps as 4|8|16|32|64|128, portId })
    expect(result).not.toBeNull()
    expect(result!.minCredits).toBeGreaterThan(0)
  })
})
```

### Subnet Calculator Tests

```typescript
// File: src/__tests__/lib/converters/network/subnet-calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateSubnet } from '@/lib/converters/network/subnet-calculator'

describe('calculateSubnet', () => {
  describe('IPv4 standard subnets', () => {
    it('calculates /24 correctly', () => {
      const result = calculateSubnet('192.168.1.0', 24)
      expect(result.networkAddress).toBe('192.168.1.0')
      expect(result.broadcastAddress).toBe('192.168.1.255')
      expect(result.usableHosts).toBe(254n)
      expect(result.firstUsable).toBe('192.168.1.1')
      expect(result.lastUsable).toBe('192.168.1.254')
    })

    it('handles /31 point-to-point (RFC 3021)', () => {
      const result = calculateSubnet('10.0.0.0', 31)
      expect(result.usableHosts).toBe(2n)
    })

    it('handles /32 single host', () => {
      const result = calculateSubnet('192.168.1.1', 32)
      expect(result.usableHosts).toBe(1n)
      expect(result.firstUsable).toBe('192.168.1.1')
    })
  })

  describe('IPv6 subnets', () => {
    it('calculates /64 subnet', () => {
      const result = calculateSubnet('2001:db8::', 64)
      expect(result.ipVersion).toBe(6)
      expect(result.broadcastAddress).toBeNull()
      expect(result.subnetMask).toBeNull()
      expect(result.totalHosts).toBe(BigInt(2) ** BigInt(64))
    })

    it('handles /128 single IPv6 address', () => {
      const result = calculateSubnet('2001:db8::1', 128)
      expect(result.usableHosts).toBe(1n)
    })
  })

  it('throws for invalid IP address', () => {
    expect(() => calculateSubnet('invalid', 24)).toThrow()
  })
})
```

### BMI Calculator Tests

```typescript
// File: src/__tests__/lib/converters/health/bmi.test.ts
import { describe, it, expect } from 'vitest'
import { calculateBMI } from '@/lib/converters/health/bmi'

describe('calculateBMI', () => {
  it.each([
    ['underweight', { weight: 45, weightUnit: 'kg', height: 175, heightUnit: 'cm' }, 'underweight'],
    ['normal', { weight: 70, weightUnit: 'kg', height: 175, heightUnit: 'cm' }, 'normal'],
    ['overweight', { weight: 85, weightUnit: 'kg', height: 175, heightUnit: 'cm' }, 'overweight'],
    ['obese-1', { weight: 100, weightUnit: 'kg', height: 175, heightUnit: 'cm' }, 'obese-1'],
  ] as const)('%s BMI category', (_, input, expectedCategory) => {
    const result = calculateBMI(input)
    expect(result).not.toBeNull()
    expect(result!.category).toBe(expectedCategory)
  })

  it('converts imperial units correctly', () => {
    const result = calculateBMI({ weight: 154, weightUnit: 'lb', height: 69, heightUnit: 'in' })
    expect(result).not.toBeNull()
    expect(result!.bmi).toBeCloseTo(22.7, 1)
  })

  it('returns null for zero weight', () => {
    expect(calculateBMI({ weight: 0, weightUnit: 'kg', height: 175, heightUnit: 'cm' })).toBeNull()
  })

  it('returns null for zero height', () => {
    expect(calculateBMI({ weight: 70, weightUnit: 'kg', height: 0, heightUnit: 'cm' })).toBeNull()
  })

  it('includes healthy weight range', () => {
    const result = calculateBMI({ weight: 70, weightUnit: 'kg', height: 175, heightUnit: 'cm' })
    expect(result!.healthyWeightRange.min).toBeGreaterThan(0)
    expect(result!.healthyWeightRange.max).toBeGreaterThan(result!.healthyWeightRange.min)
  })
})
```

### Compound Interest Calculator Tests

```typescript
// File: src/__tests__/lib/converters/finance/compound-interest.test.ts
import { describe, it, expect } from 'vitest'
import { calculateCompoundInterest } from '@/lib/converters/finance/compound-interest'

describe('calculateCompoundInterest', () => {
  it('returns null for zero years', () => {
    expect(calculateCompoundInterest({
      principal: 1000, interestRate: 5, years: 0,
      compoundFrequency: 'annually', monthlyContribution: 0, contributionTiming: 'end'
    })).toBeNull()
  })

  it('returns null for negative principal', () => {
    expect(calculateCompoundInterest({
      principal: -100, interestRate: 5, years: 10,
      compoundFrequency: 'annually', monthlyContribution: 0, contributionTiming: 'end'
    })).toBeNull()
  })

  it('calculates compound interest without contributions', () => {
    const result = calculateCompoundInterest({
      principal: 1000, interestRate: 10, years: 1,
      compoundFrequency: 'annually', monthlyContribution: 0, contributionTiming: 'end'
    })
    expect(result).not.toBeNull()
    expect(result!.finalBalance).toBeCloseTo(1100, 0)
    expect(result!.totalInterest).toBeCloseTo(100, 0)
  })

  it('includes yearly breakdown', () => {
    const result = calculateCompoundInterest({
      principal: 1000, interestRate: 5, years: 3,
      compoundFrequency: 'monthly', monthlyContribution: 100, contributionTiming: 'end'
    })
    expect(result!.yearlyBreakdown).toHaveLength(3)
    expect(result!.yearlyBreakdown[0].year).toBe(1)
  })

  it.each([
    'annually', 'semi-annually', 'quarterly', 'monthly', 'daily'
  ] as const)('handles %s compounding frequency', (freq) => {
    const result = calculateCompoundInterest({
      principal: 1000, interestRate: 5, years: 1,
      compoundFrequency: freq, monthlyContribution: 0, contributionTiming: 'end'
    })
    expect(result).not.toBeNull()
    expect(result!.finalBalance).toBeGreaterThan(1000)
  })
})
```

### Molecular Weight Calculator Tests

```typescript
// File: src/__tests__/lib/converters/chemistry/molecular-weight.test.ts
// NOTE: This test uses @/data/chemistry/periodic-table.json via vite-tsconfig-paths
// No mocking needed — real JSON data is loaded
import { describe, it, expect } from 'vitest'
import { calculateMolecularWeight } from '@/lib/converters/chemistry/molecular-weight'

describe('calculateMolecularWeight', () => {
  it('returns null for empty formula', () => {
    expect(calculateMolecularWeight({ formula: '' })).toBeNull()
    expect(calculateMolecularWeight({ formula: '   ' })).toBeNull()
  })

  it('returns null for invalid formula', () => {
    expect(calculateMolecularWeight({ formula: 'Xy99' })).toBeNull()
  })

  it('calculates H2O correctly', () => {
    const result = calculateMolecularWeight({ formula: 'H2O' })
    expect(result).not.toBeNull()
    expect(result!.molarMass).toBeCloseTo(18.015, 2)
    expect(result!.totalAtoms).toBe(3)
  })

  it('handles parentheses: Ca(OH)2', () => {
    const result = calculateMolecularWeight({ formula: 'Ca(OH)2' })
    expect(result).not.toBeNull()
    expect(result!.molarMass).toBeCloseTo(74.093, 1)
  })

  it('handles hydrate notation: CuSO4.5H2O', () => {
    const result = calculateMolecularWeight({ formula: 'CuSO4.5H2O' })
    expect(result).not.toBeNull()
    expect(result!.molarMass).toBeCloseTo(249.685, 1)
  })

  it('includes element breakdown', () => {
    const result = calculateMolecularWeight({ formula: 'H2O' })
    expect(result!.elements).toHaveLength(2)
    expect(result!.elements.some(e => e.symbol === 'H')).toBe(true)
    expect(result!.elements.some(e => e.symbol === 'O')).toBe(true)
  })
})
```

### Coverage Threshold Configuration

```typescript
// Source: https://vitest.dev/config/coverage (verified 2026-02-26)
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 75,
    functions: 75,
    branches: 75,
    statements: 75,
  },
  include: ['src/lib/converters/**/*.ts'],
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest + babel-jest | Vitest (native ESM, no transform needed) | 2022-2023 | Faster, native TS support |
| Manual `resolve.alias` in Vite config | `vite-tsconfig-paths` plugin | 2021+ | Reads tsconfig directly, zero maintenance |
| Istanbul coverage only | V8 coverage (default in Vitest 3.2+) with AST remapping | Vitest 3.2.0 | V8 speed + Istanbul accuracy |
| Separate Jest config from tsconfig | Vitest unified config | Vitest 1.0 | Single source of truth |

**Deprecated/outdated:**
- `@swc/jest` + Jest: Replaced by Vitest for React/Next.js projects
- `babel-jest`: Not needed when using Vitest with `@vitejs/plugin-react`
- `ts-jest`: Not needed — Vitest handles TypeScript natively

---

## Open Questions

1. **Whether `environment: 'node'` vs `'jsdom'` should be per-file or global**
   - What we know: The 5 priority converters are pure functions — no DOM needed
   - What's unclear: Future phases will add component tests that need `jsdom`
   - Recommendation: Set global `environment: 'node'` now; use `// @vitest-environment jsdom` per-file when component tests are added in later phases. This keeps Phase 40 fast.

2. **Test file location: co-located vs mirrored `src/__tests__/` directory**
   - What we know: Both approaches work; Next.js guide uses `__tests__/` at root
   - What's unclear: Project convention is not yet established (no existing tests)
   - Recommendation: Use `src/__tests__/lib/converters/` mirrored structure for Phase 40. This separates tests from source cleanly and aligns with the Next.js guide.

3. **Whether `index.ts` re-export barrels should be excluded from coverage**
   - What we know: `src/lib/converters/health/index.ts` and similar files are pure re-exports with no logic
   - What's unclear: How many index files exist across all converter categories
   - Recommendation: Exclude `**/index.ts` from coverage `include` to avoid noise in reports.

---

## Sources

### Primary (HIGH confidence)

- [Next.js Testing Guide — Vitest](https://nextjs.org/docs/app/guides/testing/vitest) — verified 2026-02-24 — packages list, vitest.config.mts example
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage.html) — coverage provider config, threshold syntax
- [Vitest Coverage Config Reference](https://vitest.dev/config/coverage) — `thresholds.lines/functions/branches/statements`, `include` patterns, `perFile` option
- Project source files — directly read 5 converter files to confirm function signatures and edge cases

### Secondary (MEDIUM confidence)

- [next-intl Testing Guide](https://next-intl.dev/docs/environments/testing) — `server.deps.inline: ['next-intl']` config for ESM compatibility; `NextIntlClientProvider` wrapper pattern
- [Vitest Coverage Config Reference](https://vitest.dev/config/coverage) — per-file glob threshold patterns

### Tertiary (LOW confidence)

- WebSearch results for community patterns around BigInt testing in Vitest — flagged, needs validation in practice

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Next.js docs (2026-02-24) and Vitest docs
- Architecture: HIGH — `vite-tsconfig-paths` is the documented approach; config patterns from official sources
- Converter signatures: HIGH — directly read from source files
- Pitfalls: MEDIUM-HIGH — BigInt assertion and throw behavior confirmed from source code; floating point is standard knowledge
- Coverage thresholds: HIGH — verified from Vitest config reference

**Research date:** 2026-02-26
**Valid until:** 2026-04-26 (stable ecosystem — Next.js, Vitest, testing-library are all stable)
