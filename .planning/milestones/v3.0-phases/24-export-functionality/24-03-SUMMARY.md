# Plan 24-03 Summary: Age Calculator CSV Export Integration

**Phase:** 24 - Export Functionality  
**Plan:** 03 - Age Calculator integration  
**Status:** ✅ Complete  
**Duration:** ~3 minutes  
**Execution Date:** 2026-01-25

## Objective

Add CSV export to Age Calculator alongside existing PDF export as reference implementation.

## What Was Built

### Task 1: Add CSV Export to Age Calculator

**File Modified:** `src/app/[locale]/datetime/age/age-calculator.tsx`

**Changes:**

1. **Updated Imports:**
   - Added `CsvExportButton` to converter imports
   - Added `type CsvRow` from `@/lib/utils/csv-export`

2. **Created CSV Data Preparation:**
```typescript
const csvData: CsvRow[] = useMemo(() => {
  if (!result) return [];
  return [
    { Field: t("birthDate"), Value: values.birthDate, Unit: "" },
    { Field: t("years"), Value: result.years, Unit: "" },
    { Field: t("months"), Value: result.months, Unit: "" },
    { Field: t("days"), Value: result.days, Unit: "" },
    { Field: `${t("days")} (${tSections("summary")})`, Value: result.totalDays, Unit: "" },
    { Field: `${t("weeks")} (${tSections("summary")})`, Value: result.totalWeeks, Unit: "" },
    { Field: `${t("months")} (${tSections("summary")})`, Value: result.totalMonths, Unit: "" },
    { Field: t("zodiacSign"), Value: tZodiacWestern(result.zodiacSign), Unit: "" },
    { Field: t("chineseZodiac"), Value: tZodiacChinese(result.chineseZodiac), Unit: "" },
    { Field: t("daysUntilBirthday"), Value: result.nextBirthday.daysUntil, Unit: "" },
  ];
}, [result, values.birthDate, t, tSections, tZodiacWestern, tZodiacChinese]);
```

3. **Updated CardHeader with Both Export Buttons:**
```tsx
<CardHeader className="flex flex-row items-center justify-between">
  <CardTitle className="text-lg">{t("age")}</CardTitle>
  <div className="flex gap-2">
    <PdfExportButton
      sections={pdfSections}
      options={{
        title: t("age"),
        subtitle: `${t("birthDate")}: ${values.birthDate}`,
      }}
    />
    <CsvExportButton 
      data={csvData} 
      filename="age-calculator" 
    />
  </div>
</CardHeader>
```

## CSV Data Structure

The CSV export includes all age calculation fields:

| Field | Value | Source |
|-------|-------|--------|
| Birth Date | User input | `values.birthDate` |
| Years | Calculated | `result.years` |
| Months | Calculated | `result.months` |
| Days | Calculated | `result.days` |
| Days (Summary) | Total days lived | `result.totalDays` |
| Weeks (Summary) | Total weeks lived | `result.totalWeeks` |
| Months (Summary) | Total months lived | `result.totalMonths` |
| Zodiac Sign | Western zodiac | `result.zodiacSign` (translated) |
| Chinese Zodiac | Chinese zodiac | `result.chineseZodiac` (translated) |
| Days Until Birthday | Next birthday | `result.nextBirthday.daysUntil` |

## Verification

✅ TypeScript compilation: Clean (`npm run type-check`)  
✅ Both PdfExportButton and CsvExportButton present  
✅ Buttons wrapped in `<div className="flex gap-2">` for spacing  
✅ CSV includes all age data fields  
✅ Biome formatting applied  

## Commits

### Commit 1: Age Calculator CSV Integration
**Hash:** de925d7  
**Message:** feat(24-03): add CSV export to Age Calculator

**Changes:**
- Updated imports: added `CsvExportButton` and `type CsvRow`
- Created `csvData` useMemo with 10 age-related fields
- Modified CardHeader: wrapped both buttons in flex container
- +28 lines, -8 lines

## UI Pattern

**Before:**
```tsx
<CardHeader className="flex flex-row items-center justify-between">
  <CardTitle>{t("age")}</CardTitle>
  <PdfExportButton {...} />
</CardHeader>
```

**After:**
```tsx
<CardHeader className="flex flex-row items-center justify-between">
  <CardTitle>{t("age")}</CardTitle>
  <div className="flex gap-2">
    <PdfExportButton {...} />
    <CsvExportButton {...} />
  </div>
</CardHeader>
```

This pattern provides:
- Consistent spacing between buttons (Tailwind `gap-2`)
- Right-aligned button group
- Clean visual hierarchy

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| useMemo for csvData | Same pattern as pdfSections - recompute only when result changes |
| Include all fields in CSV | Comprehensive export - users get complete data set |
| Use Field/Value/Unit structure | Consistent with PDF export, allows future extension |
| filename="age-calculator" | Descriptive base name, timestamp added by component |

## Reference Implementation

This Age Calculator integration serves as the **reference pattern** for adding export functionality to other calculators:

### Pattern to Follow:

1. **Import both export buttons:**
```typescript
import { CsvExportButton, PdfExportButton } from "@/components/converter";
import { type CsvRow } from "@/lib/utils/csv-export";
```

2. **Create CSV data preparation:**
```typescript
const csvData: CsvRow[] = useMemo(() => {
  if (!result) return [];
  return [/* map result to CsvRow[] */];
}, [dependencies]);
```

3. **Update CardHeader:**
```tsx
<CardHeader className="flex flex-row items-center justify-between">
  <CardTitle>{title}</CardTitle>
  <div className="flex gap-2">
    <PdfExportButton {...pdfProps} />
    <CsvExportButton data={csvData} filename="calculator-name" />
  </div>
</CardHeader>
```

## Next Steps

→ **Phase 24 Complete:** All 3 plans executed  
→ **Future Work:** Apply export pattern to other calculators as needed  
→ **Reference:** Use Age Calculator as template for export integration

## Must-Haves Status

✅ Age Calculator has both PDF and CSV export buttons  
✅ CSV export includes age inputs and results  
✅ Export buttons appear in results section when results exist  
✅ Exported files have descriptive timestamped names

**All must-haves satisfied.**
