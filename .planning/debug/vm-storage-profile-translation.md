---
status: diagnosed
trigger: "Error: `MISSING_MESSAGE: Could not resolve 'calculator.vmStorage.profile' in messages for locale 'en'`"
created: 2026-01-25T10:00:00Z
updated: 2026-01-25T10:04:00Z
---

## Current Focus

hypothesis: Missing 'profile' key in calculator.vmStorage namespace across locale files
test: Check all 4 locale files for the key and examine usage in calculator component
expecting: Key is missing from translation files but referenced in component code
next_action: Read locale files and calculator component to confirm

## Symptoms

expected: Calculator should render with "Profile" label using translated text
actual: Error "MISSING_MESSAGE: Could not resolve 'calculator.vmStorage.profile'" in locale 'en'
errors: MISSING_MESSAGE: Could not resolve 'calculator.vmStorage.profile' in messages for locale 'en'
reproduction: Navigate to VM Storage Calculator, error occurs when rendering PDF export sections
started: Phase 27 implementation - new calculator missing translation key
location: src/app/[locale]/infrastructure/vm-storage-calculator/vm-storage-calculator.tsx:62:23

## Eliminated

## Evidence

- timestamp: 2026-01-25T10:02:00Z
  checked: vm-storage-calculator.tsx lines 62, 67, 72, 135, 140, 144
  found: Component uses `t("profile")` to create labels like "Profile 1 - Disk Size"
  implication: Translation key "profile" is required but not defined

- timestamp: 2026-01-25T10:03:00Z
  checked: All 4 locale files (en, fr, de, it) vmStorage namespace (lines 1445-1473)
  found: Keys present: vmProfiles, addProfile, removeProfile, diskSize, ramSize, vmCount, etc. Key "profile" is MISSING from all 4 files
  implication: Confirms root cause - key exists in component but not in translation files

## Resolution

root_cause: Translation key "profile" is missing from calculator.vmStorage namespace in all 4 locale files (en, fr, de, it). The component references this key in PDF/CSV export sections to label VM profiles.
fix: Add "profile" key to vmStorage section in all 4 locale files with appropriate translations
verification: Run calculator, generate PDF/CSV exports, verify no MISSING_MESSAGE errors
files_changed:

- src/messages/en.json (add "profile": "Profile")
- src/messages/fr.json (add "profile": "Profil")
- src/messages/de.json (add "profile": "Profil")
- src/messages/it.json (add "profile": "Profilo")
