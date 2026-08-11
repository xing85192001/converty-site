# Engineering & Chemistry Calculator Architecture Integration

**Research Date:** 2026-01-27
**Confidence:** HIGH
**Focus:** How Engineering and Chemistry calculator categories integrate with existing Converty platform architecture

## Executive Summary

Engineering and Chemistry calculators integrate seamlessly with the existing Converty architecture. No fundamental architectural changes needed. The platform's existing patterns for reference data, visualization, and state management fully support these new calculator types.

**Key Finding:** Engineering and Chemistry calculators are structurally similar to existing complex calculators (Photo depth-of-field, Finance mortgage). They require reference data, multi-section results, and visualizations - all of which the platform already supports.

---

## New Components Needed

### Engineering Calculators

#### Material Property Selector Component

**Purpose:** Reusable dropdown for selecting materials (steel, aluminum, wood, concrete)
**Reusability:** High - used across structural, mechanical, thermal calculators
**Location:** `src/components/engineering/material-selector.tsx`

```typescript
interface MaterialSelectorProps {
  selectedMaterial: string;
  onMaterialChange: (material: MaterialProperties) => void;
  category?: "metals" | "wood" | "concrete" | "plastics";
}

// Auto-populates related fields (E, density, yield strength) from reference data
```

**Pattern:** Similar to existing `CurrencySelector` component but loads from material database

#### Beam Diagram Component

**Purpose:** Visual representation of beam loading and support configuration
**Reusability:** Medium - specific to structural calculators
**Location:** `src/components/engineering/beam-diagram.tsx`

```typescript
interface BeamDiagramProps {
  length: number;
  supports: Array<{ position: number; type: "fixed" | "pinned" | "roller" }>;
  loads: Array<{ position: number; magnitude: number; type: "point" | "distributed" }>;
}
```

**Implementation:** SVG-based visualization (similar to how charts are rendered)
**Bundle Impact:** ~3-5KB (minimal)

#### Stress Distribution Chart Component

**Purpose:** Visualize stress/strain along beam length
**Reusability:** Medium - used in structural analysis calculators
**Location:** `src/components/engineering/stress-chart.tsx`

**Pattern:** Uses existing recharts library (already in dependencies for mortgage/finance calculators)

```typescript
// Uses LineChart from recharts - no new dependencies
<LineChart data={stressDistribution}>
  <Line dataKey="stress" stroke="hsl(var(--primary))" />
  <Area dataKey="deflection" fill="hsl(var(--chart-2))" />
</LineChart>
```

### Chemistry Calculators

#### Periodic Table Element Picker

**Purpose:** Interactive element selection for compound building
**Reusability:** High - used across stoichiometry, molecular weight, balancing calculators
**Location:** `src/components/chemistry/element-picker.tsx`

```typescript
interface ElementPickerProps {
  onElementSelect: (element: Element) => void;
  selectedElements?: string[]; // e.g., ["H", "O"]
  mode?: "single" | "multiple";
}
```

**UI Pattern:** Grid of element symbols (similar to calculator keyboard layout)
**Data Source:** `src/lib/data/periodic-table.json`

#### Chemical Formula Input Component

**Purpose:** Specialized input that parses chemical formulas (H2O, Ca(OH)2)
**Reusability:** High - molecular weight, stoichiometry, balancing
**Location:** `src/components/chemistry/formula-input.tsx`

```typescript
interface FormulaInputProps {
  value: string;
  onChange: (formula: string, parsed: ParsedFormula) => void;
  error?: string; // "Invalid formula syntax"
}

interface ParsedFormula {
  elements: Array<{ symbol: string; count: number }>;
  totalMass: number;
  isValid: boolean;
}
```

**Pattern:** Extends existing `InputField` with validation logic

#### Compound Builder Component (Optional - MVP can defer)

**Purpose:** Drag-and-drop compound construction
**Reusability:** Low - nice-to-have for education
**Decision:** NOT needed for MVP - text input sufficient

### Reusable Across Both Categories

#### Reference Data Table Component

**Purpose:** Display material properties, element data in tabular format
**Reusability:** High - both engineering and chemistry
**Location:** `src/components/converter/reference-table.tsx`

