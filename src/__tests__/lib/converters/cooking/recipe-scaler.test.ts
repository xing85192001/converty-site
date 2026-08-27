import { describe, expect, it } from "vitest";
import type { RecipeScaleInput } from "@/lib/converters/cooking/recipe-scaler";
import { SCALING_RULES, scaleRecipe } from "@/lib/converters/cooking/recipe-scaler";

const makeInput = (
  originalServings: number,
  desiredServings: number,
  ingredients = [{ id: "1", name: "flour", amount: 2, unit: "cup", type: "standard" as const }]
): RecipeScaleInput => ({
  recipeName: "Test Recipe",
  originalServings,
  desiredServings,
  ingredients,
});

describe("scaleRecipe", () => {
  it("returns ok: false for originalServings = 0", () => {
    const result = scaleRecipe(makeInput(0, 4));
    expect(result.ok).toBe(false);
  });

  it("returns ok: false for desiredServings = 0", () => {
    const result = scaleRecipe(makeInput(4, 0));
    expect(result.ok).toBe(false);
  });

  it("scale factor of 1 leaves quantities unchanged", () => {
    const result = scaleRecipe(makeInput(4, 4));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.baseFactor).toBe(1);
      expect(result.value.scaledIngredients[0].scaledAmount).toBeCloseTo(2, 4);
    }
  });

  it("scale 4-serving recipe to 6 servings → factor 1.5, quantities × 1.5", () => {
    const result = scaleRecipe(makeInput(4, 6));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.baseFactor).toBe(1.5);
      expect(result.value.scaledIngredients[0].scaledAmount).toBeCloseTo(3, 4);
    }
  });

  it("returns empty scaledIngredients for empty ingredients", () => {
    const result = scaleRecipe({
      recipeName: "Empty",
      originalServings: 4,
      desiredServings: 8,
      ingredients: [],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.scaledIngredients).toHaveLength(0);
    }
  });

  it("returns correct baseFactor", () => {
    const result = scaleRecipe(makeInput(4, 8));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.baseFactor).toBe(2);
    }
  });

  it("scales multiple ingredients", () => {
    const input = makeInput(4, 8, [
      { id: "1", name: "flour", amount: 2, unit: "cup", type: "standard" },
      { id: "2", name: "sugar", amount: 1, unit: "cup", type: "standard" },
    ]);
    const result = scaleRecipe(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.scaledIngredients).toHaveLength(2);
      expect(result.value.scaledIngredients[0].scaledAmount).toBeCloseTo(4, 4);
      expect(result.value.scaledIngredients[1].scaledAmount).toBeCloseTo(2, 4);
    }
  });

  it("salt scales non-linearly (less than linear)", () => {
    const result = scaleRecipe({
      recipeName: "Test",
      originalServings: 1,
      desiredServings: 4,
      ingredients: [{ id: "1", name: "salt", amount: 1, unit: "tsp", type: "salt" }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      // With factor 4, salt adjustedFactor = 1 + (4-1)*0.75 = 3.25, less than 4
      const saltIngredient = result.value.scaledIngredients[0];
      expect(saltIngredient.wasAdjusted).toBe(true);
      expect(saltIngredient.scaledAmount).toBeLessThan(4); // less than linear scaling
    }
  });

  it("standard ingredients scale linearly", () => {
    const result = scaleRecipe(makeInput(4, 8));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ingredient = result.value.scaledIngredients[0];
      expect(ingredient.wasAdjusted).toBe(false);
      expect(ingredient.scaledAmount).toBeCloseTo(ingredient.originalAmount * 2, 4);
    }
  });
});

describe("SCALING_RULES", () => {
  it("standard rule scales linearly", () => {
    expect(SCALING_RULES.standard(2)).toBe(2);
    expect(SCALING_RULES.standard(0.5)).toBe(0.5);
  });

  it("salt rule scales at 75% rate when scaling up", () => {
    // factor=2: 1 + (2-1)*0.75 = 1.75
    expect(SCALING_RULES.salt(2)).toBeCloseTo(1.75, 4);
  });

  it("spice rule scales at 75% rate when scaling up", () => {
    // factor=2: 1 + (2-1)*0.75 = 1.75
    expect(SCALING_RULES.spice(2)).toBeCloseTo(1.75, 4);
  });

  it("leavening rule scales at 87.5% rate when scaling up", () => {
    // factor=2: 1 + (2-1)*0.875 = 1.875
    expect(SCALING_RULES.leavening(2)).toBeCloseTo(1.875, 4);
  });

  it("liquid scales normally when scaling up", () => {
    expect(SCALING_RULES.liquid(2)).toBe(2);
  });

  it("extract scales at 75% rate when scaling up", () => {
    expect(SCALING_RULES.extract(2)).toBeCloseTo(1.75, 4);
  });
});
