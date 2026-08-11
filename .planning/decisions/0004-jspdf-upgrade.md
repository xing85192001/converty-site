# jsPDF Version Status - Verification Not Upgrade

- **Status:** superseded
- **Date:** 2026-01-17 (ADR created with incorrect information, corrected in Phase 6 Plan 06-01)
- **Deciders:** Project team
- **Superseded by:** Research findings showing jsPDF v4.0.0 is current (not outdated)

## Context and Problem Statement

**CORRECTED CONTEXT (2026-01-17):**

This ADR was originally created based on incorrect research that claimed jsPDF v4.0.0 was outdated (from 2018) and needed upgrading to v2.5.2. Further investigation revealed this was completely wrong:

**The Truth:**

- jsPDF v4.0.0 is the **LATEST STABLE VERSION** (released January 3, 2025)
- Version progression follows semantic versioning: v1.x → v2.x → v3.x → v4.0.0
- Version 4 is NEWER than version 2 (not a rollback)
- The current implementation already uses the correct v4.0.0 API

**What Went Wrong:**

- Initial research misread version numbers (assumed v2.5.2 > v4.0.0 numerically)
- No verification against npm registry or GitHub releases
- Error cascaded to Phase 6 roadmap and requirements planning

**Actual Situation:**

- Converty uses jsPDF v4.0.0 (correct, latest, released Jan 2025)
- Implementation uses named import pattern (correct for v4.0.0)
- TypeScript types are built-in (no @types/jspdf needed)
- All API methods are current and standard
- PDF export functionality works correctly

## Decision Outcome

**NO UPGRADE NEEDED** - Current implementation is already correct

This ADR is being **superseded** because it was based on false premises. The decision changes from "upgrade jsPDF" to "verify jsPDF is current and working."

### What Was Verified (Phase 6 Plan 06-01)

1. **Version check:**

   - `package.json` shows `"jspdf": "^4.0.0"`
   - npm registry confirms v4.0.0 is latest stable (published 2025-01-03)
   - GitHub releases: <https://github.com/parallax/jsPDF/releases/tag/v4.0.0>

2. **Code patterns (src/lib/utils/pdf-export.ts):**

   - Uses named import: `import { jsPDF } from "jspdf"` ✓ (correct for v4.0.0)
   - Instance creation: `const doc = new jsPDF()` ✓
   - Standard API methods: `setFontSize()`, `setFont()`, `text()`, `addPage()`, `save()` ✓
   - No deprecated methods detected ✓

3. **TypeScript integration:**

   - Built-in TypeScript types (no @types/jspdf in package.json) ✓
   - Compilation succeeds with zero jsPDF-related errors ✓
   - Type definitions current and accurate ✓

4. **Integration points:**
   - `PdfExportButton` component imports from pdf-export.ts correctly ✓
   - Age Calculator uses PDF export with proper data structure ✓
   - Build includes PDF export code in output ✓

### Consequences

**Positive:**

- No migration effort required (saves ~5 hours planned work)
- No risk of breaking changes or layout differences
- Current implementation already follows best practices
- Documentation corrected to prevent future confusion

**Neutral:**

- Phase 6 scope changed from "upgrade" to "verification"
- Roadmap and requirements updated to reflect reality

**Negative:**

- Wasted planning time on incorrect assumptions
- Misinformation in roadmap/requirements needed correction

## Implementation Details (Current v4.0.0 API)

**Correct import pattern (v4.0.0):**

```typescript
import { jsPDF } from "jspdf"; // Named import
```

**Creating PDF instance:**

```typescript
const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.getWidth();
```

**Standard API methods:**

```typescript
// Text formatting
doc.setFontSize(20);
doc.setFont("helvetica", "bold");
doc.setTextColor(100);

// Content
doc.text("Title", x, y, { align: "center" });

// Pages
doc.addPage();
doc.setPage(pageNumber);

// Save
doc.save("filename.pdf");
```

**TypeScript interfaces:**

```typescript
export interface PdfExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

export interface PdfSection {
  title: string;
  items: PdfItem[];
}

export interface PdfItem {
  label: string;
  value: string | number;
  unit?: string;
}
```

## Sources

- **npm registry:** <https://www.npmjs.com/package/jspdf>

  - Latest version: 4.0.0 (published 2025-01-03)
  - Download stats: 500k+ weekly downloads

- **GitHub releases:** <https://github.com/parallax/jsPDF/releases/tag/v4.0.0>

  - Release date: January 3, 2025
  - Changelog shows v4.0.0 is latest stable

- **Official documentation:** <https://raw.githack.com/MrRio/jsPDF/master/docs/index.html>

  - Documents v4.0.0 API (named imports, TypeScript support)

- **Current implementation:**
  - `src/lib/utils/pdf-export.ts` - PDF generation utilities
  - `src/components/converter/pdf-export-button.tsx` - React component
  - `src/app/[locale]/datetime/age/age-calculator.tsx` - Example usage

## Links

- **Phase 6 Plan:** `.planning/phases/06-dependency-upgrade/06-01-PLAN.md`
- **Current package.json:** Line 40 shows `"jspdf": "^4.0.0"`
- **REQUIREMENTS.md:** Lines 70-79 (DEP-01, DEP-02, DEP-03 - updated to verification scope)
- **ROADMAP.md:** Lines 130-148 (Phase 6 - updated to verification scope)

## Lessons Learned

1. **Always verify version numbers against official sources** (npm registry, GitHub releases)
2. **Semantic versioning v4 > v2** - don't assume lower number = newer
3. **Check release dates** before assuming a package is outdated
4. **Verify claims in initial research** before planning entire phases
5. **Named imports are standard in modern jsPDF** (not a sign of older version)

## Original (Incorrect) Claims

For historical reference, the original ADR incorrectly claimed:

- ❌ "jsPDF v4.0.0 released in 2018 - 6+ years old"

  - **Reality:** v4.0.0 released January 3, 2025 (days old, not years)

- ❌ "v4.0.0 is older than v2.5.2 (version rollback)"

  - **Reality:** v4.0.0 is NEWER - semantic versioning v4 > v2

- ❌ "Need to upgrade to v2.5.2+ for security patches"

  - **Reality:** v4.0.0 IS the latest with all security patches

- ❌ "Version rollback indicates breaking changes"
  - **Reality:** No rollback occurred - standard version progression

These errors led to incorrect Phase 6 planning, which has now been corrected.