```typescript
interface ReferenceTableProps {
  title: string;
  data: Array<{ label: string; value: string | number; unit?: string }>;
  expandable?: boolean; // Collapse long tables
}
```

**Pattern:** Extends existing shadcn/ui Table component
**Use Cases:**

- Engineering: Material properties table, standard beam sizes
- Chemistry: Element properties, compound data

---

## Data Flow & State Management

### Multi-Step Calculations

**Finding:** NOT needed for most calculators. Engineering and Chemistry calculators use single-pass calculations with complex outputs, not wizard workflows.

**Pattern:** Single calculation function returns comprehensive result object

```typescript
// Engineering example - Beam deflection
interface BeamResult {
  maxDeflection: number;
  maxStress: number;
  reactions: { left: number; right: number };
  stressDistribution: Array<{ position: number; stress: number }>;
  deflectionCurve: Array<{ position: number; deflection: number }>;
  safetyFactor: number;
  steps: string[]; // Calculation breakdown
}

// Chemistry example - Stoichiometry
interface StoichiometryResult {
  balancedEquation: string;
  coefficients: number[];
  molarRatios: Array<{ reactant: string; product: string; ratio: number }>;
  limitingReactant: string;
  yields: Array<{ compound: string; mass: number; moles: number }>;
  steps: string[];
}
```

**Zustand Store:** Standard `createCalculatorStore` pattern works as-is

```typescript
const useBeamStore = createCalculatorStore<BeamInput, BeamResult>({
  name: "beam-deflection",
  initialValues: { length: 5, load: 1000, support: "simply-supported" },
  calculate: calculateBeamDeflection,
});
```

### Reference Data Loading

**Strategy:** Build-time JSON import (no runtime fetching)

**Location:** `src/lib/data/`

```
src/lib/data/
├── periodic-table.json           # ~50KB - all elements with properties
├── material-properties.json      # ~30KB - common engineering materials
├── beam-sections.json           # ~15KB - standard I-beams, C-channels
├── chemistry-constants.json     # ~5KB - Avogadro, gas constant, etc.
└── compound-database.json       # ~100KB - common compounds (optional)
```

**Loading Pattern:** Same as existing cooking densities

```typescript
// src/lib/data/material-properties.ts
import type { MaterialProperties } from "@/lib/converters/engineering/types";

export const MATERIAL_DATABASE: MaterialProperties[] = [
  {
    id: "steel-a36",
    name: "Steel A36",
    category: "structural-steel",
    density: 7850, // kg/m³
    elasticModulus: 200e9, // Pa
    yieldStrength: 250e6, // Pa
    tensileStrength: 400e6, // Pa
  },
  // ... more materials
];

export function getMaterial(id: string): MaterialProperties | undefined {
  return MATERIAL_DATABASE.find(m => m.id === id);
}
```

**Bundle Impact Analysis:**

- Periodic table JSON: ~50KB (gzipped: ~15KB)
- Material properties: ~30KB (gzipped: ~8KB)
- Total added: ~23KB gzipped
- Current bundle: ~500KB (estimated)
- Impact: +4.6% bundle size - acceptable

**Code Splitting:** Already handled by Next.js dynamic imports per category

### State Persistence

**URL Sync:** Sufficient for all Engineering/Chemistry calculators

**Why localStorage NOT needed:**

- Calculators are stateless (no saved projects)
- URL parameters handle shareability
- No multi-session workflows

**URL State Example:**

```
/en/engineering/beam-deflection?length=5&load=1000&support=simply-supported&material=steel-a36
```

Existing `createCalculatorStore` middleware handles this automatically.

---

## File Structure Proposal

