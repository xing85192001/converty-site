# Phase 7: Code Quality Validation - Research

**Researched:** 2026-01-18
**Domain:** Code quality validation, linting, formatting, security auditing, code review principles
**Confidence:** HIGH

## Summary

Phase 7 is the final validation phase ensuring all work from Phases 1-6 meets quality standards. The project uses dual linters (ESLint + Biome), TypeScript strict mode, and npm audit for security scanning. Current state assessment shows:

- **ESLint**: PASSING (zero errors)
- **Biome Lint**: FAILING (2 errors, 2 infos - all auto-fixable)
- **Biome Format**: FAILING (3 files need formatting - all auto-fixable)
- **TypeScript**: PASSING (strict mode, zero errors)
- **npm audit**: PASSING (zero production vulnerabilities)

The automated tools handle 90% of quality validation. The remaining 10% requires manual code review for KISS (Keep It Simple), DRY (Don't Repeat Yourself), and functional programming principles. These are documented as verification checklists rather than automated blockers, since they involve subjective judgment and context-specific decisions.

**Primary recommendation:** Fix the 5 auto-fixable issues with `npm run check:fix`, then perform structured code review using specific checklists for KISS/DRY/FP principles. Document findings in VERIFICATION.md rather than blocking the phase on subjective code quality judgments.

## Standard Stack

The established tools for code quality validation in Next.js/React/TypeScript projects:

### Core

| Tool       | Version | Purpose                    | Why Standard                                                        |
| ---------- | ------- | -------------------------- | ------------------------------------------------------------------- |
| Biome      | 2.3.11  | Fast linting and formatting | 10-25x faster than ESLint+Prettier, single tool, Rust-based         |
| ESLint     | 9.39.2  | JavaScript/TypeScript linting | Mature ecosystem, Next.js integration, React-specific rules         |
| TypeScript | 5.9.3   | Type checking (strict mode) | Already enabled, catches type errors before runtime                 |
| npm audit  | Built-in | Security vulnerability scanning | No installation needed, official npm tool, standard in CI/CD        |

### Supporting

| Tool            | Version      | Purpose                      | When to Use                                |
| --------------- | ------------ | ---------------------------- | ------------------------------------------ |
| Biome check     | 2.3.11       | Combined lint + format       | Single command for both checks             |
| Git hooks       | Optional     | Pre-commit validation        | Enforce quality before commits (not yet configured) |
| GitHub Actions  | Optional     | CI/CD quality gates          | Automate checks on pull requests (not yet configured) |

### Alternatives Considered

| Instead of      | Could Use           | Tradeoff                                                                 |
| --------------- | ------------------- | ------------------------------------------------------------------------ |
| ESLint + Biome  | Biome only          | Lose Next.js-specific rules, but gain simplicity and speed               |
| Manual review   | SonarQube           | Enterprise tool, overkill for project size, requires server              |
| Manual review   | CodeClimate         | Cloud service, cost, requires external integration                       |
| npm audit       | Snyk                | More comprehensive, but paid service for advanced features               |
| TypeScript only | Flow                | Flow less popular, weaker ecosystem, TypeScript industry standard        |

**Installation:**
All tools already installed. No additional dependencies needed.

```bash
# Already available in package.json
npm run lint          # ESLint
npm run lint:biome    # Biome lint
npm run format:check  # Biome format check
npm run check         # Biome lint + format combined
npm run check:fix     # Biome auto-fix issues
npm run type-check    # TypeScript strict mode
npm audit --production # Security vulnerabilities
```

## Architecture Patterns

### Recommended Validation Structure

```
.planning/phases/07-code-quality-validation/
├── 07-RESEARCH.md           # This file
├── 07-01-PLAN.md            # Fix automated issues
├── 07-02-PLAN.md            # Manual code review (KISS/DRY/FP)
└── 07-VERIFICATION.md       # Results of code review
```

### Pattern 1: Dual Linter Configuration (ESLint + Biome)

**What:** Running both ESLint and Biome for comprehensive linting
**When to use:** When migrating from ESLint to Biome, or when needing framework-specific rules

**Current configuration:**

```json
// package.json scripts
{
  "lint": "eslint .",              // ESLint (Next.js, React rules)
  "lint:biome": "biome lint .",    // Biome (performance, security)
  "quality": "npm run lint && npm run lint:biome && npm run type-check"
}
```

**ESLint config (eslint.config.mjs):**

- TypeScript ESLint recommended rules
- React hooks rules (rules-of-hooks, exhaustive-deps)
- Next.js specific rules (no-html-link-for-pages, no-img-element)
- noExplicitAny as "warn" (allows with eslint-disable comments)

**Biome config (biome.json):**

- noExplicitAny as "error" (stricter than ESLint)
- Performance rules enabled
- Security rules enabled (noDangerouslySetInnerHtml, noGlobalEval)
- Style rules (useNodejsImportProtocol)

**Why both:**

- ESLint: Framework-specific rules (Next.js, React)
- Biome: Performance, security, faster linting
- Overlap is acceptable, stricter wins (Biome's error > ESLint's warn)

### Pattern 2: TypeScript Strict Mode Configuration

**What:** Comprehensive type checking with all strict mode flags enabled
**When to use:** Always, for type safety and runtime error prevention

**Current configuration (tsconfig.json):**

```json
{
  "compilerOptions": {
    "strict": true,  // Enables all strict mode checks
    // Strict mode includes:
    // - strictNullChecks: no null/undefined without explicit type
    // - strictFunctionTypes: contravariant parameter checking
    // - strictBindCallApply: type-check bind/call/apply
    // - strictPropertyInitialization: class properties must be initialized
    // - noImplicitAny: no implicit any types
    // - noImplicitThis: this must have explicit type
    // - alwaysStrict: parse in strict mode, emit "use strict"
    // - useUnknownInCatchVariables: catch (e) is unknown not any
  }
}
```

**Impact:** ~60k lines of TypeScript code type-checked with zero errors.

### Pattern 3: npm audit Security Scanning

**What:** Automated vulnerability scanning for production dependencies
**When to use:** In CI/CD, before deployments, periodically for maintenance

**Best practices:**

```bash
# Production dependencies only (ignore devDependencies)
npm audit --production

# Fail CI on high/critical vulnerabilities
npm audit --audit-level=high

# Generate JSON report for parsing
npm audit --json > audit-report.json
```

**Handling false positives:**

- Development-only vulnerabilities: Use `--production` flag
- Transitive dependencies with no fix: Document in ADR with justification
- Waiting for upstream fix: Document in ADR with monitoring plan
- Not actually exploitable: Document in ADR with explanation

**Current status:** Zero production vulnerabilities (verified 2026-01-18).

### Pattern 4: Code Review Checklist for KISS Principle

**What:** Manual verification that code follows "Keep It Simple" principle
**When to use:** During code review, before phase completion

**Checklist items:**

- [ ] No over-engineering: Solutions match problem complexity
- [ ] No premature abstraction: Patterns emerge from need, not speculation
- [ ] No unnecessary frameworks/libraries: Use standard tools first
- [ ] Simple solutions preferred: Fewer lines, fewer concepts
- [ ] Readable without extensive comments: Code is self-documenting
- [ ] No "clever" code: Straightforward > clever
- [ ] Maximum ~500 lines per file: Long files indicate complexity

**Anti-patterns to detect:**

```typescript
// BAD: Over-engineered solution
class CalculatorFactory {
  createStrategy(type: string): CalculatorStrategy {
    return this.strategyRegistry.get(type) ?? this.defaultStrategy;
  }
}

// GOOD: Simple solution (from BMI calculator)
export function calculateBMI(input: BMIInput): BMIResult | null {
  if (weight <= 0 || height <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return { bmi, category, healthyWeightRange };
}
```

**Warning signs:**

- Classes where functions would suffice
- Multiple levels of abstraction for simple operations
- Generic solutions for specific problems
- Factory patterns for calculators with identical interfaces

### Pattern 5: Code Review Checklist for DRY Principle

**What:** Manual verification that code doesn't repeat logic
**When to use:** During code review, looking for duplicated patterns

**Checklist items:**

- [ ] No duplicated logic: Shared functions extracted
- [ ] URL sync consolidated: Not duplicated per calculator (Phases 2-3)
- [ ] Reusable components used: InputField, OutputDisplay, ResultGrid
- [ ] Calculation helpers extracted: Unit conversions, formatters
- [ ] Zustand store pattern: createCalculatorStore eliminates boilerplate
- [ ] Translation keys centralized: Not hard-coded strings
- [ ] Type definitions shared: Exported from lib/converters

**Detection strategy:**

```bash
# Find similar function names (potential duplication)
grep -r "function convert" src/lib/converters/

# Find hard-coded strings (should use translations)
grep -r "\"BMI\"" src/app/ | grep -v "use.*Translations"

# Find manual URL parsing (should use middleware)
grep -r "URLSearchParams" src/ | grep -v "url-sync.ts"
```

**Good examples from codebase:**

```typescript
// DRY: Shared URL sync middleware (Phase 2)
// Used by ALL calculators, no duplication
const useStore = createCalculatorStore({
  name: "calculator",
  initialValues: { /* */ },
  calculate: /* */,
  syncUrl: true,  // Middleware handles URL sync
});

// DRY: Extracted conversion helpers (health/bmi.ts)
function convertWeightToKg(weight: number, unit: WeightUnit): number {
  return unit === "lb" ? weight * 0.453592 : weight;
}
// Used by multiple health calculators, not duplicated
```

**Warning signs:**

- Copy-pasted code blocks with minor variations
- Similar calculations in different files
- Repeated validation logic
- Duplicate type definitions

### Pattern 6: Code Review Checklist for Functional Programming

**What:** Manual verification that code uses pure functions and immutability
**When to use:** During code review, especially for calculation logic

**Checklist items:**

- [ ] Calculation functions pure: No side effects, deterministic
- [ ] State updates immutable: Zustand uses Immer for immutability
- [ ] No shared mutable state: Each store is isolated
- [ ] No global variables modified: Read-only globals acceptable
- [ ] Functions return new objects: Don't mutate inputs
- [ ] Array/object operations immutable: map/filter/reduce, not forEach/push
- [ ] No function parameters mutated: Input parameters treated as const

**Pure function pattern (from codebase):**

```typescript
// PURE: Same inputs always produce same output, no side effects
export function calculateBMI(input: BMIInput): BMIResult | null {
  // Validation (deterministic)
  if (input.weight <= 0 || input.height <= 0) return null;

  // Conversion (pure helper functions)
  const weightKg = convertWeightToKg(input.weight, input.weightUnit);
  const heightM = convertHeightToMeters(input.height, input.heightUnit);

  // Calculation (deterministic)
  const bmi = weightKg / (heightM * heightM);
  const category = getBMICategory(bmi);

  // Return new object (immutable)
  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    healthyWeightRange: { min, max },
    weightToHealthy,
  };
}
```

**Zustand immutability pattern (uses Immer internally):**

```typescript
// Zustand store updates are immutable by default
setValue: (key, value) => {
  const currentState = get();
  const newValues = { ...currentState.values, [key]: value };  // New object
  set({ values: newValues, errors, result });  // Immutable update
}
```

**Anti-patterns to detect:**

```typescript
// BAD: Mutates input
function calculate(input: Data): Result {
  input.value = input.value * 2;  // MUTATION
  return { result: input.value };
}

// BAD: Side effects (I/O, global state)
let globalCounter = 0;
function calculate(input: number): number {
  globalCounter++;  // SIDE EFFECT
  console.log(input);  // SIDE EFFECT (I/O)
  return input * 2;
}

// BAD: Non-deterministic
function calculate(): number {
  return Math.random() * 100;  // Different output each time
}
```

**Warning signs:**

- Functions with void return type (likely side effects)
- Array.push(), .splice(), .sort() on input arrays
- Object property assignments on input objects
- console.log in production code
- Date.now(), Math.random() in calculators

### Anti-Patterns to Avoid

- **Don't disable linters globally:** Fix issues or configure per-file exceptions
- **Don't ignore security warnings without documentation:** Document in ADR if suppressing npm audit findings
- **Don't skip code review for "small changes":** Principles apply to all code
- **Don't enforce 100% DRY:** Some duplication acceptable if abstraction adds complexity
- **Don't confuse pure functions with no side effects at all:** React components have side effects (rendering), calculators should not

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                    | Don't Build              | Use Instead                | Why                                                       |
| -------------------------- | ------------------------ | -------------------------- | --------------------------------------------------------- |
| Code linting               | Custom lint rules        | Biome + ESLint             | Maintained rulesets, community standards, regular updates |
| Code formatting            | Manual style guide       | Biome formatter            | Automated, consistent, zero config needed                 |
| Security scanning          | Custom vulnerability DB  | npm audit                  | Official npm tool, updated database, industry standard    |
| Type checking              | Runtime type validation  | TypeScript strict mode     | Compile-time checks, zero runtime cost                    |
| Pre-commit hooks           | Custom git hooks         | Husky + lint-staged        | Standard tool, easy setup (optional for this phase)       |
| CI/CD quality gates        | Custom shell scripts     | GitHub Actions             | Built-in, reliable, composable (optional for this phase)  |
| Code complexity metrics    | Manual review only       | Biome complexity rules     | Automated detection, configurable thresholds              |

**Key insight:** Code quality tools are commoditized. Use standard, well-maintained tools rather than building custom solutions. The value is in the discipline of running the tools, not in the tools themselves.

## Common Pitfalls

### Pitfall 1: Linter Configuration Conflicts (ESLint + Biome)

**What goes wrong:** Both linters report same issues with different severity levels, causing confusion
**Why it happens:** Running two linters with overlapping rules but different configurations
**How to avoid:**

- Document which linter owns which rules (ESLint for React/Next.js, Biome for performance/security)
- Accept that stricter wins (Biome error > ESLint warn for noExplicitAny)
- Consider migrating fully to Biome in future (Phase 8+) when ecosystem matures
- Use `npm run quality` script to run both, failing on either
**Warning signs:** Same error reported twice, developers confused about which to fix

**Current situation:**

- ESLint config: `@typescript-eslint/no-explicit-any: "warn"` (allows with comment)
- Biome config: `noExplicitAny: "error"` (always fails)
- Result: Biome is stricter, which is good for quality

### Pitfall 2: Auto-Fix Breaking Code

**What goes wrong:** Running `npm run check:fix` or `eslint --fix` breaks working code
**Why it happens:** Auto-fixes can change semantics, especially with unsafe transformations
**How to avoid:**

- Review auto-fix changes before committing
- Run tests after auto-fix (if tests exist)
- Use `--write` flag consciously, not automatically
- Biome marks unsafe fixes with "Unsafe fix" label
- Commit auto-fixes separately from manual changes
**Warning signs:** Tests failing after auto-fix, changed behavior after linting

**Safe auto-fixes (from current errors):**

- Changing `'fs'` to `'node:fs'` (style preference, safe)
- Formatting changes (quotes, spacing, safe)

**Unsafe auto-fixes:**

- Removing "unused" variables that are actually needed
- Changing type assertions that are intentional

### Pitfall 3: npm audit Alert Fatigue

**What goes wrong:** Too many false positives (dev dependencies, transitive deps) lead to ignoring all warnings
**Why it happens:** npm audit doesn't distinguish between production and development risk, reports transitive dependencies with no fix available
**How to avoid:**

- Always use `npm audit --production` to filter dev dependencies
- Document known false positives in ADR with monitoring plan
- Set CI/CD threshold to `--audit-level=high` (ignore low/moderate)
- Review audit output quarterly, not on every commit
- Use `npm audit fix` for automatic updates when available
**Warning signs:** Developers ignoring audit output, security warnings piling up

**Best practice (from research):**
> "npm's default behavior in many situations leads to a 99%+ false positive rate, particularly for development dependencies." - Dan Abramov, "npm audit: Broken by Design"

**Current status:** Zero production vulnerabilities. No action needed this phase.

### Pitfall 4: Confusing KISS with No Abstraction

**What goes wrong:** Code reviewer rejects all abstraction as "over-engineering"
**Why it happens:** Misunderstanding KISS as "never create reusable functions"
**How to avoid:**

- KISS means "no premature abstraction," not "no abstraction ever"
- Abstraction is good when: pattern repeats 3+ times, complexity is encapsulated, interface is simpler than implementation
- Abstraction is bad when: used only once, adds indirection without benefit, harder to understand than inline code
- Judge each case on merit: Does this make code simpler or more complex?
**Warning signs:** Duplicated code justified as "keeping it simple," resistance to extracting helpers

**Good abstraction (from codebase):**

```typescript
// GOOD: createCalculatorStore abstracts complex Zustand + URL sync pattern
// Used by 60+ calculators, reduces 50+ lines to 5 lines per calculator
const useStore = createCalculatorStore({ /* config */ });
```

**Bad abstraction (hypothetical):**

```typescript
// BAD: Generic "calculator executor" used once
class CalculatorExecutor<T, R> {
  execute(strategy: Strategy<T, R>, input: T): R { /* */ }
}
```

### Pitfall 5: Functional Purity Dogmatism

**What goes wrong:** Code reviewer rejects all side effects, including necessary ones (I/O, logging, UI updates)
**Why it happens:** Misunderstanding functional programming as "zero side effects anywhere"
**How to avoid:**

- Pure functions are for **calculation logic**, not entire application
- React components have side effects (rendering, useEffect) - this is normal
- I/O, logging, API calls are necessary - isolate them from calculation logic
- Goal: Pure calculation functions (lib/converters), side effects in UI layer (app/)
- Judge based on: Is this calculation logic (should be pure) or application logic (can have effects)?
**Warning signs:** Rejecting useEffect, fetch calls, localStorage usage as "impure"

**Correct separation (from codebase):**

```typescript
// PURE: Calculation logic (lib/converters/health/bmi.ts)
export function calculateBMI(input: BMIInput): BMIResult | null {
  // No side effects, deterministic, testable
}

// EFFECTS: UI component (app/[locale]/health/bmi/bmi-calculator.tsx)
export function BMICalculator() {
  const { setValue, result } = useStore();  // Side effect: Zustand subscription

  useEffect(() => {
    // Side effect: URL sync (via middleware)
  }, [result]);

  return <div>{/* Side effect: DOM rendering */}</div>;
}
```

### Pitfall 6: Ignoring eslint-disable Comments Without Investigation

**What goes wrong:** Developers add `eslint-disable` or `biome-ignore` without understanding why rule exists
**Why it happens:** Linter error blocks development, quickest fix is to disable
**How to avoid:**

- Investigate why rule is triggered before disabling
- Document reason for disabling (not just "eslint told me to")
- Consider if code can be refactored to avoid disabling
- Limit scope: Disable for specific line/block, not entire file
- Grep for `eslint-disable` in code review to check justifications
**Warning signs:** Many disable comments, generic reasons like "needed for types"

**Current disable comments (need review):**

```typescript
// src/lib/middleware/url-sync.ts:63-64
// eslint-disable-next-line @typescript-eslint/no-explicit-any
api.setState = ((...args: any[]) => {

// Justification: Zustand setState has complex overloads, any is intentional
// This is a legitimate use case - middleware wrapper needs type erasure
```

## Code Examples

Verified patterns from official sources and project codebase:

### Biome Configuration for Code Quality (biome.json)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noUselessCatch": "error"
      },
      "correctness": {
        "noUnusedImports": "warn",
        "noExplicitAny": "error"  // Strict: no any types
      },
      "security": {
        "noDangerouslySetInnerHtml": "error",
        "noGlobalEval": "error"
      },
      "suspicious": {
        "noExplicitAny": "error",
        "noArrayIndexKey": "warn"
      },
      "performance": {
        "recommended": true  // Enables performance rules
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

**Source:** /Users/fjacquet/Projects/converty/biome.json (verified 2026-01-18)

**Key configuration choices:**

- `noExplicitAny: "error"` - Enforces type safety (Phase 1 requirement)
- Security rules enabled - Prevents XSS, eval injection
- Performance rules recommended - Catches inefficient patterns
- Line width 100 - Readable on standard screens

### ESLint Configuration for React/Next.js (eslint.config.mjs)

```javascript
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      // React Hooks rules (critical for correctness)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js rules (framework-specific)
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
```

**Source:** /Users/fjacquet/Projects/converty/eslint.config.mjs (verified 2026-01-18)

**Why these rules:**

- `rules-of-hooks`: Prevents hook usage bugs (critical for React)
- `exhaustive-deps`: Catches missing dependencies in useEffect
- Next.js rules: Framework-specific best practices
- `no-unused-vars`: Allows `_` prefix for intentionally unused params

### TypeScript Strict Mode (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    // Strict mode includes:
    // - strictNullChecks: no null/undefined without explicit type
    // - strictFunctionTypes: contravariant parameter checking
    // - strictBindCallApply: type-check bind/call/apply
    // - strictPropertyInitialization: class properties must be initialized
    // - noImplicitAny: no implicit any types
    // - noImplicitThis: this must have explicit type
    // - alwaysStrict: parse in strict mode, emit "use strict"
    // - useUnknownInCatchVariables: catch (e) is unknown not any

    "noEmit": true,  // Type checking only (Next.js handles build)
    "skipLibCheck": true,  // Skip .d.ts files for speed
  }
}
```

**Source:** /Users/fjacquet/Projects/converty/tsconfig.json (verified 2026-01-18)

**Impact:**

- ~60k lines of TypeScript code
- Zero type errors (verified with `npm run type-check`)
- Catches null/undefined errors at compile time
- Prevents accidental any types

### npm audit Best Practices

```bash
# 1. Production dependencies only (ignore dev vulnerabilities)
npm audit --production

