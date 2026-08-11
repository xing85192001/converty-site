"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { calculateRoot, type RootInput, type RootResult } from "@/lib/converters/math/root";
import { RootFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  radicand: string;
  index: string;
}

const useRootStore = createCalculatorStore<FormValues, RootResult | null>({
  name: "root-calculator",
  schema: RootFormSchema,
  initialValues: {
    radicand: "81",
    index: "2",
  },
  calculate: (vals) => {
    const input: RootInput = {
      radicand: parseFloat(vals.radicand) || 0,
      index: parseFloat(vals.index) || 2,
    };
    return calculateRoot(input);
  },
});

export function RootCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useRootStore();

  const rootResult = result;

  const getRootSymbol = () => {
    const idx = parseFloat(values.index) || 2;
    if (idx === 2) return "√";
    if (idx === 3) return "∛";
    return `${idx}√`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="radicand"
          label={tMath("radicand")}
          value={values.radicand}
          onChange={(v) => setValue("radicand", v)}
          step="any"
          placeholder="81"
          error={errors.radicand}
        />
        <InputField
          id="index"
          label={tMath("index")}
          value={values.index}
          onChange={(v) => setValue("index", v)}
          step="1"
          min={1}
          placeholder="2"
          error={errors.index}
        />
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 text-center">
        <p className="text-lg font-mono">
          {getRootSymbol()}
          {values.radicand}
        </p>
      </div>

      {rootResult && (
        <div className="space-y-4">
          <OutputDisplay label={tMath("result")} value={rootResult.result.toFixed(6)} size="lg" />

          <ResultGrid
            results={[
              { label: "Is Rational", value: rootResult.isRational ? "Yes" : "No" },
              ...(rootResult.simplified
                ? [
                    {
                      label: tMath("simplified"),
                      value: `${rootResult.simplified.coefficient}${getRootSymbol()}${rootResult.simplified.radicand}`,
                    },
                  ]
                : []),
              ...(rootResult.asFraction
                ? [
                    {
                      label: "As Integer",
                      value: rootResult.asFraction.numerator.toString(),
                    },
                  ]
                : []),
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{rootResult.formula}</p>
            <p className="text-sm font-medium mt-4">Verification:</p>
            <p className="text-sm text-muted-foreground font-mono">{rootResult.verification}</p>
          </div>

          {rootResult.relatedRoots.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Related Roots:</p>
              {rootResult.relatedRoots.map((root) => (
                <p key={`root-${root.index}`} className="text-sm text-muted-foreground font-mono">
                  {root.index === 2 ? "√" : root.index === 3 ? "∛" : `${root.index}√`}
                  {values.radicand} = {root.result.toFixed(6)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
