"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  BITRATE_PRESETS,
  calculateVideoFileSize,
  durationToSeconds,
  RESOLUTIONS,
  type VideoResolution,
} from "@/lib/converters/video/video-file-size";

export function VideoFileSizeCalculator() {
  const t = useTranslations("calculator.labels");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [resolution, setResolution] = useState<VideoResolution>("1080p");
  const [bitrate, setBitrate] = useState("8");
  const [audioBitrate, setAudioBitrate] = useState("192");

  const duration = durationToSeconds(
    parseInt(hours) || 0,
    parseInt(minutes) || 0,
    parseInt(seconds) || 0
  );

  const calcResult = calculateVideoFileSize({
    duration,
    bitrateMbps: parseFloat(bitrate) || 0,
    audioBitrateKbps: parseInt(audioBitrate) || 192,
  });
  const result = calcResult.ok ? calcResult.value : null;

  const presets = BITRATE_PRESETS[resolution as keyof typeof BITRATE_PRESETS];

  return (
    <div className="space-y-6">
      {/* Duration Inputs */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Duration</label>
        <div className="grid gap-4 grid-cols-3">
          <InputField
            id="hours"
            label={t("hours")}
            value={hours}
            onChange={setHours}
            min={0}
            max={99}
            step={1}
            placeholder="0"
          />
          <InputField
            id="minutes"
            label={t("minutes")}
            value={minutes}
            onChange={setMinutes}
            min={0}
            max={59}
            step={1}
            placeholder="0"
          />
          <InputField
            id="seconds"
            label={t("seconds")}
            value={seconds}
            onChange={setSeconds}
            min={0}
            max={59}
            step={1}
            placeholder="0"
          />
        </div>
      </div>

      {/* Resolution Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Resolution Preset</label>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.id}
              onClick={() => {
                setResolution(res.id);
                const preset = BITRATE_PRESETS[res.id as keyof typeof BITRATE_PRESETS];
                if (preset) {
                  setBitrate(preset.medium.toString());
                }
              }}
              className={`p-2 rounded border text-center text-sm ${
                resolution === res.id
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:bg-muted/50"
              }`}
            >
              <p className="font-medium">{res.name}</p>
              <p className="text-xs text-muted-foreground">
                {res.width}x{res.height}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bitrate Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <InputField
            id="bitrate"
            label={t("videoBitrate")}
            value={bitrate}
            onChange={setBitrate}
            unit="Mbps"
            min={0.1}
            max={500}
            step={0.1}
            placeholder="Enter bitrate"
          />
          {presets && (
            <div className="flex gap-2">
              <button
                onClick={() => setBitrate(presets.low.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                Low ({presets.low})
              </button>
              <button
                onClick={() => setBitrate(presets.medium.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                Medium ({presets.medium})
              </button>
              <button
                onClick={() => setBitrate(presets.high.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                High ({presets.high})
              </button>
            </div>
          )}
        </div>
        <InputField
          id="audioBitrate"
          label={t("audioBitrate")}
          value={audioBitrate}
          onChange={setAudioBitrate}
          unit="Kbps"
          min={32}
          max={512}
          step={32}
          placeholder="192"
        />
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <OutputDisplay label={t("estimatedFileSize")} value={result.formatted} size="lg" />

          <ResultGrid
            results={[
              { label: "Total Size", value: result.totalMB, unit: "MB" },
              { label: "Total Size", value: result.totalGB, unit: "GB" },
              {
                label: "Video Data",
                value: Math.round(result.videoBytes / (1024 * 1024)),
                unit: "MB",
              },
              {
                label: "Audio Data",
                value: Math.round(result.audioBytes / (1024 * 1024)),
                unit: "MB",
              },
            ]}
            columns={2}
          />

          {/* Duration Display */}
          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Total Duration</p>
            <p className="text-lg font-medium font-mono">
              {String(parseInt(hours) || 0).padStart(2, "0")}:
              {String(parseInt(minutes) || 0).padStart(2, "0")}:
              {String(parseInt(seconds) || 0).padStart(2, "0")}
              <span className="text-muted-foreground ml-2">
                ({duration.toLocaleString()} seconds)
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
