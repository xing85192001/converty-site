# Converters Directory

Pure calculation functions organized by category.

## Directory Structure

```text
converters/
├── health/           # 28 calculators
│   ├── bmi.ts
│   ├── body-fat.ts
│   ├── calorie.ts
│   └── ...
├── finance/          # 24 calculators
│   ├── mortgage.ts
│   ├── compound-interest.ts
│   └── ...
├── math/             # 38 calculators
│   ├── quadratic.ts
│   ├── statistics.ts
│   └── ...
├── photo/            # 22 calculators
├── video/            # 9 calculators
├── web/              # 10 calculators
├── data/             # 3 calculators
├── datetime/         # 8 calculators
├── physics/          # 1 calculator
├── color/            # 1 converter
└── music/            # 1 calculator
```

## File Pattern

Every converter file exports:

```typescript
// 1. Input interface
export interface CalculatorInput {
  param1: number;
  param2: string;
  mode?: "option1" | "option2";
}

// 2. Result interface
export interface CalculatorResult {
  value: number;
  formatted: string;
  steps: string[];      // Show calculation work
  details?: {           // Additional breakdown
    subtotal: number;
  };
}

// 3. Pure calculation function
export function calculateSomething(input: CalculatorInput): CalculatorResult | null {
  // Return null for invalid inputs
  if (input.param1 <= 0) return null;

  const steps: string[] = [];

  // Build steps array to show work
  steps.push(`Step 1: ${input.param1} × ${input.param2}`);

  // Calculate
  const value = /* calculation */;

  steps.push(`Result: ${value}`);

  return {
    value,
    formatted: value.toFixed(2),
    steps,
  };
}
```

## Key Principles

### 1. Pure Functions

- No side effects
- No React imports
- Same input always produces same output
- Deterministic calculations

### 2. Comprehensive Types

- Export all interfaces
- Use union types for modes/options
- Make optional params explicit with `?`

### 3. Steps Array

Include a `steps: string[]` to show calculation work:

```typescript
const steps: string[] = [];
steps.push(`Converting ${input.weight}kg to BMI`);
steps.push(`BMI = weight / height² = ${weight} / ${height}²`);
steps.push(`BMI = ${bmi.toFixed(2)}`);
```

### 4. Null Returns

Return `null` for invalid inputs instead of throwing:

```typescript
export function calculate(input: Input): Result | null {
  if (input.value < 0) return null;  // Invalid
  if (input.divisor === 0) return null;  // Division by zero
  // ... calculation
}
```

### 5. Multiple Modes

Support different calculation modes via union types:

```typescript
export interface DistanceInput {
  mode: "euclidean" | "manhattan" | "haversine";
  x1: number;
  y1: number;
  // ...
}

export function calculateDistance(input: DistanceInput): DistanceResult | null {
  switch (input.mode) {
    case "euclidean": // ...
    case "manhattan": // ...
    case "haversine": // ...
  }
}
```

## Category-Specific Notes

### Health (`health/`)

- Use metric units internally (kg, cm)
- Include health category classifications
- Reference medical formulas in steps

### Finance (`finance/`)

- Handle compound interest periods
- Include amortization schedules where applicable
- Currency-agnostic (formatting done in UI)

### Math (`math/`)

- Show step-by-step solutions
- Handle edge cases (division by zero, negative roots)
- Include formula explanations

### Photo (`photo/`)

- Standard aspect ratios and resolutions
- DPI/PPI conversions
- Color space calculations

## Adding a New Converter

1. Create file: `src/lib/converters/[category]/[name].ts`
2. Export: `interface Input`, `interface Result`, `function calculate`
3. Include `steps[]` for showing work
4. Return `null` for invalid inputs
5. Add to registry: `src/lib/registry/converters.ts`
6. Add translations: `src/messages/*.json`
