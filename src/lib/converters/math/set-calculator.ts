/**
 * Set Calculator
 *
 * Performs set operations (union, intersection, difference, symmetric
 * difference, cartesian product) and set relations (subset, superset,
 * disjoint) on two user-provided sets.
 */

import type { CalculationResult } from "@/types";

export type SetOperation =
  | "union"
  | "intersection"
  | "difference"
  | "symdiff"
  | "cartesian"
  | "issubset"
  | "issuperset"
  | "isdisjoint";

export const SET_OPERATIONS: { value: SetOperation; label: string }[] = [
  { value: "union", label: "Union (A ∪ B)" },
  { value: "intersection", label: "Intersection (A ∩ B)" },
  { value: "difference", label: "Difference (A − B)" },
  { value: "symdiff", label: "Symmetric difference (A △ B)" },
  { value: "cartesian", label: "Cartesian product (A × B)" },
  { value: "issubset", label: "A ⊆ B (subset?)" },
  { value: "issuperset", label: "A ⊇ B (superset?)" },
  { value: "isdisjoint", label: "A ∩ B = ∅ (disjoint?)" },
];

/** Parse a set string into ordered, de-duplicated, non-empty elements. */
export function parseSet(raw: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,\n]/)) {
    const el = part.trim();
    if (el.length === 0) continue;
    if (!seen.has(el)) {
      seen.add(el);
      out.push(el);
    }
  }
  return out;
}

export interface SetCalculatorInput {
  a: string;
  b: string;
  operation: SetOperation;
}

export interface SetCalculatorResult {
  elements: string[];
  cardinality: number;
  boolResult?: boolean;
  display: string;
}

/**
 * Compute a set operation on two sets A and B.
 *
 * @param input - set A text, set B text, and the operation to apply
 * @returns The resulting set (or boolean for relation checks) as display data
 */
export function calculateSetCalculator(
  input: SetCalculatorInput
): CalculationResult<SetCalculatorResult> {
  const { a, b, operation } = input;
  const setA = parseSet(a);
  const setB = parseSet(b);

  const asSet = new Set(setA);
  const bsSet = new Set(setB);

  switch (operation) {
    case "union":
      return ok(setA.concat(setB.filter((x) => !asSet.has(x))));
    case "intersection":
      return ok(setA.filter((x) => bsSet.has(x)));
    case "difference":
      return ok(setA.filter((x) => !bsSet.has(x)));
    case "symdiff":
      return ok(setA.filter((x) => !bsSet.has(x)).concat(setB.filter((x) => !asSet.has(x))));
    case "cartesian": {
      const pairs = setA.flatMap((x) => setB.map((y) => `(${x}, ${y})`));
      return ok(pairs);
    }
    case "issubset":
      return bool(setA.every((x) => bsSet.has(x)));
    case "issuperset":
      return bool(setB.every((x) => asSet.has(x)));
    case "isdisjoint":
      return bool(setA.every((x) => !bsSet.has(x)));
    default:
      return { ok: false, error: "Unknown operation", code: "INVALID_INPUT" };
  }
}

function ok(elements: string[]): CalculationResult<SetCalculatorResult> {
  return {
    ok: true,
    value: {
      elements,
      cardinality: elements.length,
      display: elements.length ? elements.join(", ") : "∅ (empty set)",
    },
  };
}

function bool(result: boolean): CalculationResult<SetCalculatorResult> {
  return {
    ok: true,
    value: {
      elements: [result ? "True" : "False"],
      cardinality: result ? 1 : 0,
      boolResult: result,
      display: result ? "True" : "False",
    },
  };
}