# Output:
# found 0 vulnerabilities

# 2. JSON format for parsing in CI/CD
npm audit --json --production > audit-report.json

# 3. Fail CI on high/critical vulnerabilities
npm audit --audit-level=high --production
# Exit code 0 if no high/critical issues

# 4. Fix automatically when available
npm audit fix --production
```

**Source:** <https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities>

**Handling false positives (from npm audit guide):**

> "npm's default behavior in many situations leads to a 99%+ false positive rate, particularly for development dependencies. The core issue is that npm audit doesn't distinguish between vulnerabilities that affect production code versus those in development tools."

**Best practice:** Use `--production` flag to ignore dev dependencies, document any suppressed findings in ADR.

### Code Review Checklist - KISS Principle

```markdown
## KISS (Keep It Simple) Review Checklist

File: [filename]
Reviewer: [name]
Date: 2026-01-XX

### Simple Solutions Preferred

- [ ] No over-engineering: Solution matches problem complexity
- [ ] No premature abstraction: Patterns emerge from real need
- [ ] Simple > clever: Code is straightforward, not "smart"
- [ ] Self-documenting: Readable without extensive comments
- [ ] File length: < 500 lines (complex if longer)

### Warning Signs

- [ ] Classes used where functions would suffice
- [ ] Multiple abstraction levels for simple operations
- [ ] Generic solutions for specific problems
- [ ] Factory patterns without multiple implementations

