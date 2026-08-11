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
  calculateRounding,
  type RoundingInput,
  type RoundingResult,
} from "@/lib/converters/math/rounding";
import { RoundingFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "round" | "ceil" | "floor" | "truncate" | "toFixed" | "toSignificant";
  number: string;
  decimalPlaces: string;
  significantFigures: string;
}

const useRoundingStore = createCalculatorStore<FormValues, RoundingResult | null>({
  name: "rounding-calculator",
  schema: RoundingFormSchema,
  initialValues: {
    mode: "round",
    number: "3.14159265",
    decimalPlaces: "2",
    significantFigures: "3",
  },
  calculate: (vals) => {
    const input: RoundingInput = {
      mode: vals.mode,
      number: parseFloat(vals.number) || 0,
      decimalPlaces: parseInt(vals.decimalPlaces) || 0,
      significantFigures: parseInt(vals.significantFigures) || 3,
    };
    return calculateRounding(input);
  },
});

export function RoundingCalculator() {
  const t = useTranslations("calculator.labels");
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useRoundingStore();

  const roundingResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>{tMath("roundingMode")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">{tMath("roundNearest")}</SelectItem>
              <SelectItem value="ceil">{tMath("roundUp")}</SelectItem>
              <SelectItem value="floor">{tMath("roundDown")}</SelectItem>
              <SelectItem value="truncate">Truncate</SelectItem>
              <SelectItem value="toFixed">To Fixed</SelectItem>
              <SelectItem value="toSignificant">Significant Figures</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="number"
          label={tMath("value")}
          value={values.number}
          onChange={(v) => setValue("number", v)}
          step="any"
          placeholder="3.14159265"
          error={errors.number}
        />

        {values.mode !== "toSignificant" ? (
          <InputField
            id="decimalPlaces"
            label={tMath("decimalPlaces")}
            value={values.decimalPlaces}
            onChange={(v) => setValue("decimalPlaces", v)}
            step="1"
            min={0}
            max={15}
            placeholder="2"
            error={errors.decimalPlaces}
          />
        ) : (
          <InputField
            id="significantFigures"
            label={t("significantFigures")}
            value={values.significantFigures}
            onChange={(v) => setValue("significantFigures", v)}
            step="1"
            min={1}
            max={15}
            placeholder="3"
            error={errors.significantFigures}
          />
        )}
      </div>

      {roundingResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay label={tMath("original")} value={roundingResult.original.toString()} />
            <OutputDisplay
              label={tMath("rounded")}
              value={roundingResult.rounded.toString()}
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: "Method", value: roundingResult.method },
              { label: "Difference", value: roundingResult.difference.toFixed(10) },
              {
                label: "Percent Change",
                value: roundingResult.percentChange.toFixed(6),
                unit: "%",
              },
            ]}
          />

          {roundingResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {roundingResult.steps.map((step) => (
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
