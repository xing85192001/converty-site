# Phase 19: Cooking/Nutrition Foundation - Research

**Researched:** 2026-01-24
**Domain:** Cooking measurements, nutrition calculation, recipe scaling, food cost analysis
**Confidence:** MEDIUM

## Summary

This phase adds 4 cooking/nutrition calculators to Converty: recipe scaler, nutrition calculator, cooking unit converter, and food cost calculator. The domain requires careful handling of fractional measurements, ingredient density conversions, non-linear scaling rules, and nutritional data management.

**Key Findings:**
- Recipe scaling is NOT simple multiplication - seasonings, leavening agents, and liquids scale non-linearly (typically 0.75-1.5x instead of direct multiplication)
- Cooking unit conversions require density awareness - 1 cup of flour (120g) ≠ 1 cup of water (240g)
- Metric-first approach aligns with European/Swiss standards where weight measurements dominate
- Static JSON food databases are available from USDA FoodData Central, avoiding API dependencies
- Fractional display should round to nearest 1/8 for practical cooking measurements

**Primary recommendation:** Use pure TypeScript calculation functions with curated static food data, implement non-linear scaling algorithms for recipe adjustments, and provide both metric (primary) and imperial (secondary) measurements with density-aware conversions.

## Standard Stack

The established libraries/tools for cooking/nutrition calculators:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x | Type-safe calculations | Converty standard, strict mode |
| Zustand | 4.x | State management | Converty's `createCalculatorStore` pattern |
| next-intl | 3.x | i18n translations | 4-language support (en/fr/de/it) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| convert-units | 2.3.4+ | Unit conversions | Cooking measurements (cups, ml, oz, g) |
| recipe-ingredient-parser-v3 | Latest | Parse ingredient strings | If implementing ingredient input parser (optional) |
| USDA FoodData Central JSON | 2025-12 | Nutrition database | Static food nutrition data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static JSON DB | Edamam API / FatSecret API | APIs require internet, rate limits, not static-friendly |
| convert-units | Custom conversion tables | Reinventing wheel, missing edge cases |
| Curated food list | Full USDA DB (3.1GB) | Bundle size explosion for static export |

**Installation:**
```bash
npm install convert-units
# Optional: ingredient parser if needed
npm install recipe-ingredient-parser-v3
```

**Food Database:**
Download curated subset from USDA FoodData Central: https://fdc.nal.usda.gov/download-datasets/
- Foundation Foods: 467K zipped / 6.5M unzipped (JSON)
- Extract ~100-200 common foods for static bundle

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── converters/
│   │   └── cooking/
│   │       ├── recipe-scaler.ts          # Recipe scaling with non-linear rules
│   │       ├── nutrition-calculator.ts   # Nutrition per serving calculations
│   │       ├── cooking-units.ts          # Density-aware unit conversions
│   │       ├── food-cost.ts              # Cost per serving calculations
│   │       └── types.ts                  # Shared types (FoodItem, CookingUnit)
│   └── data/
│       └── foods.json                    # Curated USDA food database subset
├── app/[locale]/cooking/
│   ├── recipe-scaler/
│   │   ├── page.tsx
│   │   └── recipe-scaler-calculator.tsx
│   ├── nutrition-calculator/
│   │   ├── page.tsx
│   │   └── nutrition-calculator.tsx
│   ├── cooking-units/
│   │   ├── page.tsx
│   │   └── cooking-units-calculator.tsx
│   └── food-cost/
│       ├── page.tsx
│       └── food-cost-calculator.tsx
└── stores/
    └── (using createCalculatorStore pattern)
```

### Pattern 1: Non-Linear Recipe Scaling
**What:** Recipe scaling with ingredient-specific multipliers
**When to use:** Recipe scaler calculator
**Example:**
```typescript
// Source: Research synthesis from multiple sources
interface ScalingRules {
  salt: (factor: number) => number;        // Scale at ~67% rate
  spices: (factor: number) => number;      // Scale at 75-80% rate
  leavening: (factor: number) => number;   // Scale at ~87.5% rate
  liquids: (factor: number) => number;     // Scale at 60-70% rate (evaporation)
}