```
src/
├── lib/
│   ├── converters/
│   │   ├── engineering/
│   │   │   ├── types.ts                    # Shared types (MaterialProperties, BeamSupport, etc.)
│   │   │   ├── beam-deflection.ts          # Pure calculation function
│   │   │   ├── column-buckling.ts
│   │   │   ├── stress-strain.ts
│   │   │   ├── moment-of-inertia.ts
│   │   │   └── index.ts                    # Barrel export
│   │   └── chemistry/
│   │       ├── types.ts                    # Element, Compound, ParsedFormula types
│   │       ├── molecular-weight.ts
│   │       ├── stoichiometry.ts
│   │       ├── equation-balancer.ts
│   │       ├── molarity.ts
│   │       └── index.ts
│   └── data/
│       ├── periodic-table.json             # Element data
│       ├── periodic-table.ts               # Typed accessor functions
│       ├── material-properties.json
│       ├── material-properties.ts
│       ├── beam-sections.json              # Standard structural shapes
│       └── chemistry-constants.ts          # R, NA, etc.
├── components/
│   ├── engineering/
│   │   ├── material-selector.tsx
│   │   ├── beam-diagram.tsx
│   │   ├── stress-chart.tsx
│   │   └── index.ts
│   ├── chemistry/
│   │   ├── element-picker.tsx
│   │   ├── formula-input.tsx
│   │   ├── periodic-table-display.tsx      # Reference display (optional)
│   │   └── index.ts
│   └── converter/
│       ├── reference-table.tsx             # New - shared by both categories
│       └── [existing components...]
└── app/
    └── [locale]/
        ├── engineering/
        │   ├── page.tsx                    # Category page
        │   ├── beam-deflection/
        │   │   ├── page.tsx
        │   │   └── beam-deflection-calculator.tsx
        │   ├── column-buckling/
        │   │   ├── page.tsx
        │   │   └── column-buckling-calculator.tsx
        │   └── [more calculators...]
        └── chemistry/
            ├── page.tsx
            ├── molecular-weight/
            │   ├── page.tsx
            │   └── molecular-weight-calculator.tsx
            ├── stoichiometry/
            │   ├── page.tsx
            │   └── stoichiometry-calculator.tsx
            └── [more calculators...]
```

**Key Decisions:**

1. **Reference data in `/lib/data/`** - Follows existing pattern (cooking-densities.ts, tire-load-index.json)
2. **Category-specific components** - Grouped in `/components/engineering/` and `/components/chemistry/` for clarity
3. **Shared types** - `types.ts` per category prevents circular dependencies
4. **Standard page structure** - Same as existing calculators (page.tsx + *-calculator.tsx)

---

## Registry & Discovery

### Category Registration

**Add to `src/lib/registry/categories.ts`:**

```typescript
export const categoryRegistry: Record<string, CategoryMeta> = {
  // ... existing categories

  "engineering": {
    id: "engineering",
    slug: "engineering",
    name: "Engineering",
    description: "Structural, mechanical, and civil engineering calculators",
    icon: Ruler, // lucide-react icon
    subcategories: [
      { id: "structural", name: "Structural Engineering" },
      { id: "mechanical", name: "Mechanical Engineering" },
      { id: "materials", name: "Materials Science" },
    ],
  },

  "chemistry": {
    id: "chemistry",
    slug: "chemistry",
    name: "Chemistry",
    description: "Molecular, stoichiometric, and chemical calculators",
    icon: FlaskConical, // lucide-react icon
    subcategories: [
      { id: "general", name: "General Chemistry" },
      { id: "organic", name: "Organic Chemistry" },
      { id: "analytical", name: "Analytical Chemistry" },
    ],
  },
};
```

### Converter Registration

**Add to `src/lib/registry/converters.ts`:**

```typescript
// Engineering converters
import { engineeringConverters } from "./engineering-converters";
import { chemistryConverters } from "./chemistry-converters";

export const converterRegistry: Record<string, ConverterMeta> = {
  ...healthConverters,
  // ... existing
  ...engineeringConverters,
  ...chemistryConverters,
};
```

**Create `src/lib/registry/engineering-converters.ts`:**

```typescript
import { Ruler, Calculator } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const engineeringConverters: Record<string, ConverterMeta> = {
  "beam-deflection": {
    id: "beam-deflection",
    slug: "beam-deflection",
    category: "engineering",
    subcategory: "structural",
    keywords: ["beam", "deflection", "stress", "bending", "moment", "structural"],
    icon: Ruler,
    featured: false,
  },
  "column-buckling": {
    id: "column-buckling",
    slug: "column-buckling",
    category: "engineering",
    subcategory: "structural",
    keywords: ["column", "buckling", "euler", "slenderness", "compression"],
    icon: Calculator,
    featured: false,
  },
  // ... more engineering calculators
};
```

