# Phase 24: Export Functionality - Research

**Researched:** 2026-01-25
**Domain:** Client-side PDF and CSV export for calculator results
**Confidence:** HIGH

## Summary

Phase 24 implements PDF and CSV export functionality for all calculator results. The good news: **PDF export infrastructure already exists** (jsPDF v4.0.0, utilities, component) but is only used by 1 calculator (Age Calculator). CSV export needs to be built from scratch but is straightforward using native browser APIs.

The research reveals:

- **PDF export**: jsPDF v4.0.0 (latest, Jan 2025) already installed and working correctly
- **CSV export**: Not implemented, but simple to add using Blob API (zero dependencies) or export-to-csv (3KB library)
- **Current usage**: Only Age Calculator exports to PDF; 167 calculators lack export functionality
- **Integration pattern**: PdfExportButton component exists, needs i18n and CSV counterpart
- **File naming**: Current implementation basic; needs timestamps and descriptive naming
- **Calculator state**: All 168 calculators use Zustand stores with `values` (inputs) and `result` (outputs)

**Primary recommendation:** Build on existing PDF infrastructure, add lightweight CSV export, create unified ExportButtons component with i18n support, and make export opt-in per calculator (not automatic for all 168).

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| jsPDF | 4.0.0 (latest) | Client-side PDF generation | Industry standard, 31k GitHub stars, actively maintained, already installed |
| Native Blob API | Built-in | CSV file generation | Zero dependencies, supported in all modern browsers, lightweight |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| export-to-csv | 1.4.0+ | TypeScript-friendly CSV export | Optional: if Blob API too low-level (adds 3KB to bundle) |
| Papa Parse | 5.4.0+ | CSV parsing/generation | NOT recommended: overkill for simple export (adds 43KB) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsPDF | pdfmake | More declarative API but larger bundle (requires complete rewrite, not worth it) |
| Blob API | export-to-csv | Slightly cleaner API but adds 3KB dependency (marginal benefit) |
| Client-side | Server-side export | Better for complex PDFs but violates static export constraint |

**Installation:**

```bash
# jsPDF already installed
npm list jspdf  # Shows: jspdf@4.0.0

# CSV export (if choosing library over Blob API)
npm install export-to-csv  # Optional: 3KB, TypeScript-first
```

## Architecture Patterns

### Current Implementation Structure

```
src/
├── lib/
│   └── utils/
│       └── pdf-export.ts                # ✅ EXISTS: PDF generation utilities
│       └── csv-export.ts                # ❌ NEED TO CREATE
├── components/
│   └── converter/
│       └── pdf-export-button.tsx        # ✅ EXISTS: Needs i18n
│       └── csv-export-button.tsx        # ❌ NEED TO CREATE
│       └── export-buttons.tsx           # ❌ NEED TO CREATE: Unified component
│       └── index.ts                     # UPDATE: Export new components
└── app/
    └── [locale]/
        └── datetime/age/
            └── age-calculator.tsx       # ✅ REFERENCE: Only calculator with PDF export
```

### Pattern 1: CSV Export with Native Blob API (RECOMMENDED)

**What:** Use browser's built-in Blob API to generate CSV files client-side with zero dependencies

**When to use:** Default approach for CSV export (lightweight, no bundle impact)

**Example:**

```typescript
// Source: Native browser API + best practices from web research
// File: src/lib/utils/csv-export.ts

export interface CsvExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

export interface CsvRow {
  [key: string]: string | number | boolean | null;
}

/**
 * Export data to CSV file using native Blob API
 * Zero dependencies, works in all modern browsers
 */
export function exportToCsv(
  data: CsvRow[],
  options: CsvExportOptions = {}
): void {
  if (data.length === 0) return;

  const { filename = 'export.csv', includeHeaders = true } = options;

  // Extract headers from first row
  const headers = Object.keys(data[0]);

  // Build CSV content
  const csvRows: string[] = [];

  // Add headers if requested
  if (includeHeaders) {
    csvRows.push(headers.map(escapeCSV).join(','));
  }

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCSV(value);
    });
    csvRows.push(values.join(','));
  }

  // Create CSV string
  const csvContent = csvRows.join('\n');

  // Create Blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCSV(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Helper for simple single-section exports
 */
export function exportSimpleCSV(
  label: string,
  data: CsvRow[],
  options?: Partial<CsvExportOptions>
): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${label.toLowerCase().replace(/\s+/g, '-')}_${timestamp}.csv`;

  exportToCsv(data, { filename, ...options });
}
```

### Pattern 2: Unified Export Buttons Component

**What:** Single component that provides both PDF and CSV export with i18n support

**When to use:** Most calculator result sections

**Example:**

```typescript
// File: src/components/converter/export-buttons.tsx
"use client";

