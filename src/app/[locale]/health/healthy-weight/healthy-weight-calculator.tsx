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
  calculateHealthyWeight,
  type HealthyWeightInput,
  type HealthyWeightResult,
} from "@/lib/converters/health/healthy-weight-calculator";
import { HealthyWeightFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  height: string;
  age: string;
  gender: "male" | "female";
  frameSize: "small" | "medium" | "large";
}

const useStore = createCalculatorStore<FormValues, HealthyWeightResult | null>({
  name: "healthy-weight-calculator",
  initialValues: {
    height: "170",
    age: "30",
    gender: "male",
    frameSize: "medium",
  },
  schema: HealthyWeightFormSchema,
  calculate: (vals) => {
    const input: HealthyWeightInput = {
      height: parseFloat(vals.height) || 0,
      age: parseInt(vals.age) || 0,
      gender: vals.gender,
      frameSize: vals.frameSize,
    };
    return calculateHealthyWeight(input);
  },
});

export function HealthyWeightCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tHealthyWeight = useTranslations("calculator.health.healthyWeight");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="height"
          label={t("height")}
          value={values.height}
          onChange={(v) => setValue("height", v)}
          error={errors.height}
          min={100}
          max={250}
          step="1"
          placeholder="170"
        />

        <InputField
          id="age"
          label={t("age")}
          value={values.age}
          onChange={(v) => setValue("age", v)}
          error={errors.age}
          min={1}
          max={120}
          step="1"
          placeholder="30"
        />

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

        <div className="space-y-2">
          <Label>{t("frameSize")}</Label>
          <Select
            value={values.frameSize}
            onValueChange={(v) => setValue("frameSize", v as "small" | "medium" | "large")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">{t("small")}</SelectItem>
              <SelectItem value="medium">{t("medium")}</SelectItem>
              <SelectItem value="large">{t("large")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("idealWeight")}
            value={result.idealWeight.toFixed(1)}
            unit="kg"
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tResults("healthyRange"),
                value: `${result.adjustedRange.min.toFixed(1)} - ${result.adjustedRange.max.toFixed(1)}`,
                unit: "kg",
              },
              {
                label: tResults("bmiBasedRange"),
                value: `${result.bmiBasedRange.min.toFixed(1)} - ${result.bmiBasedRange.max.toFixed(1)}`,
                unit: "kg",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("bmiThresholds")}</h3>
          <ResultGrid
            results={[
              {
                label: tResults("underweight"),
                value: `< ${result.currentBmiThresholds.underweight.toFixed(1)}`,
                unit: "kg",
              },
              {
                label: tResults("normalWeight"),
                value: `${result.currentBmiThresholds.underweight.toFixed(1)} - ${result.currentBmiThresholds.normal.toFixed(1)}`,
                unit: "kg",
              },
              {
                label: tResults("overweight"),
                value: `${result.currentBmiThresholds.normal.toFixed(1)} - ${result.currentBmiThresholds.overweight.toFixed(1)}`,
                unit: "kg",
              },
              {
                label: tResults("obese"),
                value: `> ${result.currentBmiThresholds.overweight.toFixed(1)}`,
                unit: "kg",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("weightCategories")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("category")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("bmiRange")}
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("weightRange")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.weightCategories.map((cat) => (
                  <tr key={cat.categoryKey}>
                    <td className="px-3 py-2 text-sm">
                      {tHealthyWeight(`categories.${cat.categoryKey}`)}
                    </td>
                    <td className="px-3 py-2 text-sm">{cat.bmiRange}</td>
                    <td className="px-3 py-2 text-sm">
                      {cat.minWeight.toFixed(1)} - {cat.maxWeight.toFixed(1)} kg
                    </td>
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