**Create `src/lib/registry/chemistry-converters.ts`:**

```typescript
import { FlaskConical, Atom } from "lucide-react";
import type { ConverterMeta } from "@/types";

export const chemistryConverters: Record<string, ConverterMeta> = {
  "molecular-weight": {
    id: "molecular-weight",
    slug: "molecular-weight",
    category: "chemistry",
    subcategory: "general",
    keywords: ["molecular", "weight", "mass", "molar", "formula"],
    icon: FlaskConical,
    featured: true, // Popular chemistry calculator
  },
  "stoichiometry": {
    id: "stoichiometry",
    slug: "stoichiometry",
    category: "chemistry",
    subcategory: "general",
    keywords: ["stoichiometry", "reaction", "moles", "limiting", "reactant"],
    icon: Atom,
    featured: false,
  },
  // ... more chemistry calculators
};
```

### Homepage Integration

**Existing pattern works as-is:**

Category cards are auto-generated from registry. Add engineering/chemistry category cards to homepage category grid.

```typescript
// src/app/[locale]/page.tsx (already exists)
const categories = getAllCategories();
// Engineering and Chemistry automatically appear in grid
```

### Search Integration

**Existing pattern works as-is:**

`searchConverters()` function uses keywords from registry. No changes needed.

**Keywords Strategy:**

- Engineering: "beam", "stress", "deflection", "material", "structural", "buckling"
- Chemistry: "molecular", "stoichiometry", "periodic", "element", "compound", "reaction"

---

## i18n Integration

### Formula & Symbol Handling

**Challenge:** Chemical formulas and engineering symbols are universal (H₂O, σ = F/A)

**Approach:** Do NOT translate formulas, DO translate labels and descriptions

```json
// src/messages/en.json
{
  "converters": {
    "molecular-weight": {
      "name": "Molecular Weight Calculator",
      "description": "Calculate molar mass from chemical formula",
      "metaDescription": "Calculate molecular weight and molar mass..."
    }
  },
  "calculator": {
    "chemistry": {
      "formula": "Chemical Formula",
      "formulaPlaceholder": "e.g., H2O, Ca(OH)2",
      "molecularWeight": "Molecular Weight",
      "molarMass": "Molar Mass"
    },
    "engineering": {
      "material": "Material",
      "elasticModulus": "Elastic Modulus (E)",
      "yieldStrength": "Yield Strength",
      "maxStress": "Maximum Stress (σ_max)"
    }
  }
}
```

```json
// src/messages/fr.json
{
  "calculator": {
    "chemistry": {
      "formula": "Formule Chimique",
      "formulaPlaceholder": "ex: H2O, Ca(OH)2",  // Examples stay the same
      "molecularWeight": "Poids Moléculaire",
      "molarMass": "Masse Molaire"
    },
    "engineering": {
      "material": "Matériau",
      "elasticModulus": "Module d'Élasticité (E)",  // Symbol stays in parentheses
      "yieldStrength": "Limite d'Élasticité",
      "maxStress": "Contrainte Maximale (σ_max)"
    }
  }
}
```

### Unit Translations

**Pattern:** Unit abbreviations stay English, unit names translate

```json
// en.json
{
  "units": {
    "pascal": "Pascal",
    "pascalAbbr": "Pa",
    "gramsPerMole": "grams per mole",
    "gramsPerMoleAbbr": "g/mol"
  }
}

// fr.json
{
  "units": {
    "pascal": "Pascal",
    "pascalAbbr": "Pa",  // Same
    "gramsPerMole": "grammes par mole",
    "gramsPerMoleAbbr": "g/mol"  // Same
  }
}
```

### Element Name Translations

**Periodic table element names translate:**

