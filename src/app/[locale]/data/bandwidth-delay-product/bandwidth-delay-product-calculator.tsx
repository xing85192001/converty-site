"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  type BandwidthDelayProductInput,
  type BandwidthDelayProductResult,
  calculateBandwidthDelayProduct,
} from "@/lib/converters/network/bandwidth-delay-product";
import { BandwidthDelayProductFormSchema } from "@/lib/schemas/data";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  bandwidth: string;
  rtt: string;
  windowSize: string;
}

const useStore = createCalculatorStore<FormValues, BandwidthDelayProductResult>({
  name: "bandwidth-delay-product",
  initialValues: {
    bandwidth: "100",
    rtt: "80",
    windowSize: "64",
  },
  calculate: (vals) => {
    const input: BandwidthDelayProductInput = {
      bandwidth: parseFloat(vals.bandwidth) || 100,
      rtt: parseFloat(vals.rtt) || 1,
      windowSize: parseFloat(vals.windowSize) || 64,
    };
    return { ok: true, value: calculateBandwidthDelayProduct(input) };
  },
  schema: BandwidthDelayProductFormSchema,
});

export function BandwidthDelayProductCalculator() {
  const t = useTranslations("calculator.network");
  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          id="bandwidth"
          label={t("bandwidth")}
          value={values.bandwidth}
          onChange={(v) => setValue("bandwidth", v)}
          min={0.1}
          step="1"
          placeholder="100"
          error={errors.bandwidth}
        />
        <InputField
          id="rtt"
          label={t("rtt")}
          value={values.rtt}
          onChange={(v) => setValue("rtt", v)}
          min={0.1}
          step="0.1"
          placeholder="80"
          error={errors.rtt}
        />
        <InputField
          id="windowSize"
          label={t("windowSize")}
          value={values.windowSize}
          onChange={(v) => setValue("windowSize", v)}
          min={1}
          step="1"
          placeholder="64"
          error={errors.windowSize}
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={t("bdp")}
              value={result.bdpKBytes.toFixed(2)}
              unit="KB"
              size="lg"
            />
            <OutputDisplay
              label={t("maxThroughput")}
              value={result.maxThroughputMbps.toFixed(2)}
              unit="Mbps"
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: t("bdpBits"), value: result.bdpBits.toLocaleString(), unit: "bits" },
              { label: t("bdpBytes"), value: result.bdpBytes.toLocaleString(), unit: "bytes" },
              { label: t("requiredWindow"), value: result.requiredWindowKB.toFixed(2), unit: "KB" },
              {
                label: t("windowUtilization"),
                value: result.windowUtilization.toFixed(1),
                unit: "%",
              },
            ]}
          />

          <div
            className={`rounded-lg border p-4 ${result.isWindowSufficient ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}`}
          >
            <p className="text-sm font-medium">
              {result.isWindowSufficient ? t("windowSufficient") : t("windowInsufficient")}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{t("calculationSteps")}:</p>
            <div className="text-sm text-muted-foreground font-mono space-y-1">
              {result.steps.map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-2">
              <p className="text-sm font-medium">{t("recommendations")}:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {result.recommendations.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
