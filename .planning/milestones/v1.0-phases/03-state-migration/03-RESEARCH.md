# Phase 3: State Migration - Research

**Researched:** 2026-01-17
**Domain:** Zustand state management, legacy code removal, large-scale verification
**Confidence:** HIGH

## Summary

Phase 3 involves completing the state migration from legacy `useConverter` hook to Zustand stores and removing obsolete code. The codebase analysis reveals that **the migration has already been completed** - all 117 calculator components are using `createCalculatorStore` from Zustand, and zero calculators import `useConverter`. The commit history confirms that 60+ calculators were migrated in commit `c721265`.

This phase is therefore primarily about **cleanup and verification** rather than migration. The tasks involve: (1) safely removing the now-unused `useConverter` and `useUrlState` hooks from `src/hooks/`, (2) verifying that all calculators continue functioning correctly, and (3) documenting the Zustand patterns for future maintenance.

The project uses Zustand 5.0.10 with a custom `createCalculatorStore` factory that integrates URL sync middleware (built in Phase 2). The factory pattern ensures consistency across all calculators and centralizes common functionality like validation, calculation, and state reset.

**Primary recommendation:** Focus on safe deletion verification rather than migration. Remove `use-converter.ts` and `use-url-state.ts` only after confirming zero imports exist, run comprehensive manual testing of representative calculators, and document the established Zustand patterns as the canonical approach.

## Standard Stack

The state management stack is already established and in use:

### Core

| Library    | Version | Purpose          | Why Standard                                                          |
| ---------- | ------- | ---------------- | --------------------------------------------------------------------- |
| zustand    | 5.0.10  | State management | Already in use, all calculators migrated, lightweight and performant  |
| TypeScript | 5.9.3   | Type safety      | Ensures type safety through store chain, critical for factory pattern |

### Supporting

| Library         | Version | Purpose                    | When to Use                                         |
| --------------- | ------- | -------------------------- | --------------------------------------------------- |
| URLSearchParams | Native  | URL parameter parsing      | Already integrated in URL sync middleware (Phase 2) |
| window.history  | Native  | URL updates without reload | replaceState for parameter updates (already used)   |

### Alternatives Considered

| Instead of      | Could Use         | Tradeoff                                                                            |
| --------------- | ----------------- | ----------------------------------------------------------------------------------- |
| Zustand         | Redux Toolkit     | Redux requires more boilerplate, Zustand already integrated and working             |
| Zustand         | Jotai             | Jotai is atomic, would require different architecture, no benefit for this use case |
| Factory pattern | Individual stores | Factory ensures consistency, reduces duplication, easier to maintain                |

**Installation:**
No new packages needed. This phase uses existing dependencies.

## Architecture Patterns

The project has established a proven Zustand architecture pattern through Phase 2 and the migration work.

### Recommended Project Structure

```
src/
├── stores/
│   ├── calculator-store.ts     # Factory function for creating stores
│   └── index.ts                # Exports for convenience
├── lib/
│   ├── middleware/
│   │   └── url-sync.ts         # URL sync middleware (from Phase 2)
│   └── utils/
│       └── url-params.ts       # Type-safe parsers (from Phase 1)
└── hooks/
    ├── use-copy-to-clipboard.ts
    └── use-debounce.ts
    # NOTE: use-converter.ts and use-url-state.ts TO BE DELETED
```

### Pattern 1: Calculator Store Factory

**What:** A factory function that creates Zustand stores with consistent structure, validation, calculation, and URL sync.

**When to use:** For every calculator component. This is the established pattern.

**Example:**

