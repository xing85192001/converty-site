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
import { calculateMatrix, type MatrixInput, type MatrixResult } from "@/lib/converters/math/matrix";

type Mode = MatrixInput["mode"];

const modes: { value: Mode; label: string; needsB: boolean }[] = [
  { value: "add", label: "Addition (A + B)", needsB: true },
  { value: "subtract", label: "Subtraction (A - B)", needsB: true },
  { value: "multiply", label: "Multiplication (A × B)", needsB: true },
  { value: "transpose", label: "Transpose (Aᵀ)", needsB: false },
  { value: "determinant", label: "Determinant (det A)", needsB: false },
  { value: "inverse", label: "Inverse (A⁻¹)", needsB: false },
  { value: "scalar", label: "Scalar Multiply (k × A)", needsB: false },
];

function parseMatrix(text: string): number[][] {
  const rows = text.trim().split("\n");
  return rows.map((row) =>
    row
      .trim()
      .split(/[,\s]+/)
      .map((v) => parseFloat(v) || 0)
  );
}

function matrixToString(m: number[][]): string {
  return m.map((row) => row.join(", ")).join("\n");
}

export function MatrixCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const [mode, setMode] = useState<Mode>("multiply");
  const [matrixAText, setMatrixAText] = useState("1, 2\n3, 4");
  const [matrixBText, setMatrixBText] = useState("5, 6\n7, 8");
  const [scalar, setScalar] = useState(2);
  const [result, setResult] = useState<MatrixResult | null>(null);

  const currentMode = modes.find((m) => m.value === mode);
  const needsB = currentMode?.needsB ?? false;
  const needsScalar = mode === "scalar";

  const calculate = useCallback(() => {
    const matrixA = parseMatrix(matrixAText);
    const matrixB = needsB ? parseMatrix(matrixBText) : undefined;

    const input: MatrixInput = {
      mode,
      matrixA,
      matrixB,
      scalar: needsScalar ? scalar : undefined,
    };

    const calcResult = calculateMatrix(input);
    setResult(calcResult.ok ? calcResult.value : null);
  }, [mode, matrixAText, matrixBText, scalar, needsB, needsScalar]);

  const isResultMatrix = Array.isArray(result?.result);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tMath("matrix") || "Matrix Calculator"}</CardTitle>
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
            <Label>Matrix A (rows separated by newlines, values by commas)</Label>
            <textarea
              className="w-full h-24 p-2 font-mono text-sm border rounded-md bg-background"
              value={matrixAText}
              onChange={(e) => {
                setMatrixAText(e.target.value);
                setResult(null);
              }}
              placeholder="1, 2&#10;3, 4"
            />
          </div>

          {needsB && (
            <div className="space-y-2">
              <Label>Matrix B</Label>
              <textarea
                className="w-full h-24 p-2 font-mono text-sm border rounded-md bg-background"
                value={matrixBText}
                onChange={(e) => {
                  setMatrixBText(e.target.value);
                  setResult(null);
                }}
                placeholder="5, 6&#10;7, 8"
              />
            </div>
          )}

          {needsScalar && (
            <div className="space-y-2">
              <Label>{t("scalar") || "Scalar (k)"}</Label>
              <Input
                type="number"
                value={scalar}
                onChange={(e) => {
                  setScalar(Number(e.target.value));
                  setResult(null);
                }}
              />
            </div>
          )}

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
              <CardTitle>{result.operation}</CardTitle>
            </CardHeader>
            <CardContent>
              {isResultMatrix ? (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Result Matrix</Label>
                  <pre className="p-4 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                    {matrixToString(result.result as number[][])}
                  </pre>
                </div>
              ) : (
                <div>
                  <Label className="text-muted-foreground">Result</Label>
                  <p className="text-3xl font-bold">
                    {typeof result.result === "number" ? result.result.toFixed(6) : result.result}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tResults("details") || "Details"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  { label: "Matrix A Dimensions", value: result.dimensionsA },
                  ...(result.dimensionsB
                    ? [{ label: "Matrix B Dimensions", value: result.dimensionsB }]
                    : []),
                  ...(result.dimensionsResult
                    ? [{ label: "Result Dimensions", value: result.dimensionsResult }]
                    : []),
                  { label: "Is Square Matrix", value: result.isSquare ? "Yes" : "No" },
                  ...(result.determinant !== undefined
                    ? [{ label: "Determinant", value: result.determinant.toFixed(6) }]
                    : []),
                  ...(result.isInvertible !== undefined
                    ? [{ label: "Invertible", value: result.isInvertible ? "Yes" : "No" }]
                    : []),
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tResults("steps") || "Calculation Steps"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm font-mono whitespace-pre-wrap">
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