```typescript
// src/lib/data/periodic-table.ts
export interface Element {
  symbol: string;        // "H" - universal, never translate
  atomicNumber: number;  // 1
  atomicMass: number;    // 1.008
  nameKey: string;       // "elements.hydrogen" - translation key
}

// Usage in component:
const t = useTranslations("elements");
<span>{t(element.nameKey)}</span>  // "Hydrogen" or "Hydrogène"
```

```json
// en.json
{
  "elements": {
    "hydrogen": "Hydrogen",
    "helium": "Helium",
    "carbon": "Carbon"
  }
}

// fr.json
{
  "elements": {
    "hydrogen": "Hydrogène",
    "helium": "Hélium",
    "carbon": "Carbone"
  }
}
```

### Special Characters (Greek Symbols, Superscripts)

**Challenge:** σ (sigma), δ (delta), E (modulus), subscripts/superscripts

**Approach:** Use Unicode in translation strings

```json
{
  "engineering": {
    "stress": "Stress (σ)",
    "deflection": "Deflection (δ)",
    "formula": "σ = M·c / I"
  },
  "chemistry": {
    "water": "H₂O",  // Unicode subscript 2
    "sulfate": "SO₄²⁻"  // Superscripts/subscripts
  }
}
```

**Component Rendering:** Browser handles Unicode natively, no special components needed.

---

## Integration with Existing Patterns

### Checklist

- [x] **Uses Zustand stores** - `createCalculatorStore` pattern applies directly
- [x] **URL state sync via middleware** - Existing middleware handles engineering/chemistry params
- [x] **i18n via useTranslations()** - Namespaced keys follow existing pattern
- [x] **PDF/CSV export compatible** - Result structure matches existing exporters
- [x] **Code splitting by category** - Next.js automatically splits `/engineering/` and `/chemistry/` routes
- [x] **ResultGrid for simple results** - Multi-value results use existing component
- [x] **Custom result display for complex** - Charts/diagrams use recharts (already in dependencies)

### Pattern Verification by Example

#### Engineering Beam Deflection Calculator

**Calculation Logic** (`src/lib/converters/engineering/beam-deflection.ts`):

```typescript
export interface BeamInput {
  length: number;        // meters
  load: number;          // Newtons
  material: string;      // material ID
  crossSection: string;  // section ID
  supportType: "simply-supported" | "cantilever" | "fixed-fixed";
}

export interface BeamResult {
  maxDeflection: number;
  maxStress: number;
  reactions: { left: number; right: number };
  deflectionCurve: Array<{ x: number; y: number }>;
  stressCurve: Array<{ x: number; stress: number }>;
  safetyFactor: number;
  steps: string[];
}

export function calculateBeamDeflection(input: BeamInput): BeamResult | null {
  const material = getMaterial(input.material);
  if (!material) return null;

  // ... calculation using material.elasticModulus, etc.

  return { /* result */ };
}
```

**Component** (`src/app/[locale]/engineering/beam-deflection/beam-deflection-calculator.tsx`):

