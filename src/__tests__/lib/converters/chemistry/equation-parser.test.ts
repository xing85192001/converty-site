import { describe, expect, it } from "vitest";
import {
  formatEquation,
  isEquationBalanced,
  parseChemicalEquation,
} from "@/lib/converters/chemistry/equation-parser";

describe("parseChemicalEquation", () => {
  describe("invalid inputs return error result", () => {
    it("returns ok:false for empty string", () => {
      const result = parseChemicalEquation("");
      expect(result.ok).toBe(false);
    });

    it("returns ok:false for whitespace-only string", () => {
      const result = parseChemicalEquation("   ");
      expect(result.ok).toBe(false);
    });

    it("returns ok:false when no arrow present", () => {
      const result = parseChemicalEquation("H2 + O2");
      expect(result.ok).toBe(false);
    });
  });

  describe("simple equations", () => {
    it("parses 'H2 + O2 -> H2O' without throwing", () => {
      const result = parseChemicalEquation("H2 + O2 -> H2O");
      expect(result.ok).toBe(true);
    });

    it("parsed equation has reactants and products", () => {
      const result = parseChemicalEquation("H2 + O2 -> H2O");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.reactants.length).toBeGreaterThan(0);
        expect(result.value.products.length).toBeGreaterThan(0);
      }
    });

    it("parses balanced '2H2 + O2 -> 2H2O' correctly", () => {
      const result = parseChemicalEquation("2H2 + O2 -> 2H2O");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.reactants[0].formula).toBe("H2");
        expect(result.value.reactants[0].coefficient).toBe(2);
        expect(result.value.products[0].formula).toBe("H2O");
        expect(result.value.products[0].coefficient).toBe(2);
      }
    });

    it("accepts unicode arrow → format", () => {
      const result = parseChemicalEquation("2NaOH + H2SO4 → Na2SO4 + 2H2O");
      expect(result.ok).toBe(true);
    });

    it("accepts '=' as arrow separator", () => {
      const result = parseChemicalEquation("Fe + S = FeS");
      expect(result.ok).toBe(true);
    });
  });

  describe("equation with parentheses", () => {
    it("parses equation with Ca(OH)2", () => {
      const result = parseChemicalEquation("Ca(OH)2 + 2HCl -> CaCl2 + 2H2O");
      expect(result.ok).toBe(true);
    });
  });

  describe("original equation preserved", () => {
    it("stores original equation string", () => {
      const eq = "H2 + O2 -> H2O";
      const result = parseChemicalEquation(eq);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.original).toBe(eq);
      }
    });
  });
});

describe("formatEquation", () => {
  it("formats parsed equation back to string", () => {
    const result = parseChemicalEquation("2H2 + O2 -> 2H2O");
    if (result.ok) {
      const formatted = formatEquation(result.value);
      expect(formatted).toContain("H2");
      expect(formatted).toContain("H2O");
      expect(formatted).toContain("→");
    }
  });
});

describe("isEquationBalanced", () => {
  it("returns true for a parsed equation (placeholder implementation)", () => {
    const result = parseChemicalEquation("2H2 + O2 -> 2H2O");
    if (result.ok) {
      expect(isEquationBalanced(result.value)).toBe(true);
    }
  });
});
