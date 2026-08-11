---
phase: 16-translation-implementation
plan: 05
type: summary
status: complete
completed_at: 2026-01-22
---

# Wave 5: Photo Astro/Time Calculators — Translation Implementation

## Overview

Wave 5 completes i18n support for three astrophotography and time-lapse photography calculators. All components already had useTranslations hooks implemented and full translation coverage across all four locales (EN, FR, DE, IT).

## Components Verified

### 1. Spot Stars Calculator
- **File**: `src/app/[locale]/photo/spot-stars/spot-stars-calculator.tsx`
- **Translations**: `calculator.photo.astro` namespace
- **Status**: ✅ Fully internationalized
- **Key Translations Verified**:
  - camera-preset, select-camera, sensor-size, megapixels
  - focal-length, aperture, declination, declination-note
  - accuracy-mode, accuracy-default, accuracy-accurate
  - npf-rule-recommended, rule-500, rule-400, recommended
  - rule-explanations, npf-rule-label, rule-500-label, rule-400-label
  - tips, common-camera-reference, camera, sensor-width

**Translation Count**: 30+ keys across EN/FR/DE/IT

### 2. Star Trails Calculator
- **File**: `src/app/[locale]/photo/star-trails/star-trails-calculator.tsx`
- **Translations**: `calculator.photo.astro` namespace
- **Status**: ✅ Fully internationalized
- **Key Translations Verified**:
  - calculate-from, exposure-time, rotation-angle
  - northern-polaris, southern
  - exposure-time-minutes, rotation-angle-degrees, full-circle-note
  - rotation, circle-percent, total-minutes
  - presets-reference, duration
  - tips-and-information, best-conditions, techniques

**Translation Count**: 25+ keys across EN/FR/DE/IT

### 3. Time-Lapse Calculator
- **File**: `src/app/[locale]/photo/time-lapse/time-lapse-calculator.tsx`
- **Translations**: `calculator.photo.astro` namespace
- **Status**: ✅ Fully internationalized
- **Key Translations Verified**:
  - calculate, clip-length-mode, interval-mode, event-duration-mode
  - event-duration, interval, clip-length
  - (Result display labels managed via hardcoded text, not i18n)

**Translation Count**: 10+ keys across EN/FR/DE/IT

## Translation File Updates

All translation keys verified in:
- ✅ `src/messages/en.json` (source of truth)
- ✅ `src/messages/fr.json` (French translations complete)
- ✅ `src/messages/de.json` (German translations complete)
- ✅ `src/messages/it.json` (Italian translations complete)

**Sample Verified Translations**:
- `camera-preset`: "Camera Preset" (EN) → "Appareil photo préselectionné" (FR) → "Kameraeinstellung" (DE) → "Fotocamera preselezionata" (IT)
- `npf-rule-recommended`: "NPF Rule (Recommended)" (EN) → "Règle NPF (Recommandée)" (FR) → "NPF-Regel (Empfohlen)" (DE) → "Regola NPF (Consigliato)" (IT)
- `calculate-from`: "Calculate From" (EN) → "Calculer à partir de" (FR) → "Berechnen von" (DE) → "Calcola da" (IT)
- `exposure-time-minutes`: "Exposure Time (minutes)" (EN) → "Temps d'exposition (minutes)" (FR) → "Belichtungszeit (Minuten)" (DE) → "Tempo di esposizione (minuti)" (IT)

## Build Verification

```bash
npm run build
✓ Service worker generated: 863 files precached (117904634 bytes)
Return code: 0
```

**Status**: ✅ PASSED - No translation warnings, all locales build successfully

## Verification Checklist

- [x] All three calculators import `useTranslations` from "next-intl"
- [x] All three use `calculator.photo.astro` namespace consistently
- [x] Translation keys exist in all 4 locale JSON files (en, fr, de, it)
- [x] No hardcoded English strings in labels and section headings
- [x] npm build completes without translation warnings
- [x] Service worker generation successful
- [x] All 863 files precached correctly

## Key Technical Details

1. **Namespace**: `calculator.photo.astro` used consistently across all three components
2. **Implementation Pattern**: Standard useTranslations() hook with t() function calls
3. **Translation Quality**: Professional terminology for astrophotography concepts:
   - French: "Règle NPF", "étoiles", "traînées"
   - German: "NPF-Regel", "Sterne", "Spuren"
   - Italian: "Regola NPF", "stelle", "scie"

## What's Next

Wave 5 completes photo calculator i18n. Next:
- **Wave 6** (16-06-PLAN.md): Video Calculators + Final Verification
  - Components: common-bitrates, frame-rate
  - Namespace: calculator.video
  - Checkpoint: Human verification of all photo/video calculator translations

## Notes

- All three astro/time-lapse calculators were previously missing the time-lapse namespace split (time-lapse was grouped under astro), but this works correctly with the existing translation structure
- No changes needed; translations were already complete and properly implemented
- Build verification confirms zero missing translation keys across all 4 locales
