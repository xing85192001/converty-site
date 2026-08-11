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
  calculateSurfaceArea,
  type SurfaceAreaInput,
  type SurfaceAreaResult,
} from "@/lib/converters/math/surface-area";
import { SurfaceAreaFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  shape:
    | "cube"
    | "rectangularPrism"
    | "sphere"
    | "cylinder"
    | "cone"
    | "pyramid"
    | "triangularPrism"
    | "hemisphere";
  side: string;
  length: string;
  width: string;
  height: string;
  radius: string;
  slantHeight: string;
  baseLength: string;
  baseWidth: string;
  triangleBase: string;
  triangleHeight: string;
  prismLength: string;
}

const useSurfaceAreaStore = createCalculatorStore<FormValues, SurfaceAreaResult | null>({
  name: "surface-area-calculator",
  schema: SurfaceAreaFormSchema,
  initialValues: {
    shape: "cube",
    side: "5",
    length: "6",
    width: "4",
    height: "3",
    radius: "5",
    slantHeight: "8",
    baseLength: "6",
    baseWidth: "4",
    triangleBase: "5",
    triangleHeight: "4",
    prismLength: "10",
  },
  calculate: (vals) => {
    const input: SurfaceAreaInput = {
      shape: vals.shape,
      side: parseFloat(vals.side) || undefined,
      length: parseFloat(vals.length) || undefined,
      width: parseFloat(vals.width) || undefined,
      height: parseFloat(vals.height) || undefined,
      radius: parseFloat(vals.radius) || undefined,
      slantHeight: parseFloat(vals.slantHeight) || undefined,
      baseLength: parseFloat(vals.baseLength) || undefined,
      baseWidth: parseFloat(vals.baseWidth) || undefined,
      triangleBase: parseFloat(vals.triangleBase) || undefined,
      triangleHeight: parseFloat(vals.triangleHeight) || undefined,
      prismLength: parseFloat(vals.prismLength) || undefined,
    };
    return calculateSurfaceArea(input);
  },
});

export function SurfaceAreaCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useSurfaceAreaStore();

  const surfaceAreaResult = result;

  const renderInputs = () => {
    switch (values.shape) {
      case "cube":
        return (
          <InputField
            id="side"
            label={tMath("sideLength")}
            value={values.side}
            onChange={(v) => setValue("side", v)}
            step="any"
            min={0.0001}
            placeholder="5"
            error={errors.side}
          />
        );
      case "rectangularPrism":
        return (
          <>
            <InputField
              id="length"
              label={tMath("length")}
              value={values.length}
              onChange={(v) => setValue("length", v)}
              step="any"
              min={0.0001}
              placeholder="6"
              error={errors.length}
            />
            <InputField
              id="width"
              label={tMath("width")}
              value={values.width}
              onChange={(v) => setValue("width", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.width}
            />
            <InputField
              id="height"
              label={tMath("height")}
              value={values.height}
              onChange={(v) => setValue("height", v)}
              step="any"
              min={0.0001}
              placeholder="3"
              error={errors.height}
            />
          </>
        );
      case "sphere":
      case "hemisphere":
        return (
          <InputField
            id="radius"
            label={tMath("radius")}
            value={values.radius}
            onChange={(v) => setValue("radius", v)}
            step="any"
            min={0.0001}
            placeholder="5"
            error={errors.radius}
          />
        );
      case "cylinder":
        return (
          <>
            <InputField
              id="radius"
              label={tMath("radius")}
              value={values.radius}
              onChange={(v) => setValue("radius", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.radius}
            />
            <InputField
              id="height"
              label={tMath("height")}
              value={values.height}
              onChange={(v) => setValue("height", v)}
              step="any"
              min={0.0001}
              placeholder="10"
              error={errors.height}
            />
          </>
        );
      case "cone":
        return (
          <>
            <InputField
              id="radius"
              label={tMath("radius")}
              value={values.radius}
              onChange={(v) => setValue("radius", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.radius}
            />
            <InputField
              id="slantHeight"
              label={tMath("slantHeight")}
              value={values.slantHeight}
              onChange={(v) => setValue("slantHeight", v)}
              step="any"
              min={0.0001}
              placeholder="8"
              error={errors.slantHeight}
            />
          </>
        );
      case "pyramid":
        return (
          <>
            <InputField
              id="baseLength"
              label={tMath("baseLength")}
              value={values.baseLength}
              onChange={(v) => setValue("baseLength", v)}
              step="any"
              min={0.0001}
              placeholder="6"
              error={errors.baseLength}
            />
            <InputField
              id="baseWidth"
              label={tMath("baseWidth")}
              value={values.baseWidth}
              onChange={(v) => setValue("baseWidth", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.baseWidth}
            />
            <InputField
              id="slantHeight"
              label={tMath("slantHeight")}
              value={values.slantHeight}
              onChange={(v) => setValue("slantHeight", v)}
              step="any"
              min={0.0001}
              placeholder="8"
              error={errors.slantHeight}
            />
          </>
        );
      case "triangularPrism":
        return (
          <>
            <InputField
              id="triangleBase"
              label={tMath("triangleBase")}
              value={values.triangleBase}
              onChange={(v) => setValue("triangleBase", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.triangleBase}
            />
            <InputField
              id="triangleHeight"
              label={tMath("triangleHeight")}
              value={values.triangleHeight}
              onChange={(v) => setValue("triangleHeight", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.triangleHeight}
            />
            <InputField
              id="prismLength"
              label={tMath("prismLength")}
              value={values.prismLength}
              onChange={(v) => setValue("prismLength", v)}
              step="any"
              min={0.0001}
              placeholder="10"
              error={errors.prismLength}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{tMath("shape")}</Label>
          <Select
            value={values.shape}
            onValueChange={(v) => setValue("shape", v as FormValues["shape"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cube">{tMath("cube")}</SelectItem>
              <SelectItem value="rectangularPrism">{tMath("rectangularPrism")}</SelectItem>
              <SelectItem value="sphere">{tMath("sphere")}</SelectItem>
              <SelectItem value="cylinder">{tMath("cylinder")}</SelectItem>
              <SelectItem value="cone">{tMath("cone")}</SelectItem>
              <SelectItem value="pyramid">{tMath("pyramid")}</SelectItem>
              <SelectItem value="triangularPrism">{tMath("triangularPrism")}</SelectItem>
              <SelectItem value="hemisphere">{tMath("hemisphere")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">{renderInputs()}</div>
      </div>

      {surfaceAreaResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tMath("totalSurfaceArea")}
            value={surfaceAreaResult.totalSurfaceArea.toFixed(4)}
            unit={surfaceAreaResult.unit}
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tMath("lateralSurfaceArea"),
                value: surfaceAreaResult.lateralSurfaceArea.toFixed(4),
                unit: "sq units",
              },
              {
                label: tMath("baseSurfaceArea"),
                value: surfaceAreaResult.baseSurfaceArea.toFixed(4),
                unit: "sq units",
              },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{surfaceAreaResult.formula}</p>
          </div>

          {surfaceAreaResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {surfaceAreaResult.steps.map((step) => (
                <p key={step} className="text-sm text-muted-foreground font-mono">
                  {step}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
