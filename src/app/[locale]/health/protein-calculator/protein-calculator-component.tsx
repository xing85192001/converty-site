"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateProtein,
  type ProteinInput,
  type ProteinResult,
} from "@/lib/converters/health/protein-calculator";
import { ProteinFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  weight: string;
  goal: "sedentary" | "maintenance" | "muscleGain" | "fatLoss" | "athlete" | "endurance";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
}

const useStore = createCalculatorStore<FormValues, ProteinResult | null>({
  name: "protein-calculator",
  initialValues: {
    weight: "75",
    goal: "maintenance",
    activityLevel: "moderate",
  },
  schema: ProteinFormSchema,
  calculate: (vals) => {
    const input: ProteinInput = {
      weight: parseFloat(vals.weight) || 0,
      goal: vals.goal,
      activityLevel: vals.activityLevel,
    };
    return calculateProtein(input);
  },
});

export function ProteinCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tProtein = useTranslations("calculator.health.protein");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="weight"
          label={t("weight")}
          value={values.weight}
          onChange={(v) => setValue("weight", v)}
          error={errors.weight}
          min={0}
          step="0.1"
          placeholder="75"
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
              <SelectItem value="sedentary">{t("sedentary")}</SelectItem>
              <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
              <SelectItem value="muscleGain">{t("muscleGain")}</SelectItem>
              <SelectItem value="fatLoss">{t("fatLoss")}</SelectItem>
              <SelectItem value="athlete">{t("athlete")}</SelectItem>
              <SelectItem value="endurance">{t("endurance")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("activityLevel")}</Label>
          <Select
            value={values.activityLevel}
            onValueChange={(v) => setValue("activityLevel", v as typeof values.activityLevel)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">{t("sedentary")}</SelectItem>
              <SelectItem value="light">{t("light")}</SelectItem>
              <SelectItem value="moderate">{t("moderate")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="veryActive">{t("veryActive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("dailyProtein")}
            value={Math.round(result.dailyProteinOptimal)}
            unit="g"
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tResults("proteinRange"),
                value: `${Math.round(result.dailyProteinMin)} - ${Math.round(result.dailyProteinMax)}`,
                unit: "g/day",
              },
              {
                label: tResults("proteinPerKg"),
                value: `${result.proteinPerKg.min.toFixed(1)} - ${result.proteinPerKg.max.toFixed(1)}`,
                unit: "g/kg",
              },
              {
                label: tResults("percentOfCalories"),
                value: result.percentOfCalories.toFixed(0),
                unit: "%",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("perMealBreakdown")}</h3>
          <ResultGrid
            results={[
              {
                label: `3 ${t("mealsPerDay")}`,
                value: Math.round(result.perMeal.meals3),
                unit: "g",
              },
              {
                label: `4 ${t("mealsPerDay")}`,
                value: Math.round(result.perMeal.meals4),
                unit: "g",
              },
              {
                label: `5 ${t("mealsPerDay")}`,
                value: Math.round(result.perMeal.meals5),
                unit: "g",
              },
              {
                label: `6 ${t("mealsPerDay")}`,
                value: Math.round(result.perMeal.meals6),
                unit: "g",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("foodSources")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("food")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("protein")}
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("serving")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("servingsNeeded")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.foodSources.slice(0, 6).map((source) => (
                  <tr key={source.foodKey}>
                    <td className="px-3 py-2 text-sm">
                      {tProtein(`foods.${source.foodKey}.name`)}
                    </td>
                    <td className="px-3 py-2 text-sm">{source.protein}g</td>
                    <td className="px-3 py-2 text-sm">
                      {tProtein(`foods.${source.foodKey}.serving`)}
                    </td>
                    <td className="px-3 py-2 text-sm">{source.servingsNeeded}</td>
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
