import { describe, expect, it } from "vitest";
import {
  getAllElements,
  getByName,
  getBySymbol,
  getElementById,
  getStatistics,
  searchElements,
} from "@/lib/converters/chemistry/periodic-table-lookup";

describe("periodic-table-lookup (real JSON data)", () => {
  describe("getAllElements", () => {
    it("returns an array with more than 100 elements", () => {
      const elements = getAllElements();
      expect(elements.length).toBeGreaterThan(100);
    });

    it("each element has atomicNumber, symbol and name", () => {
      const elements = getAllElements();
      for (const el of elements.slice(0, 5)) {
        expect(el.atomicNumber).toBeGreaterThan(0);
        expect(el.symbol).toBeTruthy();
        expect(el.name).toBeTruthy();
      }
    });
  });

  describe("getElementById", () => {
    it("lookup(1) → hydrogen with atomicNumber=1", () => {
      const element = getElementById(1);
      expect(element).not.toBeNull();
      expect(element!.atomicNumber).toBe(1);
      expect(element!.name.toLowerCase()).toBe("hydrogen");
    });

    it("lookup(79) → gold", () => {
      const element = getElementById(79);
      expect(element).not.toBeNull();
      expect(element!.name.toLowerCase()).toBe("gold");
      expect(element!.symbol).toBe("Au");
    });

    it("returns null for unknown atomic number 999", () => {
      expect(getElementById(999)).toBeNull();
    });
  });

  describe("getBySymbol", () => {
    it("lookup 'H' → hydrogen", () => {
      const element = getBySymbol("H");
      expect(element).not.toBeNull();
      expect(element!.atomicNumber).toBe(1);
    });

    it("lookup 'Au' → gold", () => {
      const element = getBySymbol("Au");
      expect(element).not.toBeNull();
      expect(element!.name.toLowerCase()).toBe("gold");
    });

    it("lookup 'Fe' → iron with atomicMass ≈ 55.845", () => {
      const element = getBySymbol("Fe");
      expect(element).not.toBeNull();
      expect(element!.atomicMass).toBeCloseTo(55.845, 2);
    });

    it("returns null for unknown symbol 'Uus'", () => {
      const element = getBySymbol("Uus");
      expect(element).toBeNull();
    });

    it("is case-insensitive (lowercase 'fe' → iron)", () => {
      const element = getBySymbol("fe");
      expect(element).not.toBeNull();
      expect(element!.symbol).toBe("Fe");
    });
  });

  describe("getByName", () => {
    it("lookup 'Oxygen' → oxygen element", () => {
      const element = getByName("Oxygen");
      expect(element).not.toBeNull();
      expect(element!.symbol).toBe("O");
    });

    it("returns null for unknown name", () => {
      expect(getByName("Unobtanium")).toBeNull();
    });
  });

  describe("searchElements", () => {
    it("returns empty array for empty query", () => {
      expect(searchElements("")).toHaveLength(0);
    });

    it("finds hydrogen by symbol 'H'", () => {
      const results = searchElements("H");
      expect(results.length).toBeGreaterThan(0);
      const hydrogen = results.find((r) => r.element.symbol === "H");
      expect(hydrogen).toBeDefined();
    });

    it("finds elements by partial name 'gold'", () => {
      const results = searchElements("gold");
      expect(results.length).toBeGreaterThan(0);
    });

    it("highest match score comes first", () => {
      const results = searchElements("Fe");
      if (results.length >= 2) {
        expect(results[0].matchScore).toBeGreaterThanOrEqual(results[1].matchScore);
      }
    });
  });

  describe("getStatistics", () => {
    it("returns stats with total > 100", () => {
      const stats = getStatistics();
      expect(stats.total).toBeGreaterThan(100);
    });

    it("has metals, nonmetals, metalloids", () => {
      const stats = getStatistics();
      expect(stats.metals).toBeGreaterThan(0);
      expect(stats.nonmetals).toBeGreaterThan(0);
      expect(stats.metalloids).toBeGreaterThan(0);
    });
  });
});
