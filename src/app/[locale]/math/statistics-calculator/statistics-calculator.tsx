"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateStatistics,
  type StatisticsInput,
  type StatisticsResult,
} from "@/lib/converters/math/statistics";

export function StatisticsCalculator() {
  const tMath = useTranslations("calculator.math");
  const [dataInput, setDataInput] = useState("2, 4, 6, 8, 10, 12, 14, 16, 18, 20");
  const [isPopulation, setIsPopulation] = useState(false);
  const [result, setResult] = useState<StatisticsResult | null>(null);

  const calculate = () => {
    const data = dataInput
      .split(/[,\s\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !Number.isNaN(n));

    if (data.length > 0) {
      const input: StatisticsInput = {
        data,
        population: isPopulation,
      };
      const calcResult = calculateStatistics(input);
      setResult(calcResult.ok ? calcResult.value : null);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="data">{tMath("dataValues")}</Label>
          <Textarea
            id="data"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            placeholder="Enter numbers separated by commas, spaces, or new lines"
            rows={4}
          />
          <p className="text-sm text-muted-foreground">{tMath("dataValuesHelp")}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="population-switch">{tMath("populationOrSample")}</Label>
            <p className="text-sm text-muted-foreground">
              {isPopulation ? tMath("populationVariance") : tMath("sampleVariance")}
            </p>
          </div>
          <Switch id="population-switch" checked={isPopulation} onCheckedChange={setIsPopulation} />
        </div>

        <Button onClick={calculate} className="w-full">
          {tMath("calculate")}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <OutputDisplay label={tMath("mean")} value={result.mean.toFixed(4)} size="lg" />
            <OutputDisplay label={tMath("median")} value={result.median.toFixed(4)} size="lg" />
            <OutputDisplay
              label={tMath("mode")}
              value={result.mode.length > 0 ? result.mode.join(", ") : "None"}
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("count"), value: result.count.toString() },
              { label: tMath("sum"), value: result.sum.toFixed(4) },
              { label: tMath("min"), value: result.min.toFixed(4) },
              { label: tMath("max"), value: result.max.toFixed(4) },
              { label: tMath("range"), value: result.range.toFixed(4) },
              { label: tMath("variance"), value: result.variance.toFixed(6) },
              { label: tMath("standardDeviation"), value: result.standardDeviation.toFixed(6) },
              { label: tMath("standardError"), value: result.standardError.toFixed(6) },
            ]}
          />

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-3">{tMath("quartiles")}:</p>
            <ResultGrid
              results={[
                { label: "Q1 (25%)", value: result.quartiles.q1.toFixed(4) },
                { label: "Q2 (50%)", value: result.quartiles.q2.toFixed(4) },
                { label: "Q3 (75%)", value: result.quartiles.q3.toFixed(4) },
                { label: tMath("iqr"), value: result.quartiles.iqr.toFixed(4) },
              ]}
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("skewness"), value: result.skewness.toFixed(6) },
              { label: tMath("kurtosis"), value: result.kurtosis.toFixed(6) },
              {
                label: tMath("coefficientOfVariation"),
                value: result.coefficientOfVariation.toFixed(2),
                unit: "%",
              },
              ...(result.geometricMean !== null
                ? [{ label: tMath("geometricMean"), value: result.geometricMean.toFixed(4) }]
                : []),
              ...(result.harmonicMean !== null
                ? [{ label: tMath("harmonicMean"), value: result.harmonicMean.toFixed(4) }]
                : []),
            ]}
          />

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-3">{tMath("percentiles")}:</p>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-sm">
              {Object.entries(result.percentiles).map(([p, value]) => (
                <div key={p} className="bg-muted rounded p-2 text-center">
                  <div className="font-medium">{p}%</div>
                  <div className="text-muted-foreground">{value.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {result.sortedData.length <= 30 && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-3">{tMath("sortedData")}:</p>
              <p className="text-sm text-muted-foreground font-mono">
                {result.sortedData.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
