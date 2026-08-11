# Stack Research: Infrastructure Upgrade

**Research Date:** 2026-01-17
**Focus:** Technologies for PWA, state management, type safety, and documentation

## PWA Implementation

### Recommended: Manual Service Worker (No Dependencies)

**Status:** ✓ Recommended
**Confidence:** High

**Choice:** Custom service worker implementation using Workbox strategies

**Rationale:**

- `next-pwa` package is deprecated ([shadowwalker/next-pwa](https://github.com/shadowwalker/next-pwa))
- Next.js 16 uses Turbopack by default, but Serwist requires Webpack
- Manual implementation with no extra packages provides full control ([Next.js PWA offline capability](https://adropincalm.com/blog/nextjs-offline-service-worker/))
- Compatible with static export (`output: 'export'`)
- Service worker placed in public folder, enabled in production only

**Implementation:**

```typescript
// public/service-worker.ts
// Custom service worker with Workbox runtime strategies
// - CacheFirst for static assets
// - NetworkFirst for calculators (offline fallback)
// - No precaching (not needed for static export)
```

**What NOT to use:**

- ❌ `next-pwa` - Deprecated package
- ❌ `Serwist` - Requires Webpack, conflicts with Turbopack
- ❌ Server-based PWA solutions - Not compatible with static export

**References:**

- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Build Next.js 16 PWA with offline support - LogRocket](https://blog.logrocket.com/nextjs-16-pwa-offline-support)
- [Next.js PWA in 10 Minutes](https://www.buildwithmatija.com/blog/turn-nextjs-16-app-into-pwa)

### Web App Manifest

**Package:** None (manual manifest.json)
**Confidence:** High

**Requirements:**

```json
{
  "name": "Converty",
  "short_name": "Converty",
  "description": "200+ calculators and converters",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Constraints:**

- HTTPS required (localhost exception for dev)
- Must register service worker with fetch event
- Static export compatible

---

## State Management

### Zustand v5.0.10 (Current)

**Status:** ✓ Already installed
**Confidence:** High

**Middleware Stack:**

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Recommended pattern: persist + immer combined
const useStore = create(
  persist(
    immer((set) => ({
      // state and actions with direct mutations
    })),
    { name: "calculator-storage" }
  )
);
```

**URL Persistence Pattern:**

- Custom middleware for URL parameter sync
- Per-store debounce timer (fix global timer bug)
- Functional approach - no shared mutable state

**Implementation:**

```typescript
// src/lib/middleware/url-sync.ts
export const urlSync = <T>(config) => (set, get, api) => {
  let debounceTimer: NodeJS.Timeout | null = null; // Per-store instance

  // Subscribe to state changes
  api.subscribe((state) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Update URL params
    }, 500); // Increased from 150ms
  });

  return config(set, get, api);
};
```

**What to migrate:**

- 74 calculators from `useConverter` hook to Zustand stores
- Consolidate URL sync logic (currently duplicated)
- Remove global debounce timer

**References:**

- [Zustand Middleware Documentation](https://github.com/pmndrs/zustand/blob/main/docs/middlewares/persist.md)
- [Zustand URL Persistence Example](https://github.com/pmndrs/zustand/blob/main/docs/middlewares/persist.md#custom-storage)

---

## Type Safety

### TypeScript 5.9.3 Strict Mode

**Current:** noExplicitAny disabled
**Target:** Full strict mode enabled
**Confidence:** High

**Migration Strategy:**

```json
// tsconfig.json - Enable incrementally
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Approach:**

1. Enable `noImplicitAny` first (catches most issues)
2. Fix type errors file-by-file
3. Enable other strict flags incrementally
4. Use TypeScript 6.0 defaults (strict on by default)

**Key Areas Needing Fixes:**

- URL state parsing (type coercion from strings)
- Calculator store generics
- useConverter hook (has eslint-disable comments)
- Event handlers with proper types

**Tools:**

- VS Code built-in TypeScript diagnostics
- `npx tsc --noEmit` for full type checking
- Biome linter with noExplicitAny enabled

**References:**

- [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/)
- [TypeScript Strict Option Guide](https://betterstack.com/community/guides/scaling-nodejs/typescript-strict-option/)
- [Incremental Migration Guide](https://kevinwil.de/incremental-migration/)
- [Migrating to Strict Mode](https://alanharper.com.au/posts/2021-02-15-migrating-typescript-strict)

---

## PDF Generation

### jsPDF Latest (v2.5.2)

**Current:** v4.0.0 (2018 - 6 years old!)
**Target:** v2.5.2 (latest stable)
**Confidence:** Medium (breaking changes expected)

**Migration Notes:**

- Major version rollback (v4 → v2) indicates significant API changes
- Need to update `src/lib/utils/pdf-export.ts`
- Test PDF generation thoroughly after upgrade

**API Changes:**

- Version 2.x has different API than v4.0.0
- Check compatibility mode: `doc.compatAPI()` for backward compatibility
- Advanced API mode: `doc.advancedAPI()` for new features

**Implementation:**

```typescript
// Upgrade command
npm install jspdf@latest

// Test PDF export for all affected calculators
// Update API calls if needed
```

**What to verify:**

- DoF table PDF export still works
- Chart PDF exports still work
- Font rendering unchanged
- File size reasonable

**References:**

- [jsPDF GitHub](https://github.com/parallax/jspdf)
- [jsPDF Documentation](https://github.com/parallax/jspdf/blob/master/docs/jsPDF.html)

---

## Documentation Tooling

### CHANGELOG Generation

**Recommended:** `git-cliff` + Keep a Changelog format
**Confidence:** High

**Stack:**

```bash
# Install git-cliff (Rust-based, fast)
npm install --save-dev git-cliff

# Or use conventional-changelog (Node-based)
npm install --save-dev conventional-changelog-cli
```

**Format:** [Keep a Changelog](https://keepachangelog.com/) standard

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Feature description

### Changed

- Change description

### Fixed

- Bug fix description

## [1.0.0] - 2026-01-17

...
```

**Automation:**

- GitHub Action for automatic changelog generation
- Conventional Commits integration
- Backfill recent changes manually first

**References:**

- [git-cliff](https://git-cliff.org/)
- [Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Automate CHANGELOGs](https://dev.to/devsatasurion/automate-changelogs-to-ease-your-release-282)

### Contributing Guidelines

**Template:** GitHub's CONTRIBUTING.md standard
**Confidence:** High

```markdown
# Contributing to Converty

## Development Setup

## Coding Standards

## Calculator Pattern

## Pull Request Process

## Code Review Guidelines
```

### Architecture Decision Records (ADRs)

**Format:** Markdown ADRs in `.planning/decisions/`
**Template:** [MADR](https://adr.github.io/madr/)

```markdown
# ADR-001: Migrate to Zustand State Management

## Status

Accepted

## Context

74 calculators use legacy useConverter hook with global debounce timer bug.

## Decision

Migrate all calculators to Zustand stores with per-store debounce.

## Consequences

- Consolidated state management pattern
- Fixes concurrent calculator bug
- Removes technical debt
```

---

## Linting & Formatting

### Biome v2.3.11 (Current)

**Status:** ✓ Already configured
**Updates needed:**

```json
// biome.json
{
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "error" // Enable strict type checking
      },
      "a11y": {
        "useKeyWithClickEvents": "warn", // Enable a11y (future)
        "useButtonType": "warn"
      }
    }
  }
}
```

---

## Summary

| Technology        | Current  | Target        | Migration Complexity |
| ----------------- | -------- | ------------- | -------------------- |
| PWA               | None     | Custom SW     | Medium               |
| Zustand           | 5.0.10   | 5.0.10 (keep) | Low                  |
| TypeScript Strict | Disabled | Enabled       | High                 |
| jsPDF             | 4.0.0    | 2.5.2         | Medium               |
| Changelog         | None     | git-cliff     | Low                  |
| Documentation     | Minimal  | Complete      | Medium               |

**Critical Path:**

1. TypeScript strict mode (blocks everything else)
2. State management migration (touches all calculators)
3. PWA implementation (new feature)
4. Documentation (parallel to development)
5. jsPDF upgrade (isolated change)

**Estimated Effort:**

- TypeScript: 40 hours (74 calculators + shared code)
- State migration: 30 hours (consolidate + migrate)
- PWA: 10 hours (service worker + manifest)
- Documentation: 15 hours (CHANGELOG + CONTRIBUTING + ADRs)
- jsPDF: 5 hours (upgrade + test)
- **Total: ~100 hours**

---

---

# Stack Research: Engineering & Chemistry Calculators

**Research Date:** 2026-01-27
**Focus:** Libraries for Engineering/CAD and Chemistry/Science calculator categories
**Constraint:** Client-side only, static export compatible, code-splitting critical

## Executive Summary

**Recommendation:** Add mathjs (with tree-shaking), convert (unit conversion), recharts (visualization), and lightweight chemistry data packages. Total estimated bundle addition: ~60-80 KB gzipped when properly code-split by category.

**Key Findings:**

- **Math:** mathjs offers comprehensive solution with excellent tree-shaking support (209 KB full → ~20-30 KB with tree-shaking)
- **Units:** Modern "convert" package is superior to legacy "convert-units" (smaller, faster, type-safe)
- **Chemistry:** Use JSON data files for periodic table (~10-20 KB) + lightweight formula parsing
- **Visualization:** Recharts integrates natively with React (50-139 KB depending on components used)
- **Critical:** All libraries are client-side compatible with Next.js static export

---

## Engineering & CAD Stack

### Core Math Libraries

#### Recommended: mathjs v14+ (with tree-shaking)

**Package:** `mathjs`
**Version:** Latest (14.x)
**Bundle Size:** 209 KB full (minified + gzipped), but tree-shaking reduces to ~20-30 KB for typical usage
**Confidence:** HIGH

**Why this:**

- Comprehensive engineering math (trigonometry, calculus, matrices, complex numbers)
- Built-in unit conversion system (supports 50+ unit types)
- Excellent tree-shaking support since v6.0 (ES modules)
- Active maintenance (popular: 15k+ GitHub stars)
- Works perfectly with Next.js static export (client-side only)

**Tree-Shaking Strategy:**

```typescript
// Import only needed functions - webpack/turbopack tree-shakes automatically
import { add, multiply, sin, cos } from 'mathjs';

// Or use lightweight number-only version (no BigNumber, Fraction, etc.)
import { add, multiply } from 'mathjs/number';
```

**Integration Pattern:**

```typescript
// src/lib/converters/engineering/beam-deflection.ts
import { multiply, divide, pow } from 'mathjs/number';

export function calculateBeamDeflection(
  load: number,
  length: number,
  momentOfInertia: number,
  elasticModulus: number
): number {
  // Simple beam deflection formula
  return multiply(divide(load, pow(length, 3)), divide(1, multiply(48, elasticModulus, momentOfInertia)));
}
```

**Alternative Considered:** Algebrite (86.9 KB gzipped)

- Symbolic computation library
- **Why rejected:** Most engineering calculators need numerical computation, not symbolic algebra
- **When to use:** If adding symbolic equation solving (e.g., "solve for x")
- **Decision:** Start with mathjs, add algebrite only if symbolic features needed

**References:**

- [mathjs Official Documentation](https://mathjs.org/)
- [mathjs Custom Bundling Guide](https://mathjs.org/docs/custom_bundling.html)
- [mathjs Bundlephobia](https://bundlephobia.com/package/mathjs)

---

### Unit Conversion

#### Recommended: convert v5+

**Package:** `convert` (by Jonah Snider)
**Version:** Latest (5.13.1+)
**Bundle Size:** Estimated 3-5 KB gzipped (lightweight, not on bundlephobia yet but marketed as "smallest")
**Confidence:** HIGH

**Why this:**

- Modern, actively maintained (published 19 days ago as of research date)
- Type-safe TypeScript definitions
- Faster than alternatives (3 million+ conversions/second)
- Smaller bundle than legacy alternatives
- Simple API: `convert(5, 'miles').to('kilometers')`

**Alternative Considered:** convert-units v2.3.4

- **Why rejected:** Outdated (8 years old), larger bundle, no active maintenance
- **Migration note:** If already using convert-units, migrate to "convert" for better DX

**Alternative Considered:** mathjs built-in units

- mathjs includes unit conversion: `math.unit(5, 'km').to('miles')`
- **Trade-off:** If already using mathjs for math operations, use its units to avoid extra dependency
- **Recommendation:** Use mathjs units if already in bundle, otherwise use "convert" standalone

**Integration Pattern:**

```typescript
// src/lib/converters/engineering/pressure-converter.ts
import { convert } from 'convert';

export function convertPressure(value: number, from: string, to: string): number {
  return convert(value, from).to(to);
}

// Usage with mathjs units (alternative)
import { unit } from 'mathjs';

export function convertPressureWithMathjs(value: number, from: string, to: string): number {
  return unit(value, from).toNumber(to);
}
```

**Decision:** Use mathjs units if mathjs is already imported for calculations, otherwise use standalone "convert" package.

**References:**

- [convert npm package](https://www.npmjs.com/package/convert)
- [convert GitHub](https://github.com/jonahsnider/convert)

---

### Visualization

#### Recommended: recharts v3.6+

**Package:** `recharts`
**Version:** Latest (3.6.0+)
**Bundle Size:** ~50-139 KB gzipped (varies by components imported)
**Confidence:** HIGH

**Why this:**

- Native React integration (declarative components)
- Built on D3 submodules (battle-tested)
- Responsive by default
- Good performance for moderate datasets
- Matches existing project patterns (React components, Tailwind styling)
- Well-documented, active community

**Use Cases:**

- Stress-strain curves
- Load-deflection diagrams
- Frequency response plots
- Phase diagrams (chemistry)

**Alternative Considered:** plotly.js

- More feature-rich (3D, scientific plotting, interactive modebars)
- **Why rejected:** Heavier bundle, overkill for most calculator visualizations
- **When to use:** If 3D plots or advanced scientific visualizations needed

**Alternative Considered:** chart.js + react-chartjs-2

- Lighter bundle option
- **Trade-off:** Less declarative API, more imperative setup
- **Decision:** Recharts preferred for React-native DX

**Integration Pattern:**

```typescript
// src/components/charts/stress-strain-chart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StressStrainChart({ data }: { data: Array<{ strain: number; stress: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="strain" label={{ value: 'Strain (ε)', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Stress (σ)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Line type="monotone" dataKey="stress" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

**Code Splitting Strategy:**

```typescript
// Only import in pages that need charts
import dynamic from 'next/dynamic';

const StressStrainChart = dynamic(() => import('@/components/charts/stress-strain-chart'), {
  ssr: false, // Client-side only
});
```

**References:**

- [Recharts Official Site](https://recharts.org/)
- [Recharts GitHub](https://github.com/recharts/recharts)
- [Best of JS Recharts](https://bestofjs.org/projects/recharts)

---

### Reference Data

#### Material Properties: JSON Lookup Tables

**Approach:** Static JSON files in `src/data/materials/`
**Size:** ~10-50 KB depending on detail level
**Confidence:** HIGH

**Why this:**

- No runtime dependency
- Fast client-side lookup
- Version controlled
- Easy to maintain and extend
- Works perfectly with static export

**Data Structure:**

```typescript
// src/data/materials/steel.json
{
  "materials": [
    {
      "id": "astm-a36",
      "name": "ASTM A36 Steel",
      "category": "structural-steel",
      "properties": {
        "elasticModulus": { "value": 200, "unit": "GPa" },
        "yieldStrength": { "value": 250, "unit": "MPa" },
        "density": { "value": 7850, "unit": "kg/m³" },
        "poissonRatio": 0.26,
        "thermalExpansion": { "value": 11.7e-6, "unit": "1/K" }
      }
    }
  ]
}
```

**TypeScript Types:**

```typescript
// src/types/materials.ts
export interface Material {
  id: string;
  name: string;
  category: string;
  properties: {
    elasticModulus?: { value: number; unit: string };
    yieldStrength?: { value: number; unit: string };
    density?: { value: number; unit: string };
    poissonRatio?: number;
    thermalExpansion?: { value: number; unit: string };
  };
}
```

**Data Sources:**

- MatWeb (<https://matweb.com/>) - comprehensive material properties
- MakeItFrom (<https://makeitfrom.com/>) - curated engineering materials
- NIST databases for validated properties
- Engineering handbooks (public domain data)

**Note:** No npm package needed - maintain curated JSON files directly in repository.

---

### Engineering Formulas

#### Formula Libraries: TypeScript Utility Functions

**Approach:** Custom utility functions in `src/lib/formulas/engineering/`
**Confidence:** HIGH

**Why this:**

- No existing comprehensive library for structural/mechanical formulas
- Engineering formulas are straightforward to implement
- Full control over precision and validation
- Type-safe with TypeScript

**Organization:**

```
src/lib/formulas/engineering/
  ├── structural/
  │   ├── beam-deflection.ts
  │   ├── column-buckling.ts
  │   └── stress-strain.ts
  ├── mechanical/
  │   ├── gear-ratios.ts
  │   ├── belt-drives.ts
  │   └── spring-design.ts
  └── fluid/
      ├── pipe-flow.ts
      └── pressure-drop.ts
```

**Example Implementation:**

```typescript
// src/lib/formulas/engineering/structural/beam-deflection.ts
/**
 * Calculate maximum deflection of a simply supported beam with uniform load
 * Formula: δ = (5 * w * L^4) / (384 * E * I)
 */
export function simplySupported UniformLoad(params: {
  load: number; // N/m
  length: number; // m
  elasticModulus: number; // Pa
  momentOfInertia: number; // m^4
}): number {
  const { load, length, elasticModulus, momentOfInertia } = params;
  return (5 * load * Math.pow(length, 4)) / (384 * elasticModulus * momentOfInertia);
}
```

---

## Chemistry & Science Stack

### Periodic Table Data

#### Recommended: Custom JSON + periodic-table npm (optional)

**Approach:** Curated JSON file with periodic-table npm as reference
**Bundle Size:** ~10-20 KB for essential data
**Confidence:** HIGH

**Why this:**

- Static data doesn't need npm package overhead
- Can cherry-pick only needed properties
- Version controlled
- No runtime dependency

**Option 1: Custom JSON (Recommended)**

```json
// src/data/chemistry/periodic-table.json
{
  "elements": [
    {
      "atomicNumber": 1,
      "symbol": "H",
      "name": "Hydrogen",
      "atomicMass": 1.008,
      "group": 1,
      "period": 1,
      "category": "nonmetal",
      "electronConfiguration": "1s¹",
      "electronegativity": 2.20,
      "oxidationStates": [1, -1],
      "standardState": "gas",
      "meltingPoint": 13.99,
      "boilingPoint": 20.271,
      "density": 0.00008988
    }
  ]
}
```

**Option 2: npm Package (if comprehensive data needed)**

**Package:** `periodic-table-js` or `@mat3ra/periodic-table`
**Version:** Latest
**Bundle Size:** periodic-table-js is 193 KB (large!)
**Confidence:** MEDIUM

**Trade-off:**

- periodic-table-js has extensive data but large bundle
- @mat3ra/periodic-table has TypeScript support
- **Recommendation:** Use custom JSON with only needed fields (~10-20 KB) instead of full package

**Data Sources:**

- NIST (<https://www.nist.gov/pml/periodic-table-elements>)
- PubChem (<https://pubchem.ncbi.nlm.nih.gov/>)
- Royal Society of Chemistry (<http://periodic-table.rsc.org/>)

**References:**

- [periodic-table-js npm](https://www.npmjs.com/package/periodic-table-js)
- [GitHub periodic-table-data-complete](https://github.com/sweaver2112/periodic-table-data-complete)

---

### Chemical Formula Parsing

#### Recommended: molecular-formula npm

**Package:** `molecular-formula`
**Version:** Latest
**Bundle Size:** Estimated 2-5 KB gzipped (small utility library)
**Confidence:** MEDIUM

**Why this:**

- Parses complex formulas with parentheses: `(NH4)3PO4`
- Includes `getMass()` function for molecular weight
- Small footprint
- TypeScript compatible

**Alternative Considered:** @chemistry/formula

- More comprehensive chemistry library
- **Why deprioritized:** Last published 5 years ago (maintenance concern)
- **Decision:** Use molecular-formula for molecular weight, implement custom parsing if more features needed

**Integration Pattern:**

```typescript
// src/lib/converters/chemistry/molecular-weight.ts
import { getMass, parseFormula } from 'molecular-formula';

export function calculateMolecularWeight(formula: string): number {
  return getMass(formula);
}

export function getElementComposition(formula: string): Record<string, number> {
  return parseFormula(formula);
}

// Usage
calculateMolecularWeight('H2O'); // 18.015
calculateMolecularWeight('(NH4)3PO4'); // 149.087
getElementComposition('H2O'); // { H: 2, O: 1 }
```

**Custom Parser Option:**

If molecular-formula doesn't meet needs, implement custom parser:

```typescript
// src/lib/chemistry/formula-parser.ts
export function parseChemicalFormula(formula: string): Map<string, number> {
  // Custom regex-based parser for simple formulas
  // Only implement if molecular-formula insufficient
}
```

**References:**

- [molecular-formula npm](https://www.npmjs.com/package/molecular-formula)
- [GitHub Molecular Mass Calculator](https://github.com/dvd101x/Molecular-Mass-Calculator)

---

### Chemistry Calculations

#### Recommended: Custom Utility Functions + mathjs

**Approach:** TypeScript utility functions in `src/lib/formulas/chemistry/`
**Dependencies:** mathjs (already added for engineering)
**Confidence:** HIGH

**Why this:**

- No comprehensive chemistry calculation library exists in JavaScript
- Chemistry formulas are well-defined and straightforward
- mathjs handles numerical precision
- Full type safety with TypeScript

**Organization:**

```
src/lib/formulas/chemistry/
  ├── stoichiometry/
  │   ├── molar-mass.ts
  │   ├── percent-composition.ts
  │   └── limiting-reactant.ts
  ├── solutions/
  │   ├── molarity.ts
  │   ├── dilution.ts
  │   └── ph-calculations.ts
  ├── gases/
  │   ├── ideal-gas-law.ts
  │   ├── partial-pressure.ts
  │   └── gas-density.ts
  └── thermodynamics/
      ├── enthalpy.ts
      └── gibbs-energy.ts
```

**Example Implementation:**

```typescript
// src/lib/formulas/chemistry/solutions/molarity.ts
/**
 * Calculate molarity (M) from moles and volume
 * M = moles / liters
 */
export function calculateMolarity(moles: number, volumeLiters: number): number {
  if (volumeLiters <= 0) throw new Error('Volume must be positive');
  return moles / volumeLiters;
}

/**
 * Calculate moles from molarity and volume
 */
export function calculateMoles(molarity: number, volumeLiters: number): number {
  return molarity * volumeLiters;
}

/**
 * Calculate dilution (M1V1 = M2V2)
 */
export function calculateDilution(params: {
  concentration1: number;
  volume1?: number;
  concentration2?: number;
  volume2?: number;
}): { concentration2: number } | { volume2: number } {
  const { concentration1, volume1, concentration2, volume2 } = params;

  if (volume1 && concentration2) {
    // Solve for V2
    return { volume2: (concentration1 * volume1) / concentration2 };
  }

  if (volume1 && volume2) {
    // Solve for M2
    return { concentration2: (concentration1 * volume1) / volume2 };
  }

  throw new Error('Insufficient parameters for dilution calculation');
}
```

**pH Calculations:**

```typescript
// src/lib/formulas/chemistry/solutions/ph-calculations.ts
import { log10 } from 'mathjs/number';

export function calculatePH(hydrogenIonConcentration: number): number {
  if (hydrogenIonConcentration <= 0) throw new Error('Concentration must be positive');
  return -log10(hydrogenIonConcentration);
}

export function calculateHydrogenIonConcentration(pH: number): number {
  return Math.pow(10, -pH);
}

export function calculatePOH(hydroxideIonConcentration: number): number {
  return -log10(hydroxideIonConcentration);
}

export function convertPHtoPOH(pH: number): number {
  return 14 - pH;
}
```

---

### Chemical Equation Balancing

#### Recommended: Custom Implementation or Skip for MVP

**Approach:** Delay for post-MVP or implement custom algorithm
**Confidence:** MEDIUM

**Why delay:**

- No lightweight JavaScript library exists
- Complex algorithm (matrix algebra, linear equations)
- Lower priority than basic stoichiometry calculators
- Can use mathjs matrix operations if implemented

**If implementing:**

```typescript
// src/lib/chemistry/equation-balancer.ts
import { lusolve, matrix } from 'mathjs';

export function balanceChemicalEquation(equation: string): string {
  // 1. Parse equation into reactants and products
  // 2. Build stoichiometric matrix
  // 3. Solve system of linear equations using Gaussian elimination
  // 4. Return balanced equation
  // Implementation complexity: ~200-300 lines
}
```

**Decision:** Defer to Phase 2 or later. Focus MVP on calculators, not symbolic equation solving.

---

## Cross-Domain Libraries

### mathjs: Shared Between Engineering & Chemistry

**Key Benefit:** One library serves both categories

**Engineering Use Cases:**

- Beam deflection calculations (power, division, multiplication)
- Stress-strain relationships (trigonometry)
- Fluid dynamics (logarithms, exponentials)
- Unit conversions (pressure, force, length)

**Chemistry Use Cases:**

- pH calculations (logarithms: `log10`)
- Gas laws (division, multiplication, exponents)
- Thermodynamics (exponentials, natural log)
- Stoichiometry (ratios, proportions)

**Optimization:** Import from `mathjs/number` for simple numerical operations to minimize bundle:

```typescript
// Only number operations, no BigNumber/Fraction/Complex/Unit/Matrix
import { add, subtract, multiply, divide, pow, log10, exp } from 'mathjs/number';
```

**Full import only when needed:**

```typescript
// When unit conversion is needed
import { unit } from 'mathjs';

// When matrix operations needed (e.g., equation balancing)
import { matrix, lusolve } from 'mathjs';
```

---

## Build & Bundle Considerations

### Bundle Impact Analysis

| Library             | Category            | Size (gzipped) | Tree-Shakeable | Critical Path |
| ------------------- | ------------------- | -------------- | -------------- | ------------- |
| mathjs (full)       | Math/Chemistry      | 209 KB         | Yes            | No            |
| mathjs/number       | Math/Chemistry      | ~20-30 KB      | Yes            | Yes           |
| convert             | Unit Conversion     | ~3-5 KB        | Yes            | Yes           |
| recharts            | Visualization       | ~50-139 KB     | Yes            | No (lazy)     |
| molecular-formula   | Chemistry           | ~2-5 KB        | Yes            | Yes           |
| periodic-table.json | Data (custom)       | ~10-20 KB      | N/A (data)     | Yes           |
| materials.json      | Data (custom)       | ~10-50 KB      | N/A (data)     | Yes           |
| **Total (optimized)** |                   | **~60-80 KB**  |                |               |

### Code Splitting Strategy

**By Category:**

```typescript
// Engineering calculators dynamically import engineering bundle
const EngineeringCalculator = dynamic(() => import('@/components/engineering/beam-calculator'), {
  ssr: false,
  loading: () => <CalculatorSkeleton />,
});

// Chemistry calculators dynamically import chemistry bundle
const ChemistryCalculator = dynamic(() => import('@/components/chemistry/molarity-calculator'), {
  ssr: false,
});
```

**Lazy Load Visualization:**

```typescript
// Recharts only loaded when chart is rendered
const StressStrainChart = dynamic(() => import('@/components/charts/stress-strain-chart'), {
  ssr: false,
});

// Render chart conditionally
{showChart && <StressStrainChart data={results} />}
```

**Route-Based Splitting:**

Next.js automatically code-splits by route:

```
/engineering/beam-deflection → engineering.bundle.js + mathjs.chunk.js
/chemistry/molarity → chemistry.bundle.js + mathjs.chunk.js (cached)
/math/percentage → math.bundle.js (no engineering/chemistry deps)
```

### Build-Time Data Processing

**Static Data Generation:**

```typescript
// scripts/generate-periodic-table.ts
// Run at build time to process comprehensive data into lightweight JSON

import fs from 'fs';
import path from 'path';

// Read comprehensive data source
const rawData = JSON.parse(fs.readFileSync('data-sources/periodic-table-complete.json', 'utf-8'));

// Extract only needed fields for calculators
const lightweightData = rawData.elements.map((el) => ({
  atomicNumber: el.atomicNumber,
  symbol: el.symbol,
  name: el.name,
  atomicMass: el.atomicMass,
  category: el.category,
}));

// Write optimized data
fs.writeFileSync(
  path.join('src/data/chemistry/periodic-table.json'),
  JSON.stringify({ elements: lightweightData }, null, 2)
);
```

**Package.json Scripts:**

```json
{
  "scripts": {
    "build:data": "tsx scripts/generate-periodic-table.ts && tsx scripts/generate-materials.ts",
    "prebuild": "npm run build:data",
    "build": "next build"
  }
}
```

---

## Stack Integration Checklist

### Compatibility with Existing Stack

- ✓ **Next.js 16.1.1 static export:** All libraries are client-side only
- ✓ **React 19.2.3:** recharts, mathjs work with React 19
- ✓ **TypeScript 5.9.3:** All recommended libraries have TypeScript definitions
- ✓ **Zustand 5.0.10:** State management pattern unchanged
- ✓ **Code splitting:** All libraries support tree-shaking/dynamic imports
- ✓ **No server APIs:** Everything runs in browser
- ✓ **No runtime dependencies:** JSON data files are static

### Performance Budget

**Current bundle size:** ~500 KB (estimated for core app)
**Addition:** ~60-80 KB (optimized with code splitting)
**New total:** ~560-580 KB
**Impact:** +12-16% increase, acceptable with lazy loading

**Optimization Strategies:**

1. **Aggressive tree-shaking:** Import only needed mathjs functions
2. **Route-based splitting:** Engineering/chemistry bundles separate
3. **Lazy load charts:** Recharts only when visualization rendered
4. **Compress data:** Minify JSON files, remove unnecessary fields
5. **CDN caching:** Static assets cached indefinitely

### TypeScript Integration

**Type Definitions:**

```typescript
// src/types/engineering.ts
export interface BeamLoadCase {
  loadType: 'uniform' | 'point' | 'distributed';
  magnitude: number;
  position?: number;
  length: number;
}

export interface Material {
  id: string;
  name: string;
  elasticModulus: number;
  yieldStrength: number;
  density: number;
}

// src/types/chemistry.ts
export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
}

export type ElementCategory = 'metal' | 'nonmetal' | 'metalloid' | 'noble-gas' | 'halogen';

export interface ChemicalCompound {
  formula: string;
  molarMass: number;
  elements: Map<string, number>;
}
```

---

## Installation Commands

### Core Dependencies

```bash
# Math and units (shared across categories)
npm install mathjs
npm install convert

# Chemistry
npm install molecular-formula

# Visualization (lazy-loaded)
npm install recharts

# Type definitions (if not included)
npm install -D @types/mathjs
```

### Dev Dependencies

```bash
# Data generation scripts
npm install -D tsx

# Bundle analysis
npm install -D @next/bundle-analyzer
```

### Bundle Analyzer Configuration

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

---

## Migration Path

### Phase 1: Core Math (Week 1)

1. Install mathjs
2. Create utility functions in `src/lib/formulas/engineering/`
3. Implement 5-10 basic engineering calculators
4. Verify tree-shaking with bundle analyzer

### Phase 2: Unit Conversions (Week 1-2)

1. Install convert or use mathjs units
2. Add unit conversion utilities
3. Implement engineering unit converters

### Phase 3: Chemistry Data (Week 2)

1. Create periodic table JSON
2. Install molecular-formula
3. Create chemistry utility functions
4. Implement 5-10 basic chemistry calculators

### Phase 4: Visualization (Week 3)

1. Install recharts
2. Create reusable chart components
3. Add charts to engineering calculators (stress-strain, load-deflection)
4. Lazy load charts to minimize bundle impact

### Phase 5: Reference Data (Week 3-4)

1. Create material properties JSON
2. Add material selection dropdowns to calculators
3. Implement property lookup utilities

---

## Known Limitations & Trade-offs

### mathjs

**Limitation:** Large full bundle (209 KB)
**Mitigation:** Use tree-shaking and mathjs/number for simple operations
**Trade-off:** Accepted because of comprehensive feature set and excellent maintenance

### Recharts

**Limitation:** Bundle size varies widely (50-139 KB reported)
**Mitigation:** Lazy load, only import needed components
**Trade-off:** Accepted for native React integration and good DX

### Chemical Equation Balancing

**Limitation:** No lightweight JavaScript library exists
**Mitigation:** Implement custom algorithm or defer to post-MVP
**Trade-off:** Defer feature to reduce complexity

### Periodic Table Data

**Limitation:** npm packages are large (193 KB for periodic-table-js)
**Mitigation:** Use custom JSON with only essential fields (~10-20 KB)
**Trade-off:** Manual curation but significant bundle savings

### Material Properties

**Limitation:** No comprehensive open-source database
**Mitigation:** Curate JSON files from public sources (MatWeb, NIST)
**Trade-off:** Manual effort but full control over data quality

---

## Confidence Assessment

| Area                   | Confidence | Rationale                                                   |
| ---------------------- | ---------- | ----------------------------------------------------------- |
| mathjs                 | HIGH       | Verified with official docs, extensive usage, tree-shaking |
| Unit conversion        | HIGH       | Modern library, small footprint, type-safe                  |
| Recharts               | HIGH       | Popular, React-native, active maintenance                   |
| Chemistry parsing      | MEDIUM     | molecular-formula is small but older, may need custom code  |
| Material data          | HIGH       | JSON approach proven, public data sources available         |
| Bundle impact          | HIGH       | Tree-shaking verified, code splitting strategy clear        |
| Static export compat   | HIGH       | All libraries client-side, no server dependencies           |
| Visualization strategy | MEDIUM     | Recharts size varies, lazy loading critical                 |

---

## Next Steps

1. **Install core dependencies:** mathjs, convert (or use mathjs units)
2. **Create data files:** periodic-table.json, materials.json
3. **Implement utility functions:** Engineering and chemistry formula libraries
4. **Build MVP calculators:** 5-10 calculators per category to validate stack
5. **Measure bundle impact:** Use bundle analyzer to verify tree-shaking
6. **Optimize:** Adjust imports, lazy loading based on real bundle metrics
7. **Document patterns:** Update CALCULATOR_GUIDE.md with engineering/chemistry examples

---

## Sources

**Math Libraries:**

- [mathjs Official](https://mathjs.org/)
- [mathjs Custom Bundling](https://mathjs.org/docs/custom_bundling.html)
- [mathjs Bundlephobia](https://bundlephobia.com/package/mathjs)
- [Using Math.js for Dynamic Unit Conversions - Keyhole Software](https://keyholesoftware.com/using-math-js-for-dynamic-unit-conversions/)
- [Algebrite Official](http://algebrite.org/)
- [Best of JS Algebrite](https://bestofjs.org/projects/algebrite)

**Unit Conversion:**

- [convert npm](https://www.npmjs.com/package/convert)
- [convert GitHub](https://github.com/jonahsnider/convert)
- [convert-units npm](https://www.npmjs.com/package/convert-units)

**Visualization:**

- [Recharts Official](https://recharts.org/)
- [Best of JS Recharts](https://bestofjs.org/projects/recharts)
- [JavaScript Chart Libraries 2026 - Luzmo](https://www.luzmo.com/blog/javascript-chart-libraries)
- [Comparing 8 Popular React Charting Libraries - Medium](https://medium.com/@ponshriharini/comparing-8-popular-react-charting-libraries-performance-features-and-use-cases-cc178d80b3ba)

**Chemistry:**

- [molecular-formula npm](https://www.npmjs.com/package/molecular-formula)
- [periodic-table-js npm](https://www.npmjs.com/package/periodic-table-js)
- [GitHub periodic-table-data-complete](https://github.com/sweaver2112/periodic-table-data-complete)
- [OpenChemLib js](https://www.cheminfo.org/Chemistry/Cheminformatics/OpenChemLib_js/index.html)

**Material Properties:**

- [MakeItFrom Material Database](https://www.makeitfrom.com/)
- [MatWeb Material Property Database](https://matweb.com/)
- [GitHub Materials Science Data Resources](https://github.com/sedaoturak/data-resources-for-materials-science)

**Tree Shaking & Next.js:**

- [Next.js Tree Shaking - DeepWiki](https://deepwiki.com/vercel/next.js/2.4-tree-shaking-and-code-optimization)
- [How Vercel Optimized Package Imports](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)

---

---

# Stack Research: Hyper-V & Virtualization Platforms

**Research Date:** 2026-01-27
**Focus:** Libraries for multi-hypervisor capacity planning and cost comparison calculators
**Constraint:** Client-side only, static export compatible, extend existing v4.0 VMware infrastructure

## Executive Summary

**Recommendation:** NO new dependencies needed. Hyper-V & virtualization calculators use existing infrastructure (recharts for visualization, JSON for reference data, TypeScript utilities for calculations).

**Key Findings:**

- **No specialized libraries:** Virtualization capacity planning is arithmetic and doesn't require npm packages
- **Reference data approach:** JSON files for hypervisor overhead factors, licensing costs, feature matrices (~20-30 KB)
- **Reuse existing tools:** recharts (already in v3.0 bundle) for TCO charts, existing PDF/CSV export
- **Zero bundle impact:** Only data files added, no new JavaScript dependencies
- **Integration with v4.0:** Extend existing VMware calculators with platform selector

---

## Core Infrastructure (Zero New Dependencies)

### Capacity Planning Calculations

#### Recommended: TypeScript Utility Functions

**Approach:** Custom functions in `src/lib/converters/infrastructure/`
**Dependencies:** None (uses TypeScript stdlib and existing utilities)
**Bundle Size:** 0 KB (no new packages)
**Confidence:** HIGH

**Why this:**

- Virtualization capacity calculations are straightforward arithmetic
  - Resource addition: Total vCPU = Σ(vCPUs per VM)
  - HA overhead: Required hosts = ceil(total_resources / (hosts - N))
  - RAID capacity: Usable = raw_capacity × RAID_multiplier
  - Licensing: Core licenses = ceil(physical_cores / cores_per_license) × license_packs

- No npm package offers comprehensive multi-hypervisor calculations
- Full control over formulas and validation
- Type-safe with TypeScript
- Zero runtime dependencies

**Implementation Pattern:**

```typescript
// src/lib/converters/infrastructure/hyperv-consolidation.ts
export interface HyperVConsolidationParams {
  vmCount: number;
  vcpuPerVm: number;
  ramPerVm: number; // GB
  storagePerVm: number; // GB
  replicationEnabled: boolean;
  haLevel: 'none' | 'n+1' | 'n+2';
  hostSpecs: {
    cores: number;
    ramGb: number;
    storageGb: number;
  };
}

export interface HyperVConsolidationResult {
  totalVcpu: number;
  totalRamGb: number;
  totalStorageGb: number;
  requiredHosts: number;
  coreCount: number;
  coreLicenses: number;
  estimatedCost: number;
}

export function calculateHyperVConsolidation(
  params: HyperVConsolidationParams
): HyperVConsolidationResult {
  const {
    vmCount,
    vcpuPerVm,
    ramPerVm,
    storagePerVm,
    replicationEnabled,
    haLevel,
    hostSpecs,
  } = params;

  // Calculate total resources
  const totalVcpu = vmCount * vcpuPerVm;
  const totalRamGb = vmCount * ramPerVm;
  let totalStorageGb = vmCount * storagePerVm;

  // Hyper-V Replica doubles storage requirements
  if (replicationEnabled) {
    totalStorageGb *= 2;
  }

  // Add hypervisor overhead (8% for Hyper-V with Windows VMs)
  const HYPERV_OVERHEAD = 0.08;
  const effectiveVcpu = totalVcpu * (1 + HYPERV_OVERHEAD);
  const effectiveRamGb = totalRamGb * (1 + HYPERV_OVERHEAD);

  // Calculate hosts needed for resources (before HA)
  const hostsForCpu = Math.ceil(effectiveVcpu / hostSpecs.cores);
  const hostsForRam = Math.ceil(effectiveRamGb / hostSpecs.ramGb);
  const hostsForStorage = Math.ceil(totalStorageGb / hostSpecs.storageGb);
  const baseHosts = Math.max(hostsForCpu, hostsForRam, hostsForStorage);

  // Apply HA overhead
  let requiredHosts = baseHosts;
  if (haLevel === 'n+1') {
    requiredHosts = Math.ceil((baseHosts * hostSpecs.cores) / (baseHosts + 1 - 1)) + 1;
  } else if (haLevel === 'n+2') {
    requiredHosts = baseHosts + 2;
  }

  // Windows Server Datacenter licensing (16 cores minimum per server)
  const MIN_CORES_PER_SERVER = 16;
  const CORES_PER_LICENSE_PACK = 2;
  const COST_PER_2CORE_LICENSE = 6155; // As of 2026-01-27

  const coreCount = requiredHosts * hostSpecs.cores;
  const licensableCores = Math.max(requiredHosts * MIN_CORES_PER_SERVER, coreCount);
  const coreLicenses = Math.ceil(licensableCores / CORES_PER_LICENSE_PACK);
  const estimatedCost = coreLicenses * COST_PER_2CORE_LICENSE;

  return {
    totalVcpu,
    totalRamGb,
    totalStorageGb,
    requiredHosts,
    coreCount,
    coreLicenses,
    estimatedCost,
  };
}
```

**No external libraries needed:**

- Resource math: Native JavaScript arithmetic
- HA calculations: `Math.ceil()`, `Math.max()`
- Licensing logic: Integer arithmetic with constants

---

### Cost Comparison & TCO

#### Recommended: TypeScript Utilities + recharts (existing)

**Approach:** TCO calculation functions + chart visualization
**Dependencies:** recharts (already in bundle from v3.0)
**Bundle Size:** 0 KB (reuse existing)
**Confidence:** HIGH

**Why this:**

- TCO calculations are arithmetic (CapEx + OpEx over time horizon)
- recharts already available for cost breakdown charts
- No specialized financial calculation library needed

**Implementation Pattern:**

```typescript
// src/lib/converters/infrastructure/tco-comparison.ts
export interface TCOParams {
  vmCount: number;
  hostCount: number;
  coreCount: number;
  storageCapacityTB: number;
  timeHorizonYears: 3 | 5;
  platform: 'vmware-vcf' | 'hyper-v' | 'proxmox' | 'xcp-ng';
}

export interface TCOBreakdown {
  hardware: number;
  licensing: number;
  support: number;
  training: number;
  migration: number;
  total: number;
  yearlyBreakdown: Array<{
    year: number;
    capex: number;
    opex: number;
    cumulative: number;
  }>;
}

export function calculateTCO(params: TCOParams): TCOBreakdown {
  const { vmCount, hostCount, coreCount, storageCapacityTB, timeHorizonYears, platform } = params;

  // Hardware costs (same across platforms)
  const COST_PER_HOST = 25000; // 2-socket server with 96 cores, 512GB RAM
  const COST_PER_TB_STORAGE = 500; // SSD storage
  const hardware = hostCount * COST_PER_HOST + storageCapacityTB * COST_PER_TB_STORAGE;

  // Platform-specific costs (from reference data)
  let licensing = 0;
  let annualSupport = 0;
  let training = 0;
  let migration = 0;

  switch (platform) {
    case 'vmware-vcf':
      // VMware Cloud Foundation (VCF) subscription model
      licensing = coreCount * 175 * timeHorizonYears; // $175 per core per year
      annualSupport = licensing * 0.2; // 20% of license cost
      training = 50000; // VMware training for team
      migration = 0; // Assuming existing VMware
      break;

    case 'hyper-v':
      // Windows Server Datacenter
      const coreLicenses = Math.ceil(Math.max(coreCount, hostCount * 16) / 2);
      licensing = coreLicenses * 6155; // One-time perpetual license
      annualSupport = hostCount * 1500 * timeHorizonYears; // Support per host
      training = 30000; // Hyper-V training
      migration = 100000; // VMware → Hyper-V migration effort
      break;

    case 'proxmox':
      // Proxmox VE with optional subscriptions
      const cpuSockets = hostCount * 2; // Assume 2-socket servers
      licensing = cpuSockets * 960 * timeHorizonYears; // Optional subscription ($960/CPU/year)
      annualSupport = 0; // Included in subscription
      training = 20000; // Open-source, less training needed
      migration = 150000; // VMware → Proxmox migration (more effort than Hyper-V)
      break;

    case 'xcp-ng':
      // XCP-ng is free, optional pro support
      licensing = 0;
      annualSupport = hostCount * 1000 * timeHorizonYears; // Optional pro support
      training = 25000;
      migration = 120000;
      break;
  }

  const support = annualSupport;
  const total = hardware + licensing + support + training + migration;

  // Generate yearly breakdown for chart visualization
  const yearlyBreakdown = [];
  const year1Capex = hardware + (platform === 'hyper-v' ? licensing : 0) + training + migration;
  const yearlyOpex = (licensing - (platform === 'hyper-v' ? licensing : 0)) / timeHorizonYears + annualSupport / timeHorizonYears;

  let cumulative = 0;
  for (let year = 1; year <= timeHorizonYears; year++) {
    const capex = year === 1 ? year1Capex : 0;
    const opex = yearlyOpex;
    cumulative += capex + opex;
    yearlyBreakdown.push({ year, capex, opex, cumulative });
  }

  return {
    hardware,
    licensing,
    support,
    training,
    migration,
    total,
    yearlyBreakdown,
  };
}
```

**Visualization with existing recharts:**

```typescript
// src/components/infrastructure/tco-chart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TCOChart({ data }: { data: TCOBreakdown }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data.yearlyBreakdown}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="capex" stackId="a" fill="#8884d8" name="CapEx" />
        <Bar dataKey="opex" stackId="a" fill="#82ca9d" name="OpEx" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

**No new dependencies:** recharts already in bundle from v3.0 calculators.

---

## Reference Data (JSON Files)

### Hypervisor Overhead Factors

**File:** `src/data/infrastructure/hypervisor-overhead.json`
**Size:** ~1-2 KB
**Format:** JSON

```json
{
  "hypervisors": {
    "vmware-esxi": {
      "name": "VMware ESXi",
      "overhead": {
        "windows": 0.12,
        "linux": 0.10,
        "mixed": 0.11
      },
      "notes": "vSphere 8.0 overhead factors. Higher for Windows due to VMware Tools and integration services."
    },
    "hyper-v": {
      "name": "Microsoft Hyper-V",
      "overhead": {
        "windows": 0.08,
        "linux": 0.10,
        "mixed": 0.09
      },
      "notes": "Hyper-V 2025 overhead. More efficient with Windows VMs due to native integration."
    },
    "proxmox-kvm": {
      "name": "Proxmox VE (KVM)",
      "overhead": {
        "windows": 0.08,
        "linux": 0.06,
        "mixed": 0.07
      },
      "notes": "KVM overhead is lower for Linux workloads. VirtIO drivers improve Windows performance."
    },
    "xcp-ng-xen": {
      "name": "XCP-ng (Xen)",
      "overhead": {
        "windows": 0.10,
        "linux": 0.09,
        "mixed": 0.095
      },
      "notes": "Xen hypervisor overhead. PV drivers reduce Linux overhead."
    }
  }
}
```

### Licensing Costs

**File:** `src/data/infrastructure/licensing-costs.json`
**Size:** ~2-3 KB
**Format:** JSON with date stamps

```json
{
  "updated": "2026-01-27",
  "licensing": {
    "vmware-vcf": {
      "name": "VMware Cloud Foundation (VCF)",
      "model": "subscription",
      "perCoreAnnual": 175,
      "minCores": 16,
      "currency": "USD",
      "notes": "Broadcom VCF pricing effective 2024. Includes vSphere, vSAN, NSX, Aria Suite.",
      "sourceUrl": "https://www.vmware.com/products/pricing"
    },
    "vmware-vvf": {
      "name": "VMware vSphere Foundation (VVF)",
      "model": "subscription",
      "perCoreAnnual": 85,
      "minCores": 16,
      "currency": "USD",
      "notes": "Entry-level bundle without NSX/Aria."
    },
    "windows-datacenter": {
      "name": "Windows Server 2025 Datacenter",
      "model": "perpetual",
      "per2CoreLicense": 6155,
      "minCoresPerServer": 16,
      "currency": "USD",
      "notes": "Includes unlimited VMs. Price may vary by country.",
      "sourceUrl": "https://www.microsoft.com/en-us/windows-server/pricing"
    },
    "windows-standard": {
      "name": "Windows Server 2025 Standard",
      "model": "perpetual",
      "per2CoreLicense": 1069,
      "minCoresPerServer": 16,
      "vmInstances": 2,
      "currency": "USD",
      "notes": "Includes 2 VM instances. Additional instances require additional licenses."
    },
    "proxmox-subscription": {
      "name": "Proxmox VE Subscription",
      "model": "subscription",
      "perCpuAnnual": 960,
      "optional": true,
      "currency": "EUR",
      "notes": "Optional. Includes enterprise repository, support, and updates. Not required for production use.",
      "sourceUrl": "https://www.proxmox.com/en/proxmox-ve/pricing"
    },
    "xcp-ng-pro": {
      "name": "XCP-ng Pro Support",
      "model": "subscription",
      "perHostAnnual": 1000,
      "optional": true,
      "currency": "USD",
      "notes": "Optional professional support. XCP-ng itself is free and open source."
    }
  }
}
```

### Hypervisor Feature Matrix

**File:** `src/data/infrastructure/hypervisor-features.json`
**Size:** ~3-5 KB
**Format:** JSON

```json
{
  "features": {
    "live_migration": {
      "name": "Live Migration",
      "description": "Move running VMs between hosts without downtime",
      "platforms": {
        "vmware-esxi": { "available": true, "name": "vMotion", "notes": "Requires shared storage or vSAN" },
        "hyper-v": { "available": true, "name": "Live Migration", "notes": "Requires failover clustering" },
        "proxmox-kvm": { "available": true, "name": "Migration", "notes": "Online migration supported" },
        "xcp-ng-xen": { "available": true, "name": "XenMotion", "notes": "Storage XenMotion for storage migration" }
      }
    },
    "ha_clustering": {
      "name": "High Availability",
      "description": "Automatically restart VMs on other hosts if a host fails",
      "platforms": {
        "vmware-esxi": { "available": true, "name": "HA", "notes": "Part of vSphere HA" },
        "hyper-v": { "available": true, "name": "Failover Clustering", "notes": "Requires Windows Server clustering" },
        "proxmox-kvm": { "available": true, "name": "HA Manager", "notes": "Requires 3+ nodes for quorum" },
        "xcp-ng-xen": { "available": true, "name": "HA", "notes": "Requires pool with shared storage" }
      }
    },
    "distributed_storage": {
      "name": "Distributed Storage",
      "description": "Software-defined storage across cluster nodes",
      "platforms": {
        "vmware-esxi": { "available": true, "name": "vSAN", "notes": "Additional license required" },
        "hyper-v": { "available": true, "name": "Storage Spaces Direct", "notes": "Windows Server 2016+" },
        "proxmox-kvm": { "available": true, "name": "Ceph", "notes": "Integrated, no additional license" },
        "xcp-ng-xen": { "available": true, "name": "XOSAN", "notes": "Based on GlusterFS, separate product" }
      }
    },
    "container_support": {
      "name": "Container Support",
      "description": "Run containers alongside VMs",
      "platforms": {
        "vmware-esxi": { "available": false, "notes": "Containers require separate vSphere with Tanzu" },
        "hyper-v": { "available": false, "notes": "Windows containers run on host, not in Hyper-V" },
        "proxmox-kvm": { "available": true, "name": "LXC", "notes": "Native LXC container support" },
        "xcp-ng-xen": { "available": false, "notes": "Containers not natively supported" }
      }
    },
    "backup_integration": {
      "name": "Backup Integration",
      "description": "Native backup and restore functionality",
      "platforms": {
        "vmware-esxi": { "available": true, "notes": "vSphere Data Protection, Veeam, Commvault support" },
        "hyper-v": { "available": true, "notes": "Windows Server Backup, Veeam, all major vendors" },
        "proxmox-kvm": { "available": true, "name": "Proxmox Backup Server", "notes": "Integrated backup solution" },
        "xcp-ng-xen": { "available": true, "name": "Xen Orchestra", "notes": "Built-in backup, delta backup support" }
      }
    }
  }
}
```

### RAID Capacity Multipliers

**File:** `src/data/infrastructure/raid-overhead.json`
**Size:** ~1 KB
**Format:** JSON

```json
{
  "raid_levels": {
    "raid0": {
      "name": "RAID 0 (Striping)",
      "multiplier": 1.0,
      "minDisks": 2,
      "faultTolerance": 0,
      "formula": "n",
      "notes": "No redundancy. All disk space available. Not recommended for production."
    },
    "raid1": {
      "name": "RAID 1 (Mirroring)",
      "multiplier": 0.5,
      "minDisks": 2,
      "faultTolerance": 1,
      "formula": "n/2",
      "notes": "50% capacity. Excellent read performance."
    },
    "raid5": {
      "name": "RAID 5 (Striping with Parity)",
      "multiplier": null,
      "minDisks": 3,
      "faultTolerance": 1,
      "formula": "(n-1)/n",
      "notes": "One disk for parity. Example: 4 disks = 75% capacity."
    },
    "raid6": {
      "name": "RAID 6 (Double Parity)",
      "multiplier": null,
      "minDisks": 4,
      "faultTolerance": 2,
      "formula": "(n-2)/n",
      "notes": "Two disks for parity. Example: 6 disks = 67% capacity."
    },
    "raid10": {
      "name": "RAID 10 (Mirrored Striping)",
      "multiplier": 0.5,
      "minDisks": 4,
      "faultTolerance": 1,
      "formula": "n/2",
      "notes": "50% capacity. Best performance, high cost."
    }
  }
}
```

**Total Reference Data Size:** ~10-15 KB compressed

---

## Integration with Existing v4.0 Calculators

### Extend VM Storage Calculator

**Current:** VMware-only (VMDK, thin/thick provisioning)
**Enhancement:** Add hypervisor type selector

```typescript
// src/stores/vm-storage-store.ts
export interface VmStorageState {
  hypervisor: 'vmware' | 'hyper-v' | 'proxmox' | 'xcp-ng';
  diskFormat: string; // VMDK/VHDX/qcow2/VDI based on hypervisor
  // ... existing fields
}

// Platform-specific defaults
const HYPERVISOR_DEFAULTS = {
  vmware: { diskFormat: 'vmdk-thin', snapshotOverhead: 0.15 },
  'hyper-v': { diskFormat: 'vhdx-dynamic', snapshotOverhead: 0.20 },
  proxmox: { diskFormat: 'qcow2', snapshotOverhead: 0.15 },
  'xcp-ng': { diskFormat: 'vdi-thin', snapshotOverhead: 0.10 },
};
```

### Extend Server Virtualization Calculator

**Current:** VMware ESXi-specific (DRS/HA, N+1 with vSphere semantics)
**Enhancement:** Add platform selector with overhead adjustments

```typescript
// src/lib/converters/infrastructure/server-virtualization.ts
import hypervisorOverhead from '@/data/infrastructure/hypervisor-overhead.json';

export function calculateHostCount(params: {
  vmCount: number;
  vcpuPerVm: number;
  platform: string;
  workloadType: 'windows' | 'linux' | 'mixed';
  // ... existing params
}) {
  const { platform, workloadType } = params;
  const overhead = hypervisorOverhead.hypervisors[platform].overhead[workloadType];

  // Apply platform-specific overhead
  const effectiveVcpu = params.vcpuPerVm * (1 + overhead);
  // ... rest of calculation
}
```

### Extend Virtualization Cost Calculator (v4.0)

**Current:** VMware VCF/VVF TCO only
**Enhancement:** Add comparison mode

```typescript
// src/components/infrastructure/cost-comparison.tsx
export function CostComparison() {
  const [platforms, setPlatforms] = useState(['vmware-vcf', 'hyper-v', 'proxmox']);
  const [tcoResults, setTcoResults] = useState<Record<string, TCOBreakdown>>({});

  // Calculate TCO for each selected platform
  // Display side-by-side comparison with recharts
  // Export comparison table as PDF/CSV
}
```

---

## TypeScript Types

### Shared Infrastructure Types

```typescript
// src/types/infrastructure.ts
export type HypervisorPlatform = 'vmware-esxi' | 'hyper-v' | 'proxmox-kvm' | 'xcp-ng-xen';
export type WorkloadType = 'windows' | 'linux' | 'mixed';
export type HALevel = 'none' | 'n+1' | 'n+2' | 'n+3';
export type RaidLevel = 'raid0' | 'raid1' | 'raid5' | 'raid6' | 'raid10';

export interface HypervisorOverhead {
  platform: HypervisorPlatform;
  windows: number;
  linux: number;
  mixed: number;
}

export interface LicensingModel {
  platform: string;
  model: 'subscription' | 'perpetual' | 'free';
  costPerUnit: number;
  unitType: 'core' | 'socket' | 'host' | 'vm';
  minimums?: {
    coresPerServer?: number;
    coresPerLicense?: number;
  };
}

export interface TCOParams {
  vmCount: number;
  hostCount: number;
  coreCount: number;
  storageCapacityTB: number;
  timeHorizonYears: 3 | 5;
  platform: HypervisorPlatform;
}

export interface TCOBreakdown {
  hardware: number;
  licensing: number;
  support: number;
  training: number;
  migration: number;
  total: number;
  yearlyBreakdown: YearlyTCO[];
}

export interface YearlyTCO {
  year: number;
  capex: number;
  opex: number;
  cumulative: number;
}

export interface RAIDCapacity {
  raidLevel: RaidLevel;
  diskCount: number;
  diskCapacityGB: number;
  usableCapacityGB: number;
  redundancy: number;
}
```

---

## Bundle Impact Analysis

### Zero New Dependencies

| Component                     | Approach              | Bundle Impact |
| ----------------------------- | --------------------- | ------------- |
| Capacity calculations         | TypeScript utils      | 0 KB          |
| TCO calculations              | TypeScript utils      | 0 KB          |
| Cost charts                   | recharts (existing)   | 0 KB (reuse)  |
| Reference data                | JSON files            | ~15 KB        |
| Hypervisor overhead           | JSON (1-2 KB)         |               |
| Licensing costs               | JSON (2-3 KB)         |               |
| Feature matrix                | JSON (3-5 KB)         |               |
| RAID multipliers              | JSON (1 KB)           |               |
| **Total New Bundle Addition** |                       | **~15 KB**    |

### Code Splitting Strategy

**By Infrastructure Subcategory:**

```typescript
// Hyper-V calculators dynamically imported
const HyperVCalculator = dynamic(() => import('@/components/infrastructure/hyperv-consolidation'), {
  ssr: false,
});

// Cross-platform comparison
const HypervisorComparison = dynamic(() => import('@/components/infrastructure/comparison'), {
  ssr: false,
});
```

**Lazy Load Charts:**

```typescript
// TCO chart only loaded when comparison shown
const TCOChart = dynamic(() => import('@/components/infrastructure/tco-chart'), {
  ssr: false,
});
```

**Route-Based Splitting:**

```
/infrastructure/hyperv-consolidation → hyperv.bundle.js (~15-20 KB)
/infrastructure/comparison → comparison.bundle.js + recharts.chunk.js (cached)
/infrastructure/vm-storage → existing vmware.bundle.js (extend with platform selector)
```

---

## Validation Strategy

### Formula Verification

**Cross-reference against vendor calculators:**

- Hyper-V: [WintelGuy Hyper-V Calculator](https://wintelguy.com/vmcalc2.pl)
- Windows Licensing: [Microsoft Calculator](https://www.jacksontechnical.com/licensing/calculator.cfm)
- Proxmox: [Community sizing discussions](https://forum.proxmox.com/threads/sizing-for-an-ha-cluster-with-ceph.124589/)

**Test cases:**

```typescript
// src/lib/converters/infrastructure/__tests__/hyperv-consolidation.test.ts
describe('calculateHyperVConsolidation', () => {
  it('calculates consolidation for 80 VMs with N+1 HA', () => {
    const result = calculateHyperVConsolidation({
      vmCount: 80,
      vcpuPerVm: 4,
      ramPerVm: 16,
      storagePerVm: 200,
      replicationEnabled: true,
      haLevel: 'n+1',
      hostSpecs: { cores: 96, ramGb: 384, storageGb: 10000 },
    });

    expect(result.requiredHosts).toBe(5); // Verify against manual calculation
    expect(result.coreLicenses).toBe(240); // 5 hosts × 96 cores = 480 cores / 2 = 240 licenses
  });
});
```

### Data Accuracy

- **Licensing costs:** Link to vendor pricing pages with "Pricing as of [date]" disclaimers
- **Overhead factors:** Source from vendor documentation and community benchmarks
- **Feature comparisons:** Verify against official product documentation

---

## Migration & Implementation Path

### Phase 1: Reference Data (Week 1)

1. Create JSON data files (`hypervisor-overhead.json`, `licensing-costs.json`, etc.)
2. Create TypeScript types for data structures
3. Create data loading utilities

### Phase 2: Core Calculations (Week 1-2)

1. Implement Hyper-V consolidation calculator logic
2. Implement Windows Server licensing calculator
3. Implement TCO comparison utilities
4. Write unit tests for calculations

### Phase 3: Integration (Week 2)

1. Extend existing VM Storage calculator with platform selector
2. Extend Server Virtualization calculator with platform-specific overhead
3. Extend Virtualization Cost calculator with comparison mode

### Phase 4: New Calculators (Week 2-3)

1. Build Hyper-V Consolidation Calculator UI
2. Build Windows Server Licensing Calculator UI
3. Build Hypervisor Comparison Calculator UI
4. Build Proxmox/XCP-ng sizing calculators

### Phase 5: Visualization & Export (Week 3)

1. Add TCO comparison charts using recharts
2. Implement side-by-side feature matrix display
3. Extend PDF export for comparison tables
4. Test CSV export for cost breakdowns

---

## Confidence Assessment

| Area                           | Confidence | Rationale                                                   |
| ------------------------------ | ---------- | ----------------------------------------------------------- |
| Zero new dependencies          | HIGH       | All calculations are arithmetic, no specialized libs needed |
| Reference data approach        | HIGH       | JSON pattern proven in v3.0/v4.0, easy to maintain          |
| TCO calculation formulas       | HIGH       | Straightforward CapEx/OpEx arithmetic                       |
| Licensing calculations         | HIGH       | Well-documented formulas from vendors                       |
| Integration with v4.0          | HIGH       | Extend existing calculators, not replace                    |
| Bundle impact                  | HIGH       | Only JSON data added (~15 KB), no JavaScript dependencies   |
| recharts reuse                 | HIGH       | Already in bundle from v3.0, proven for cost charts         |
| Platform-specific edge cases   | MEDIUM     | Each hypervisor has nuances, must document assumptions      |
| Pricing accuracy over time     | MEDIUM     | Licensing costs change; must clearly date pricing data      |

---

## Next Steps

1. **Create reference data files:** JSON files for overhead, licensing, features (~2 hours)
2. **Implement calculation utilities:** TypeScript functions for consolidation, TCO, licensing (~8 hours)
3. **Write unit tests:** Verify calculations against known results (~4 hours)
4. **Extend existing calculators:** Add platform selectors to v4.0 calculators (~6 hours)
5. **Build new calculator UIs:** Hyper-V, comparison, licensing calculators (~12 hours)
6. **Add visualization:** TCO charts and comparison tables (~4 hours)
7. **Documentation:** Update CALCULATOR_GUIDE.md with multi-platform patterns (~2 hours)
8. **Total effort:** ~38 hours for comprehensive multi-hypervisor support

---

## Sources

**Hyper-V Capacity Planning:**

- [WintelGuy Hyper-V Calculator](https://wintelguy.com/vmcalc2.pl)
- [WintelGuy Virtualization Cost Comparison](https://wintelguy.com/2024/virtualization-cost-comparison.html)
- [Microsoft Capacity Planner for Hyper-V Replica](https://www.microsoft.com/en-us/download/details.aspx?id=39057)
- [SolarWinds Virtualization Manager](https://www.solarwinds.com/virtualization-manager/use-cases/vm-capacity-planning)
- [Veeam Hyper-V Sizing](https://helpcenter.veeam.com/docs/mp/resource_kit/hyperv_mp_sizing_calculator.html)

**Hyper-V Licensing:**

- [Microsoft Windows Server 2025 Pricing](https://www.microsoft.com/en-us/windows-server/pricing)
- [WintelGuy Windows Server Licensing Calculator](https://wintelguy.com/windows-server-licensing-calc.pl)
- [Jackson Technical Licensing Calculator](https://www.jacksontechnical.com/licensing/calculator.cfm)
- [Microsoft Q&A: Licensing Costs](https://learn.microsoft.com/en-us/answers/questions/2068031/windows-server-2022-hyper-v-licensing-costs)
- [Heroix: VMware vs Hyper-V Licensing](https://www.heroix.com/blog/virtualization-licensing/)

**Hypervisor Comparisons:**

- [Proxmox vs Hyper-V Comparison](https://www.starwindsoftware.com/blog/proxmox-vs-hyper-v-comparison/)
- [XCP-ng vs Proxmox Comparison](https://www.horizoniq.com/blog/xcp-ng-vs-proxmox/)
- [Which Hypervisor to Choose in 2025?](https://servermall.com/blog/which-hypervisor-to-choose-in-2025/)
- [Life After VMware: Alternatives](https://2guystek.tv/life-after-vmware-a-comprehensive-roundup-of-alternative-hypervisors/)
- [VMware Alternatives Compared](https://www.softwareseni.com/vmware-alternatives-compared-proxmox-xcp-ng-nutanix-and-hyper-v-for-enterprise-workloads/)

**Proxmox & Ceph:**

- [Proxmox Forum: Ceph Sizing](https://forum.proxmox.com/threads/sizing-for-an-ha-cluster-with-ceph.124589/)
- [Proxmox HA Cluster Documentation](https://pve.proxmox.com/wiki/High_Availability_Cluster)
- [Proxmox vs XCP-ng](https://www.baculasystems.com/blog/proxmox-vs-xcp-ng/)
- [Proxmox VE Overview](https://proxmox.com/en/products/proxmox-virtual-environment/overview)

**XCP-ng:**

- [XCP-ng Official Site](https://xcp-ng.org/)
- [XCP-ng Documentation](https://docs.xcp-ng.org/)
- [XCP-ng Configuration Limits](https://docs.xenserver.com/en-us/citrix-hypervisor/system-requirements/configuration-limits.html)
- [XCP-ng 8.2 LTS Release](https://xcp-ng.org/docs/release-8-2.html)

**Storage & RAID:**

- [Orbit2x RAID Calculator](https://orbit2x.com/raid-calculator)
- [GigaCalculator RAID Calculator](https://www.gigacalculator.com/calculators/raid-calculator.php)
- [RAIDZ Calculator for ZFS](https://www.virtualizationhowto.com/2024/09/raidz-calculator-to-find-zfs-capacity-and-cost/)
- [ServeTheHome RAID Calculator](https://www.servethehome.com/raid-calculator/)

**Performance & Overhead:**

- [Proxmox vs Hyper-V: Overhead Debate](https://medium.com/@PlanB./proxmox-vs-hyper-v-the-great-overhead-debate-7271ebf80dac)
- [VMware vs Hyper-V Performance 2025](https://monovm.com/blog/vmware-vs-hyper-v/)
- [Proxmox vs VMware vs Hyper-V](https://eagleeyet.net/blog/technology/virtualization/proxmox-vs-vmware-vs-hyper-v-how-proxmox-stacks-up-against-mainstream-virtualization-platforms/)
