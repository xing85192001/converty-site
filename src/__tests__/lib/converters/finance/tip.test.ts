import { describe, expect, it } from "vitest";
import { calculateTip } from "@/lib/converters/finance/tip";

describe("calculateTip", () => {
  describe("ok: false for invalid input", () => {
    it("returns ok: false for negative bill amount", () => {
      const result = calculateTip({ billAmount: -50, tipPercentage: 20, numberOfPeople: 1 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for negative tip percentage", () => {
      const result = calculateTip({ billAmount: 50, tipPercentage: -10, numberOfPeople: 1 });
      expect(result.ok).toBe(false);
    });

    it("returns ok: false for zero number of people", () => {
      const result = calculateTip({ billAmount: 50, tipPercentage: 20, numberOfPeople: 0 });
      expect(result.ok).toBe(false);
    });
  });

  describe("basic tip calculation", () => {
    it("$50 bill with 20% tip → tipAmount = $10, totalAmount = $60", () => {
      const result = calculateTip({ billAmount: 50, tipPercentage: 20, numberOfPeople: 1 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.tipAmount).toBeCloseTo(10, 2);
        expect(result.value.totalAmount).toBeCloseTo(60, 2);
      }
    });

    it("0% tip → tipAmount = $0, totalAmount = billAmount", () => {
      const result = calculateTip({ billAmount: 50, tipPercentage: 0, numberOfPeople: 1 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.tipAmount).toBeCloseTo(0, 2);
        expect(result.value.totalAmount).toBeCloseTo(50, 2);
      }
    });

    it("zero bill → all values are zero", () => {
      const result = calculateTip({ billAmount: 0, tipPercentage: 20, numberOfPeople: 1 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.tipAmount).toBe(0);
        expect(result.value.totalAmount).toBe(0);
      }
    });
  });

  describe("per-person calculation", () => {
    it("$60 total for 2 people → totalPerPerson = $30", () => {
      const result = calculateTip({ billAmount: 50, tipPercentage: 20, numberOfPeople: 2 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // total = 60, per person = 30
        expect(result.value.totalPerPerson).toBeCloseTo(30, 2);
      }
    });

    it("tipPerPerson = tipAmount / numberOfPeople", () => {
      const result = calculateTip({ billAmount: 100, tipPercentage: 15, numberOfPeople: 4 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        // tip = 15, per person = 3.75
        expect(result.value.tipPerPerson).toBeCloseTo(3.75, 2);
      }
    });
  });
});
