import { describe, expect, it } from "vitest";
import { calculateMatrix } from "@/lib/converters/math/matrix";

describe("calculateMatrix", () => {
  const matA = [
    [1, 2],
    [3, 4],
  ];
  const matB = [
    [5, 6],
    [7, 8],
  ];
  const identity2x2 = [
    [1, 0],
    [0, 1],
  ];

  describe("add mode", () => {
    it("adds two 2x2 matrices correctly", () => {
      const result = calculateMatrix({ mode: "add", matrixA: matA, matrixB: matB });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toEqual([
        [6, 8],
        [10, 12],
      ]);
    });

    it("returns null when matrixB is missing", () => {
      const result = calculateMatrix({ mode: "add", matrixA: matA });
      expect(result.ok).toBe(false);
    });

    it("returns null for dimension mismatch in addition", () => {
      const result = calculateMatrix({
        mode: "add",
        matrixA: matA,
        matrixB: [[1, 2, 3]],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("subtract mode", () => {
    it("subtracts two 2x2 matrices", () => {
      const result = calculateMatrix({ mode: "subtract", matrixA: matB, matrixB: matA });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toEqual([
        [4, 4],
        [4, 4],
      ]);
    });

    it("returns null for dimension mismatch", () => {
      const result = calculateMatrix({
        mode: "subtract",
        matrixA: matA,
        matrixB: [[1, 2, 3]],
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("multiply mode", () => {
    it("multiplies 2x2 matrix by identity = original", () => {
      const result = calculateMatrix({ mode: "multiply", matrixA: matA, matrixB: identity2x2 });
      expect(result.ok).toBe(true);
      const res = (result as { ok: true; value: any }).value.result as number[][];
      expect(res[0][0]).toBeCloseTo(1, 5);
      expect(res[0][1]).toBeCloseTo(2, 5);
      expect(res[1][0]).toBeCloseTo(3, 5);
      expect(res[1][1]).toBeCloseTo(4, 5);
    });

    it("multiplies two 2x2 matrices", () => {
      const result = calculateMatrix({ mode: "multiply", matrixA: matA, matrixB: matB });
      expect(result.ok).toBe(true);
      // [[1,2],[3,4]] × [[5,6],[7,8]] = [[19,22],[43,50]]
      expect((result as { ok: true; value: any }).value.result).toEqual([
        [19, 22],
        [43, 50],
      ]);
    });

    it("returns null for incompatible dimensions", () => {
      const result = calculateMatrix({
        mode: "multiply",
        matrixA: matA,
        matrixB: [[1, 2, 3]],
      });
      expect(result.ok).toBe(false);
    });

    it("returns null when matrixB is missing", () => {
      const result = calculateMatrix({ mode: "multiply", matrixA: matA });
      expect(result.ok).toBe(false);
    });
  });

  describe("transpose mode", () => {
    it("transposes a 2x2 matrix", () => {
      const result = calculateMatrix({ mode: "transpose", matrixA: matA });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });

    it("transposes a non-square matrix", () => {
      const rect = [[1, 2, 3]];
      const result = calculateMatrix({ mode: "transpose", matrixA: rect });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toEqual([[1], [2], [3]]);
    });
  });

  describe("determinant mode", () => {
    it("computes det([[1,2],[3,4]]) = -2", () => {
      const result = calculateMatrix({ mode: "determinant", matrixA: matA });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(-2, 5);
      expect((result as { ok: true; value: any }).value.determinant).toBeCloseTo(-2, 5);
    });

    it("identifies invertible matrix", () => {
      const result = calculateMatrix({ mode: "determinant", matrixA: matA });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isInvertible).toBe(true);
    });

    it("identifies singular matrix", () => {
      const singular = [
        [1, 2],
        [2, 4],
      ]; // det = 4 - 4 = 0
      const result = calculateMatrix({ mode: "determinant", matrixA: singular });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.isInvertible).toBe(false);
    });

    it("returns null for non-square matrix", () => {
      const result = calculateMatrix({ mode: "determinant", matrixA: [[1, 2, 3]] });
      expect(result.ok).toBe(false);
    });

    it("computes 3x3 determinant", () => {
      const mat3x3 = [
        [2, 1, 3],
        [1, 4, 2],
        [3, 2, 5],
      ];
      // det = 2*(4*5-2*2) - 1*(1*5-2*3) + 3*(1*2-4*3)
      //     = 2*(20-4) - 1*(5-6) + 3*(2-12)
      //     = 2*16 - 1*(-1) + 3*(-10) = 32 + 1 - 30 = 3
      const result = calculateMatrix({ mode: "determinant", matrixA: mat3x3 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toBeCloseTo(3, 5);
    });
  });

  describe("inverse mode", () => {
    it("inv([[2,0],[0,2]]) = [[0.5,0],[0,0.5]]", () => {
      const diagMatrix = [
        [2, 0],
        [0, 2],
      ];
      const result = calculateMatrix({ mode: "inverse", matrixA: diagMatrix });
      expect(result.ok).toBe(true);
      const inv = (result as { ok: true; value: any }).value.result as number[][];
      expect(inv[0][0]).toBeCloseTo(0.5, 5);
      expect(inv[0][1]).toBeCloseTo(0, 5);
      expect(inv[1][0]).toBeCloseTo(0, 5);
      expect(inv[1][1]).toBeCloseTo(0.5, 5);
    });

    it("returns null for singular matrix", () => {
      const singular = [
        [1, 2],
        [2, 4],
      ];
      const result = calculateMatrix({ mode: "inverse", matrixA: singular });
      expect(result.ok).toBe(false);
    });

    it("returns null for non-square matrix", () => {
      const result = calculateMatrix({ mode: "inverse", matrixA: [[1, 2, 3]] });
      expect(result.ok).toBe(false);
    });
  });

  describe("scalar mode", () => {
    it("multiplies matrix by scalar", () => {
      const result = calculateMatrix({ mode: "scalar", matrixA: matA, scalar: 2 });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.result).toEqual([
        [2, 4],
        [6, 8],
      ]);
    });

    it("returns null when scalar is missing", () => {
      const result = calculateMatrix({ mode: "scalar", matrixA: matA });
      expect(result.ok).toBe(false);
    });
  });

  describe("validation", () => {
    it("returns null for empty matrixA", () => {
      const result = calculateMatrix({ mode: "add", matrixA: [] });
      expect(result.ok).toBe(false);
    });

    it("returns null for non-rectangular matrix", () => {
      const result = calculateMatrix({
        mode: "determinant",
        matrixA: [[1, 2], [3]],
      });
      expect(result.ok).toBe(false);
    });

    it("includes steps in result", () => {
      const result = calculateMatrix({ mode: "add", matrixA: matA, matrixB: matB });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.steps.length).toBeGreaterThan(0);
    });

    it("includes dimensionsA in result", () => {
      const result = calculateMatrix({ mode: "transpose", matrixA: matA });
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: any }).value.dimensionsA).toBe("2×2");
    });
  });
});
