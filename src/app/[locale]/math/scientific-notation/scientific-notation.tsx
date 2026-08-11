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
  calculateScientificNotation,
  type ScientificNotationInput,
  type ScientificNotationResult,
} from "@/lib/converters/math/scientific-notation";
import { ScientificNotationFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type NotationMode = "toScientific" | "fromScientific";

interface FormValues {
  mode: NotationMode;
  number: string;
  mantissa: string;
  exponent: string;
}

const useScientificNotationStore = createCalculatorStore<
  FormValues,
  ScientificNotationResult | null
>({
  name: "scientific-notation-calculator",
  schema: ScientificNotationFormSchema,
  initialValues: {
    mode: "toScientific",
    number: "123456789",
    mantissa: "1.23",
    exponent: "8",
  },
  calculate: (vals) => {
    const input: ScientificNotationInput = {
      mode: vals.mode,
      number: parseFloat(vals.number) || 0,
      mantissa: parseFloat(vals.mantissa) || 0,
      exponent: parseInt(vals.exponent) || 0,
    };
    return calculateScientificNotation(input);
  },
});

export function ScientificNotationCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useScientificNotationStore();

  const notationResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{tMath("conversionMode")}</Label>
        <Select value={values.mode} onValueChange={(v) => setValue("mode", v as NotationMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toScientific">{tMath("toScientificNotation")}</SelectItem>
            <SelectItem value="fromScientific">{tMath("fromScientificNotation")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {values.mode === "toScientific" && (
        <InputField
          id="number"
          label={tMath("enterNumber")}
          value={values.number}
          onChange={(v) => setValue("number", v)}
          step="any"
          placeholder="123456789"
          error={errors.number}
        />
      )}

      {values.mode === "fromScientific" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="mantissa"
            label={tMath("mantissa")}
            value={values.mantissa}
            onChange={(v) => setValue("mantissa", v)}
            step="any"
            placeholder="1.23"
            error={errors.mantissa}
          />
          <InputField
            id="exponent"
            label={tMath("exponent")}
            value={values.exponent}
            onChange={(v) => setValue("exponent", v)}
            step="1"
            placeholder="8"
            error={errors.exponent}
          />
        </div>
      )}

      {notationResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tMath("scientificNotation")}
            value={notationResult.scientificNotation}
            size="lg"
          />

          <ResultGrid
            results={[
              { label: tMath("standardForm"), value: String(notationResult.standardForm) },
              { label: tMath("mantissa"), value: notationResult.mantissa.toFixed(6) },
              { label: tMath("exponent"), value: String(notationResult.exponent) },
              { label: tMath("engineeringNotation"), value: notationResult.engineeringNotation },
              {
                label: tMath("significantFigures"),
                value: String(notationResult.significantFigures),
              },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("calculationSteps")}:</p>
            <div className="text-sm text-muted-foreground font-mono space-y-1">
              {notationResult.steps.map((step) => (
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
