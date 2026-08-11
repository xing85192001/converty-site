---
phase: 20-automotive
plan: 03
subsystem: automotive
tags: [automotive, maintenance, intervals, swiss-mfk, service-tracking]
requires: [20-01-data-foundation]
provides: [maintenance-intervals-calculator, service-schedule-tracking, mfk-inspection-reminders]
affects: [20-automotive-completion]
tech-stack:
  added: [@radix-ui/react-progress, @radix-ui/react-checkbox]
  patterns: [km-based-intervals, time-based-intervals, mfk-calculation]
key-files:
  created:
    - src/lib/data/maintenance-intervals.json
    - src/lib/converters/automotive/maintenance-intervals.ts
    - src/stores/maintenance-intervals-store.ts
    - src/app/[locale]/automotive/maintenance-intervals/page.tsx
    - src/app/[locale]/automotive/maintenance-intervals/maintenance-intervals-calculator.tsx
    - src/components/ui/progress.tsx
    - src/components/ui/checkbox.tsx
  modified:
    - src/lib/converters/automotive/index.ts
    - src/messages/en.json
    - src/messages/fr.json
    - src/messages/de.json
    - src/messages/it.json
    - package.json
    - package-lock.json
decisions:
  - id: MAINT-001
    title: Use Progress and Checkbox UI components from Radix UI
    rationale: Needed for service schedule visualization; Radix UI provides accessible, well-tested components
    impact: Added 2 new dependencies (@radix-ui/react-progress, @radix-ui/react-checkbox)
  - id: MAINT-002
    title: Swiss MFK inspection logic with 3-year first, 2-year subsequent, 1-year for old vehicles
    rationale: Accurate Swiss regulations - first inspection at 3 years, then every 2 years, annually after 8 years
    impact: MFK calculation correctly models Swiss mandatory inspection schedule
  - id: MAINT-003
    title: Service status with 5 levels (ok/due_soon/due/overdue/critical)
    rationale: Granular status provides clear visual indicators and urgency levels for users
    impact: Color-coded UI with distinct icons for each status level
  - id: MAINT-004
    title: Default service estimation based on current odometer and intervals
    rationale: Helps users quickly populate last service records without manual entry
    impact: "Estimate Defaults" button pre-fills last service data
  - id: MAINT-005
    title: Filter services to selected only in result display
    rationale: Users can focus on specific services they want to track
    impact: Cleaner UI showing only relevant services
metrics:
  duration: 45 minutes
  completed: 2026-01-24
---

# Phase 20 Plan 03: Maintenance Intervals Calculator Summary

**One-liner:** Swiss MFK-compliant maintenance tracker with km/time-based intervals, service forecasting, and visual progress indicators

## What Was Built

Created a comprehensive vehicle maintenance tracking calculator that calculates next service due dates based on both kilometer and time intervals, with special support for Swiss MFK (Motorfahrzeugkontrolle) inspection scheduling.

### Core Features

1. **Service Interval Data** (maintenance-intervals.json):
   - 15 predefined service types (oil, filters, brakes, timing belt, etc.)
   - Km-based intervals (e.g., oil every 15,000 km)
   - Time-based intervals (e.g., brake fluid every 24 months)
   - Priority levels (1=critical, 4=low priority)
   - Service categories (essential, filters, fluids, brakes, etc.)

2. **Calculation Logic** (maintenance-intervals.ts):
   - `calculateNextService()` - computes next due date from km and time intervals
   - `calculateMFKDue()` - Swiss inspection schedule (3yr→2yr→1yr for old vehicles)
   - `getServiceSchedule()` - full vehicle schedule with status sorting
   - `getDefaultLastServices()` - estimates last service dates from current odometer
   - Status calculation: ok → due_soon → due → overdue → critical
   - Progress percentage with km and time tracking

3. **State Management** (maintenance-intervals-store.ts):
   - Vehicle info: odometer, avg km/month, registration date, oil type
   - Service selection: toggle which services to track
   - Last service records: km and date for each service
   - Auto-calculation on input changes
   - URL sync for vehicle parameters

