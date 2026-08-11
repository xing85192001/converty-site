/**
 * Search document representing a searchable calculator.
 * Generated at build time from registry + translations.
 */
export interface SearchDocument {
  /** Registry ID (e.g., "bmi") */
  id: string;
  /** URL slug */
  slug: string;
  /** Category ID (e.g., "health") */
  category: string;
  /** Translated category name */
  categoryName: string;
  /** Translated calculator name */
  name: string;
  /** Translated description */
  description: string;
  /** Search keywords from registry */
  keywords: string[];
  /** Full path (e.g., "/health/bmi") */
  href: string;
}
