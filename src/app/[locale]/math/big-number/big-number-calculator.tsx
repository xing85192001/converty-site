"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type BigNumberInput,
  type BigNumberResult,
  calculateBigNumber,
} from "@/lib/converters/math/big-number";

type Mode = BigNumberInput["mode"];

const modes: { value: Mode; label: string }[] = [
  { value: "add", label: "Addition" },
  { value: "subtract", label: "Subtraction" },
  { value: "multiply", label: "Multiplication" },
  { value: "divide", label: "Division" },
  { value: "power", label: "Power" },
  { value: "factorial", label: "Factorial" },
  { value: "compare", label: "Compare" },
];

export function BigNumberCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const [mode, setMode] = useState<Mode>("multiply");
  const [numberA, setNumberA] = useState("123456789012345678901234567890");
  const [numberB, setNumberB] = useState("987654321098765432109876543210");
  const [precision, setPrecision] = useState(10);
  const [result, setResult] = useState<BigNumberResult | null>(null);

  const calculate = useCallback(() => {
    const input: BigNumberInput = {
      mode,
      numberA,
      numberB: mode !== "factorial" ? numberB : undefined,
      precision,
    };
    const calcResult = calculateBigNumber(input);
    setResult(calcResult.ok ? calcResult.value : null);
  }, [mode, numberA, numberB, precision]);

  const needsSecondNumber = mode !== "factorial";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tMath("bigNumber") || "Big Number Calculator"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("operation") || "Operation"}</Label>
            <Select
              value={mode}
              onValueChange={(v) => {
                setMode(v as Mode);
                setResult(null);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modes.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{mode === "factorial" ? "Number (n)" : "Number A"}</Label>
            <Input
              type="text"
              value={numberA}
              onChange={(e) => {
                setNumberA(e.target.value);
                setResult(null);
              }}
              placeholder="Enter a large integer"
            />
          </div>

          {needsSecondNumber && (
            <div className="space-y-2">
              <Label>Number B</Label>
              <Input
                type="text"
                value={numberB}
                onChange={(e) => {
                  setNumberB(e.target.value);
                  setResult(null);
                }}
                placeholder="Enter a large integer"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("precision") || "Scientific Notation Precision"}</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={precision}
              onChange={(e) => {
                setPrecision(Number(e.target.value));
                setResult(null);
              }}
            />
          </div>

          <button
            type="button"
            onClick={calculate}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t("calculate") || "Calculate"}
          </button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tResults("result") || "Result"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Operation</Label>
                  <p className="text-xl font-mono">{result.operation}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Result</Label>
                  <p className="text-2xl font-bold font-mono break-all">{result.result}</p>
                </div>
                {result.comparison && (
                  <div>
                    <Label className="text-muted-foreground">Comparison</Label>
                    <p className="text-xl font-mono">{result.comparison}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tResults("details") || "Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  {
                    label: "Digit Count",
                    value: result.digitCount.toLocaleString(),
                  },
                  {
                    label: "Scientific Notation",
                    value: result.scientificNotation,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tResults("steps") || "Calculation Steps"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm font-mono">
                {result.steps.map((step) => (
                  <li key={step} className="text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
