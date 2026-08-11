/**
 * Periodic Table Lookup Functions
 * Search and filter functions for the periodic table reference
 */

import periodicTableData from "@/data/chemistry/periodic-table.json";
import type { Element } from "./types";

// Re-export Element type for convenience
export type { Element };

/**
 * Search filter options
 */
export interface PeriodicTableFilter {
  /** Search query (name, symbol, atomic number) */
  query?: string;
  /** Filter by category */
  category?: string;
  /** Filter by period (row) */
  period?: number;
  /** Filter by group (column) */
  group?: number;
  /** Filter by metal/nonmetal/metalloid */
  metalType?: "metal" | "nonmetal" | "metalloid";
}

/**
 * Search result with highlighting
 */
export interface SearchResult {
  element: Element;
  matchScore: number;
  matchField: "symbol" | "name" | "atomicNumber" | "multiple";
}

/**
 * Get all elements
 */
export function getAllElements(): Element[] {
  return periodicTableData as Element[];
}

/**
 * Get element by atomic number
 */
export function getElementById(atomicNumber: number): Element | null {
  const elements = periodicTableData as Element[];
  return elements.find((e) => e.atomicNumber === atomicNumber) || null;
}

/**
 * Get element by symbol
 */
export function getBySymbol(symbol: string): Element | null {
  const elements = periodicTableData as Element[];
  return elements.find((e) => e.symbol.toLowerCase() === symbol.toLowerCase()) || null;
}

/**
 * Get element by name
 */
export function getByName(name: string): Element | null {
  const elements = periodicTableData as Element[];
  return elements.find((e) => e.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Search elements by query
 */
export function searchElements(query: string): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const elements = periodicTableData as Element[];
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase().trim();

  for (const element of elements) {
    let matchScore = 0;
    let matchField: SearchResult["matchField"] = "name";
    let matches = 0;

    // Check symbol (exact match = highest score)
    if (element.symbol.toLowerCase() === lowerQuery) {
      matchScore = 100;
      matchField = "symbol";
      matches++;
    } else if (element.symbol.toLowerCase().startsWith(lowerQuery)) {
      matchScore = Math.max(matchScore, 80);
      matchField = "symbol";
      matches++;
    }

    // Check name (exact match)
    if (element.name.toLowerCase() === lowerQuery) {
      matchScore = Math.max(matchScore, 95);
      matchField = matches > 0 ? "multiple" : "name";
      matches++;
    } else if (element.name.toLowerCase().startsWith(lowerQuery)) {
      matchScore = Math.max(matchScore, 70);
      matchField = matches > 0 ? "multiple" : "name";
      matches++;
    } else if (element.name.toLowerCase().includes(lowerQuery)) {
      matchScore = Math.max(matchScore, 50);
      matchField = matches > 0 ? "multiple" : "name";
      matches++;
    }

    // Check atomic number
    const atomicStr = element.atomicNumber.toString();
    if (atomicStr === lowerQuery) {
      matchScore = Math.max(matchScore, 90);
      matchField = matches > 0 ? "multiple" : "atomicNumber";
      matches++;
    } else if (atomicStr.startsWith(lowerQuery)) {
      matchScore = Math.max(matchScore, 60);
      matchField = matches > 0 ? "multiple" : "atomicNumber";
      matches++;
    }

    if (matchScore > 0) {
      results.push({ element, matchScore, matchField });
    }
  }

  // Sort by match score (descending)
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

/**
 * Filter elements by criteria
 */
export function filterElements(filter: PeriodicTableFilter): Element[] {
  let elements = periodicTableData as Element[];

  // Filter by query
  if (filter.query) {
    const searchResults = searchElements(filter.query);
    elements = searchResults.map((r) => r.element);
  }

  // Filter by category
  if (filter.category) {
    elements = elements.filter((e) => e.category === filter.category);
  }

  // Filter by period
  if (filter.period !== undefined) {
    elements = elements.filter((e) => e.period === filter.period);
  }

  // Filter by group
  if (filter.group !== undefined) {
    elements = elements.filter((e) => e.group === filter.group);
  }

  // Filter by metal type
  if (filter.metalType) {
    elements = elements.filter((e) => {
      const isMetalCategory = [
        "alkali metal",
        "alkaline earth metal",
        "transition metal",
        "post-transition metal",
        "lanthanide",
        "actinide",
      ].includes(e.category);

      const isNonmetalCategory = ["nonmetal", "noble gas", "halogen"].includes(e.category);

      const isMetalloidCategory = e.category === "metalloid";

      if (filter.metalType === "metal") return isMetalCategory;
      if (filter.metalType === "nonmetal") return isNonmetalCategory;
      if (filter.metalType === "metalloid") return isMetalloidCategory;

      return false;
    });
  }

  return elements;
}

/**
 * Get elements by category
 */
export function getElementsByCategory(category: string): Element[] {
  const elements = periodicTableData as Element[];
  return elements.filter((e) => e.category === category);
}

/**
 * Get elements by period (row)
 */
export function getElementsByPeriod(period: number): Element[] {
  const elements = periodicTableData as Element[];
  return elements.filter((e) => e.period === period);
}

/**
 * Get elements by group (column)
 */
export function getElementsByGroup(group: number): Element[] {
  const elements = periodicTableData as Element[];
  return elements.filter((e) => e.group === group);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const elements = periodicTableData as Element[];
  const categories = new Set(elements.map((e) => e.category));
  return Array.from(categories).sort();
}

/**
 * Get statistics about the periodic table
 */
export function getStatistics() {
  const elements = periodicTableData as Element[];

  const metals = elements.filter((e) =>
    [
      "alkali metal",
      "alkaline earth metal",
      "transition metal",
      "post-transition metal",
      "lanthanide",
      "actinide",
    ].includes(e.category)
  );

  const nonmetals = elements.filter((e) =>
    ["nonmetal", "noble gas", "halogen"].includes(e.category)
  );

  const metalloids = elements.filter((e) => e.category === "metalloid");

  return {
    total: elements.length,
    metals: metals.length,
    nonmetals: nonmetals.length,
    metalloids: metalloids.length,
    categories: getCategories().length,
    periods: 7,
    groups: 18,
  };
}
