"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import {
  type BodySurfaceAreaInput,
  type BodySurfaceAreaResult,
  calculateBodySurfaceArea,
} from "@/lib/converters/health/body-surface-area";
import { BodySurfaceAreaFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  weight: string;
  height: string;
}

const useStore = createCalculatorStore<FormValues, BodySurfaceAreaResult | null>({
  name: "body-surface-area-calculator",
  initialValues: {
    weight: "70",
    height: "175",
  },
  schema: BodySurfaceAreaFormSchema,
  calculate: (vals) => {
    const input: BodySurfaceAreaInput = {
      weight: parseFloat(vals.weight) || 0,
      height: parseFloat(vals.height) || 0,
    };
    return calculateBodySurfaceArea(input);
  },
});

export function BodySurfaceAreaCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

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
          placeholder="70"
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
      </div>

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {tResults("bodySurfaceArea")} (Multiple Formulas)
          </h3>
          <ResultGrid
            results={[
              {
                label: "Du Bois Formula",
                value: result.duBois,
                unit: "m²",
              },
              {
                label: "Mosteller Formula",
                value: result.mosteller,
                unit: "m²",
              },
              {
                label: "Haycock Formula",
                value: result.haycock,
                unit: "m²",
              },
              {
                label: "Gehan-George Formula",
                value: result.gehanGeorge,
                unit: "m²",
              },
              {
                label: "Boyd Formula",
                value: result.boyd,
                unit: "m²",
              },
              {
                label: tResults("average"),
                value: result.average,
                unit: "m²",
              },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
