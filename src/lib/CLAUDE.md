# Lib Directory

Core utilities, calculation logic, and registry configuration.

## Structure

```text
lib/
├── converters/      # Calculation logic (pure functions)
├── registry/        # Category and converter metadata
└── utils.ts         # Shared utilities (cn, etc.)
```

## Converters (`converters/`)

**Pure calculation functions** - no React, no UI, just math.

### Organization by Category

```text
converters/
├── health/          # BMI, body fat, calorie calculators
├── finance/         # Loans, interest, investment calculators
├── datetime/        # Age, date difference, time zone
├── math/            # Algebra, geometry, statistics
├── photo/           # Aspect ratio, DPI, exposure
├── video/           # Bitrate, frame rate, resolution
├── web/             # Color, encoding, hash
├── data/            # File size, bandwidth
├── physics/         # Speed, force, energy
└── color/           # RGB/HEX/HSL conversion
```

### Converter File Pattern

Each converter exports:

1. **Input interface** - typed parameters
2. **Result interface** - typed return values
3. **Calculate function** - pure function

```typescript
// Example: src/lib/converters/health/bmi.ts

export interface BmiInput {
  weight: number;  // kg
  height: number;  // cm
}

export interface BmiResult {
  bmi: number;
  category: string;
  healthyWeightRange: { min: number; max: number };
}

export function calculateBmi(input: BmiInput): BmiResult {
  const heightM = input.height / 100;
  const bmi = input.weight / (heightM * heightM);
  // ... rest of calculation
  return { bmi, category, healthyWeightRange };
}
```

### Key Principles

- **Pure functions**: No side effects, same input = same output
- **No React imports**: Keep calculations framework-agnostic
- **Typed interfaces**: Full TypeScript for inputs/outputs
- **Include steps**: Many calculators return `steps[]` for showing work

## Registry (`registry/`)

Metadata for categories and converters.

### `categories.ts`

Defines category structure:

```typescript
interface CategoryMeta {
  id: string;
  slug: string;         // URL path segment
  name: string;         // Display name (use translations in UI)
  description: string;
  icon: LucideIcon;
  subcategories?: SubcategoryMeta[];
}
```

### `converters.ts`

Defines converter metadata:

```typescript
interface ConverterMeta {
  id: string;           // kebab-case, unique
  slug: string;         // URL path segment
  name: string;         // Display name
  description: string;
  category: string;     // Parent category id
  subcategory?: string; // Optional grouping
  keywords: string[];   // Search terms
  icon: LucideIcon;
  featured?: boolean;
}
```

### Adding a New Converter

1. Create calculation file in appropriate `converters/[category]/`
2. Add entry to `converters.ts` with matching `id` (kebab-case)
3. Add translations to all 4 locale files using same kebab-case key
4. Create UI in `src/app/[locale]/[category]/[slug]/`

## Utils (`utils.ts`)

Shared utilities:

```typescript
// Class name merger (Tailwind + conditional classes)
import { cn } from "@/lib/utils";

cn("base-class", conditional && "conditional-class", className);
```