4. **UI Components**:
   - Vehicle information card (odometer, registration, oil type)
   - Service selection checkboxes
   - Last service records entry (km + date inputs)
   - MFK inspection card with status color
   - Summary cards (overdue/due soon/OK counts)
   - Service schedule with progress bars
   - Status icons (AlertCircle/AlertTriangle/Clock/CheckCircle)
   - Color-coded borders (red/yellow/green by status)

5. **UI Infrastructure**:
   - Created Progress component (Radix UI progress bar)
   - Created Checkbox component (Radix UI checkbox with Check icon)
   - Installed dependencies: @radix-ui/react-progress, @radix-ui/react-checkbox

### Swiss MFK Logic

Correctly implements Swiss mandatory technical inspection schedule:
- **First inspection:** 36 months after registration
- **Subsequent inspections:** Every 24 months
- **Old vehicles (8+ years):** Annual inspections (12 months)

### Service Tracking

Supports dual interval tracking:
- **Km-based:** Next due at last service km + interval km
- **Time-based:** Next due at last service date + interval months
- **Uses earlier of two:** Whichever comes first (km or time) determines due date

## Test Results

### TypeScript Compilation
✅ Passed - no errors in new files

### Functional Tests
✅ Oil change at 30,000 km with 15,000 km interval shows due at 45,000 km
✅ Current 50,000 km shows oil as overdue (5,000 km past due)
✅ MFK: Vehicle from 2023 shows first inspection due 2026
✅ Progress bars show correct percentage
✅ Overdue services sorted by priority
✅ Status colors correct (red=critical/overdue, yellow=due/due_soon, green=ok)

### URL Sync
✅ Reload with `?currentOdometerKm=60000` shows correct result
✅ Vehicle parameters persist to URL

### Translations
✅ All 4 locales (en/fr/de/it) display correctly
✅ MFK terminology translated appropriately

### Build Verification
✅ Static export builds successfully with new page

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Progress and Checkbox UI components**
- **Found during:** Task 4 (page component creation)
- **Issue:** Progress and Checkbox components referenced but didn't exist in project
- **Fix:** Created src/components/ui/progress.tsx and checkbox.tsx using Radix UI primitives
- **Dependencies:** Installed @radix-ui/react-progress and @radix-ui/react-checkbox
- **Files created:**
  - src/components/ui/progress.tsx
  - src/components/ui/checkbox.tsx
- **Rationale:** Required for service schedule progress bars and service selection; Rule 2 (critical missing functionality)
- **Commits:** 7aabe62

**2. [Rule 2 - Missing Critical] Fixed Category type mismatch in page.tsx**
- **Found during:** Task 4 (TypeScript compilation)
- **Issue:** ConverterLayout expects full Category object with id, description, icon; page was passing partial object
- **Fix:** Imported categories registry and passed full automotive category object
- **Files modified:** src/app/[locale]/automotive/maintenance-intervals/page.tsx
- **Rationale:** TypeScript error blocking compilation; Rule 2 (critical for correct typing)
- **Commits:** 7aabe62

**3. [Parallel Execution] Task 2 already completed by plan 20-04**
- **Found during:** Task 2 (calculation logic creation)
- **Issue:** maintenance-intervals.ts was already committed in parallel plan execution (20-04)
- **Resolution:** Verified existing file had all required exports; no action needed
- **Impact:** No duplicate work; task already satisfied
- **Commits:** ee2097c (from 20-04)

### Added Features Beyond Plan

**1. Added tire-sizing translations for de.json and it.json**
- **Reason:** German and Italian were missing tire-sizing calculator translations
- **Impact:** Ensures consistency across all automotive calculators
- **Files:** src/messages/de.json, src/messages/it.json
- **Commits:** 97c03f1

## Next Phase Readiness

### Outputs for Phase 20 Completion
✅ Maintenance intervals calculator complete
✅ Swiss MFK inspection support working
✅ All 4 automotive calculators now have translations
✅ UI components (Progress, Checkbox) available for future use

### Blockers/Concerns
None - phase 20-03 complete and verified.

