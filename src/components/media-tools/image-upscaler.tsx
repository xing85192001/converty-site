"use client";

import { useState } from "react";
import { ZoomIn, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropZone, SelectedFile, ToolError } from "./shared";

export function ImageUpscaler() {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [sharpen, setSharpen] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法创建画布");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      if (sharpen) {
        const imageData = ctx.getImageData(0, 0, w, h);
        const sharpened = applySharpen(imageData);
        ctx.putImageData(sharpened, 0, 0);
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("放大失败");
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "放大失败");
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `upscaled-${scale}x-${file.name.replace(/\.[^.]+$/, "")}.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {!file ? (
        <FileDropZone accept="image/*" onFiles={(files) => { setFile(files[0]); setResultUrl(null); }} />
      ) : (
        <SelectedFile file={file} onClear={() => { setFile(null); setResultUrl(null); }} />
      )}
      {file && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">放大倍数</span>
              <span>{scale}x</span>
            </div>
            <input
              type="range"
              min={2}
              max={4}
              step={1}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={sharpen}
              onChange={(e) => setSharpen(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-black/30 accent-primary"
            />
            锐化增强边缘
          </label>
        </div>
      )}
      {file && (
        <Button
          onClick={process}
          disabled={processing}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
        >
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ZoomIn className="mr-2 h-4 w-4" />}
          AI 高清放大
        </Button>
      )}
      {resultUrl && (
        <Button onClick={download} className="w-full rounded-xl">
          <Download className="mr-2 h-4 w-4" /> 下载放大后图片
        </Button>
      )}
    </div>
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("图片加载失败")); };
  });
}

function applySharpen(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const k = kernel[(ky + 1) * 3 + (kx + 1)];
          r += data[idx] * k;
          g += data[idx + 1] * k;
          b += data[idx + 2] * k;
        }
      }
      const i = (y * width + x) * 4;
      out.data[i] = Math.min(255, Math.max(0, r));
      out.data[i + 1] = Math.min(255, Math.max(0, g));
      out.data[i + 2] = Math.min(255, Math.max(0, b));
      out.data[i + 3] = data[i + 3];
    }
  }
  return out;
}
