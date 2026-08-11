# Known Issues - Quality Audit (January 2026)

## CRITICAL: i18n Issues

### 1. Hardcoded English in Components

- **169+ hardcoded UI strings** across 107/117 calculator files
- **114+ hardcoded `label=` attributes** not using translations
- **55+ hardcoded CardTitle elements** (section titles like "Source", "Result")
- Example: `label="Start Date"` instead of `label={t("startDate")}`

### 2. Missing Translation Keys

- Section labels: "Source", "Destination", "Converted Time"
- Column headers: "Frequency", "Beat Duration", "Time Zone Offset"
- Result labels: "Estimated Bitrate", "Estimated File Size"
- ~50+ strings missing from translation files entirely

### 3. DRY Violation: Registry Duplication

- Registry stores English name/description
- Same English duplicated in en.json translations
- 302 duplicated strings (151 calculators × 2 fields)
- Registry should only contain IDs, fetch display text from translations

## MEDIUM: Code Quality

### 1. Biome Warnings

- 181 warnings (mostly array index as React key)
- 94 infos (unused dependencies)
- Fix with: `npm run check:fix`

### 2. State Management Inconsistency

- Mixed: Zustand (new) vs useConverter hook (legacy)
- Need to migrate all to Zustand

### 3. Large Components

- mortgage-calculator.tsx: 387 lines
- golden-hour-guide.tsx: 544 lines
- Should be split into sub-components

## LOW: Registry-Translation Mismatches

1. `gcd-calculator` + `lcm-calculator` in registry → `gcd-lcm` in translations
2. `right-triangle` registered but no directory

## Recommendations Priority

1. **Immediate**: Fix missing translation keys causing MISSING_MESSAGE errors
2. **High**: Convert 107 calculators to use `useTranslations()`
3. **Medium**: Remove English from registry (single source of truth)
4. **Low**: Fix Biome warnings, complete Zustand migration
