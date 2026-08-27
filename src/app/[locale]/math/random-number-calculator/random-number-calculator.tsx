"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateRandomNumber,
  type RandomNumberInput,
  type RandomNumberResult,
} from "@/lib/converters/math/random-number";

type RandomMode = "integer" | "float" | "multiple" | "dice";

interface FormValues {
  mode: RandomMode;
  min: string;
  max: string;
  count: string;
  diceSides: string;
  diceCount: string;
}

export function RandomNumberCalculator() {
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const [values, setValues] = useState<FormValues>({
    mode: "integer",
    min: "1",
    max: "100",
    count: "1",
    diceSides: "6",
    diceCount: "2",
  });

  const [result, setResult] = useState<RandomNumberResult | null>(null);

  const setValue = (key: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const generate = () => {
    const input: RandomNumberInput = {
      mode: values.mode,
      min: parseFloat(values.min) || 1,
      max: parseFloat(values.max) || 100,
      count: parseInt(values.count) || 1,
      diceSides: parseInt(values.diceSides) || 6,
      diceCount: parseInt(values.diceCount) || 1,
    };
    const calcResult = calculateRandomNumber(input);
    setResult(calcResult.ok ? calcResult.value : null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{tMath("generatorMode")}</Label>
        <Select value={values.mode} onValueChange={(v) => setValue("mode", v as RandomMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="integer">{tMath("randomInteger")}</SelectItem>
            <SelectItem value="float">{tMath("randomFloat")}</SelectItem>
            <SelectItem value="multiple">{tMath("multipleNumbers")}</SelectItem>
            <SelectItem value="dice">{tMath("diceRoll")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(values.mode === "integer" || values.mode === "float" || values.mode === "multiple") && (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            id="min"
            label={tMath("minimum")}
            value={values.min}
            onChange={(v) => setValue("min", v)}
            step={values.mode === "float" ? "any" : "1"}
          />
          <InputField
            id="max"
            label={tMath("maximum")}
            value={values.max}
            onChange={(v) => setValue("max", v)}
            step={values.mode === "float" ? "any" : "1"}
          />
          {values.mode === "multiple" && (
            <InputField
              id="count"
              label={tMath("count")}
              value={values.count}
              onChange={(v) => setValue("count", v)}
              min={1}
              max={1000}
            />
          )}
        </div>
      )}

      {values.mode === "dice" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="diceCount"
            label={tMath("numberOfDice")}
            value={values.diceCount}
            onChange={(v) => setValue("diceCount", v)}
            min={1}
            max={100}
          />
          <InputField
            id="diceSides"
            label={tMath("sidesPerDie")}
            value={values.diceSides}
            onChange={(v) => setValue("diceSides", v)}
            min={2}
            max={100}
          />
        </div>
      )}

      <Button onClick={generate} className="w-full">
        {tMath("generate")}
      </Button>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("result")}
            value={
              Array.isArray(result.results) ? result.results.join(", ") : String(result.results)
            }
            size="lg"
          />

          {result.sum !== undefined && (
            <ResultGrid
              results={[
                { label: tMath("sum"), value: result.sum.toFixed(2) },
                { label: tMath("average"), value: result.average?.toFixed(2) || "0" },
                { label: tMath("minimum"), value: String(result.min) },
                { label: tMath("maximum"), value: String(result.max) },
              ]}
            />
          )}

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{result.formula}</p>
          </div>
        </div>
      )}
    </div>
  );
}
