"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AreaInput, type AreaResult, calculateArea } from "@/lib/converters/math/area";
import { AreaFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  shape:
    | "rectangle"
    | "square"
    | "triangle"
    | "circle"
    | "trapezoid"
    | "parallelogram"
    | "ellipse"
    | "sector"
    | "rhombus";
  length: string;
  width: string;
  base: string;
  height: string;
  radius: string;
  radiusA: string;
  radiusB: string;
  base1: string;
  base2: string;
  angle: string;
  diagonal1: string;
  diagonal2: string;
}

const useAreaStore = createCalculatorStore<FormValues, AreaResult | null>({
  name: "area-calculator",
  schema: AreaFormSchema,
  initialValues: {
    shape: "rectangle",
    length: "10",
    width: "5",
    base: "6",
    height: "4",
    radius: "5",
    radiusA: "5",
    radiusB: "3",
    base1: "8",
    base2: "4",
    angle: "90",
    diagonal1: "6",
    diagonal2: "8",
  },
  calculate: (vals) => {
    const input: AreaInput = {
      shape: vals.shape,
      length: parseFloat(vals.length) || undefined,
      width: parseFloat(vals.width) || undefined,
      base: parseFloat(vals.base) || undefined,
      height: parseFloat(vals.height) || undefined,
      radius: parseFloat(vals.radius) || undefined,
      radiusA: parseFloat(vals.radiusA) || undefined,
      radiusB: parseFloat(vals.radiusB) || undefined,
      base1: parseFloat(vals.base1) || undefined,
      base2: parseFloat(vals.base2) || undefined,
      angle: parseFloat(vals.angle) || undefined,
      diagonal1: parseFloat(vals.diagonal1) || undefined,
      diagonal2: parseFloat(vals.diagonal2) || undefined,
    };
    return calculateArea(input);
  },
});

export function AreaCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useAreaStore();

  const areaResult = result;

  const renderInputs = () => {
    switch (values.shape) {
      case "rectangle":
        return (
          <>
            <InputField
              id="length"
              label={tMath("length")}
              value={values.length}
              onChange={(v) => setValue("length", v)}
              step="any"
              min={0.0001}
              placeholder="10"
              error={errors.length}
            />
            <InputField
              id="width"
              label={tMath("width")}
              value={values.width}
              onChange={(v) => setValue("width", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.width}
            />
          </>
        );
      case "square":
        return (
          <InputField
            id="length"
            label={tMath("sideLength")}
            value={values.length}
            onChange={(v) => setValue("length", v)}
            step="any"
            min={0.0001}
            placeholder="5"
            error={errors.length}
          />
        );
      case "triangle":
      case "parallelogram":
        return (
          <>
            <InputField
              id="base"
              label={tMath("base")}
              value={values.base}
              onChange={(v) => setValue("base", v)}
              step="any"
              min={0.0001}
              placeholder="6"
              error={errors.base}
            />
            <InputField
              id="height"
              label={tMath("height")}
              value={values.height}
              onChange={(v) => setValue("height", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.height}
            />
          </>
        );
      case "circle":
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
      case "trapezoid":
        return (
          <>
            <InputField
              id="base1"
              label={tMath("base1")}
              value={values.base1}
              onChange={(v) => setValue("base1", v)}
              step="any"
              min={0.0001}
              placeholder="8"
              error={errors.base1}
            />
            <InputField
              id="base2"
              label={tMath("base2")}
              value={values.base2}
              onChange={(v) => setValue("base2", v)}
              step="any"
              min={0.0001}
              placeholder="4"
              error={errors.base2}
            />
            <InputField
              id="height"
              label={tMath("height")}
              value={values.height}
              onChange={(v) => setValue("height", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.height}
            />
          </>
        );
      case "ellipse":
        return (
          <>
            <InputField
              id="radiusA"
              label={tMath("semiMajorAxis")}
              value={values.radiusA}
              onChange={(v) => setValue("radiusA", v)}
              step="any"
              min={0.0001}
              placeholder="5"
              error={errors.radiusA}
            />
            <InputField
              id="radiusB"
              label={tMath("semiMinorAxis")}
              value={values.radiusB}
              onChange={(v) => setValue("radiusB", v)}
              step="any"
              min={0.0001}
              placeholder="3"
              error={errors.radiusB}
            />
          </>
        );
      case "sector":
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
              id="angle"
              label={tMath("angleDegrees")}
              value={values.angle}
              onChange={(v) => setValue("angle", v)}
              step="any"
              min={0.0001}
              max={360}
              placeholder="90"
              error={errors.angle}
            />
          </>
        );
      case "rhombus":
        return (
          <>
            <InputField
              id="diagonal1"
              label={tMath("diagonal1")}
              value={values.diagonal1}
              onChange={(v) => setValue("diagonal1", v)}
              step="any"
              min={0.0001}
              placeholder="6"
              error={errors.diagonal1}
            />
            <InputField
              id="diagonal2"
              label={tMath("diagonal2")}
              value={values.diagonal2}
              onChange={(v) => setValue("diagonal2", v)}
              step="any"
              min={0.0001}
              placeholder="8"
              error={errors.diagonal2}
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
              <SelectItem value="rectangle">{tMath("rectangle")}</SelectItem>
              <SelectItem value="square">{tMath("square")}</SelectItem>
              <SelectItem value="triangle">{tMath("triangle")}</SelectItem>
              <SelectItem value="circle">{tMath("circle")}</SelectItem>
              <SelectItem value="trapezoid">{tMath("trapezoid")}</SelectItem>
              <SelectItem value="parallelogram">{tMath("parallelogram")}</SelectItem>
              <SelectItem value="ellipse">{tMath("ellipse")}</SelectItem>
              <SelectItem value="sector">{tMath("sector")}</SelectItem>
              <SelectItem value="rhombus">{tMath("rhombus")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">{renderInputs()}</div>
      </div>

      {areaResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("area")}
              value={areaResult.area.toFixed(4)}
              unit={areaResult.unit}
              size="lg"
            />
            {areaResult.perimeter !== null && (
              <OutputDisplay
                label={tMath("perimeter")}
                value={areaResult.perimeter.toFixed(4)}
                unit="units"
                size="lg"
              />
            )}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{areaResult.formula}</p>
          </div>

          {areaResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {areaResult.steps.map((step) => (
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
