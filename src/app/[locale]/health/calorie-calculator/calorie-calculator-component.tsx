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
  type CalorieInput,
  type CalorieResult,
  calculateCalories,
} from "@/lib/converters/health/calorie-calculator";
import { CalorieFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  age: string;
  weight: string;
  height: string;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  targetWeight: string;
  weeksToGoal: string;
}

const useStore = createCalculatorStore<FormValues, CalorieResult | null>({
  name: "calorie-calculator",
  initialValues: {
    gender: "male",
    age: "30",
    weight: "80",
    height: "175",
    activityLevel: "moderate",
    targetWeight: "75",
    weeksToGoal: "12",
  },
  schema: CalorieFormSchema,
  calculate: (vals) => {
    const input: CalorieInput = {
      gender: vals.gender,
      age: parseFloat(vals.age) || 0,
      weight: parseFloat(vals.weight) || 0,
      height: parseFloat(vals.height) || 0,
      activityLevel: vals.activityLevel,
      targetWeight: parseFloat(vals.targetWeight) || 0,
      weeksToGoal: parseFloat(vals.weeksToGoal) || 0,
    };
    return calculateCalories(input);
  },
});

export function CalorieCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("gender")}</Label>
          <Select
            value={values.gender}
            onValueChange={(v) => setValue("gender", v as "male" | "female")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("male")}</SelectItem>
              <SelectItem value="female">{t("female")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="age"
          label={t("age")}
          value={values.age}
          onChange={(v) => setValue("age", v)}
          error={errors.age}
          min={0}
          max={120}
          step="1"
          placeholder="30"
        />

        <InputField
          id="weight"
          label={t("weight")}
          value={values.weight}
          onChange={(v) => setValue("weight", v)}
          error={errors.weight}
          min={0}
          step="0.1"
          placeholder="80"
        />

        <InputField
          id="height"
          label={t("height")}
          value={values.height}
          onChange={(v) => setValue("height", v)}
          error={errors.height}
          min={0}
          step="0.1"
          placeholder="175"
        />

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

        <InputField
          id="targetWeight"
          label={t("targetWeight")}
          value={values.targetWeight}
          onChange={(v) => setValue("targetWeight", v)}
          error={errors.targetWeight}
          min={0}
          step="0.1"
          placeholder="75"
        />

        <InputField
          id="weeksToGoal"
          label={t("weeksToGoal")}
          value={values.weeksToGoal}
          onChange={(v) => setValue("weeksToGoal", v)}
          error={errors.weeksToGoal}
          min={1}
          step="1"
          placeholder="12"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tResults("bmr")}
              value={Math.round(result.bmr)}
              unit={`${tResults("kcal")}/day`}
            />
            <OutputDisplay
              label={t("maintenance")}
              value={Math.round(result.maintenanceCalories)}
              unit={`${tResults("kcal")}/day`}
            />
          </div>

          <OutputDisplay
            label={tResults("targetCalories")}
            value={Math.round(result.targetCalories)}
            unit={`${tResults("kcal")}/day`}
            size="lg"
          />

          {!result.isSafe && (
            <div className="rounded-md bg-destructive/10 p-3 text-destructive">
              Warning: This plan may not be safe. Consider extending your timeline or adjusting your
              goal.
            </div>
          )}

          <h3 className="text-lg font-semibold">Daily Macros</h3>
          <ResultGrid
            results={[
              {
                label: tResults("proteinGrams"),
                value: Math.round(result.proteinGrams),
                unit: "g",
              },
              {
                label: tResults("carbsGrams"),
                value: Math.round(result.carbsGrams),
                unit: "g",
              },
              {
                label: tResults("fatGrams"),
                value: Math.round(result.fatGrams),
                unit: "g",
              },
            ]}
          />

          <ResultGrid
            results={[
              {
                label: "Daily Deficit/Surplus",
                value: Math.round(Math.abs(result.dailyDeficit)),
                unit: result.dailyDeficit > 0 ? "kcal deficit" : "kcal surplus",
              },
              {
                label: "Weekly Weight Change",
                value: result.weeklyWeightChange.toFixed(2),
                unit: "kg/week",
              },
              {
                label: "Projected Date",
                value: result.projectedDate,
                unit: "",
              },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
