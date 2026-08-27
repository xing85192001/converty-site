"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  formatTableDistance,
  generateDoFTable,
  TABLE_APERTURES,
  TABLE_DISTANCES,
  TABLE_FOCAL_LENGTHS,
  TABLE_SENSORS,
} from "@/lib/converters/photo/dof-table";

export function DoFTableCalculator() {
  const t = useTranslations("calculator.photo.dof");
  const [focalLength, setFocalLength] = useState("50");
  const [sensorPreset, setSensorPreset] = useState("Full Frame (35mm)");
  const [displayMode, setDisplayMode] = useState<"total" | "near" | "far">("total");

  const sensor = TABLE_SENSORS.find((s) => s.name === sensorPreset) || TABLE_SENSORS[0];

  const table = generateDoFTable({
    focalLength: parseFloat(focalLength) || 50,
    coc: sensor.coc,
    apertures: TABLE_APERTURES,
    distances: TABLE_DISTANCES,
  });

  // Calculate hyperfocal distances for each aperture
  const hyperfocalDistances = TABLE_APERTURES.map((aperture) => {
    const f = (parseFloat(focalLength) || 50) / 1000;
    const c = sensor.coc / 1000;
    return (f * f) / (aperture * c) + f;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("focal-length")}</label>
          <select
            value={focalLength}
            onChange={(e) => setFocalLength(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {TABLE_FOCAL_LENGTHS.map((fl) => (
              <option key={fl} value={fl}>
                {fl}mm
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("sensor-size")}</label>
          <select
            value={sensorPreset}
            onChange={(e) => setSensorPreset(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {TABLE_SENSORS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("display")}</label>
          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as "total" | "near" | "far")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="total">{t("total-dof")}</option>
            <option value="near">{t("near-limit")}</option>
            <option value="far">{t("far-limit")}</option>
          </select>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="font-medium mb-2">{t("settings")}</p>
        <div className="text-sm text-muted-foreground">
          <p>
            {t("focal-length")}: <strong>{focalLength}mm</strong> | {t("sensor")}:{" "}
            <strong>{sensorPreset}</strong> | CoC: <strong>{sensor.coc}mm</strong>
          </p>
        </div>
      </div>

      {/* DoF Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 sticky left-0 bg-background">
                {t("aperture-header")}
              </th>
              {TABLE_DISTANCES.map((dist) => (
                <th key={dist} className="text-center py-2 px-2 min-w-[70px]">
                  {formatTableDistance(dist)}
                </th>
              ))}
              <th className="text-center py-2 px-2 bg-amber-500/10">{t("hyperfocal-distance")}</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, rowIndex) => {
              const aperture = TABLE_APERTURES[rowIndex];
              const hyperfocal = hyperfocalDistances[rowIndex];

              return (
                <tr key={aperture} className="border-b border-muted hover:bg-muted/20">
                  <td className="py-2 px-2 font-medium sticky left-0 bg-background">
                    f/{aperture}
                  </td>
                  {row.map((cell) => {
                    let value: number;
                    switch (displayMode) {
                      case "near":
                        value = cell.nearLimit;
                        break;
                      case "far":
                        value = cell.farLimit;
                        break;
                      default:
                        value = cell.totalDoF;
                    }

                    // Highlight cells where far limit is infinity
                    const isInfinity = cell.farLimit === Infinity;
                    // Highlight if distance >= hyperfocal
                    const isAtHyperfocal = cell.distance >= hyperfocal;

                    return (
                      <td
                        key={`cell-${cell.distance}`}
                        className={`py-2 px-2 text-center ${
                          isInfinity
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : isAtHyperfocal
                              ? "bg-blue-500/10"
                              : ""
                        }`}
                      >
                        {formatTableDistance(value)}
                      </td>
                    );
                  })}
                  <td className="py-2 px-2 text-center bg-amber-500/10 font-medium">
                    {formatTableDistance(hyperfocal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
          <span className="text-muted-foreground">{t("infinity-focus")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/50" />
          <span className="text-muted-foreground">{t("hyperfocal-distance")}</span>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="font-medium mb-2">{t("understanding-table")}</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            &#8226; <strong>{t("total-dof")}:</strong> {t("total-dof-description")}
          </li>
          <li>
            &#8226; <strong>{t("near-limit")}:</strong> {t("near-limit-description")}
          </li>
          <li>
            &#8226; <strong>{t("far-limit")}:</strong> {t("far-limit-description")}
          </li>
          <li>
            &#8226; <strong>{t("hyperfocal-distance")}:</strong> {t("hyperfocal-description")}
          </li>
          <li>&#8226; {t("green-cells-description")}</li>
        </ul>
      </div>
    </div>
  );
}
