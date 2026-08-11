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
  calculateTdee,
  type TdeeInput,
  type TdeeResult,
} from "@/lib/converters/health/tdee-calculator";
import { TdeeFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  age: string;
  weight: string;
  height: string;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal: "lose" | "maintain" | "gain";
}

const useStore = createCalculatorStore<FormValues, TdeeResult | null>({
  name: "tdee-calculator",
  initialValues: {
    gender: "male",
    age: "30",
    weight: "75",
    height: "175",
    activityLevel: "moderate",
    goal: "maintain",
  },
  schema: TdeeFormSchema,
  calculate: (vals) => {
    const input: TdeeInput = {
      gender: vals.gender,
      age: parseFloat(vals.age) || 0,
      weight: parseFloat(vals.weight) || 0,
      height: parseFloat(vals.height) || 0,
      activityLevel: vals.activityLevel,
      goal: vals.goal,
    };
    return calculateTdee(input);
  },
});

export function TdeeCalculatorComponent() {
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
          placeholder="75"
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

        <div className="space-y-2">
          <Label>{t("goal")}</Label>
          <Select
            value={values.goal}
            onValueChange={(v) => setValue("goal", v as "lose" | "maintain" | "gain")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lose">{t("loseWeight")}</SelectItem>
              <SelectItem value="maintain">{t("maintain")}</SelectItem>
              <SelectItem value="gain">{t("gainWeight")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tResults("bmr")}
              value={Math.round(result.bmr)}
              unit={`${tResults("kcal")}/day`}
              size="lg"
            />
            <OutputDisplay
              label={tResults("tdee")}
              value={Math.round(result.tdee)}
              unit={`${tResults("kcal")}/day`}
              size="lg"
            />
          </div>

          <OutputDisplay
            label={tResults("targetCalories")}
            value={Math.round(result.targetCalories)}
            unit={`${tResults("kcal")}/day`}
            size="lg"
          />

          <h3 className="text-lg font-semibold">Macros Breakdown</h3>
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

          {result.weeklyChange !== 0 && (
            <p className="text-sm text-muted-foreground">
              Expected weekly weight change: {result.weeklyChange > 0 ? "+" : ""}
              {result.weeklyChange} kg/week
            </p>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
