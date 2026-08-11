"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { CROP_FACTORS } from "@/lib/converters/photo/composition";
import {
  calculatePortraitDistance,
  PORTRAIT_FOCAL_LENGTHS,
  PORTRAIT_TYPES,
  type PortraitType,
} from "@/lib/converters/photo/portrait-distance";

export function PortraitDistanceCalculator() {
  const t = useTranslations("calculator.labels");
  const [focalLength, setFocalLength] = useState("85");
  const [portraitType, setPortraitType] = useState<PortraitType>("head-shoulders");
  const [cropFactor, setCropFactor] = useState("1");

  const calcResult = calculatePortraitDistance(
    parseFloat(focalLength) || 0,
    portraitType,
    parseFloat(cropFactor) || 1
  );
  const result = calcResult.ok ? calcResult.value : null;

  const getCompressionColor = (effect: string) => {
    if (effect === "Distorted") return "text-red-600 dark:text-red-400";
    if (effect === "Slight distortion") return "text-yellow-600 dark:text-yellow-400";
    if (effect === "Natural" || effect === "Flattering")
      return "text-green-600 dark:text-green-400";
    return "text-blue-600 dark:text-blue-400";
  };

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
            {PORTRAIT_FOCAL_LENGTHS.map((fl) => (
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
        <div className="space-y-2">
          <label className="text-sm font-medium">Portrait Type</label>
          <select
            value={portraitType}
            onChange={(e) => setPortraitType(e.target.value as PortraitType)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {PORTRAIT_TYPES.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>
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
          <OutputDisplay
            label={t("recommendedDistance")}
            value={`${result.recommendedDistance} m`}
            size="lg"
          />

          <ResultGrid
            results={[
              { label: "Minimum", value: result.minimumDistance, unit: "m" },
              { label: "Maximum", value: result.maximumDistance, unit: "m" },
              { label: "Field of View", value: result.fieldOfView, unit: "°" },
              { label: "Subject Height", value: result.subjectHeight, unit: "m" },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Compression Effect</p>
            <p className={`text-xl font-semibold ${getCompressionColor(result.compressionEffect)}`}>
              {result.compressionEffect}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{result.description}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Focal Length</th>
                  <th className="text-right py-2">Distance</th>
                  <th className="text-left py-2 pl-4">Effect</th>
                </tr>
              </thead>
              <tbody>
                {PORTRAIT_FOCAL_LENGTHS.map((fl) => {
                  const rResult = calculatePortraitDistance(
                    fl,
                    portraitType,
                    parseFloat(cropFactor) || 1
                  );
                  const rValue = rResult.ok ? rResult.value : null;
                  return (
                    <tr
                      key={fl}
                      className={`border-b border-muted ${fl === parseFloat(focalLength) ? "bg-primary/10" : ""}`}
                    >
                      <td className="py-2 font-mono">{fl}mm</td>
                      <td className="py-2 text-right font-mono">{rValue?.recommendedDistance} m</td>
                      <td
                        className={`py-2 pl-4 ${getCompressionColor(rValue?.compressionEffect || "")}`}
                      >
                        {rValue?.compressionEffect}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
