# Phase 14: Global Search - Research

**Researched:** 2026-01-22
**Domain:** Client-side search, command palettes, Next.js static sites
**Confidence:** HIGH

## Summary

This research investigates how to implement fast calculator discovery across Converty's 200+ calculator suite. The project requires a global search accessible from all pages with real-time results as users type, supporting 4 locales (en, fr, de, it).

Key findings:

- **cmdk is already installed** - The project has cmdk 1.1.1 and a shadcn-style Command component in place
- **Fuse.js is the optimal search library** - Best fuzzy matching, smallest bundle, excellent for ~200 items
- **Pre-built indexes per locale** - Generate search data at build time as JSON files
- **Command palette pattern** - Use Command.Dialog with Cmd+K keyboard shortcut

**Primary recommendation:** Use Fuse.js for fuzzy search with pre-built locale-specific indexes, presented via the existing cmdk Command component in a dialog triggered by Cmd+K.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cmdk | 1.1.1 | Command palette UI | Already installed; powers Linear, Raycast, Vercel command palettes |
| fuse.js | 7.x | Fuzzy search | Most popular (5M+ weekly downloads), smallest bundle (~4-6 kB gzip), perfect for <1000 items |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | (via cmdk) | Accessible dialog | Already bundled with cmdk for Command.Dialog |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fuse.js | FlexSearch | FlexSearch is faster at scale but overkill for 200 items; larger bundle (16 kB gzip for full) |
| Fuse.js | MiniSearch | Similar capability but less community adoption (10x fewer downloads) |
| Fuse.js | cmdk built-in | cmdk has basic filtering but no fuzzy matching for typos |
| cmdk | kbar | kbar is heavier with more features not needed here |

**Installation:**

```bash
npm install fuse.js
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── search/
│       ├── global-search.tsx      # Main search component with Command.Dialog
│       ├── search-provider.tsx    # Context for search state
│       └── search-result-item.tsx # Individual result rendering
├── lib/
│   └── search/
│       ├── search-index.ts        # Fuse.js initialization & search logic
│       └── search-data.ts         # Types for search documents
└── hooks/
    └── use-search.ts              # React hook for search functionality
public/
└── search/
    ├── index-en.json              # Pre-built English search index
    ├── index-fr.json              # Pre-built French search index
    ├── index-de.json              # Pre-built German search index
    └── index-it.json              # Pre-built Italian search index
scripts/
└── generate-search-index.ts       # Build-time script to generate indexes
```

### Pattern 1: Search Data Structure

**What:** Define searchable document structure combining registry and translations
**When to use:** Building the search index for each locale

```typescript
// src/lib/search/search-data.ts
export interface SearchDocument {
  id: string;           // Registry ID (e.g., "bmi")
  slug: string;         // URL slug
  category: string;     // Category ID
  categoryName: string; // Translated category name
  name: string;         // Translated calculator name
  description: string;  // Translated description
  keywords: string[];   // From registry
  href: string;         // Full path e.g., "/health/bmi"
}
```

### Pattern 2: Pre-built Index Generation

**What:** Generate search indexes at build time, one per locale
**When to use:** As part of the build process (npm run build)

```typescript
// scripts/generate-search-index.ts
import Fuse from 'fuse.js';
import { converters } from '../src/lib/registry/converters';
import en from '../src/messages/en.json';
// ... import other locales

const locales = { en, fr, de, it };

for (const [locale, messages] of Object.entries(locales)) {
  const documents = converters.map(converter => ({
    id: converter.id,
    slug: converter.slug,
    category: converter.category,
    categoryName: messages.categories[converter.category]?.name || '',
    name: messages.converters[converter.id]?.name || '',
    description: messages.converters[converter.id]?.description || '',
    keywords: converter.keywords,
    href: `/${converter.category}/${converter.slug}`,
  }));

  // Create and serialize index
  const index = Fuse.createIndex(
    ['name', 'description', 'keywords', 'categoryName'],
    documents
  );

  fs.writeFileSync(
    `./public/search/index-${locale}.json`,
    JSON.stringify({ documents, index: index.toJSON() })
  );
}
```

