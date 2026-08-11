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
  calculateIdealWeight,
  type IdealWeightInput,
  type IdealWeightResult,
} from "@/lib/converters/health/ideal-weight";
import { IdealWeightFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  height: string;
  frameSize: "small" | "medium" | "large";
}

const useStore = createCalculatorStore<FormValues, IdealWeightResult | null>({
  name: "ideal-weight-calculator",
  initialValues: {
    gender: "male",
    height: "175",
    frameSize: "medium",
  },
  schema: IdealWeightFormSchema,
  calculate: (vals) => {
    const input: IdealWeightInput = {
      gender: vals.gender,
      height: parseFloat(vals.height) || 0,
      frameSize: vals.frameSize,
    };
    return calculateIdealWeight(input);
  },
});

export function IdealWeightCalculator() {
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
          <h3 className="text-lg font-semibold">{tResults("idealWeight")} (Multiple Formulas)</h3>
          <ResultGrid
            results={[
              {
                label: "Robinson Formula (1983)",
                value: result.robinson.toFixed(1),
                unit: "kg",
              },
              {
                label: "Miller Formula (1983)",
                value: result.miller.toFixed(1),
                unit: "kg",
              },
              {
                label: "Devine Formula (1974)",
                value: result.devine.toFixed(1),
                unit: "kg",
              },
              {
                label: "Hamwi Formula (1964)",
                value: result.hamwi.toFixed(1),
                unit: "kg",
              },
              {
                label: tResults("average"),
                value: result.average.toFixed(1),
                unit: "kg",
              },
              {
                label: "Range (adjusted for frame)",
                value: `${result.rangeMin.toFixed(1)} - ${result.rangeMax.toFixed(1)}`,
                unit: "kg",
              },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