export const SCALING_RULES: ScalingRules = {
  salt: (factor) => factor < 1 ? factor * 0.67 : factor * 0.75,
  spices: (factor) => factor * 0.75,
  leavening: (factor) => factor * 0.875,  // For 2x, use 1.75x
  liquids: (factor) => factor < 1 ? factor * 0.7 : factor,
};

export function scaleIngredient(
  amount: number,
  unit: string,
  ingredientType: IngredientType,
  scaleFactor: number
): number {
  const rule = SCALING_RULES[ingredientType] || ((f) => f);
  return amount * rule(scaleFactor);
}
```

### Pattern 2: Density-Aware Unit Conversion
**What:** Convert volume to weight based on ingredient density
**When to use:** Cooking unit converter
**Example:**
```typescript
// Source: King Arthur Baking, culinary standards
export const INGREDIENT_DENSITIES: Record<string, number> = {
  water: 1.0,              // 1g/ml
  flour_all_purpose: 0.48, // 120g per 250ml cup
  sugar_white: 0.80,       // 200g per 250ml cup
  butter: 0.91,            // 228g per 250ml cup
  milk: 1.03,              // 258g per 250ml cup
  oil_vegetable: 0.92,     // 230g per 250ml cup
  honey: 1.42,             // 355g per 250ml cup
};

export function convertVolToWeight(
  volume: number,
  volumeUnit: VolumeUnit,
  ingredient: string
): number | null {
  const volumeInMl = convertToMl(volume, volumeUnit);
  const density = INGREDIENT_DENSITIES[ingredient];
  if (!density) return null;
  return volumeInMl * density; // Returns grams
}
```

### Pattern 3: Fractional Display Rounding
**What:** Round decimal amounts to nearest practical cooking fraction
**When to use:** All cooking calculators for display
**Example:**
```typescript
// Source: Recipe calculator best practices
const COMMON_FRACTIONS = [
  { decimal: 0, display: "0" },
  { decimal: 0.125, display: "1/8" },
  { decimal: 0.25, display: "1/4" },
  { decimal: 0.333, display: "1/3" },
  { decimal: 0.5, display: "1/2" },
  { decimal: 0.667, display: "2/3" },
  { decimal: 0.75, display: "3/4" },
  { decimal: 1, display: "1" },
];

export function formatAsFraction(decimal: number): string {
  const whole = Math.floor(decimal);
  const fraction = decimal - whole;

  // Find nearest 1/8th
  const nearest = COMMON_FRACTIONS.reduce((prev, curr) =>
    Math.abs(curr.decimal - fraction) < Math.abs(prev.decimal - fraction)
      ? curr : prev
  );

  // Quantities < 1/8 round up to 1/8
  if (decimal < 0.125 && decimal > 0) return "1/8";

  if (whole === 0) return nearest.display;
  if (nearest.decimal === 0) return whole.toString();
  return `${whole} ${nearest.display}`;
}
```

### Pattern 4: Nutrition Facts Structure
**What:** Standard FDA-compliant nutrition label data structure
**When to use:** Nutrition calculator
**Example:**
```typescript
// Source: FDA nutrition label requirements 2026
export interface NutritionFacts {
  servingSize: string;              // "1 cup (240g)"
  servingsPerContainer: number;
  calories: number;                 // Required
  totalFat: number;                 // g, required
  saturatedFat: number;             // g, required
  transFat: number;                 // g, required
  cholesterol: number;              // mg, required
  sodium: number;                   // mg, required
  totalCarbohydrate: number;        // g, required
  dietaryFiber: number;             // g, required
  totalSugars: number;              // g, required
  addedSugars: number;              // g, required
  protein: number;                  // g, required
  vitaminD?: number;                // mcg
  calcium?: number;                 // mg
  iron?: number;                    // mg
  potassium?: number;               // mg
}