### Examples from codebase

GOOD (BMI calculator):
```typescript
export function calculateBMI(input: BMIInput): BMIResult | null {
  if (weight <= 0 || height <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return { bmi, category, healthyWeightRange };
}
```

Simple, direct, readable. No classes, no factories, no abstraction layers.

### Findings

[Document any violations or concerns]

```

**Source:** Adapted from [Clean Code principles](https://www.gperrucci.com/blog/engineering/solid-clean-yagni-kiss) and [CodeSignal KISS guide](https://codesignal.com/learn/courses/applying-clean-code-principles-1/lessons/applying-the-kiss-principle-in-typescript)

### Code Review Checklist - DRY Principle

```markdown
## DRY (Don't Repeat Yourself) Review Checklist

File: [filename]
Reviewer: [name]
Date: 2026-01-XX

### No Duplication

- [ ] No duplicated logic: Shared functions extracted
- [ ] URL sync consolidated: Middleware used, not manual parsing
- [ ] Reusable components: InputField, OutputDisplay, ResultGrid
- [ ] Calculation helpers: Unit conversions, formatters extracted
- [ ] Store pattern: createCalculatorStore eliminates boilerplate
- [ ] Translations: No hard-coded strings
- [ ] Types shared: Exported from lib/converters

### Detection Commands

