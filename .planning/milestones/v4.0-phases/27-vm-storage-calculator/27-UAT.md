---
status: complete
phase: 27-vm-storage-calculator
source: 27-01-SUMMARY.md, 27-02-SUMMARY.md
started: 2026-01-25T14:15:00Z
updated: 2026-01-25T21:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Access VM Storage Calculator
expected: Navigate to /en/infrastructure/vm-storage-calculator - Page loads with VM Storage Calculator heading and input form
result: pass
note: Fixed via 27-03-PLAN.md - Added 'profile' translation to all 4 locales (commit 9805025)

### 2. Default Configuration Loads
expected: Calculator shows 2 VM profiles by default (100GB/8GB×10 and 200GB/16GB×5) with configuration defaults (swap enabled, 20% snapshots, 33% thin provisioning, 30% growth, 3 ESX hosts)
result: pass

### 3. Calculate Storage Automatically
expected: Change any input value (e.g., VM count from 10 to 15). Results section updates automatically showing new Total Required Storage without clicking a button.
result: pass

### 4. Add VM Profile
expected: Click "Add Profile" button. New VM profile card appears with default values (disk size, RAM, VM count inputs).
result: pass

### 5. Remove VM Profile
expected: With 2+ profiles, click remove button on one profile. Profile is removed. With only 1 profile remaining, remove button is disabled or hidden.
result: pass

### 6. Storage Breakdown Display
expected: Results section shows detailed breakdown with 8 metrics: Used Disk, Over-subscribed, Snapshots, Swap, Config/Log, Total VM Storage, ESX Overhead, Growth - each showing GB values and percentages.
result: pass

### 7. Thin Provisioning Warning
expected: Set thin provisioning percentage above 50% (e.g., 60%). Amber warning card appears with message about over-subscription risk.
result: pass

### 8. URL State Persistence
expected: Change configuration values (e.g., snapshot %, ESX hosts). Browser URL updates with query parameters. Copy URL to new tab - values are restored from URL.
result: pass

### 9. Responsive Design
expected: Resize browser window to mobile width. Layout remains usable with inputs stacking vertically. On desktop, inputs display in 2-column grid.
result: pass

### 10. Multi-Locale Support
expected: Navigate to /fr/infrastructure/vm-storage-calculator - Calculator displays in French with translated labels. Repeat for /de/ and /it/ - all locales work correctly.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "Page loads with VM Storage Calculator heading and input form"
  status: fixed
  reason: "User reported: MISSING_MESSAGE: Could not resolve `calculator.vmStorage.profile` in messages for locale `en`. src/app/[locale]/infrastructure/vm-storage-calculator/vm-storage-calculator.tsx (62:23)"
  severity: blocker
  test: 1
  root_cause: "Translation key 'profile' is missing from the calculator.vmStorage namespace in all 4 locale files (en, fr, de, it). The component references this key at 6 locations in PDF/CSV export sections to create labels like 'Profile 1 - Disk Size'."
  fix_plan: "27-03-PLAN.md"
  fix_commit: "9805025"
  artifacts:
    - path: "src/messages/en.json"
      issue: "Missing 'profile' key in calculator.vmStorage namespace"
      fixed: "Added \"profile\": \"Profile\""
    - path: "src/messages/fr.json"
      issue: "Missing 'profile' key in calculator.vmStorage namespace"
      fixed: "Added \"profile\": \"Profil\""
    - path: "src/messages/de.json"
      issue: "Missing 'profile' key in calculator.vmStorage namespace"
      fixed: "Added \"profile\": \"Profil\""
    - path: "src/messages/it.json"
      issue: "Missing 'profile' key in calculator.vmStorage namespace"
      fixed: "Added \"profile\": \"Profilo\""
  debug_session: ".planning/debug/vm-storage-profile-translation.md"
