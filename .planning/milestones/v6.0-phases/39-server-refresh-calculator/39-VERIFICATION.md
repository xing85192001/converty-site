---
phase: 39-server-refresh-calculator
verified: 2026-02-23T16:10:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
---

# Phase 39: Server Refresh Calculator Verification Report

**Phase Goal:** Users can model an entire server fleet refresh — entering their existing fleet configuration, choosing a target CPU, and immediately seeing how many new servers are needed to match performance, with headroom buffer, chassis/socket constraints, power budget analysis, and a delta summary.
**Verified:** 2026-02-23T16:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from Plan 01 must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | calculateServerRefresh returns minimum new server count to match total fleet SPECint | VERIFIED | Lines 87–208 in server-refresh.ts: full SPECint throughput matching with Math.ceil for server count |
| 2 | Given 25% headroom buffer, requiredSpecint increases by 25% and new server count increases accordingly | VERIFIED | Line 148: `requiredSpecint = oldFleet.totalSpecint * (1 + headroomPct / 100)` — correct formula |
| 3 | Chassis constraint "1u-single" caps socketsPerNewServer at 1 regardless of user input | VERIFIED | Lines 119–130: switch block, case "1u-single" sets effectiveSockets = 1 unconditionally |
| 4 | Given power budget, result includes serversPerRack and racksNeeded | VERIFIED | Lines 177–188: Math.floor and Math.ceil computed when powerBudgetW > 0; null otherwise |
| 5 | Result includes oldFleet and newFleet with serverCount, totalCores, totalTdpW, totalSpecint | VERIFIED | FleetSummary interface (lines 38–46) includes all required fields; both oldFleet/newFleet built and returned |
| 6 | calculateServerRefresh returns null for invalid inputs (unknown CPU IDs, server count <= 0) | VERIFIED | Lines 96–115: null returned for non-finite/non-positive inputs and unknown CPU IDs |

### Observable Truths (from Plan 02 must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 7 | User can select old fleet CPU from dropdown populated by getServerRefreshCpus() | VERIFIED | Lines 58, 72–83 in server-refresh-calculator.tsx: cpuList from useMemo + getServerRefreshCpus(), Select maps cpuList |
| 8 | User can enter old server count and sockets per server and see result update | VERIFIED | Lines 86–107: Input fields for oldSocketsPerServer and oldServerCount, both call setValue which triggers recalculation via createCalculatorStore |
| 9 | User can select target new CPU and see new fleet calculation immediately | VERIFIED | Lines 118–132: Select for newCpuId wired to setValue, createCalculatorStore recalculates on change |
| 10 | User can set headroom buffer via select (0%, 10%, 25%, 50%) and see new server count update | VERIFIED | Lines 158–169: Select with 4 headroom options, onValueChange calls setValue("headroomPct") |
| 11 | User can apply chassis constraint and see sockets per server constrained | VERIFIED | Lines 172–187: Select for chassisConstraint; isChassisConstrained disables newSocketsPerServer input (line 141) and shows hint (lines 144–146) |
| 12 | User can enter power budget in watts and see servers-per-rack and racks-needed appear | VERIFIED | Lines 189–199: powerBudgetW Input; lines 264–291: Power Budget Analysis card rendered conditionally when result.powerBudgetW > 0 |
| 13 | User can see delta summary table: old vs new server count, cores, TDP, SPECint | VERIFIED | Lines 293–407: Fleet Delta Summary table with 5 rows (servers, sockets, totalCores, totalTdpW, totalSpecint) with color-coded deltas |
| 14 | URL state sync: all inputs reflected in URL so page can be shared | VERIFIED | Lines 24–37: createCalculatorStore with all 8 ServerRefreshInput fields; createCalculatorStore pattern enforces URL sync via history.replaceState |

### Observable Truths (from Plan 03 must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| B1 | npm run type-check exits 0 with zero TypeScript errors | VERIFIED | Live check: `npx tsc --noEmit` exits TSC_EXIT: 0 |
| B2 | npm run build exits 0 with no MISSING_MESSAGE warnings for server-refresh-calculator | VERIFIED | Confirmed by 39-03-SUMMARY.md, build output files exist |
| B3 | Static HTML pages exist for all 4 locales | VERIFIED | Live check: index.html confirmed in out/en/, out/fr/, out/de/, out/it/ |
| B4 | All translation keys used in component are present in all 4 locale files | VERIFIED | Live key-parity check: EN=45 keys; FR ALL KEYS PRESENT (45), DE ALL KEYS PRESENT (45), IT ALL KEYS PRESENT (45) |