### Pattern 3: Lazy Index Loading with Fuse.js

**What:** Load search index on-demand when user opens search
**When to use:** Client-side search initialization

```typescript
// src/lib/search/search-index.ts
import Fuse, { type IFuseOptions } from 'fuse.js';
import type { SearchDocument } from './search-data';

const fuseOptions: IFuseOptions<SearchDocument> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'description', weight: 0.2 },
    { name: 'keywords', weight: 0.3 },
    { name: 'categoryName', weight: 0.1 },
  ],
  threshold: 0.4,        // 0 = exact, 1 = match anything
  includeScore: true,
  ignoreLocation: true,  // Don't penalize matches at end of string
  minMatchCharLength: 2,
};

let fuseInstance: Fuse<SearchDocument> | null = null;
let loadedLocale: string | null = null;

export async function getSearchInstance(locale: string): Promise<Fuse<SearchDocument>> {
  if (fuseInstance && loadedLocale === locale) {
    return fuseInstance;
  }

  const response = await fetch(`/search/index-${locale}.json`);
  const { documents, index } = await response.json();

  const parsedIndex = Fuse.parseIndex(index);
  fuseInstance = new Fuse(documents, fuseOptions, parsedIndex);
  loadedLocale = locale;

  return fuseInstance;
}

export function search(query: string, fuse: Fuse<SearchDocument>): SearchDocument[] {
  if (!query.trim()) return [];
  return fuse.search(query, { limit: 10 }).map(result => result.item);
}
```

### Pattern 4: Command Dialog with Keyboard Shortcut

**What:** Global search UI with Cmd+K activation
**When to use:** Main search component in header

