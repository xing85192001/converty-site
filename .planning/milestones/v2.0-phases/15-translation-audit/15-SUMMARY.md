# Phase 15 Summary: Translation Audit

**Status:** Planned
**Requirements:** I18N-01, I18N-02
**Plans:** 2 plans in 1 wave

## Goal

Identify and extract all hardcoded English strings to translation files, establishing the foundation for multi-locale support.

## Scope

**Missing Keys (Quick Fix):** 9 keys already referenced in components but missing from en.json
**Hardcoded Strings:** 300+ strings across 18 files in 5 categories

| Category | Files | Est. Strings |
|----------|-------|--------------|
| Health | 7 | ~100 |
| DateTime | 6 | ~40 |
| Finance | 3 | ~70 |
| Data | 2 | ~20 |
| Music/Video | 4 | ~40 |

## Plans

### Plan 15-01: Missing Keys & Health Calculator Externalization

- Add 9 missing translation keys
- Refactor 7 health calculator converters
- ~100 strings externalized

### Plan 15-02: DateTime, Finance, Data & Media Externalization

- 6 DateTime converters with pluralization
- 3 Finance converters
- 2 Data converters
- 4 Music/Video files
- ~170 strings externalized

## Pattern

**Before (Incorrect):**

```typescript
return { category: "Underweight" };  // Display string in code
```

**After (Correct):**

```typescript
return { category: "underweight" };  // Key only
// UI: t(`results.${result.category}`)
```

## Success Criteria

1. All 200+ calculators audited for hardcoded English strings
2. Complete list of hardcoded strings documented
3. All identified strings moved to en.json translation file
4. Zero hardcoded strings remain in calculator components

## Notes

- Phase 16 will translate these keys to fr, de, it
- Pluralization uses ICU MessageFormat syntax
- US state names kept in English (proper nouns)
