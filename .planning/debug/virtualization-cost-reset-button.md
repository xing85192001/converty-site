---
status: diagnosed
trigger: "Diagnose why the Reset button is missing from the virtualization-cost calculator"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:06:00Z
---

## Current Focus

hypothesis: CONFIRMED - Reset functionality exists in store but is not exposed in UI
test: Verified reset function in createCalculatorStore and compared with k8s-capacity implementation
expecting: Root cause found - missing UI implementation
next_action: Return diagnosis

## Symptoms

expected: Reset button should restore all default values
actual: No Reset button present in UI ("il n'y a pas de Reset button")
errors: None reported
reproduction: Navigate to virtualization-cost calculator, look for Reset button in UI
started: Discovered in Phase 26 UAT Test 10

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:01:00Z
  checked: virtualization-cost-calculator.tsx (lines 25-52)
  found: Uses createCalculatorStore but only destructures { values, setValue, result } - does NOT destructure reset
  implication: Reset function exists in store but is not imported into component

- timestamp: 2026-01-25T00:02:00Z
  checked: virtualization-cost-calculator.tsx (full component)
  found: No Reset button anywhere in UI (searched entire 558-line component)
  implication: UI implementation is missing Reset button entirely

- timestamp: 2026-01-25T00:03:00Z
  checked: calculator-store.ts (lines 128-134)
  found: createCalculatorStore factory provides reset() function that resets values to initialValues, clears errors, sets result to null
  implication: Reset functionality is available, just not used

- timestamp: 2026-01-25T00:04:00Z
  checked: k8s-capacity-calculator.tsx (lines 66, 530-534)
  found: k8s-capacity calculator DOES destructure reset (line 66) and HAS Reset button UI (lines 530-534)
  implication: k8s-capacity follows correct pattern, virtualization-cost does not

- timestamp: 2026-01-25T00:05:00Z
  checked: k8s-capacity-store.ts (lines 292-299)
  found: k8s-capacity has custom store with explicit reset implementation
  implication: Both store types (custom and factory) provide reset - virtualization-cost just needs to use it

## Resolution

root_cause: Reset button is missing from virtualization-cost calculator UI. The reset functionality exists in the store (provided by createCalculatorStore factory) but is not exposed in the component. The component only destructures { values, setValue, result } from the store and never imports the reset function or renders a Reset button.

fix: Need to add Reset button to UI following the pattern from k8s-capacity-calculator

  1. Destructure reset from store: const { values, setValue, result, reset } = useVirtualizationCostStore();
  2. Add Reset button in results section (similar to k8s-capacity lines 530-534)
  3. Add "reset" translation key to all locale files

verification: After fix, verify Reset button appears in UI and clicking it restores all default values
files_changed:

- src/app/[locale]/infrastructure/virtualization-cost/virtualization-cost-calculator.tsx
- src/messages/en.json
- src/messages/fr.json
- src/messages/de.json
- src/messages/it.json