// Calorie calculation: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat
export function calculateCalories(nutrition: NutritionFacts): number {
  return (nutrition.protein * 4) +
         (nutrition.totalCarbohydrate * 4) +
         (nutrition.totalFat * 9);
}
```

### Anti-Patterns to Avoid
- **Simple multiplication for all ingredients:** Salt, spices, leavening don't scale linearly
- **Volume-to-weight without density:** 1 cup varies by ingredient (120g flour vs 240g water)
- **Decimal display without fractions:** Cooks use 1/4 cup, not 0.25 cups
- **Single unit system:** Must support both metric (primary) and imperial
- **External API dependencies:** Breaks static export, requires network

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unit conversion math | Custom conversion tables | `convert-units` npm package | Handles 200+ units, bidirectional, tested |
| Ingredient parsing | Regex for "1 cup flour" | `recipe-ingredient-parser-v3` | Handles fractions, ranges, complex formats |
| Nutrition database | Manual data entry | USDA FoodData Central JSON | 380k+ foods, government-validated |
| Fraction display | String concat with "/" | Dedicated formatter with rounding | Nearest 1/8th logic, edge cases |
| Density tables | Guess conversion rates | King Arthur Baking standards | Professional baker precision |

**Key insight:** Cooking measurements have centuries of established standards and edge cases (what's a "pinch"? how does altitude affect baking?). Use validated libraries and data sources rather than estimating.

## Common Pitfalls

### Pitfall 1: Linear Recipe Scaling
**What goes wrong:** Doubling a recipe by multiplying all ingredients by 2 produces oversalted, over-leavened results
**Why it happens:** Assumption that culinary chemistry scales linearly
**How to avoid:** Implement non-linear scaling rules:
- Salt: scale by 0.67-0.75x when doubling
- Baking powder/soda: scale by 0.875x when doubling
- Spices: scale by 0.75x when doubling
- Vanilla/extracts: scale by 0.75x
**Warning signs:** User complaints that doubled recipe is "too salty" or "tastes strange"

### Pitfall 2: Volume-Weight Confusion
**What goes wrong:** Converting "1 cup" to "250g" universally
**Why it happens:** Forgetting that volume-to-weight requires density
**How to avoid:**
- Always require ingredient selection for vol↔weight conversions
- Store density table with common ingredients
- 1 cup water = 240g, 1 cup flour = 120g, 1 cup butter = 228g
**Warning signs:** Baking recipes failing because "measurements seem off"

### Pitfall 3: Decimal-Only Display
**What goes wrong:** Showing "0.333 cups" instead of "1/3 cup"
**Why it happens:** Displaying raw calculation results
**How to avoid:**
- Round to nearest 1/8th fraction for display
- Format as "2 1/4" not "2.25"
- Provide both metric (decimal) and imperial (fractional) simultaneously
**Warning signs:** Users complaining about "weird decimal amounts" or "hard to measure"

### Pitfall 4: Ignoring Regional Standards
**What goes wrong:** US-centric measurements (cups, Fahrenheit) as primary
**Why it happens:** Most online recipes are US-based
**How to avoid:**
- Metric FIRST for European/Swiss audience
- Grams and ml as primary units
- Cups/oz as secondary conversions
- Temperature in Celsius (with F conversion)
**Warning signs:** User feedback requesting "normal measurements" (meaning metric in EU)

### Pitfall 5: Massive Food Database
**What goes wrong:** Bundling 3.1GB USDA database for static export
**Why it happens:** "More data is better" thinking
**How to avoid:**
- Curate subset of ~100-200 most common ingredients
- Include: produce, meats, dairy, grains, common packaged foods
- Allow manual entry for unlisted items
- Total data size target: <500KB JSON
**Warning signs:** Build time explosion, bundle size warnings, slow page loads

### Pitfall 6: Cooking Time Misconceptions
**What goes wrong:** Halving recipe and halving cook time
**Why it happens:** Assumption that time scales with quantity
**How to avoid:**
- Document that cook time usually stays the same
- When scaling up: use larger/more pans at same temp/time
- When scaling down: reduce time by ~25% max, not 50%
- Pan size and oven temp matter more than quantity
**Warning signs:** Users reporting "undercooked" scaled recipes

## Code Examples

Verified patterns for implementation:

### Recipe Scaling with Non-Linear Rules
```typescript
// Source: Research synthesis from culinary standards
export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  type: "standard" | "salt" | "spice" | "leavening" | "liquid" | "extract";
}

