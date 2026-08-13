"use client";

import { Download, Images, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDropZone, SelectedFile, ToolError } from "./shared";

async function createIcoBlob(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const sizes = [16, 32, 48, 64, 128, 256];
  const entries: { size: number; blob: Blob }[] = [];
  for (const size of sizes) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.clearRect(0, 0, size, size);
    const scale = Math.min(size / img.width, size / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) entries.push({ size, blob });
  }

  const parts: ArrayBuffer[] = [];
  const header = new DataView(new ArrayBuffer(6));
  header.setUint16(0, 0, true); // reserved
  header.setUint16(2, 1, true); // type: icon
  header.setUint16(4, entries.length, true);
  parts.push(header.buffer);

  let offset = 6 + entries.length * 16;
  const blobBuffers: ArrayBuffer[] = [];
  for (const entry of entries) {
    const bytes = await entry.blob.arrayBuffer();
    const dir = new DataView(new ArrayBuffer(16));
    dir.setUint8(0, entry.size === 256 ? 0 : entry.size);
    dir.setUint8(1, entry.size === 256 ? 0 : entry.size);
    dir.setUint8(2, 0);
    dir.setUint8(3, 0);
    dir.setUint16(4, 1, true);
    dir.setUint16(6, 32, true);
    dir.setUint32(8, bytes.byteLength, true);
    dir.setUint32(12, offset, true);
    parts.push(dir.buffer);
    blobBuffers.push(bytes);
    offset += bytes.byteLength;
  }
  parts.push(...blobBuffers);

  let total = 0;
  for (const p of parts) total += p.byteLength;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(new Uint8Array(p), pos);
    pos += p.byteLength;
  }
  return new Blob([new Uint8Array(out)], { type: "image/x-icon" });
}

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

export function IcoConverter() {
  const t = useTranslations("mediaTools.icoConverter");
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await createIcoBlob(file);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("processError"));
    } finally {
      setProcessing(false);
    }
  }

  function download() {
    if (!downloadUrl || !file) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, "")}.ico`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <ToolError message={error} />
      {!file ? (
        <FileDropZone
          accept="image/*"
          onFiles={(files) => {
            setFile(files[0]);
            setDownloadUrl(null);
          }}
        />
      ) : (
        <SelectedFile
          file={file}
          onClear={() => {
            setFile(null);
            setDownloadUrl(null);
          }}
        />
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
            <Images className="mr-2 h-4 w-4" />
          )}
          {t("generateBtn")}
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
