"use client";

import { useTranslations } from "next-intl";
import { OutputDisplay } from "@/components/converter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type BasicCalculatorInput,
  type BasicCalculatorResult,
  calculateBasicCalculator,
} from "@/lib/converters/math/basic-calculator";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  expression: string;
  angleMode: "degrees" | "radians";
}

const useBasicCalculatorStore = createCalculatorStore<FormValues, BasicCalculatorResult | null>({
  name: "basic-calculator",
  initialValues: {
    expression: "2 * pi + sqrt(16)",
    angleMode: "radians",
  },
  calculate: (vals) => {
    const input: BasicCalculatorInput = {
      expression: vals.expression,
      angleMode: vals.angleMode,
    };
    return calculateBasicCalculator(input);
  },
});

export function BasicCalculatorComponent() {
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, calculationError } = useBasicCalculatorStore();

  const calcResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="expression">{tMath("expression")}</Label>
        <Input
          id="expression"
          value={values.expression}
          onChange={(e) => setValue("expression", e.target.value)}
          placeholder="2 * pi + sqrt(16)"
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          {tMath("supportedOperations")}: +, -, *, /, ^, %, sqrt, sin, cos, tan, log, ln, pi, e
        </p>
      </div>

      <div className="space-y-2">
        <Label>{tMath("angleMode")}</Label>
        <RadioGroup
          value={values.angleMode}
          onValueChange={(v) => setValue("angleMode", v as "degrees" | "radians")}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="radians" id="radians" />
            <Label htmlFor="radians">{tMath("radians")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="degrees" id="degrees" />
            <Label htmlFor="degrees">{tMath("degrees")}</Label>
          </div>
        </RadioGroup>
      </div>

      {calcResult && (
        <div className="space-y-4">
          <OutputDisplay label={tResults("result")} value={calcResult.formattedResult} size="lg" />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("calculationSteps")}:</p>
            <div className="text-sm text-muted-foreground font-mono space-y-1">
              {calcResult.steps.map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
