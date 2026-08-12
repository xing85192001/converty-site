"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropZone, SelectedFile, ToolError } from "./shared";

export function ImageWatermarkRemover() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [startPt, setStartPt] = useState<{ x: number; y: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      setImg(image);
      drawCanvas(image);
      setRect(null);
      setResultUrl(null);
    };
    image.onerror = () => setError("图片加载失败");
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function drawCanvas(image: HTMLImageElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
  }

  function getCanvasPoint(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    if (!img) return;
    e.preventDefault();
    const p = getCanvasPoint(e);
    setDragging(true);
    setStartPt(p);
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!dragging || !startPt || !img) return;
    e.preventDefault();
    const p = getCanvasPoint(e);
    const x = Math.min(startPt.x, p.x);
    const y = Math.min(startPt.y, p.y);
    const w = Math.abs(p.x - startPt.x);
    const h = Math.abs(p.y - startPt.y);
    setRect({ x, y, w, h });
    drawCanvas(img);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "rgba(236, 72, 153, 0.9)";
    ctx.lineWidth = Math.max(2, img.naturalWidth / 400);
    ctx.setLineDash([ctx.lineWidth * 4, ctx.lineWidth * 2]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  function handleEnd() {
    setDragging(false);
    setStartPt(null);
  }

  function process() {
    if (!img || !canvasRef.current || !rect) return;
    setProcessing(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取画布上下文");
      ctx.drawImage(img, 0, 0);
      const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const dst = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { x, y, w, h } = rect;
      const x1 = Math.max(0, Math.floor(x));
      const y1 = Math.max(0, Math.floor(y));
      const x2 = Math.min(canvas.width - 1, Math.ceil(x + w));
      const y2 = Math.min(canvas.height - 1, Math.ceil(y + h));

      // Simple content-aware fill: for each masked pixel, find nearest non-masked pixel within a radius.
      const maxR = 64;
      for (let py = y1; py <= y2; py++) {
        for (let px = x1; px <= x2; px++) {
          let found = false;
          for (let r = 1; r <= maxR; r++) {
            const samples: { r: number; g: number; b: number; n: number } = { r: 0, g: 0, b: 0, n: 0 };
            for (let dy = -r; dy <= r; dy++) {
              for (let dx = -r; dx <= r; dx++) {
                if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                const sx = px + dx;
                const sy = py + dy;
                if (sx < x1 || sx > x2 || sy < y1 || sy > y2) {
                  if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
                    const idx = (sy * canvas.width + sx) * 4;
                    samples.r += src.data[idx];
                    samples.g += src.data[idx + 1];
                    samples.b += src.data[idx + 2];
                    samples.n++;
                  }
                }
              }
            }
            if (samples.n > 0) {
              const idx = (py * canvas.width + px) * 4;
              dst.data[idx] = samples.r / samples.n;
              dst.data[idx + 1] = samples.g / samples.n;
              dst.data[idx + 2] = samples.b / samples.n;
              found = true;
              break;
            }
          }
          if (!found) {
            const idx = (py * canvas.width + px) * 4;
            dst.data[idx] = 255;
            dst.data[idx + 1] = 255;
            dst.data[idx + 2] = 255;
          }
        }
      }
      ctx.putImageData(dst, 0, 0);

      const url = canvas.toDataURL("image/png");
      setResultUrl(url);
      const preview = previewRef.current;
      if (preview) {
        preview.width = canvas.width;
        preview.height = canvas.height;
        const pctx = preview.getContext("2d");
        pctx?.drawImage(canvas, 0, 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败");
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

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {!file ? (
        <FileDropZone accept="image/*" onFiles={(files) => setFile(files[0])} />
      ) : (
        <SelectedFile file={file} onClear={() => { setFile(null); setImg(null); setRect(null); setResultUrl(null); }} />
      )}
      {img && (
        <>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="mb-2 text-xs text-muted-foreground">在图片上拖拽框选水印区域</p>
            <div className="max-h-[320px] overflow-auto rounded-lg border border-white/10 bg-black/40">
              <canvas
                ref={canvasRef}
                className="max-w-full cursor-crosshair touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            </div>
          </div>
          <Button
            onClick={process}
            disabled={!rect || processing}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
          >
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
            智能去除水印
          </Button>
        </>
      )}
      {resultUrl && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="mb-2 text-sm font-medium">处理结果</p>
          <canvas ref={previewRef} className="max-h-[320px] max-w-full rounded-lg border border-white/10" />
          <Button onClick={download} className="mt-3 w-full rounded-xl">
            <Download className="mr-2 h-4 w-4" /> 下载处理后图片
          </Button>
        </div>
      )}
    </div>
  );
}