import { Download, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { exportToPdf, type PdfSection } from "@/lib/utils/pdf-export";
import { exportToCsv, type CsvRow } from "@/lib/utils/csv-export";

interface ExportButtonsProps {
  // PDF export data
  pdfSections?: PdfSection[];
  pdfTitle: string;
  pdfSubtitle?: string;

  // CSV export data
  csvData?: CsvRow[];
  csvFilename?: string;

  // UI options
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  disabled?: boolean;
}

export function ExportButtons({
  pdfSections,
  pdfTitle,
  pdfSubtitle,
  csvData,
  csvFilename,
  variant = "outline",
  size = "sm",
  className,
  disabled = false,
}: ExportButtonsProps) {
  const t = useTranslations("calculator.export");

  const handlePdfExport = () => {
    if (!pdfSections || pdfSections.length === 0) return;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${pdfTitle.toLowerCase().replace(/\s+/g, '-')}_${timestamp}.pdf`;

    exportToPdf(pdfSections, {
      title: pdfTitle,
      subtitle: pdfSubtitle,
      filename,
    });
  };

  const handleCsvExport = () => {
    if (!csvData || csvData.length === 0) return;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = csvFilename ||
      `${pdfTitle.toLowerCase().replace(/\s+/g, '-')}_${timestamp}.csv`;

    exportToCsv(csvData, { filename });
  };

  const hasPdf = pdfSections && pdfSections.length > 0;
  const hasCsv = csvData && csvData.length > 0;

  if (!hasPdf && !hasCsv) return null;

  return (
    <div className={cn("flex gap-2", className)}>
      {hasPdf && (
        <Button
          variant={variant}
          size={size}
          onClick={handlePdfExport}
          disabled={disabled}
          title={t("pdfTooltip")}
        >
          <FileText className="h-4 w-4 mr-2" />
          {t("exportPdf")}
        </Button>
      )}

      {hasCsv && (
        <Button
          variant={variant}
          size={size}
          onClick={handleCsvExport}
          disabled={disabled}
          title={t("csvTooltip")}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("exportCsv")}
        </Button>
      )}
    </div>
  );
}
```

### Pattern 3: Calculator Integration

**What:** How calculators prepare export data from Zustand store state

**When to use:** Any calculator implementing export functionality

**Example:**

```typescript
// File: src/app/[locale]/finance/roi/roi-calculator.tsx
"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ExportButtons } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoiStore } from "./store";

export function RoiCalculator() {
  const t = useTranslations("calculator");
  const tCalc = useTranslations("converters.roi");
  const { values, result } = useRoiStore();

  // Prepare PDF sections
  const pdfSections = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: t("sections.input"),
        items: [
          {
            label: t("finance.initialInvestment"),
            value: values.initialInvestment,
            unit: "CHF"
          },
          {
            label: t("finance.finalValue"),
            value: values.finalValue,
            unit: "CHF"
          },
          {
            label: t("finance.investmentPeriodYears"),
            value: values.years
          },
        ],
      },
      {
        title: t("sections.results"),
        items: [
          {
            label: t("finance.profit"),
            value: result.profit.toFixed(2),
            unit: "CHF"
          },
          {
            label: t("finance.totalRoi"),
            value: result.roiPercent.toFixed(2),
            unit: "%"
          },
          {
            label: t("finance.annualizedRoi"),
            value: result.annualizedRoi?.toFixed(2) ?? "N/A",
            unit: result.annualizedRoi ? "%" : undefined
          },
        ],
      },
    ];
  }, [values, result, t]);

  // Prepare CSV data
  const csvData = useMemo(() => {
    if (!result) return [];
    return [
      {
        Field: t("finance.initialInvestment"),
        Value: values.initialInvestment,
        Unit: "CHF",
      },
      {
        Field: t("finance.finalValue"),
        Value: values.finalValue,
        Unit: "CHF",
      },
      {
        Field: t("finance.investmentPeriodYears"),
        Value: values.years,
        Unit: "years",
      },
      {
        Field: t("finance.profit"),
        Value: result.profit.toFixed(2),
        Unit: "CHF",
      },
      {
        Field: t("finance.totalRoi"),
        Value: result.roiPercent.toFixed(2),
        Unit: "%",
      },
      {
        Field: t("finance.annualizedRoi"),
        Value: result.annualizedRoi?.toFixed(2) ?? "N/A",
        Unit: result.annualizedRoi ? "%" : "",
      },
    ];
  }, [values, result, t]);

  return (
    <div className="space-y-6">
      {/* Input card... */}

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("sections.results")}</CardTitle>
            <ExportButtons
              pdfSections={pdfSections}
              pdfTitle={tCalc("name")}
              pdfSubtitle={`${t("finance.initialInvestment")}: ${values.initialInvestment} CHF`}
              csvData={csvData}
            />
          </CardHeader>
          <CardContent>
            {/* Results display... */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### Pattern 4: File Naming with Timestamps

**What:** Generate descriptive, timestamped filenames that are filesystem-safe

**When to use:** All export operations

**Example:**

```typescript
// Source: ISO 8601 best practices adapted for filenames
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString

function generateExportFilename(
  calculatorName: string,
  extension: 'pdf' | 'csv'
): string {
  // Get ISO timestamp and make filesystem-safe
  // ISO 8601: 2026-01-25T14:30:45.123Z
  // Filename: 2026-01-25_14-30-45
  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)              // Remove milliseconds and Z
    .replace('T', '_')         // Separate date and time
    .replace(/:/g, '-');       // Replace colons (illegal in Windows)

  // Sanitize calculator name for filename
  const safeName = calculatorName
    .toLowerCase()
    .replace(/\s+/g, '-')      // Spaces to hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special chars

  return `${safeName}_${timestamp}.${extension}`;
}

// Examples:
// "ROI Calculator" → "roi-calculator_2026-01-25_14-30-45.pdf"
// "Body Mass Index" → "body-mass-index_2026-01-25_14-30-45.csv"
// "Age Calculator" → "age-calculator_2026-01-25_14-30-45.pdf"
```

### Anti-Patterns to Avoid

- **Hardcoded button text**: PdfExportButton currently has "Export PDF" hardcoded (needs i18n)
- **Automatic export for all calculators**: Don't add export to all 168 calculators automatically (opt-in per calculator)
- **Server-side export**: Violates static export constraint
- **Missing UTF-8 BOM for CSV**: Excel won't open properly without BOM character
- **Unescaped CSV values**: Commas and quotes must be escaped or wrapped
- **Non-descriptive filenames**: "export.pdf" vs "roi-calculator_2026-01-25_14-30-45.pdf"
- **Missing timestamps**: Multiple exports overwrite each other

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV escaping | Manual quote/comma handling | Native implementation with proper escaping | Handles edge cases (quotes in quotes, newlines, special chars) |
| PDF pagination | Manual line counting and page breaks | jsPDF's built-in `doc.internal.pageSize.getHeight()` | Already implemented in pdf-export.ts, handles font metrics |
| Timestamp formatting | Custom date parsing | `Date.toISOString()` | Standard, timezone-safe, sortable |
| File downloads | Custom save dialog | Blob + URL.createObjectURL() | Browser-native, works across all platforms |
| CSV libraries | Building CSV parser/generator | Blob API (zero deps) or export-to-csv (3KB) | CSV is simple enough for Blob API, use library only if needed |

**Key insight:** Export functionality is surprisingly simple with modern browser APIs. jsPDF handles PDF complexity, Blob API handles CSV. Don't overthink it.

## Common Pitfalls

### Pitfall 1: Missing UTF-8 BOM in CSV Export

**What goes wrong:** Excel on Windows opens CSV files with garbled characters (especially non-ASCII)

**Why it happens:** Excel expects UTF-8 files to start with BOM (Byte Order Mark: `\uFEFF`)

**How to avoid:** Always prepend BOM to CSV content before creating Blob

```typescript
const BOM = '\uFEFF';
const blob = new Blob([BOM + csvContent], {
  type: 'text/csv;charset=utf-8;'
});
```

**Warning signs:** Users report "weird characters" in exported CSV files, especially with currency symbols (€, £, CHF) or accented characters (é, ä, ü)

### Pitfall 2: CSV Injection Vulnerabilities

**What goes wrong:** Malicious formulas in CSV cells can execute in Excel (=1+1, @SUM, +cmd|)

**Why it happens:** Excel automatically evaluates cells starting with `=`, `+`, `-`, `@`

**How to avoid:** Prefix dangerous characters with single quote or validate/sanitize

```typescript
function sanitizeCSVValue(value: string): string {
  const dangerous = ['=', '+', '-', '@'];
  const firstChar = value.charAt(0);

  if (dangerous.includes(firstChar)) {
    return `'${value}`; // Prefix with single quote
  }

  return value;
}
```

**Warning signs:** Security audit flags CSV export, users report "formula errors" in Excel

### Pitfall 3: Filename Special Characters

**What goes wrong:** Exported filenames contain characters illegal in filesystems (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)

**Why it happens:** ISO 8601 timestamps contain `:` (illegal on Windows), user input may have special chars

**How to avoid:** Replace illegal characters with safe alternatives

```typescript
// WRONG: roi-calculator_2026-01-25T14:30:45.pdf (contains :)
// RIGHT: roi-calculator_2026-01-25_14-30-45.pdf
const timestamp = new Date()
  .toISOString()
  .slice(0, 19)
  .replace('T', '_')
  .replace(/:/g, '-');
```

**Warning signs:** Downloads fail on Windows but work on Mac/Linux, browser shows "invalid filename" error

### Pitfall 4: Memory Leaks with Object URLs

**What goes wrong:** Creating many exports without cleanup causes memory leaks

**Why it happens:** `URL.createObjectURL()` creates blob URL that persists until revoked

**How to avoid:** Always call `URL.revokeObjectURL()` after download triggered

```typescript
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.click();

// CRITICAL: Cleanup
document.body.removeChild(link);
URL.revokeObjectURL(url);  // Prevents memory leak
```

**Warning signs:** Browser memory usage grows with each export, dev tools show "detached blob URLs"

### Pitfall 5: PdfExportButton Hardcoded Text

**What goes wrong:** "Export PDF" button text not translated (breaks i18n)

**Why it happens:** Original implementation didn't use `useTranslations()` hook

**How to avoid:** Update component to use translation keys

```typescript
// WRONG (current):
<Button>Export PDF</Button>

// RIGHT:
const t = useTranslations("calculator.export");
<Button>{t("exportPdf")}</Button>
```

**Warning signs:** English text appears on French/German/Italian pages, i18n check scripts fail

### Pitfall 6: Export Data Mismatch with Display

**What goes wrong:** Exported values don't match what's shown on screen (formatting differences)

**Why it happens:** Display uses formatted values (`$1,234.56`), export uses raw numbers (`1234.56`)

**How to avoid:** Be consistent with formatting or document the difference

```typescript
// PDF/CSV should match displayed values
const displayValue = format.number(result.value, {
  style: "currency",
  currency: "CHF"
});

// Export should use same formatting
pdfItems: [{ label: "Total", value: displayValue }]
csvData: [{ Field: "Total", Value: displayValue }]
```

**Warning signs:** Users report "exported numbers don't match screen", confusion about decimal places

## Code Examples

Verified patterns from official sources and current codebase:

### CSV Export Complete Implementation

```typescript
// Source: Native Blob API + https://www.geeksforgeeks.org/javascript/how-to-create-and-download-csv-file-in-javascript/
// File: src/lib/utils/csv-export.ts

export interface CsvExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  delimiter?: string;
}

export interface CsvRow {
  [key: string]: string | number | boolean | null;
}

export function exportToCsv(
  data: CsvRow[],
  options: CsvExportOptions = {}
): void {
  if (data.length === 0) {
    console.warn('exportToCsv: No data to export');
    return;
  }

  const {
    filename = 'export.csv',
    includeHeaders = true,
    delimiter = ',',
  } = options;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Add headers
  if (includeHeaders) {
    csvRows.push(headers.map(h => escapeCSV(h, delimiter)).join(delimiter));
  }

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCSV(value, delimiter);
    });
    csvRows.push(values.join(delimiter));
  }

  const csvContent = csvRows.join('\n');

  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  downloadBlob(blob, filename);
}

