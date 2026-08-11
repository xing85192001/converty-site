# Code Conventions for Converty

## Naming

- **Files**: kebab-case (`age-calculator.tsx`, `compound-interest.ts`)
- **Components**: PascalCase (`AgeCalculator`, `InputField`)
- **Functions**: camelCase (`calculateAge`, `formatCurrency`)
- **Types/Interfaces**: PascalCase (`AgeResult`, `BMIInput`)
- **Translation keys**: kebab-case matching registry IDs (`compound-interest`, `body-fat`)

## TypeScript

- Strict mode enabled (no implicit any)
- Export interfaces alongside implementations
- Pure functions return `null` for invalid inputs

## Components

- Use `"use client"` directive for client components
- Use `useTranslations()` for i18n in client components
- Use `getTranslations()` in server components
- Compose with: `InputField`, `OutputDisplay`, `ResultGrid`
- Use `cn()` utility for conditional Tailwind classes

## State Management

- **Preferred**: Zustand store factory (`createCalculatorStore`)
- **Legacy**: `useConverter` hook (being phased out)
- URL sync for shareable calculator links

## i18n Pattern

```typescript
// Client component
const t = useTranslations("calculator.labels");
const tResults = useTranslations("calculator.results");

// Server component
const t = await getTranslations("converters.calculator-id");
```

## File Organization

- Calculation logic: `src/lib/converters/[category]/[name].ts`
- Calculator component: `src/app/[locale]/[category]/[name]/[name]-calculator.tsx`
- Page: `src/app/[locale]/[category]/[name]/page.tsx`
- Translations: `src/messages/{en,fr,de,it}.json`

## Linting

- Biome for linting and formatting
- 100-char line limit
- Double quotes
- ES5 trailing commas

**Per-file workflow**: Always lint each file immediately after editing:

```bash
npm run lint -- src/app/[locale]/finance/loan/loan-calculator.tsx
```

This catches issues early before they accumulate across multiple files.

## Design Principles (MANDATORY)

### 1. Three-Layer Pattern

**Rule**: "Logic never lives in the Component."

1. Write Pure Logic in `src/lib/converters/` first (no React code)
2. Create Zustand Store using `createCalculatorStore` factory
3. Build UI Component only after logic and store are defined

### 2. Design System Consistency

**Rule**: "Use Semantic Variables, not arbitrary colors."

- ❌ DO NOT: `bg-blue-500`, `text-gray-700`
- ✅ ALWAYS: `bg-primary`, `text-muted-foreground`, `border-input`
- Use CSS variables from `globals.css`
- Use Radix UI primitives for interactive elements

### 3. Component Reusability ("Lego" Approach)

**Rule**: "Don't build an input; configure the InputField."

- ❌ Never use raw HTML `<input>` tags
- ✅ Always use `InputField`, `OutputDisplay`, `ResultGrid`
- Only create custom UI if existing components can't support the visualization

### 4. State Management Discipline

**Rule**: "URL Persistence is mandatory."

- ❌ DO NOT use `useState` for calculation parameters
- ✅ ALWAYS use `createCalculatorStore` with URL syncing
- All calculator state must be shareable via URL

### 5. Mobile-First & Responsive

**Rule**: "Layouts must break gracefully."

- `ResultGrid` defaults to 1 column (mobile)
- Use breakpoints: `sm:grid-cols-2`, `lg:grid-cols-3`