```typescript
// src/components/search/global-search.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getSearchInstance, search } from "@/lib/search/search-index";
import type { SearchDocument } from "@/lib/search/search-data";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDocument[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchDocument> | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common");

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load search index when dialog opens
  useEffect(() => {
    if (open && !fuse) {
      getSearchInstance(locale).then(setFuse);
    }
  }, [open, locale, fuse]);

  // Search when query changes
  useEffect(() => {
    if (fuse && query) {
      setResults(search(query, fuse));
    } else {
      setResults([]);
    }
  }, [query, fuse]);

  const handleSelect = useCallback((doc: SearchDocument) => {
    router.push(`/${locale}${doc.href}`);
    setOpen(false);
    setQuery("");
  }, [router, locale]);

  return (
    <>
      {/* Trigger button in header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground..."
      >
        <Search className="h-4 w-4" />
        <span>{t("search")}</span>
        <kbd className="...">⌘K</kbd>
      </button>

      {/* Search dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={t("search")}
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading={t("calculators")}>
              {results.map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={doc.id}
                  onSelect={() => handleSelect(doc)}
                >
                  <span className="font-medium">{doc.name}</span>
                  <span className="text-muted-foreground">{doc.categoryName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

### Anti-Patterns to Avoid

- **Loading all locales at once:** Only load the current locale's search index
- **Rebuilding index on every search:** Use pre-built indexes loaded once
- **Showing too many results:** Limit to 8-12 results for clean UX
- **Searching on every keystroke:** Use debouncing (150-300ms) for smoother experience
- **Forgetting accessibility:** Use cmdk's built-in accessibility, don't bypass it

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy string matching | Custom matching algorithm | Fuse.js | Bitap algorithm handles typos, partial matches, Unicode properly |
| Command palette UI | Custom modal with keyboard nav | cmdk | Accessibility, keyboard handling, focus management already solved |
| Search index | In-memory filtering of converters | Pre-built JSON indexes | Faster load, includes translations, cacheable |
| Keyboard shortcut detection | Custom keydown handler | cmdk's built-in pattern | Handles meta key differences (Cmd vs Ctrl) |

**Key insight:** The hard parts of search are fuzzy matching algorithm quality and accessible keyboard navigation. Both are solved by Fuse.js and cmdk respectively.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with Dialog

**What goes wrong:** Dialog open state differs between server and client, causing React hydration errors
**Why it happens:** Server renders with open=undefined, client may have different initial state
**How to avoid:** Always initialize dialog open state as `false` and only open via client-side effects
**Warning signs:** Console errors about hydration mismatch; content flash on page load

### Pitfall 2: Loading Index Before Needed

**What goes wrong:** Blocking initial page load by eagerly fetching search index
**Why it happens:** Loading index on component mount instead of on search open
**How to avoid:** Lazy load index only when user opens search dialog (first open)
**Warning signs:** Slow First Contentful Paint; network waterfall shows index loading early

### Pitfall 3: Missing Locale Sync

**What goes wrong:** Search returns English results when user is viewing French site
**Why it happens:** Using wrong locale for index loading or not reloading on locale change
**How to avoid:** Track loaded locale, reload index when locale changes
**Warning signs:** Search results don't match current language

### Pitfall 4: cmdk shouldFilter Confusion

**What goes wrong:** Using Fuse.js but cmdk still applies its own filtering, double-filtering results
**Why it happens:** cmdk has built-in filtering enabled by default
**How to avoid:** Set `shouldFilter={false}` on Command component when using external search
**Warning signs:** Fewer results than expected; results filtered incorrectly

### Pitfall 5: Missing Keywords in Search

**What goes wrong:** User can't find calculator despite knowing its name
**Why it happens:** Only indexing name, not keywords or description
**How to avoid:** Index multiple fields: name, description, keywords, category
**Warning signs:** "BMI" search doesn't find "Body Mass Index" calculator

## Code Examples

Verified patterns from official sources:

### Fuse.js Pre-indexing (Build Time)

```typescript
// Source: https://www.fusejs.io/api/indexing.html
import Fuse from 'fuse.js';

// Build step: Create and serialize index
const documents = [...]; // Your searchable data
const myIndex = Fuse.createIndex(['name', 'description', 'keywords'], documents);
fs.writeFileSync('search-index.json', JSON.stringify({
  documents,
  index: myIndex.toJSON()
}));

// Runtime: Load and parse index
const data = await fetch('/search-index.json').then(r => r.json());
const parsedIndex = Fuse.parseIndex(data.index);
const fuse = new Fuse(data.documents, options, parsedIndex);
```

### cmdk Custom Filtering

```typescript
// Source: https://github.com/dip/cmdk
<Command shouldFilter={false}>
  <CommandInput
    value={query}
    onValueChange={setQuery}
  />
  <CommandList>
    {/* Pre-filtered results from Fuse.js */}
    {results.map(item => (
      <CommandItem key={item.id} value={item.id}>
        {item.name}
      </CommandItem>
    ))}
  </CommandList>
</Command>
```

### Keyboard Shortcut Pattern

```typescript
// Source: https://github.com/dip/cmdk
useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((open) => !open);
    }
  };
  document.addEventListener('keydown', down);
  return () => document.removeEventListener('keydown', down);
}, []);
```

### Debounced Search

```typescript
// Prevent excessive search calls while typing
import { useDeferredValue } from 'react';

function useSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    if (!fuse || !deferredQuery) return [];
    return fuse.search(deferredQuery, { limit: 10 });
  }, [fuse, deferredQuery]);

  return { query, setQuery, results };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side search API | Client-side with pre-built index | 2020+ | Static sites can have fast search without backend |
| elasticlunr | Fuse.js / FlexSearch | 2022+ | Better fuzzy matching, smaller bundles |
| Custom modal dialogs | cmdk / kbar | 2022 | Accessible, keyboard-first command palettes |
| Load all data upfront | Lazy load on first search | 2023+ | Better Core Web Vitals |

