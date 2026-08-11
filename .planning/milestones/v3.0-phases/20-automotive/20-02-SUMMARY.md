---
phase: 20-automotive
plan: 02
subsystem: automotive
tags: [tire, sizing, speedometer, dimensions, lucide-react, zustand, next-intl]

# Dependency graph
requires:
  - phase: 18-realestate
    provides: "Pattern for category-specific calculator implementation"
  - phase: 17-crypto
    provides: "Category setup patterns (converters, registry, store, pages)"
provides:
  - "Tire sizing calculator with notation parsing (205/55R16 format)"
  - "Load index and speed rating reference data (ETRTO standards)"
  - "Tire comparison with speedometer error calculation"
  - "Automotive infrastructure (converters directory, registry)"
affects: [20-03-maintenance-intervals, 20-04-vehicle-financing, automotive-expansion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tire notation parsing with regex (supports 205/55R16, 205/55R16 91V, ZR formats)"
    - "JSON data files for load index and speed rating lookups"
    - "Dual input modes (notation vs manual entry) with URL sync"
    - "Tolerance checking for tire size compatibility (±3% diameter)"

key-files:
  created:
    - "src/lib/data/tire-load-index.json"
    - "src/lib/data/tire-speed-ratings.json"
    - "src/lib/converters/automotive/tire-sizing.ts"
    - "src/lib/converters/automotive/index.ts"
    - "src/lib/registry/automotive-converters.ts"
    - "src/stores/tire-sizing-store.ts"
    - "src/app/[locale]/automotive/tire-sizing/page.tsx"
    - "src/app/[locale]/automotive/tire-sizing/tire-sizing-calculator.tsx"
  modified:
    - "src/messages/en.json"
    - "src/messages/fr.json"
    - "src/messages/de.json"
    - "src/messages/it.json"

key-decisions:
  - "Used European metric notation (mm/aspect/construction/rim) as primary input format"
  - "Load index and speed ratings from ETRTO standards (official European tire specs)"
  - "±3% diameter difference threshold for compatibility warnings"
  - "Speedometer error calculation based on diameter difference percentage"

patterns-established:
  - "Tire notation regex pattern: /^(\d{3})\/(\d{2})(ZR|R|D|B)(\d{2})(?:\s+(\d{2,3})([A-Z]))?$/i"
  - "Dual input mode pattern (notation vs manual) for flexibility"
  - "Common size quick-select buttons for UX"

# Metrics
duration: 46min
completed: 2026-01-24
---

# Phase 20 Plan 02: Tire Sizing Calculator Summary

**Tire size calculator with European notation parsing (205/55R16), load index/speed rating lookups, and speedometer error calculation for size comparison**

## Performance

- **Duration:** 46 min
- **Started:** 2026-01-24T16:33:09Z
- **Completed:** 2026-01-24T17:18:53Z
- **Tasks:** 5
- **Files modified:** 12

## Accomplishments

- Tire notation parser supporting 205/55R16, 205/55R16 91V, and ZR formats
- ETRTO standard load index (60-120) and speed rating (L-Y) reference data
- Tire comparison with diameter difference and speedometer error calculation
- Dual input modes (notation and manual entry) with URL parameter sync
- Full i18n support (English, French, German, Italian)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tire data files** - `b6777b5` (feat)
   - tire-load-index.json with 61 load ratings (250-1400 kg)
   - tire-speed-ratings.json with 14 speed ratings (120-300 km/h)

2. **Task 2: Create tire sizing calculation logic** - `86fc09f` (feat)
   - Tire notation parser with regex validation
   - Dimension calculations (sidewall, diameter, circumference, revolutions/km)
   - Load index and speed rating lookup
   - Size comparison with tolerance checking
   - Automotive infrastructure (converters dir, registry file)

3. **Task 3: Create Zustand store with URL sync** - (committed in earlier session)
   - Notation and manual input modes
   - URL parameter persistence for sharing
   - Auto-calculation on input change
   - Comparison mode toggle

4. **Task 4: Create page and calculator component** - `84a9b82` (feat)
   - Page with metadata and layout
   - Tabbed input modes (notation vs manual)
   - Common tire size quick-select buttons
   - Comparison result display with tolerance warnings
   - Calculation steps for transparency

5. **Task 5: Add translations** - (committed in earlier session)
   - English, French, German, Italian translations
   - Category and converter metadata
   - Calculator labels and UI text

**TypeScript fix:** `5acc785` (fix: use full Category object)

## Files Created/Modified

**Created:**
- `src/lib/data/tire-load-index.json` - ETRTO load index table (60-120 ratings, 250-1400 kg)
- `src/lib/data/tire-speed-ratings.json` - ETRTO speed ratings (L-Y, 120-300 km/h)
- `src/lib/converters/automotive/tire-sizing.ts` - Tire calculation logic (notation parsing, dimensions, comparison)
- `src/lib/converters/automotive/index.ts` - Automotive converters barrel export
- `src/lib/registry/automotive-converters.ts` - Automotive category converter registry
- `src/stores/tire-sizing-store.ts` - Zustand store with URL sync (notation/manual modes)
- `src/app/[locale]/automotive/tire-sizing/page.tsx` - Next.js page with metadata
- `src/app/[locale]/automotive/tire-sizing/tire-sizing-calculator.tsx` - Calculator component

**Modified:**
- `src/messages/en.json` - English translations (tire-sizing converter, calculator.automotive.tireSizing)
- `src/messages/fr.json` - French translations
- `src/messages/de.json` - German translations
- `src/messages/it.json` - Italian translations

## Decisions Made

**1. European metric notation as primary format**
- Rationale: 205/55R16 is standard worldwide tire notation, most familiar to users
- Alternative considered: Separate width/aspect/rim inputs only
- Choice: Support both notation and manual entry modes

**2. ETRTO as reference standard**
- Rationale: European Tyre and Rim Technical Organisation is official tire specification source
- Ensures accuracy for load index (kg per tire) and speed ratings (km/h)

**3. ±3% diameter tolerance threshold**
- Rationale: Industry standard for tire size compatibility
- >3%: Warning (may affect speedometer)
- >5%: Strong warning (affects ABS, traction control)

**4. Speedometer error based on diameter difference**
- Rationale: Larger diameter = higher actual speed for same displayed speed
- Formula: speedometerError% = diameterDifference%
- Example: +2% diameter → speedometer shows 100 when actually going 102 km/h

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created automotive infrastructure**
- **Found during:** Task 2 (tire-sizing.ts creation)
- **Issue:** Plan assumed automotive category infrastructure existed from plan 20-01, but 20-01 hadn't been executed yet. Needed converters/automotive/ directory, index.ts, and automotive-converters.ts registry file.
- **Fix:** Created minimal infrastructure:
  - `src/lib/converters/automotive/` directory
  - `src/lib/converters/automotive/index.ts` barrel export
  - `src/lib/registry/automotive-converters.ts` with tire-sizing registration
  - Verified import in main converters.ts (already present)
- **Files created:** index.ts, automotive-converters.ts
- **Verification:** TypeScript compilation passed, no import errors
- **Committed in:** 86fc09f (Task 2 commit)

**2. [Rule 1 - Bug] Fixed TypeScript type error in page.tsx**
- **Found during:** TypeScript verification after Task 4
- **Issue:** ConverterLayout category prop expected full Category object (id, slug, name, description, icon), but provided only partial object (name, slug)
- **Fix:** Imported getCategoryById from registry, used full category object
- **Files modified:** src/app/[locale]/automotive/tire-sizing/page.tsx
- **Verification:** TypeScript compilation passed without errors
- **Committed in:** 5acc785 (separate fix commit)

---

**Total deviations:** 2 auto-fixed (1 blocking infrastructure, 1 TypeScript bug)
**Impact on plan:** Infrastructure setup was necessary to unblock Task 2. TypeScript fix was correctness issue. No scope creep.

## Issues Encountered

None - plan executed smoothly after infrastructure deviation was resolved.

## User Setup Required

None - no external service configuration required. All data is static JSON files.

## Next Phase Readiness

**Ready for next automotive calculators:**
- Automotive category registered in categories.ts (already present)
- Automotive converters infrastructure complete (directory, registry, index)
- Pattern established: data JSON files + calculation logic + Zustand store + page + translations
- No blockers for 20-03 (Maintenance Intervals) or 20-04 (Vehicle Financing)

**Automotive category structure:**
- Subcategories: fuel, tires, maintenance, financing
- Registry pattern: automotive-converters.ts exports all converters
- Data pattern: static JSON in src/lib/data/ for reference tables

---
*Phase: 20-automotive*
*Plan: 02*
*Completed: 2026-01-24*
