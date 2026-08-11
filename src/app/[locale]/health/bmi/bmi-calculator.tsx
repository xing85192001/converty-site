"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  type BMIInput,
  type BMIResult,
  calculateBMI,
  type HeightUnit,
  type WeightUnit,
} from "@/lib/converters/health/bmi";
import { BmiFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

const WEIGHT_UNITS = [
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
];

const HEIGHT_UNITS = [
  { value: "cm", label: "cm" },
  { value: "m", label: "m" },
  { value: "in", label: "in" },
  { value: "ft", label: "ft" },
];

interface FormValues {
  weight: string;
  weightUnit: WeightUnit;
  height: string;
  heightUnit: HeightUnit;
}

const useStore = createCalculatorStore<FormValues, BMIResult | null>({
  name: "bmi-calculator",
  initialValues: {
    weight: "70",
    weightUnit: "kg",
    height: "175",
    heightUnit: "cm",
  },
  schema: BmiFormSchema,
  calculate: (vals) => {
    const input: BMIInput = {
      weight: parseFloat(vals.weight) || 0,
      weightUnit: vals.weightUnit,
      height: parseFloat(vals.height) || 0,
      heightUnit: vals.heightUnit,
    };
    return calculateBMI(input);
  },
});

export function BMICalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="weight"
          label={t("weightSimple")}
          value={values.weight}
          onChange={(v) => setValue("weight", v)}
          error={errors.weight}
          units={WEIGHT_UNITS}
          selectedUnit={values.weightUnit}
          onUnitChange={(u) => setValue("weightUnit", u as WeightUnit)}
          min={0}
          step="0.1"
          placeholder={t("enterWeight")}
        />

        <InputField
          id="height"
          label={t("heightSimple")}
          value={values.height}
          onChange={(v) => setValue("height", v)}
          error={errors.height}
          units={HEIGHT_UNITS}
          selectedUnit={values.heightUnit}
          onUnitChange={(u) => setValue("heightUnit", u as HeightUnit)}
          min={0}
          step="0.1"
          placeholder={t("enterHeight")}
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <OutputDisplay
              label={tResults("yourBmi")}
              value={result.bmi}
              size="lg"
              className="flex-1"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {tResults("category")}
              </p>
              <div className="rounded-md border bg-muted/50 px-3 py-4">
                <span className="text-2xl font-bold">{tResults(result.category)}</span>
              </div>
            </div>
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("healthyWeightRange"),
                value: `${result.healthyWeightRange.min} - ${result.healthyWeightRange.max}`,
                unit: "kg",
              },
              ...(result.weightToHealthy !== null
                ? [
                    {
                      label:
                        result.category === "underweight"
                          ? tResults("weightToGain")
                          : tResults("weightToLose"),
                      value: Math.abs(result.weightToHealthy),
                      unit: "kg",
                    },
                  ]
                : []),
            ]}
          />

          {/* BMI Scale Visualization */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{tResults("bmiScale")}</p>
            <div className="relative h-8 rounded-full overflow-hidden">
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-blue-400" title={tResults("underweight")} />
                <div className="flex-1 bg-green-400" title={tResults("normal")} />
                <div className="flex-1 bg-yellow-400" title={tResults("overweight")} />
                <div className="flex-1 bg-orange-400" title={tResults("obese-1")} />
                <div className="flex-1 bg-red-400" title={tResults("obese-2")} />
                <div className="flex-1 bg-red-600" title={tResults("obese-3")} />
              </div>
              {/* BMI Indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white"
                style={{
                  left: `${Math.min(Math.max(((result.bmi - 15) / 30) * 100, 0), 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
              <span>45</span>
            </div>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