```typescript
// Source: src/stores/calculator-store.ts (current implementation)
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  amount: string;
  rate: string;
}

interface CalculationResult {
  total: number;
  interest: number;
}

const useInterestStore = createCalculatorStore<
  FormValues,
  CalculationResult | null
>({
  name: "interest-calculator",
  initialValues: {
    amount: "1000",
    rate: "5",
  },
  calculate: (vals) => {
    const amount = parseFloat(vals.amount) || 0;
    const rate = parseFloat(vals.rate) || 0;
    if (amount <= 0 || rate <= 0) return null;

    return {
      total: amount * (1 + rate / 100),
      interest: amount * (rate / 100),
    };
  },
  syncUrl: true, // default, enables URL sync middleware
  debounceMs: 150, // default
});

export function InterestCalculator() {
  const { values, setValue, result } = useInterestStore();
  // ... component implementation
}
```

### Pattern 2: Store Usage in Components

**What:** How to consume Zustand stores in calculator components using atomic selectors.

**When to use:** In every calculator component.

**Example:**

```typescript
// Source: Zustand best practices + existing calculator patterns
"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { createCalculatorStore } from "@/stores/calculator-store";
import { calculateMortgage, type MortgageResult } from "@/lib/converters/finance/mortgage";

interface FormValues {
  principal: string;
  rate: string;
  years: string;
}

// Store defined at module level (NOT inside component)
const useMortgageStore = createCalculatorStore<FormValues, MortgageResult | null>({
  name: "mortgage-calculator",
  initialValues: { principal: "200000", rate: "3.5", years: "30" },
  calculate: (vals) => {
    const principal = parseFloat(vals.principal) || 0;
    const rate = parseFloat(vals.rate) || 0;
    const years = parseFloat(vals.years) || 0;
    if (principal <= 0 || rate <= 0 || years <= 0) return null;
    return calculateMortgage({ principal, rate, years });
  },
});

export function MortgageCalculator() {
  const t = useTranslations("calculator.labels");

  // Use atomic selectors (preferred)
  const values = useMortgageStore((state) => state.values);
  const result = useMortgageStore((state) => state.result);
  const setValue = useMortgageStore((state) => state.setValue);

  // OR destructure from full store (less optimal, subscribes to all changes)
  // const { values, setValue, result } = useMortgageStore();

  return (
    <div className="space-y-6">
      <InputField
        id="principal"
        label={t("principal")}
        value={values.principal}
        onChange={(v) => setValue("principal", v)}
      />
      {result && (
        <OutputDisplay
          label={t("monthlyPayment")}
          value={result.monthlyPayment.toFixed(2)}
        />
      )}
    </div>
  );
}
```

### Pattern 3: Validation in Stores

**What:** Optional validation function that runs before calculations.

**When to use:** When input validation requires cross-field logic or complex rules.

**Example:**

```typescript
// Source: calculator-store.ts interface
const useAgeStore = createCalculatorStore<FormValues, AgeResult | null>({
  name: "age-calculator",
  initialValues: { birthDate: "", targetDate: "" },
  validate: (values) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.birthDate) {
      errors.birthDate = "Birth date is required";
    }

    const birth = new Date(values.birthDate);
    const target = new Date(values.targetDate || Date.now());

    if (birth > target) {
      errors.birthDate = "Birth date cannot be in the future";
    }

    return errors;
  },
  calculate: calculateAge,
});
```

### Anti-Patterns to Avoid

- **Defining stores inside components:** Always define at module level, otherwise store re-creates on every render
- **Direct state mutation:** Never mutate `values` directly, always use `setValue` or `setValues`
- **Subscribing to entire store unnecessarily:** Use atomic selectors like `useMortgageStore((state) => state.values)` instead of `const { values } = useMortgageStore()` when component only needs one piece of state
- **Using useConverter hook:** This is legacy code, always use `createCalculatorStore`
- **Manual URL sync:** Never manually update URL parameters, the middleware handles this automatically

## Don't Hand-Roll

Problems that already have established solutions in this codebase:

