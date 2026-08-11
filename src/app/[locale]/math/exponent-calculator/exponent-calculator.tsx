"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  calculateExponent,
  type ExponentInput,
  type ExponentResult,
} from "@/lib/converters/math/exponent";
import { ExponentFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  base: string;
  exponent: string;
}

const useExponentStore = createCalculatorStore<FormValues, ExponentResult | null>({
  name: "exponent-calculator",
  schema: ExponentFormSchema,
  initialValues: {
    base: "2",
    exponent: "10",
  },
  calculate: (vals) => {
    const input: ExponentInput = {
      base: parseFloat(vals.base) || 0,
      exponent: parseFloat(vals.exponent) || 0,
    };
    return calculateExponent(input);
  },
});

export function ExponentCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useExponentStore();

  const expResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="base"
          label={tMath("base")}
          value={values.base}
          onChange={(v) => setValue("base", v)}
          step="any"
          placeholder="2"
          error={errors.base}
        />
        <InputField
          id="exponent"
          label={tMath("exponent")}
          value={values.exponent}
          onChange={(v) => setValue("exponent", v)}
          step="any"
          placeholder="10"
          error={errors.exponent}
        />
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 text-center">
        <p className="text-lg font-mono">
          {values.base}
          <sup>{values.exponent}</sup>
        </p>
      </div>

      {expResult && (
        <div className="space-y-4">
          <OutputDisplay label={tMath("result")} value={expResult.result.toString()} size="lg" />

          <ResultGrid
            results={[
              { label: tMath("scientificNotation"), value: expResult.scientificNotation },
              ...(expResult.reciprocal !== null
                ? [{ label: "Reciprocal (1/x)", value: expResult.reciprocal.toExponential(4) }]
                : []),
              ...(expResult.logarithm !== null
                ? [{ label: `log_${values.base}(result)`, value: expResult.logarithm.toFixed(4) }]
                : []),
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{expResult.formula}</p>
            {expResult.rules.length > 0 && (
              <>
                <p className="text-sm font-medium mt-4">Rules:</p>
                {expResult.rules.map((rule) => (
                  <p key={rule} className="text-sm text-muted-foreground">
                    {rule}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
