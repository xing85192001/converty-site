"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateLongDivision,
  type LongDivisionInput,
  type LongDivisionResult,
} from "@/lib/converters/math/long-division";
import { LongDivisionFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  dividend: string;
  divisor: string;
  decimalPlaces: string;
}

const useLongDivisionStore = createCalculatorStore<FormValues, LongDivisionResult | null>({
  name: "long-division-calculator",
  schema: LongDivisionFormSchema,
  initialValues: {
    dividend: "12345",
    divisor: "7",
    decimalPlaces: "10",
  },
  calculate: (vals) => {
    const input: LongDivisionInput = {
      dividend: parseInt(vals.dividend) || 0,
      divisor: parseInt(vals.divisor) || 1,
      decimalPlaces: parseInt(vals.decimalPlaces) || 10,
    };
    return calculateLongDivision(input);
  },
});

export function LongDivisionCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useLongDivisionStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tMath("longDivision") || "Long Division Calculator"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="dividend"
            label={t("dividend") || "Dividend"}
            value={values.dividend}
            onChange={(v) => setValue("dividend", v)}
            type="number"
            error={errors.dividend}
          />

          <InputField
            id="divisor"
            label={t("divisor") || "Divisor"}
            value={values.divisor}
            onChange={(v) => setValue("divisor", v)}
            type="number"
            error={errors.divisor}
          />

          <InputField
            id="decimalPlaces"
            label={t("decimalPlaces") || "Decimal Places"}
            value={values.decimalPlaces}
            onChange={(v) => setValue("decimalPlaces", v)}
            type="number"
            min={1}
            max={50}
            error={errors.decimalPlaces}
          />
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tResults("result") || "Result"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  {
                    label: tResults("quotient") || "Quotient",
                    value: result.quotient.toString(),
                  },
                  {
                    label: tResults("remainder") || "Remainder",
                    value: result.remainder.toString(),
                  },
                  {
                    label: tResults("decimal") || "Decimal",
                    value: result.decimal.toFixed(parseInt(values.decimalPlaces) || 10),
                  },
                  {
                    label: tResults("fraction") || "Fraction",
                    value: result.fraction,
                  },
                  {
                    label: tResults("mixedNumber") || "Mixed Number",
                    value: result.mixedNumber,
                  },
                ]}
              />
            </CardContent>
          </Card>

          {result.repeatingDecimal && (
            <Card>
              <CardHeader>
                <CardTitle>{tMath("repeatingDecimal") || "Repeating Decimal"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-mono">0.{result.repeatingDecimal}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Parentheses indicate repeating digits
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{tResults("verification") || "Verification"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono">{result.verification}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {result.isExact ? "Division is exact (no remainder)" : "Division has a remainder"}
              </p>
            </CardContent>
          </Card>

          {result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{tResults("divisionSteps") || "Division Steps"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.steps.map((step) => (
                    <div key={`step-${step.step}`} className="border-l-2 border-primary pl-4 py-2">
                      <p className="font-semibold">Step {step.step}</p>
                      <ul className="text-sm text-muted-foreground space-y-1 font-mono">
                        <li>{step.bring}</li>
                        <li>{step.divide}</li>
                        <li>{step.multiply}</li>
                        <li>{step.subtract}</li>
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
