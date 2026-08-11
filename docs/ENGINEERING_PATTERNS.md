# Engineering Calculator Patterns

Guidelines for building engineering calculators in Converty.

## Source Files

| Path | Purpose |
|------|---------|
| `src/lib/converters/engineering/` | Calculation logic |
| `src/data/engineering/materials.json` | Steel/aluminum/timber properties |
| `src/data/engineering/beam-sections.json` | I-beam, channel, tube profiles |
| `src/data/engineering/pipe-materials.json` | Pipe roughness values |
| `src/data/engineering/fluids.json` | Fluid density and viscosity |

## Existing Calculators

| Calculator | Key Formula | Source Standard |
|------------|------------|-----------------|
| Stress-Strain | `σ = F/A`, `ε = ΔL/L` | Mechanics of Materials |
| Moment of Inertia | `I = bh³/12` (rectangle) | Engineering reference |
| Beam Deflection | `δ = PL³/(48EI)` (simply supported) | Euler-Bernoulli beam theory |
| Column Buckling | `P_cr = π²EI/(KL)²` | Euler / AISC 360 |
| Pipe Flow | Darcy-Weisbach + Colebrook-White | Fluid mechanics |
| Unit Converter | Factor-based conversion matrix | NIST SP 811 |

---

## Material Database Pattern

Materials are stored as JSON with mechanical properties:

```json
{
  "id": "a36-steel",
  "name": "ASTM A36 Steel",
  "youngsModulus": 200000,
  "yieldStrength": 250,
  "density": 7850,
  "units": { "stress": "MPa", "density": "kg/m³" }
}
```

**Access pattern:**

```typescript
import materials from "@/data/engineering/materials.json";

export function getColumnMaterials() {
  return materials;
}

export function getColumnMaterialById(id: string) {
  return materials.find((m) => m.id === id);
}
```

**Rules:**

- Always provide a `"custom"` option — let users enter their own values
- Store property values in SI units (Pa, m, kg/m³)
- Include source attribution in comments
- Use typed interfaces matching JSON shape

---

## Section Database Pattern

Structural sections (I-beams, channels, tubes) stored with geometric properties:

```json
{
  "id": "w200x46",
  "name": "W200×46",
  "area": 5890,
  "momentOfInertiaX": 45500000,
  "momentOfInertiaY": 15300000,
  "units": { "area": "mm²", "momentOfInertia": "mm⁴" }
}
```

Support both strong-axis (X) and weak-axis (Y) properties for biaxial analysis.

---

## Calculation Steps Pattern

Engineering calculators return a `steps` array for educational display:

```typescript
interface CalculationStep {
  label: string;          // Translation key like "eulerCriticalLoad"
  formula?: string;       // LaTeX-style: "P_{cr} = π²EI/(KL)²"
  substitution?: string;  // "= π² × 200000 × 45.5e6 / (3500)²"
  value: number;
  unit: string;
}

export interface ColumnBucklingResult {
  eulerLoad: number;
  slendernessRatio: number;
  steps: CalculationStep[];
  // ...
}
```

This lets the UI render step-by-step derivations.

---

## End Condition / Lookup Table Pattern

Use constant maps for discrete engineering parameters:

```typescript
const END_CONDITION_K: Record<string, number> = {
  "pinned-pinned": 1.0,
  "fixed-pinned": 0.7,
  "fixed-fixed": 0.5,
  "fixed-free": 2.0,
};
```

---

## Unit Conversion Pattern

The engineering unit converter uses a category-based approach:

```typescript
interface UnitDefinition {
  id: string;
  name: string;          // Translation key
  symbol: string;        // Display symbol (never translated)
  toBase: number;        // Conversion factor to SI base unit
}

interface UnitCategory {
  id: string;
  name: string;          // Translation key
  baseUnit: string;      // SI base unit ID
  units: UnitDefinition[];
}
```

**Conversion:** `result = value × fromUnit.toBase / toUnit.toBase`

**Precision:** Use NIST SP 811 conversion factors. Store full precision (e.g., `6894.757293168` for psi→Pa).

---

## Fluid Mechanics Pattern

Pipe flow uses iterative solving (Colebrook-White equation):

```typescript
// Colebrook-White is implicit — solve iteratively
// 1/√f = -2·log₁₀(ε/(3.7·D) + 2.51/(Re·√f))
// Use Swamee-Jain as initial guess, then iterate
```

**Flow regime classification:**

- `Re < 2300` → Laminar (use `f = 64/Re`)
- `2300 ≤ Re ≤ 4000` → Transitional (interpolate or warn)
- `Re > 4000` → Turbulent (use Colebrook-White)

---

## Validation Rules

1. **Physical constraints**: Reject negative lengths, zero areas, negative moduli
2. **Return `CalculationResult<T>`** for all calculator functions — never throw, never return bare `null`
   - Success: `return { ok: true, value: result };`
   - Failure: `return { ok: false, error: "Effective length must be positive", code: "INVALID_INPUT" };`
   - Import: `import type { CalculationResult } from "@/types/calculation-result";`
3. **Check for division by zero**: Effective length, cross-sectional area, diameter
4. **Warn on extreme values**: Slenderness ratio > 200 triggers a warning message
5. **Use `Number.isFinite()`** to guard against `Infinity` and `NaN`

---

## Adding a New Engineering Calculator

1. Create `src/lib/converters/engineering/{name}.ts` with typed input/result interfaces; return `CalculationResult<YourResult>` (not `T | null`)
2. Add material/section data to `src/data/engineering/` if needed
3. Export lookup functions (`getMaterials()`, `getMaterialById()`)
4. Include `steps` array in result for calculation display
5. Register in `src/lib/registry/converters.ts` under `category: "engineering"`
6. Add translations with engineering-standard terminology per locale
7. Follow existing `column-buckling.ts` or `pipe-flow.ts` as templates
