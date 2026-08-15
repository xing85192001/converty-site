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
  };
}

// Try the self-hosted core first, then fall back to public CDNs. All cores are
// fetched into memory as blob URLs so we can verify the wasm size before FFmpeg
// tries to compile it; this avoids "section extends past end" errors caused by
// truncated downloads or stale service-worker caches.
const CORE_HOSTS = [
  "/ffmpeg",
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd",
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd",
];

// Bust the browser HTTP cache for the self-hosted copy whenever the SW cache
// generation changes, so a stale/corrupted wasm cannot survive a deploy.
const CORE_VERSION = "v5";

async function fetchToBlobURL(
  url: string,
  mimeType: string,
  onProgress?: (received: number, total: number) => void
): Promise<{ blobURL: string; size: number }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const total = Number.parseInt(res.headers.get("content-length") || "0", 10);
  const reader = res.body?.getReader();
  if (!reader) {
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: mimeType });
    return { blobURL: URL.createObjectURL(blob), size: buf.byteLength };
  }

  const chunks: Uint8Array[] = [];
  let received = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total > 0) onProgress?.(received, total);
  }

  const buf = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.length;
  }
  const blob = new Blob([buf], { type: mimeType });
  return { blobURL: URL.createObjectURL(blob), size: received };
}

async function loadFfmpegCore(ffmpeg: any, onProgress?: (pct: number) => void): Promise<void> {
  const errors: string[] = [];

  for (const host of CORE_HOSTS) {
    // Self-hosted copy gets a cache-busting query param tied to the SW version.
    const versionSuffix = host.startsWith("/") ? `?${CORE_VERSION}` : "";
    const coreURL = `${host}/ffmpeg-core.js${versionSuffix}`;
    const wasmURL = `${host}/ffmpeg-core.wasm${versionSuffix}`;
    try {
      onProgress?.(5);
      const core = await fetchToBlobURL(coreURL, "text/javascript");
      onProgress?.(20);
      const wasm = await fetchToBlobURL(wasmURL, "application/wasm", (received, total) => {
        if (total > 0) onProgress?.(20 + Math.min(70, Math.round((received / total) * 70)));
      });

      // Sanity checks: must be non-trivial and start with the WebAssembly magic.
      if (wasm.size < 1_000_000) {
        throw new Error(`wasm too small (${wasm.size} bytes)`);
      }

      onProgress?.(95);
      await ffmpeg.load({ coreURL: core.blobURL, wasmURL: wasm.blobURL });
      onProgress?.(100);
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${host}: ${msg}`);
      // eslint-disable-next-line no-console
      console.warn(`[video-watermark] FFmpeg load failed from ${host}:`, err);
    }
  }
  throw new Error(`FFmpeg core load failed: ${errors.join(" | ")}`);
}

interface Selection {
  x: number;
  y: number;
  w: number;
  h: number;
}

type TFn = (key: string, params?: Record<string, string | number | Date>) => string;

// Robust FFmpeg delogo. Clamps so x+w <= vw and y+h <= vh — the previous code
// clamped cx to vw-1 but then forced w>=2, which could push x+w past the frame
// edge and make FFmpeg emit an empty file. Also retries without audio when the
// input has no audio stream.
async function runDelogo(
  ffmpeg: any,
  inputName: string,
  outputName: string,
  vw: number,
  vh: number,
  sel: Selection,
  _t: TFn
): Promise<void> {
  const cx = Math.max(0, Math.min(Math.round(sel.x), vw - 2));
  const cy = Math.max(0, Math.min(Math.round(sel.y), vh - 2));
  const cw = Math.max(2, Math.min(Math.round(sel.w), vw - 1 - cx));
  const ch = Math.max(2, Math.min(Math.round(sel.h), vh - 1 - cy));
  const filter = `delogo=x=${cx}:y=${cy}:w=${cw}:h=${ch}:band=30:show=0`;
  try {
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      filter,
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
  } catch {
    await ffmpeg.exec([
      "-i",
      inputName,
      "-vf",
      filter,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "ultrafast",
      "-an",
      outputName,
    ]);
  }
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
  const stageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [candidates, setCandidates] = useState<Rect[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState("");
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [stageW, setStageW] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoMeta, setVideoMeta] = useState<{ w: number; h: number } | null>(null);

  // Clean up object URLs on unmount or file change.
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
    };
  }, [originalUrl, processedUrl]);

  // Measure the available stage width so the zoom feature can size the video
  // beyond the column width (overflow scrolls) while keeping selection mapping
  // correct via getBoundingClientRect.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStageW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const videoStyle: React.CSSProperties = {
    display: "block",
    width: zoom > 1 ? (stageW ? `${stageW * zoom}px` : "100%") : "100%",
    height: "auto",
    maxWidth: zoom > 1 ? "none" : "100%",
    maxHeight: `${320 * zoom}px`,
    cursor: selection ? "default" : "crosshair",
  };

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
    setVideoReady(false);
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
    setVideoReady(false);
  };

  const clearAll = () => {
    setFile(null);
    setOriginalUrl("");
    setProcessedUrl("");
    setSelection(null);
    setCandidates([]);
    setProgress(0);
    setError("");
    setVideoReady(false);
    setVideoMeta(null);
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

  // Pointer Events unify mouse, touch and pen into one code path. We only start
  // a new selection while none exists yet, so once the box is drawn the native
  // video controls (enabled via controls={!selection}) stay usable for preview.
  const onPointerDown = (e: React.PointerEvent) => {
    if (!videoRef.current) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const pos = videoToFrame(e.clientX, e.clientY);
    setIsDragging(true);
    setDragStart(pos);
    setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setCandidates([]);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !videoRef.current) return;
    const pos = videoToFrame(e.clientX, e.clientY);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);
    const w = Math.abs(pos.x - dragStart.x);
    const h = Math.abs(pos.y - dragStart.y);
    setSelection({ x, y, w, h });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture?.(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setIsDragging(false);
    setDragStart(null);
  };

  async function runAutoDetect() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
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
    setStatus(t("phaseLoadingEngine"));
    setLoadingEngine(true);

    const ffmpegLogs: string[] = [];
    try {
      setProgress(2); // immediate feedback while FFmpeg core downloads
      const { FFmpeg, fetchFile } = await loadFfmpeg();

      const ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }: { message: string }) => {
        ffmpegLogs.push(message);
        if (ffmpegLogs.length > 200) ffmpegLogs.shift();
        // eslint-disable-next-line no-console
        console.log("[ffmpeg]", message);
      });
      ffmpeg.on("progress", ({ progress }: { progress: number }) => {
        setProgress(Math.min(99, Math.round(progress * 100)));
      });

      // Load the core. Self-hosted files are downloaded directly by the worker;
      // CDN fallbacks are fetched first and converted to blob URLs.
      setLoadingEngine(true);
      await loadFfmpegCore(ffmpeg, (pct) => {
        if (pct <= 5) setProgress(Math.max(2, pct));
      });
      setLoadingEngine(false);
      setStatus(t("phaseRemoving"));
      setProgress(5);

      const vw = videoRef.current?.videoWidth || videoMeta?.w || 0;
      const vh = videoRef.current?.videoHeight || videoMeta?.h || 0;
      if (!vw || !vh) throw new Error(t("errorVideoMeta"));

      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = "output.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      await runDelogo(ffmpeg, inputName, outputName, vw, vh, selection, t);

      const data = await ffmpeg.readFile(outputName);
      if (!(data instanceof Uint8Array)) {
        throw new Error("Unexpected readFile output type");
      }
      // Copy into a fresh ArrayBuffer-backed Uint8Array so it satisfies BlobPart
      // under TS 5.7+ strict Uint8Array<ArrayBufferLike> typing.
      const bytes = new Uint8Array(data);
      if (bytes.length === 0) {
        const tail = ffmpegLogs.slice(-14).join("\n");
        throw new Error(`${t("errorEmptyLog")}\n${tail}`);
      }
      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setStatus("");
      setProgress(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isNetworkError = /fetch|network|timeout|load|download|unpkg|jsdelivr|cdn|opencv/i.test(
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

            {/* self-start prevents the flex column from stretching this wrapper
                to full width; it shrinks to the displayed video so the
                selection overlay maps 1:1 and nothing is clipped or scrolled. */}
            {/* Zoom controls let users enlarge the frame to select a small
                watermark precisely; selection mapping stays correct because
                videoToFrame reads the live getBoundingClientRect. */}
            <div className="mb-2 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(2)))}
                disabled={zoom <= 1 || isProcessing}
                aria-label={t("zoomOut")}
              >
                -
              </Button>
              <span className="min-w-[44px] text-center text-xs tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setZoom((z) => Math.min(4, +(z + 0.5).toFixed(2)))}
                disabled={isProcessing}
                aria-label={t("zoomIn")}
              >
                +
              </Button>
              {zoom > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setZoom(1)}
                >
                  {t("zoomOut")}
                </Button>
              )}
            </div>

            {/* Scrollable stage; the video can grow beyond the column width. */}
            <div ref={stageRef} className="w-full overflow-auto rounded-xl bg-black/40">
              <div
                ref={wrapperRef}
                className="relative inline-block select-none"
                style={{ touchAction: selection ? "pan-x pan-y" : "none" }}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  ref={videoRef}
                  src={originalUrl}
                  style={videoStyle}
                  className="block cursor-crosshair"
                  controls={!selection}
                  playsInline
                  muted
                  preload="auto"
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    setVideoMeta({ w: v.videoWidth, h: v.videoHeight });
                  }}
                  onLoadedData={() => setVideoReady(true)}
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
            </div>

            {!videoReady && !error && (
              <p className="mt-3 text-xs text-muted-foreground">视频加载中，请稍候…</p>
            )}
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
              key={processedUrl}
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
