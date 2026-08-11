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
  calculateTriangle,
  type TriangleInput,
  type TriangleResult,
} from "@/lib/converters/math/triangle";
import { TriangleFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "sides" | "sasAngle" | "asaAngles" | "aasAngles";
  sideA: string;
  sideB: string;
  sideC: string;
  angleA: string;
  angleB: string;
  angleC: string;
}

const useTriangleStore = createCalculatorStore<FormValues, TriangleResult | null>({
  name: "triangle-calculator",
  schema: TriangleFormSchema,
  initialValues: {
    mode: "sides",
    sideA: "3",
    sideB: "4",
    sideC: "5",
    angleA: "60",
    angleB: "60",
    angleC: "60",
  },
  calculate: (vals) => {
    const input: TriangleInput = {
      mode: vals.mode,
      sideA: parseFloat(vals.sideA) || undefined,
      sideB: parseFloat(vals.sideB) || undefined,
      sideC: parseFloat(vals.sideC) || undefined,
      angleA: parseFloat(vals.angleA) || undefined,
      angleB: parseFloat(vals.angleB) || undefined,
      angleC: parseFloat(vals.angleC) || undefined,
    };
    return calculateTriangle(input);
  },
});

export function TriangleCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useTriangleStore();

  const triangleResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Input Method</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sides">SSS (Three Sides)</SelectItem>
              <SelectItem value="sasAngle">SAS (Two Sides + Included Angle)</SelectItem>
              <SelectItem value="asaAngles">ASA (Two Angles + Included Side)</SelectItem>
              <SelectItem value="aasAngles">AAS (Two Angles + Non-included Side)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(values.mode === "sides" ||
            values.mode === "sasAngle" ||
            values.mode === "aasAngles") && (
            <InputField
              id="sideA"
              label={tMath("sideA")}
              value={values.sideA}
              onChange={(v) => setValue("sideA", v)}
              step="any"
              min={0.0001}
              placeholder="3"
              error={errors.sideA}
            />
          )}

          {(values.mode === "sides" || values.mode === "sasAngle") && (
            <InputField
              id="sideB"
              label={tMath("sideB")}
              value={values.sideB}
              onChange={(v) => setValue("sideB", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.sideB}
            />
          )}

          {(values.mode === "sides" || values.mode === "asaAngles") && (
            <InputField
              id="sideC"
              label={tMath("sideC")}
              value={values.sideC}
              onChange={(v) => setValue("sideC", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.sideC}
            />
          )}

          {(values.mode === "asaAngles" || values.mode === "aasAngles") && (
            <InputField
              id="angleA"
              label={`${tMath("angleA")} (°)`}
              value={values.angleA}
              onChange={(v) => setValue("angleA", v)}
              step="any"
              min={0.0001}
              max={179.9999}
              placeholder="60"
              error={errors.angleA}
            />
          )}

          {(values.mode === "asaAngles" || values.mode === "aasAngles") && (
            <InputField
              id="angleB"
              label={`${tMath("angleB")} (°)`}
              value={values.angleB}
              onChange={(v) => setValue("angleB", v)}
              step="any"
              min={0.0001}
              max={179.9999}
              placeholder="60"
              error={errors.angleB}
            />
          )}

          {values.mode === "sasAngle" && (
            <InputField
              id="angleC"
              label={`${tMath("angleC")} (°)`}
              value={values.angleC}
              onChange={(v) => setValue("angleC", v)}
              step="any"
              min={0.0001}
              max={179.9999}
              placeholder="60"
              error={errors.angleC}
            />
          )}
        </div>
      </div>

      {triangleResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("area")}
              value={triangleResult.area.toFixed(4)}
              unit="sq units"
              size="lg"
            />
            <OutputDisplay
              label={tMath("perimeter")}
              value={triangleResult.perimeter.toFixed(4)}
              unit="units"
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("sideA"), value: triangleResult.sideA.toFixed(4) },
              { label: tMath("sideB"), value: triangleResult.sideB.toFixed(4) },
              { label: tMath("sideC"), value: triangleResult.sideC.toFixed(4) },
              { label: tMath("angleA"), value: triangleResult.angleA.toFixed(2), unit: "°" },
              { label: tMath("angleB"), value: triangleResult.angleB.toFixed(2), unit: "°" },
              { label: tMath("angleC"), value: triangleResult.angleC.toFixed(2), unit: "°" },
            ]}
          />

          <ResultGrid
            results={[
              { label: "Type", value: triangleResult.type },
              { label: "Angle Type", value: triangleResult.angleType },
              { label: "Inradius", value: triangleResult.inradius.toFixed(4) },
              { label: "Circumradius", value: triangleResult.circumradius.toFixed(4) },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
