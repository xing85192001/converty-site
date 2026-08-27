"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  calculatePercentError,
  type PercentErrorInput,
  type PercentErrorResult,
} from "@/lib/converters/math/percent-error";
import { PercentErrorFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  experimental: string;
  theoretical: string;
}

const usePercentErrorStore = createCalculatorStore<FormValues, PercentErrorResult | null>({
  name: "percent-error-calculator",
  schema: PercentErrorFormSchema,
  initialValues: {
    experimental: "10.5",
    theoretical: "10",
  },
  calculate: (vals) => {
    const input: PercentErrorInput = {
      experimental: parseFloat(vals.experimental) || 0,
      theoretical: parseFloat(vals.theoretical) || 0,
    };
    return calculatePercentError(input);
  },
});

export function PercentErrorCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = usePercentErrorStore();

  const errorResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="experimental"
          label={tMath("experimentalValue")}
          value={values.experimental}
          onChange={(v) => setValue("experimental", v)}
          step="any"
          placeholder="10.5"
          error={errors.experimental}
        />

        <InputField
          id="theoretical"
          label={tMath("theoreticalValue")}
          value={values.theoretical}
          onChange={(v) => setValue("theoretical", v)}
          step="any"
          placeholder="10"
          error={errors.theoretical}
        />
      </div>

      {errorResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tMath("percentError")}
            value={errorResult.percentError.toFixed(4)}
            unit="%"
            size="lg"
          />

          <ResultGrid
            results={[
              { label: tMath("absoluteError"), value: errorResult.absoluteError.toFixed(6) },
              { label: tMath("relativeError"), value: errorResult.relativeError.toFixed(6) },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{errorResult.formula}</p>
            <p className="text-sm text-muted-foreground">{errorResult.interpretation}</p>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
