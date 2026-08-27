"use client";

import { Download, Loader2, Play, Trash2, Upload, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ToolError } from "./shared";

let ffmpegModule: typeof import("@ffmpeg/ffmpeg") | null = null;
let utilModule: typeof import("@ffmpeg/util") | null = null;

async function loadFfmpeg() {
  if (!ffmpegModule) ffmpegModule = await import("@ffmpeg/ffmpeg");
  if (!utilModule) utilModule = await import("@ffmpeg/util");
  return {
    FFmpeg: ffmpegModule.FFmpeg,
    fetchFile: utilModule.fetchFile,
    toBlobURL: utilModule.toBlobURL,
  };
}

export function VideoCompressor() {
  const t = useTranslations("mediaTools.videoCompressor");
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [resolution, setResolution] = useState<string>("original");
  const [crf, setCrf] = useState(28);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    setError("");
    setProcessedUrl("");
    setProgress(0);
    setFile(chosen);
    setOriginalUrl(URL.createObjectURL(chosen));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const chosen = e.dataTransfer.files?.[0];
    if (!chosen || !chosen.type.startsWith("video/")) return;
    setError("");
    setProcessedUrl("");
    setProgress(0);
    setFile(chosen);
    setOriginalUrl(URL.createObjectURL(chosen));
  }

  function clearAll() {
    setFile(null);
    setOriginalUrl("");
    setProcessedUrl("");
    setProgress(0);
    setError("");
  }

  async function processVideo() {
    if (!file) {
      setError(t("uploadFirstError"));
      return;
    }
    setIsProcessing(true);
    setError("");
    setProgress(0);

    try {
      const { FFmpeg, fetchFile, toBlobURL } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => {
        // eslint-disable-next-line no-console
        console.log("[ffmpeg]", message);
      });
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.min(99, Math.round(progress * 100)));
      });

      const coreURL = await toBlobURL(
        "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
        "text/javascript"
      );
      const wasmURL = await toBlobURL(
        "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
        "application/wasm"
      );
      await ffmpeg.load({ coreURL, wasmURL });

      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = `compressed.${ext}`;

      const args = ["-i", inputName];
      if (resolution !== "original") {
        args.push("-vf", `scale=${resolution}:-2`);
      }
      args.push(
        "-c:v",
        "libx264",
        "-crf",
        String(crf),
        "-preset",
        "fast",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        outputName
      );

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const bytes =
        data instanceof Uint8Array ? new Uint8Array(data) : new TextEncoder().encode(data);
      const mime = file.type || "video/mp4";
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("processError"));
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadResult() {
    if (!processedUrl || !file) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    a.download = `compressed-${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
      <div
        className={cn(
          "relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-card/50 p-6 text-center",
          originalUrl ? "justify-start border-solid border-white/10 bg-card p-0" : "p-8"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {!originalUrl ? (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t("title")}</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("description")}</p>
            <Button
              asChild
              className="mt-5 rounded-xl bg-gradient-to-r from-primary to-cyan-400 px-5 text-primary-foreground hover:opacity-90"
            >
              <label className="cursor-pointer">
                <Upload className="mr-2 inline h-4 w-4" /> {t("selectVideo")}
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{t("originalLabel")}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearAll}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> {t("removeBtn")}
              </Button>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-xl bg-black/40">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={originalUrl} className="h-full w-full object-contain" controls />
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">{t("settingsTitle")}</span>
          <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-medium text-pink-300">
            FFmpeg
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              {t("resolutionLabel")}
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="original">{t("originalResolution")}</option>
              <option value="1920">{t("res1080p")}</option>
              <option value="1280">{t("res720p")}</option>
              <option value="854">{t("res480p")}</option>
              <option value="640">{t("res360p")}</option>
            </select>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{t("crfLabel")}</span>
              <span>{crf}</span>
            </div>
            <input
              type="range"
              min={18}
              max={40}
              value={crf}
              onChange={(e) => setCrf(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t("crfHint")}</p>
          </div>
          {isProcessing && <Progress value={progress} />}
          <ToolError message={error || null} />
          <Button
            onClick={processVideo}
            disabled={isProcessing || !file}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-cyan-400"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? t("processing", { progress }) : t("processBtn")}
          </Button>
          <Button className="w-full rounded-xl" disabled={!processedUrl} onClick={downloadResult}>
            <Download className="mr-2 h-4 w-4" /> {t("downloadBtn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
