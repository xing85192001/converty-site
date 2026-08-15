"use client";

import { Download, Eraser, Loader2, ScanSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FileDropZone, SelectedFile, ToolError } from "./shared";
import { detectWatermarks, type Rect } from "./watermark-detection";

const MAX_FAST_SIZE = 1600;

// Feather only the outer rim of the inpainted region so the seam blends in
// without destroying the texture we just synthesised inside the selection.
function featherBoundary(
  data: Uint8ClampedArray,
  W: number,
  H: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rim: number
) {
  const snap = new Uint8ClampedArray(data);
  const r2 = rim * rim;
  for (let yy = y1; yy <= y2; yy++) {
    for (let xx = x1; xx <= x2; xx++) {
      const dist = Math.min(xx - x1, x2 - xx, yy - y1, y2 - yy);
      if (dist > rim) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let dy = -rim; dy <= rim; dy++) {
        const ny = yy + dy;
        if (ny < 0 || ny >= H) continue;
        for (let dx = -rim; dx <= rim; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = xx + dx;
          if (nx < 0 || nx >= W) continue;
          const i = (ny * W + nx) * 4;
          r += snap[i];
          g += snap[i + 1];
          b += snap[i + 2];
          n++;
        }
      }
      const i = (yy * W + xx) * 4;
      if (n > 0) {
        data[i] = Math.round(r / n);
        data[i + 1] = Math.round(g / n);
        data[i + 2] = Math.round(b / n);
      }
    }
  }
}

