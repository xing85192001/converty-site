"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  AUDIO_CONFIGS,
  calculateDCPFilesize,
  DCP_PRESETS,
} from "@/lib/converters/video/dcp-filesize";

export function DCPFilesizeCalculator() {
  const t = useTranslations("calculator.labels");
  const [duration, setDuration] = useState("120");
  const [resolution, setResolution] = useState<"2k" | "4k">("2k");
  const [audioChannels, setAudioChannels] = useState("6");

  const calcResult = calculateDCPFilesize(
    parseFloat(duration) || 0,
    resolution,
    24,
    parseInt(audioChannels) || 6
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <InputField
            id="duration"
            label={t("duration")}
            value={duration}
            onChange={setDuration}
            unit="min"
            min={1}
          />
          <div className="flex flex-wrap gap-1">
            {Object.values(DCP_PRESETS).map((p) => (
              <button
                key={p.name}
                onClick={() => setDuration(p.minutes.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Resolution</label>
          <div className="flex gap-2">
            <button
              onClick={() => setResolution("2k")}
              className={`flex-1 py-2 rounded border ${resolution === "2k" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
            >
              2K
            </button>
            <button
              onClick={() => setResolution("4k")}
              className={`flex-1 py-2 rounded border ${resolution === "4k" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
            >
              4K
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Audio</label>
          <select
            value={audioChannels}
            onChange={(e) => setAudioChannels(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {AUDIO_CONFIGS.map((c) => (
              <option key={c.name} value={c.channels}>
                {c.name} ({c.channels}ch)
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <OutputDisplay label={t("totalDcpSize")} value={result.formatted} size="lg" />

          <ResultGrid
            results={[
              {
                label: "Video",
                value: Math.round(result.videoBytes / (1024 * 1024 * 1024)),
                unit: "GB",
              },
              {
                label: "Audio",
                value: Math.round((result.audioBytes / (1024 * 1024 * 1024)) * 100) / 100,
                unit: "GB",
              },
              { label: "Video Bitrate", value: result.videoBitrate, unit: "Mbps" },
              { label: "Audio Bitrate", value: result.audioBitrate, unit: "kbps" },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-2">DCP Specifications</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                Video: JPEG2000 at {result.videoBitrate} Mbps ({resolution.toUpperCase()})
              </li>
              <li>Audio: Uncompressed PCM 24-bit/48kHz</li>
              <li>Container: MXF (Material Exchange Format)</li>
              <li>Frame Rate: 24 fps</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
