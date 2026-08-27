"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Badge } from "@/components/ui/badge";
import {
  calculatePrimeFactorization,
  type PrimeFactorizationInput,
  type PrimeFactorizationResult,
} from "@/lib/converters/math/prime-factorization";
import { PrimeFactorizationFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  number: string;
}

const usePrimeFactorizationStore = createCalculatorStore<
  FormValues,
  PrimeFactorizationResult | null
>({
  name: "prime-factorization-calculator",
  schema: PrimeFactorizationFormSchema,
  initialValues: {
    number: "84",
  },
  calculate: (vals) => {
    const input: PrimeFactorizationInput = {
      number: parseInt(vals.number) || 0,
    };
    return calculatePrimeFactorization(input);
  },
});

export function PrimeFactorizationCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = usePrimeFactorizationStore();

  const primeResult = result;

  return (
    <div className="space-y-6">
      <InputField
        id="number"
        label={tMath("enterNumber")}
        value={values.number}
        onChange={(v) => setValue("number", v)}
        min={1}
        step="1"
        placeholder="84"
        error={errors.number}
      />

      {primeResult && (
        <div className="space-y-4">
          {primeResult.isPrime && <Badge variant="secondary">{tMath("primeNumber")}</Badge>}

          <OutputDisplay
            label={tMath("primeFactorization")}
            value={primeResult.factorString}
            size="lg"
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("expandedForm")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{primeResult.expandedForm}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("factorTree")}:</p>
            <div className="text-sm text-muted-foreground font-mono space-y-1">
              {primeResult.factorTree.map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("allDivisors")}:</p>
            <p className="text-sm text-muted-foreground">{primeResult.allDivisors.join(", ")}</p>
          </div>

          <ResultGrid
            results={[
              { label: tMath("numberOfDivisors"), value: String(primeResult.divisorCount) },
              { label: tMath("sumOfDivisors"), value: String(primeResult.divisorSum) },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
