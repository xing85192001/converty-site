"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  calculateQuadratic,
  type QuadraticInput,
  type QuadraticResult,
} from "@/lib/converters/math/quadratic";
import { QuadraticFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  a: string;
  b: string;
  c: string;
}

const useQuadraticStore = createCalculatorStore<FormValues, QuadraticResult | null>({
  name: "quadratic-calculator",
  schema: QuadraticFormSchema,
  initialValues: {
    a: "1",
    b: "-5",
    c: "6",
  },
  calculate: (vals) => {
    const input: QuadraticInput = {
      a: parseFloat(vals.a) || 0,
      b: parseFloat(vals.b) || 0,
      c: parseFloat(vals.c) || 0,
    };
    return calculateQuadratic(input);
  },
});

export function QuadraticCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useQuadraticStore();

  const quadResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          id="a"
          label={tMath("coefficientA")}
          value={values.a}
          onChange={(v) => setValue("a", v)}
          step="any"
          placeholder="1"
          error={errors.a}
        />
        <InputField
          id="b"
          label={tMath("coefficientB")}
          value={values.b}
          onChange={(v) => setValue("b", v)}
          step="any"
          placeholder="-5"
          error={errors.b}
        />
        <InputField
          id="c"
          label={tMath("coefficientC")}
          value={values.c}
          onChange={(v) => setValue("c", v)}
          step="any"
          placeholder="6"
          error={errors.c}
        />
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 text-center">
        <p className="text-lg font-mono">
          {values.a}x² + {values.b}x + {values.c} = 0
        </p>
      </div>

      {quadResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {quadResult.hasRealRoots ? (
              <>
                <OutputDisplay
                  label="x₁"
                  value={quadResult.roots.x1?.toFixed(4) || "N/A"}
                  size="lg"
                />
                <OutputDisplay
                  label="x₂"
                  value={quadResult.roots.x2?.toFixed(4) || "N/A"}
                  size="lg"
                />
              </>
            ) : (
              <div className="sm:col-span-2">
                <OutputDisplay
                  label={tMath("complexRoots")}
                  value={`${quadResult.complexRoots?.real.toFixed(4)} ± ${quadResult.complexRoots?.imaginary.toFixed(4)}i`}
                  size="lg"
                />
              </div>
            )}
          </div>

          <ResultGrid
            results={[
              { label: tMath("discriminant"), value: quadResult.discriminant.toFixed(4) },
              {
                label: tMath("vertex"),
                value: `(${quadResult.vertex.x.toFixed(4)}, ${quadResult.vertex.y.toFixed(4)})`,
              },
              {
                label: tMath("axisOfSymmetry"),
                value: `x = ${quadResult.axisOfSymmetry.toFixed(4)}`,
              },
              { label: tMath("yIntercept"), value: quadResult.yIntercept.toFixed(4) },
              {
                label: tMath("direction"),
                value: quadResult.opensUpward ? tMath("opensUpward") : tMath("opensDownward"),
              },
            ]}
          />

          {quadResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {quadResult.steps.map((step) => (
                <p key={step} className="text-sm text-muted-foreground font-mono">
                  {step}
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
