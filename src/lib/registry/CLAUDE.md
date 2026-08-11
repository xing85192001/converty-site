# Registry Directory

Central metadata for categories and converters.

## Files

### `categories.ts`

Defines all calculator categories with structure and icons.

```typescript
export interface CategoryMeta {
  id: string;           // Unique identifier
  slug: string;         // URL path segment
  name: string;         // Display name (translate in UI)
  description: string;  // Category description
  icon: LucideIcon;     // Lucide icon component
  subcategories?: SubcategoryMeta[];
}

export interface SubcategoryMeta {
  id: string;
  name: string;
}
```

#### Available Categories

| ID | Slug | Calculators |
|----|------|-------------|
| `health` | `health` | 28 |
| `finance` | `finance` | 24 |
| `math` | `math` | 38 |
| `photo` | `photo` | 22 |
| `video` | `video` | 9 |
| `web` | `web` | 10 |
| `data` | `data` | 3 |
| `datetime` | `datetime` | 8 |
| `physics` | `physics` | 1 |
| `music` | `music` | 1 |
| `color` | `color` | 1 |

#### Helper Functions

```typescript
// Get category by slug
getCategoryBySlug("health") // => CategoryMeta | undefined

// Get all categories
getAllCategories() // => CategoryMeta[]

// Get featured categories
getFeaturedCategories() // => CategoryMeta[]
```

### `converters.ts`

Defines all calculator metadata. Note: `name` and `description` come from translations, not the registry.

```typescript
export interface ConverterMeta {
  id: string;           // Unique ID (kebab-case, matches translation key)
  slug: string;         // URL path segment
  category: string;     // Parent category ID
  subcategory?: string; // Optional grouping within category
  keywords: string[];   // Search terms
  icon: LucideIcon;     // Lucide icon component
  featured?: boolean;   // Show on homepage
}
```

#### Helper Functions

```typescript
// Get converter by ID
getConverterById("bmi") // => ConverterMeta | undefined

// Get all converters for a category
getConvertersByCategory("health") // => ConverterMeta[]

// Get featured converters
getFeaturedConverters() // => ConverterMeta[]

// Search converters by keyword
searchConverters("interest") // => ConverterMeta[]
```

## Adding a New Calculator

### 1. Add to `converters.ts`

```typescript
export const converterRegistry: Record<string, ConverterMeta> = {
  // ... existing converters

  "new-calculator": {
    id: "new-calculator",        // kebab-case, unique
    slug: "new-calculator",      // URL segment
    category: "math",            // Must match category ID
    subcategory: "algebra",      // Optional
    keywords: ["new", "calculate", "useful"],
    icon: Calculator,            // Import from lucide-react
    featured: false,
  },
};
```

### 2. Add translations to all locale files

```json
// src/messages/en.json (and fr.json, de.json, it.json)
{
  "converters": {
    "new-calculator": {
      "name": "New Calculator",
      "description": "Calculate something useful",
      "metaDescription": "SEO description for search engines"
    }
  }
}
```

### 3. Add to `categories.ts` (if new category)

```typescript
export const categoryRegistry: Record<string, CategoryMeta> = {
  // ... existing categories

  "new-category": {
    id: "new-category",
    slug: "new-category",
    name: "New Category",
    description: "A new category of calculators",
    icon: FolderIcon,
    subcategories: [
      { id: "sub1", name: "Subcategory 1" },
    ],
  },
};
```

## Key Rules

1. **ID Format**: Always use kebab-case (`compound-interest`, not `compoundInterest`)
2. **ID = Translation Key**: The `id` must match the translation key in messages
3. **Slug = URL**: The `slug` becomes the URL path segment
4. **Category Reference**: `category` must match an existing category `id`
5. **Icons**: Import from `lucide-react`, use PascalCase component names

## Validation

When adding converters, ensure:

- [ ] ID is unique across all converters
- [ ] ID uses kebab-case
- [ ] Category exists in categoryRegistry
- [ ] Translation key matches ID in all 4 locale files
- [ ] Slug matches folder name in `src/app/[locale]/[category]/`
