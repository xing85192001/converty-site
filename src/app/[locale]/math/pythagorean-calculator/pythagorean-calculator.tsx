"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculatePythagorean,
  type PythagoreanInput,
  type PythagoreanResult,
} from "@/lib/converters/math/pythagorean";
import { PythagoreanFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "findHypotenuse" | "findLeg";
  sideA: string;
  sideB: string;
  hypotenuse: string;
}

const usePythagoreanStore = createCalculatorStore<FormValues, PythagoreanResult | null>({
  name: "pythagorean-calculator",
  schema: PythagoreanFormSchema,
  initialValues: {
    mode: "findHypotenuse",
    sideA: "3",
    sideB: "4",
    hypotenuse: "5",
  },
  calculate: (vals) => {
    const input: PythagoreanInput = {
      mode: vals.mode,
      sideA: parseFloat(vals.sideA) || 0,
      sideB: parseFloat(vals.sideB) || undefined,
      hypotenuse: parseFloat(vals.hypotenuse) || undefined,
    };
    return calculatePythagorean(input);
  },
});

export function PythagoreanCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = usePythagoreanStore();

  const pythagoreanResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{tMath("calculationType")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="findHypotenuse">{tMath("findHypotenuse")}</SelectItem>
              <SelectItem value="findLeg">{tMath("findLeg")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="sideA"
            label={tMath("sideA")}
            value={values.sideA}
            onChange={(v) => setValue("sideA", v)}
            step="any"
            min={0.0001}
            placeholder="3"
            error={errors.sideA}
          />

          {values.mode === "findHypotenuse" ? (
            <InputField
              id="sideB"
              label={tMath("sideB")}
              value={values.sideB}
              onChange={(v) => setValue("sideB", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.sideB}
            />
          ) : (
            <InputField
              id="hypotenuse"
              label={tMath("hypotenuse")}
              value={values.hypotenuse}
              onChange={(v) => setValue("hypotenuse", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.hypotenuse}
            />
          )}
        </div>
      </div>

      {pythagoreanResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <OutputDisplay
              label={tMath("sideA")}
              value={pythagoreanResult.sideA.toFixed(4)}
              unit="units"
            />
            <OutputDisplay
              label={tMath("sideB")}
              value={pythagoreanResult.sideB.toFixed(4)}
              unit="units"
            />
            <OutputDisplay
              label={tMath("hypotenuse")}
              value={pythagoreanResult.hypotenuse.toFixed(4)}
              unit="units"
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("area"), value: pythagoreanResult.area.toFixed(4), unit: "sq units" },
              {
                label: tMath("perimeter"),
                value: pythagoreanResult.perimeter.toFixed(4),
                unit: "units",
              },
              { label: tMath("angleA"), value: pythagoreanResult.angles.A.toFixed(2), unit: "°" },
              { label: tMath("angleB"), value: pythagoreanResult.angles.B.toFixed(2), unit: "°" },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono whitespace-pre-wrap">
              {pythagoreanResult.formula}
            </p>
            <p className="text-sm font-medium mt-2">{tMath("verification")}:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {pythagoreanResult.verification}
            </p>
          </div>

          {pythagoreanResult.isPythagoreanTriple && (
            <div className="rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-4">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {tMath("pythagoreanTriple")}
              </p>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-3">{tMath("commonPythagoreanTriples")}:</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
              {pythagoreanResult.pythagoreanTriples.slice(0, 5).map((triple) => (
                <div
                  key={`triple-${triple.a}-${triple.b}-${triple.c}`}
                  className="bg-muted rounded p-2 text-center"
                >
                  {triple.a}, {triple.b}, {triple.c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
