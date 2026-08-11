"use client";

import { Plus, RotateCcw, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type CostUnit, type Currency, formatCurrency } from "@/lib/converters/cooking/food-cost";
import { useFoodCostStore } from "@/stores/food-cost-store";

const CURRENCIES: Currency[] = ["CHF", "EUR", "USD"];
const COST_UNITS: CostUnit[] = ["kg", "g", "l", "ml", "piece"];
const AMOUNT_UNITS: CostUnit[] = ["g", "kg", "ml", "l", "piece"];

export function FoodCostCalculator() {
  const t = useTranslations("calculator.cooking.foodCost");
  const commonT = useTranslations("common");

  const {
    recipeName,
    servings,
    currency,
    ingredients,
    result,
    error,
    setRecipeName,
    setServings,
    setCurrency,
    addIngredient,
    updateIngredient,
    removeIngredient,
    calculate,
    reset,
  } = useFoodCostStore();

  // Calculate on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  return (
    <div className="space-y-6">
      {/* Recipe Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("recipeInfo")}
          </CardTitle>
          <CardDescription>{t("recipeInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipeName">{t("recipeName")}</Label>
              <Input
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder={t("recipeNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">{t("servings")}</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("currency")}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ingredients")}</CardTitle>
          <CardDescription>{t("ingredientsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">{t("ingredientName")}</TableHead>
                  <TableHead className="min-w-[100px]">{t("costPerUnit")}</TableHead>
                  <TableHead className="min-w-[80px]">{t("unit")}</TableHead>
                  <TableHead className="min-w-[100px]">{t("amountUsed")}</TableHead>
                  <TableHead className="min-w-[80px]">{t("amountUnit")}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell>
                      <Input
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                        placeholder={t("ingredientPlaceholder")}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ing.costPerUnit || ""}
                        onChange={(e) =>
                          updateIngredient(ing.id, {
                            costPerUnit: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ing.unit}
                        onValueChange={(v) => updateIngredient(ing.id, { unit: v as CostUnit })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COST_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ing.amountUsed || ""}
                        onChange={(e) =>
                          updateIngredient(ing.id, {
                            amountUsed: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ing.amountUnit}
                        onValueChange={(v) =>
                          updateIngredient(ing.id, { amountUnit: v as CostUnit })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AMOUNT_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeIngredient(ing.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button variant="outline" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-2" />
            {t("addIngredient")}
          </Button>
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
      {result && result.ingredientBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("result")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-muted rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">{t("totalCost")}</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(result.totalCost, result.currency)}
                </div>
              </div>
              <div className="p-6 bg-primary/10 rounded-lg text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {t("costPerServing")} ({result.servings} {t("servingsLabel")})
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(result.costPerServing, result.currency)}
                </div>
              </div>
            </div>

            {/* Most/Least Expensive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.mostExpensiveIngredient && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("mostExpensive")}</div>
                    <div className="font-medium">{result.mostExpensiveIngredient}</div>
                  </div>
                </div>
              )}
              {result.leastExpensiveIngredient && result.ingredientBreakdown.length > 1 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">{t("leastExpensive")}</div>
                    <div className="font-medium">{result.leastExpensiveIngredient}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <Label>{t("costBreakdown")}</Label>
              {result.ingredientBreakdown.map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>
                      {formatCurrency(item.cost, result.currency)} (
                      {item.percentageOfTotal.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${item.percentageOfTotal}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {result.steps.map((step, i) => (
                  <div key={`step-${i}-${step.slice(0, 20)}`} className="font-mono">
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
