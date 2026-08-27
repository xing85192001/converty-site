"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Badge } from "@/components/ui/badge";
import { calculateFactor, type FactorInput, type FactorResult } from "@/lib/converters/math/factor";
import { FactorFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  number: string;
}

const useFactorStore = createCalculatorStore<FormValues, FactorResult | null>({
  name: "factor-calculator",
  schema: FactorFormSchema,
  initialValues: {
    number: "36",
  },
  calculate: (vals) => {
    const input: FactorInput = {
      mode: "factors",
      number: parseInt(vals.number) || 0,
    };
    return calculateFactor(input);
  },
});

export function FactorCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useFactorStore();

  const factorResult = result;

  return (
    <div className="space-y-6">
      <InputField
        id="number"
        label={tMath("numberToFactor")}
        value={values.number}
        onChange={(v) => setValue("number", v)}
        min={1}
        step="1"
        placeholder="36"
        error={errors.number}
      />

      {factorResult && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {factorResult.isPrime && <Badge variant="secondary">{tMath("prime")}</Badge>}
            {factorResult.isPerfect && <Badge variant="secondary">{tMath("perfectNumber")}</Badge>}
            {factorResult.isAbundant && <Badge variant="outline">{tMath("abundant")}</Badge>}
            {factorResult.isDeficient && <Badge variant="outline">{tMath("deficient")}</Badge>}
          </div>

          <OutputDisplay
            label={tMath("factors")}
            value={factorResult.factors.join(", ")}
            size="lg"
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("factorPairs")}:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {factorResult.factorPairs.map(([a, b]) => `(${a}, ${b})`).join(", ")}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("primeFactorization")}:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {factorResult.primeFactorization}
            </p>
          </div>

          <ResultGrid
            results={[
              { label: tMath("numberOfFactors"), value: String(factorResult.factorCount) },
              { label: tMath("sumOfFactors"), value: String(factorResult.factorSum) },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