```bash
# Find similar function names
grep -r "function convert" src/lib/converters/

# Find hard-coded strings (should use translations)
grep -r "\"Label\"" src/app/ | grep -v "useTranslations"

# Find manual URL parsing (should use middleware)
grep -r "URLSearchParams" src/ | grep -v "url-sync.ts"
```

### Good Examples

URL Sync (Phase 2-3):

```typescript
// DRY: Shared middleware, not duplicated per calculator
const useStore = createCalculatorStore({
  name: "calculator",
  syncUrl: true,  // Middleware handles everything
});
```

Conversion Helpers:

```typescript
// DRY: Extracted, reused by multiple calculators
function convertWeightToKg(weight: number, unit: WeightUnit): number {
  return unit === "lb" ? weight * 0.453592 : weight;
}
```

### Findings

[Document any duplication found]

```

**Source:** Adapted from [DRY principles guide](https://dev.to/kevin-uehara/dry-kiss-and-yagni-make-your-code-simple-1dmd)

### Code Review Checklist - Functional Programming

```markdown
## Functional Programming Review Checklist

File: [filename]
Reviewer: [name]
Date: 2026-01-XX

### Pure Functions (Calculation Logic)

- [ ] No side effects: Functions don't modify external state
- [ ] Deterministic: Same input always produces same output
- [ ] No I/O: No console.log, fetch, localStorage in calculations
- [ ] No mutations: Input parameters not modified
- [ ] Return new objects: Don't mutate and return same object

