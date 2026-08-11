"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  calculateFocalEquivalent,
  FOCAL_EQUIV_APERTURES,
  FOCAL_EQUIV_FOCAL_LENGTHS,
  FOCAL_EQUIVALENT_INFO,
  SENSOR_CROP_FACTORS,
} from "@/lib/converters/photo/focal-equivalent";

export function FocalEquivalentCalculator() {
  const t = useTranslations("calculator.photo.optics");
  const [sourceFocalLength, setSourceFocalLength] = useState(50);
  const [sourceAperture, setSourceAperture] = useState(1.8);
  const [sourceDistance, setSourceDistance] = useState(3);
  const [sourceCropFactor, setSourceCropFactor] = useState(1);
  const [targetCropFactor, setTargetCropFactor] = useState(1.5);

  const result = calculateFocalEquivalent({
    sourceFocalLength,
    sourceAperture,
    sourceDistance,
    sourceCropFactor,
    targetCropFactor,
  });

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="text-sm text-muted-foreground">{t("focal-equivalent-intro")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Camera */}
        <div className="space-y-4">
          <p className="font-medium text-lg">{t("source-camera")}</p>
          <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("sensor-size")}</label>
              <select
                value={sourceCropFactor}
                onChange={(e) => setSourceCropFactor(parseFloat(e.target.value))}
                className="w-full h-10 px-3 rounded-md border bg-background"
              >
                {SENSOR_CROP_FACTORS.map((cf) => (
                  <option key={cf.name} value={cf.value}>
                    {cf.name} ({cf.value}x)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("focal-length-mm")}</label>
              <input
                type="number"
                value={sourceFocalLength}
                onChange={(e) => setSourceFocalLength(parseFloat(e.target.value) || 0)}
                min={8}
                max={800}
                className="w-full h-10 px-3 rounded-md border bg-background"
              />
              <div className="flex flex-wrap gap-2">
                {FOCAL_EQUIV_FOCAL_LENGTHS.slice(0, 8).map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setSourceFocalLength(fl)}
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
                value={sourceAperture}
                onChange={(e) => setSourceAperture(parseFloat(e.target.value) || 0)}
                min={1}
                max={22}
                step={0.1}
                className="w-full h-10 px-3 rounded-md border bg-background"
              />
              <div className="flex flex-wrap gap-2">
                {FOCAL_EQUIV_APERTURES.slice(0, 6).map((ap) => (
                  <button
                    key={ap}
                    onClick={() => setSourceAperture(ap)}
                    className="px-2 py-1 text-xs rounded border hover:bg-muted"
                  >
                    f/{ap}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("subject-distance-m")}</label>
              <input
                type="number"
                value={sourceDistance}
                onChange={(e) => setSourceDistance(parseFloat(e.target.value) || 0)}
                min={0.1}
                step={0.1}
                className="w-full h-10 px-3 rounded-md border bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">{t("35mm-equiv")}</p>
              <p className="font-bold">{result.sourceEffectiveFocalLength}mm</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">{t("field-of-view")}</p>
              <p className="font-bold">{result.sourceFieldOfView}°</p>
            </div>
          </div>
        </div>

        {/* Target Camera */}
        <div className="space-y-4">
          <p className="font-medium text-lg">{t("target-camera")}</p>
          <div className="space-y-4 p-4 rounded-lg border bg-primary/10">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("sensor-size")}</label>
              <select
                value={targetCropFactor}
                onChange={(e) => setTargetCropFactor(parseFloat(e.target.value))}
                className="w-full h-10 px-3 rounded-md border bg-background"
              >
                {SENSOR_CROP_FACTORS.map((cf) => (
                  <option key={cf.name} value={cf.value}>
                    {cf.name} ({cf.value}x)
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-lg bg-background border">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("focal-length")}</p>
                  <p className="text-2xl font-bold text-primary">{result.targetFocalLength}mm</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("aperture")}</p>
                  <p className="text-2xl font-bold text-primary">f/{result.targetAperture}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">{t("35mm-equiv")}</p>
                <p className="font-bold">{result.targetEffectiveFocalLength}mm</p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">{t("field-of-view")}</p>
                <p className="font-bold">{result.targetFieldOfView}°</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-primary/10">
        <p className="font-medium">{result.explanation}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t("dof-multiplier")}: {result.dofMultiplier}x
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="font-medium mb-2">{t("how-it-works")}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <strong>FOV:</strong> {FOCAL_EQUIVALENT_INFO.fieldOfView}
            </li>
            <li>
              <strong>DOF:</strong> {FOCAL_EQUIVALENT_INFO.depthOfField}
            </li>
            <li>
              <strong>Exposure:</strong> {FOCAL_EQUIVALENT_INFO.exposure}
            </li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="font-medium mb-2">{t("examples")}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {FOCAL_EQUIVALENT_INFO.examples.map((ex) => (
              <li key={`${ex.source}-${ex.target}`}>
                <span className="text-foreground">{ex.source}</span> = {ex.target}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
