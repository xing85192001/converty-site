"use client";

import { Apple, RotateCcw, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatNutritionValue,
  getFoodById,
  searchFoods,
} from "@/lib/converters/cooking/nutrition-calculator";
import { useNutritionCalculatorStore } from "@/stores/nutrition-calculator-store";

export function NutritionCalculatorComponent() {
  const t = useTranslations("calculator.cooking.nutrition");
  const commonT = useTranslations("common");

  const {
    selectedFoods,
    searchQuery,
    result,
    error,
    setSearchQuery,
    addFood,
    updateFoodServings,
    removeFood,
    reset,
  } = useNutritionCalculatorStore();

  const [showSearch, setShowSearch] = useState(false);

  // Get search results
  const searchResults = searchQuery.length >= 2 ? searchFoods(searchQuery).slice(0, 10) : [];

  return (
    <div className="space-y-6">
      {/* Food Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            {t("selectFoods")}
          </CardTitle>
          <CardDescription>{t("selectFoodsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder={t("searchPlaceholder")}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-accent flex justify-between items-center"
                    onClick={() => {
                      addFood(food.id);
                      setShowSearch(false);
                    }}
                  >
                    <span>{food.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {food.nutrition.calories} cal/100g
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div className="space-y-2">
              <Label>{t("selectedFoods")}</Label>
              <div className="space-y-2">
                {selectedFoods.map((selected) => {
                  const food = getFoodById(selected.foodId);
                  if (!food) return null;

                  return (
                    <div
                      key={selected.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <span className="flex-1 font-medium">{food.name}</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={selected.servings}
                          onChange={(e) =>
                            updateFoodServings(
                              selected.id,
                              Number.parseFloat(e.target.value) || 0.1
                            )
                          }
                          className="w-20 h-8"
                        />
                        <span className="text-sm text-muted-foreground">x 100g</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFood(selected.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedFoods.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("noFoodsSelected")}</p>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && result.breakdown.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">
                  {result.totalNutrition.calories.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">{t("calories")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.totalNutrition.protein.toFixed(1)}g
                </div>
                <div className="text-sm text-muted-foreground">{t("protein")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.totalNutrition.totalCarbohydrate.toFixed(1)}g
                </div>
                <div className="text-sm text-muted-foreground">{t("carbs")}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {result.totalNutrition.totalFat.toFixed(1)}g
                </div>
                <div className="text-sm text-muted-foreground">{t("fat")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Calorie Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t("calorieBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 h-8 rounded-md overflow-hidden">
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${result.calorieBreakdown.proteinPercent}%` }}
                >
                  {result.calorieBreakdown.proteinPercent > 10 &&
                    `${result.calorieBreakdown.proteinPercent.toFixed(0)}%`}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${result.calorieBreakdown.carbsPercent}%` }}
                >
                  {result.calorieBreakdown.carbsPercent > 10 &&
                    `${result.calorieBreakdown.carbsPercent.toFixed(0)}%`}
                </div>
                <div
                  className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${result.calorieBreakdown.fatPercent}%` }}
                >
                  {result.calorieBreakdown.fatPercent > 10 &&
                    `${result.calorieBreakdown.fatPercent.toFixed(0)}%`}
                </div>
              </div>
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>
                    {t("protein")} ({result.calorieBreakdown.fromProtein.toFixed(0)} cal)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>
                    {t("carbs")} ({result.calorieBreakdown.fromCarbs.toFixed(0)} cal)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>
                    {t("fat")} ({result.calorieBreakdown.fromFat.toFixed(0)} cal)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Nutrition */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detailedNutrition")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("saturatedFat")}</span>
                  <span>{formatNutritionValue(result.totalNutrition.saturatedFat, "g")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("transFat")}</span>
                  <span>{formatNutritionValue(result.totalNutrition.transFat, "g")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cholesterol")}</span>
                  <span>{formatNutritionValue(result.totalNutrition.cholesterol, "mg", 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("sodium")}</span>
                  <span>{formatNutritionValue(result.totalNutrition.sodium, "mg", 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("fiber")}</span>
                  <span>{formatNutritionValue(result.totalNutrition.dietaryFiber, "g")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("sugars")}</span>
                  <span>{formatNutritionValue(result.totalNutrition.totalSugars, "g")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t("foodBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("food")}</TableHead>
                    <TableHead className="text-right">{t("amount")}</TableHead>
                    <TableHead className="text-right">{t("calories")}</TableHead>
                    <TableHead className="text-right">{t("protein")}</TableHead>
                    <TableHead className="text-right">{t("carbs")}</TableHead>
                    <TableHead className="text-right">{t("fat")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.breakdown.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.foodName}</TableCell>
                      <TableCell className="text-right">{item.servingDisplay}</TableCell>
                      <TableCell className="text-right">{item.calories.toFixed(0)}</TableCell>
                      <TableCell className="text-right">{item.protein.toFixed(1)}g</TableCell>
                      <TableCell className="text-right">{item.carbs.toFixed(1)}g</TableCell>
                      <TableCell className="text-right">{item.fat.toFixed(1)}g</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