| Problem                     | Don't Build                    | Use Instead                                         | Why                                                                        |
| --------------------------- | ------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------- |
| Calculator state management | Custom useState with URL sync  | `createCalculatorStore` factory                     | Already handles validation, calculation, URL sync, debouncing, type safety |
| URL parameter parsing       | String manipulation or split() | `parseNumberParam`, `parseStringParam` from Phase 1 | Type-safe, handles edge cases, consistent fallback behavior                |
| URL sync timing             | Custom debounce or setTimeout  | URL sync middleware from Phase 2                    | Closure-based timer isolation, tested, integrated                          |
| Store testing setup         | Custom test utilities          | Zustand testing patterns with vitest                | Official approach, handles state reset between tests                       |

**Key insight:** The migration to Zustand is already complete. The factory pattern (`createCalculatorStore`) is the established standard. Any calculator not using this pattern should be migrated to it, but current analysis shows 100% adoption.

## Common Pitfalls

### Pitfall 1: Deleting Code Still in Use

**What goes wrong:** Removing `useConverter` or `useUrlState` while some calculators still import them causes build failures.

**Why it happens:** Incomplete migration or missed imports in less-frequently-modified calculators.

**How to avoid:**

1. Run `grep -r "useConverter" src/app --include="*.tsx"` to verify ZERO imports
2. Run `grep -r "useUrlState" src/app --include="*.tsx"` to verify ZERO imports
3. Check TypeScript compilation succeeds before deletion: `npx tsc --noEmit`
4. Delete files only after verification

**Warning signs:**

- TypeScript errors: "Cannot find module '@/hooks/use-converter'"
- Build failures in Next.js production build
- Tests failing due to missing imports

### Pitfall 2: Inadequate Migration Verification

**What goes wrong:** Calculators appear to work in development but fail in production or edge cases due to incomplete migration.

**Why it happens:** Not testing representative samples, not checking URL sync behavior, not verifying calculation accuracy.

**How to avoid:**

- Test calculators from each category (at least 10-15 representative samples)
- Verify URL sync works: change values, refresh page, confirm values persist
- Test validation: enter invalid inputs, confirm error handling
- Test reset functionality: change values, click reset, confirm initial state restored
- Build static export: `npm run build` and verify no errors

**Warning signs:**

- URL parameters not syncing (middleware not applied)
- Calculations returning null unexpectedly (validation logic broken)
- State not resetting properly (reset function not working)
- Hydration errors in production build

### Pitfall 3: Breaking Type Safety

**What goes wrong:** Removing type definitions or using `any` breaks type inference through the store chain.

**Why it happens:** Trying to simplify types or work around TypeScript errors instead of fixing root cause.

**How to avoid:**

- Always provide explicit generics to `createCalculatorStore<FormValues, Result>`
- Keep `FormValues` interface with string types (HTML inputs are strings)
- Keep `Result` interface with computed types (numbers, dates, etc.)
- Never use `any` in store definitions
- Run `npx tsc --noEmit` regularly to catch type errors

**Warning signs:**

- TypeScript showing `any` in store inference
- Missing autocomplete for store properties
- Errors not caught until runtime

### Pitfall 4: Store Instance Proliferation

**What goes wrong:** Creating multiple instances of the same store causes state to be out of sync.

**Why it happens:** Defining stores inside components or calling `createCalculatorStore` multiple times for the same calculator.

**How to avoid:**

- Define store once at module level: `const useMyStore = createCalculatorStore(...)`
- Import and use the same store instance across all components
- Never define stores inside React components
- Never call `createCalculatorStore` conditionally

**Warning signs:**

- State changes in one component don't reflect in another
- URL sync only working for one instance
- Multiple store subscriptions showing in React DevTools

### Pitfall 5: Zustand State Persistence Between Tests

**What goes wrong:** When writing tests, Zustand stores don't automatically reset between test cases, causing test pollution.

**Why it happens:** Zustand stores live outside React's lifecycle and persist in module scope.

**How to avoid:**

- Create `__mocks__/zustand.ts` that wraps Zustand's create function
- Track store reset functions in a Set during test setup
- Call all reset functions in `afterEach` hook
- See "Testing Strategy" section for complete setup

