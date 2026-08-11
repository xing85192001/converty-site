# Translation Naming Conventions

## Calculator Name Simplification (2026-01-19)

Removed "Calculator" and equivalent terms from all calculator names across all 4 locales to reduce visual fatigue when browsing.

### Patterns Removed

| Language | Pattern | Example Before → After |
|----------|---------|------------------------|
| English | " Calculator" suffix | "Download Calculator" → "Download" |
| French | "Calculateur de/d'/du " prefix | "Calculateur de Téléchargement" → "Téléchargement" |
| German | "-Rechner", "rechner", " Rechner" suffix | "Download-Rechner" → "Download" |
| Italian | "Calcolatore di/Calcolatore " prefix | "Calcolatore Download" → "Download" |

### Files Modified

- `src/messages/en.json`
- `src/messages/fr.json`
- `src/messages/de.json`
- `src/messages/it.json`

### Note

When adding new calculators, do NOT include "Calculator" or equivalent in the `name` field. Keep names concise (e.g., "BMI", "Mortgage", "Compound Interest").
