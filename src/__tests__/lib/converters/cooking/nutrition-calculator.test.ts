import { describe, expect, it } from "vitest";
import {
  calculateNutrition,
  formatNutritionValue,
  getAllFoods,
  getFoodById,
  getFoodsByCategory,
  searchFoods,
} from "@/lib/converters/cooking/nutrition-calculator";

describe("getAllFoods", () => {
  it("returns a non-empty array of foods", () => {
    const foods = getAllFoods();
    expect(Array.isArray(foods)).toBe(true);
    expect(foods.length).toBeGreaterThan(0);
  });

  it("each food has required fields", () => {
    const foods = getAllFoods();
    for (const food of foods) {
      expect(food).toHaveProperty("id");
      expect(food).toHaveProperty("name");
      expect(food).toHaveProperty("nutrition");
      expect(food.nutrition).toHaveProperty("calories");
      expect(food.nutrition).toHaveProperty("protein");
    }
  });
});

describe("getFoodById", () => {
  it("returns undefined for unknown id", () => {
    expect(getFoodById("nonexistent_food_xyz")).toBeUndefined();
  });

  it("returns food for valid id from getAllFoods", () => {
    const foods = getAllFoods();
    const firstFood = foods[0];
    const found = getFoodById(firstFood.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(firstFood.id);
  });
});

describe("getFoodsByCategory", () => {
  it("returns foods matching category", () => {
    const foods = getAllFoods();
    if (foods.length === 0) return;
    const firstCategory = foods[0].category;
    const results = getFoodsByCategory(firstCategory);
    expect(results.length).toBeGreaterThan(0);
    for (const f of results) {
      expect(f.category).toBe(firstCategory);
    }
  });
});

describe("searchFoods", () => {
  it("finds foods by partial name", () => {
    const foods = getAllFoods();
    if (foods.length === 0) return;
    const firstName = foods[0].name;
    const partialQuery = firstName.substring(0, 3).toLowerCase();
    const results = searchFoods(partialQuery);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for unknown food", () => {
    const results = searchFoods("xyznotreallyafood999");
    expect(results).toHaveLength(0);
  });
});

describe("calculateNutrition", () => {
  it("returns empty nutrition for no selected foods", () => {
    const result = calculateNutrition({ selectedFoods: [] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totalNutrition.calories).toBe(0);
      expect(result.value.breakdown).toHaveLength(0);
    }
  });

  it("calculates nutrition from database food", () => {
    const foods = getAllFoods();
    if (foods.length === 0) return;

    const food = foods[0];
    const result = calculateNutrition({
      selectedFoods: [{ id: "sel1", foodId: food.id, servings: 1 }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.breakdown).toHaveLength(1);
      expect(result.value.breakdown[0].foodName).toBe(food.name);
      expect(result.value.totalNutrition.calories).toBeCloseTo(food.nutrition.calories, 1);
    }
  });

  it("skips unknown food id gracefully", () => {
    const result = calculateNutrition({
      selectedFoods: [{ id: "sel1", foodId: "nonexistent_xyz", servings: 1 }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.breakdown).toHaveLength(0);
      expect(result.value.totalNutrition.calories).toBe(0);
    }
  });

  it("macro calorie breakdown: protein*4 + carbs*4 + fat*9 = total macro calories", () => {
    const foods = getAllFoods();
    if (foods.length === 0) return;
    const food = foods.find((f) => f.nutrition.protein > 0 && f.nutrition.totalFat > 0);
    if (!food) return;

    const result = calculateNutrition({
      selectedFoods: [{ id: "sel1", foodId: food.id, servings: 1 }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { fromProtein, fromCarbs, fromFat } = result.value.calorieBreakdown;
      expect(fromProtein).toBeCloseTo(food.nutrition.protein * 4, 1);
      expect(fromCarbs).toBeCloseTo(food.nutrition.totalCarbohydrate * 4, 1);
      expect(fromFat).toBeCloseTo(food.nutrition.totalFat * 9, 1);
    }
  });

  it("macro percentages sum to approximately 100%", () => {
    const foods = getAllFoods();
    if (foods.length === 0) return;
    const food = foods.find((f) => f.nutrition.protein > 0 || f.nutrition.totalFat > 0);
    if (!food) return;

    const result = calculateNutrition({
      selectedFoods: [{ id: "sel1", foodId: food.id, servings: 1 }],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      const { proteinPercent, carbsPercent, fatPercent } = result.value.calorieBreakdown;
      if (proteinPercent + carbsPercent + fatPercent > 0) {
        expect(proteinPercent + carbsPercent + fatPercent).toBeCloseTo(100, 0);
      }
    }
  });

  it("servings multiplier scales calories linearly", () => {
    const foods = getAllFoods();
    if (foods.length === 0) return;
    const food = foods[0];

    const result1 = calculateNutrition({
      selectedFoods: [{ id: "sel1", foodId: food.id, servings: 1 }],
    });
    const result2 = calculateNutrition({
      selectedFoods: [{ id: "sel1", foodId: food.id, servings: 2 }],
    });

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    if (result1.ok && result2.ok) {
      expect(result2.value.totalNutrition.calories).toBeCloseTo(
        result1.value.totalNutrition.calories * 2,
        1
      );
    }
  });
});

describe("formatNutritionValue", () => {
  it("formats 0 as '0g'", () => {
    expect(formatNutritionValue(0, "g")).toBe("0g");
  });

  it("formats value with unit", () => {
    expect(formatNutritionValue(10.5, "g")).toBe("10.5g");
  });

  it("formats small value as <0.1", () => {
    expect(formatNutritionValue(0.05, "g")).toBe("<0.1g");
  });
});
