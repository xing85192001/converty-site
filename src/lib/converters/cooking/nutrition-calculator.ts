// src/lib/converters/cooking/nutrition-calculator.ts

import foodsData from "@/lib/data/foods-cooking.json";
import type { CalculationResult } from "@/types";

export interface NutritionFacts {
  calories: number;
  totalFat: number; // g
  saturatedFat: number; // g
  transFat: number; // g
  cholesterol: number; // mg
  sodium: number; // mg
  totalCarbohydrate: number; // g
  dietaryFiber: number; // g
  totalSugars: number; // g
  addedSugars: number; // g
  protein: number; // g
  vitaminD?: number; // mcg
  calcium?: number; // mg
  iron?: number; // mg
  potassium?: number; // mg
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  nutrition: NutritionFacts;
}

export interface SelectedFood {
  id: string;
  foodId: string;
  servings: number; // Number of 100g servings
}

export interface NutritionInput {
  selectedFoods: SelectedFood[];
}

export interface FoodNutritionBreakdown {
  id: string;
  foodName: string;
  servings: number;
  servingDisplay: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface CalorieBreakdown {
  fromProtein: number;
  fromCarbs: number;
  fromFat: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export interface NutritionResult {
  totalNutrition: NutritionFacts;
  breakdown: FoodNutritionBreakdown[];
  calorieBreakdown: CalorieBreakdown;
  steps: string[];
}

// Type assertion for imported JSON
const foodDatabase = foodsData as {
  version: string;
  source: string;
  lastUpdated: string;
  servingBasis: string;
  foods: FoodItem[];
};

/**
 * Get all foods from database
 */
export function getAllFoods(): FoodItem[] {
  return foodDatabase.foods;
}

/**
 * Get food by ID
 */
export function getFoodById(id: string): FoodItem | undefined {
  return foodDatabase.foods.find((f) => f.id === id);
}

/**
 * Get foods by category
 */
export function getFoodsByCategory(category: string): FoodItem[] {
  return foodDatabase.foods.filter((f) => f.category === category);
}

/**
 * Get all unique categories
 */
export function getFoodCategories(): string[] {
  const categories = new Set(foodDatabase.foods.map((f) => f.category));
  return Array.from(categories).sort();
}

/**
 * Search foods by name
 */
export function searchFoods(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase();
  return foodDatabase.foods.filter((f) => f.name.toLowerCase().includes(lowerQuery));
}

/**
 * Create empty nutrition facts object
 */
function createEmptyNutrition(): NutritionFacts {
  return {
    calories: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    totalCarbohydrate: 0,
    dietaryFiber: 0,
    totalSugars: 0,
    addedSugars: 0,
    protein: 0,
    vitaminD: 0,
    calcium: 0,
    iron: 0,
    potassium: 0,
  };
}

/**
 * Add scaled nutrition values
 */
function addNutrition(total: NutritionFacts, food: NutritionFacts, multiplier: number): void {
  total.calories += food.calories * multiplier;
  total.totalFat += food.totalFat * multiplier;
  total.saturatedFat += food.saturatedFat * multiplier;
  total.transFat += food.transFat * multiplier;
  total.cholesterol += food.cholesterol * multiplier;
  total.sodium += food.sodium * multiplier;
  total.totalCarbohydrate += food.totalCarbohydrate * multiplier;
  total.dietaryFiber += food.dietaryFiber * multiplier;
  total.totalSugars += food.totalSugars * multiplier;
  total.addedSugars += food.addedSugars * multiplier;
  total.protein += food.protein * multiplier;

  // Optional nutrients
  if (food.vitaminD !== undefined) {
    total.vitaminD = (total.vitaminD ?? 0) + food.vitaminD * multiplier;
  }
  if (food.calcium !== undefined) {
    total.calcium = (total.calcium ?? 0) + food.calcium * multiplier;
  }
  if (food.iron !== undefined) {
    total.iron = (total.iron ?? 0) + food.iron * multiplier;
  }
  if (food.potassium !== undefined) {
    total.potassium = (total.potassium ?? 0) + food.potassium * multiplier;
  }
}

/**
 * Calculate calorie breakdown from macros
 * Calories: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat
 */
function calculateCalorieBreakdown(nutrition: NutritionFacts): CalorieBreakdown {
  const fromProtein = nutrition.protein * 4;
  const fromCarbs = nutrition.totalCarbohydrate * 4;
  const fromFat = nutrition.totalFat * 9;
  const total = fromProtein + fromCarbs + fromFat;

  return {
    fromProtein,
    fromCarbs,
    fromFat,
    proteinPercent: total > 0 ? (fromProtein / total) * 100 : 0,
    carbsPercent: total > 0 ? (fromCarbs / total) * 100 : 0,
    fatPercent: total > 0 ? (fromFat / total) * 100 : 0,
  };
}

/**
 * Main nutrition calculation function
 */
export function calculateNutrition(input: NutritionInput): CalculationResult<NutritionResult> {
  const { selectedFoods } = input;
  const steps: string[] = [];

  if (selectedFoods.length === 0) {
    return {
      ok: true,
      value: {
        totalNutrition: createEmptyNutrition(),
        breakdown: [],
        calorieBreakdown: {
          fromProtein: 0,
          fromCarbs: 0,
          fromFat: 0,
          proteinPercent: 0,
          carbsPercent: 0,
          fatPercent: 0,
        },
        steps: ["No foods selected"],
      },
    };
  }

  const totalNutrition = createEmptyNutrition();
  const breakdown: FoodNutritionBreakdown[] = [];

  for (const selected of selectedFoods) {
    const food = getFoodById(selected.foodId);
    if (!food) {
      steps.push(`Warning: Food "${selected.foodId}" not found, skipped`);
      continue;
    }

    const multiplier = selected.servings;
    const grams = multiplier * 100;

    addNutrition(totalNutrition, food.nutrition, multiplier);

    const foodCalories = food.nutrition.calories * multiplier;
    const foodProtein = food.nutrition.protein * multiplier;
    const foodCarbs = food.nutrition.totalCarbohydrate * multiplier;
    const foodFat = food.nutrition.totalFat * multiplier;

    breakdown.push({
      id: selected.id,
      foodName: food.name,
      servings: multiplier,
      servingDisplay: `${grams}g`,
      calories: foodCalories,
      protein: foodProtein,
      carbs: foodCarbs,
      fat: foodFat,
    });

    steps.push(
      `${food.name}: ${grams}g = ${foodCalories.toFixed(0)} cal, ` +
        `${foodProtein.toFixed(1)}g protein, ${foodCarbs.toFixed(1)}g carbs, ${foodFat.toFixed(1)}g fat`
    );
  }

  const calorieBreakdown = calculateCalorieBreakdown(totalNutrition);

  steps.push("");
  steps.push(`Total: ${totalNutrition.calories.toFixed(0)} calories`);
  steps.push(
    `Calorie breakdown: ${calorieBreakdown.proteinPercent.toFixed(0)}% protein, ` +
      `${calorieBreakdown.carbsPercent.toFixed(0)}% carbs, ${calorieBreakdown.fatPercent.toFixed(0)}% fat`
  );

  return {
    ok: true,
    value: {
      totalNutrition,
      breakdown,
      calorieBreakdown,
      steps,
    },
  };
}

/**
 * Format nutrition value with unit
 */
export function formatNutritionValue(value: number, unit: string, decimals = 1): string {
  if (value === 0) return `0${unit}`;
  if (value < 0.1) return `<0.1${unit}`;
  return `${value.toFixed(decimals)}${unit}`;
}
