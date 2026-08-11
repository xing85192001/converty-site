# Phase 15 Research: Translation Audit

**Research Date:** 2026-01-22
**Phase Goal:** Identify and extract all hardcoded strings to translation files

## Findings Summary

### Audit Completed

Two inventory files were created in a previous session:

- `i18n_audit_inventory.md` - Hardcoded strings (300+ items)
- `i18n_missing_keys_inventory.md` - Missing translation keys (9 items)

### Scope

**Missing Translation Keys (9 keys):**

| Key | Component |
|-----|-----------|
| calculator.results.estimatedGFR | gfr-calculator |
| calculator.results.gfrByFormula | gfr-calculator |
| calculator.results.ckdStages | gfr-calculator |
| calculator.results.dailyMacros | macro-calculator |
| calculator.results.caloriesFromMacros | macro-calculator |
| calculator.results.proteinCalories | macro-calculator |
| calculator.results.carbsCalories | macro-calculator |
| calculator.results.fatCalories | macro-calculator |
| calculator.results.carbs | macro-calculator |

**Hardcoded Strings by Category:**

| Category | Files | Strings | Description |
|----------|-------|---------|-------------|
| Health | 7 | ~100 | Categories, food lists, tips, stages |
| DateTime | 6 | ~40 | Day names, time units (plurals), regions |
| Finance | 3 | ~70 | Frequencies, currencies, US states |
| Data | 2 | ~20 | Unit names, network types, file samples |
| Music/Video | 4 | ~40 | Labels, brightness levels, references |

### Pattern Analysis

**Current Pattern (Incorrect):**

```typescript
// Converter returns display string
return { category: "Underweight" };  // WRONG

// UI renders directly
<span>{result.category}</span>
```

**Correct Pattern (Reference: bmi.ts, body-fat.ts):**

```typescript
// Converter returns KEY
export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";
return { category: "underweight" };  // KEY only

// UI translates at render time
<span>{t(`results.${result.category}`)}</span>
```

### Files Requiring Changes

**Health Calculators:**

1. `src/lib/converters/health/carb-calculator.ts` - Food source arrays
2. `src/lib/converters/health/corpulence.ts` - Category strings
3. `src/lib/converters/health/fat-intake-calculator.ts` - Food source arrays
4. `src/lib/converters/health/gfr-calculator.ts` - Stage descriptions
5. `src/lib/converters/health/healthy-weight-calculator.ts` - Category strings
6. `src/lib/converters/health/protein-calculator.ts` - Food + serving arrays
7. `src/lib/converters/health/water-intake-calculator.ts` - Tip strings

**DateTime Converters:**

1. `src/lib/converters/datetime/date.ts` - Day names
2. `src/lib/converters/datetime/day-counter.ts` - Time units
3. `src/lib/converters/datetime/day-of-week.ts` - Day names
4. `src/lib/converters/datetime/duration-converter.ts` - Time units
5. `src/lib/converters/datetime/time-duration.ts` - Time units
6. `src/lib/converters/datetime/time-zone.ts` - Region names

**Finance Calculators:**

1. `src/lib/converters/finance/compound-interest.ts` - Frequency labels
2. `src/lib/converters/finance/currency.ts` - Currency names
3. `src/lib/converters/finance/salary.ts` - US state names

**Data Converters:**

1. `src/lib/converters/data/data-size.ts` - Unit names
2. `src/lib/converters/data/download-calculator.ts` - Network types, file samples

**Music/Video:**

1. `src/app/[locale]/music/bpm/bpm-calculator.tsx` - Table headers, labels
2. `src/app/[locale]/music/page.tsx` - Placeholder text
3. `src/lib/converters/video/foot-lambert.ts` - Brightness levels
4. `src/app/[locale]/video/foot-lambert/foot-lambert-calculator.tsx` - Unit labels

### Translation File Impact

All strings will be added to:

- `src/messages/en.json` (Phase 15 scope)
- `src/messages/fr.json` (Phase 16 scope)
- `src/messages/de.json` (Phase 16 scope)
- `src/messages/it.json` (Phase 16 scope)

### Pluralization Considerations

DateTime time units require ICU pluralization:

```json
{
  "timeUnits": {
    "day": "{count, plural, one {day} other {days}}",
    "week": "{count, plural, one {week} other {weeks}}"
  }
}
```

### Recommendations

1. **Wave 1 (Quick Win):** Add 9 missing keys first - components already expect them
2. **Wave 2-6:** Refactor converters by category, largest impact first (Health)
3. **Verification:** Run lint + build after each wave

## References

- Audit inventories: `i18n_audit_inventory.md`, `i18n_missing_keys_inventory.md`
- Correct pattern: `src/lib/converters/health/bmi.ts`, `body-fat.ts`
- Requirements: I18N-01, I18N-02
