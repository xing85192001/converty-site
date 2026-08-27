"use client";

import { Download, Loader2, Play, Trash2, Upload, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// FFmpeg.wasm is loaded lazily only when the user starts processing.
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

const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";

async function fetchWithRetry(
  url: string,
  type: string,
  toBlobURL: (url: string, type: string) => Promise<string>
): Promise<string> {
  const lastErr: unknown[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await toBlobURL(`${url}?attempt=${attempt}`, type);
    } catch (err) {
      lastErr.push(err);
      if (attempt < 3) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, attempt * 800));
      }
    }
  }
  throw lastErr[lastErr.length - 1];
}

export function VideoToGif() {
  const t = useTranslations("mediaTools.videoToGif");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [videoUrl, gifUrl]);

  const acceptFile = (chosen: File | undefined) => {
    if (!chosen || !chosen.type.startsWith("video/")) return;
    setError("");
    setGifUrl("");
    setProgress(0);
    setFile(chosen);
    setVideoUrl(URL.createObjectURL(chosen));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    acceptFile(e.target.files?.[0]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const clearAll = () => {
    setFile(null);
    setVideoUrl("");
    setGifUrl("");
    setProgress(0);
    setError("");
    setStatus("");
  };

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setProgress(0);
    setStatus(t("phaseLoadingEngine"));
    setLoadingEngine(true);
    try {
      setProgress(5);
      const { FFmpeg, fetchFile, toBlobURL } = await loadFfmpeg();
      setLoadingEngine(false);
      setStatus(t("phaseConverting"));
      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => {
        // eslint-disable-next-line no-console
        console.log("[ffmpeg]", message);
      });
      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.min(99, Math.round(progress * 100)));
      });

      const coreURL = await fetchWithRetry(
        `${CORE_BASE}/ffmpeg-core.js`,
        "text/javascript",
        toBlobURL
      );
      const wasmURL = await fetchWithRetry(
        `${CORE_BASE}/ffmpeg-core.wasm`,
        "application/wasm",
        toBlobURL
      );
      await ffmpeg.load({ coreURL, wasmURL });

      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = "output.gif";

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      // Build a high-quality GIF: downscale, cap fps, generate a per-video
      // palette (palettegen/paletteuse) for much better color than the default.
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        "-loop",
        "0",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Unexpected readFile output type");
      }
      const bytes = new Uint8Array(data);
      if (bytes.length === 0) throw new Error(t("errorEmpty"));
      const blob = new Blob([bytes], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setStatus("");
      setProgress(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isNetworkError = /fetch|network|timeout|load|download|unpkg|jsdelivr|cdn/i.test(
        message
      );
      setError(isNetworkError ? t("errorNetwork") : message || t("errorFailed"));
    } finally {
      setIsProcessing(false);
      setLoadingEngine(false);
      setStatus("");
    }
  };

  const downloadResult = () => {
    if (!gifUrl || !file) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = `${file.name.replace(/\.[^/.]+$/, "")}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
      {/* Left: upload / original video */}
      <div
        className={cn(
          "relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-card/50 p-6 text-center",
          videoUrl ? "items-start justify-start border-solid border-white/10 bg-card p-4" : "p-8"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {!videoUrl ? (
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
                <Upload className="mr-2 inline h-4 w-4" />
                {t("selectVideo")}
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
          <div className="flex w-full flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{t("originalLabel")}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearAll}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {t("removeBtn")}
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-lg bg-gradient-to-r from-primary to-cyan-400 text-xs text-primary-foreground hover:opacity-90"
                  onClick={processVideo}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      {t("converting")}
                    </>
                  ) : (
                    <>
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      {t("convertBtn")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="mb-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-200",
                      loadingEngine && "animate-pulse"
                    )}
                    style={{ width: loadingEngine ? "100%" : `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {status || t("processing", { progress })}
                </p>
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <label className="text-sm text-muted-foreground">{t("fpsLabel")}</label>
              <input
                type="range"
                min={5}
                max={25}
                step={1}
                value={fps}
                onChange={(e) => {
                  setFps(Number(e.target.value));
                  setGifUrl("");
                }}
                className="flex-1 accent-primary"
              />
              <span className="min-w-[40px] text-right text-xs tabular-nums text-muted-foreground">
                {fps} fps
              </span>
            </div>

            <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <label className="text-sm text-muted-foreground">{t("widthLabel")}</label>
              <select
                value={width}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  setGifUrl("");
                }}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-primary"
              >
                <option value={240}>240px</option>
                <option value={360}>360px</option>
                <option value={480}>480px</option>
                <option value={640}>640px</option>
              </select>
            </div>

            {/* self-start shrinks the wrapper to the displayed video so it does
                not stretch and clip. */}
            <div className="self-start inline-block overflow-hidden rounded-xl bg-black/40">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={videoUrl}
                className="block max-h-[320px] max-w-full object-contain"
                controls
                playsInline
                muted
                preload="auto"
              />
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          </div>
        )}
      </div>

      {/* Right: GIF preview */}
      <div className="flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">{t("previewTitle")}</span>
          <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-medium text-pink-300">
            GIF
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black/40 p-2">
          {gifUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifUrl}
              alt={t("previewTitle")}
              className="block max-h-[300px] max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Play className="mb-2 h-8 w-8 opacity-40" />
              <span className="text-xs">{t("emptyPreview")}</span>
            </div>
          )}
        </div>

        <Button
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground hover:opacity-90 disabled:opacity-40"
          disabled={!gifUrl}
          onClick={downloadResult}
        >
          <Download className="mr-2 h-4 w-4" />
          {t("download")}
        </Button>
      </div>
    </div>
  );
}
