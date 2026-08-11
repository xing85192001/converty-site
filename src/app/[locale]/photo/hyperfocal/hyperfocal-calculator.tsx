"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  APERTURES,
  CIRCLE_OF_CONFUSION,
  calculateHyperfocal,
  FOCAL_LENGTHS,
  generateHyperfocalTable,
  HYPERFOCAL_INFO,
} from "@/lib/converters/photo/hyperfocal";

export function HyperfocalCalculator() {
  const t = useTranslations("calculator.photo.dof");
  const [focalLength, setFocalLength] = useState(24);
  const [aperture, setAperture] = useState(8);
  const [sensorName, setSensorName] = useState("Full Frame (35mm)");
  const selectedSensor =
    CIRCLE_OF_CONFUSION.find((s) => s.name === sensorName) || CIRCLE_OF_CONFUSION[0];

  const result = calculateHyperfocal({
    focalLength,
    aperture,
    circleOfConfusion: selectedSensor.coc,
  });

  const table = generateHyperfocalTable(focalLength, selectedSensor.coc);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("sensor-size")}</label>
          <select
            value={sensorName}
            onChange={(e) => setSensorName(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {CIRCLE_OF_CONFUSION.map((sensor) => (
              <option key={sensor.name} value={sensor.name}>
                {sensor.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">CoC: {selectedSensor.coc}mm</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("focal-length")}</label>
          <input
            type="number"
            value={focalLength}
            onChange={(e) => setFocalLength(parseFloat(e.target.value) || 0)}
            min={8}
            max={800}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <div className="flex flex-wrap gap-2">
            {FOCAL_LENGTHS.slice(0, 6).map((fl) => (
              <button
                key={fl}
                onClick={() => setFocalLength(fl)}
                className="px-2 py-1 text-xs rounded border hover:bg-muted"
              >
                {fl}mm
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("aperture")}</label>
          <input
            type="number"
            value={aperture}
            onChange={(e) => setAperture(parseFloat(e.target.value) || 0)}
            min={1}
            max={32}
            step={0.1}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <div className="flex flex-wrap gap-2">
            {APERTURES.slice(3, 9).map((ap) => (
              <button
                key={ap}
                onClick={() => setAperture(ap)}
                className="px-2 py-1 text-xs rounded border hover:bg-muted"
              >
                f/{ap}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-lg border bg-primary/10 text-center">
          <p className="text-sm text-muted-foreground">{t("hyperfocal-distance")}</p>
          <p className="text-2xl font-bold text-primary">{result.hyperfocalDistance}m</p>
          <p className="text-xs text-muted-foreground">{result.hyperfocalDistanceFeet} ft</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("near-limit")}</p>
          <p className="text-2xl font-bold">{result.nearLimit}m</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("far-limit")}</p>
          <p className="text-2xl font-bold">{result.farLimit}</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("total-depth-of-field")}</p>
          <p className="text-lg font-bold">{result.depthOfField}</p>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-primary/10">
        <p className="font-medium">{result.description}</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">
          {t("hyperfocal-table")} {focalLength}mm
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t("aperture-header")}</th>
                <th className="text-left py-2">{t("hyperfocal-distance")}</th>
                <th className="text-left py-2">{t("near-limit")}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr
                  key={row.aperture}
                  className={`border-b border-muted ${row.aperture === aperture ? "bg-primary/10" : ""}`}
                >
                  <td className="py-2">f/{row.aperture}</td>
                  <td className="py-2">{row.hyperfocal.toFixed(2)}m</td>
                  <td className="py-2">{row.nearLimit.toFixed(2)}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="font-medium mb-2">{t("what-is-hyperfocal")}</p>
          <p className="text-sm text-muted-foreground">{HYPERFOCAL_INFO.definition}</p>
          <ul className="text-sm text-muted-foreground space-y-1 mt-2">
            {HYPERFOCAL_INFO.usage.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="font-medium mb-2">{t("tips")}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {HYPERFOCAL_INFO.tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-yellow-500/10">
        <p className="font-medium mb-2">{t("common-mistakes")}</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {HYPERFOCAL_INFO.commonMistakes.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
