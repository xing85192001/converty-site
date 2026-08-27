"use client";

import { decompressFromEncodedURIComponent } from "lz-string";
import { toast } from "sonner";
import type { ZodType } from "zod";
import { create, type StateCreator } from "zustand";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam, parseStringParam } from "@/lib/utils/url-params";
import type { CalculationResult } from "@/types";

/**
 * Calculator store state interface
 * @template T - Input values type
 * @template R - Result type
 */
export interface CalculatorState<T extends object, R> {
  /** Current input values */
  values: T;
  /** Calculated result (null if invalid inputs or calculation failed) */
  result: R | null;
  /** Error message from CalculationResult when ok: false; undefined on success */
  calculationError: string | undefined;
  /** Validation errors by field */
  errors: Partial<Record<keyof T, string>>;
  /** Set a single value */
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Set all values at once */
  setValues: (values: T) => void;
  /** Reset to initial values */
  reset: () => void;
}

/**
 * Options for creating a calculator store
 * @template T - Input values type
 * @template R - Result type
 */
export interface CreateCalculatorStoreOptions<T extends object, R> {
  /** Unique name for URL sync */
  name: string;
  /** Initial values for the calculator */
  initialValues: T;
  /** Calculation function — returns CalculationResult<R> instead of R | null */
  calculate: (values: T) => CalculationResult<R>;
  /** Optional validation function */
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  /** Optional Zod schema for automatic validation. When provided, derives validate internally. */
  schema?: ZodType<T>;
  /** Whether to sync state to URL (default: true) */
  syncUrl?: boolean;
  /** Debounce time for URL updates in ms (default: 150) */
  debounceMs?: number;
  /**
   * Optional callback invoked when calculate() returns null after a user action.
   * Return a string message to show as a toast.error notification.
   * NOT called on initial mount — only called from setValue/setValues.
   */
  onCalculationError?: (values: T) => string;
}

/**
 * Factory function for creating calculator stores with Zustand
 *
 * @example
 * ```typescript
 * const useAgeStore = createCalculatorStore({
 *   name: "age-calculator",
 *   initialValues: { birthDate: "" },
 *   calculate: calculateAge,
 * });
 *
 * function AgeCalculator() {
 *   const { values, setValue, result } = useAgeStore();
 *   // ...
 * }
 * ```
 */
export function createCalculatorStore<T extends object, R>({
  initialValues,
  calculate,
  validate,
  schema,
  syncUrl = true,
  debounceMs = 150,
  onCalculationError,
}: CreateCalculatorStoreOptions<T, R>) {
  // Derive validate from schema if schema is provided; prefer explicit validate if both given
  const effectiveValidate: ((values: T) => Partial<Record<keyof T, string>>) | undefined = schema
    ? (values: T): Partial<Record<keyof T, string>> => {
        const parseResult = schema.safeParse(values);
        if (parseResult.success) return {};
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        for (const issue of parseResult.error.issues) {
          const key = issue.path[0] as keyof T;
          if (key !== undefined && !fieldErrors[key]) {
            fieldErrors[key] = issue.message;
          }
        }
        return fieldErrors;
      }
    : validate;

  const storeCreator: StateCreator<CalculatorState<T, R>> = (set, get) => {
    // Load initial values from URL if syncUrl is enabled
    let mergedInitialValues = initialValues;
    if (syncUrl && typeof window !== "undefined") {
      const urlParams = getUrlParams();
      const compressedParam = urlParams.get("z");

      if (compressedParam) {
        // R4.3: New compressed path — decompress and parse JSON
        try {
          const json = decompressFromEncodedURIComponent(compressedParam);
          if (json !== null) {
            // R4.6 guard: null means corrupted input — skip and use initialValues
            const parsed = JSON.parse(json) as Record<string, unknown>;
            mergedInitialValues = { ...initialValues };
            for (const key of Object.keys(initialValues)) {
              if (Object.hasOwn(parsed, key) && parsed[key] !== undefined) {
                (mergedInitialValues as Record<string, unknown>)[key] = parsed[key];
              }
            }
          }
          // If json is null (corrupted): silently use initialValues (already set)
        } catch {
          // Corrupted URL param — fall back to initialValues
        }
      } else if (urlParams.size > 0) {
        // R4.5: Legacy path — plain ?key=value params (existing code, unchanged)
        mergedInitialValues = { ...initialValues };
        for (const [key, value] of urlParams.entries()) {
          if (Object.hasOwn(mergedInitialValues, key)) {
            const originalValue = (mergedInitialValues as Record<string, unknown>)[key];
            if (typeof originalValue === "number") {
              (mergedInitialValues as Record<string, unknown>)[key] = parseNumberParam(
                value,
                originalValue
              );
            } else if (typeof originalValue === "string") {
              (mergedInitialValues as Record<string, unknown>)[key] = parseStringParam(
                value,
                originalValue
              );
            } else {
              // For other types, keep the URL value as-is (e.g., boolean, object)
              (mergedInitialValues as Record<string, unknown>)[key] = value;
            }
          }
        }
      }
    }

    return {
      values: mergedInitialValues,
      result: null,
      calculationError: undefined,
      errors: {},

      setValue: <K extends keyof T>(key: K, value: T[K]) => {
        const currentState = get();
        const newValues = { ...currentState.values, [key]: value };

        // Validate
        const errors = effectiveValidate?.(newValues) ?? {};

        // Calculate if no errors
        const calcResult = Object.keys(errors).length === 0 ? calculate(newValues) : null;
        const result = calcResult?.ok ? calcResult.value : null;
        const calculationError = calcResult && !calcResult.ok ? calcResult.error : undefined;

        // Fire toast only when user changes a value and calculation fails
        if (!calcResult?.ok && onCalculationError) {
          toast.error(onCalculationError(newValues));
        }

        set({ values: newValues, errors, result, calculationError });
      },

      setValues: (values: T) => {
        // Validate
        const errors = effectiveValidate?.(values) ?? {};

        // Calculate if no errors
        const calcResult = Object.keys(errors).length === 0 ? calculate(values) : null;
        const result = calcResult?.ok ? calcResult.value : null;
        const calculationError = calcResult && !calcResult.ok ? calcResult.error : undefined;

        // Fire toast only when user changes values and calculation fails
        if (!calcResult?.ok && onCalculationError) {
          toast.error(onCalculationError(values));
        }

        set({ values, errors, result, calculationError });
      },

      reset: () => {
        set({
          values: initialValues,
          errors: {},
          result: null,
          calculationError: undefined,
        });
      },
    };
  };

  // Apply URL sync middleware conditionally
  if (syncUrl) {
    return create<CalculatorState<T, R>>()(
      createUrlSyncMiddleware<CalculatorState<T, R>>({
        enabled: true,
        debounceMs,
        selectState: (state) => state.values, // Only sync the 'values' object, not result/errors
      })(storeCreator)
    );
  }

  return create<CalculatorState<T, R>>()(storeCreator);
}

/**
 * Helper type for extracting store type from createCalculatorStore
 */
export type CalculatorStore<T extends object, R> = ReturnType<typeof createCalculatorStore<T, R>>;
