// src/lib/data/cooking-densities.ts

import type { IngredientDensity } from "@/lib/converters/cooking/types";

/**
 * Ingredient densities in g/ml
 * Source: King Arthur Baking, USDA standards
 * Note: 1 cup = 240ml (US standard)
 */
export const INGREDIENT_DENSITIES: IngredientDensity[] = [
  // Flours
  { id: "flour-all-purpose", name: "All-purpose flour", density: 0.53, category: "flour" },
  { id: "flour-bread", name: "Bread flour", density: 0.55, category: "flour" },
  { id: "flour-cake", name: "Cake flour", density: 0.48, category: "flour" },
  { id: "flour-whole-wheat", name: "Whole wheat flour", density: 0.51, category: "flour" },
  { id: "flour-almond", name: "Almond flour", density: 0.4, category: "flour" },
  { id: "flour-coconut", name: "Coconut flour", density: 0.5, category: "flour" },

  // Sugars
  { id: "sugar-white", name: "White sugar (granulated)", density: 0.85, category: "sugar" },
  { id: "sugar-brown", name: "Brown sugar (packed)", density: 0.93, category: "sugar" },
  { id: "sugar-powdered", name: "Powdered sugar", density: 0.48, category: "sugar" },
  { id: "honey", name: "Honey", density: 1.42, category: "sugar" },
  { id: "maple-syrup", name: "Maple syrup", density: 1.37, category: "sugar" },

  // Liquids
  { id: "water", name: "Water", density: 1.0, category: "liquid" },
  { id: "milk", name: "Milk", density: 1.03, category: "liquid" },
  { id: "cream-heavy", name: "Heavy cream", density: 0.99, category: "liquid" },
  { id: "oil-vegetable", name: "Vegetable oil", density: 0.92, category: "liquid" },
  { id: "oil-olive", name: "Olive oil", density: 0.91, category: "liquid" },

  // Dairy
  { id: "butter", name: "Butter", density: 0.96, category: "dairy" },
  { id: "cream-cheese", name: "Cream cheese", density: 1.02, category: "dairy" },
  { id: "sour-cream", name: "Sour cream", density: 0.97, category: "dairy" },
  { id: "yogurt", name: "Yogurt", density: 1.03, category: "dairy" },

  // Fats
  { id: "lard", name: "Lard", density: 0.92, category: "fat" },
  { id: "shortening", name: "Shortening", density: 0.91, category: "fat" },
  { id: "coconut-oil", name: "Coconut oil", density: 0.92, category: "fat" },

  // Other common ingredients
  { id: "cocoa-powder", name: "Cocoa powder", density: 0.42, category: "other" },
  { id: "cornstarch", name: "Cornstarch", density: 0.54, category: "other" },
  { id: "oats-rolled", name: "Rolled oats", density: 0.38, category: "other" },
  { id: "rice-uncooked", name: "Rice (uncooked)", density: 0.79, category: "other" },
  { id: "salt-table", name: "Table salt", density: 1.22, category: "other" },
  { id: "baking-powder", name: "Baking powder", density: 0.9, category: "other" },
  { id: "baking-soda", name: "Baking soda", density: 0.9, category: "other" },
];

/**
 * Get ingredient by ID
 */
export function getIngredientDensity(id: string): IngredientDensity | undefined {
  return INGREDIENT_DENSITIES.find((ing) => ing.id === id);
}

/**
 * Get ingredients by category
 */
export function getIngredientsByCategory(
  category: IngredientDensity["category"]
): IngredientDensity[] {
  return INGREDIENT_DENSITIES.filter((ing) => ing.category === category);
}