function escapeCSV(
  value: string | number | boolean | null,
  delimiter: string = ','
): string {
  if (value === null || value === undefined) return '';

  let stringValue = String(value);

  // Sanitize potential CSV injection
  const dangerous = ['=', '+', '-', '@'];
  if (dangerous.includes(stringValue.charAt(0))) {
    stringValue = `'${stringValue}`;
  }

  // Escape if contains delimiter, quotes, or newlines
  if (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
```

### Updated PdfExportButton with i18n

```typescript
// File: src/components/converter/pdf-export-button.tsx
"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { exportToPdf, type PdfExportOptions, type PdfSection } from "@/lib/utils/pdf-export";

interface PdfExportButtonProps {
  sections: PdfSection[];
  options: PdfExportOptions;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
}

export function PdfExportButton({
  sections,
  options,
  variant = "outline",
  size = "sm",
  className,
  disabled = false,
}: PdfExportButtonProps) {
  const t = useTranslations("calculator.export");

  const handleExport = () => {
    // Add timestamp to filename
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', '_')
      .replace(/:/g, '-');

    const baseFilename = options.filename ||
      options.title.toLowerCase().replace(/\s+/g, '-');

    const filename = `${baseFilename}_${timestamp}.pdf`;

    exportToPdf(sections, { ...options, filename });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || sections.length === 0}
      className={className}
      title={t("pdfTooltip")}
    >
      <FileText className="h-4 w-4 mr-2" />
      {t("exportPdf")}
    </Button>
  );
}
```

### Translation Keys (en.json)

```json
{
  "calculator": {
    "export": {
      "exportPdf": "Export PDF",
      "exportCsv": "Export CSV",
      "pdfTooltip": "Download results as PDF document",
      "csvTooltip": "Download results as CSV spreadsheet",
      "noData": "No data to export"
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side PDF generation | Client-side jsPDF | 2020s | Enables static export, zero server cost |
| CSV string concatenation | Blob API with BOM | Native API available | Better Excel compatibility, proper encoding |
| Generic filenames | Timestamped descriptive names | Best practice 2024+ | Prevents overwrites, better organization |
| Hardcoded button text | i18n translations | Next.js i18n standard | Multi-language support |
| Manual CSV escaping | Proper quote/comma handling | Security best practice | Prevents injection, proper parsing |

**Deprecated/outdated:**

- Server-side export (incompatible with static export)
- CSV libraries for simple exports (Blob API sufficient)
- Non-BOM CSV files (breaks Excel on Windows)
- Unsafe filename characters (breaks Windows downloads)

## Current Usage Analysis

### Calculators Using Export

1. **Age Calculator** (`src/app/[locale]/datetime/age/age-calculator.tsx`)
   - Exports: Age breakdown, zodiac signs, next birthday
   - Format: PDF only
   - Status: Working correctly
   - Uses: PdfExportButton component with useMemo for sections

### Export Infrastructure Files

| File | Status | Purpose |
|------|--------|---------|
| `src/lib/utils/pdf-export.ts` | ✅ EXISTS | PDF generation with jsPDF v4.0.0 |
| `src/components/converter/pdf-export-button.tsx` | ⚠️ EXISTS (needs i18n) | PDF export button component |
| `src/lib/utils/csv-export.ts` | ❌ MISSING | CSV generation utility |
| `src/components/converter/csv-export-button.tsx` | ❌ MISSING | CSV export button component |
| `src/components/converter/export-buttons.tsx` | ❌ MISSING | Unified export component |

### Translation Coverage

| Locale | Export Keys Exist | Status |
|--------|-------------------|--------|
| en.json | ❌ | Need to add `calculator.export.*` |
| fr.json | ❌ | Need to add `calculator.export.*` |
| de.json | ❌ | Need to add `calculator.export.*` |
| it.json | ❌ | Need to add `calculator.export.*` |

Required keys:
- `calculator.export.exportPdf`
- `calculator.export.exportCsv`
- `calculator.export.pdfTooltip`
- `calculator.export.csvTooltip`
- `calculator.export.noData`

### Calculator Categories Export Potential

| Category | Calculators | Export Complexity | Priority |
|----------|-------------|-------------------|----------|
| Finance | 24 | Medium (tables, charts) | HIGH |
| Math | 38 | Low (simple results) | MEDIUM |
| Health | 28 | Low (simple results) | MEDIUM |
| Photo | 22 | Medium (tables like DoF) | HIGH |
| Video | 9 | Low (simple results) | LOW |
| DateTime | 8 | Low (simple results) | LOW |
| Network | 5 | Medium (IP tables) | MEDIUM |
| Data | 3 | Low (simple results) | LOW |
| Crypto | TBD (Phase 17) | Medium (prices, charts) | HIGH |

**Recommendation:** Start with Finance, Photo, and Math categories for Phase 24.

## Open Questions

### 1. Should export be added to all 168 calculators automatically?

- **What we know:** Infrastructure can support it, Age Calculator proves pattern
- **What's unclear:** User demand for export varies by calculator type
- **Recommendation:** **NO** - Make export opt-in per calculator
  - Start with ~20-30 high-value calculators
  - Finance calculators (loans, investments) = HIGH priority
  - Photo calculators (DoF tables) = HIGH priority
  - Simple converters (unit conversion) = LOW priority
  - Gather analytics after Phase 24 to expand

### 2. Should CSV use Blob API or export-to-csv library?

- **What we know:** Blob API is zero dependencies, export-to-csv adds 3KB
- **What's unclear:** Whether cleaner API justifies 3KB bundle increase
- **Recommendation:** **Start with Blob API** (zero deps)
  - If implementation becomes complex, reconsider library
  - 3KB is negligible but prefer zero deps when possible
  - Blob API is more transparent and educational

### 3. Should charts/tables be exportable to PDF?

- **What we know:** Recharts charts in finance calculators, HTML tables in photo
- **What's unclear:** Best approach (html2canvas vs native jsPDF rendering)
- **Recommendation:** **Phase 24 scope = simple results only**
  - Defer chart/table export to Phase 25 or later
  - Requires html2canvas library (significant complexity)
  - Focus Phase 24 on text-based results (inputs + outputs)

### 4. What translation approach for export buttons?

- **What we know:** Need translations in en/fr/de/it
- **What's unclear:** Namespace structure (`calculator.export.*` vs `common.export.*`)
- **Recommendation:** Use `calculator.export.*`
  - Follows existing pattern (`calculator.labels.*`, `calculator.results.*`)
  - Export is calculator-specific feature
  - Consistent with codebase conventions

### 5. Should existing PdfExportButton be deprecated?

- **What we know:** Component exists but lacks i18n
- **What's unclear:** Migrate Age Calculator or support both components
- **Recommendation:** **Update PdfExportButton in place**
  - Add i18n support to existing component
  - Update Age Calculator to use new props
  - Create CsvExportButton as sibling
  - Create ExportButtons as convenience wrapper
  - No breaking changes to existing usage

## Testing Strategy

Since no automated testing framework exists in the project:

### Manual Testing Checklist

**PDF Export:**
- [ ] Age Calculator still exports correctly after i18n update
- [ ] PDF opens in Chrome, Firefox, Safari
- [ ] PDF opens in Adobe Reader
- [ ] Filenames include timestamp (format: `name_YYYY-MM-DD_HH-MM-SS.pdf`)
- [ ] Multi-page PDFs paginate correctly
- [ ] Footer shows page numbers and timestamp
- [ ] Non-ASCII characters render correctly (€, £, CHF, é, ä, ü)

**CSV Export:**
- [ ] CSV downloads successfully
- [ ] CSV opens correctly in Excel (Windows + Mac)
- [ ] CSV opens correctly in Google Sheets
- [ ] CSV opens correctly in LibreOffice Calc
- [ ] UTF-8 BOM present (check with hex editor)
- [ ] Non-ASCII characters display correctly
- [ ] Filenames include timestamp (format: `name_YYYY-MM-DD_HH-MM-SS.csv`)
- [ ] Commas in values are properly escaped (quoted)
- [ ] Quotes in values are properly escaped (doubled)
- [ ] Newlines in values don't break rows
- [ ] Formulas are escaped (no injection)

**i18n:**
- [ ] Export buttons show correct text in English
- [ ] Export buttons show correct text in French
- [ ] Export buttons show correct text in German
- [ ] Export buttons show correct text in Italian
- [ ] Tooltips translated correctly in all locales

**Integration:**
- [ ] Export buttons disabled when no results
- [ ] Export buttons enabled when results available
- [ ] Exported data matches displayed values
- [ ] Timestamps unique across exports
- [ ] Browser memory doesn't leak after multiple exports

### Browser Compatibility

Test on:
- Chrome/Edge (latest) - Windows + Mac
- Firefox (latest) - Windows + Mac
- Safari (latest) - Mac + iOS
- Mobile browsers - iOS Safari, Chrome Android

### Performance Testing

- [ ] Bundle size impact of CSV export (should be ~0KB with Blob API)
- [ ] PDF generation speed with large result sets
- [ ] CSV generation speed with 100+ rows
- [ ] Memory usage during export (check for leaks)

## Sources

### Primary (HIGH confidence)

- **jsPDF npm**: https://www.npmjs.com/package/jspdf
  - Verified v4.0.0 is latest (Jan 2025)
  - Bundle size: 335KB minified
  - Built-in TypeScript types

- **jsPDF Official Docs**: https://raw.githack.com/MrRio/jsPDF/master/docs/index.html
  - API reference verified
  - Code examples tested

- **MDN Blob API**: https://developer.mozilla.org/en-US/docs/Web/API/Blob
  - Native browser API documentation
  - CSV export pattern verified

- **MDN Date.toISOString()**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  - Timestamp formatting reference
  - Filename safety considerations

- **Current Codebase** (verified via Read tool):
  - `package.json`: jsPDF v4.0.0 confirmed
  - `src/lib/utils/pdf-export.ts`: Working PDF utility
  - `src/components/converter/pdf-export-button.tsx`: Existing component
  - `src/app/[locale]/datetime/age/age-calculator.tsx`: Reference implementation

### Secondary (MEDIUM confidence)

- **GeeksforGeeks CSV Export**: https://www.geeksforgeeks.org/javascript/how-to-create-and-download-csv-file-in-javascript/
  - Blob API CSV pattern
  - Verified with MDN docs

- **export-to-csv npm**: https://www.npmjs.com/package/export-to-csv
  - Alternative library option
  - Bundle size: 3KB
  - TypeScript-first

- **Papa Parse**: https://www.papaparse.com/
  - Alternative (too heavy for simple export)
  - Bundle size: 43KB

- **Nutrient PDF Libraries Guide**: https://www.nutrient.io/blog/javascript-pdf-libraries/
  - jsPDF comparison with alternatives
  - Bundle size comparisons

- **ISO 8601 Standard**: https://en.wikipedia.org/wiki/ISO_8601
  - Timestamp format reference
  - Filename adaptation best practices

### Tertiary (LOW confidence)

- **WebSearch results** for CSV export patterns
  - Multiple sources confirm Blob API approach
  - BOM requirement for Excel compatibility

- **WebSearch results** for filename best practices
  - Timestamp formatting patterns
  - Special character handling

## Metadata

**Confidence breakdown:**

- **Standard stack: HIGH** - jsPDF verified, Blob API is native browser API
- **Architecture: HIGH** - Existing PDF pattern proven, CSV pattern standard
- **CSV implementation: HIGH** - Blob API well-documented, pattern verified
- **i18n approach: HIGH** - Follows existing calculator.* namespace pattern
- **File naming: HIGH** - ISO 8601 adaptation verified, tested pattern
- **Pitfalls: MEDIUM** - Common issues documented, UTF-8 BOM critical

**Research date:** 2026-01-25
**Valid until:** 2026-04-25 (90 days - stable browser APIs, jsPDF stable)

**Key findings for planning:**

1. PDF infrastructure exists, needs i18n update
2. CSV export simple with Blob API (zero deps)
3. Export should be opt-in per calculator (not all 168)
4. Translation keys needed across all 4 locales
5. Filename pattern established (timestamp + sanitization)
6. UTF-8 BOM critical for Excel compatibility
7. Phase scope should exclude chart/table export (defer to later)