```typescript
"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { MaterialSelector, BeamDiagram, StressChart } from "@/components/engineering";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCalculatorStore } from "@/stores/calculator-store";
import { calculateBeamDeflection, type BeamInput, type BeamResult } from "@/lib/converters/engineering/beam-deflection";

const useBeamStore = createCalculatorStore<BeamInput, BeamResult>({
  name: "beam-deflection",
  initialValues: {
    length: 5,
    load: 10000,
    material: "steel-a36",
    crossSection: "i-beam-w12x26",
    supportType: "simply-supported",
  },
  calculate: calculateBeamDeflection,
});

export function BeamDeflectionCalculator() {
  const t = useTranslations("calculator");
  const { values, setValue, result } = useBeamStore();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("labels.inputs")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="length"
            label={t("engineering.beamLength")}
            value={values.length}
            onChange={(v) => setValue("length", Number(v))}
            unit="m"
          />

          <MaterialSelector
            selectedMaterial={values.material}
            onMaterialChange={(mat) => setValue("material", mat.id)}
            category="structural-steel"
          />

          {/* More inputs... */}
        </CardContent>
      </Card>

      {/* Beam Diagram Visualization */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t("engineering.beamDiagram")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BeamDiagram
              length={values.length}
              supports={[
                { position: 0, type: "pinned" },
                { position: values.length, type: "roller" },
              ]}
              loads={[{ position: values.length / 2, magnitude: values.load, type: "point" }]}
            />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t("labels.results")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultGrid
              results={[
                { label: t("engineering.maxDeflection"), value: result.maxDeflection.toFixed(4), unit: "m" },
                { label: t("engineering.maxStress"), value: (result.maxStress / 1e6).toFixed(2), unit: "MPa" },
                { label: t("engineering.safetyFactor"), value: result.safetyFactor.toFixed(2) },
              ]}
              columns={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Deflection Curve Chart */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t("engineering.deflectionCurve")}</CardTitle>
          </CardHeader>
          <CardContent>
            <StressChart data={result.deflectionCurve} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Pattern Matches:** Finance mortgage calculator (multiple cards, charts, ResultGrid)

#### Chemistry Molecular Weight Calculator

**Calculation Logic** (`src/lib/converters/chemistry/molecular-weight.ts`):

```typescript
import { PERIODIC_TABLE, getElement } from "@/lib/data/periodic-table";

export interface ParsedFormula {
  elements: Array<{ symbol: string; count: number; mass: number }>;
  isValid: boolean;
  error?: string;
}

export interface MolecularWeightResult {
  formula: string;
  molecularWeight: number;
  molarMass: number;
  composition: Array<{ element: string; mass: number; percentage: number }>;
  totalAtoms: number;
  steps: string[];
}

export function parseFormula(formula: string): ParsedFormula {
  // Parse formula (H2O → [{H:2}, {O:1}])
  // ... parsing logic
}

export function calculateMolecularWeight(formula: string): MolecularWeightResult | null {
  const parsed = parseFormula(formula);
  if (!parsed.isValid) return null;

  const molecularWeight = parsed.elements.reduce((sum, el) => {
    return sum + (el.mass * el.count);
  }, 0);

  // ... rest of calculation

  return { /* result */ };
}
```

**Component Pattern:** Same as engineering - uses existing patterns.

---

## Performance Considerations

### Bundle Size Impact

**Current Bundle (estimated):**

- Core Next.js + React: ~200KB
- Existing calculators: ~300KB
- **Total: ~500KB gzipped**

**New Additions:**

- Reference data (periodic table + materials): ~23KB gzipped
- Engineering components: ~8KB gzipped
- Chemistry components: ~6KB gzipped
- **Total added: ~37KB gzipped**

**New Total:** ~537KB gzipped (+7.4%)

**Verdict:** Acceptable - well under typical budget of 1MB for initial load

### Code Splitting Strategy

**Current Strategy:** Next.js automatically splits by route

```
/en/engineering/beam-deflection
  → Loads: beam-deflection-calculator.tsx + engineering components + material data
  → Does NOT load: chemistry data, chemistry components

/en/chemistry/molecular-weight
  → Loads: molecular-weight-calculator.tsx + chemistry components + periodic table
  → Does NOT load: engineering data, engineering components
```

**No changes needed** - works automatically with new categories.

### Lazy Loading Opportunities

**Reference Data:**

```typescript
// Lazy load material database (only when material selector opens)
const MaterialSelector = dynamic(() => import("./material-selector"), {
  loading: () => <Skeleton className="h-10" />,
});

