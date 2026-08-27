"use client";

import { Download, Loader2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropZone, formatBytes, SelectedFile, ToolError } from "./shared";

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
  });
}

export function ImageCompressor() {
  const t = useTranslations("mediaTools.imageCompressor");
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(85);
  const [scale, setScale] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      const w = Math.max(1, Math.round(img.naturalWidth * (scale / 100)));
      const h = Math.max(1, Math.round(img.naturalHeight * (scale / 100)));
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(t("canvasError"));
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality / 100)
      );
      if (!blob) throw new Error(t("compressError"));
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("compressError"));
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `compressed-${file.name.replace(/\.[^.]+$/, "")}.jpg`;
    a.click();
  }

  const savedPct =
    file && result ? Math.max(0, Math.round((1 - result.size / file.size) * 100)) : 0;

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {!file ? (
        <FileDropZone
          accept="image/*"
          onFiles={(files) => {
            setFile(files[0]);
            setResult(null);
          }}
        />
      ) : (
        <SelectedFile
          file={file}
          onClear={() => {
            setFile(null);
            setResult(null);
          }}
        />
      )}
      {file && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{t("qualityLabel")}</span>
              <span>{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{t("scaleLabel")}</span>
              <span>{scale}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          {result && (
            <div className="text-sm text-muted-foreground">
              {t("sizeCompare", {
                original: formatBytes(file.size),
                compressed: formatBytes(result.size),
              })}
              <span className="ml-2 text-emerald-400">-{savedPct}%</span>
            </div>
          )}
        </div>
      )}
      {file && (
        <Button
          onClick={process}
          disabled={processing}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
        >
          {processing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Minimize2 className="mr-2 h-4 w-4" />
          )}
          {t("compressBtn")}
        </Button>
      )}
      {result && (
        <Button onClick={download} className="w-full rounded-xl">
          <Download className="mr-2 h-4 w-4" /> {t("downloadBtn")}
        </Button>
      )}
    </div>
  );
}
