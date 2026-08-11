---
status: diagnosed
trigger: "Build completes but emits 19 MISSING_MESSAGE errors for calculator.k8sCapacity.* keys in German (de) locale"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:05:00Z
---

## Current Focus

hypothesis: CONFIRMED - German locale contains outdated k8sCapacity translations from pre-Phase 28 version
test: Counted keys and compared structures
expecting: Complete mismatch with 28 missing keys and 13 obsolete keys
next_action: Document root cause and provide structured findings

## Symptoms

expected: Build should generate all locale pages without MISSING_MESSAGE errors
actual: Build completes but shows 19 MISSING_MESSAGE errors for calculator.k8sCapacity.* keys in German (de)
errors:

- Error: MISSING_MESSAGE: calculator.k8sCapacity.podWorkload (de)
- Error: MISSING_MESSAGE: calculator.k8sCapacity.podCpuRequest (de)
- Error: MISSING_MESSAGE: calculator.k8sCapacity.podMemoryRequest (de)
- [16 more similar errors for German locale]
reproduction: Run `npm run build` and observe translation errors for German locale
started: Discovered during Phase 26 UAT test 7 (Production build validation)

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:01:00Z
  checked: All four locale files for k8sCapacity translations
  found: German (de.json) has completely different key names than English, French, and Italian
  implication: German translations are from an old version of the calculator

- timestamp: 2026-01-25T00:02:00Z
  checked: Key comparison across locales
  found:
  - English/French/Italian use: podWorkload, podCpuRequest, podMemoryRequest, podReplicas, nodeSpecs, systemOverhead, systemReservedCpu, systemReservedMemory, daemonSetCpuPerNode, daemonSetMemoryPerNode, allocatableCpu, allocatableMemory, cpuBreakdown, memoryBreakdown, calculationSteps, overUtilizationWarning, systemReservedHelp
  - German uses: title, description, podCount, cpuPerPodMillicores, ramPerPodMi, storagePerPodGi, nodeRamGi, nodeStorageGi, cores, millicores, mib, mb, cpuConstrained, memoryConstrained, cpuResults, memoryResults
  implication: German locale needs to be updated to match the current key structure used by other locales

- timestamp: 2026-01-25T00:03:00Z
  checked: Component translation usage in k8s-capacity-calculator.tsx
  found: Component uses calculator.k8sCapacity namespace and expects keys like podWorkload, podCpuRequest, systemReservedHelp, daemonSetHelp, etc.
  implication: Component was updated in Phase 28 but German translations were not updated

- timestamp: 2026-01-25T00:04:00Z
  checked: Exact key count comparison
  found:
  - English: 51 keys
  - German: 36 keys
  - Missing from German: 28 keys (allocatableCpu, allocatableMemory, breakdown, calculationSteps, cpuBreakdown, cpuConstraint, daemonSetCpuPerNode, daemonSetHelp, daemonSetMemoryPerNode, finalMemoryUtilization, memoryBreakdown, memoryConstraint, nodeMemoryMb, nodesNeeded, nodeSpecs, overUtilizationWarning, podCpuRequest, podMemoryRequest, podReplicas, podWorkload, results, systemOverhead, systemReservedCpu, systemReservedHelp, systemReservedMemory, targetMemoryUtilization, targetUtilization, targetUtilizationHelp)
  - Obsolete in German: 13 keys (cpuPerPodMillicores, description, finalRamUtilization, finalStorageUtilization, nodeRamGi, nodesNeededTotal, nodeStorageGi, podCount, ramPerPodMi, storagePerPodGi, targetRamUtilization, targetStorageUtilization, title)
  implication: German translations are from a completely different calculator version

## Resolution

root_cause: German locale file (src/messages/de.json) contains outdated k8sCapacity translations from before Phase 28 calculator redesign; 28 required keys are missing and 13 obsolete keys remain from the old version.
fix: Replace entire calculator.k8sCapacity section in de.json with translations matching the current en.json structure (51 keys total)
verification: Run npm run build and verify no MISSING_MESSAGE errors for calculator.k8sCapacity in German locale
files_changed:

- src/messages/de.json: Replace calculator.k8sCapacity section with current translation keys
