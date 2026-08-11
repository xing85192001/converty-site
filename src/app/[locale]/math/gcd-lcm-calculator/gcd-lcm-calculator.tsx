"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OutputDisplay } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateGcdLcm,
  type GcdLcmInput,
  type GcdLcmResult,
} from "@/lib/converters/math/gcd-lcm";

export function GcdLcmCalculator() {
  const tMath = useTranslations("calculator.math");
  const [numbersInput, setNumbersInput] = useState("12, 18, 24");
  const [result, setResult] = useState<GcdLcmResult | null>(null);

  const calculate = () => {
    const numbers = numbersInput
      .split(/[,\s\n]+/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !Number.isNaN(n) && n !== 0);

    if (numbers.length > 0) {
      const input: GcdLcmInput = { numbers };
      const calcResult = calculateGcdLcm(input);
      setResult(calcResult.ok ? calcResult.value : null);
    } else {
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="numbers">{tMath("enterNumbers")}</Label>
          <Textarea
            id="numbers"
            value={numbersInput}
            onChange={(e) => setNumbersInput(e.target.value)}
            placeholder="Enter integers separated by commas, spaces, or new lines"
            rows={3}
          />
          <p className="text-sm text-muted-foreground">{tMath("numbersHelp")}</p>
        </div>

        <Button onClick={calculate} className="w-full">
          {tMath("calculate")}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay label={tMath("gcd")} value={result.gcd.toString()} size="lg" />
            <OutputDisplay label={tMath("lcm")} value={result.lcm.toString()} size="lg" />
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-3">{tMath("primeFactorizations")}:</p>
            <div className="space-y-2">
              {result.primeFactorizations.map((pf) => (
                <div key={`pf-${pf.number}`} className="flex items-center gap-2 text-sm">
                  <span className="font-medium min-w-[60px]">{pf.number} =</span>
                  <span className="font-mono text-muted-foreground">{pf.factorString}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("gcdSteps")}:</p>
              {result.gcdSteps.map((step) => (
                <p key={step} className="text-sm text-muted-foreground font-mono">
                  {step}
                </p>
              ))}
            </div>
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("lcmSteps")}:</p>
              {result.lcmSteps.map((step) => (
                <p key={step} className="text-sm text-muted-foreground font-mono">
                  {step}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
