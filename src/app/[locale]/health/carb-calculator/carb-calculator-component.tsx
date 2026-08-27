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
  type CarbInput,
  type CarbResult,
  calculateCarbs,
} from "@/lib/converters/health/carb-calculator";
import { CarbFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  calories: string;
  goal: "weightLoss" | "maintenance" | "muscleGain" | "keto" | "lowCarb" | "athlete";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
}

const useStore = createCalculatorStore<FormValues, CarbResult | null>({
  name: "carb-calculator",
  initialValues: {
    calories: "2000",
    goal: "maintenance",
    activityLevel: "moderate",
  },
  schema: CarbFormSchema,
  calculate: (vals) => {
    const input: CarbInput = {
      calories: parseInt(vals.calories) || 0,
      goal: vals.goal,
      activityLevel: vals.activityLevel,
    };
    return calculateCarbs(input);
  },
});

export function CarbCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tCarbs = useTranslations("calculator.health.carbs");

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
          min={1000}
          max={6000}
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
              <SelectItem value="weightLoss">{t("weightLoss")}</SelectItem>
              <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
              <SelectItem value="muscleGain">{t("muscleGain")}</SelectItem>
              <SelectItem value="keto">{t("keto")}</SelectItem>
              <SelectItem value="lowCarb">{t("lowCarb")}</SelectItem>
              <SelectItem value="athlete">{t("athlete")}</SelectItem>
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
              <SelectItem value="athlete">{t("athlete")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("dailyCarbIntake")}
            value={Math.round(result.dailyCarbGrams)}
            unit="g"
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tResults("carbCalories"),
                value: Math.round(result.dailyCarbCalories),
                unit: "kcal",
              },
              {
                label: tResults("carbPercent"),
                value: result.carbPercent,
                unit: "%",
              },
              {
                label: tResults("fiberMin"),
                value: Math.round(result.fiberMin),
                unit: "g",
              },
              {
                label: tResults("sugarMax"),
                value: Math.round(result.sugarMax),
                unit: "g",
              },
              {
                label: tResults("netCarbs"),
                value: Math.round(result.netCarbs),
                unit: "g",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("carbTiming")}</h3>
          <ResultGrid
            results={[
              {
                label: tResults("preworkout"),
                value: Math.round(result.timing.preworkout),
                unit: "g",
              },
              {
                label: tResults("postworkout"),
                value: Math.round(result.timing.postworkout),
                unit: "g",
              },
              {
                label: tResults("otherMeals"),
                value: Math.round(result.timing.other),
                unit: "g",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("carbTypeBreakdown")}</h3>
          <ResultGrid
            results={[
              {
                label: tResults("complexCarbs"),
                value: `${Math.round(result.carbTypes.complex.grams)}g (${result.carbTypes.complex.percent}%)`,
              },
              {
                label: tResults("simpleCarbs"),
                value: `${Math.round(result.carbTypes.simple.grams)}g (${result.carbTypes.simple.percent}%)`,
              },
              {
                label: tResults("fiber"),
                value: `${Math.round(result.carbTypes.fiber.grams)}g (${result.carbTypes.fiber.percent}%)`,
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("complexCarbSources")}</h3>
          <ul className="list-disc list-inside space-y-1 bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            {result.foodSourceKeys.complex.map((key) => (
              <li key={key} className="text-sm text-green-700 dark:text-green-300">
                {tCarbs(`foods.complex.${key}`)}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold">{tResults("simpleCarbSources")}</h3>
          <ul className="list-disc list-inside space-y-1 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            {result.foodSourceKeys.simple.map((key) => (
              <li key={key} className="text-sm text-blue-700 dark:text-blue-300">
                {tCarbs(`foods.simple.${key}`)}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold">{tResults("avoidTheseCarbs")}</h3>
          <ul className="list-disc list-inside space-y-1 bg-red-50 dark:bg-red-950 p-4 rounded-lg">
            {result.foodSourceKeys.avoid.map((key) => (
              <li key={key} className="text-sm text-red-700 dark:text-red-300">
                {tCarbs(`foods.avoid.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
