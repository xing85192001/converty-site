"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { COMMON_APERTURES } from "@/lib/converters/photo/depth-of-field";
import {
  calculateDiffraction,
  DIFFRACTION_SENSOR_PRESETS,
  LIGHT_WAVELENGTHS,
} from "@/lib/converters/photo/diffraction";

export function DiffractionCalculator() {
  const t = useTranslations("calculator.photo.optics");
  const [aperture, setAperture] = useState("11");
  const [sensorPreset, setSensorPreset] = useState("Full Frame 24MP");
  const [wavelength, setWavelength] = useState("550");

  const sensor =
    DIFFRACTION_SENSOR_PRESETS.find((s) => s.name === sensorPreset) ||
    DIFFRACTION_SENSOR_PRESETS[0];

  const calcResult = calculateDiffraction({
    aperture: parseFloat(aperture) || 0,
    sensorWidth: sensor.width,
    sensorHeight: sensor.height,
    megapixels: sensor.megapixels,
    wavelength: parseFloat(wavelength) || 550,
  });
  const result = calcResult.ok ? calcResult.value : null;

  // Calculate diffraction for all common apertures to show chart
  const apertureData = COMMON_APERTURES.map((ap) => {
    const dataResult = calculateDiffraction({
      aperture: ap,
      sensorWidth: sensor.width,
      sensorHeight: sensor.height,
      megapixels: sensor.megapixels,
      wavelength: parseFloat(wavelength) || 550,
    });
    const data = dataResult.ok ? dataResult.value : null;
    return { aperture: ap, data };
  });

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("aperture")}</label>
          <select
            value={aperture}
            onChange={(e) => setAperture(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_APERTURES.map((a) => (
              <option key={a} value={a}>
                f/{a}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("camera-sensor")}</label>
          <select
            value={sensorPreset}
            onChange={(e) => setSensorPreset(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {DIFFRACTION_SENSOR_PRESETS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("light-wavelength")}</label>
          <select
            value={wavelength}
            onChange={(e) => setWavelength(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {LIGHT_WAVELENGTHS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className={`p-4 rounded-lg border ${
                result.isDiffractionLimited ? "bg-red-500/10" : "bg-green-500/10"
              }`}
            >
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <p className="text-xl font-bold">
                {result.isDiffractionLimited ? t("diffraction-limited") : t("within-optimal-range")}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("airy-disk")}</p>
              <p className="text-2xl font-bold">{result.airyDiskDiameter} µm</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("pixel-pitch")}</p>
              <p className="text-2xl font-bold">{result.pixelPitch} µm</p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/10">
              <p className="text-sm text-muted-foreground">{t("diffraction-limit")}</p>
              <p className="text-2xl font-bold">f/{result.diffractionLimitAperture}</p>
            </div>
          </div>

          {/* Sharpness Impact */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="font-medium mb-2">{t("sharpness-impact")}</p>
            <p className="text-muted-foreground">{result.sharpnessImpact}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("optimal-aperture-range")}: <strong>f/{result.optimalApertureRange.min}</strong>{" "}
              {t("to")} <strong>f/{result.optimalApertureRange.max}</strong>
            </p>
          </div>

          {/* Notes */}
          {result.notes.length > 0 && (
            <div className="p-4 rounded-lg border bg-blue-500/10">
              <p className="font-medium mb-2">{t("analysis")}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {result.notes.map((note) => (
                  <li key={note}>&#8226; {note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Aperture Comparison Chart */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("diffraction-by-aperture")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">{t("aperture-header")}</th>
                <th className="text-left py-2 px-2">{t("airy-disk")}</th>
                <th className="text-left py-2 px-2">{t("vs-pixel")}</th>
                <th className="text-left py-2 px-2">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {apertureData.map((item) => {
                if (!item.data) return null;
                const ratio = item.data.airyDiskDiameter / item.data.pixelPitch;
                const isSelected = item.aperture === parseFloat(aperture);

                return (
                  <tr
                    key={item.aperture}
                    className={`border-b border-muted ${
                      isSelected ? "bg-primary/10" : ""
                    } ${item.data.isDiffractionLimited ? "text-red-600 dark:text-red-400" : ""}`}
                  >
                    <td className="py-2 px-2 font-medium">f/{item.aperture}</td>
                    <td className="py-2 px-2">{item.data.airyDiskDiameter.toFixed(2)} µm</td>
                    <td className="py-2 px-2">{(ratio * 100).toFixed(0)}%</td>
                    <td className="py-2 px-2">
                      {item.data.isDiffractionLimited ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-500/20">
                          {t("limited")}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-500/20">
                          {t("ok")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("visual-comparison")}</p>
        <div className="space-y-2">
          {apertureData.slice(0, 8).map((item) => {
            if (!item.data) return null;
            const ratio = Math.min(item.data.airyDiskDiameter / item.data.pixelPitch, 2);
            const widthPercent = (ratio / 2) * 100;

            return (
              <div key={item.aperture} className="flex items-center gap-2">
                <span className="w-12 text-sm font-medium">f/{item.aperture}</span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden relative">
                  <div
                    className={`h-full transition-all ${
                      item.data.isDiffractionLimited ? "bg-red-500/50" : "bg-green-500/50"
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                  {/* Pixel pitch marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                    style={{ left: "50%" }}
                  />
                </div>
                <span className="w-16 text-xs text-muted-foreground">
                  {item.data.airyDiskDiameter.toFixed(1)}µm
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {t("vertical-line-note")} ({result?.pixelPitch}µm). {t("bars-exceeding-note")}
        </p>
      </div>

      {/* Formula Reference */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="font-medium mb-2">{t("diffraction-formula")}</p>
        <p className="text-sm font-mono text-muted-foreground mb-2">
          Airy Disk Diameter = 2.44 × λ × N
        </p>
        <div className="text-sm text-muted-foreground">
          <p>{t("where")}:</p>
          <ul className="ml-4">
            <li>λ = {t("wavelength-description")}</li>
            <li>N = {t("f-number-description")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
