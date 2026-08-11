"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ConfidenceIntervalInput,
  type ConfidenceIntervalResult,
  calculateConfidenceInterval,
} from "@/lib/converters/math/confidence-interval";
import { ConfidenceIntervalFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type CIMode = "mean" | "proportion";

interface FormValues {
  mode: CIMode;
  sampleMean: string;
  sampleSize: string;
  standardDeviation: string;
  confidenceLevel: string;
  successes: string;
}

const useConfidenceIntervalStore = createCalculatorStore<
  FormValues,
  ConfidenceIntervalResult | null
>({
  name: "confidence-interval-calculator",
  schema: ConfidenceIntervalFormSchema,
  initialValues: {
    mode: "mean",
    sampleMean: "50",
    sampleSize: "100",
    standardDeviation: "10",
    confidenceLevel: "95",
    successes: "60",
  },
  calculate: (vals) => {
    const input: ConfidenceIntervalInput = {
      mode: vals.mode,
      sampleMean: parseFloat(vals.sampleMean) || 0,
      sampleSize: parseInt(vals.sampleSize) || 1,
      standardDeviation: parseFloat(vals.standardDeviation) || 1,
      confidenceLevel: parseInt(vals.confidenceLevel) || 95,
      successes: parseInt(vals.successes) || 0,
    };
    return calculateConfidenceInterval(input);
  },
});

export function ConfidenceIntervalCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useConfidenceIntervalStore();

  const ciResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{tMath("intervalType")}</Label>
          <Select value={values.mode} onValueChange={(v) => setValue("mode", v as CIMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mean">{tMath("forMean")}</SelectItem>
              <SelectItem value="proportion">{tMath("forProportion")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{tMath("confidenceLevel")}</Label>
          <Select
            value={values.confidenceLevel}
            onValueChange={(v) => setValue("confidenceLevel", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90%</SelectItem>
              <SelectItem value="95">95%</SelectItem>
              <SelectItem value="99">99%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {values.mode === "mean" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            id="sampleMean"
            label={tMath("sampleMean")}
            value={values.sampleMean}
            onChange={(v) => setValue("sampleMean", v)}
            step="any"
            placeholder="50"
            error={errors.sampleMean}
          />
          <InputField
            id="sampleSize"
            label={tMath("sampleSize")}
            value={values.sampleSize}
            onChange={(v) => setValue("sampleSize", v)}
            min={1}
            step="1"
            placeholder="100"
            error={errors.sampleSize}
          />
          <InputField
            id="standardDeviation"
            label={tMath("standardDeviation")}
            value={values.standardDeviation}
            onChange={(v) => setValue("standardDeviation", v)}
            step="any"
            min={0.001}
            placeholder="10"
            error={errors.standardDeviation}
          />
        </div>
      )}

      {values.mode === "proportion" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="successes"
            label={tMath("numberOfSuccesses")}
            value={values.successes}
            onChange={(v) => setValue("successes", v)}
            min={0}
            step="1"
            placeholder="60"
            error={errors.successes}
          />
          <InputField
            id="sampleSize"
            label={tMath("sampleSize")}
            value={values.sampleSize}
            onChange={(v) => setValue("sampleSize", v)}
            min={1}
            step="1"
            placeholder="100"
            error={errors.sampleSize}
          />
        </div>
      )}

      {ciResult && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {tMath("confidenceInterval")} ({ciResult.confidenceLevel}%)
            </p>
            <p className="text-2xl font-bold">
              ({ciResult.lowerBound.toFixed(4)}, {ciResult.upperBound.toFixed(4)})
            </p>
          </div>

          <ResultGrid
            results={[
              { label: tMath("pointEstimate"), value: ciResult.pointEstimate.toFixed(4) },
              { label: tMath("marginOfError"), value: `± ${ciResult.marginOfError.toFixed(4)}` },
              { label: tMath("standardError"), value: ciResult.standardError.toFixed(4) },
              { label: tMath("criticalValue"), value: ciResult.criticalValue.toFixed(4) },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{ciResult.formula}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("interpretation")}:</p>
            <p className="text-sm text-muted-foreground">{ciResult.interpretation}</p>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
