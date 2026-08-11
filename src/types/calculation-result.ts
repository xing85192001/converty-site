/**
 * Discriminated union result type for all calculator functions.
 * Replaces `T | null` to carry typed error information on failure.
 *
 * @example
 * // Success path
 * return { ok: true, value: result };
 *
 * // Failure path
 * return { ok: false, error: "Weight must be positive", code: "INVALID_INPUT" };
 */
export type CalculationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code: string };