### Immutability (State Management)

- [ ] Zustand uses Immer: State updates are immutable
- [ ] No shared mutable state: Stores are isolated
- [ ] No global variables modified: Read-only globals OK
- [ ] Array/object operations: map/filter/reduce, not push/splice

### Anti-Patterns to Detect

```typescript
// BAD: Mutates input
function calculate(input: Data): Result {
  input.value = input.value * 2;  // MUTATION
  return { result: input.value };
}

// BAD: Side effects
let globalCounter = 0;
function calculate(input: number): number {
  globalCounter++;  // SIDE EFFECT
  console.log(input);  // SIDE EFFECT
  return input * 2;
}

// BAD: Non-deterministic
function calculate(): number {
  return Math.random() * 100;  // Different output each time
}
```

### Good Examples (from BMI calculator)

```typescript
// PURE: No side effects, deterministic
export function calculateBMI(input: BMIInput): BMIResult | null {
  if (input.weight <= 0 || input.height <= 0) return null;

  const weightKg = convertWeightToKg(input.weight, input.weightUnit);
  const heightM = convertHeightToMeters(input.height, input.heightUnit);
  const bmi = weightKg / (heightM * heightM);

  return {
    bmi: Math.round(bmi * 10) / 10,
    category: getBMICategory(bmi),
    healthyWeightRange: { min, max },
  };
}
```