// Periodic table data loads on demand
const periodicTableData = lazy(() => import("@/lib/data/periodic-table"));
```

**Verdict:** Premature optimization - start with static imports, optimize if performance issues arise.

### Rendering Performance

**Charts:** Recharts uses React memoization - no issues expected (already used in mortgage calculator)

**SVG Diagrams:** Beam diagrams are simple SVGs (< 100 elements) - negligible performance impact

**Large Tables:** Periodic table display (118 elements) - use virtualization if scrollable

```typescript
// Only if performance issue observed
import { useVirtualizer } from "@tanstack/react-virtual";
```

---

## Comparison with Existing Complex Calculators

| Feature | Mortgage Calculator | Photo DOF Calculator | Engineering Beam | Chemistry Stoichiometry |
|---------|---------------------|----------------------|------------------|------------------------|
| **Reference Data** | None | COC constants | Material properties | Periodic table |
| **Multi-Section Results** | Yes (6 cards) | Yes (multiple outputs) | Yes (4-5 cards) | Yes (3-4 cards) |
| **Charts/Visualizations** | 3 charts (recharts) | None | 2-3 charts | 1-2 charts |
| **Complex State** | Linked fields | Independent | Material auto-fill | Formula parsing |
| **URL Sync** | Yes | Yes | Yes | Yes |
| **PDF Export** | Compatible | Compatible | Compatible | Compatible |

**Finding:** Engineering and Chemistry calculators match existing complexity patterns. No new architectural paradigms needed.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bundle size bloat | Low | Medium | Code splitting already handles this |
| i18n complexity (symbols) | Low | Low | Unicode in JSON works well |
| Reference data accuracy | Medium | High | Source data from authoritative standards (IUPAC, AISC) |
| Formula parsing bugs | Medium | Medium | Extensive unit tests for parser |
| Chart performance | Low | Low | Recharts proven in production |

**Overall Risk:** LOW - Architecture is proven and patterns are established.

---

## Open Questions & Future Research

### Deferred to Phase-Specific Research

These questions don't affect architecture but will need answers during implementation:

1. **Which engineering calculators to prioritize?**
   - Beam deflection (high demand)
   - Column buckling
   - Stress/strain transformations
   - → Research during milestone planning

2. **Periodic table data source?**
   - Option A: [Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON) (MIT license)
   - Option B: Build from IUPAC data
   - → Verify licensing and accuracy during implementation

3. **Material database scope?**
   - Start with structural steel (A36, A572, A992)
   - Add aluminum, wood in later phases
   - → Prioritize based on user demand

4. **Chemical equation balancing algorithm?**
   - Matrix method vs recursive
   - → Prototype during development

### No Architectural Blockers

All questions above are implementation details - architecture supports any choice.

---

## Sources

### Engineering Calculators Research

- [SkyCiv Free Beam Calculator](https://skyciv.com/free-beam-calculator/)
- [MechaniCalc Material Properties](https://mechanicalc.com/reference/material-properties-tables)
- [Calcs.com Structural Calculators](https://calcs.com/)
- [Engineering ToolBox](https://www.engineeringtoolbox.com/)
- [Beam Stress & Deflection Reference](https://mechanicalc.com/reference/beam-analysis)

### Chemistry Calculators Research

- [Omnicalculator Chemistry Tools](https://www.omnicalculator.com/chemistry)
- [Bowserinator Periodic Table JSON](https://github.com/Bowserinator/Periodic-Table-JSON)
- [Periodic Table API Documentation](https://github.com/neelpatel05/periodic-table-api)
- [Lenntech Molecular Weight Calculator](https://www.lenntech.com/calculators/molecular/molecular-weight-calculator.htm)
- [Stoichiometry Calculator Examples](https://ezcalc.me/stoichiometry-calculator/)

### Existing Codebase Patterns

- Codebase Architecture Documentation - Current system design
- Mortgage Calculator Implementation - Complex multi-section pattern
- Cooking Densities Data - Reference data pattern
- Mortgage Calculator Component - Multi-section visualization pattern

---

## Conclusion

**Verdict:** Engineering and Chemistry calculators integrate seamlessly with existing Converty architecture.

**Key Success Factors:**

1. Reference data pattern already established (`/lib/data/`)
2. Visualization library already in dependencies (recharts)
3. State management pattern proven with complex calculators (mortgage)
4. i18n handles technical symbols via Unicode
5. Code splitting handles bundle size automatically

**No Architectural Changes Required** - proceed with standard calculator addition workflow.

**Recommended Next Steps:**

1. Create category entries in registry
2. Build 1 engineering prototype (beam deflection)
3. Build 1 chemistry prototype (molecular weight)
4. Validate patterns before scaling to full category

---

**Research Confidence:** HIGH
**Ready for Roadmap Creation:** Yes
