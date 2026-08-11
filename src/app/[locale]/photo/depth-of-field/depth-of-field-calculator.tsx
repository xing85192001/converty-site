"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import { CROP_FACTORS } from "@/lib/converters/photo/composition";
import { COMMON_APERTURES, calculateDepthOfField } from "@/lib/converters/photo/depth-of-field";

export function DepthOfFieldCalculator() {
  const t = useTranslations("calculator.labels");
  const [aperture, setAperture] = useState("2.8");
  const [focalLength, setFocalLength] = useState("50");
  const [distance, setDistance] = useState("3");
  const [cropFactor, setCropFactor] = useState("1");

  const calcResult = calculateDepthOfField(
    parseFloat(aperture) || 0,
    parseFloat(focalLength) || 0,
    parseFloat(distance) || 0,
    parseFloat(cropFactor) || 1
  );
  const result = calcResult.ok ? calcResult.value : null;

  const formatDistance = (d: number) => (d === Infinity ? "∞" : `${d.toFixed(2)} m`);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <InputField
            id="aperture"
            label={t("aperture")}
            value={aperture}
            onChange={setAperture}
            unit="f/"
            min={0.7}
            step={0.1}
          />
          <div className="flex flex-wrap gap-1">
            {COMMON_APERTURES.slice(0, 5).map((a) => (
              <button
                key={a}
                onClick={() => setAperture(a.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                f/{a}
              </button>
            ))}
          </div>
        </div>
        <InputField
          id="focalLength"
          label={t("focalLength")}
          value={focalLength}
          onChange={setFocalLength}
          unit="mm"
          min={1}
        />
        <InputField
          id="distance"
          label={t("subjectDistance")}
          value={distance}
          onChange={setDistance}
          unit="m"
          min={0.1}
          step={0.1}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Sensor</label>
          <select
            value={cropFactor}
            onChange={(e) => setCropFactor(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {CROP_FACTORS.map((cf) => (
              <option key={cf.name} value={cf.factor}>
                {cf.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              { label: "Near Limit", value: formatDistance(result.nearLimit) },
              { label: "Far Limit", value: formatDistance(result.farLimit) },
              { label: "Total DoF", value: formatDistance(result.totalDoF) },
              { label: "Hyperfocal", value: `${result.hyperfocalDistance} m` },
            ]}
            columns={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm text-muted-foreground">In Front of Subject</p>
              <p className="text-lg font-mono">{formatDistance(result.inFrontOfSubject)}</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm text-muted-foreground">Behind Subject</p>
              <p className="text-lg font-mono">{formatDistance(result.behindSubject)}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Depth of Field Visualization</p>
            <div className="relative h-8 bg-muted rounded overflow-hidden">
              <div
                className="absolute h-full bg-primary/30"
                style={{
                  left: `${Math.max(0, (result.nearLimit / (result.farLimit === Infinity ? result.nearLimit * 3 : result.farLimit)) * 100)}%`,
                  right: `${result.farLimit === Infinity ? 0 : 0}%`,
                }}
              />
              <div
                className="absolute w-1 h-full bg-primary"
                style={{
                  left: `${(parseFloat(distance) / (result.farLimit === Infinity ? parseFloat(distance) * 2 : result.farLimit)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
