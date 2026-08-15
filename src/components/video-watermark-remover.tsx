"use client";

import { Download, Loader2, Play, ScanSearch, Trash2, Upload, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { detectWatermarks, type Rect } from "@/components/media-tools/watermark-detection";
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

interface Selection {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function VideoWatermarkRemover() {
  const t = useTranslations("mediaTools.videoWatermarkRemover");
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [candidates, setCandidates] = useState<Rect[]>([]);
  const [detecting, setDetecting] = useState(false);

  // Clean up object URLs on unmount or file change.
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    setError("");
    setProcessedUrl("");
    setProgress(0);
    setSelection(null);
    setCandidates([]);
    setFile(chosen);
    setOriginalUrl(URL.createObjectURL(chosen));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const chosen = e.dataTransfer.files?.[0];
    if (!chosen?.type.startsWith("video/")) return;
    setError("");
    setProcessedUrl("");
    setProgress(0);
    setSelection(null);
    setCandidates([]);
    setFile(chosen);
    setOriginalUrl(URL.createObjectURL(chosen));
  };

  const clearAll = () => {
    setFile(null);
    setOriginalUrl("");
    setProcessedUrl("");
    setSelection(null);
    setCandidates([]);
    setProgress(0);
    setError("");
  };

  // Convert screen coordinates inside the video element to video-frame coordinates.
  const videoToFrame = (clientX: number, clientY: number) => {
    const video = videoRef.current;
    if (!video) return { x: 0, y: 0 };
    const rect = video.getBoundingClientRect();
    const scaleX = video.videoWidth / rect.width;
    const scaleY = video.videoHeight / rect.height;
    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!videoRef.current) return;
    e.preventDefault();
    const pos = videoToFrame(e.clientX, e.clientY);
    setIsDragging(true);
    setDragStart(pos);
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setCandidates([]);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !videoRef.current) return;
    const pos = videoToFrame(e.clientX, e.clientY);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);
    const w = Math.abs(pos.x - dragStart.x);
    const h = Math.abs(pos.y - dragStart.y);
    setSelection({ x, y, w, h });
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const getTouchPos = (e: React.TouchEvent) => {
    const touch = e.touches[0] || e.changedTouches[0];
    return videoToFrame(touch.clientX, touch.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!videoRef.current) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    setIsDragging(true);
    setDragStart(pos);
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setCandidates([]);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || !videoRef.current) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);
    const w = Math.abs(pos.x - dragStart.x);
    const h = Math.abs(pos.y - dragStart.y);
    setSelection({ x, y, w, h });
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  async function runAutoDetect() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    setDetecting(true);
    setError("");
    setProcessedUrl("");
    setProgress(0);
    await new Promise((res) => setTimeout(res, 0));

    try {
      const found = detectWatermarks(video, video.videoWidth, video.videoHeight);
      setCandidates(found);
      if (found.length === 0) {
        setError(t("autoDetectNone"));
      } else {
        setSelection(found[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorFailed"));
    } finally {
      setDetecting(false);
    }
  }

  // Compute the overlay rectangle (in CSS pixels) from the frame selection.
  const overlayStyle = () => {
    const video = videoRef.current;
    if (!video || !selection || selection.w < 2 || selection.h < 2) return { display: "none" };
    const rect = video.getBoundingClientRect();
    const scaleX = rect.width / video.videoWidth;
    const scaleY = rect.height / video.videoHeight;
    return {
      display: "block",
      left: selection.x * scaleX,
      top: selection.y * scaleY,
      width: selection.w * scaleX,
      height: selection.h * scaleY,
    } as React.CSSProperties;
  };

  const processVideo = async () => {
    if (!file || !selection || selection.w < 2 || selection.h < 2) {
      setError(t("errorSelectArea"));
      return;
    }
    setIsProcessing(true);
    setError("");
    setProgress(0);

    try {
      setProgress(5); // show immediate feedback while FFmpeg core downloads
      const { FFmpeg, fetchFile, toBlobURL } = await loadFfmpeg();
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
      // Always output MP4 with H.264 + yuv420p + AAC for maximum compatibility
      // with system players (Windows Media Player, QuickTime, etc.). We avoid
      // locking profile/level so x264 can auto-pick a level appropriate for the
      // input resolution; baseline/level-3.0 cannot handle 720p60/1080p content.
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        // band softens the luma correction border so the removed region blends
        // into the surroundings without a hard rectangular trace.
        `delogo=x=${selection.x}:y=${selection.y}:w=${selection.w}:h=${selection.h}:band=30:show=0`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "ultrafast",
        "-movflags",
        "+faststart",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Unexpected readFile output type");
      }
      // Copy into a fresh ArrayBuffer-backed Uint8Array so it satisfies BlobPart
      // under TS 5.7+ strict Uint8Array<ArrayBufferLike> typing.
      const bytes = new Uint8Array(data);
      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setProgress(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isNetworkError = /fetch|network|timeout|load|download|unpkg|jsdelivr|cdn/i.test(
        message
      );
      setError(isNetworkError ? t("errorNetwork") : message || t("errorFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!processedUrl || !file) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    // Output is always normalized to MP4/H.264/AAC for compatibility.
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    a.download = `no-watermark-${baseName}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
      {/* Left: upload / original video + selection */}
      <div
        className={cn(
          "relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-card/50 p-6 text-center",
          originalUrl ? "items-start justify-start border-solid border-white/10 bg-card p-4" : "p-8"
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
                  variant="outline"
                  className="h-8 gap-1 text-xs"
                  onClick={runAutoDetect}
                  disabled={detecting || isProcessing}
                >
                  {detecting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ScanSearch className="h-3 w-3" />
                  )}
                  {detecting ? t("autoDetecting") : t("autoDetect")}
                </Button>
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
                      {t("processing", { progress })}
                    </>
                  ) : (
                    <>
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      {t("startRemoval")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {candidates.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {candidates.map((c, i) => (
                  <button
                    key={`${c.x}-${c.y}-${c.w}-${c.h}`}
                    type="button"
                    onClick={() => {
                      setSelection(c);
                      setProcessedUrl("");
                    }}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition",
                      selection &&
                        Math.round(selection.x) === Math.round(c.x) &&
                        Math.round(selection.y) === Math.round(c.y) &&
                        Math.round(selection.w) === Math.round(c.w) &&
                        Math.round(selection.h) === Math.round(c.h)
                        ? "bg-pink-500 text-white"
                        : "bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground"
                    )}
                  >
                    {t("candidateLabel", { index: i + 1 })}
                  </button>
                ))}
              </div>
            )}

            {isProcessing && (
              <div className="mb-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {t("processing", { progress })}
                </p>
              </div>
            )}

            {/* self-start prevents the flex column from stretching this wrapper
                to full width; it shrinks to the displayed video so the
                selection overlay maps 1:1 and nothing is clipped or scrolled. */}
            <div
              ref={wrapperRef}
              className="relative self-start inline-block max-w-full overflow-hidden rounded-xl bg-black/40"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                src={originalUrl}
                className="block max-h-[320px] max-w-full cursor-crosshair object-contain"
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={() => setSelection(null)}
              />
              {selection && (
                <div
                  className="pointer-events-none absolute border-2 border-primary bg-primary/20"
                  style={overlayStyle()}
                >
                  <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {selection.w}×{selection.h}
                  </span>
                </div>
              )}
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            {!selection && !error && (
              <p className="mt-3 text-xs text-muted-foreground">{t("hint")}</p>
            )}
          </div>
        )}
      </div>

      {/* Right: processed preview */}
      <div className="flex min-h-[320px] flex-col rounded-2xl border border-white/10 bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">{t("previewTitle")}</span>
          <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-medium text-pink-300">
            {t("aiBadge")}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black/40 p-2">
          {processedUrl ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={processedUrl}
              className="block max-h-[300px] max-w-full object-contain"
              controls
              playsInline
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
          disabled={!processedUrl}
          onClick={downloadResult}
        >
          <Download className="mr-2 h-4 w-4" />
          {t("download")}
        </Button>
      </div>
    </div>
  );
}
