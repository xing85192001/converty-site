"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateMacros,
  type MacroInput,
  type MacroResult,
} from "@/lib/converters/health/macro-calculator";
import { MacroFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  calories: string;
  goal: "maintenance" | "cutting" | "bulking" | "keto" | "highProtein";
}

const useStore = createCalculatorStore<FormValues, MacroResult | null>({
  name: "macro-calculator",
  initialValues: {
    calories: "2000",
    goal: "maintenance",
  },
  schema: MacroFormSchema,
  calculate: (vals) => {
    const input: MacroInput = {
      calories: parseFloat(vals.calories) || 0,
      goal: vals.goal,
    };
    return calculateMacros(input);
  },
});

export function MacroCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="calories"
          label={t("dailyCalories")}
          value={values.calories}
          onChange={(v) => setValue("calories", v)}
          error={errors.calories}
          min={0}
          step="50"
          placeholder="2000"
        />

        <div className="space-y-2">
          <Label>{t("goal")}</Label>
          <Select
            value={values.goal}
            onValueChange={(v) => setValue("goal", v as typeof values.goal)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
              <SelectItem value="cutting">{t("cutting")}</SelectItem>
              <SelectItem value="bulking">{t("bulking")}</SelectItem>
              <SelectItem value="keto">{t("keto")}</SelectItem>
              <SelectItem value="highProtein">{t("highProtein")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{tResults("dailyMacros")}</h3>
          <ResultGrid
            results={[
              {
                label: tResults("protein"),
                value: Math.round(result.proteinGrams),
                unit: `g (${result.proteinPercent}%)`,
              },
              {
                label: tResults("carbohydrates"),
                value: Math.round(result.carbsGrams),
                unit: `g (${result.carbsPercent}%)`,
              },
              {
                label: tResults("fat"),
                value: Math.round(result.fatGrams),
                unit: `g (${result.fatPercent}%)`,
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("caloriesFromMacros")}</h3>
          <ResultGrid
            results={[
              {
                label: tResults("proteinCalories"),
                value: Math.round(result.proteinCalories),
                unit: "kcal",
              },
              {
                label: tResults("carbsCalories"),
                value: Math.round(result.carbsCalories),
                unit: "kcal",
              },
              {
                label: tResults("fatCalories"),
                value: Math.round(result.fatCalories),
                unit: "kcal",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("perMealBreakdown")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("meals")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("protein")}
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{tResults("carbs")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{tResults("fat")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.mealsBreakdown.map((meal) => (
                  <tr key={meal.meals}>
                    <td className="px-3 py-2 text-sm">
                      {meal.meals} {t("mealsPerDay")}
                    </td>
                    <td className="px-3 py-2 text-sm">{Math.round(meal.protein)}g</td>
                    <td className="px-3 py-2 text-sm">{Math.round(meal.carbs)}g</td>
                    <td className="px-3 py-2 text-sm">{Math.round(meal.fat)}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
