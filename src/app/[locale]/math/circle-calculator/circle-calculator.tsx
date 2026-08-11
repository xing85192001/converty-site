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
import { type CircleInput, type CircleResult, calculateCircle } from "@/lib/converters/math/circle";
import { CircleFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "radius" | "diameter" | "circumference" | "area";
  value: string;
}

const useCircleStore = createCalculatorStore<FormValues, CircleResult | null>({
  name: "circle-calculator",
  schema: CircleFormSchema,
  initialValues: {
    mode: "radius",
    value: "5",
  },
  calculate: (vals) => {
    const input: CircleInput = {
      mode: vals.mode,
      value: parseFloat(vals.value) || 0,
    };
    return calculateCircle(input);
  },
});

export function CircleCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useCircleStore();

  const circleResult = result;

  const getInputLabel = () => {
    switch (values.mode) {
      case "radius":
        return tMath("radius");
      case "diameter":
        return tMath("diameter");
      case "circumference":
        return tMath("circumference");
      case "area":
        return tMath("area");
      default:
        return tMath("value");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Known Value</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radius">{tMath("radius")}</SelectItem>
              <SelectItem value="diameter">{tMath("diameter")}</SelectItem>
              <SelectItem value="circumference">{tMath("circumference")}</SelectItem>
              <SelectItem value="area">{tMath("area")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="value"
          label={getInputLabel()}
          value={values.value}
          onChange={(v) => setValue("value", v)}
          step="any"
          min={0.0001}
          placeholder="5"
          error={errors.value}
        />
      </div>

      {circleResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("area")}
              value={circleResult.area.toFixed(4)}
              unit="sq units"
              size="lg"
            />
            <OutputDisplay
              label={tMath("circumference")}
              value={circleResult.circumference.toFixed(4)}
              unit="units"
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("radius"), value: circleResult.radius.toFixed(4) },
              { label: tMath("diameter"), value: circleResult.diameter.toFixed(4) },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {circleResult.formulas.circumference}
            </p>
            <p className="text-sm text-muted-foreground font-mono">{circleResult.formulas.area}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium mb-3">Arc & Sector for Common Angles:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Angle</th>
                    <th className="text-left p-2">Arc Length</th>
                    <th className="text-left p-2">Sector Area</th>
                    <th className="text-left p-2">Chord</th>
                  </tr>
                </thead>
                <tbody>
                  {circleResult.commonAngles.slice(0, 5).map((angle) => (
                    <tr key={angle.degrees} className="border-b">
                      <td className="p-2">{angle.degrees}°</td>
                      <td className="p-2">{angle.arcLength.toFixed(4)}</td>
                      <td className="p-2">{angle.sectorArea.toFixed(4)}</td>
                      <td className="p-2">{angle.chordLength.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
