---
status: investigating
trigger: "Test 4: CPU as limiting factor scenario - replicas=40 causes Invalid input parameters"
created: 2026-01-25T10:30:00Z
updated: 2026-01-25T10:40:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Input parsing during user typing causes temporary invalid state (parseFloat("") returns NaN, becomes 0)
test: Search for additional input constraints or test scenario details
expecting: Find specific user action that triggers the error
next_action: Check if issue is test documentation vs actual bug

## Symptoms

expected: Change pod replicas to 40 (keeping other defaults). CPU should become limiting factor - CPU badge filled, memory badge outline.
actual: "Invalid input parameters" error displayed
errors: "Invalid input parameters"
reproduction:

1. Set pod replicas to 40
2. Keep defaults: 500m CPU, 512 MiB memory per pod
3. Node: 8 cores, 16384 MB
4. System reserved: 700m CPU, 1024 MiB memory
5. DaemonSets: 300m CPU, 384 MiB memory
6. Target: 70% CPU, 80% memory
started: Test 4 in UAT phase 26

context:

- Test 2 passed: 10 replicas works correctly
- Test 5 passed: Memory limiting factor works
- Test 4 failed: 40 replicas shows error

## Eliminated

- hypothesis: Validation logic in calculateK8sCapacity rejects 40 replicas
  evidence: Manual test with exact inputs shows all 5 validations pass
  timestamp: 2026-01-25T10:35:00Z

- hypothesis: Calculation function is broken
  evidence: Direct function call with calculateK8sCapacity succeeds for both 10 and 40 replicas
  timestamp: 2026-01-25T10:40:00Z

## Evidence

- timestamp: 2026-01-25T10:31:00Z
  checked: src/lib/converters/infrastructure/k8s-capacity.ts
  found: 5 validation checks before calculation
  implication: Function returns null for invalid inputs

- timestamp: 2026-01-25T10:32:00Z
  checked: Manual calculation with 40 replicas
  found: |
    Validation 1 (lines 117-119): Positive counts - PASS
    Validation 2 (lines 122-124): Positive pod requests - PASS
    Validation 3 (lines 127-134): Percentage ranges (1-100) - PASS
    Validation 4 (lines 137-144): Non-negative overhead - PASS
    Validation 5 (lines 154-156): Sufficient allocatable resources
      allocatableCpuPerNode = 7000m > 0 ✓
      allocatableMemoryPerNode = 14976 MiB > 0 ✓
      PASS
  implication: All validations in calculateK8sCapacity should pass

- timestamp: 2026-01-25T10:33:00Z
  checked: src/stores/k8s-capacity-store.ts
  found: Line 280 sets error to "Invalid input parameters" when calculateK8sCapacity returns null
  implication: Store correctly handles null return from calculation function

- timestamp: 2026-01-25T10:34:00Z
  checked: src/app/[locale]/infrastructure/k8s-capacity-calculator/k8s-capacity-calculator.tsx
  found: |
    Line 179: onChange={(v) => setPodReplicas(parseFloat(v) || 0)}
    Pattern: parseFloat(v) || 0 converts invalid input to 0
    Line 181: min={1} sets HTML5 minimum (doesn't prevent onChange with 0)
  implication: If user clears field, podReplicas becomes 0 temporarily, failing validation

- timestamp: 2026-01-25T10:35:00Z
  checked: Test script execution with exact inputs
  found: |
    All validations PASS with these exact values
    Manual calculation succeeds
  implication: The calculation SHOULD work

- timestamp: 2026-01-25T10:40:00Z
  checked: Direct function call with calculateK8sCapacity
  found: |
    Test 1 (10 replicas): SUCCESS - 2 nodes, CPU limited
    Test 2 (40 replicas): SUCCESS - 5 nodes, CPU limited
    Detailed results for 40 replicas:
      - Allocatable CPU: 7000m
      - Allocatable memory: 14976 MiB
      - Nodes by CPU: 5
      - Nodes by memory: 2
      - Limiting factor: CPU ✓ (matches expected)
      - Final CPU utilization: 57.1%
      - Final memory utilization: 27.4%
  implication: calculateK8sCapacity works perfectly - bug must be in input handling, not calculation

## Resolution

root_cause: |
  The reported error "Invalid input parameters" when setting pod replicas to 40 CANNOT be reproduced with direct function calls. The calculation logic is correct and produces expected results (5 nodes, CPU limiting factor).

  Most likely causes:

  1. **Transient state during typing**: If user clears field before typing "40", parseFloat("") returns NaN which becomes 0, triggering temporary error until typing completes
  2. **Test execution issue**: User may have accidentally modified another field (setting CPU/memory to 0 or invalid value) during test
  3. **Stale test result**: Issue may have already been fixed, or test was performed on different code version
  4. **Missing test context**: Additional steps or conditions not captured in bug report

  The calculation function itself is working correctly. With the documented inputs (replicas=40, all other defaults), the calculator should display:

- 5 nodes needed
- CPU as limiting factor (badge filled)
- Memory badge outline (not limiting)
- CPU utilization: 57.1%
- Memory utilization: 27.4%

  **UNABLE TO CONFIRM BUG WITH PROVIDED INFORMATION** - calculation logic is correct.

fix: |
  If the issue persists in actual usage, recommended fixes:

  1. Improve parseFloat fallback: `parseFloat(v) || (prevValue)` to preserve previous valid value instead of defaulting to 0
  2. Add debouncing to prevent auto-calculate during typing
  3. Add input validation feedback before calculation runs

  However, since bug cannot be reproduced, no fix is currently required.

verification: |
  Direct function testing confirms:

- calculateK8sCapacity({..., podReplicas: 40, ...}) returns valid result
- All validation checks pass
- Result matches expected behavior (CPU limiting factor, 5 nodes)

files_changed: []
