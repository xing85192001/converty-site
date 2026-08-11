"use client";

import { ArrowRightLeft, Info, RotateCcw, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isVolumeUnit, isWeightUnit, UNIT_LABELS } from "@/lib/converters/cooking/types";
import { INGREDIENT_DENSITIES } from "@/lib/data/cooking-densities";
import { useCookingUnitsStore } from "@/stores/cooking-units-store";

export function CookingUnitsCalculator() {
  const t = useTranslations("calculator.cooking.units");
  const commonT = useTranslations("common");

  const {
    amount,
    fromUnit,
    toUnit,
    ingredientId,
    result,
    error,
    setAmount,
    setFromUnit,
    setToUnit,
    setIngredientId,
    swapUnits,
    calculate,
    reset,
  } = useCookingUnitsStore();

  // Calculate on mount with URL params
  useEffect(() => {
    calculate();
  }, [calculate]);

  // Check if volume<->weight conversion (needs ingredient)
  const needsIngredient =
    (isVolumeUnit(fromUnit) && isWeightUnit(toUnit)) ||
    (isWeightUnit(fromUnit) && isVolumeUnit(toUnit));

  // Group units for dropdown
  const volumeUnits = ["ml", "l", "cup", "tbsp", "tsp", "fl-oz"] as const;
  const weightUnits = ["g", "kg", "oz", "lb"] as const;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {t("input")}
          </CardTitle>
          <CardDescription>{t("inputDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
              placeholder="1"
            />
          </div>

          {/* From/To Units */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <div className="space-y-2">
              <Label htmlFor="fromUnit">{t("from")}</Label>
              <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as typeof fromUnit)}>
                <SelectTrigger id="fromUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("volumeMetric")}</SelectLabel>
                    {volumeUnits.slice(0, 2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("volumeImperial")}</SelectLabel>
                    {volumeUnits.slice(2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("weightMetric")}</SelectLabel>
                    {weightUnits.slice(0, 2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("weightImperial")}</SelectLabel>
                    {weightUnits.slice(2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="icon" onClick={swapUnits} className="mb-0.5">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>

            <div className="space-y-2">
              <Label htmlFor="toUnit">{t("to")}</Label>
              <Select value={toUnit} onValueChange={(v) => setToUnit(v as typeof toUnit)}>
                <SelectTrigger id="toUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("volumeMetric")}</SelectLabel>
                    {volumeUnits.slice(0, 2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("volumeImperial")}</SelectLabel>
                    {volumeUnits.slice(2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("weightMetric")}</SelectLabel>
                    {weightUnits.slice(0, 2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("weightImperial")}</SelectLabel>
                    {weightUnits.slice(2).map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ingredient Selector (for volume<->weight) */}
          {needsIngredient && (
            <div className="space-y-2">
              <Label htmlFor="ingredient">{t("ingredient")}</Label>
              <Select value={ingredientId} onValueChange={setIngredientId}>
                <SelectTrigger id="ingredient">
                  <SelectValue placeholder={t("selectIngredient")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("ingredientCategories.flour")}</SelectLabel>
                    {INGREDIENT_DENSITIES.filter((i) => i.category === "flour").map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("ingredientCategories.sugar")}</SelectLabel>
                    {INGREDIENT_DENSITIES.filter((i) => i.category === "sugar").map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("ingredientCategories.liquid")}</SelectLabel>
                    {INGREDIENT_DENSITIES.filter((i) => i.category === "liquid").map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("ingredientCategories.dairy")}</SelectLabel>
                    {INGREDIENT_DENSITIES.filter((i) => i.category === "dairy").map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("ingredientCategories.fat")}</SelectLabel>
                    {INGREDIENT_DENSITIES.filter((i) => i.category === "fat").map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>{t("ingredientCategories.other")}</SelectLabel>
                    {INGREDIENT_DENSITIES.filter((i) => i.category === "other").map((ing) => (
                      <SelectItem key={ing.id} value={ing.id}>
                        {ing.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                {t("ingredientHint")}
              </p>
            </div>
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
      {result && !result.requiresIngredient && (
        <Card>
          <CardHeader>
            <CardTitle>{t("result")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold mb-2">
                {result.convertedAmountFractional} {UNIT_LABELS[result.convertedUnit]}
              </div>
              <div className="text-lg text-muted-foreground">
                ({result.convertedAmount.toFixed(4)} {UNIT_LABELS[result.convertedUnit]})
              </div>
              {result.ingredientName && (
                <div className="text-sm text-muted-foreground mt-2">
                  {t("forIngredient")}: {result.ingredientName}
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <Label>{t("conversionSteps")}</Label>
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

      {/* Ingredient Required Notice */}
      {result?.requiresIngredient && !ingredientId && (
        <Card className="border-blue-500">
          <CardContent className="pt-6">
            <p className="text-blue-600 flex items-center gap-2">
              <Info className="h-4 w-4" />
              {t("selectIngredientNotice")}
            </p>
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
