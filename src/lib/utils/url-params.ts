import { z } from "zod";

/**
 * Type-safe URL parameter parsing utilities
 *
 * These helpers provide safe parsing of URL parameters with fallback values,
 * preventing NaN propagation and runtime errors.
 *
 * @example Basic usage with URLSearchParams
 * ```typescript
 * const searchParams = new URLSearchParams(window.location.search);
 * const amount = parseNumberParam(searchParams.get("amount"), 100);
 * const name = parseStringParam(searchParams.get("name"), "default");
 * const enabled = parseBooleanParam(searchParams.get("enabled"), false);
 * ```
 *
 * @example Edge case handling
 * ```typescript
 * // Number parsing
 * parseNumberParam("123", 0);      // -> 123
 * parseNumberParam("abc", 0);      // -> 0 (NaN fallback)
 * parseNumberParam("", 100);       // -> 100 (empty fallback)
 * parseNumberParam(null, 50);      // -> 50 (null fallback)
 *
 * // String parsing
 * parseStringParam("hello", "default");  // -> "hello"
 * parseStringParam("", "default");       // -> "default" (empty fallback)
 * parseStringParam(null, "default");     // -> "default" (null fallback)
 *
 * // Boolean parsing
 * parseBooleanParam("true", false);   // -> true
 * parseBooleanParam("1", false);      // -> true
 * parseBooleanParam("yes", false);    // -> false (only 'true' and '1' are truthy)
 * parseBooleanParam("", true);        // -> true (empty fallback)
 * parseBooleanParam(null, false);     // -> false (null fallback)
 * ```
 */

/**
 * Parse a URL parameter as a number with fallback
 *
 * @param value - The URL parameter value (typically from URLSearchParams.get())
 * @param fallback - The fallback value to use if parsing fails
 * @returns The parsed number or fallback if value is null, empty, or not a valid number
 *
 * @example
 * const searchParams = new URLSearchParams(window.location.search);
 * const amount = parseNumberParam(searchParams.get("amount"), 100);
 * // Returns 100 if "amount" param is missing or invalid
 */
export function parseNumberParam(value: string | null, fallback: number): number {
  if (value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return parsed;
}

/**
 * Parse a URL parameter as a string with fallback
 *
 * @param value - The URL parameter value (typically from URLSearchParams.get())
 * @param fallback - The fallback value to use if value is null or empty
 * @returns The parameter value or fallback if value is null or empty string
 *
 * @example
 * const searchParams = new URLSearchParams(window.location.search);
 * const name = parseStringParam(searchParams.get("name"), "default");
 * // Returns "default" if "name" param is missing or empty
 */
export function parseStringParam(value: string | null, fallback: string): string {
  if (value === null || value === "") {
    return fallback;
  }

  return value;
}

/**
 * Parse a URL parameter as a boolean with fallback
 *
 * @param value - The URL parameter value (typically from URLSearchParams.get())
 * @param fallback - The fallback value to use if value is null or empty
 * @returns true if value is "true" or "1", false otherwise, or fallback if null/empty
 *
 * @example
 * const searchParams = new URLSearchParams(window.location.search);
 * const enabled = parseBooleanParam(searchParams.get("enabled"), false);
 * // Returns true if "enabled=true" or "enabled=1", false for other values
 */
export function parseBooleanParam(value: string | null, fallback: boolean): boolean {
  if (value === null || value === "") {
    return fallback;
  }

  return value === "true" || value === "1";
}

/**
 * Extract all URL parameters as a Map for safe property access
 *
 * Server-side safe: Returns empty Map when window is undefined
 *
 * Security: Uses Map instead of Object to eliminate prototype pollution risk.
 * Map has no prototype chain, so __proto__, constructor, and prototype keys
 * are safely stored as regular entries without affecting the object prototype.
 *
 * @returns Map with parameter names as keys and values as strings
 *
 * @example
 * // URL: ?amount=100&currency=USD&enabled=true
 * const params = getUrlParams();
 * // Returns: Map { "amount" => "100", "currency" => "USD", "enabled" => "true" }
 *
 * // Use with type-safe parsing helpers:
 * const amount = parseNumberParam(params.get("amount"), 0);
 * const currency = parseStringParam(params.get("currency"), "USD");
 * const enabled = parseBooleanParam(params.get("enabled"), false);
 */
export function getUrlParams(): Map<string, string> {
  // Server-side rendering safety
  if (typeof window === "undefined") return new Map();

  const params = new Map<string, string>();
  const searchParams = new URLSearchParams(window.location.search);

  // Convert URLSearchParams to Map
  // Defense-in-depth: Filter dangerous property names even though Map is safe
  searchParams.forEach((value, key) => {
    if (key !== "__proto__" && key !== "constructor" && key !== "prototype") {
      params.set(key, value);
    }
  });

  return params;
}

/**
 * Parse a URL parameter as a number using Zod coercion with fallback.
 * Handles edge cases (NaN, Infinity, empty string) via z.coerce.number().
 *
 * @param value - The URL parameter value (from URLSearchParams.get())
 * @param fallback - The fallback value if parsing fails
 * @returns Parsed number or fallback
 */
export function parseZodNumberParam(value: string | null, fallback: number): number {
  if (value === null || value === "") return fallback;
  const result = z.coerce.number().safeParse(value);
  return result.success ? result.data : fallback;
}

/**
 * Parse a URL parameter as a boolean using Zod coercion with fallback.
 *
 * @param value - The URL parameter value (from URLSearchParams.get())
 * @param fallback - The fallback value if parsing fails
 * @returns Parsed boolean or fallback
 */
export function parseZodBooleanParam(value: string | null, fallback: boolean): boolean {
  if (value === null || value === "") return fallback;
  const result = z.coerce.boolean().safeParse(value);
  return result.success ? result.data : fallback;
}

/**
 * Parse a URL parameter as a string using Zod with fallback.
 * Trims empty strings to fallback.
 *
 * @param value - The URL parameter value (from URLSearchParams.get())
 * @param fallback - The fallback value if value is null or empty
 * @returns Parsed string or fallback
 */
export function parseZodStringParam(value: string | null, fallback: string): string {
  if (value === null || value === "") return fallback;
  const result = z.string().min(1).safeParse(value);
  return result.success ? result.data : fallback;
}
