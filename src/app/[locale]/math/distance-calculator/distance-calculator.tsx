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
  calculateDistance,
  type DistanceInput,
  type DistanceResult,
} from "@/lib/converters/math/distance";
import { DistanceFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type DistanceMode = "twoPoints2D" | "twoPoints3D" | "pointToLine" | "manhattan" | "haversine";

interface FormValues {
  mode: DistanceMode;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  z1: string;
  z2: string;
  lineA: string;
  lineB: string;
  lineC: string;
  lat1: string;
  lon1: string;
  lat2: string;
  lon2: string;
}

const useDistanceStore = createCalculatorStore<FormValues, DistanceResult | null>({
  name: "distance-calculator",
  schema: DistanceFormSchema,
  initialValues: {
    mode: "twoPoints2D",
    x1: "0",
    y1: "0",
    x2: "3",
    y2: "4",
    z1: "0",
    z2: "0",
    lineA: "1",
    lineB: "1",
    lineC: "-1",
    lat1: "48.8566",
    lon1: "2.3522",
    lat2: "51.5074",
    lon2: "-0.1278",
  },
  calculate: (vals) => {
    const input: DistanceInput = {
      mode: vals.mode,
      x1: parseFloat(vals.x1) || 0,
      y1: parseFloat(vals.y1) || 0,
      x2: parseFloat(vals.x2) || 0,
      y2: parseFloat(vals.y2) || 0,
      z1: parseFloat(vals.z1) || 0,
      z2: parseFloat(vals.z2) || 0,
      lineA: parseFloat(vals.lineA) || 0,
      lineB: parseFloat(vals.lineB) || 0,
      lineC: parseFloat(vals.lineC) || 0,
      lat1: parseFloat(vals.lat1) || 0,
      lon1: parseFloat(vals.lon1) || 0,
      lat2: parseFloat(vals.lat2) || 0,
      lon2: parseFloat(vals.lon2) || 0,
    };
    return calculateDistance(input);
  },
});

export function DistanceCalculator() {
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useDistanceStore();

  const distResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{tMath("distanceType")}</Label>
        <Select value={values.mode} onValueChange={(v) => setValue("mode", v as DistanceMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="twoPoints2D">{tMath("euclidean2D")}</SelectItem>
            <SelectItem value="twoPoints3D">{tMath("euclidean3D")}</SelectItem>
            <SelectItem value="manhattan">{tMath("manhattan")}</SelectItem>
            <SelectItem value="pointToLine">{tMath("pointToLine")}</SelectItem>
            <SelectItem value="haversine">{tMath("haversine")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(values.mode === "twoPoints2D" || values.mode === "manhattan") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="x1"
            label={tMath("x1")}
            value={values.x1}
            onChange={(v) => setValue("x1", v)}
            step="any"
            error={errors.x1}
          />
          <InputField
            id="y1"
            label={tMath("y1")}
            value={values.y1}
            onChange={(v) => setValue("y1", v)}
            step="any"
            error={errors.y1}
          />
          <InputField
            id="x2"
            label={tMath("x2")}
            value={values.x2}
            onChange={(v) => setValue("x2", v)}
            step="any"
            error={errors.x2}
          />
          <InputField
            id="y2"
            label={tMath("y2")}
            value={values.y2}
            onChange={(v) => setValue("y2", v)}
            step="any"
            error={errors.y2}
          />
        </div>
      )}

      {values.mode === "twoPoints3D" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <InputField
            id="x1"
            label={tMath("x1")}
            value={values.x1}
            onChange={(v) => setValue("x1", v)}
            step="any"
          />
          <InputField
            id="y1"
            label={tMath("y1")}
            value={values.y1}
            onChange={(v) => setValue("y1", v)}
            step="any"
          />
          <InputField
            id="z1"
            label={tMath("z1")}
            value={values.z1}
            onChange={(v) => setValue("z1", v)}
            step="any"
          />
          <InputField
            id="x2"
            label={tMath("x2")}
            value={values.x2}
            onChange={(v) => setValue("x2", v)}
            step="any"
          />
          <InputField
            id="y2"
            label={tMath("y2")}
            value={values.y2}
            onChange={(v) => setValue("y2", v)}
            step="any"
          />
          <InputField
            id="z2"
            label={tMath("z2")}
            value={values.z2}
            onChange={(v) => setValue("z2", v)}
            step="any"
          />
        </div>
      )}

      {values.mode === "pointToLine" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="x1"
            label={tMath("pointX")}
            value={values.x1}
            onChange={(v) => setValue("x1", v)}
            step="any"
          />
          <InputField
            id="y1"
            label={tMath("pointY")}
            value={values.y1}
            onChange={(v) => setValue("y1", v)}
            step="any"
          />
          <InputField
            id="lineA"
            label={tMath("lineA")}
            value={values.lineA}
            onChange={(v) => setValue("lineA", v)}
            step="any"
          />
          <InputField
            id="lineB"
            label={tMath("lineB")}
            value={values.lineB}
            onChange={(v) => setValue("lineB", v)}
            step="any"
          />
          <InputField
            id="lineC"
            label={tMath("lineC")}
            value={values.lineC}
            onChange={(v) => setValue("lineC", v)}
            step="any"
          />
        </div>
      )}

      {values.mode === "haversine" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="lat1"
            label={tMath("latitude1")}
            value={values.lat1}
            onChange={(v) => setValue("lat1", v)}
            step="any"
          />
          <InputField
            id="lon1"
            label={tMath("longitude1")}
            value={values.lon1}
            onChange={(v) => setValue("lon1", v)}
            step="any"
          />
          <InputField
            id="lat2"
            label={tMath("latitude2")}
            value={values.lat2}
            onChange={(v) => setValue("lat2", v)}
            step="any"
          />
          <InputField
            id="lon2"
            label={tMath("longitude2")}
            value={values.lon2}
            onChange={(v) => setValue("lon2", v)}
            step="any"
          />
        </div>
      )}

      {distResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("distance")}
            value={distResult.distance.toFixed(6)}
            unit={distResult.unit}
            size="lg"
          />

          {distResult.midpoint && (
            <ResultGrid
              results={[
                { label: tMath("midpointX"), value: distResult.midpoint.x.toFixed(4) },
                { label: tMath("midpointY"), value: distResult.midpoint.y.toFixed(4) },
                ...(distResult.midpoint.z !== undefined
                  ? [{ label: tMath("midpointZ"), value: distResult.midpoint.z.toFixed(4) }]
                  : []),
              ]}
            />
          )}

          {distResult.bearing !== undefined && (
            <ResultGrid
              results={[
                { label: tMath("initialBearing"), value: distResult.bearing.toFixed(1), unit: "°" },
              ]}
            />
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{distResult.distanceType}</p>
            <p className="text-sm text-muted-foreground font-mono">{distResult.formula}</p>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
