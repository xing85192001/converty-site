# Messages Directory (Translations)

JSON translation files for all 4 supported locales.

## Files

| File | Language | Status |
|------|----------|--------|
| `en.json` | English | Source of truth |
| `fr.json` | French | Translated |
| `de.json` | German | Translated |
| `it.json` | Italian | Translated |

## Structure

Four stable top-level namespaces (as of Phase 46 / ADR-012):

```json
{
  "common": {
    "siteName": "Converty",
    "tagline": "Free online calculators",
    "backTo": "Back to {category}",
    "calculate": "Calculate",
    "clear": "Clear",
    "copy": "Copy",
    "validation": {
      "required": "This field is required",
      "invalidNumber": "Please enter a valid number"
    },
    "metadata": {
      "title": "Converty — Free Online Calculators",
      "description": "..."
    }
  },

  "nav": {
    "health": {
      "name": "Health",
      "description": "Health and fitness calculators"
    },
    "finance": { "name": "Finance", "description": "..." },
    "math": { "name": "Math", "description": "..." },
    "subcategories": {
      "basic": "Basic",
      "advanced": "Advanced"
    }
  },

  "converter": {
    "bmi": {
      "name": "BMI",
      "description": "Calculate your Body Mass Index",
      "metaDescription": "SEO-optimized description for search engines"
    },
    "compound-interest": { "name": "...", "description": "..." }
  },

  "calculator": {
    "labels": {
      "weight": "Weight",
      "height": "Height",
      "amount": "Amount",
      "rate": "Interest Rate"
    },
    "results": {
      "result": "Result",
      "total": "Total",
      "monthly": "Monthly"
    },
    "health": {
      "bmiCategory": "BMI Category",
      "underweight": "Underweight"
    },
    "finance": {
      "principal": "Principal",
      "interest": "Interest"
    }
  }
}
```

**Namespace semantics:**

| Namespace | Purpose |
|-----------|---------|
| `common` | Shared UI text, validation messages, site metadata |
| `nav` | Category names/descriptions for navigation; subcategory labels |
| `converter` | Calculator tool metadata: name, description, SEO description |
| `calculator` | Calculator-specific labels, results, domain content |

## Key Naming Conventions

1. **Converter keys**: Use kebab-case matching registry `id`
   - Registry: `{ id: "compound-interest", ... }`
   - Translation: `"compound-interest": { "name": "..." }`

2. **Labels**: Use camelCase within sections
   - `"calculator.labels.interestRate"`

3. **Nested sections**: Group by feature area
   - `"calculator.health.bmiCategory"`
   - `"calculator.finance.principal"`

## Adding New Translations

### For a New Calculator

1. Add to `en.json`:

```json
{
  "converter": {
    "new-calculator": {
      "name": "New Calculator",
      "description": "Short description for listing",
      "metaDescription": "Longer SEO description for meta tags"
    }
  }
}
```

1. Copy structure to `fr.json`, `de.json`, `it.json` and translate

### For Calculator-Specific Labels

Add under `calculator.[category]`:

```json
{
  "calculator": {
    "health": {
      "newLabel": "New Label"
    }
  }
}
```

## Interpolation

Use `{variable}` for dynamic values:

```json
{
  "common": {
    "backTo": "Back to {category}"
  }
}
```

Usage:

```typescript
t("common.backTo", { category: categoryName })
```

## Pluralization

Use ICU message format:

```json
{
  "results": {
    "items": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
  }
}
```

## Validation Checklist

Before committing translations:

- [ ] All 4 locale files have the same keys
- [ ] Keys match registry IDs (kebab-case)
- [ ] No placeholder text (e.g., "TODO", "TRANSLATE")
- [ ] Interpolation variables match across locales
