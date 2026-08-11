# Task Completion Checklist

## Before Committing

### 1. Code Quality

- [ ] Run `npm run lint -- path/to/file.tsx` after EACH file change
- [ ] Run `npm run check:fix` to fix Biome issues
- [ ] Run `npm run type-check` for TypeScript errors
- [ ] Ensure no hardcoded English strings in components

**Per-file linting workflow**: Always lint individual files immediately after editing:

```bash
npm run lint -- src/app/[locale]/finance/loan/loan-calculator.tsx
```

This catches issues early before they accumulate across multiple files.

### 2. Translations (for new/modified calculators)

- [ ] Add translations to ALL 4 locale files (en, fr, de, it)
- [ ] Use kebab-case keys matching registry ID
- [ ] Include: name, description, metaDescription
- [ ] Add calculator-specific labels to `calculator` section
- [ ] Use `useTranslations()` in component, not hardcoded strings

### 3. Build Verification

- [ ] Run `npm run build` - must complete successfully
- [ ] Verify pages generated for all 4 locales

### 4. New Calculator Checklist

- [ ] Create calculation logic in `src/lib/converters/[category]/[name].ts`
- [ ] Export Input/Output interfaces
- [ ] Register in `src/lib/registry/converters.ts`
- [ ] Add translations to all 4 locale files
- [ ] Create calculator component (use Zustand, not useConverter)
- [ ] Create page.tsx with `generateStaticParams()`
- [ ] Use `setRequestLocale(locale)` in page component

### 5. Git

- [ ] Stage only relevant files
- [ ] Write descriptive commit message
- [ ] Include Co-Authored-By for Claude
