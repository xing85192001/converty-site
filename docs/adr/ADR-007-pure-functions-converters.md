# ADR-007: Pure Functions for All Calculation Logic

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Calculator logic could be implemented in several ways:
1. **Inline in React components** — simple but untestable, mixes concerns
2. **Class-based calculators** — OOP encapsulation but verbose and harder to tree-shake
3. **Pure functions in separate modules** — testable, composable, framework-agnostic
4. **Web Workers** — async calculation for expensive operations

For the vast majority of calculators, calculations complete in microseconds. The main concern is correctness and testability, not performance.

## Decision

All calculation logic lives in `src/lib/converters/{category}/{name}.ts` as **pure TypeScript functions** with no React imports, no side effects, and no external state.

**Standard module exports:**
```typescript
// 1. Input interface — all user-controlled parameters
export interface CalculatorInput {
  param1: number;
  mode?: "option1" | "option2";
}

// 2. Result interface — all computed outputs
export interface CalculatorResult {
  value: number;
  formatted: string;
  steps: string[];      // Always include — shows calculation work
}

// 3. Calculate function — pure, returns null for invalid inputs
export function calculateSomething(input: CalculatorInput): CalculatorResult | null {
  if (input.param1 <= 0) return null;  // Guard, never throw
  // ...
}
```

**Return `null` convention:** Invalid inputs return `null` rather than throwing exceptions. UI components treat `null` as "no result yet" and show nothing rather than an error.

**Steps array:** Every result includes a human-readable `steps: string[]` documenting the calculation. This makes the calculator educational and auditable.

## Consequences

**Positive:**
- Calculation logic is fully testable without rendering React components
- Framework-agnostic: could be reused in CLI tools, APIs, or other UIs
- `null` return eliminates try/catch boilerplate in UI components
- `steps[]` builds user trust and aids debugging
- Tree-shaking: only imported calculator modules are included in bundles

**Negative / Constraints:**
- `null` return means the UI must always check before rendering results
- No shared mutable state between calculators (intentional, but occasionally inconvenient)
- Complex calculators with many intermediate values require careful interface design
- No Web Worker offloading means very expensive calculations (e.g., large chemistry simulations) could block the main thread — acceptable for current calculator complexity

**Precision rules enforced by convention:**
| Domain | Rule |
|--------|------|
| Engineering | 6 significant figures (`toPrecision(6)`) |
| Molar mass | 4 decimal places (`.toFixed(4)`) |
| Currency | 2 decimal places (`.toFixed(2)`) |
| Floating-point equality | Tolerance: `Math.abs(a - b) < 1e-10` |
