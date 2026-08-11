import { describe, expect, it } from "vitest";
import { calculateHalfLife } from "@/lib/converters/math/half-life";

describe("calculateHalfLife", () => {
  it("returns null for negative initial amount in decay mode", () => {
    expect(
      calculateHalfLife({ mode: "decay", initialAmount: -100, halfLife: 10, time: 5 }).ok
    ).toBe(false);
  });

  it("returns null for negative half-life in decay mode", () => {
    expect(
      calculateHalfLife({ mode: "decay", initialAmount: 100, halfLife: -10, time: 5 }).ok
    ).toBe(false);
  });

  it("after 1 half-life 100g becomes approximately 50g", () => {
    const result = calculateHalfLife({ mode: "decay", initialAmount: 100, halfLife: 10, time: 10 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.remainingAmount).toBeCloseTo(50, 5);
    expect((result as { ok: true; value: any }).value.numberOfHalfLives).toBe(1);
  });

  it("after 2 half-lives 100g becomes approximately 25g", () => {
    const result = calculateHalfLife({ mode: "decay", initialAmount: 100, halfLife: 10, time: 20 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.remainingAmount).toBeCloseTo(25, 5);
  });

  it("finds time given initial and remaining amounts", () => {
    const result = calculateHalfLife({
      mode: "remaining",
      initialAmount: 100,
      remainingAmount: 50,
      halfLife: 10,
    });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.time).toBeCloseTo(10, 5);
  });

  it("carbon14 mode returns result for valid percent remaining", () => {
    const result = calculateHalfLife({ mode: "carbon14", percentRemaining: 50 });
    expect(result.ok).toBe(true);
    expect((result as { ok: true; value: any }).value.halfLife).toBe(5730);
    expect((result as { ok: true; value: any }).value.time).toBeCloseTo(5730, 0);
  });

  describe("findHalfLife mode", () => {
    it("finds half-life from initial amount, remaining amount, and time", () => {
      // N₀=100, N=50 after t=10 → t½ = 10
      const result = calculateHalfLife({
        mode: "findHalfLife",
        initialAmount: 100,
        remainingAmount: 50,
        time: 10,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.halfLife).toBeCloseTo(10, 4);
    });

    it("returns null if inputs missing", () => {
      expect(calculateHalfLife({ mode: "findHalfLife", initialAmount: 100 }).ok).toBe(false);
    });

    it("returns null if remaining > initial", () => {
      expect(
        calculateHalfLife({
          mode: "findHalfLife",
          initialAmount: 50,
          remainingAmount: 100,
          time: 10,
        }).ok
      ).toBe(false);
    });

    it("returns null if time <= 0", () => {
      expect(
        calculateHalfLife({
          mode: "findHalfLife",
          initialAmount: 100,
          remainingAmount: 50,
          time: 0,
        }).ok
      ).toBe(false);
    });
  });

  describe("findTime mode", () => {
    it("finds time using half-life", () => {
      // 50% remaining, t½=10 → t = 10
      const result = calculateHalfLife({ mode: "findTime", halfLife: 10, percentRemaining: 50 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.time).toBeCloseTo(10, 2);
    });

    it("finds time using decay constant", () => {
      // decayConstant = ln(2)/10 → t½ ≈ 10
      const decayConstant = Math.LN2 / 10;
      const result = calculateHalfLife({
        mode: "findTime",
        decayConstant,
        percentRemaining: 50,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.time).toBeCloseTo(10, 2);
    });

    it("finds time using initialAmount and remainingAmount instead of percentRemaining", () => {
      const result = calculateHalfLife({
        mode: "findTime",
        halfLife: 10,
        initialAmount: 100,
        remainingAmount: 50,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.time).toBeCloseTo(10, 2);
    });

    it("returns null if no decay constant or half-life provided", () => {
      expect(calculateHalfLife({ mode: "findTime", percentRemaining: 50 }).ok).toBe(false);
    });

    it("returns null if fraction out of range", () => {
      expect(calculateHalfLife({ mode: "findTime", halfLife: 10, percentRemaining: 0 }).ok).toBe(
        false
      );
    });
  });

  describe("remaining mode - additional cases", () => {
    it("returns null if remaining > initial", () => {
      expect(
        calculateHalfLife({
          mode: "remaining",
          initialAmount: 50,
          remainingAmount: 100,
          halfLife: 10,
        }).ok
      ).toBe(false);
    });

    it("returns null if inputs missing", () => {
      expect(calculateHalfLife({ mode: "remaining", initialAmount: 100 }).ok).toBe(false);
    });
  });

  describe("carbon14 mode - additional cases", () => {
    it("uses initialAmount and remainingAmount when percentRemaining not provided", () => {
      const result = calculateHalfLife({
        mode: "carbon14",
        initialAmount: 100,
        remainingAmount: 50,
      });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.time).toBeCloseTo(5730, 0);
    });

    it("returns null for null fraction in carbon14", () => {
      expect(calculateHalfLife({ mode: "carbon14" }).ok).toBe(false);
    });

    it("adds note for samples older than 50000 years", () => {
      // 0.1% remaining → ~57,000 years → exceeds 50,000 year limit
      const result = calculateHalfLife({ mode: "carbon14", percentRemaining: 0.1 });
      expect(result.ok).toBe(true);
      const hasNote = (result as { ok: true; value: any }).value.steps.some((s: string) =>
        s.includes("50,000")
      );
      expect(hasNote).toBe(true);
    });
  });

  it("decay mode returns decayTable array", () => {
    const result = calculateHalfLife({ mode: "decay", initialAmount: 100, halfLife: 10, time: 10 });
    expect((result as { ok: true; value: any }).value.decayTable).toBeInstanceOf(Array);
    expect((result as { ok: true; value: any }).value.decayTable.length).toBeGreaterThan(0);
  });
});
