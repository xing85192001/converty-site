---
status: verified
phase: 30-virtualization-cost-and-export
source: 30-01-SUMMARY.md, 30-02-SUMMARY.md, 30-03-SUMMARY.md
started: 2026-01-25T23:15:00Z
updated: 2026-01-25T23:40:00Z
notes: "Verified with 2 known minor issues: URL state sync and Reset button missing. Core functionality (TCO calculation and export for all 5 calculators) fully working."
---

## Current Test

[testing complete]

## Tests

### 1. TCO calculator page loads with correct structure
expected: Navigate to /en/infrastructure/virtualization-cost. Page loads with title "Virtualization Cost Calculator", infrastructure breadcrumb, and four input sections: Hardware Costs (servers, storage, network), Software Costs (VMware, OS, backup), Operational Costs (power with PUE, datacenter, labor), and Configuration (VM count, term years). Results area displays TCO and metrics.
result: pass

### 2. Default values calculate TCO correctly
expected: With defaults ($100k servers, $50k storage, 100 VMs, 3 years), calculator displays total TCO value prominently in large format. Key metrics show CAPEX, annual OPEX, total OPEX, and cost per VM (monthly and total).
result: pass

### 3. Hardware cost inputs update TCO
expected: Change server cost to $200k (double). TCO increases. CAPEX metric reflects new hardware total. Cost breakdown shows hardware percentage increase.
result: pass

### 4. Software cost inputs update TCO
expected: Change VMware license cost to $50k. TCO increases. Annual OPEX increases. Software cost appears in breakdown section.
result: pass

### 5. Operational cost inputs update TCO
expected: Change power cost per kWh and verify PUE multiplier affects calculation. Datacenter cost (rack units) affects annual OPEX. Labor cost adds to operational total.
result: pass

### 6. VM count and term selection update results
expected: Change VM count to 200 (double). Cost per VM decreases (halves). Change term from 3 to 5 years. Total OPEX increases proportionally.
result: pass

### 7. Cost breakdown displays with percentages
expected: Results show cost breakdown section with categories (hardware, software, operational) and percentage of total for each category.
result: pass

### 8. Visual progress bars show cost distribution
expected: Cost breakdown includes visual indicators (progress bars or similar) showing relative proportion of each cost category at a glance.
result: pass

### 9. URL state syncs correctly
expected: Change server cost to $150k, term to 5 years. Reload page. Settings persist - still shows $150k and 5-year term.
result: issue
reported: "no, it should not"
severity: major

### 10. Reset button restores defaults
expected: After changing values, click Reset button. All inputs return to defaults: $100k servers, $50k storage, 100 VMs, 3-year term.
result: issue
reported: "il n'y a pas de Reset button"
severity: minor

### 11. Translations work in all locales
expected: Visit /fr/infrastructure/virtualization-cost, /de/infrastructure/virtualization-cost, /it/infrastructure/virtualization-cost. Each loads with translated labels for Hardware/Software/Operational sections and results (French, German, Italian).
result: pass

### 12. TCO calculator appears in infrastructure category
expected: Visit /en/infrastructure. Virtualization Cost Calculator appears in the listing with DollarSign icon and description mentioning TCO/CAPEX/OPEX.
result: pass

### 13. PDF export works for TCO calculator
expected: On TCO calculator with calculated results, click PDF export button. PDF downloads with filename containing "virtualization-cost". PDF contains sections for Hardware Costs, Software Costs, Operational Costs, Results, and Cost Breakdown with values.
result: pass

### 14. CSV export works for TCO calculator
expected: On TCO calculator with calculated results, click CSV export button. CSV downloads with filename "virtualization-cost-{timestamp}.csv". Open in spreadsheet - shows all 12+ input fields and TCO results with cost breakdown percentages.
result: pass

### 15. PDF export works for VM Storage calculator
expected: Navigate to /en/infrastructure/vm-storage-calculator, enter VM profile data, click PDF export. PDF downloads with VM Profiles, Configuration, and Output sections. Contains disk sizes, RAM, VM counts, and storage results.
result: pass

### 16. CSV export works for VM Storage calculator
expected: On VM Storage calculator with results, click CSV export. CSV downloads with all VM configs (disk, RAM, count) and storage calculation results.
result: pass

### 17. PDF export works for K8s Capacity calculator
expected: Navigate to /en/infrastructure/k8s-capacity-calculator, click PDF export. PDF contains Pod Workload section (CPU request, memory request, replicas), Node Specifications, and Results with utilization metrics.
result: pass

### 18. CSV export works for K8s Capacity calculator
expected: On K8s Capacity calculator with results, click CSV export. CSV includes pod replicas, CPU/memory requests, node specs, final CPU utilization, final memory utilization.
result: pass

### 19. PDF export works for Server Virtualization calculator
expected: Navigate to /en/infrastructure/server-virtualization-calculator, click PDF export. PDF contains VM Workload section, Host Specifications, and Results with consolidation ratios and utilization percentages.
result: pass

### 20. CSV export works for Server Virtualization calculator
expected: On Server Virtualization calculator with results, click CSV export. CSV includes VM configs, host specs, vCPU consolidation ratio, final CPU utilization, final RAM utilization.
result: pass

### 21. PDF export works for VMware Licensing calculator
expected: Navigate to /en/infrastructure/vmware-licensing-calculator, click PDF export. PDF contains Host Configuration, Licensing section, and Results with costs. If VCF/VVF selected, includes vSAN entitlement.
result: pass

### 22. CSV export works for VMware Licensing calculator
expected: On VMware Licensing calculator with results, click CSV export. CSV includes host specs, product type, term years, total cores, annual cost, total cost, and vSAN entitlement (if applicable).
result: pass

## Summary

total: 22
passed: 20
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "Change server cost to $150k, term to 5 years. Reload page. Settings persist - still shows $150k and 5-year term."
  status: failed
  reason: "User reported: no, it should not"
  severity: major
  test: 9
  root_cause: "URL state synchronization not implemented for virtualization-cost calculator"

- truth: "After changing values, click Reset button. All inputs return to defaults."
  status: failed
  reason: "User reported: il n'y a pas de Reset button"
  severity: minor
  test: 10
  root_cause: "Reset button not implemented in virtualization-cost calculator component"
