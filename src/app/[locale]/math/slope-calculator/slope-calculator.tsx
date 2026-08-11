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
import { calculateSlope, type SlopeInput, type SlopeResult } from "@/lib/converters/math/slope";
import { SlopeFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "twoPoints" | "slopeIntercept" | "pointSlope";
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  slope: string;
  yIntercept: string;
}

const useSlopeStore = createCalculatorStore<FormValues, SlopeResult | null>({
  name: "slope-calculator",
  schema: SlopeFormSchema,
  initialValues: {
    mode: "twoPoints",
    x1: "1",
    y1: "2",
    x2: "4",
    y2: "8",
    slope: "2",
    yIntercept: "3",
  },
  calculate: (vals) => {
    const input: SlopeInput = {
      mode: vals.mode,
      x1: parseFloat(vals.x1),
      y1: parseFloat(vals.y1),
      x2: parseFloat(vals.x2),
      y2: parseFloat(vals.y2),
      slope: parseFloat(vals.slope),
      yIntercept: parseFloat(vals.yIntercept),
    };
    return calculateSlope(input);
  },
});

export function SlopeCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useSlopeStore();

  const slopeResult = result;

  const renderInputs = () => {
    switch (values.mode) {
      case "twoPoints":
        return (
          <>
            <InputField
              id="x1"
              label={tMath("x1")}
              value={values.x1}
              onChange={(v) => setValue("x1", v)}
              step="any"
              placeholder="1"
              error={errors.x1}
            />
            <InputField
              id="y1"
              label={tMath("y1")}
              value={values.y1}
              onChange={(v) => setValue("y1", v)}
              step="any"
              placeholder="2"
              error={errors.y1}
            />
            <InputField
              id="x2"
              label={tMath("x2")}
              value={values.x2}
              onChange={(v) => setValue("x2", v)}
              step="any"
              placeholder="4"
              error={errors.x2}
            />
            <InputField
              id="y2"
              label={tMath("y2")}
              value={values.y2}
              onChange={(v) => setValue("y2", v)}
              step="any"
              placeholder="8"
              error={errors.y2}
            />
          </>
        );
      case "slopeIntercept":
        return (
          <>
            <InputField
              id="slope"
              label={tMath("slope")}
              value={values.slope}
              onChange={(v) => setValue("slope", v)}
              step="any"
              placeholder="2"
              error={errors.slope}
            />
            <InputField
              id="yIntercept"
              label={tMath("yIntercept")}
              value={values.yIntercept}
              onChange={(v) => setValue("yIntercept", v)}
              step="any"
              placeholder="3"
              error={errors.yIntercept}
            />
          </>
        );
      case "pointSlope":
        return (
          <>
            <InputField
              id="x1"
              label={tMath("x1")}
              value={values.x1}
              onChange={(v) => setValue("x1", v)}
              step="any"
              placeholder="2"
              error={errors.x1}
            />
            <InputField
              id="y1"
              label={tMath("y1")}
              value={values.y1}
              onChange={(v) => setValue("y1", v)}
              step="any"
              placeholder="3"
              error={errors.y1}
            />
            <InputField
              id="slope"
              label={tMath("slope")}
              value={values.slope}
              onChange={(v) => setValue("slope", v)}
              step="any"
              placeholder="2"
              error={errors.slope}
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
          <Label>{tMath("inputMethod")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twoPoints">{tMath("twoPoints")}</SelectItem>
              <SelectItem value="slopeIntercept">{tMath("slopeInterceptForm")}</SelectItem>
              <SelectItem value="pointSlope">{tMath("pointSlopeForm")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">{renderInputs()}</div>
      </div>

      {slopeResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("slope")}
              value={slopeResult.slope !== null ? slopeResult.slope.toFixed(4) : "undefined"}
              size="lg"
            />
            <OutputDisplay
              label={tMath("yIntercept")}
              value={
                !Number.isNaN(slopeResult.yIntercept)
                  ? slopeResult.yIntercept.toFixed(4)
                  : "undefined"
              }
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("slopeType"), value: slopeResult.slopeType },
              { label: tMath("angle"), value: slopeResult.angle.toFixed(2), unit: "°" },
              ...(slopeResult.xIntercept !== null
                ? [{ label: tMath("xIntercept"), value: slopeResult.xIntercept.toFixed(4) }]
                : []),
              ...(slopeResult.distance !== null
                ? [{ label: tMath("distance"), value: slopeResult.distance.toFixed(4) }]
                : []),
            ]}
          />

          {slopeResult.midpoint && (
            <ResultGrid
              results={[
                { label: tMath("midpointX"), value: slopeResult.midpoint.x.toFixed(4) },
                { label: tMath("midpointY"), value: slopeResult.midpoint.y.toFixed(4) },
              ]}
            />
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("equationForms")}:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {tMath("slopeInterceptForm")}: {slopeResult.slopeInterceptForm}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {tMath("pointSlopeForm")}: {slopeResult.pointSlopeForm}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {tMath("standardForm")}: {slopeResult.standardForm}
            </p>
          </div>

          <ResultGrid
            results={[
              {
                label: tMath("parallelSlope"),
                value:
                  slopeResult.parallelSlope !== null
                    ? slopeResult.parallelSlope.toFixed(4)
                    : "undefined",
              },
              {
                label: tMath("perpendicularSlope"),
                value:
                  slopeResult.perpendicularSlope !== null
                    ? slopeResult.perpendicularSlope.toFixed(4)
                    : "undefined",
              },
            ]}
          />

          {slopeResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {slopeResult.steps.map((step) => (
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