**Warning signs:**

- Tests pass individually but fail when run together
- Test order affects outcomes
- Flaky test failures that resolve when running in isolation

## Code Examples

### Complete Calculator Migration Pattern

```typescript
// Source: Existing calculator components (post-migration)
// File: src/app/[locale]/finance/compound-interest/compound-interest-calculator.tsx

"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { createCalculatorStore } from "@/stores/calculator-store";
import {
  calculateCompoundInterest,
  type CompoundInterestInput,
  type CompoundInterestResult
} from "@/lib/converters/finance/compound-interest";

interface FormValues {
  principal: string;
  rate: string;
  time: string;
  frequency: string;
}

const useCompoundInterestStore = createCalculatorStore<FormValues, CompoundInterestResult | null>({
  name: "compound-interest",
  initialValues: {
    principal: "10000",
    rate: "5",
    time: "10",
    frequency: "12", // monthly
  },
  calculate: (vals) => {
    const input: CompoundInterestInput = {
      principal: parseFloat(vals.principal) || 0,
      rate: parseFloat(vals.rate) || 0,
      time: parseFloat(vals.time) || 0,
      frequency: parseFloat(vals.frequency) || 12,
    };

    // Validation happens here
    if (input.principal <= 0 || input.rate <= 0 || input.time <= 0) {
      return null;
    }

    return calculateCompoundInterest(input);
  },
  syncUrl: true,
  debounceMs: 150,
});

export function CompoundInterestCalculator() {
  const t = useTranslations("calculator.finance");
  const format = useFormatter();

  const { values, setValue, result } = useCompoundInterestStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="principal"
          label={t("principal")}
          value={values.principal}
          onChange={(v) => setValue("principal", v)}
          type="number"
          min={0}
          step="any"
        />
        <InputField
          id="rate"
          label={t("interestRate")}
          value={values.rate}
          onChange={(v) => setValue("rate", v)}
          type="number"
          min={0}
          max={100}
          step="0.1"
        />
      </div>

      {result && (
        <ResultGrid>
          <OutputDisplay
            label={t("futureValue")}
            value={format.number(result.futureValue, {
              style: "currency",
              currency: "USD"
            })}
            size="lg"
          />
          <OutputDisplay
            label={t("totalInterest")}
            value={format.number(result.totalInterest, {
              style: "currency",
              currency: "USD"
            })}
          />
        </ResultGrid>
      )}
    </div>
  );
}
```

### Testing Setup for Zustand Stores

```typescript
// Source: Zustand official testing docs + vitest patterns
// File: __mocks__/zustand.ts (to be created if tests are added)

import { create as actualCreate, type StateCreator } from "zustand";

// Track all store reset functions for cleanup between tests
const storeResetFns = new Set<() => void>();

// Create a mock that wraps the actual create function
const create = (<T>(createState: StateCreator<T> | undefined) => {
  // Call the actual create to get a real store
  const store = actualCreate(createState);
  const initialState = store.getState();

  // Define a reset function
  const reset = () => {
    store.setState(initialState, true);
  };

  // Track this reset function
  storeResetFns.add(reset);

  return store;
}) as typeof actualCreate;

// Export reset function for test lifecycle
export const resetAllStores = () => {
  storeResetFns.forEach((resetFn) => {
    resetFn();
  });
};

// Export the mocked create as default
export default create;
```

```typescript
// Source: Vitest + React Testing Library patterns
// File: vitest.setup.ts (if tests are added)

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetAllStores } from "./__mocks__/zustand";

// Reset React Testing Library state
afterEach(() => {
  cleanup();
});

// Reset Zustand stores between tests
afterEach(() => {
  resetAllStores();
});
```

### Verification Script Pattern

