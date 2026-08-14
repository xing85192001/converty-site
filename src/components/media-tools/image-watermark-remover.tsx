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

  function process() {
    if (!img || !rect || rect.w < 2 || rect.h < 2) return;
    setProcessing(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(t("canvasError"));
      ctx.drawImage(img, 0, 0);
      const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dst = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const { x, y, w, h } = rect;
      const x1 = Math.max(0, Math.floor(x));
      const y1 = Math.max(0, Math.floor(y));
      const x2 = Math.min(canvas.width - 1, Math.ceil(x + w));
      const y2 = Math.min(canvas.height - 1, Math.ceil(y + h));

      const maxR = Math.min(128, Math.floor(Math.max(canvas.width, canvas.height) / 4));
      const minSamples = 16;

      for (let py = y1; py <= y2; py++) {
        for (let px = x1; px <= x2; px++) {
          let totalR = 0;
          let totalG = 0;
          let totalB = 0;
          let totalW = 0;

          for (let r = 1; r <= maxR && totalW < minSamples; r++) {
            for (let dy = -r; dy <= r && totalW < minSamples; dy++) {
              for (let dx = -r; dx <= r && totalW < minSamples; dx++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                const sx = px + dx;
                const sy = py + dy;
                if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) continue;
                if (sx < 0 || sx >= canvas.width || sy < 0 || sy >= canvas.height) continue;
                const idx = (sy * canvas.width + sx) * 4;
                const weight = 1 / r;
                totalR += src.data[idx] * weight;
                totalG += src.data[idx + 1] * weight;
                totalB += src.data[idx + 2] * weight;
                totalW += weight;
              }
            }
          }

          const idx = (py * canvas.width + px) * 4;
          if (totalW > 0) {
            dst.data[idx] = Math.round(totalR / totalW);
            dst.data[idx + 1] = Math.round(totalG / totalW);
            dst.data[idx + 2] = Math.round(totalB / totalW);
          } else {
            // fallback: copy nearest border pixel
            let bestD = Infinity;
            let bestIdx = -1;
            for (let r = 1; r <= maxR && bestIdx < 0; r++) {
              for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                  if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                  const sx = px + dx;
                  const sy = py + dy;
                  if (sx < 0 || sx >= canvas.width || sy < 0 || sy >= canvas.height) continue;
                  if (sx >= x1 && sx <= x2 && sy >= y1 && sy <= y2) continue;
                  const d = Math.hypot(sx - px, sy - py);
                  if (d < bestD) {
                    bestD = d;
                    bestIdx = (sy * canvas.width + sx) * 4;
                  }
                }
              }
            }
            if (bestIdx >= 0) {
              dst.data[idx] = src.data[bestIdx];
              dst.data[idx + 1] = src.data[bestIdx + 1];
              dst.data[idx + 2] = src.data[bestIdx + 2];
            } else {
              dst.data[idx] = 255;
              dst.data[idx + 1] = 255;
              dst.data[idx + 2] = 255;
            }
          }
        }
      }

      ctx.putImageData(dst, 0, 0);
      setResultUrl(canvas.toDataURL("image/png"));
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
    a.download = `no-watermark-${file.name.replace(/\.[^.]+$/, "")}.png`;
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
