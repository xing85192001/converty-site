# Code Style Guide

Converty uses [Biome](https://biomejs.dev/) for linting and formatting.

## Quick Commands

```bash
npm run format     # Auto-format code
npm run check      # Check for lint issues (read-only)
npm run check:fix  # Auto-fix lint issues
npm run type-check # TypeScript compiler check
```

---

## TypeScript

- **Strict mode** enabled (`strict: true` in tsconfig)
- Use **interfaces** for object shapes
- Export types alongside implementations
- **No `any` types** - use proper typing or `unknown`

```typescript
// Good
export interface CalculatorInput {
  value: number;
  unit: string;
}

// Bad
export type CalculatorInput = any;
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `age-calculator.tsx` |
| Components | PascalCase | `AgeCalculator` |
| Functions | camelCase | `calculateAge` |
| Types/Interfaces | PascalCase | `AgeResult` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_AGE_YEARS` |
| CSS classes | kebab-case | `calculator-input` |

---

## Imports

Use absolute imports with `@/` prefix:

```typescript
// Good
import { Button } from "@/components/ui/button";
import { calculateAge } from "@/lib/converters/datetime/age";

// Bad
import { Button } from "../../../components/ui/button";
```

---

## Components

- Use **functional components** with hooks
- Use existing UI components from `src/components/ui/`
- Use converter components from `src/components/converter/`
- Follow established patterns before creating new components

```typescript
"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { InputField } from "@/components/converter";

export function MyCalculator() {
  const t = useTranslations("calculator");
  // ...
}
```

---

## Styling

- **Tailwind CSS** with CSS variables for theming
- Use `cn()` utility for conditional classes
- **Mobile-first** responsive design

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "p-4 rounded-lg",
  isActive && "bg-primary text-primary-foreground"
)} />
```

---

## Common Lint Issues

| Issue | Fix |
|-------|-----|
| Unused imports | Remove them |
| Missing return types | Add explicit types |
| `let` instead of `const` | Use `const` when not reassigning |
| Implicit `any` | Add proper type annotation |
| Console statements | Remove or use proper logging |

---

## Precision & Significant Figures

Engineering and chemistry calculators require careful numeric handling:

```typescript
// Use sufficient decimal places for intermediate calculations
const eulerLoad = (Math.PI ** 2 * E * I) / effectiveLength ** 2;

// Round final display values appropriately
const displayed = parseFloat(eulerLoad.toPrecision(6));
```

**Rules:**

| Domain | Precision | Example |
|--------|-----------|---------|
| Engineering stress/load | 6 significant figures | `245.166 MPa` |
| Molar mass | 4 decimal places | `18.0153 g/mol` |
| pH values | 2 decimal places | `4.74` |
| Conversion factors | NIST reference values | `1 psi = 6894.757293168 Pa` |
| Reynolds number | Integer | `23500` |

**Constants:** Use named constants, not magic numbers:

```typescript
// Good
const Kw = 1e-14;  // Water autoionization constant at 25°C
const R = 8.314;   // Universal gas constant (J/(mol·K))

// Bad
const result = concentration * 1e-14;
```

**Avoid floating-point traps:**

- Compare with tolerance: `Math.abs(a - b) < 1e-10` instead of `a === b`
- Use `Number.isFinite()` to guard against `Infinity` and `NaN`
- Return `null` for invalid inputs rather than throwing

---

## Zod Input Validation

All calculator inputs must have a Zod schema defined in `src/lib/schemas/`.

**String-typed FormValues (health, math, datetime, data):**

```typescript
import { z } from "zod";

export const BmiFormSchema = z.object({
  weight: z.string().refine(
    (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
    { message: "Weight must be a positive number" }
  ),
  height: z.string().refine(
    (v) => !Number.isNaN(Number(v)) && Number(v) > 0,
    { message: "Height must be a positive number" }
  ),
});
```

Use `z.string().refine()` — NOT `z.coerce.number()` — because FormValues fields are `string` type. Using `z.coerce.number()` produces a `number` type incompatible with the string-typed store.

**Number-typed FormValues (finance):**

```typescript
export const LoanFormSchema = z.object({
  principal: z.number().positive({ message: "Principal must be positive" }),
  annualRate: z.number().min(0).max(100),
  termYears: z.number().int().positive(),
});
```

**Wiring to createCalculatorStore:**

```typescript
import type { ZodType } from "zod";

const useStore = createCalculatorStore<Input, Result>({
  name: "bmi",
  initialValues: { weight: "", height: "" },
  calculate: calculateBmi,
  schema: BmiFormSchema,  // Optional — takes precedence over validate:
});
```

`ZodType` must be imported as `import type` (Biome strict compliance). The `z` value import goes in the schema file.

**Field-level errors in components:**

```typescript
const { errors } = useStore();
// errors is Record<keyof FormValues, string | undefined>

<InputField
  error={errors.weight}
  // ...
/>
```

---

## CalculationResult\<T\> Return Type

All converter functions return `CalculationResult<T>` — a discriminated union defined in `src/types/calculation-result.ts`:

```typescript
// { ok: true; value: T } | { ok: false; error: string; code: string }
import type { CalculationResult } from "@/types/calculation-result";

// Success
return { ok: true, value: result };

// Failure (invalid input, division by zero, out-of-range)
return { ok: false, error: "Weight must be positive", code: "INVALID_INPUT" };
```

**Do NOT return `null` from converter functions.** Return `{ ok: false, error: "...", code: "..." }` instead.

**In store actions (handled automatically by createCalculatorStore):**
The adapter pattern unwraps `CalculationResult<T>` inside `setValue`/`setValues`:
- `ok: true` → sets `result` to `value`, clears `calculationError`
- `ok: false` → sets `result` to `null`, sets `calculationError` to `error` string

**In components, display errors:**

```typescript
const { result, calculationError } = useStore();

{calculationError && (
  <div className="text-sm text-destructive mt-2">{calculationError}</div>
)}
```

**Common error codes:**

| Code | Meaning |
|------|---------|
| `INVALID_INPUT` | Out-of-range or non-numeric input |
| `INSUFFICIENT_DATA` | Too few inputs to compute |
| `DIVISION_BY_ZERO` | Would cause ÷0 |
| `UNSUPPORTED` | Input combination not supported |

---

## Pre-commit Checks

Run before every commit:

```bash
npm run type-check  # Should output: "0 errors"
npm run check       # Should output: no errors
npm run build       # Should complete successfully
```

The project has Husky pre-commit hooks that run these automatically.
