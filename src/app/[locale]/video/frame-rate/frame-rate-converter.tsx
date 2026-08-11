"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ResultGrid } from "@/components/converter";
import {
  COMMON_FRAME_RATES,
  calculateFrameRateConversion,
} from "@/lib/converters/video/frame-rate";

export function FrameRateConverter() {
  const t = useTranslations("calculator.video");
  const [sourceFps, setSourceFps] = useState("24");
  const [targetFps, setTargetFps] = useState("30");

  const calcResult = calculateFrameRateConversion(
    parseFloat(sourceFps) || 0,
    parseFloat(targetFps) || 0
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("source-frame-rate")}</label>
          <select
            value={sourceFps}
            onChange={(e) => setSourceFps(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_FRAME_RATES.map((f) => (
              <option key={f.fps} value={f.fps}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("target-frame-rate")}</label>
          <select
            value={targetFps}
            onChange={(e) => setTargetFps(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_FRAME_RATES.map((f) => (
              <option key={f.fps} value={f.fps}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              {
                label: t("speed-change"),
                value: result.speedChange > 0 ? `+${result.speedChange}` : result.speedChange,
                unit: "%",
              },
              {
                label: t("duration-change"),
                value:
                  result.durationChange > 0 ? `+${result.durationChange}` : result.durationChange,
                unit: "%",
              },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">{t("conversion-method")}</p>
            <p className="text-xl font-semibold">{result.conversionMethod}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("audio")}: {result.audioAdjustment}
            </p>
          </div>

          {result.warnings.length > 0 && (
            <div className="p-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                {t("warnings")}
              </p>
              <ul className="text-sm space-y-1">
                {result.warnings.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("ffmpeg-command")}</p>
              <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto">
                {result.ffmpegCommand}
              </pre>
            </div>
            {result.soxCommand && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("sox-audio-command")}</p>
                <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto">
                  {result.soxCommand}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
