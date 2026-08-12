"use client";

import { useState } from "react";
import { FileImage, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropZone, SelectedFile, ToolError } from "./shared";
import { imageDataToBmp, imageDataToGif } from "@/lib/media-tools/format-encoders";

const FORMATS = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPG" },
  { value: "image/webp", label: "WEBP" },
  { value: "image/bmp", label: "BMP" },
  { value: "image/gif", label: "GIF" },
];

export function ImageFormatConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("image/png");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法创建画布");
      ctx.drawImage(img, 0, 0);

      let blob: Blob;
      const ext = format.split("/")[1];
      if (format === "image/png" || format === "image/jpeg" || format === "image/webp") {
        const quality = format === "image/jpeg" || format === "image/webp" ? 0.92 : undefined;
        const b = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
        if (!b) throw new Error("格式转换失败");
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
        throw new Error("不支持的格式");
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "转换失败");
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!downloadUrl || !file) return;
    const ext = format.split("/")[1];
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}.${ext}`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {!file ? (
        <FileDropZone accept="image/*" onFiles={(files) => { setFile(files[0]); setDownloadUrl(null); }} />
      ) : (
        <SelectedFile file={file} onClear={() => { setFile(null); setDownloadUrl(null); }} />
      )}
      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <label className="text-sm text-muted-foreground">输出格式</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      )}
      {file && (
        <Button
          onClick={process}
          disabled={processing}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500"
        >
          {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileImage className="mr-2 h-4 w-4" />}
          转换格式
        </Button>
      )}
      {downloadUrl && (
        <Button onClick={download} className="w-full rounded-xl">
          <Download className="mr-2 h-4 w-4" /> 下载转换后图片
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
