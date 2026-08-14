"use client";

import { Download, Eraser, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropZone, SelectedFile, ToolError } from "./shared";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Light box blur restricted to a region (with a small margin) so the inpaint
// seam feathers into the surroundings instead of leaving a hard visible edge /
// trace after removal.
function featherRegion(
  data: Uint8ClampedArray,
  W: number,
  H: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number
) {
  const m = radius + 1;
  const bx1 = Math.max(0, x1 - m);
  const by1 = Math.max(0, y1 - m);
  const bx2 = Math.min(W - 1, x2 + m);
  const by2 = Math.min(H - 1, y2 + m);
  const snap = new Uint8ClampedArray(data);
  const r2 = radius * radius;
  for (let yy = by1; yy <= by2; yy++) {
    for (let xx = bx1; xx <= bx2; xx++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = yy + dy;
        if (ny < by1 || ny > by2) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = xx + dx;
          if (nx < bx1 || nx > bx2) continue;
          const i = (ny * W + nx) * 4;
          r += snap[i];
          g += snap[i + 1];
          b += snap[i + 2];
          n++;
        }
      }
      const i = (yy * W + xx) * 4;
      data[i] = r / n;
      data[i + 1] = g / n;
      data[i + 2] = b / n;
    }
  }
}

export function ImageWatermarkRemover() {
  const t = useTranslations("mediaTools.imageWatermarkRemover");
  // Reuse the (already localized in all 22 locales) "processing" label.
  const tV = useTranslations("mediaTools.videoWatermarkRemover");
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

  useEffect(() => {
    if (!file) {
      setImg(null);
      setImgUrl(null);
      setRect(null);
      setResultUrl(null);
      setError(null);
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

  async function process() {
    if (!img || !rect || rect.w < 2 || rect.h < 2) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    // Let React paint the "processing" state before the heavy synchronous work.
    await new Promise((res) => setTimeout(res, 0));

    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(t("canvasError"));
      ctx.drawImage(img, 0, 0);
      const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dst = ctx.createImageData(canvas.width, canvas.height);
      dst.data.set(src.data);
      const data = dst.data;
      const W = canvas.width;
      const H = canvas.height;

      const { x, y, w, h } = rect;
      const x1 = Math.max(0, Math.floor(x));
      const y1 = Math.max(0, Math.floor(y));
      const x2 = Math.min(W - 1, Math.ceil(x + w));
      const y2 = Math.min(H - 1, Math.ceil(y + h));

      const filled = new Uint8Array(W * H);
      // Cap the search radius so we never scan the whole image per pixel.
      const maxR = Math.min(160, Math.max(W, H));
      const minSamples = 12;
      const rows = y2 - y1 + 1;

      // Pass 1: weighted neighbour sampling from outside the selection.
      for (let py = y1; py <= y2; py++) {
        for (let px = x1; px <= x2; px++) {
          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          let totalW = 0;
          let bestD = Infinity;
          let bestIdx = -1;

          for (let r = 1; r <= maxR; r++) {
            const ring = 2 * r + 1;
            let count = 0;
            for (let dy = -r; dy <= r && count < ring; dy++) {
              for (let dx = -r; dx <= r && count < ring; dx++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                count++;
                const sx = px + dx;
                const sy = py + dy;
                if (sx < 0 || sx >= W || sy < 0 || sy >= H) continue;
                if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) continue;
                const idx = (sy * W + sx) * 4;
                const weight = 1 / r;
                totalR += data[idx] * weight;
                totalG += data[idx + 1] * weight;
                totalB += data[idx + 2] * weight;
                totalW += weight;
                if (r < bestD) {
                  bestD = r;
                  bestIdx = idx;
                }
              }
            }
            if (totalW >= minSamples) break;
          }

          const idx = (py * W + px) * 4;
          if (totalW > 0) {
            data[idx] = Math.round(totalR / totalW);
            data[idx + 1] = Math.round(totalG / totalW);
            data[idx + 2] = Math.round(totalB / totalW);
            filled[py * W + px] = 1;
          } else if (bestIdx >= 0) {
            data[idx] = data[bestIdx];
            data[idx + 1] = data[bestIdx + 1];
            data[idx + 2] = data[bestIdx + 2];
            filled[py * W + px] = 1;
          }
        }
        // Yield periodically so mobile devices never freeze and the progress
        // bar keeps updating.
        if ((py - y1) % 48 === 0) {
          setProgress(Math.round(((py - y1) / rows) * 85));
          await new Promise((res) => setTimeout(res, 0));
        }
      }

      // Pass 2: fill any interior holes by copying the nearest already-filled
      // pixel. This guarantees the watermark (and any white patch) is fully
      // removed even for large selections.
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
          setProgress(85 + Math.round(((py - y1) / rows) * 12));
          await new Promise((res) => setTimeout(res, 0));
        }
      }

      // Feather the seam so the inpainting blends into the background.
      featherRegion(data, W, H, x1, y1, x2, y2, 3);

      ctx.putImageData(dst, 0, 0);
      setProgress(100);
      // JPEG encodes far faster than PNG on mobile for large photos.
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
          }}
        />
      )}
      {img && imgUrl && (
        <>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="mb-2 text-xs text-muted-foreground">{t("hint")}</p>
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
                {tV("processing", { progress })}
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
