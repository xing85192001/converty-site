import { describe, expect, it } from "vitest";
import { calculatePermutationCombination } from "@/lib/converters/math/permutation-combination";

describe("calculatePermutationCombination", () => {
  it("returns null for negative n", () => {
    expect(calculatePermutationCombination({ mode: "permutation", n: -1, r: 2 }).ok).toBe(false);
  });

  it("returns null for negative r", () => {
    expect(calculatePermutationCombination({ mode: "combination", n: 5, r: -1 }).ok).toBe(false);
  });

  it("returns null for permutation when r > n", () => {
    expect(calculatePermutationCombination({ mode: "permutation", n: 3, r: 5 }).ok).toBe(false);
  });

  it("returns null for combination when r > n", () => {
    expect(calculatePermutationCombination({ mode: "combination", n: 3, r: 5 }).ok).toBe(false);
  });

  it("calculates P(5, 2) = 20", () => {
    const result = calculatePermutationCombination({ mode: "permutation", n: 5, r: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(20);
  });

  it("calculates C(5, 2) = 10", () => {
    const result = calculatePermutationCombination({ mode: "combination", n: 5, r: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(10);
  });

  it("calculates permutation with repetition P'(4, 2) = 4^2 = 16", () => {
    const result = calculatePermutationCombination({ mode: "permutationRepetition", n: 4, r: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(16);
  });

  it("calculates combination with repetition", () => {
    const result = calculatePermutationCombination({ mode: "combinationRepetition", n: 5, r: 2 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.result).toBe(15); // C(5+2-1, 2) = C(6,2) = 15
  });
});
