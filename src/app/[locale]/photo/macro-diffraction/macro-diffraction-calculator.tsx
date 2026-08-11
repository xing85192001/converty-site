"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { DIFFRACTION_SENSOR_PRESETS } from "@/lib/converters/photo/diffraction";
import {
  calculateMacroDiffraction,
  generateEffectiveApertureTable,
  MACRO_APERTURES,
  MACRO_MAGNIFICATIONS,
} from "@/lib/converters/photo/macro-diffraction";

export function MacroDiffractionCalculator() {
  const t = useTranslations("calculator.photo.macro");
  const [aperture, setAperture] = useState("8");
  const [magnification, setMagnification] = useState("1");
  const [sensorPreset, setSensorPreset] = useState("Full Frame 24MP");

  const sensor =
    DIFFRACTION_SENSOR_PRESETS.find((s) => s.name === sensorPreset) ||
    DIFFRACTION_SENSOR_PRESETS[0];

  const calcResult = calculateMacroDiffraction({
    aperture: parseFloat(aperture) || 0,
    magnification: parseFloat(magnification) || 0,
    sensorWidth: sensor.width,
    sensorHeight: sensor.height,
    megapixels: sensor.megapixels,
  });
  const result = calcResult.ok ? calcResult.value : null;

  // Generate effective aperture table for reference
  const effectiveTable = generateEffectiveApertureTable(
    MACRO_APERTURES.slice(0, 6),
    MACRO_MAGNIFICATIONS.map((m) => m.value)
  );

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("marked-aperture")}</label>
          <select
            value={aperture}
            onChange={(e) => setAperture(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {MACRO_APERTURES.map((a) => (
              <option key={a} value={a}>
                f/{a}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t("magnification")}</label>
          <select
            value={magnification}
            onChange={(e) => setMagnification(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {MACRO_MAGNIFICATIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
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
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("marked-aperture")}</p>
              <p className="text-2xl font-bold">f/{result.markedAperture}</p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/10">
              <p className="text-sm text-muted-foreground">{t("effective-aperture")}</p>
              <p className="text-2xl font-bold">f/{result.effectiveAperture}</p>
            </div>
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
            <div className="p-4 rounded-lg border bg-blue-500/10">
              <p className="text-sm text-muted-foreground">{t("light-loss")}</p>
              <p className="text-2xl font-bold">
                {result.lightLossStops} {t("stops")}
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("airy-disk")}</p>
              <p className="text-xl font-bold">{result.airyDiskDiameter} µm</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("pixel-pitch")}</p>
              <p className="text-xl font-bold">{result.pixelPitch} µm</p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm text-muted-foreground">{t("max-aperture-for-sharpness")}</p>
              <p className="text-xl font-bold">f/{result.maxApertureForSharpness}</p>
            </div>
          </div>

          {/* Optimal Range */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="font-medium mb-2">{t("optimal-aperture-range-section")}</p>
            <p className="text-muted-foreground">
              {t("optimal-aperture-description", {
                magnification: magnification,
                min: result.optimalApertureRange.min,
                max: result.optimalApertureRange.max,
              })}
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

      {/* Effective Aperture Reference Table */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("effective-aperture-reference-table")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">{t("marked")}</th>
                {MACRO_MAGNIFICATIONS.map((m) => (
                  <th key={m.value} className="text-center py-2 px-2">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MACRO_APERTURES.slice(0, 6).map((ap) => {
                const isSelectedAperture = ap === parseFloat(aperture);
                return (
                  <tr
                    key={ap}
                    className={`border-b border-muted ${isSelectedAperture ? "bg-primary/10" : ""}`}
                  >
                    <td className="py-2 px-2 font-medium">f/{ap}</td>
                    {MACRO_MAGNIFICATIONS.map((m) => {
                      const effective = effectiveTable.find(
                        (e) => e.marked === ap && e.magnification === m.value
                      );
                      const isSelected =
                        isSelectedAperture && m.value === parseFloat(magnification);
                      const isSevere = effective && effective.effective > 22;

                      return (
                        <td
                          key={m.value}
                          className={`py-2 px-2 text-center ${
                            isSelected
                              ? "bg-primary/20 font-bold"
                              : isSevere
                                ? "text-red-600 dark:text-red-400"
                                : ""
                          }`}
                        >
                          f/{effective?.effective}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">{t("red-values-note")}</p>
      </div>

      {/* Visual Comparison */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("effective-aperture-at-magnifications")}</p>
        <div className="space-y-2">
          {MACRO_MAGNIFICATIONS.slice(0, 5).map((m) => {
            const effective = parseFloat(aperture) * (1 + m.value);
            const widthPercent = Math.min((effective / 64) * 100, 100);
            const isSelected = m.value === parseFloat(magnification);
            const isSevere = effective > 22;

            return (
              <div key={m.value} className="flex items-center gap-2">
                <span className="w-20 text-sm">{m.label}</span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden relative">
                  <div
                    className={`h-full transition-all ${
                      isSevere ? "bg-red-500/50" : isSelected ? "bg-primary/50" : "bg-green-500/50"
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                  {/* f/22 marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/50"
                    style={{ left: `${(22 / 64) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-xs text-muted-foreground">f/{effective.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{t("vertical-line-and-bars-note")}</p>
      </div>

      {/* Light Loss Chart */}
      <div className="space-y-4">
        <p className="text-sm font-medium">{t("light-loss-by-magnification")}</p>
        <div className="space-y-2">
          {MACRO_MAGNIFICATIONS.map((m) => {
            const lightLoss = 2 * Math.log2(1 + m.value);
            const widthPercent = Math.min((lightLoss / 6) * 100, 100);
            const isSelected = m.value === parseFloat(magnification);

            return (
              <div key={m.value} className="flex items-center gap-2">
                <span className="w-20 text-sm">{m.label}</span>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isSelected ? "bg-amber-500/70" : "bg-amber-500/40"
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="w-16 text-xs text-muted-foreground">
                  {lightLoss.toFixed(1)} stops
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">{t("increase-iso-note")}</p>
      </div>

      {/* Formula Reference */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="font-medium mb-2">{t("macro-diffraction-formulas")}</p>
        <div className="space-y-2 text-sm font-mono text-muted-foreground">
          <p>{t("formula-effective-aperture")}</p>
          <p>{t("formula-airy-disk")}</p>
          <p>{t("formula-light-loss")}</p>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          <p>{t("formula-where")}</p>
          <ul className="ml-4">
            <li>{t("formula-macro-n")}</li>
            <li>{t("formula-macro-m")}</li>
            <li>{t("formula-macro-wavelength")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
