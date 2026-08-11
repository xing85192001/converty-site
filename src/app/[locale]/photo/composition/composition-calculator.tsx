"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import {
  COMMON_FOCAL_LENGTHS,
  CROP_FACTORS,
  calculateComposition,
} from "@/lib/converters/photo/composition";

export function CompositionCalculator() {
  const t = useTranslations("calculator.labels");
  const [focalLength, setFocalLength] = useState("50");
  const [distance, setDistance] = useState("3");
  const [cropFactor, setCropFactor] = useState("1");

  const calcResult = calculateComposition(
    parseFloat(focalLength) || 0,
    parseFloat(distance) || 0,
    parseFloat(cropFactor) || 1
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <InputField
            id="focalLength"
            label={t("focalLength")}
            value={focalLength}
            onChange={setFocalLength}
            unit="mm"
            min={1}
          />
          <div className="flex flex-wrap gap-1">
            {COMMON_FOCAL_LENGTHS.slice(0, 6).map((fl) => (
              <button
                key={fl}
                onClick={() => setFocalLength(fl.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                {fl}
              </button>
            ))}
          </div>
        </div>
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
          <label className="text-sm font-medium">Crop Factor</label>
          <select
            value={cropFactor}
            onChange={(e) => setCropFactor(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {CROP_FACTORS.map((cf) => (
              <option key={cf.name} value={cf.factor}>
                {cf.name} ({cf.factor}x)
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              { label: "Diagonal FOV", value: result.fieldOfView, unit: "°" },
              { label: "Horizontal FOV", value: result.horizontalFOV, unit: "°" },
              { label: "Vertical FOV", value: result.verticalFOV, unit: "°" },
              { label: "Effective FL", value: result.effectiveFocalLength, unit: "mm" },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Subject Coverage</p>
            <p className="text-lg font-medium">
              {result.subjectCoverage}% of frame width (for 0.5m subject)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
