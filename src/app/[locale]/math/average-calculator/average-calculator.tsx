"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AverageInput,
  type AverageResult,
  calculateAverage,
} from "@/lib/converters/math/average";

export function AverageCalculator() {
  const tMath = useTranslations("calculator.math");
  const [numbersInput, setNumbersInput] = useState("10, 20, 30, 40, 50");
  const [result, setResult] = useState<AverageResult | null>(null);

  const handleCalculate = () => {
    const numbers = numbersInput
      .split(/[,\s]+/)
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !Number.isNaN(n));

    if (numbers.length > 0) {
      const input: AverageInput = { numbers };
      const calcResult = calculateAverage(input);
      setResult(calcResult.ok ? calcResult.value : null);
    }
  };

  // Calculate on initial render
  useState(() => {
    handleCalculate();
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="numbers">{tMath("numbers")}</Label>
          <Input
            id="numbers"
            value={numbersInput}
            onChange={(e) => setNumbersInput(e.target.value)}
            placeholder="10, 20, 30, 40, 50"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Enter numbers separated by commas or spaces
          </p>
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calculate
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay label={tMath("average")} value={result.mean.toFixed(4)} size="lg" />

          <ResultGrid
            results={[
              { label: tMath("median"), value: result.median.toFixed(4) },
              { label: tMath("mode"), value: result.mode.join(", ") },
              { label: tMath("sum"), value: result.sum.toFixed(4) },
              { label: tMath("count"), value: result.count.toString() },
              { label: tMath("min"), value: result.min.toFixed(4) },
              { label: tMath("max"), value: result.max.toFixed(4) },
              { label: tMath("range"), value: result.range.toFixed(4) },
              { label: tMath("standardDeviation"), value: result.standardDeviation.toFixed(4) },
              { label: tMath("variance"), value: result.variance.toFixed(4) },
              ...(result.geometricMean !== null
                ? [{ label: "Geometric Mean", value: result.geometricMean.toFixed(4) }]
                : []),
              ...(result.harmonicMean !== null
                ? [{ label: "Harmonic Mean", value: result.harmonicMean.toFixed(4) }]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}