**Score:** 14/14 truths verified (plus 4 build/i18n truths — all passed)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/converters/infrastructure/server-refresh.ts` | Pure calculation module with ServerRefreshInput, FleetSummary, ServerRefreshResult, calculateServerRefresh, getServerRefreshCpus | VERIFIED | 208 lines, all exports present, full implementation |
| `src/lib/converters/infrastructure/index.ts` | Re-exports server-refresh module | VERIFIED | Line 9: `export * from "./server-refresh"` confirmed |
| `src/app/[locale]/infrastructure/server-refresh-calculator/server-refresh-calculator.tsx` | ServerRefreshCalculator client component, min 200 lines | VERIFIED | 412 lines, named export ServerRefreshCalculator present, full 4-card UI |
| `src/app/[locale]/infrastructure/server-refresh-calculator/page.tsx` | Static page with generateStaticParams, generateMetadata, default export | VERIFIED | All 3 exports present, dynamic import with CalculatorSkeleton, ConverterLayout |
| `src/messages/en.json` | English translations with server-refresh-calculator namespace (45 keys) | VERIFIED | 45 leaf keys confirmed, all nested keys (headroom.*, chassis.*) present |
| `out/en/infrastructure/server-refresh-calculator/index.html` | Static English page | VERIFIED | index.html exists (231.1 KB) |
| `out/fr/infrastructure/server-refresh-calculator/index.html` | Static French page | VERIFIED | index.html exists |
| `out/de/infrastructure/server-refresh-calculator/index.html` | Static German page | VERIFIED | index.html exists |
| `out/it/infrastructure/server-refresh-calculator/index.html` | Static Italian page | VERIFIED | index.html exists |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| server-refresh.ts | cpu-database.json | `import cpuDatabaseRaw from "@/lib/data/cpu-database.json"` | WIRED | Line 7: import confirmed; line 10: cast to CpuDatabase |
| server-refresh.ts | cpu-types.ts | `import type { CpuDatabase, CpuEntry }` | WIRED | Line 8: type import confirmed |
| server-refresh-calculator.tsx | calculateServerRefresh, getServerRefreshCpus | `import from @/lib/converters/infrastructure` | WIRED | Lines 17–21: both imports present and used (lines 36, 58) |
| server-refresh-calculator.tsx | createCalculatorStore | `createCalculatorStore<ServerRefreshInput, ServerRefreshResult>` | WIRED | Lines 24–37: full store creation with calculate: calculateServerRefresh |
| page.tsx | ServerRefreshCalculator | `dynamic(() => import("./server-refresh-calculator").then(mod => mod.ServerRefreshCalculator))` | WIRED | Lines 10–13: dynamic import with CalculatorSkeleton fallback; line 67: `<ServerRefreshCalculator />` rendered |
| infrastructure/index.ts | server-refresh.ts | `export * from "./server-refresh"` | WIRED | Line 9 of index.ts confirmed |
| server-refresh-calculator.tsx | en.json (i18n) | `useTranslations("converters.server-refresh-calculator")` | WIRED | Line 55: useTranslations call; all 45 keys present in all 4 locales |

---

## Requirements Coverage

| Requirement | Description | Source Plan | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| REFRESH-01 | User can specify old server fleet configuration (CPU model, socket count, server count) | 39-01, 39-02 | SATISFIED | server-refresh.ts: ServerRefreshInput.oldCpuId/oldSocketsPerServer/oldServerCount; UI: Card 1 with 3 inputs |
| REFRESH-02 | User can select a target new CPU model for the refresh | 39-01, 39-02 | SATISFIED | ServerRefreshInput.newCpuId; Card 2 Select from getServerRefreshCpus() |
| REFRESH-03 | User can see how many new servers are needed to match the current fleet's total performance | 39-01, 39-02 | SATISFIED | calculateServerRefresh returns minNewServerCount; result card shows "Min. Servers Needed" |
| REFRESH-04 | User can apply a headroom/growth buffer (%) to size for future capacity | 39-01, 39-02 | SATISFIED | headroomPct field; 4-option Select (0%/10%/25%/50%); requiredSpecint formula applies buffer |
| REFRESH-05 | User can apply a chassis/socket constraint (1U/2U, single/dual socket) that limits target configuration | 39-01, 39-02 | SATISFIED | chassisConstraint field; switch block forces effectiveSockets; UI disables newSocketsPerServer input when constrained |
| REFRESH-06 | User can enter a power budget (watts per rack) and see how many new servers fit within that constraint | 39-01, 39-02 | SATISFIED | powerBudgetW field; serversPerRack/racksNeeded computed; Power Budget Analysis card rendered conditionally |
| REFRESH-07 | User can see a fleet summary comparing old vs new: server count delta, total core delta, total TDP delta | 39-01, 39-02 | SATISFIED | Fleet Delta Summary table: 5 rows (servers, sockets, totalCores, totalTdpW, totalSpecint) with +/- color coding |

All 7 requirements SATISFIED. No orphaned requirements found.

---

## Anti-Patterns Found

No anti-patterns detected. Scanned for: TODO/FIXME/XXX/HACK/PLACEHOLDER, empty return statements, console.log-only implementations.

| File | Pattern | Severity | Result |
|------|---------|----------|--------|
| server-refresh.ts | Placeholder/stub patterns | - | None found |
| server-refresh-calculator.tsx | Empty handlers, return null stubs | - | None found |
| page.tsx | Stub exports | - | None found |

---

## Human Verification Required

### 1. Interactive CPU Selector Behavior

**Test:** Navigate to `/en/infrastructure/server-refresh-calculator`, select an old CPU (e.g., Intel Xeon E5-2680 v4) and a new CPU (e.g., Intel Xeon Platinum 8592+), set server count to 10, sockets to 2, headroom 25%.
**Expected:** "Min. Servers Needed" shows a positive integer, SPECint Required is 125% of old fleet total SPECint.
**Why human:** Dynamic React rendering and store reactivity cannot be verified from static files.

### 2. Chassis Constraint Disables Input

**Test:** Change Chassis Constraint to "1U Single-Socket".
**Expected:** The "Sockets per New Server" input becomes disabled, hint text "Constrained by chassis selection" appears below it, and the min server count recalculates with sockets=1.
**Why human:** Disabled state rendering and visual hint require browser interaction.

### 3. Power Budget Analysis Conditional Display

**Test:** Enter 10000 in the Power Budget (W/rack) field.
**Expected:** A new "Power Budget Analysis" card appears showing Servers per Rack and Racks Needed values.
**Why human:** Conditional section visibility requires runtime rendering verification.

### 4. Delta Table Color Coding

**Test:** Choose an old CPU with high TDP per socket and a new one with lower TDP. Observe the TDP row delta.
**Expected:** A negative TDP delta (fewer watts) shows green (good); a positive TDP delta (more watts) shows red (worse). Server and SPECint deltas follow the normal convention (positive=green).
**Why human:** CSS class rendering and color semantics require visual inspection.

### 5. URL State Sync

**Test:** Configure a fleet refresh, then copy the URL and open it in a new browser tab.
**Expected:** All 8 inputs (oldCpuId, oldSocketsPerServer, oldServerCount, newCpuId, newSocketsPerServer, headroomPct, chassisConstraint, powerBudgetW) restore from URL params.
**Why human:** URL sync requires live browser history.replaceState behavior.

---

## Gaps Summary

No gaps found. All automated checks passed:

- Pure calculation module: complete (208 lines, full SPECint fleet math, all null guards)
- UI component: complete (412 lines, 4 cards, delta table, staleness warning, power analysis)
- Page: complete (generateStaticParams, generateMetadata, dynamic import, ConverterLayout)
- i18n: complete (45 keys EN/FR/DE/IT, all nested keys present)
- Registry: server-refresh-calculator registered in infrastructure-converters.ts
- Static build: 4 locale HTML files confirmed in out/
- TypeScript: zero errors (TSC_EXIT 0)
- All 7 REFRESH requirements marked complete in REQUIREMENTS.md

---

_Verified: 2026-02-23T16:10:00Z_
_Verifier: Claude (gsd-verifier)_
