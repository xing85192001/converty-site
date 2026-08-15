"use client";

import { Download, FileImage, Loader2, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  imageDataListToGif,
  imageDataToBmp,
  imageDataToGif,
} from "@/lib/media-tools/format-encoders";
import { FileDropZone, SelectedFile, ToolError } from "./shared";

const FORMATS = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPG" },
  { value: "image/webp", label: "WEBP" },
  { value: "image/bmp", label: "BMP" },
  { value: "image/gif", label: "GIF" },
];

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

export function ImageFormatConverter() {
  const t = useTranslations("mediaTools.formatConverter");
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("image/png");
  const [delayMs, setDelayMs] = useState(500);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const isGif = format === "image/gif";
  const isAnimated = isGif && files.length > 1;

  async function process() {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      if (isGif && files.length > 1) {
        // Animated GIF: unify every frame to the first image's dimensions.
        const imgs = await Promise.all(files.map(loadImage));
        const W = imgs[0].naturalWidth;
        const H = imgs[0].naturalHeight;
        const frames = imgs.map((img) => {
          const canvas = document.createElement("canvas");
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error(t("canvasError"));
          ctx.drawImage(img, 0, 0, W, H);
          return ctx.getImageData(0, 0, W, H);
        });
        const arr = new Uint8Array(imageDataListToGif(frames, delayMs));
        const url = URL.createObjectURL(new Blob([arr], { type: "image/gif" }));
        setDownloadUrl(url);
      } else {
        const img = await loadImage(files[0]);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error(t("canvasError"));
        ctx.drawImage(img, 0, 0);

        const ext = format.split("/")[1];
        let blob: Blob;
        if (format === "image/png" || format === "image/jpeg" || format === "image/webp") {
          const quality = format === "image/jpeg" || format === "image/webp" ? 0.92 : undefined;
          const b = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, format, quality)
          );
          if (!b) throw new Error(t("convertError"));
          blob = b;
        } else if (format === "image/bmp") {
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const arr = new Uint8Array(imageDataToBmp(data));
          blob = new Blob([arr], { type: "image/bmp" });
        } else if (format === "image/gif") {
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const arr = new Uint8Array(imageDataToGif(data));
          blob = new Blob([arr], { type: "image/gif" });
        } else {
          throw new Error(t("unsupportedFormat"));
        }

        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("convertError"));
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!downloadUrl || files.length === 0) return;
    const ext = format.split("/")[1];
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${files[0].name.replace(/\.[^.]+$/, "")}.${ext}`;
    a.click();
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setDownloadUrl(null);
  }

  function addFiles(next: File[]) {
    setFiles((prev) => [...prev, ...next]);
    setDownloadUrl(null);
  }

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {files.length === 0 ? (
        <FileDropZone
          accept="image/*"
          multiple
          onFiles={(f) => {
            setFiles(f);
            setDownloadUrl(null);
          }}
        />
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <span className="truncate text-xs text-muted-foreground">
                  {i + 1}. {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-2 rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  aria-label={t("removeFile")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <FileDropZone
            accept="image/*"
            multiple
            onFiles={addFiles}
            className="border-white/10 bg-white/[0.02] p-3"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              {t("addMore")}
            </span>
          </FileDropZone>
        </div>
      )}

      {isGif && files.length > 1 && (
        <p className="text-xs text-muted-foreground">{t("multiImageHint")}</p>
      )}

      {files.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <label className="text-sm text-muted-foreground">{t("outputFormat")}</label>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              setDownloadUrl(null);
            }}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isAnimated && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <label className="text-sm text-muted-foreground">{t("frameDelay")}</label>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={delayMs}
            onChange={(e) => setDelayMs(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="min-w-[60px] text-right text-xs tabular-nums text-muted-foreground">
            {delayMs} ms
          </span>
        </div>
      )}

      {files.length > 0 && (
        <Button
          onClick={process}
          disabled={processing}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
        >
          {processing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileImage className="mr-2 h-4 w-4" />
          )}
          {t("convertBtn")}
        </Button>
      )}
      {downloadUrl && (
        <Button onClick={download} className="w-full rounded-xl">
          <Download className="mr-2 h-4 w-4" /> {t("downloadBtn")}
        </Button>
      )}
    </div>
  );
}
