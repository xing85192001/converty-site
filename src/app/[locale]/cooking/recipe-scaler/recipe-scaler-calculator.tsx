"use client";

import { ArrowRight, Info, Plus, RotateCcw, Trash2, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
import { COMMON_UNITS } from "@/lib/converters/cooking/recipe-scaler";
import type { IngredientType } from "@/lib/converters/cooking/types";
import { useRecipeScalerStore } from "@/stores/recipe-scaler-store";

const INGREDIENT_TYPES: IngredientType[] = [
  "standard",
  "salt",
  "spice",
  "leavening",
  "liquid",
  "extract",
];

export function RecipeScalerCalculator() {
  const t = useTranslations("calculator.cooking.recipeScaler");
  const commonT = useTranslations("common");

  const {
    recipeName,
    originalServings,
    desiredServings,
    ingredients,
    result,
    error,
    setRecipeName,
    setOriginalServings,
    setDesiredServings,
    addIngredient,
    updateIngredient,
    removeIngredient,
    calculate,
    reset,
  } = useRecipeScalerStore();

  // Calculate on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  const scaleFactor = originalServings > 0 ? desiredServings / originalServings : 1;
  const isScalingUp = scaleFactor > 1;
  const isScalingDown = scaleFactor < 1;

  return (
    <div className="space-y-6">
      {/* Recipe Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            {t("recipeInfo")}
          </CardTitle>
          <CardDescription>{t("recipeInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipeName">{t("recipeName")}</Label>
            <Input
              id="recipeName"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              placeholder={t("recipeNamePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="originalServings">{t("originalServings")}</Label>
              <Input
                id="originalServings"
                type="number"
                min="1"
                value={originalServings}
                onChange={(e) => setOriginalServings(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center justify-center pb-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredServings">{t("desiredServings")}</Label>
              <Input
                id="desiredServings"
                type="number"
                min="1"
                value={desiredServings}
                onChange={(e) => setDesiredServings(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Scale Factor Display */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">{t("scaleFactor")}:</span>
            <Badge variant={isScalingUp ? "default" : isScalingDown ? "secondary" : "outline"}>
              {scaleFactor.toFixed(2)}x
            </Badge>
            {isScalingUp && <span className="text-sm text-green-600">{t("scalingUp")}</span>}
            {isScalingDown && <span className="text-sm text-orange-600">{t("scalingDown")}</span>}
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
                  <TableHead className="min-w-[80px]">{t("amount")}</TableHead>
                  <TableHead className="min-w-[80px]">{t("unit")}</TableHead>
                  <TableHead className="min-w-[150px]">{t("type")}</TableHead>
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
                        value={ing.amount || ""}
                        onChange={(e) =>
                          updateIngredient(ing.id, { amount: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ing.unit}
                        onValueChange={(v) => updateIngredient(ing.id, { unit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ing.type}
                        onValueChange={(v) =>
                          updateIngredient(ing.id, { type: v as IngredientType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INGREDIENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`types.${type}`)}
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
      {result && result.scaledIngredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("result")}</CardTitle>
            <CardDescription>
              {t("resultDescription", {
                original: result.originalServings,
                desired: result.desiredServings,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scaling Notes */}
            {result.notes.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardContent className="pt-6 flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {t("scalingNotes")}
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.notes.map((note, i) => (
                        <li
                          key={`note-${i}-${note.slice(0, 20)}`}
                          className="text-sm text-blue-700 dark:text-blue-300"
                        >
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scaled Ingredients Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ingredientName")}</TableHead>
                    <TableHead className="text-right">{t("original")}</TableHead>
                    <TableHead className="text-right">{t("scaled")}</TableHead>
                    <TableHead className="text-right">{t("fractional")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.scaledIngredients.map((ing) => (
                    <TableRow key={ing.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ing.name}
                          {ing.wasAdjusted && (
                            <Badge variant="outline" className="text-xs">
                              {t(`types.${ing.type}`)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {ing.originalAmountDisplay}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {ing.scaledAmountDisplay}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {ing.scaledAmountFractional}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
