"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculatePercentage,
  type PercentageInput,
  type PercentageResult,
} from "@/lib/converters/math/percentage";
import { PercentageFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "percentOf" | "whatPercent" | "percentChange" | "percentDifference";
  value1: string;
  value2: string;
}

const usePercentageStore = createCalculatorStore<FormValues, PercentageResult | null>({
  name: "percentage-calculator",
  schema: PercentageFormSchema,
  initialValues: {
    mode: "percentOf",
    value1: "25",
    value2: "200",
  },
  calculate: (vals) => {
    const input: PercentageInput = {
      mode: vals.mode,
      value1: parseFloat(vals.value1) || 0,
      value2: parseFloat(vals.value2) || 0,
    };
    return calculatePercentage(input);
  },
});

export function PercentageCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = usePercentageStore();

  const percentResult = result;

  const getModeLabels = () => {
    switch (values.mode) {
      case "percentOf":
        return { label1: tMath("percentValue"), label2: tMath("ofValue") };
      case "whatPercent":
        return { label1: tMath("value"), label2: tMath("ofTotal") };
      case "percentChange":
        return { label1: tMath("fromValue"), label2: tMath("toValue") };
      case "percentDifference":
        return { label1: tMath("value1"), label2: tMath("value2") };
      default:
        return { label1: t("value1"), label2: t("value2") };
    }
  };

  const labels = getModeLabels();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>{tMath("calculationType")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentOf">{tMath("percentOf")}</SelectItem>
              <SelectItem value="whatPercent">{tMath("whatPercent")}</SelectItem>
              <SelectItem value="percentChange">{tMath("percentChange")}</SelectItem>
              <SelectItem value="percentDifference">{tMath("percentDifference")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="value1"
          label={labels.label1}
          value={values.value1}
          onChange={(v) => setValue("value1", v)}
          step="any"
          placeholder="25"
          error={errors.value1}
        />

        <InputField
          id="value2"
          label={labels.label2}
          value={values.value2}
          onChange={(v) => setValue("value2", v)}
          step="any"
          placeholder="200"
          error={errors.value2}
        />
      </div>

      {percentResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("result")}
            value={percentResult.result.toFixed(4)}
            unit={values.mode !== "percentOf" ? "%" : ""}
            size="lg"
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{percentResult.formula}</p>
            <p className="text-sm text-muted-foreground">{percentResult.explanation}</p>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