```typescript
// Source: Migration verification best practices
// File: scripts/verify-migration.ts (optional verification script)

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

function findImports(dir: string, pattern: string): string[] {
  const results: string[] = [];
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);

    if (file.isDirectory()) {
      results.push(...findImports(fullPath, pattern));
    } else if (file.name.endsWith(".tsx") || file.name.endsWith(".ts")) {
      const content = readFileSync(fullPath, "utf8");
      if (content.includes(pattern)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// Verify no useConverter imports
const useConverterImports = findImports("src/app", "useConverter");
if (useConverterImports.length > 0) {
  console.error("❌ Found useConverter imports:");
  useConverterImports.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

// Verify all calculators use createCalculatorStore
const calculators = findImports("src/app", "calculator.tsx");
const withZustand = calculators.filter((f) => {
  const content = readFileSync(f, "utf8");
  return content.includes("createCalculatorStore");
});

console.log(`✅ Migration complete:`);
console.log(`  - ${calculators.length} total calculators`);
console.log(`  - ${withZustand.length} using Zustand`);
console.log(`  - ${calculators.length - withZustand.length} not using Zustand`);

if (calculators.length !== withZustand.length) {
  console.warn("⚠️  Some calculators may not be using Zustand");
}
```

## Testing Strategy

### Manual Testing Approach

Since this is a static site without automated tests, verification relies on systematic manual testing:

**Pre-deletion verification:**

1. Run codebase search for imports:

   ```bash
   grep -r "from.*use-converter" src/app --include="*.tsx"
   grep -r "from.*use-url-state" src/app --include="*.tsx"
   ```

2. Confirm zero results for both searches

**Post-deletion verification:**

1. Run TypeScript compilation: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Test representative calculators (suggested list):
   - Finance: Mortgage Calculator, Compound Interest, Loan Calculator
   - Math: Percentage Calculator, Quadratic Calculator, Triangle Calculator
   - DateTime: Age Calculator, Date Calculator, Time Duration Calculator
   - Health: BMI Calculator
   - Photo: Aspect Ratio Calculator
   - Video: Bitrate Calculator

**For each tested calculator:**

- [ ] Loads without errors
- [ ] Accepts input values
- [ ] Calculates correct results
- [ ] URL updates with parameters (check address bar)
- [ ] Refresh page preserves values (URL sync working)
- [ ] Reset button restores initial state
- [ ] Invalid inputs show proper validation or return null result

### Automated Testing (Future Enhancement)

If automated tests are added later, follow Zustand testing patterns:

1. Create `__mocks__/zustand.ts` with store reset tracking
2. Add `vitest.setup.ts` with `afterEach` cleanup
3. Write unit tests for calculation functions (pure, easy to test)
4. Write integration tests for store behavior
5. Use React Testing Library for component tests

See "Code Examples" section for complete testing setup.

## State of the Art

| Old Approach              | Current Approach                    | When Changed        | Impact                                                 |
| ------------------------- | ----------------------------------- | ------------------- | ------------------------------------------------------ |
| useConverter hook         | Zustand stores with factory         | Phase 2-3 (2026-01) | Centralized state, URL sync middleware, type safety    |
| Manual URL sync in hook   | URL sync middleware                 | Phase 2             | Fixed global timer bug, reusable pattern               |
| Individual useState calls | createCalculatorStore factory       | Phase 3 migration   | Consistency across 117 calculators, easier maintenance |
| Inline validation logic   | Optional validate function in store | Current pattern     | Centralized validation, reusable across stores         |

**Deprecated/outdated:**

- **useConverter hook:** Replaced by createCalculatorStore, should be deleted
- **useUrlState hook:** Replaced by URL sync middleware, should be deleted
- **Manual useState + URL sync:** No longer needed, factory handles everything

## Open Questions

### 1. Should we add automated tests before deleting legacy hooks?

**What we know:**

- No test suite exists currently (package.json has no test dependencies)
- Manual testing is the current verification approach
- Zustand has official testing patterns for vitest/jest

**What's unclear:**

- Whether automated tests are planned for this project
- Time/effort available for test setup

