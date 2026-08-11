---
phase: 38-cpu-comparison-calculator
verified: 2026-02-23T09:30:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Staleness warning banner visibility"
    expected: "Banner with AlertCircle and SPEC.org link appears since data is 449 days old (well past 90-day staleDays threshold)"
    why_human: "Visual rendering of amber warning card requires browser; automated check confirmed isStale=true logic is wired correctly"
  - test: "Vendor/generation filter interaction"
    expected: "Selecting 'AMD' vendor shows only AMD CPUs; selecting 'Current' generation further narrows list; changing either filter clears selected CPU checkboxes"
    why_human: "State reset behavior on filter change requires user interaction to confirm"
  - test: "Multi-select checkbox behaviour (max 4)"
    expected: "Unchecked checkboxes become disabled once 4 CPUs are selected; unchecking one re-enables the rest"
    why_human: "Dynamic disabled state requires browser interaction"
  - test: "URL state sync"
    expected: "Selecting CPUs and filters updates URL; copying and loading the URL restores the same comparison"
    why_human: "URL sync via history.replaceState requires live browser session"
---

# Phase 38: CPU Comparison Calculator Verification Report

**Phase Goal:** Users can select 2 to 4 CPUs from the curated database, see side-by-side SPECint2017 scores, performance-per-core, performance-per-watt, and the sizing ratio between any two — with the ability to filter by vendor and generation.
**Verified:** 2026-02-23T09:30:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Given 2–4 CPU IDs the function returns one result row per CPU with all required metrics | VERIFIED | `calculateCpuComparison` in cpu-comparison.ts builds CpuComparisonRow with specint2017Base, specint2017Peak, perfPerCore, perfPerWatt, sizingRatioVsFirst for each CPU |
| 2 | perfPerCore equals specint2017Peak / cores (rounded 2 dp) | VERIFIED | Line 106: `Math.round((cpu.specint2017Peak / cpu.cores) * 100) / 100`; verified: Intel 8592+ = 6.72 |
| 3 | perfPerWatt equals specint2017Peak / tdpW (rounded 2 dp) | VERIFIED | Line 107: `Math.round((cpu.specint2017Peak / cpu.tdpW) * 100) / 100`; verified: Intel 8592+ = 1.23 |
| 4 | sizingRatioVsFirst is 1.0 for CPU[0] and cpu[0].peak/cpuN.peak for subsequent | VERIFIED | Lines 108-111; verified: AMD EPYC 9654 vs Intel 8592+ = 0.72 (430/600) |
| 5 | Filtering by vendor and/or generation returns only matching CPUs | VERIFIED | `getFilteredCpus` filters on vendor and generation, returns sorted by specint2017Peak desc; verified: amd+current = 5 CPUs |
| 6 | Function returns null when fewer than 2 valid CPU IDs provided | VERIFIED | Line 97-99: `if (cpus.length < 2) return null` |
| 7 | User sees vendor (All/Intel/AMD/ARM) and generation (All/Current/Previous) dropdowns | VERIFIED | Filter panel in component lines 76-110; both dropdowns wire to `handleVendorChange` and `handleGenerationChange` which reset cpuIds |
| 8 | User can select 2 to 4 CPUs via checkboxes; fewer than 2 shows empty state | VERIFIED | Checkbox list with isDisabled when selectedIds.length >= 4 (line 127); empty state rendered when result===null && selectedIds.length < 2 (line 150) |
| 9 | Results table renders SPECint2017 Base/Peak, Perf/Core, Perf/Watt, Sizing Ratio | VERIFIED | 11 metric rows in tbody (lines 206-295): vendor, family, generation, cores, tdpW, socketType, specint2017Base, specint2017Peak, perfPerCore, perfPerWatt, sizingRatio |
| 10 | Zero MISSING_MESSAGE errors; build passes for all 4 locales | VERIFIED | ALL KEYS PRESENT confirmed (27 top-level keys); build output exists at out/en, out/fr, out/de, out/it for /infrastructure/cpu-comparison-calculator |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/converters/infrastructure/cpu-comparison.ts` | CpuComparisonInput, CpuComparisonRow, CpuComparisonResult interfaces + calculateCpuComparison + getFilteredCpus functions | VERIFIED | 147 lines, all 5 exports present, no stubs |
| `src/lib/converters/infrastructure/index.ts` | Re-exports cpu-comparison alongside existing exports | VERIFIED | Line 5: `export * from "./cpu-comparison"` |
| `src/app/[locale]/infrastructure/cpu-comparison-calculator/cpu-comparison-calculator.tsx` | CpuComparisonCalculator client component, min 150 lines | VERIFIED | 307 lines, named export present, full implementation |
| `src/app/[locale]/infrastructure/cpu-comparison-calculator/page.tsx` | generateStaticParams, generateMetadata, default page export, ConverterLayout | VERIFIED | All 3 exports present, ConverterLayout wired with category from getCategoryBySlug |
| `src/messages/en.json` | cpu-comparison-calculator keys | VERIFIED | 27 keys including nested vendors and generations objects |
| `src/messages/fr.json` | cpu-comparison-calculator keys in French | VERIFIED | Key parity with EN confirmed |
| `src/messages/de.json` | cpu-comparison-calculator keys in German | VERIFIED | Key parity with EN confirmed |
| `src/messages/it.json` | cpu-comparison-calculator keys in Italian | VERIFIED | Key parity with EN confirmed |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `cpu-comparison.ts` | `src/lib/data/cpu-database.json` | static import | WIRED | Line 7: `import cpuDatabaseRaw from "@/lib/data/cpu-database.json"` |
| `cpu-comparison.ts` | `./cpu-types` | type imports | WIRED | Line 8: `import type { CpuDatabase, CpuEntry, CpuGeneration, CpuVendor }` |
| `cpu-comparison-calculator.tsx` | `calculateCpuComparison, getFilteredCpus` | named import from `@/lib/converters/infrastructure` | WIRED | Lines 19-21; both functions used in component body (line 31, 39) |
| `cpu-comparison-calculator.tsx` | `createCalculatorStore` | store created outside component with typed generics | WIRED | Lines 24-32: `createCalculatorStore<CpuComparisonInput, CpuComparisonResult>` |
| `page.tsx` | `CpuComparisonCalculator` | dynamic import | WIRED | Lines 10-13: `dynamic(() => import("./cpu-comparison-calculator").then(mod => mod.CpuComparisonCalculator))` |
| `page.tsx` | `ConverterLayout` | wraps component | WIRED | Lines 60-70: CpuComparisonCalculator wrapped in ConverterLayout with title, description, category |
| `cpu-comparison-calculator.tsx` | `src/messages/*.json` | `useTranslations("converters.cpu-comparison-calculator")` | WIRED | All 20+ t() calls match keys present in all 4 locale files |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CPUCMP-01 | 38-01, 38-02 | User can select 2–4 CPUs from curated database for side-by-side comparison | SATISFIED | Checkbox list from getFilteredCpus; calculateCpuComparison returns null <2 CPUs, clamped to 4 |
| CPUCMP-02 | 38-01, 38-02 | User can see raw SPECint2017 base and peak scores for each selected CPU | SATISFIED | Table rows t("specint2017Base") and t("specint2017Peak") rendering row.specint2017Base and row.specint2017Peak |
| CPUCMP-03 | 38-01, 38-02 | User can see performance-per-core metric (SPECint / core count) | SATISFIED | t("perfPerCore") row renders row.perfPerCore; formula Math.round((peak/cores)*100)/100 |
| CPUCMP-04 | 38-01, 38-02 | User can see TDP and performance-per-watt (SPECint / TDP) | SATISFIED | t("tdpW") and t("perfPerWatt") rows; formula Math.round((peak/tdpW)*100)/100 |
| CPUCMP-05 | 38-02, 38-03 | User can see relative sizing ratio between any two CPUs | SATISFIED | t("sizingRatio") row shows "1.0x (baseline)" for first CPU and "{ratio}x" for others |
| CPUCMP-06 | 38-01, 38-02, 38-03 | User can filter CPU list by vendor (Intel, AMD, ARM) and generation | SATISFIED | Vendor and generation dropdowns wired to handleVendorChange/handleGenerationChange; filter resets cpuIds; getFilteredCpus applies filters |

Note: CPUCMP-07 and CPUCMP-08 are listed as Future Requirements in REQUIREMENTS.md — not in scope for Phase 38.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No anti-patterns found. No TODO/FIXME/PLACEHOLDER comments. No stub return patterns (the single `return null` at line 98 of cpu-comparison.ts is correct intended behavior for fewer than 2 valid CPU IDs).

### Human Verification Required

#### 1. Staleness Warning Banner

**Test:** Load the calculator at `/en/infrastructure/cpu-comparison-calculator`, select any 2 CPUs
**Expected:** Amber warning card with AlertCircle icon, stale warning text, and "View latest results on SPEC.org" link should appear above the results table (data is 449 days old, threshold is 90)
**Why human:** Visual rendering of the conditional amber card requires a browser

#### 2. Vendor/Generation Filter Interaction

**Test:** Set Vendor = "AMD", observe the CPU list. Then set Generation = "Current", observe further narrowing. Then change Vendor back to "All".
**Expected:** List updates immediately on each change; previously selected checkboxes are cleared when filters change
**Why human:** Dynamic state update and checkbox reset behavior requires user interaction

#### 3. Multi-select Checkbox Max Cap

**Test:** Select 4 CPUs one by one
**Expected:** After selecting the 4th CPU, all remaining unchecked checkboxes become visually disabled; unchecking one CPU re-enables the disabled ones
**Why human:** Disabled state rendering requires browser interaction

#### 4. URL State Sync

**Test:** Select vendor = AMD, generation = current, check 2 AMD CPUs. Copy the browser URL. Open a new tab and paste the URL.
**Expected:** The new tab loads with the same vendor filter, generation filter, and the same 2 CPUs checked, and the results table is visible
**Why human:** URL sync via history.replaceState requires live browser session

### Gaps Summary

No gaps found. All automated checks pass.

- Pure calculation module (cpu-comparison.ts) is complete with correct math verified against known values
- UI component (307 lines) implements all required UI features: filter panel, checkbox selector, empty state, staleness warning, and results table with 11 metric rows
- Page file wires the component into ConverterLayout with dynamic import, generateStaticParams, and generateMetadata
- Registry entry exists in infrastructure-converters.ts with correct id, slug, category, and subcategory
- Translation keys match between component t() calls and all 4 locale files (27 keys, verified parity)
- Build output confirmed for all 4 locales at out/[locale]/infrastructure/cpu-comparison-calculator/
- TypeScript passes with zero errors

---

_Verified: 2026-02-23T09:30:00Z_
_Verifier: Claude (gsd-verifier)_
