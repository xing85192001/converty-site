# Chemistry Calculator Patterns

Guidelines for building chemistry calculators in Converty.

## Source Files

| Path | Purpose |
|------|---------|
| `src/lib/converters/chemistry/` | Calculation logic |
| `src/lib/converters/chemistry/formula-parser.ts` | Chemical formula parser |
| `src/lib/converters/chemistry/equation-parser.ts` | Balanced equation parser |
| `src/data/chemistry/periodic-table.json` | 118 elements (IUPAC 2024) |
| `src/data/chemistry/common-compounds.json` | Preset compound formulas |
| `src/data/chemistry/acids-bases.json` | Acid/base pKa values |

## Existing Calculators

| Calculator | Function | Data Source |
|------------|----------|-------------|
| Molecular Weight | `parseChemicalFormula()` → element composition → sum atomic masses | periodic-table.json |
| Molarity | Mass/volume or moles/volume → concentration | None (pure math) |
| Dilution | M₁V₁ = M₂V₂ solver | None (pure math) |
| Stoichiometry | Equation parser → limiting reactant → theoretical yield | periodic-table.json |
| pH Calculator | pH/pOH/[H⁺]/[OH⁻] interconversion, Henderson-Hasselbalch | acids-bases.json |
| Periodic Table | Interactive element lookup with filtering | periodic-table.json |

---

## Formula Parser

The recursive descent parser in `formula-parser.ts` handles:

- Simple formulas: `H2O`, `NaCl`, `CO2`
- Parenthesized groups: `Ca(OH)2`, `Mg(NO3)2`
- Nested groups: `Ca3(PO4)2`
- Hydrates: `CuSO4·5H2O` (dot notation)

```typescript
import { parseChemicalFormula } from "@/lib/converters/chemistry/formula-parser";

const result = parseChemicalFormula("Ca(OH)2");
// { success: true, composition: { Ca: 1, O: 2, H: 2 } }

const bad = parseChemicalFormula("XyZ");
// { success: false, error: "Unknown element: Xy" }
```

**Key functions:**

- `parseElement()` — Reads uppercase + optional lowercase letters
- `parseNumber()` — Reads trailing digit sequence (default 1)
- `parseFormulaRecursive()` — Handles `(` `)` groups with multipliers
- `findMatchingBracket()` — Bracket matching for nested groups
- Character classification: `isUpperCase()`, `isLowerCase()`, `isDigit()`

**Error handling:** Return `{ success: false, error: string }` — never throw.

---

## Equation Parser

The equation parser in `equation-parser.ts` splits balanced chemical equations:

```
2H2 + O2 → 2H2O
Fe2O3 + 3CO -> 2Fe + 3CO2
```

Accepted arrow formats: `→`, `->`, `=`, `⟶`

The parser extracts:

- Reactants and products as separate arrays
- Stoichiometric coefficients
- Individual formulas for molecular weight lookup

---

## Periodic Table Data

`src/data/chemistry/periodic-table.json` contains 118 elements:

```json
{
  "atomicNumber": 1,
  "symbol": "H",
  "name": "Hydrogen",
  "atomicMass": 1.008,
  "category": "nonmetal",
  "period": 1,
  "group": 1,
  "electronConfiguration": "1s¹",
  "electronegativity": 2.2,
  "oxidationStates": ["-1", "+1"],
  "density": 0.00008988,
  "meltingPoint": -259.16,
  "boilingPoint": -252.87
}
```

**Data source:** IUPAC 2024 recommended atomic weights.

**Element names are translated** (Hydrogen → Hydrogène → Wasserstoff → Idrogeno), but **symbols never are** (H, O, Na).

---

## pH Calculator Modes

The pH calculator demonstrates the multi-mode pattern:

```typescript
type PhMode =
  | "fromPh"       // pH → pOH, [H⁺], [OH⁻]
  | "fromPoh"      // pOH → pH, [H⁺], [OH⁻]
  | "fromH"        // [H⁺] → pH, pOH, [OH⁻]
  | "fromOh"       // [OH⁻] → pH, pOH, [H⁺]
  | "strongAcid"   // Concentration → pH
  | "strongBase"   // Concentration → pH
  | "weakAcid"     // Concentration + pKa → pH
  | "buffer";      // Henderson-Hasselbalch
```

Each mode requires different input fields. The component conditionally renders inputs based on the selected mode.

**Key constant:** `Kw = 1e-14` (water autoionization at 25°C).

---

## Common Compounds Preset Pattern

Chemistry calculators offer preset selections from `common-compounds.json`:

```json
{
  "id": "water",
  "formula": "H2O",
  "name": "Water"
}
```

The `name` field is a translation key — look up localized names via `t()`. The `formula` field is never translated.

Similarly, `acids-bases.json` provides pKa values:

```json
{
  "id": "acetic-acid",
  "name": "Acetic Acid",
  "formula": "CH3COOH",
  "pka": 4.76
}
```

---

## Precision Rules

| Value | Precision | Example |
|-------|-----------|---------|
| Atomic mass | 4 decimal places | `1.0080` |
| Molar mass | 4 decimal places | `18.0153 g/mol` |
| pH | 2 decimal places | `4.74` |
| pKa | 2 decimal places | `4.76` |
| Concentration (mol/L) | Scientific notation for small values | `1.82 × 10⁻⁵ M` |
| Mass percentage | 2 decimal places | `11.19%` |

---

## Validation Rules

1. **Formula validation**: `parseChemicalFormula()` returns `success: false` for invalid formulas
2. **Element existence**: Check against periodic table — reject unknown symbols
3. **Concentration bounds**: Must be positive, warn if unrealistically high (> 18 M for most aqueous)
4. **pH range**: 0–14 for standard conditions (allow outside for concentrated solutions)
5. **Equation balance**: Stoichiometry calculator verifies atom conservation

---

## Adding a New Chemistry Calculator

1. Create `src/lib/converters/chemistry/{name}.ts`
2. Reuse existing parsers (`formula-parser.ts`, `equation-parser.ts`) where applicable
3. Add reference data to `src/data/chemistry/` if needed
4. Use `parseChemicalFormula()` for any formula input — never parse formulas manually
5. Register in `src/lib/registry/converters.ts` under `category: "chemistry"`
6. Add translations — remember: formulas and symbols are never translated
7. Follow existing `molecular-weight.ts` or `ph-calculator.ts` as templates