**Deprecated/outdated:**

- elasticlunr: Minimal maintenance, superseded by more modern libraries
- Custom regex matching: Fuse.js Bitap algorithm is more robust for fuzzy search
- Server-side only search: Client-side search is now viable for small-medium datasets

## Integration Points

### Header Integration

The GlobalSearch component should be added to the existing header:

```typescript
// src/components/layout/header.tsx (modified)
import { GlobalSearch } from "@/components/search/global-search";

export function Header() {
  return (
    <header>
      <div className="container flex h-14 items-center">
        <Link href="/" ...>...</Link>
        <nav ...>...</nav>

        {/* Add search between nav and controls */}
        <div className="flex-1 mx-4">
          <GlobalSearch />
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <LanguageSwitcher />
          <ThemeToggle />
          ...
        </div>
      </div>
    </header>
  );
}
```

### Build Script Integration

Add to package.json:

```json
{
  "scripts": {
    "prebuild": "tsx scripts/generate-search-index.ts",
    "build": "next build && node scripts/generate-sw.js"
  }
}
```

### URL Search Parameter (Optional Enhancement)

For shareable search URLs:

```typescript
// In GlobalSearch component
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const initialQuery = searchParams.get('q') || '';

// Update URL on search
const updateUrl = (query: string) => {
  const params = new URLSearchParams(searchParams);
  if (query) {
    params.set('q', query);
  } else {
    params.delete('q');
  }
  router.replace(`?${params.toString()}`);
};
```

## Open Questions

Things that couldn't be fully resolved:

1. **Search result highlighting**
   - What we know: Fuse.js supports `includeMatches` option to get match indices
   - What's unclear: Best approach for highlighting in cmdk CommandItem
   - Recommendation: Start without highlighting, add later if needed

2. **Mobile search UX**
   - What we know: Cmd+K doesn't work on mobile; need visible trigger button
   - What's unclear: Whether to use same dialog or dedicated mobile search page
   - Recommendation: Use same dialog with visible search button in header for mobile

3. **Search analytics**
   - What we know: Would be useful to track what users search for
   - What's unclear: Privacy-respecting approach for static site
   - Recommendation: Defer to later phase; focus on core search functionality first

## Sources

### Primary (HIGH confidence)

- cmdk GitHub: <https://github.com/dip/cmdk> - Dialog pattern, filtering configuration, keyboard shortcuts
- Fuse.js official docs: <https://www.fusejs.io/> - API, indexing, configuration options
- Fuse.js indexing API: <https://www.fusejs.io/api/indexing.html> - Pre-built index serialization

### Secondary (MEDIUM confidence)

- npm-compare.com: Library comparison with download stats and bundle sizes
- MiniSearch blog: <https://lucaongaro.eu/blog/2019/01/30/minisearch-client-side-fulltext-search-engine.html> - Feature comparison
- FlexSearch GitHub: <https://github.com/nextapps-de/flexsearch> - Performance benchmarks

### Tertiary (LOW confidence)

- Various Medium articles on Next.js + search implementation patterns

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Well-documented libraries with clear community consensus
- Architecture: HIGH - Patterns verified from official docs and real implementations
- Pitfalls: HIGH - Based on documented issues and official recommendations

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable domain)

---

## Implementation Summary

| Component | Technology | Source |
|-----------|------------|--------|
| Search UI | cmdk (already installed) | Existing in project |
| Fuzzy search | Fuse.js | Install required |
| Index storage | Static JSON per locale | Generate at build |
| Keyboard shortcut | Cmd+K / Ctrl+K | cmdk pattern |
| Mobile trigger | Button in header | Custom component |

**Estimated bundle impact:** ~4-6 kB gzipped (Fuse.js only)
**Estimated index size:** ~20-50 kB per locale (depends on description lengths)
