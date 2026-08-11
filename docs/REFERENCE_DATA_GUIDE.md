# Reference Data Guide

Guidelines for managing scientific and engineering reference data in Converty.

## Data Directory Structure

```
src/data/
├── chemistry/
│   ├── periodic-table.json       # 118 elements, IUPAC 2024
│   ├── common-compounds.json     # Preset compound formulas
│   └── acids-bases.json          # pKa values for pH calculator
├── engineering/
│   ├── materials.json            # Structural material properties
│   ├── beam-sections.json        # I-beam, channel, tube profiles
│   ├── pipe-materials.json       # Pipe surface roughness values
│   └── fluids.json               # Fluid density and viscosity
└── infrastructure/
    ├── hypervisor-features.json  # Feature comparison matrix
    ├── licensing-costs.json      # Windows Server pricing
    └── hypervisor-overhead.json  # Resource overhead factors
```

---

## Data Sourcing Standards

Each data file must document its source:

| Domain | Source | Update Frequency |
|--------|--------|-----------------|
| Atomic masses | IUPAC 2024 recommended values | Every 2–4 years (IUPAC release) |
| Material properties | AISC Steel Manual, Eurocode 3 | Stable (edition-based) |
| Beam sections | AISC Shapes Database | Stable (edition-based) |
| Pipe roughness | Perry's Chemical Engineers' Handbook | Stable |
| Fluid properties | CRC Handbook of Chemistry & Physics | Stable (edition-based) |
| Windows licensing | Microsoft price list | Annual (check before release) |
| Hypervisor features | Vendor documentation | Per major version release |

**Rule:** Always note the edition/year in a comment or metadata field.

---

## JSON Data Format

### Required Fields

Every data entry must have:

```json
{
  "id": "unique-kebab-case-id",
  "name": "Human-readable name"
}
```

### Optional Metadata

```json
{
  "source": "AISC 360-22",
  "units": { "stress": "MPa", "density": "kg/m³" }
}
```

### Naming Conventions

- `id`: kebab-case, unique within file (`"a36-steel"`, `"w200x46"`)
- `name`: English display name (translated via i18n system if needed)
- Numeric values: Store in SI units unless domain convention differs
- Unit labels: Include a `units` object describing what each numeric field represents

---

## Data Quality Checks

When adding or updating reference data:

1. **Cross-reference sources**: Verify values against at least one authoritative source
2. **Unit consistency**: All values in the same file must use the same unit system
3. **Precision**: Match the precision of the source (don't add false precision)
4. **Completeness**: New entries must have all required fields — partial entries break lookups
5. **ID stability**: Never change IDs after release — they may be stored in user URLs

---

## Adding a New Data File

1. Create `src/data/{domain}/{name}.json`
2. Define a TypeScript interface matching the JSON shape
3. Import as `import data from "@/data/{domain}/{name}.json"`
4. Create accessor functions: `getData()`, `getDataById(id: string)`
5. Handle the `"custom"` case — users can enter custom values
6. Add source attribution as a comment in the data module

**Example accessor:**

```typescript
import materials from "@/data/engineering/materials.json";

interface Material {
  id: string;
  name: string;
  youngsModulus: number;
  yieldStrength: number;
}

export function getMaterials(): Material[] {
  return materials as Material[];
}

export function getMaterialById(id: string): Material | undefined {
  return (materials as Material[]).find((m) => m.id === id);
}
```

---

## Updating Existing Data

When updating reference data (e.g., new IUPAC atomic masses):

1. Update the JSON file with new values
2. Update the source attribution comment
3. Run `npm run build` to verify no breakage
4. Document the update in CHANGELOG.md
5. Consider backward compatibility — changed values affect cached user URLs

---

## Translation of Data Values

| Field Type | Translate? | Example |
|------------|-----------|---------|
| `name` (material) | Yes | "Structural Steel" → "Acier de construction" |
| `name` (element) | Yes | "Hydrogen" → "Hydrogène" |
| `symbol` | Never | `H`, `Fe`, `Cu` |
| `formula` | Never | `H2O`, `NaCl` |
| `id` | Never | `"a36-steel"` |
| SI unit symbols | Never | `MPa`, `kg/m³` |
| Numeric values | Never | `200000`, `7850` |

Translation of data `name` fields happens through the i18n system, not by modifying JSON data files. The JSON stores English names; locale files map IDs to translated names.

---

## Data Validation at Build Time

The build process (`npm run build`) implicitly validates data through static page generation — any missing or malformed data causes a build error. There is no separate data validation step, but the typed imports ensure shape correctness at compile time.