export function ImageWatermarkRemover() {
  const t = useTranslations("mediaTools.imageWatermarkRemover");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<Rect[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [hdMode, setHdMode] = useState(false);

  useEffect(() => {
    if (!file) {
      setImg(null);
      setImgUrl(null);
      setRect(null);
      setResultUrl(null);
      setError(null);
      setCandidates([]);
      return;
    }
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      setImg(image);
      setRect(null);
      setResultUrl(null);
      setError(null);
      setCandidates([]);
    };
    image.onerror = () => setError(t("loadError"));
    return () => URL.revokeObjectURL(url);
  }, [file, t]);

  function eventToClient(e: React.MouseEvent | React.TouchEvent) {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function getImagePoint(clientX: number, clientY: number) {
    const wrapper = wrapperRef.current;
    const image = img;
    if (!wrapper || !image) return { x: 0, y: 0 };
    const rectBox = wrapper.getBoundingClientRect();
    const scaleX = image.naturalWidth / rectBox.width;
    const scaleY = image.naturalHeight / rectBox.height;
    return {
      x: Math.max(0, Math.min(image.naturalWidth, (clientX - rectBox.left) * scaleX)),
      y: Math.max(0, Math.min(image.naturalHeight, (clientY - rectBox.top) * scaleY)),
    };
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    if (!img) return;
    e.preventDefault();
    const p = getImagePoint(eventToClient(e).x, eventToClient(e).y);
    setDragging(true);
    setStartPt(p);
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
    setResultUrl(null);
    setCandidates([]);
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!dragging || !startPt || !img) return;
    e.preventDefault();
    const p = getImagePoint(eventToClient(e).x, eventToClient(e).y);
    const x = Math.min(startPt.x, p.x);
    const y = Math.min(startPt.y, p.y);
    const w = Math.abs(p.x - startPt.x);
    const h = Math.abs(p.y - startPt.y);
    setRect({ x, y, w, h });
  }

  function handleEnd() {
    setDragging(false);
    setStartPt(null);
  }

  async function runAutoDetect() {
    if (!img) return;
    setDetecting(true);
    setError(null);
    setResultUrl(null);
    await new Promise((res) => setTimeout(res, 0));

    try {
      const found = detectWatermarks(img, img.naturalWidth, img.naturalHeight);
      setCandidates(found);
      if (found.length === 0) {
        setError(t("autoDetectNone"));
      } else {
        setRect(found[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("processError"));
    } finally {
      setDetecting(false);
    }
  }

  async function process() {
    if (!img || !rect || rect.w < 2 || rect.h < 2) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    setCandidates([]);
    await new Promise((res) => setTimeout(res, 0));

    try {
      // Fast mode: downsample very large images so mobile devices finish quickly.
      const maxDim = Math.max(img.naturalWidth, img.naturalHeight);
      const scale = hdMode || maxDim <= MAX_FAST_SIZE ? 1 : MAX_FAST_SIZE / maxDim;
      const procW = Math.round(img.naturalWidth * scale);
      const procH = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = procW;
      canvas.height = procH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(t("canvasError"));
      ctx.drawImage(img, 0, 0, procW, procH);
      const src = ctx.getImageData(0, 0, procW, procH);
      const dst = ctx.createImageData(procW, procH);
      dst.data.set(src.data);
      const data = dst.data;
      const W = procW;
      const H = procH;

      const procRect = {
        x: Math.round(rect.x * scale),
        y: Math.round(rect.y * scale),
        w: Math.round(rect.w * scale),
        h: Math.round(rect.h * scale),
      };
      const { x, y, w, h } = procRect;
      const x1 = Math.max(0, Math.floor(x));
      const y1 = Math.max(0, Math.floor(y));
      const x2 = Math.min(W - 1, Math.ceil(x + w));
      const y2 = Math.min(H - 1, Math.ceil(y + h));

      const filled = new Uint8Array(W * H);
      const maxR = Math.min(hdMode ? 160 : 80, Math.max(W, H));
      const rows = y2 - y1 + 1;

      // Texture-preserving fill: each selection pixel copies the nearest valid
      // source pixel outside the selection, with a small random jitter so large
      // flat areas keep natural variation instead of turning into a smudged
      // rectangle.
      for (let py = y1; py <= y2; py++) {
        for (let px = x1; px <= x2; px++) {
          let bestIdx = -1;

          for (let r = 2; r <= maxR && bestIdx < 0; r++) {
            const ringSources: number[] = [];
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                const sx = px + dx;
                const sy = py + dy;
                if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
                if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) continue;
                const idx = (sy * W + sx) * 4;
                ringSources.push(idx);
              }
            }
            if (ringSources.length > 0) {
              const chosen = ringSources[Math.floor(Math.random() * ringSources.length)];
              bestIdx = chosen;
              break;
            }
          }

          const idx = (py * W + px) * 4;
          if (bestIdx >= 0) {
            data[idx] = data[bestIdx];
            data[idx + 1] = data[bestIdx + 1];
            data[idx + 2] = data[bestIdx + 2];
            filled[py * W + px] = 1;
          }
        }
        if ((py - y1) % 48 === 0) {
          setProgress(Math.round(((py - y1) / rows) * 90));
          await new Promise((res) => setTimeout(res, 0));
        }
      }

      // Fill any interior pixels that didn't find a source.
      for (let py = y1; py <= y2; py++) {
        for (let px = x1; px <= x2; px++) {
          if (filled[py * W + px]) continue;
          let bestD = Infinity;
          let bestIdx = -1;
          for (let r = 1; r <= maxR && bestIdx < 0; r++) {
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                const sx = px + dx;
                const sy = py + dy;
                if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
                if (!filled[sy * W + sx]) continue;
                const d = Math.hypot(sx - px, sy - py);
                if (d < bestD) {
                  bestD = d;
                  bestIdx = (sy * W + sx) * 4;
                }
              }
            }
          }
          const idx = (py * W + px) * 4;
          if (bestIdx >= 0) {
            data[idx] = data[bestIdx];
            data[idx + 1] = data[bestIdx + 1];
            data[idx + 2] = data[bestIdx + 2];
            filled[py * W + px] = 1;
          }
        }
        if ((py - y1) % 96 === 0) {
          setProgress(90 + Math.round(((py - y1) / rows) * 7));
          await new Promise((res) => setTimeout(res, 0));
        }
      }

      featherBoundary(data, W, H, x1, y1, x2, y2, hdMode ? 3 : 2);

      ctx.putImageData(dst, 0, 0);
      setProgress(100);
      setResultUrl(canvas.toDataURL("image/jpeg", 0.92));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("processError"));
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-watermark-${file.name.replace(/\.[^.]+$/, "")}.jpg`;
    a.click();
  }

  const showOverlay = rect && rect.w >= 2 && rect.h >= 2;

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {!file ? (
        <FileDropZone accept="image/*" onFiles={(files) => setFile(files[0])} />
      ) : (
        <SelectedFile
          file={file}
          onClear={() => {
            setFile(null);
            setImg(null);
            setImgUrl(null);
            setRect(null);
            setResultUrl(null);
            setError(null);
            setCandidates([]);
          }}
        />
      )}
      {img && imgUrl && (
        <>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{t("hint")}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs"
                onClick={runAutoDetect}
                disabled={detecting || processing}
              >
                {detecting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ScanSearch className="h-3 w-3" />
                )}
                {detecting ? t("autoDetecting") : t("autoDetect")}
              </Button>
            </div>

            {candidates.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {candidates.map((c, i) => (
                  <button
                    key={`${c.x}-${c.y}-${c.w}-${c.h}`}
                    type="button"
                    onClick={() => {
                      setRect(c);
                      setResultUrl(null);
                    }}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition",
                      rect &&
                        Math.round(rect.x) === Math.round(c.x) &&
                        Math.round(rect.y) === Math.round(c.y) &&
                        Math.round(rect.w) === Math.round(c.w) &&
                        Math.round(rect.h) === Math.round(c.h)
                        ? "bg-pink-500 text-white"
                        : "bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground"
                    )}
                  >
                    {t("candidateLabel", { index: i + 1 })}
                  </button>
                ))}
              </div>
            )}

            {/* inline-block wrapper shrinks to the displayed image, so the
                percentage-based overlay maps 1:1 to the visible area with no
                clipping and no in-container scroll. */}
            <div
              ref={wrapperRef}
              className="relative inline-block max-w-full overflow-hidden rounded-lg bg-black/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt="preview"
                className="block max-h-[320px] max-w-full cursor-crosshair touch-none object-contain"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                draggable={false}
              />
              {showOverlay && (
                <div
                  className="pointer-events-none absolute border-2 border-pink-500 bg-pink-500/20"
                  style={{
                    left: `${(rect.x / img.naturalWidth) * 100}%`,
                    top: `${(rect.y / img.naturalHeight) * 100}%`,
                    width: `${(rect.w / img.naturalWidth) * 100}%`,
                    height: `${(rect.h / img.naturalHeight) * 100}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-pink-500 px-1.5 py-0.5 text-[10px] text-white">
                    {Math.round(rect.w)}×{Math.round(rect.h)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="hd-mode"
              checked={hdMode}
              onCheckedChange={(checked) => setHdMode(checked === true)}
            />
            <label htmlFor="hd-mode" className="cursor-pointer text-xs text-muted-foreground">
              {t("hdMode")}
            </label>
          </div>

          <Button
            onClick={process}
            disabled={!rect || rect.w < 2 || rect.h < 2 || processing}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eraser className="mr-2 h-4 w-4" />
            )}
            {t("processBtn")}
          </Button>
          {processing && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {t("processing", { progress })}
              </p>
            </div>
          )}
        </>
      )}
      {resultUrl && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="mb-2 text-sm font-medium">{t("resultTitle")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt="result"
            className="max-h-[320px] w-full rounded-lg border border-white/10 object-contain"
          />
          <Button onClick={download} className="mt-3 w-full rounded-xl">
            <Download className="mr-2 h-4 w-4" /> {t("downloadBtn")}
          </Button>
        </div>
      )}
    </div>
  );
}
