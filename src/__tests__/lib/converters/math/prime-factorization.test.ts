import { describe, expect, it } from "vitest";
import { calculatePrimeFactorization } from "@/lib/converters/math/prime-factorization";

describe("calculatePrimeFactorization", () => {
  describe("composite numbers", () => {
    it("factorizes 12 = 2² × 3", () => {
      const result = calculatePrimeFactorization({ number: 12 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.factors).toEqual(
        expect.arrayContaining([
          { prime: 2, power: 2 },
          { prime: 3, power: 1 },
        ])
      );
    });

    it("factorizes 360 correctly", () => {
      const result = calculatePrimeFactorization({ number: 360 });
      expect(result.ok).toBe(true);
      // 360 = 2³ × 3² × 5
      expect((result as { ok: true; value: any }).value.factors).toEqual(
        expect.arrayContaining([
          { prime: 2, power: 3 },
          { prime: 3, power: 2 },
          { prime: 5, power: 1 },
        ])
      );
    });

    it("expandedForm shows all prime factors", () => {
      const result = calculatePrimeFactorization({ number: 12 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.expandedForm).toBe("2 × 2 × 3");
    });

    it("factorString uses power notation", () => {
      const result = calculatePrimeFactorization({ number: 8 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.factorString).toBe("2^3");
    });
  });

  describe("prime numbers", () => {
    it("identifies 7 as prime", () => {
      const result = calculatePrimeFactorization({ number: 7 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isPrime).toBe(true);
      expect((result as { ok: true; value: any }).value.factors).toEqual([{ prime: 7, power: 1 }]);
    });

    it("identifies 2 as prime", () => {
      const result = calculatePrimeFactorization({ number: 2 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isPrime).toBe(true);
    });

    it("identifies 97 as prime", () => {
      const result = calculatePrimeFactorization({ number: 97 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isPrime).toBe(true);
    });
  });

  describe("special case: 1", () => {
    it("handles 1 with empty factors", () => {
      const result = calculatePrimeFactorization({ number: 1 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.factors).toEqual([]);
      expect((result as { ok: true; value: any }).value.isPrime).toBe(false);
      expect((result as { ok: true; value: any }).value.divisorCount).toBe(1);
    });
  });

  describe("divisors", () => {
    it("calculates all divisors of 12", () => {
      const result = calculatePrimeFactorization({ number: 12 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.allDivisors).toEqual([1, 2, 3, 4, 6, 12]);
      expect((result as { ok: true; value: any }).value.divisorCount).toBe(6);
    });

    it("calculates divisor sum of 12", () => {
      const result = calculatePrimeFactorization({ number: 12 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.divisorSum).toBe(28); // 1+2+3+4+6+12
    });

    it("prime has exactly 2 divisors", () => {
      const result = calculatePrimeFactorization({ number: 13 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.divisorCount).toBe(2);
      expect((result as { ok: true; value: any }).value.allDivisors).toEqual([1, 13]);
    });
  });

  describe("validation", () => {
    it("returns null for n < 1", () => {
      const result = calculatePrimeFactorization({ number: 0 });
      expect(result.ok).toBe(false);
    });

    it("returns null for negative numbers", () => {
      const result = calculatePrimeFactorization({ number: -5 });
      expect(result.ok).toBe(false);
    });

    it("returns null for non-integer", () => {
      const result = calculatePrimeFactorization({ number: 3.14 });
      expect(result.ok).toBe(false);
    });

    it("returns null for numbers > 1000000000", () => {
      const result = calculatePrimeFactorization({ number: 1000000001 });
      expect(result.ok).toBe(false);
    });
  });

  describe("factor tree", () => {
    it("includes factor tree steps", () => {
      const result = calculatePrimeFactorization({ number: 12 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.factorTree.length).toBeGreaterThan(0);
    });
  });

  describe("originalNumber", () => {
    it("preserves the original number", () => {
      const result = calculatePrimeFactorization({ number: 42 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.originalNumber).toBe(42);
    });
  });
});
