"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  type CalculateMode,
  calculateTimeLapse,
  FRAME_RATES,
  IMAGE_SIZES,
  INTERVAL_RECOMMENDATIONS,
  TIME_LAPSE_TIPS,
} from "@/lib/converters/photo/time-lapse";

export function TimeLapseCalculator() {
  const t = useTranslations("calculator.photo.astro");
  const [calculateMode, setCalculateMode] = useState<CalculateMode>("clip_length");
  const [eventDurationMinutes, setEventDurationMinutes] = useState(60);
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [clipLengthSeconds, setClipLengthSeconds] = useState(30);
  const [frameRate, setFrameRate] = useState(24);
  const [imageSizeMB, setImageSizeMB] = useState(8);

  const result = calculateTimeLapse({
    calculateMode,
    eventDurationMinutes,
    intervalSeconds,
    clipLengthSeconds,
    frameRate,
    imageSizeMB,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("calculate")}</label>
        <select
          value={calculateMode}
          onChange={(e) => setCalculateMode(e.target.value as CalculateMode)}
          className="w-full h-10 px-3 rounded-md border bg-background"
        >
          <option value="clip_length">{t("clip-length-mode")}</option>
          <option value="interval">{t("interval-mode")}</option>
          <option value="event_duration">{t("event-duration-mode")}</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calculateMode !== "event_duration" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("event-duration")}</label>
            <input
              type="number"
              value={eventDurationMinutes}
              onChange={(e) => setEventDurationMinutes(parseFloat(e.target.value) || 0)}
              min={1}
              className="w-full h-10 px-3 rounded-md border bg-background"
            />
            <div className="flex flex-wrap gap-2">
              {[30, 60, 120, 240].map((d) => (
                <button
                  key={d}
                  onClick={() => setEventDurationMinutes(d)}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  {d >= 60 ? `${d / 60}h` : `${d}m`}
                </button>
              ))}
            </div>
          </div>
        )}

        {calculateMode !== "interval" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("interval")}</label>
            <input
              type="number"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseFloat(e.target.value) || 0)}
              min={0.5}
              step={0.5}
              className="w-full h-10 px-3 rounded-md border bg-background"
            />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 5, 10, 30].map((i) => (
                <button
                  key={i}
                  onClick={() => setIntervalSeconds(i)}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  {i}s
                </button>
              ))}
            </div>
          </div>
        )}

        {calculateMode !== "clip_length" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("clip-length")}</label>
            <input
              type="number"
              value={clipLengthSeconds}
              onChange={(e) => setClipLengthSeconds(parseFloat(e.target.value) || 0)}
              min={1}
              className="w-full h-10 px-3 rounded-md border bg-background"
            />
            <div className="flex flex-wrap gap-2">
              {[10, 20, 30, 60].map((c) => (
                <button
                  key={c}
                  onClick={() => setClipLengthSeconds(c)}
                  className="px-2 py-1 text-xs rounded border hover:bg-muted"
                >
                  {c}s
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Frame Rate</label>
          <select
            value={frameRate}
            onChange={(e) => setFrameRate(parseInt(e.target.value))}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {FRAME_RATES.map((fr) => (
              <option key={fr.value} value={fr.value}>
                {fr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Image Size</label>
          <select
            value={imageSizeMB}
            onChange={(e) => setImageSizeMB(parseFloat(e.target.value))}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {IMAGE_SIZES.map((is) => (
              <option key={is.value} value={is.value}>
                {is.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-lg border bg-primary/10 text-center">
          <p className="text-sm text-muted-foreground">Clip Length</p>
          <p className="text-2xl font-bold text-primary">{result.clipLengthFormatted}</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Shooting Duration</p>
          <p className="text-2xl font-bold">{result.eventDurationFormatted}</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Interval</p>
          <p className="text-2xl font-bold">{result.intervalSeconds.toFixed(1)}s</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Speed Up</p>
          <p className="text-2xl font-bold">{result.speedupFactor}x</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Total Photos</p>
          <p className="text-2xl font-bold">{result.totalPhotos.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Memory Needed</p>
          <p className="text-2xl font-bold">
            {result.totalMemoryGB >= 1
              ? `${result.totalMemoryGB.toFixed(1)} GB`
              : `${result.totalMemoryMB} MB`}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Frame Rate</p>
          <p className="text-2xl font-bold">{frameRate} fps</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-medium">Recommended Intervals</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Interval</th>
                </tr>
              </thead>
              <tbody>
                {INTERVAL_RECOMMENDATIONS.map((rec) => (
                  <tr key={rec.subject} className="border-b border-muted">
                    <td className="py-2">{rec.subject}</td>
                    <td className="py-2 text-muted-foreground">{rec.interval}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="font-medium mb-2">Tips</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {TIME_LAPSE_TIPS.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
