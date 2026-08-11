# Phase 16 Research: Translation Implementation

**Date:** 2026-01-22
**Confidence:** HIGH (verified via codebase analysis)

## Executive Summary

**Critical Finding:** The i18n implementation is approximately **55% complete**, not 98% as previously reported. There are **14 calculator components with zero i18n support** and **200+ hardcoded English strings** across the codebase.

## Detailed Findings

### 1. Photo Category - Major Gaps (12 of 22 calculators missing i18n)

**Components WITHOUT any i18n (no `useTranslations` import):**

| Calculator | File | Estimated Strings |
|------------|------|-------------------|
| Advanced DoF | `photo/advanced-dof/advanced-dof-calculator.tsx` | ~25 |
| Circle of Confusion | `photo/circle-of-confusion/circle-of-confusion-calculator.tsx` | ~30 |
| Diffraction | `photo/diffraction/diffraction-calculator.tsx` | ~20 |
| DoF Table | `photo/dof-table/dof-table-calculator.tsx` | ~15 |
| Focal Equivalent | `photo/focal-equivalent/focal-equivalent-calculator.tsx` | ~20 |
| Hyperfocal | `photo/hyperfocal/hyperfocal-calculator.tsx` | ~25 |
| Macro DoF | `photo/macro-dof/macro-dof-calculator.tsx` | ~25 |
| Macro Diffraction | `photo/macro-diffraction/macro-diffraction-calculator.tsx` | ~30 |
| ND Filter | `photo/nd-filter/nd-filter-calculator.tsx` | ~20 |
| Spot Stars | `photo/spot-stars/spot-stars-calculator.tsx` | ~20 |
| Star Trails | `photo/star-trails/star-trails-calculator.tsx` | ~20 |
| Time-lapse | `photo/time-lapse/time-lapse-calculator.tsx` | ~25 |

**Components WITH i18n but missing keys:**

| Calculator | File | Issue |
|------------|------|-------|
| Sun Position | `photo/sun-position/sun-position-calculator.tsx` | Uses keys that don't exist: `calculator.results.sunPosition`, `calculator.results.altitude`, `calculator.results.azimuth`, `calculator.results.sunTimes`, `calculator.results.sunrise`, `calculator.results.solarNoon`, `calculator.results.sunset`, `calculator.photo.goldenBlueHour`, `calculator.photo.twilight`, `calculator.photo.lightPhases`, `calculator.results.currentPhase`. Also has hardcoded: "Morning Golden Hour", "Evening Golden Hour", "Morning Blue Hour", "Evening Blue Hour", "Civil Twilight", "Nautical Twilight", "Astronomical Twilight" |
| Golden Hour Guide | `photo/golden-hour/golden-hour-guide.tsx` | No useTranslations import. ~50 hardcoded strings including geolocation errors, button labels, section headings |

### 2. Video Category - Gaps (2 of 9 calculators missing i18n)

**Components WITHOUT any i18n:**

| Calculator | File | Estimated Strings |
|------------|------|-------------------|
| Common Bitrates | `video/common-bitrates/common-bitrates-viewer.tsx` | ~10 (table headers, filter label) |
| Frame Rate | `video/frame-rate/frame-rate-converter.tsx` | ~15 (labels, section titles, FFmpeg commands) |

### 3. String Categories Identified

**Labels & Headings (~100 strings):**
- Form labels: "Aperture", "Focal Length", "Sensor Size", "Subject Distance"
- Section headings: "Camera Settings", "Viewing Conditions", "Results"
- Card titles: "Sun Position", "Golden Hour & Blue Hour"

**Result Labels (~50 strings):**
- "Total Depth of Field", "Near Limit", "Far Limit"
- "Hyperfocal Distance", "Airy Disk", "Pixel Pitch"
- "Effective Aperture", "Light Loss"

**Table Headers (~30 strings):**
- "Sensor", "Size (mm)", "Standard CoC"
- "Aperture", "Near Limit", "Twilight Phase"

**Descriptive/Explanatory Text (~40 strings):**
- "in front", "behind", "sensor to print"
- Formula explanations, usage tips

**Error Messages (~10 strings):**
- Geolocation errors in golden-hour-guide.tsx

**Button/Action Text (~15 strings):**
- "Use My Location", "Enter Manually", "Enable Location"

### 4. Translation Key Namespace Analysis

Current namespaces in use:
- `calculator.labels` - Generic form labels
- `calculator.results` - Result display labels
- `calculator.photo` - Photo-specific terms
- `calculator.video` - Video-specific terms
- `calculator.math` - Math-specific terms

**Recommended new keys needed:**
- `calculator.photo.dof` - Depth of field terms
- `calculator.photo.diffraction` - Diffraction terms
- `calculator.photo.macro` - Macro photography terms
- `calculator.photo.astro` - Astrophotography terms (star trails, spot stars)
- `calculator.photo.sun` - Sun position/golden hour terms
- `calculator.common.errors` - Error messages

### 5. Implementation Strategy

**Wave 1 - High Priority (user-facing display issues):**
1. Fix sun-position-calculator.tsx missing keys (currently showing raw keys to users)
2. Add i18n to golden-hour-guide.tsx (complex component, many strings)

**Wave 2 - Photo calculators batch 1 (6 calculators):**
3. advanced-dof, circle-of-confusion, diffraction
4. dof-table, focal-equivalent, hyperfocal

**Wave 3 - Photo calculators batch 2 (6 calculators):**
5. macro-dof, macro-diffraction, nd-filter
6. spot-stars, star-trails, time-lapse

**Wave 4 - Video + Verification:**
7. common-bitrates, frame-rate
8. Full verification across all locales

### 6. Estimated Effort

| Task | Files | New Keys | Effort |
|------|-------|----------|--------|
| Fix sun-position missing keys | 1 | ~15 | Small |
| Add i18n to golden-hour-guide | 1 | ~50 | Medium |
| Photo batch 1 (6 calculators) | 6 | ~120 | Large |
| Photo batch 2 (6 calculators) | 6 | ~140 | Large |
| Video calculators | 2 | ~25 | Small |
| Translate FR/DE/IT | 4 | ~350 each | Large |
| Verification | - | - | Medium |

**Total new translation keys:** ~350 in en.json
**Total translations needed:** ~1400 (350 × 4 locales)

### 7. Technical Considerations

1. **Fallback Pattern:** Many components use `t("key") || "Fallback"` - this hides missing keys. Should use `t("key")` only.

2. **Component Structure:** Some calculators have sub-components (golden-hour has CameraSettingsCards, ColorTemperatureTable, etc.) that may also need i18n.

3. **Dynamic Content:** Some strings come from lib/converters files (e.g., `COMMON_MAGNIFICATIONS[].description`). These should use translation keys, not hardcoded descriptions.

4. **Build Validation:** `npm run build` will catch missing keys at build time since next-intl throws on missing translations in production mode.

## Open Questions

1. Should we translate technical photography terms (CoC, DoF, Airy Disk) or keep them as universal abbreviations?
2. Should formula explanations be translated or kept in English for technical accuracy?

## Conclusion

Phase 16 requires significantly more work than initially estimated. The scope includes:
- 14 calculator components needing full i18n migration
- ~350 new translation keys in en.json
- ~1050 translations (FR + DE + IT)
- Verification across all 4 locales

Recommend splitting into multiple plans with clear wave structure.