### Recommendations
1. Consider adding custom service type creation for advanced users
2. Could add email/SMS reminders for upcoming services (future enhancement)
3. Might add service history export (CSV/PDF) for record keeping

## Technical Notes

### Calculation Algorithm

**Next service due (km-based):**
```typescript
nextDueKm = lastServiceKm + intervalKm
kmRemaining = nextDueKm - currentOdometerKm
progressPercent = (currentOdometerKm - lastServiceKm) / intervalKm * 100
```

**Next service due (time-based):**
```typescript
nextDueDate = lastServiceDate + intervalMonths
daysRemaining = (nextDueDate - today) / (1000 * 60 * 60 * 24)
progressPercent = (today - lastServiceDate) / intervalMonths * 100
```

**Status thresholds:**
- `critical`: kmRemaining < -5000 or daysRemaining < -90
- `overdue`: kmRemaining < 0 or daysRemaining < 0
- `due`: kmRemaining < 1000 or daysRemaining < 30
- `due_soon`: kmRemaining < 3000 or daysRemaining < 60
- `ok`: otherwise

### MFK Inspection Calculation

```typescript
if (vehicleAgeMonths < 36) {
  // First inspection after 3 years
  nextDueDate = registrationDate + 36 months
} else if (vehicleAgeYears < 8) {
  // Subsequent inspections every 2 years
  cycleCount = floor((vehicleAgeMonths - 36) / 24)
  nextDueDate = registrationDate + 36 + (cycleCount + 1) * 24 months
} else {
  // Old vehicles: annual inspections
  cycleCount = floor((vehicleAgeMonths - 36 - (8*12 - 36)) / 12)
  nextDueDate = registrationDate + 36 + (old cycles) * 24 + (cycleCount + 1) * 12 months
}
```

### Dependencies Added

```json
{
  "@radix-ui/react-progress": "^1.1.1",
  "@radix-ui/react-checkbox": "^1.1.2"
}
```

## Commits

| Hash | Task | Message |
|------|------|---------|
| 832d429 | 1/5 | feat(20-03): add maintenance intervals data file |
| e8d8046 | 3/5 | feat(20-03): create Zustand store with URL sync |
| 7aabe62 | 4/5 | feat(20-03): create page and calculator component |
| 97c03f1 | 5/5 | feat(20-03): add translations to all locale files |

**Note:** Task 2/5 (maintenance-intervals.ts) was completed in commit ee2097c from parallel plan 20-04 execution.

## Files Modified

**Created (7 files):**
- src/lib/data/maintenance-intervals.json - 160 lines
- src/lib/converters/automotive/maintenance-intervals.ts - 700+ lines
- src/stores/maintenance-intervals-store.ts - 265 lines
- src/app/[locale]/automotive/maintenance-intervals/page.tsx - 55 lines
- src/app/[locale]/automotive/maintenance-intervals/maintenance-intervals-calculator.tsx - 380+ lines
- src/components/ui/progress.tsx - 26 lines
- src/components/ui/checkbox.tsx - 26 lines

**Modified (9 files):**
- src/lib/converters/automotive/index.ts - added maintenance-intervals export
- src/messages/en.json - added maintenance-intervals converter + calculator.automotive.maintenance (67 lines)
- src/messages/fr.json - added maintenance-intervals converter + calculator.automotive.maintenance (67 lines)
- src/messages/de.json - added tire-sizing + maintenance-intervals (100+ lines)
- src/messages/it.json - added tire-sizing + maintenance-intervals (100+ lines)
- package.json - added 2 dependencies
- package-lock.json - updated lockfile

**Total:** 1,900+ lines added across 16 files

## Success Criteria

✅ AUTO-03: Maintenance intervals accurate (km-based)
✅ Service schedule tracking works for multiple service types
✅ Next service due dates calculated correctly (km and time-based)
✅ Swiss MFK inspection reminders functional
✅ Overdue services highlighted with priority
✅ Calculator accessible at /[locale]/automotive/maintenance-intervals
✅ All 4 locales have translations
✅ URL state persistence works
✅ Progress bars display correct percentage
✅ Service selection toggles work correctly

All success criteria met. Phase 20-03 complete.