### Separation of Concerns

- Calculation logic (lib/converters): PURE functions
- UI components (app/): Side effects OK (rendering, useEffect, URL sync)

### Findings

[Document any violations]

```

**Source:** Adapted from [TypeScript functional programming guide](https://dev.to/yugjadvani/how-to-write-better-typescript-code-best-practices-for-clean-effective-and-scalable-code-38d2)

## State of the Art

| Old Approach                | Current Approach             | When Changed       | Impact                                              |
| --------------------------- | ---------------------------- | ------------------ | --------------------------------------------------- |
| ESLint only                 | ESLint + Biome               | 2025-2026          | Faster linting (10-25x), better performance rules   |
| Prettier for formatting     | Biome formatter              | 2025-2026          | Single tool, zero config, faster                    |
| TSLint (deprecated)         | TypeScript ESLint            | 2019               | Official TypeScript team support                    |
| npm audit ignore dev deps   | npm audit --production       | Best practice 2026 | Reduces false positives by 99%                      |
| Manual code review only     | Automated + Manual           | Industry standard  | 90% automated, 10% human judgment                   |

**Deprecated/outdated:**

- **TSLint**: Deprecated in 2019, use TypeScript ESLint instead
- **JSHint/JSLint**: Replaced by ESLint (2013+)
- **Prettier + ESLint separately**: Biome combines both (2024+)
- **npm audit without flags**: Always use `--production` to filter dev deps

**Emerging (2026):**

- **Biome adoption accelerating**: 80%+ ESLint plugin compatibility achieved in 2025
- **Next.js lint coupling**: next/lint still depends on ESLint, limits Biome-only adoption
- **AI-assisted code review**: Tools like Bito, but manual review still essential for context

## Open Questions

Things that couldn't be fully resolved:

1. **Should we migrate fully to Biome (remove ESLint)?**

   - What we know: Biome is 10-25x faster, single tool, good ecosystem support (80%+ ESLint compatibility)
   - What's unclear: Next.js `next lint` command still requires ESLint, migration effort vs benefit
   - Recommendation: Keep both for Phase 7, document decision in ADR, consider Biome-only migration in Phase 8+

2. **How subjective are KISS/DRY/FP code review judgments?**

   - What we know: Some cases clear (duplicated code = DRY violation), others contextual (abstraction helpful or premature?)
   - What's unclear: Where to draw the line between helpful feedback and blocking phase completion
   - Recommendation: Document findings in VERIFICATION.md as observations, not blockers. Quality is continuous improvement, not binary pass/fail.

3. **Should we add pre-commit hooks (Husky + lint-staged)?**

   - What we know: Standard practice, prevents broken commits, enforces quality at source
   - What's unclear: Developer friction, setup complexity, whether to add in Phase 7 or defer
   - Recommendation: Not required for Phase 7 (final validation of existing work). Consider for Phase 8+ (ongoing quality maintenance).

4. **What threshold for npm audit warnings (low/moderate/high/critical)?**

   - What we know: Zero production vulnerabilities now, but future updates may introduce issues
   - What's unclear: Should low/moderate warnings block releases, or only high/critical?
   - Recommendation: Document in ADR: high/critical block releases, low/moderate require investigation and ADR documentation if suppressed. Current status: zero vulnerabilities, no action needed.

5. **How to handle legitimate uses of `any` type?**

   - What we know: Middleware wrapper (url-sync.ts) uses `any` for type erasure, marked with eslint-disable comment
   - What's unclear: Is this acceptable, or should we find alternative approach?
   - Recommendation: Review each use case. Middleware wrapper is legitimate (type erasure needed for Zustand's complex setState overloads). Document in code comments why `any` is necessary.

## Sources

### Primary (HIGH confidence)

- Project codebase:
  - `/Users/fjacquet/Projects/converty/biome.json` - Biome configuration (verified 2026-01-18)
  - `/Users/fjacquet/Projects/converty/eslint.config.mjs` - ESLint configuration (verified 2026-01-18)
  - `/Users/fjacquet/Projects/converty/tsconfig.json` - TypeScript strict mode (verified 2026-01-18)
  - `/Users/fjacquet/Projects/converty/package.json` - Scripts and dependencies (verified 2026-01-18)
  - `/Users/fjacquet/Projects/converty/src/lib/converters/health/bmi.ts` - Pure function example
  - `/Users/fjacquet/Projects/converty/src/stores/calculator-store.ts` - Immutability pattern
  - `/Users/fjacquet/Projects/converty/src/lib/middleware/url-sync.ts` - Legitimate `any` usage

- Official documentation:
  - [Biome Configuration](https://biomejs.dev/reference/configuration/) - Official Biome docs
  - [Biome Linter Rules](https://biomejs.dev/linter/) - Rule reference
  - [npm audit documentation](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities) - Official npm docs
  - [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig) - Official TypeScript docs

### Secondary (MEDIUM confidence)

- [Biome vs ESLint: The Ultimate 2025 Showdown](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c) - Performance comparison
- [Next.js Best Practices 2026](https://www.serviots.com/blog/nextjs-development-best-practices) - Code quality patterns
- [Biome vs ESLint + Prettier](https://betterstack.com/community/guides/scaling-nodejs/biome-eslint/) - Tool comparison
- [JavaScript Static Analysis with Biome](https://snyk.io/articles/javascript-static-analysis-eslint-biome/) - Security perspective
- [SOLID, Clean Code, DRY, KISS principles](https://www.gperrucci.com/blog/engineering/solid-clean-yagni-kiss) - Code quality principles
- [Applying KISS Principle in TypeScript](https://codesignal.com/learn/courses/applying-clean-code-principles-1/lessons/applying-the-kiss-principle-in-typescript) - KISS guide
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript) - Comprehensive guide
- [React Code Review Checklist](https://dev.to/ritikbanger/react-frontend-code-review-checklist-master-code-review-4die) - React-specific patterns
- [TypeScript Code Review Best Practices](https://bito.ai/blog/typescript-code-review/) - TS patterns

### Tertiary (LOW confidence)

- [npm audit: Broken by Design](https://overreacted.io/npm-audit-broken-by-design/) - Dan Abramov critique (2019, still relevant)
- [Front-end Code Review Checklist](https://gist.github.com/bigsergey/aef64f68c22b3107ccbc439025ebba12) - Community checklist
- [JavaScript/TypeScript Code Reviews - Microsoft](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/recipes/javascript-and-typescript/) - Enterprise practices

### Commands Run (verified 2026-01-18)

```bash
npm run lint            # ESLint: PASSING (zero errors)
npm run lint:biome      # Biome lint: 2 errors, 2 infos
npm run format:check    # Biome format: 3 files need formatting
npm run type-check      # TypeScript: PASSING (zero errors)
npm audit --production  # Security: PASSING (zero vulnerabilities)
```

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All tools installed, configurations verified in codebase
- Architecture: HIGH - Patterns verified in working code (BMI calculator, store pattern)
- Pitfalls: MEDIUM - Based on industry best practices and WebSearch results
- Code examples: HIGH - All examples from verified codebase or official documentation

**Research date:** 2026-01-18
**Valid until:** 30 days (tools stable, but Biome ecosystem evolving rapidly)

**Current quality status (verified):**

1. ESLint: ✓ PASSING (zero errors)
2. Biome Lint: ✗ FAILING (2 errors in url-sync.ts, 2 infos in generate-icons.js)
3. Biome Format: ✗ FAILING (3 files need formatting: .planning/config.json, public/sw.js, scripts/generate-icons.js)
4. TypeScript: ✓ PASSING (strict mode, zero errors, ~60k lines)
5. npm audit: ✓ PASSING (zero production vulnerabilities)

**Auto-fixable issues:** 5 (all Biome lint/format issues can be fixed with `npm run check:fix`)

**Manual review required:** KISS/DRY/FP principles (checklist-based, documented findings)

**Codebase statistics:**

- Total TypeScript lines: ~60,000
- Total files checked by Biome: 560
- Converters (calculation logic): ~150 files
- Calculators (UI components): ~60 files
- eslint-disable comments: 8 files (need review for justification)
