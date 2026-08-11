import { describe, expect, it } from "vitest";
import type { FoodCostInput, IngredientCost } from "@/lib/converters/cooking/food-cost";
import { calculateFoodCost } from "@/lib/converters/cooking/food-cost";

const makeIngredient = (
  name: string,
  costPerUnit: number,
  unit: IngredientCost["unit"],
  amountUsed: number,
  amountUnit: IngredientCost["amountUnit"]
): IngredientCost => ({
  id: name,
  name,
  costPerUnit,
  unit,
  amountUsed,
  amountUnit,
});

describe("calculateFoodCost", () => {
  it("returns ok: false when servings = 0", () => {
    const result = calculateFoodCost({
      recipeName: "Test",
      servings: 0,
      currency: "USD",
      ingredients: [],
    });
    expect(result.ok).toBe(false);
  });

  it("returns 0 cost for empty ingredients", () => {
    const result = calculateFoodCost({
      recipeName: "Test",
      servings: 4,
      currency: "USD",
      ingredients: [],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalCost).toBe(0);
      expect(result.value.costPerServing).toBe(0);
      expect(result.value.ingredientBreakdown).toHaveLength(0);
    }
  });

  it("$10 ingredient for 4 servings = $2.50 per serving", () => {
    const input: FoodCostInput = {
      recipeName: "Test Recipe",
      servings: 4,
      currency: "USD",
      ingredients: [makeIngredient("flour", 10, "kg", 1, "kg")],
    };
    const result = calculateFoodCost(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalCost).toBe(10);
      expect(result.value.costPerServing).toBeCloseTo(2.5, 2);
    }
  });

  it("calculates cost for 500g from 1kg-priced ingredient", () => {
    // $10/kg * 0.5kg = $5
    const input: FoodCostInput = {
      recipeName: "Test",
      servings: 1,
      currency: "USD",
      ingredients: [makeIngredient("sugar", 10, "kg", 500, "g")],
    };
    const result = calculateFoodCost(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalCost).toBeCloseTo(5, 2);
    }
  });

  it("sums multiple ingredients correctly", () => {
    const input: FoodCostInput = {
      recipeName: "Multi-ingredient",
      servings: 4,
      currency: "USD",
      ingredients: [
        makeIngredient("flour", 2, "kg", 1, "kg"), // $2
        makeIngredient("butter", 5, "kg", 200, "g"), // $1
        makeIngredient("sugar", 3, "kg", 500, "g"), // $1.50
      ],
    };
    const result = calculateFoodCost(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalCost).toBeCloseTo(4.5, 2);
      expect(result.value.costPerServing).toBeCloseTo(1.125, 2);
    }
  });

  it("identifies most and least expensive ingredients", () => {
    const input: FoodCostInput = {
      recipeName: "Test",
      servings: 2,
      currency: "USD",
      ingredients: [
        makeIngredient("expensive", 100, "kg", 1, "kg"), // $100
        makeIngredient("cheap", 1, "kg", 100, "g"), // $0.10
      ],
    };
    const result = calculateFoodCost(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.mostExpensiveIngredient).toBe("expensive");
      expect(result.value.leastExpensiveIngredient).toBe("cheap");
    }
  });

  it("calculates percentage of total for each ingredient", () => {
    const input: FoodCostInput = {
      recipeName: "Test",
      servings: 2,
      currency: "USD",
      ingredients: [
        makeIngredient("a", 10, "kg", 1, "kg"), // $10
        makeIngredient("b", 10, "kg", 1, "kg"), // $10
      ],
    };
    const result = calculateFoodCost(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      result.value.ingredientBreakdown.forEach((item) => {
        expect(item.percentageOfTotal).toBeCloseTo(50, 1);
      });
    }
  });

  it("handles piece unit pricing", () => {
    const input: FoodCostInput = {
      recipeName: "Egg dish",
      servings: 2,
      currency: "USD",
      ingredients: [
        {
          id: "egg",
          name: "egg",
          costPerUnit: 0.5,
          unit: "piece",
          amountUsed: 3,
          amountUnit: "piece",
        },
      ],
    };
    const result = calculateFoodCost(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalCost).toBeCloseTo(1.5, 2);
    }
  });
});
