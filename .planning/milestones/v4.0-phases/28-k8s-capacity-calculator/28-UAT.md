---
status: diagnosed
phase: 28-k8s-capacity-calculator
source: 28-01-SUMMARY.md, 28-02-SUMMARY.md
started: 2026-01-25T19:30:00Z
updated: 2026-01-25T19:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Calculator page loads with correct structure
expected: Navigate to /en/infrastructure/k8s-capacity-calculator. Page loads with title "Kubernetes Capacity Calculator", infrastructure breadcrumb, and four input sections: Pod Workload, Node Specifications, System Overhead, Target Utilization. Results area visible.
result: pass

### 2. Default values calculate nodes needed
expected: With defaults (10 pods @ 500m CPU, 512 MiB memory; 8-core 16GB nodes), calculator displays "Nodes Needed" result (should be 2 or 3 nodes based on constraints)
result: pass

### 3. Limiting factor badge displays correctly
expected: Results show two badges - one for CPU constraint, one for Memory constraint. One badge is filled (limiting factor) with "(limiting)" text, the other is outline style.
result: pass

### 4. CPU as limiting factor scenario
expected: Change pod replicas to 40 (keeping other defaults). CPU should become limiting factor - CPU badge filled, memory badge outline.
result: issue
reported: "Invalid input parameters"
severity: major

### 5. Memory as limiting factor scenario
expected: Change pod memory to 4096 MiB (4GB), pod replicas to 10. Memory should become limiting factor - Memory badge filled, CPU badge outline.
result: pass

### 6. Over-utilization warning appears
expected: Set target CPU utilization to 95% and target memory utilization to 95%. Warning card with amber border and AlertTriangle icon appears recommending adding more nodes.
result: pass

### 7. All input fields are functional
expected: Change each of the 11 input fields (pod CPU, memory, replicas, node CPU, memory, system reserved CPU/memory, DaemonSet CPU/memory, target CPU/memory utilization). Results update automatically after each change.
result: pass

### 8. Help text displays for complex concepts
expected: System reserved, DaemonSet, and target utilization fields have helper text explaining their purpose (visible below or near input fields).
result: pass

### 9. Capacity breakdown shows allocatable resources
expected: Results section displays "Allocatable per Node" showing CPU millicores and Memory MiB available after system overhead.
result: pass

### 10. Final utilization percentages display
expected: Results show "Final CPU Utilization" and "Final Memory Utilization" as percentages with 1 decimal place (e.g., "75.3%")
result: pass

### 11. URL state syncs correctly
expected: Change pod replicas to 25, node CPU to 16. Reload the page. Settings persist - still shows 25 replicas and 16 CPU cores.
result: pass

### 12. Reset button restores defaults
expected: After changing values, click Reset button. All inputs return to defaults: 10 replicas, 500m CPU, 512 MiB memory, 8-core 16GB nodes, 70% CPU / 80% memory target.
result: pass

### 13. Responsive design works
expected: Resize browser to mobile width. Input sections stack in single column. Resize to desktop. Sections display in 2-column grid.
result: pass

### 14. Calculator available in all locales
expected: Visit /fr/infrastructure/k8s-capacity-calculator, /de/infrastructure/k8s-capacity-calculator, /it/infrastructure/k8s-capacity-calculator. Each loads with translated labels (French, German, Italian).
result: pass

### 15. Calculator appears in infrastructure category
expected: Visit /en/infrastructure. K8s Capacity Calculator appears in the listing with Server icon and description.
result: pass

## Summary

total: 15
passed: 14
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Change pod replicas to 40 (keeping other defaults). CPU should become limiting factor - CPU badge filled, memory badge outline."
  status: failed
  reason: "User reported: Invalid input parameters"
  severity: major
  test: 4
  root_cause: "Transient input state - parseFloat('') returns NaN which defaults to 0, creating temporarily invalid inputs that fail validation during typing. Calculation logic works correctly with 40 replicas (returns 5 nodes, CPU limiting as expected)."
  artifacts:
    - path: "src/app/[locale]/infrastructure/k8s-capacity-calculator/k8s-capacity-calculator.tsx"
      issue: "Input onChange handlers use `parseFloat(v) || 0` which defaults to 0 during field clearing"
  missing:
    - "Implement safeParsePositive() and safeParseNonNegative() helpers that preserve previous valid values instead of defaulting to 0"
    - "Update all 11 input onChange handlers to use safe parse helpers"
  debug_session: ".planning/debug/k8s-capacity-40-replicas-invalid.md"
