"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateStandardDeviation,
  type StandardDeviationInput,
  type StandardDeviationResult,
} from "@/lib/converters/math/standard-deviation";

export function StandardDeviationCalculator() {
  const tMath = useTranslations("calculator.math");
  const [dataInput, setDataInput] = useState("10, 12, 23, 23, 16, 23, 21, 16");
  const [isPopulation, setIsPopulation] = useState(false);
  const [result, setResult] = useState<StandardDeviationResult | null>(null);

  const calculate = () => {
    const numbers = dataInput
      .split(/[,\s\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !Number.isNaN(n));

    if (numbers.length > 0) {
      const input: StandardDeviationInput = {
        numbers,
        isPopulation,
      };
      const calcResult = calculateStandardDeviation(input);
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
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("standardDeviation")}
              value={result.standardDeviation.toFixed(6)}
              size="lg"
            />
            <OutputDisplay label={tMath("variance")} value={result.variance.toFixed(6)} size="lg" />
          </div>

          <ResultGrid
            results={[
              { label: tMath("mean"), value: result.mean.toFixed(6) },
              { label: tMath("count"), value: result.count.toString() },
              { label: tMath("sum"), value: result.sum.toFixed(6) },
              {
                label: tMath("coefficientOfVariation"),
                value: result.coefficientOfVariation.toFixed(2),
                unit: "%",
              },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{result.formula}</p>
          </div>

          {result.deviations.length <= 20 && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-3">{tMath("deviationsTable")}:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{tMath("value")}</th>
                      <th className="text-left p-2">{tMath("deviation")}</th>
                      <th className="text-left p-2">{tMath("squaredDeviation")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.deviations.map((d) => (
                      <tr key={`dev-${d.value}`} className="border-b">
                        <td className="p-2">{d.value}</td>
                        <td className="p-2">{d.deviation.toFixed(4)}</td>
                        <td className="p-2">{d.squaredDeviation.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.zScores.length <= 20 && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-3">{tMath("zScores")}:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                {result.zScores.map((z) => (
                  <div key={`zscore-${z.value}`} className="bg-muted rounded p-2 text-center">
                    {z.value} → z = {z.zScore.toFixed(3)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