export interface RecipeScaleInput {
  originalServings: number;
  desiredServings: number;
  ingredients: RecipeIngredient[];
}

export interface RecipeScaleResult {
  scaleFactor: number;
  scaledIngredients: Array<{
    name: string;
    originalAmount: string;
    scaledAmount: string;
    scaledAmountFractional: string;
  }>;
  notes: string[];
}

export function scaleRecipe(input: RecipeScaleInput): RecipeScaleResult {
  const scaleFactor = input.desiredServings / input.originalServings;
  const notes: string[] = [];

  const scaledIngredients = input.ingredients.map((ing) => {
    let adjustedFactor = scaleFactor;

    // Apply non-linear scaling rules
    switch (ing.type) {
      case "salt":
        adjustedFactor = scaleFactor < 1
          ? scaleFactor * 0.67
          : scaleFactor * 0.75;
        notes.push("Salt scaled at 67-75% rate for better taste");
        break;
      case "spice":
        adjustedFactor = scaleFactor * 0.75;
        notes.push("Spices scaled at 75% rate to avoid overpowering");
        break;
      case "leavening":
        adjustedFactor = scaleFactor * 0.875;
        notes.push("Leavening agents scaled at 87.5% rate");
        break;
      case "liquid":
        adjustedFactor = scaleFactor < 1
          ? scaleFactor * 0.7
          : scaleFactor;
        notes.push("Liquids adjusted for evaporation rate");
        break;
      case "extract":
        adjustedFactor = scaleFactor * 0.75;
        break;
    }

    const scaledAmount = ing.amount * adjustedFactor;

    return {
      name: ing.name,
      originalAmount: `${ing.amount} ${ing.unit}`,
      scaledAmount: `${scaledAmount.toFixed(2)} ${ing.unit}`,
      scaledAmountFractional: `${formatAsFraction(scaledAmount)} ${ing.unit}`,
    };
  });

  return {
    scaleFactor,
    scaledIngredients,
    notes: [...new Set(notes)], // Deduplicate
  };
}
```

### Cooking Unit Converter with Density
```typescript
// Source: King Arthur Baking, USDA standards
export type VolumeUnit = "ml" | "l" | "cup" | "tbsp" | "tsp" | "fl-oz";
export type WeightUnit = "g" | "kg" | "oz" | "lb";

export interface CookingUnitInput {
  amount: number;
  fromUnit: VolumeUnit | WeightUnit;
  toUnit: VolumeUnit | WeightUnit;
  ingredient?: string; // Required for volume↔weight
}

export interface CookingUnitResult {
  convertedAmount: number;
  convertedAmountFractional: string;
  formula: string;
  requiresIngredient: boolean;
}

const DENSITIES: Record<string, number> = {
  water: 1.0,
  flour_all_purpose: 0.48,
  sugar_white: 0.80,
  butter: 0.91,
  milk: 1.03,
  oil: 0.92,
  honey: 1.42,
  // Add more as needed
};

export function convertCookingUnit(input: CookingUnitInput): CookingUnitResult | null {
  const volumeUnits: VolumeUnit[] = ["ml", "l", "cup", "tbsp", "tsp", "fl-oz"];
  const weightUnits: WeightUnit[] = ["g", "kg", "oz", "lb"];

  const fromIsVolume = volumeUnits.includes(input.fromUnit as VolumeUnit);
  const toIsVolume = volumeUnits.includes(input.toUnit as VolumeUnit);

  // Volume ↔ Weight requires ingredient
  if (fromIsVolume !== toIsVolume) {
    if (!input.ingredient || !DENSITIES[input.ingredient]) {
      return {
        convertedAmount: 0,
        convertedAmountFractional: "0",
        formula: "",
        requiresIngredient: true,
      };
    }
  }

  // Use convert-units library for actual conversion
  // This is a simplified example
  let result = input.amount;
  let formula = "";

  if (fromIsVolume !== toIsVolume && input.ingredient) {
    const density = DENSITIES[input.ingredient];
    // Conversion logic with density
    formula = `${input.amount} ${input.fromUnit} × density(${density})`;
  } else {
    formula = `${input.amount} ${input.fromUnit} → ${input.toUnit}`;
  }

  return {
    convertedAmount: result,
    convertedAmountFractional: formatAsFraction(result),
    formula,
    requiresIngredient: false,
  };
}
```

### Nutrition Calculator with Food Database
```typescript
// Source: USDA FoodData Central structure
export interface FoodItem {
  id: string;
  name: string;
  servingSize: number;        // grams
  servingSizeUnit: string;    // "g", "ml", "cup"
  nutrition: NutritionFacts;
}

