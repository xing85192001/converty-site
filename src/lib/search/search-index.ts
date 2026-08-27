import Fuse, { type IFuseOptions } from "fuse.js";
import type { SearchDocument } from "./search-data";

/**
 * Fuse.js search options with weighted keys.
 */
const fuseOptions: IFuseOptions<SearchDocument> = {
  keys: [
    { name: "name", weight: 0.4 },
    { name: "description", weight: 0.2 },
    { name: "keywords", weight: 0.3 },
    { name: "categoryName", weight: 0.1 },
  ],
  threshold: 0.4, // Balance between exact and fuzzy
  includeScore: true,
  ignoreLocation: true, // Don't penalize matches at end of string
  minMatchCharLength: 2,
};

// Singleton cache
let fuseInstance: Fuse<SearchDocument> | null = null;
let loadedLocale: string | null = null;

interface SearchIndexData {
  documents: SearchDocument[];
  // biome-ignore lint/suspicious/noExplicitAny: Fuse.js index serialization format
  index: any;
}

/**
 * Get or create Fuse.js search instance for the given locale.
 * Lazy-loads the search index on first use.
 */
export async function getSearchInstance(locale: string): Promise<Fuse<SearchDocument>> {
  // Return cached instance if locale matches
  if (fuseInstance && loadedLocale === locale) {
    return fuseInstance;
  }

  // Fetch search index for locale
  const response = await fetch(`/search/index-${locale}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load search index for locale: ${locale}`);
  }

  const data: SearchIndexData = await response.json();

  // Parse the pre-built index and create Fuse instance
  const index = Fuse.parseIndex<SearchDocument>(data.index);
  // biome-ignore lint/suspicious/noExplicitAny: Fuse.js index type compatibility
  fuseInstance = new Fuse(data.documents, fuseOptions, index as any);
  loadedLocale = locale;

  return fuseInstance;
}

/**
 * Search for calculators matching the query.
 * Returns up to 10 results.
 */
export function search(query: string, fuse: Fuse<SearchDocument>): SearchDocument[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const results = fuse.search(trimmed, { limit: 10 });
  return results.map((result) => result.item);
}
