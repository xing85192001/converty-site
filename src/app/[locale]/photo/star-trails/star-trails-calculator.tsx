"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  calculateExposureFromRotation,
  calculateStarTrails,
  STAR_TRAILS_INFO,
  STAR_TRAILS_PRESETS,
} from "@/lib/converters/photo/star-trails";

export function StarTrailsCalculator() {
  const t = useTranslations("calculator.photo.astro");
  const [mode, setMode] = useState<"time" | "rotation">("time");
  const [exposureMinutes, setExposureMinutes] = useState(60);
  const [rotationDegrees, setRotationDegrees] = useState(15);
  const [hemisphere, setHemisphere] = useState<"north" | "south">("north");

  const result =
    mode === "time"
      ? calculateStarTrails({ exposureMinutes, hemisphere })
      : calculateStarTrails({
          exposureMinutes: calculateExposureFromRotation(rotationDegrees),
          hemisphere,
        });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("calculate-from")}</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "time" | "rotation")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="time">{t("exposure-time")}</option>
            <option value="rotation">{t("rotation-angle")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("hemisphere")}</label>
          <select
            value={hemisphere}
            onChange={(e) => setHemisphere(e.target.value as "north" | "south")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="north">{t("northern-polaris")}</option>
            <option value="south">{t("southern")}</option>
          </select>
        </div>
      </div>

      {mode === "time" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("exposure-time-minutes")}</label>
          <input
            type="number"
            value={exposureMinutes}
            onChange={(e) => setExposureMinutes(parseFloat(e.target.value) || 0)}
            min={1}
            max={1440}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {STAR_TRAILS_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.name}
                onClick={() => setExposureMinutes(preset.minutes)}
                className="px-3 py-1 text-sm rounded-md border hover:bg-muted"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("rotation-angle-degrees")}</label>
          <input
            type="number"
            value={rotationDegrees}
            onChange={(e) => setRotationDegrees(parseFloat(e.target.value) || 0)}
            min={1}
            max={360}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <p className="text-xs text-muted-foreground">{t("full-circle-note")}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("exposure-time")}</p>
          <p className="text-2xl font-bold">
            {result.exposureHours >= 1
              ? `${result.exposureHours.toFixed(1)}h`
              : `${result.exposureMinutes}m`}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("rotation")}</p>
          <p className="text-2xl font-bold">{result.rotationDegrees.toFixed(1)}°</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("circle-percent")}</p>
          <p className="text-2xl font-bold">{result.rotationPercent.toFixed(1)}%</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("total-minutes")}</p>
          <p className="text-2xl font-bold">{result.exposureMinutes}</p>
        </div>
      </div>

      <div className="p-4 rounded-lg border bg-primary/10">
        <p className="font-medium">{result.trailDescription}</p>
      </div>

      {/* Visual representation */}
      <div className="p-6 rounded-lg border bg-background flex justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
            {/* Star trail arc */}
            <path
              d={describeArc(50, 50, 35, 0, Math.min(result.rotationDegrees, 360))}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary"
            />
            {/* Center point (Polaris) */}
            <circle cx="50" cy="50" r="3" fill="currentColor" className="text-primary" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-muted-foreground mt-16">
              {hemisphere === "north" ? "Polaris" : "SCP"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">{t("presets-reference")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t("duration")}</th>
                <th className="text-left py-2">Rotation</th>
                <th className="text-left py-2">{t("circle-percent")}</th>
              </tr>
            </thead>
            <tbody>
              {STAR_TRAILS_PRESETS.map((preset) => (
                <tr key={preset.name} className="border-b border-muted">
                  <td className="py-2">{preset.name}</td>
                  <td className="py-2">{preset.degrees}°</td>
                  <td className="py-2">{((preset.degrees / 360) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">{t("tips-and-information")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="font-medium mb-2">{t("best-conditions")}</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {STAR_TRAILS_INFO.bestConditions.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="font-medium mb-2">{t("techniques")}</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {STAR_TRAILS_INFO.techniques.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to draw SVG arc
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