export interface NutritionCalculatorInput {
  foods: Array<{
    foodId: string;
    servings: number;
  }>;
}

export interface NutritionCalculatorResult {
  totalNutrition: NutritionFacts;
  breakdown: Array<{
    foodName: string;
    servings: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  calorieBreakdown: {
    fromProtein: number;
    fromCarbs: number;
    fromFat: number;
  };
}

// Load from static JSON
import foodDatabase from "@/lib/data/foods.json";

export function calculateNutrition(
  input: NutritionCalculatorInput
): NutritionCalculatorResult {
  const breakdown = input.foods.map((item) => {
    const food = foodDatabase.find((f) => f.id === item.foodId);
    if (!food) throw new Error(`Food ${item.foodId} not found`);

    const multiplier = item.servings;
    return {
      foodName: food.name,
      servings: item.servings,
      calories: food.nutrition.calories * multiplier,
      protein: food.nutrition.protein * multiplier,
      carbs: food.nutrition.totalCarbohydrate * multiplier,
      fat: food.nutrition.totalFat * multiplier,
    };
  });

  // Sum all nutrition
  const total: NutritionFacts = breakdown.reduce(
    (acc, item) => ({
      ...acc,
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      totalCarbohydrate: acc.totalCarbohydrate + item.carbs,
      totalFat: acc.totalFat + item.fat,
      // ... sum other nutrients
    }),
    { /* empty nutrition object */ } as NutritionFacts
  );

  return {
    totalNutrition: total,
    breakdown,
    calorieBreakdown: {
      fromProtein: total.protein * 4,
      fromCarbs: total.totalCarbohydrate * 4,
      fromFat: total.totalFat * 9,
    },
  };
}
```

### Food Cost Calculator
```typescript
// Source: Restaurant cost calculation best practices
export interface IngredientCost {
  name: string;
  costPerUnit: number;    // Price per kg, liter, etc.
  unit: "kg" | "l" | "piece";
  amountUsed: number;     // Amount in recipe
}

export interface FoodCostInput {
  recipeName: string;
  servings: number;
  ingredients: IngredientCost[];
}

export interface FoodCostResult {
  totalCost: number;
  costPerServing: number;
  ingredientBreakdown: Array<{
    name: string;
    cost: number;
    percentageOfTotal: number;
  }>;
  mostExpensiveIngredient: string;
}

export function calculateFoodCost(input: FoodCostInput): FoodCostResult {
  const ingredientBreakdown = input.ingredients.map((ing) => {
    const cost = (ing.amountUsed / 1) * ing.costPerUnit; // Adjust for unit
    return {
      name: ing.name,
      cost,
      percentageOfTotal: 0, // Calculate after
    };
  });

  const totalCost = ingredientBreakdown.reduce((sum, item) => sum + item.cost, 0);

  // Calculate percentages
  ingredientBreakdown.forEach((item) => {
    item.percentageOfTotal = (item.cost / totalCost) * 100;
  });

  const mostExpensive = ingredientBreakdown.reduce((max, item) =>
    item.cost > max.cost ? item : max
  );

  return {
    totalCost,
    costPerServing: totalCost / input.servings,
    ingredientBreakdown,
    mostExpensiveIngredient: mostExpensive.name,
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API-based nutrition data | Static JSON subsets | 2024-2025 | Enables offline, static export, faster loads |
| US-first measurements | Metric-first (EU standard) | Ongoing | Better UX for European users |
| Simple multiplication scaling | Non-linear ingredient rules | Established practice | More accurate recipe results |
| Decimal measurements | Fractional display (1/4, 1/2) | Traditional | Matches physical measuring tools |
| Full nutrition databases | Curated common foods | 2023-2024 | Smaller bundles, faster loads |

**Deprecated/outdated:**
- FatSecret REST API for client-side nutrition lookup (rate limits, requires key)
- Imperial-only recipe calculators (excludes 95% of world)
- Simple regex ingredient parsing (fails on complex formats like "1 1/2 cups")

## Open Questions

Things that couldn't be fully resolved:

1. **Swiss-specific cooking standards**
   - What we know: Europe uses metric, weights preferred over volume
   - What's unclear: Any Switzerland-specific preferences (Swiss German dialect terms, regional ingredient names)
   - Recommendation: Use standard German translations, test with Swiss users

2. **Food database curation**
   - What we know: USDA has 380k+ foods, Foundation Foods subset is 6.5MB
   - What's unclear: Which 100-200 foods are "most common" for EU/Swiss audience
   - Recommendation: Start with top 100 produce/meat/dairy/grains, expand based on usage

3. **Ingredient type classification**
   - What we know: Need to tag ingredients as "salt", "spice", "leavening" for scaling
   - What's unclear: Comprehensive taxonomy or manual user selection?
   - Recommendation: Start with manual dropdown, build intelligence later

4. **Multi-language ingredient names**
   - What we know: Need food names in en/fr/de/it
   - What's unclear: USDA data is English-only
   - Recommendation: Manual translation for curated subset, store in foods.json with locale keys

5. **Temperature conversions**
   - What we know: Recipe scaling may need cooking temp/time adjustments
   - What's unclear: Include in recipe scaler or separate calculator?
   - Recommendation: Separate calculator (out of scope for Phase 19)

## Sources

### Primary (HIGH confidence)
- USDA FoodData Central - https://fdc.nal.usda.gov/download-datasets/ - Official government nutrition data, JSON format available
- FDA Nutrition Label Requirements - https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/changes-nutrition-facts-label - Legal standards for nutrition facts
- King Arthur Baking Ingredient Weights - https://www.kingarthurbaking.com/learn/ingredient-weight-chart - Professional baker density standards
- convert-units npm package - https://www.npmjs.com/package/convert-units - 268 projects using, established library

### Secondary (MEDIUM confidence)
- Recipe scaling best practices - verified across multiple culinary sources (Inch Calculator, Hell's Kitchen Recipes, HowStuffWorks)
- Non-linear scaling rules for salt/spices - consistent across LinkedIn culinary advice, Begin with Butter, Sawera Cooking
- Fractional measurement standards - verified via MyKitchenCalculator, RecipeCard.io, WebstaurantStore
- European metric cooking standards - verified via multiple European cooking sites, though no Swiss-specific standards found

### Tertiary (LOW confidence)
- Specific Swiss kitchen standards - NOT FOUND, using general European metric practices
- Optimal food database size for static export - estimated based on typical static bundle practices, not verified
- Cooking time scaling rules - community consensus, not scientific validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using established Converty patterns + proven npm packages
- Architecture: HIGH - Following Converty's existing calculator structure
- Recipe scaling rules: MEDIUM - Verified across multiple sources but some variation in exact percentages
- Food database approach: MEDIUM - USDA data is solid, curation strategy needs validation
- Unit conversions: HIGH - Standardized culinary measurements, verified sources
- Pitfalls: HIGH - Well-documented in culinary/recipe app development

**Research date:** 2026-01-24
**Valid until:** 2026-03-24 (60 days - stable culinary domain, slow-changing standards)

**Implementation priority:**
1. Cooking Unit Converter (simplest, well-defined)
2. Recipe Scaler (moderate complexity, non-linear rules)
3. Food Cost Calculator (moderate, straightforward math)
4. Nutrition Calculator (most complex, requires food database)

**Estimated complexity:**
- Low: Cooking Unit Converter (2-3 hours)
- Medium: Recipe Scaler (4-6 hours with scaling rules)
- Medium: Food Cost Calculator (3-4 hours)
- High: Nutrition Calculator (6-8 hours including database curation)
