"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  calculateCoC,
  PRINT_SIZES,
  SENSOR_COC,
  VIEWING_DISTANCES,
  VISUAL_ACUITY_PRESETS,
} from "@/lib/converters/photo/circle-of-confusion";

export function CircleOfConfusionCalculator() {
  const t = useTranslations("calculator.photo.optics");
  const [sensorWidth, setSensorWidth] = useState("36");
  const [printWidth, setPrintWidth] = useState("254");
  const [viewingDistance, setViewingDistance] = useState("450");
  const [visualAcuity, setVisualAcuity] = useState("30");

  const calcResult = calculateCoC({
    sensorWidth: parseFloat(sensorWidth) || 0,
    printWidth: parseFloat(printWidth) || 0,
    viewingDistance: parseFloat(viewingDistance) || 0,
    visualAcuity: parseFloat(visualAcuity) || 0,
  });
  const result = calcResult.ok ? calcResult.value : null;

  // Find selected sensor name
  const selectedSensor = SENSOR_COC.find((s) => Math.abs(s.width - parseFloat(sensorWidth)) < 0.5);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Sensor Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("sensor-size")}</label>
          <select
            value={sensorWidth}
            onChange={(e) => setSensorWidth(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {SENSOR_COC.map((sensor) => (
              <option key={sensor.name} value={sensor.width}>
                {sensor.name} ({sensor.width}×{sensor.height}mm)
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Standard CoC: {selectedSensor?.coc || "N/A"}mm
          </p>
        </div>

        {/* Print Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("print-width")}</label>
          <select
            value={printWidth}
            onChange={(e) => setPrintWidth(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {PRINT_SIZES.map((size) => (
              <option key={size.label} value={size.width}>
                {size.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={printWidth}
              onChange={(e) => setPrintWidth(e.target.value)}
              className="flex-1 h-8 px-2 text-sm rounded-md border bg-background"
              min="10"
              max="5000"
            />
            <span className="text-sm text-muted-foreground flex items-center">mm</span>
          </div>
        </div>

        {/* Viewing Distance */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("viewing-distance")}</label>
          <select
            value={viewingDistance}
            onChange={(e) => setViewingDistance(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {VIEWING_DISTANCES.map((dist) => (
              <option key={dist.label} value={dist.value}>
                {dist.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={viewingDistance}
              onChange={(e) => setViewingDistance(e.target.value)}
              className="flex-1 h-8 px-2 text-sm rounded-md border bg-background"
              min="100"
              max="10000"
            />
            <span className="text-sm text-muted-foreground flex items-center">mm</span>
          </div>
        </div>

        {/* Visual Acuity */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("visual-acuity")}</label>
          <select
            value={visualAcuity}
            onChange={(e) => setVisualAcuity(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {VISUAL_ACUITY_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {VISUAL_ACUITY_PRESETS.find((p) => p.value === parseInt(visualAcuity))?.description ||
              ""}
          </p>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg border bg-primary/10">
              <p className="text-sm text-muted-foreground">{t("calculated-coc")}</p>
              <p className="text-2xl font-bold">{result.coc} mm</p>
              <p className="text-sm text-muted-foreground">{result.cocMicrons} µm</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("standard-coc")}</p>
              <p className="text-2xl font-bold">{result.standardCoc} mm</p>
              <p className="text-sm text-muted-foreground">
                {result.coc > result.standardCoc
                  ? t("more-relaxed-label")
                  : t("more-demanding-label")}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("enlargement")}</p>
              <p className="text-2xl font-bold">{result.enlargementFactor}×</p>
              <p className="text-sm text-muted-foreground">{t("sensor-to-print")}</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("resolution-needed")}</p>
              <p className="text-2xl font-bold">{result.sensorResolutionRequired} MP</p>
              <p className="text-sm text-muted-foreground">{t("for-this-coc")}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="font-medium mb-2">{t("analysis")}</p>
            <p className="text-muted-foreground">{result.explanation}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Print resolution: {result.printResolution} lp/mm
            </p>
          </div>
        </div>
      )}

      {/* Reference Table */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("standard-coc-values")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t("sensor")}</th>
                <th className="text-left py-2">{t("size-mm")}</th>
                <th className="text-left py-2">{t("standard-coc")}</th>
              </tr>
            </thead>
            <tbody>
              {SENSOR_COC.map((sensor) => (
                <tr
                  key={sensor.name}
                  className={`border-b border-muted ${
                    Math.abs(sensor.width - parseFloat(sensorWidth)) < 0.5 ? "bg-primary/10" : ""
                  }`}
                >
                  <td className="py-2">{sensor.name}</td>
                  <td className="py-2">
                    {sensor.width} × {sensor.height}
                  </td>
                  <td className="py-2 font-mono">{sensor.coc} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="font-medium mb-2">{t("how-coc-calculated")}</p>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>{t("traditional-formula")}:</strong> CoC = Sensor Diagonal ÷ 1500
          </p>
          <p>{t("traditional-formula-note")}</p>
          <p>
            <strong>{t("adjusted-formula")}:</strong>
          </p>
          <p className="font-mono text-xs">
            CoC = (Viewing Distance ÷ 57.3) ÷ (2 × Visual Acuity × Enlargement Factor)
          </p>
          <p>{t("adjusted-formula-note")}</p>
        </div>
      </div>
    </div>
  );
}
