"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  calculateLogarithm,
  type LogarithmInput,
  type LogarithmResult,
} from "@/lib/converters/math/logarithm";
import { LogarithmFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  value: string;
  base: string;
}

const useLogarithmStore = createCalculatorStore<FormValues, LogarithmResult | null>({
  name: "logarithm-calculator",
  schema: LogarithmFormSchema,
  initialValues: {
    value: "100",
    base: "10",
  },
  calculate: (vals) => {
    const input: LogarithmInput = {
      value: parseFloat(vals.value) || 1,
      base: parseFloat(vals.base) || 10,
    };
    return calculateLogarithm(input);
  },
});

export function LogarithmCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useLogarithmStore();

  const logResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="value"
          label={tMath("logValue")}
          value={values.value}
          onChange={(v) => setValue("value", v)}
          step="any"
          min={0.0001}
          placeholder="100"
          error={errors.value}
        />
        <InputField
          id="base"
          label={tMath("logBase")}
          value={values.base}
          onChange={(v) => setValue("base", v)}
          step="any"
          min={0.0001}
          placeholder="10"
          error={errors.base}
        />
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 text-center">
        <p className="text-lg font-mono">
          log<sub>{values.base}</sub>({values.value})
        </p>
      </div>

      {logResult && (
        <div className="space-y-4">
          <OutputDisplay label={tMath("result")} value={logResult.result.toFixed(6)} size="lg" />

          <ResultGrid
            results={[
              { label: `${tMath("naturalLog")} (ln)`, value: logResult.naturalLog.toFixed(6) },
              { label: `${tMath("commonLog")} (log₁₀)`, value: logResult.log10.toFixed(6) },
              { label: "log₂", value: logResult.log2.toFixed(6) },
              { label: "Antilog", value: logResult.antilog.toFixed(6) },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{logResult.formula}</p>
            <p className="text-sm text-muted-foreground font-mono">{logResult.changeOfBase}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">Logarithm Properties:</p>
            {logResult.properties.map((prop) => (
              <p key={prop} className="text-sm text-muted-foreground font-mono">
                {prop}
              </p>
            ))}
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
