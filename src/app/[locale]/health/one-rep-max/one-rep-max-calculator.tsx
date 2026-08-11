"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  calculateOneRepMax,
  type OneRepMaxInput,
  type OneRepMaxResult,
} from "@/lib/converters/health/one-rep-max";
import { OneRepMaxFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  weight: string;
  reps: string;
}

const useStore = createCalculatorStore<FormValues, OneRepMaxResult | null>({
  name: "one-rep-max-calculator",
  initialValues: {
    weight: "100",
    reps: "5",
  },
  schema: OneRepMaxFormSchema,
  calculate: (vals) => {
    const input: OneRepMaxInput = {
      weight: parseFloat(vals.weight) || 0,
      reps: parseInt(vals.reps) || 0,
    };
    return calculateOneRepMax(input);
  },
});

export function OneRepMaxCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="weight"
          label={t("weightLifted")}
          value={values.weight}
          onChange={(v) => setValue("weight", v)}
          error={errors.weight}
          min={0}
          step="0.5"
          placeholder="100"
        />

        <InputField
          id="reps"
          label={t("repetitions")}
          value={values.reps}
          onChange={(v) => setValue("reps", v)}
          error={errors.reps}
          min={1}
          max={30}
          step="1"
          placeholder="5"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("estimated1RM")}
            value={Math.round(result.average)}
            unit="kg"
            size="lg"
          />

          <h3 className="text-lg font-semibold">{tResults("formulaResults")}</h3>
          <ResultGrid
            results={[
              { label: "Epley", value: Math.round(result.epley), unit: "kg" },
              { label: "Brzycki", value: Math.round(result.brzycki), unit: "kg" },
              { label: "Lander", value: Math.round(result.lander), unit: "kg" },
              { label: "Lombardi", value: Math.round(result.lombardi), unit: "kg" },
              { label: "Mayhew", value: Math.round(result.mayhew), unit: "kg" },
              { label: "O'Conner", value: Math.round(result.oconner), unit: "kg" },
              { label: "Wathan", value: Math.round(result.wathan), unit: "kg" },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("percentageChart")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">%</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("weight")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("reps")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.percentages.map((row) => (
                  <tr key={row.percent}>
                    <td className="px-3 py-2 text-sm">{row.percent}%</td>
                    <td className="px-3 py-2 text-sm font-medium">{Math.round(row.weight)} kg</td>
                    <td className="px-3 py-2 text-sm">{row.reps}</td>
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
