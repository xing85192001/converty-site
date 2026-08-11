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
  calculateFraction,
  type FractionInput,
  type FractionResult,
} from "@/lib/converters/math/fraction";
import { FractionFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "simplify" | "add" | "subtract" | "multiply" | "divide" | "toDecimal" | "toFraction";
  numerator1: string;
  denominator1: string;
  numerator2: string;
  denominator2: string;
  decimal: string;
}

const useFractionStore = createCalculatorStore<FormValues, FractionResult | null>({
  name: "fraction-calculator",
  schema: FractionFormSchema,
  initialValues: {
    mode: "simplify",
    numerator1: "6",
    denominator1: "8",
    numerator2: "1",
    denominator2: "4",
    decimal: "0.75",
  },
  calculate: (vals) => {
    const input: FractionInput = {
      mode: vals.mode,
      numerator1: parseFloat(vals.numerator1) || 0,
      denominator1: parseFloat(vals.denominator1) || 1,
      numerator2: parseFloat(vals.numerator2) || 0,
      denominator2: parseFloat(vals.denominator2) || 1,
      decimal: parseFloat(vals.decimal) || 0,
    };
    return calculateFraction(input);
  },
});

export function FractionCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useFractionStore();

  const fractionResult = result;
  const showSecondFraction = ["add", "subtract", "multiply", "divide"].includes(values.mode);
  const showDecimalInput = values.mode === "toFraction";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>{tMath("operation")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simplify">{tMath("simplify")}</SelectItem>
              <SelectItem value="add">{tMath("add")}</SelectItem>
              <SelectItem value="subtract">{tMath("subtract")}</SelectItem>
              <SelectItem value="multiply">{tMath("multiply")}</SelectItem>
              <SelectItem value="divide">{tMath("divide")}</SelectItem>
              <SelectItem value="toDecimal">{tMath("toDecimal")}</SelectItem>
              <SelectItem value="toFraction">{tMath("toFraction")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!showDecimalInput && (
          <>
            <InputField
              id="numerator1"
              label={showSecondFraction ? tMath("numerator1") : tMath("numerator")}
              value={values.numerator1}
              onChange={(v) => setValue("numerator1", v)}
              step="1"
              placeholder="6"
              error={errors.numerator1}
            />

            <InputField
              id="denominator1"
              label={showSecondFraction ? tMath("denominator1") : tMath("denominator")}
              value={values.denominator1}
              onChange={(v) => setValue("denominator1", v)}
              step="1"
              min={1}
              placeholder="8"
              error={errors.denominator1}
            />
          </>
        )}

        {showSecondFraction && (
          <>
            <InputField
              id="numerator2"
              label={tMath("numerator2")}
              value={values.numerator2}
              onChange={(v) => setValue("numerator2", v)}
              step="1"
              placeholder="1"
              error={errors.numerator2}
            />

            <InputField
              id="denominator2"
              label={tMath("denominator2")}
              value={values.denominator2}
              onChange={(v) => setValue("denominator2", v)}
              step="1"
              min={1}
              placeholder="4"
              error={errors.denominator2}
            />
          </>
        )}

        {showDecimalInput && (
          <InputField
            id="decimal"
            label={tMath("decimal")}
            value={values.decimal}
            onChange={(v) => setValue("decimal", v)}
            step="any"
            placeholder="0.75"
            className="sm:col-span-2"
            error={errors.decimal}
          />
        )}
      </div>

      {fractionResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tMath("simplified")}
            value={`${fractionResult.simplified.numerator}/${fractionResult.simplified.denominator}`}
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tMath("decimal"),
                value: fractionResult.decimal.toFixed(6),
              },
              {
                label: tMath("percentage"),
                value: fractionResult.percentage.toFixed(2),
                unit: "%",
              },
              ...(fractionResult.mixedNumber
                ? [
                    {
                      label: tMath("mixedNumber"),
                      value: `${fractionResult.mixedNumber.whole} ${fractionResult.mixedNumber.numerator}/${fractionResult.mixedNumber.denominator}`,
                    },
                  ]
                : []),
            ]}
          />

          {fractionResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {fractionResult.steps.map((step) => (
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
