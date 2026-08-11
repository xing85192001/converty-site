import { describe, expect, it } from "vitest";
import { calculateFactor } from "@/lib/converters/math/factor";

describe("calculateFactor", () => {
  it("returns null for zero", () => {
    expect(calculateFactor({ mode: "factors", number: 0 }).ok).toBe(false);
  });

  it("returns null for negative numbers", () => {
    expect(calculateFactor({ mode: "factors", number: -5 }).ok).toBe(false);
  });

  it("returns null for non-integer", () => {
    expect(calculateFactor({ mode: "factors", number: 3.5 }).ok).toBe(false);
  });

  it("finds factors of 12", () => {
    const result = calculateFactor({ mode: "factors", number: 12 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.factors).toEqual([1, 2, 3, 4, 6, 12]);
  });

  it("identifies prime number", () => {
    const result = calculateFactor({ mode: "factors", number: 7 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.isPrime).toBe(true);
    expect((result as { ok: true; value: any }).value.factors).toEqual([1, 7]);
  });

  it("identifies composite number as not prime", () => {
    const result = calculateFactor({ mode: "factors", number: 12 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.isPrime).toBe(false);
  });

  it("identifies perfect number 6", () => {
    const result = calculateFactor({ mode: "factors", number: 6 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.isPerfect).toBe(true);
  });

  it("finds common factors of two numbers", () => {
    const result = calculateFactor({ mode: "commonFactors", number: 12, number2: 18 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.commonFactors).toBeDefined();
    expect((result as { ok: true; value: any }).value.commonFactors).toContain(6);
    expect((result as { ok: true; value: any }).value.greatestCommonFactor).toBe(6);
  });
});
