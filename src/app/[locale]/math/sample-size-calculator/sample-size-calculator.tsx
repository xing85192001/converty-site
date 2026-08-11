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
  calculateSampleSize,
  type SampleSizeInput,
  type SampleSizeResult,
} from "@/lib/converters/math/sample-size";
import { SampleSizeFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type SampleSizeMode = "proportion" | "mean";

interface FormValues {
  mode: SampleSizeMode;
  confidenceLevel: string;
  marginOfError: string;
  populationProportion: string;
  populationSize: string;
  standardDeviation: string;
}

const useSampleSizeStore = createCalculatorStore<FormValues, SampleSizeResult | null>({
  name: "sample-size-calculator",
  schema: SampleSizeFormSchema,
  initialValues: {
    mode: "proportion",
    confidenceLevel: "95",
    marginOfError: "5",
    populationProportion: "50",
    populationSize: "",
    standardDeviation: "10",
  },
  calculate: (vals) => {
    const input: SampleSizeInput = {
      mode: vals.mode,
      confidenceLevel: parseInt(vals.confidenceLevel) || 95,
      marginOfError: (parseFloat(vals.marginOfError) || 5) / 100,
      populationProportion: (parseFloat(vals.populationProportion) || 50) / 100,
      populationSize: vals.populationSize ? parseInt(vals.populationSize) : undefined,
      standardDeviation: parseFloat(vals.standardDeviation) || undefined,
    };
    return calculateSampleSize(input);
  },
});

export function SampleSizeCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useSampleSizeStore();

  const sizeResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{tMath("calculationType")}</Label>
          <Select value={values.mode} onValueChange={(v) => setValue("mode", v as SampleSizeMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proportion">{tMath("forProportion")}</SelectItem>
              <SelectItem value="mean">{tMath("forMean")}</SelectItem>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="marginOfError"
          label={tMath("marginOfErrorPercent")}
          value={values.marginOfError}
          onChange={(v) => setValue("marginOfError", v)}
          step="0.1"
          min={0.1}
          max={50}
          placeholder="5"
          error={errors.marginOfError}
        />

        {values.mode === "proportion" && (
          <InputField
            id="populationProportion"
            label={tMath("expectedProportionPercent")}
            value={values.populationProportion}
            onChange={(v) => setValue("populationProportion", v)}
            step="1"
            min={1}
            max={99}
            placeholder="50"
            error={errors.populationProportion}
          />
        )}

        {values.mode === "mean" && (
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
        )}

        <InputField
          id="populationSize"
          label={tMath("populationSizeOptional")}
          value={values.populationSize}
          onChange={(v) => setValue("populationSize", v)}
          step="1"
          min={1}
          placeholder={tMath("leaveBlankForInfinite")}
          error={errors.populationSize}
        />
      </div>

      {sizeResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tMath("requiredSampleSize")}
            value={String(sizeResult.sampleSize)}
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tMath("marginOfError"),
                value: `${(sizeResult.marginOfError * 100).toFixed(2)}%`,
              },
              { label: tMath("confidenceLevel"), value: `${sizeResult.confidenceLevel}%` },
              { label: tMath("zScore"), value: sizeResult.zScore.toFixed(4) },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{sizeResult.formula}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("interpretation")}:</p>
            <p className="text-sm text-muted-foreground">{sizeResult.interpretation}</p>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