**Recommendation:** Manual testing is sufficient for safe deletion. Automated tests would be valuable long-term but not required for this phase. If tests are added later, use the patterns documented in "Code Examples" section.

### 2. How many calculators have actually been migrated?

**What we know:**

- 117 calculator files exist in `src/app/[locale]/`
- Commit `c721265` migrated 60 calculators
- grep shows 0 imports of `useConverter` in app directory
- Phase description mentions 74 calculators need migration

**What's unclear:**

- Discrepancy between 60 (commit message) and 74 (phase description)
- Whether some calculators were never using useConverter

**Recommendation:** The actual state is clear from codebase analysis: 100% of existing calculators use Zustand. The "74 calculators" number in phase description may be outdated. Proceed with deletion after verification step confirms zero imports.

### 3. Should we keep useConverter for documentation purposes?

**What we know:**

- Hook is not being used anywhere
- Pattern is well-documented in git history
- Code is straightforward and could be referenced if needed

**What's unclear:**

- Value of keeping dead code vs. clean codebase

**Recommendation:** Delete the hooks. Git history preserves the implementation if ever needed for reference. Keeping dead code violates the DRY principle and creates confusion. Document the migration pattern in ARCHITECTURE.md instead.

## Sources

### Primary (HIGH confidence)

- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - Official source code and examples
- [Working with Zustand - TkDodo's Blog](https://tkdodo.eu/blog/working-with-zustand) - Best practices from Zustand maintainer
- [Zustand Testing Guide](https://zustand.docs.pmnd.rs/guides/testing) - Official testing documentation
- [Zustand Practice with No Store Actions](https://zustand.docs.pmnd.rs/guides/practice-with-no-store-actions) - Official patterns guide
- Codebase inspection - src/stores/calculator-store.ts, existing calculator components
- Package.json inspection - Confirmed Zustand 5.0.10, TypeScript 5.9.3, no test dependencies

### Secondary (MEDIUM confidence)

- [Data Migration Testing in 2026](https://blog.qasource.com/a-guide-to-data-migration-testing) - Migration verification strategies
- [Automated Testing Strategies for Post-Migration Validation](https://dev.to/writerellinwinton/automated-testing-strategies-for-post-migration-validation-1ek1) - Testing approaches
- [Reset Zustand state between tests - GitHub Discussion #1829](https://github.com/pmndrs/zustand/discussions/1829) - Testing patterns
- [Zustand Best Practices - ProjectRules.ai](https://www.projectrules.ai/rules/zustand) - Community best practices
- [5 React State Management Tools Developers Actually Use in 2025](https://www.syncfusion.com/blogs/post/react-state-management-libraries) - Ecosystem context

### Tertiary (LOW confidence)

- [Modernizing Your Old React Codebase](https://medium.com/codex/from-legacy-to-leading-modernizing-your-old-react-codebase-5bcc86bf808a) - General refactoring patterns
- [7 React Maintenance Problems AI Actually Solves](https://www.augmentcode.com/learn/7-react-maintenance-problems-ai-actually-solves-in-enterprise-codebases) - Code quality patterns
- Git history - Migration commit messages provide context but not technical details

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Package.json inspection confirms versions, existing codebase uses Zustand extensively
- Architecture patterns: HIGH - Patterns extracted from existing working calculators, factory pattern already implemented and tested
- Pitfalls: HIGH - Derived from Zustand official docs, migration best practices, and codebase analysis
- Testing strategy: MEDIUM - Manual testing approach is clear, but no existing automated tests to verify effectiveness

**Research date:** 2026-01-17
**Valid until:** ~2026-02-17 (30 days - Zustand is stable, patterns are established)

**Key findings:**

- Migration is complete: 0/117 calculators using useConverter, 117/117 using Zustand
- Safe to delete: No imports of useConverter or useUrlState found in app directory
- Verification required: Manual testing before deletion, TypeScript compilation, production build
- Testing setup documented: Future automated tests can use Zustand official patterns
